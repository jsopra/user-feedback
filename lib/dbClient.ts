/**
 * Adapter para compatibilidade com API tipo Supabase
 * Implementa em cima de PostgreSQL direto via driver 'pg'
 */

import * as db from './db';

interface QueryBuilder<T> extends PromiseLike<{ data: T[] | T | null; error: any; count?: number }> {
  select(columns?: string, options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }): QueryBuilder<T>;
  insert(data: any): QueryBuilder<T>;
  update(data: any): QueryBuilder<T>;
  delete(): QueryBuilder<T>;
  eq(column: string, value: any): QueryBuilder<T>;
  neq(column: string, value: any): QueryBuilder<T>;
  gt(column: string, value: any): QueryBuilder<T>;
  gte(column: string, value: any): QueryBuilder<T>;
  lt(column: string, value: any): QueryBuilder<T>;
  lte(column: string, value: any): QueryBuilder<T>;
  like(column: string, value: string): QueryBuilder<T>;
  ilike(column: string, value: string): QueryBuilder<T>;
  is(column: string, value: null): QueryBuilder<T>;
  in(column: string, values: any[]): QueryBuilder<T>;
  or(conditions: string): QueryBuilder<T>;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  offset(count: number): QueryBuilder<T>;
  single(): Promise<{ data: T | null; error: any }>;
}

class PostgresQueryBuilder<T> implements QueryBuilder<T> {
  private tableName: string;
  private selectedColumns: string = '*';
  private whereConditions: string[] = [];
  private whereParams: any[] = [];
  private orderByClause?: string;
  private limitValue?: number;
  private offsetValue?: number;
  private operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private insertData?: any;
  private updateData?: any;
  private paramCounter: number = 1;
  private countMode?: 'exact' | 'planned' | 'estimated';
  private headMode: boolean = false;

  constructor(table: string) {
    this.tableName = table;
  }

  select(columns: string = '*', options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }): this {
    this.operation = 'select';
    this.selectedColumns = columns;
    if (options?.count) {
      this.countMode = options.count;
    }
    if (options?.head) {
      this.headMode = options.head;
    }
    return this;
  }

  insert(data: any): this {
    this.operation = 'insert';
    this.insertData = data;
    return this;
  }

  update(data: any): this {
    this.operation = 'update';
    this.updateData = data;
    return this;
  }

  delete(): this {
    this.operation = 'delete';
    return this;
  }

  eq(column: string, value: any): this {
    if (value === null) {
      this.whereConditions.push(`${column} IS NULL`);
    } else {
      this.whereConditions.push(`${column} = $${this.paramCounter++}`);
      this.whereParams.push(value);
    }
    return this;
  }

  neq(column: string, value: any): this {
    if (value === null) {
      this.whereConditions.push(`${column} IS NOT NULL`);
    } else {
      this.whereConditions.push(`${column} != $${this.paramCounter++}`);
      this.whereParams.push(value);
    }
    return this;
  }

  gt(column: string, value: any): this {
    this.whereConditions.push(`${column} > $${this.paramCounter++}`);
    this.whereParams.push(value);
    return this;
  }

  gte(column: string, value: any): this {
    this.whereConditions.push(`${column} >= $${this.paramCounter++}`);
    this.whereParams.push(value);
    return this;
  }

  lt(column: string, value: any): this {
    this.whereConditions.push(`${column} < $${this.paramCounter++}`);
    this.whereParams.push(value);
    return this;
  }

  lte(column: string, value: any): this {
    this.whereConditions.push(`${column} <= $${this.paramCounter++}`);
    this.whereParams.push(value);
    return this;
  }

  like(column: string, value: string): this {
    this.whereConditions.push(`${column} LIKE $${this.paramCounter++}`);
    this.whereParams.push(value);
    return this;
  }

  ilike(column: string, value: string): this {
    this.whereConditions.push(`${column} ILIKE $${this.paramCounter++}`);
    this.whereParams.push(value);
    return this;
  }

  is(column: string, value: null): this {
    this.whereConditions.push(`${column} IS NULL`);
    return this;
  }

  in(column: string, values: any[]): this {
    const placeholders = values.map(() => `$${this.paramCounter++}`).join(', ');
    this.whereConditions.push(`${column} IN (${placeholders})`);
    this.whereParams.push(...values);
    return this;
  }

  or(conditions: string): this {
    // Parse Supabase OR syntax: "field1.ilike.%value%,field2.ilike.%value%"
    // Converte para SQL: (field1 ILIKE $1 OR field2 ILIKE $2)
    const orParts: string[] = [];
    const conditionsList = conditions.split(',');
    
    for (const condition of conditionsList) {
      const parts = condition.trim().split('.');
      if (parts.length >= 3) {
        const field = parts[0];
        const operator = parts[1].toUpperCase();
        const value = parts.slice(2).join('.');
        
        if (operator === 'ILIKE' || operator === 'LIKE') {
          orParts.push(`${field} ${operator} $${this.paramCounter++}`);
          this.whereParams.push(value);
        } else if (operator === 'EQ') {
          orParts.push(`${field} = $${this.paramCounter++}`);
          this.whereParams.push(value);
        }
      }
    }
    
    if (orParts.length > 0) {
      this.whereConditions.push(`(${orParts.join(' OR ')})`);
    }
    
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): this {
    const direction = options?.ascending === false ? 'DESC' : 'ASC';
    this.orderByClause = `${column} ${direction}`;
    return this;
  }

  limit(count: number): this {
    this.limitValue = count;
    return this;
  }

  offset(count: number): this {
    this.offsetValue = count;
    return this;
  }

  private buildQuery(): { text: string; params: any[] } {
    let query = '';
    let params: any[] = [];

    switch (this.operation) {
      case 'select':
        query = `SELECT ${this.selectedColumns} FROM ${this.tableName}`;
        if (this.whereConditions.length > 0) {
          query += ` WHERE ${this.whereConditions.join(' AND ')}`;
        }
        if (this.orderByClause) {
          query += ` ORDER BY ${this.orderByClause}`;
        }
        if (this.limitValue) {
          query += ` LIMIT ${this.limitValue}`;
        }
        if (this.offsetValue) {
          query += ` OFFSET ${this.offsetValue}`;
        }
        params = this.whereParams;
        break;

      case 'insert':
        // Handle both single objects and arrays of objects
        const dataToInsert = Array.isArray(this.insertData) ? this.insertData[0] : this.insertData;
        const insertKeys = Object.keys(dataToInsert);
        const insertValues = Object.values(dataToInsert);
        const insertPlaceholders = insertKeys.map((_, i) => `$${i + 1}`).join(', ');
        query = `
          INSERT INTO ${this.tableName} (${insertKeys.join(', ')})
          VALUES (${insertPlaceholders})
          RETURNING *
        `;
        params = insertValues;
        break;

      case 'update':
        const updateKeys = Object.keys(this.updateData);
        const updateValues = Object.values(this.updateData);
        let updateParamCount = 1;
        const setClause = updateKeys.map(key => `${key} = $${updateParamCount++}`).join(', ');
        
        query = `UPDATE ${this.tableName} SET ${setClause}`;
        params = [...updateValues];
        
        if (this.whereConditions.length > 0) {
          const adjustedConditions = this.whereConditions.map(condition => {
            return condition.replace(/\$(\d+)/g, (match, num) => {
              return `$${parseInt(num) + updateKeys.length}`;
            });
          });
          query += ` WHERE ${adjustedConditions.join(' AND ')}`;
          params.push(...this.whereParams);
        }
        query += ' RETURNING *';
        break;

      case 'delete':
        query = `DELETE FROM ${this.tableName}`;
        if (this.whereConditions.length > 0) {
          query += ` WHERE ${this.whereConditions.join(' AND ')}`;
        }
        params = this.whereParams;
        break;
    }

    return { text: query, params };
  }

  async single(): Promise<{ data: T | null; error: any }> {
    try {
      const { text, params } = this.buildQuery();
      const result = await db.query<any>(text, params);
      
      return {
        data: result.rows[0] || null,
        error: null
      };
    } catch (error) {
      return {
        data: null,
        error
      };
    }
  }

  async then(resolve: any, reject?: any): Promise<any> {
    try {
      const { text, params } = this.buildQuery();
      
      let count: number | null = null;
      
      // Se countMode está ativo, fazer uma query COUNT separada
      if (this.countMode && this.operation === 'select') {
        const countQuery = `SELECT COUNT(*) FROM ${this.tableName}${
          this.whereConditions.length > 0 ? ` WHERE ${this.whereConditions.join(' AND ')}` : ''
        }`;
        const countResult = await db.query<{ count: string }>(countQuery, this.whereParams);
        count = parseInt(countResult.rows[0]?.count || '0', 10);
      }
      
      // Se headMode está ativo, não executar query de dados
      let data: any = null;
      if (!this.headMode) {
        const result = await db.query<any>(text, params);
        data = result.rows;
      }
      
      const response = {
        data,
        error: null,
        count: count !== null ? count : (this.headMode ? null : undefined)
      };
      
      return resolve ? resolve(response) : response;
    } catch (error) {
      const response = {
        data: null,
        error,
        count: null
      };
      
      return reject ? reject(response) : response;
    }
  }
}

export class PostgresClient {
  from<T = any>(table: string): QueryBuilder<T> {
    return new PostgresQueryBuilder<T>(table);
  }

  rpc(functionName: string, params?: any): Promise<{ data: any; error: any }> {
    return Promise.resolve({ data: null, error: 'RPC not implemented' });
  }
}

let client: PostgresClient | null = null;

export function getDbClient(): PostgresClient {
  if (!client) {
    client = new PostgresClient();
  }
  return client;
}

export function getDbServiceRoleClient(): PostgresClient {
  return getDbClient();
}
