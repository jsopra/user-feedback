import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// Pool de conexões reutilizável
let pool: Pool | null = null;

/**
 * Obtém ou cria o pool de conexões PostgreSQL
 */
function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      // Configurações de pool
      max: 20, // Máximo de conexões
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      // SSL para produção
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });

    // Log de erros do pool
    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
      process.exit(-1);
    });
  }

  return pool;
}

/**
 * Executa uma query SQL e retorna os resultados
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    // Log apenas em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', { text, error });
    throw error;
  }
}

/**
 * Obtém um cliente para transações
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

/**
 * Executa múltiplas queries em uma transação
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Fecha o pool de conexões (usar apenas em shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Helpers para queries comuns

/**
 * SELECT com condições simples
 */
export async function select<T extends QueryResultRow = QueryResultRow>(
  table: string,
  columns: string = '*',
  where?: { [key: string]: any },
  options?: {
    orderBy?: string;
    limit?: number;
    offset?: number;
  }
): Promise<T[]> {
  let queryText = `SELECT ${columns} FROM ${table}`;
  const params: any[] = [];
  let paramCount = 1;

  // WHERE clause
  if (where && Object.keys(where).length > 0) {
    const conditions = Object.entries(where).map(([key, value]) => {
      if (value === null) {
        return `${key} IS NULL`;
      }
      params.push(value);
      return `${key} = $${paramCount++}`;
    });
    queryText += ` WHERE ${conditions.join(' AND ')}`;
  }

  // ORDER BY
  if (options?.orderBy) {
    queryText += ` ORDER BY ${options.orderBy}`;
  }

  // LIMIT
  if (options?.limit) {
    queryText += ` LIMIT ${options.limit}`;
  }

  // OFFSET
  if (options?.offset) {
    queryText += ` OFFSET ${options.offset}`;
  }

  const result = await query<T>(queryText, params);
  return result.rows;
}

/**
 * SELECT single row
 */
export async function selectOne<T extends QueryResultRow = QueryResultRow>(
  table: string,
  columns: string = '*',
  where?: { [key: string]: any }
): Promise<T | null> {
  const rows = await select<T>(table, columns, where, { limit: 1 });
  return rows[0] || null;
}

/**
 * INSERT
 */
export async function insert<T extends QueryResultRow = QueryResultRow>(
  table: string,
  data: { [key: string]: any },
  returning: string = '*'
): Promise<T> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

  const queryText = `
    INSERT INTO ${table} (${keys.join(', ')})
    VALUES (${placeholders})
    RETURNING ${returning}
  `;

  const result = await query<T>(queryText, values);
  return result.rows[0];
}

/**
 * UPDATE
 */
export async function update<T extends QueryResultRow = QueryResultRow>(
  table: string,
  data: { [key: string]: any },
  where: { [key: string]: any },
  returning: string = '*'
): Promise<T | null> {
  const setKeys = Object.keys(data);
  const setValues = Object.values(data);
  const whereKeys = Object.keys(where);
  const whereValues = Object.values(where);

  let paramCount = 1;
  const setClause = setKeys.map(key => `${key} = $${paramCount++}`).join(', ');
  const whereClause = whereKeys.map(key => `${key} = $${paramCount++}`).join(' AND ');

  const queryText = `
    UPDATE ${table}
    SET ${setClause}
    WHERE ${whereClause}
    RETURNING ${returning}
  `;

  const result = await query<T>(queryText, [...setValues, ...whereValues]);
  return result.rows[0] || null;
}

/**
 * DELETE
 */
export async function deleteFrom(
  table: string,
  where: { [key: string]: any }
): Promise<number> {
  const keys = Object.keys(where);
  const values = Object.values(where);
  const conditions = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');

  const queryText = `DELETE FROM ${table} WHERE ${conditions}`;
  const result = await query(queryText, values);
  return result.rowCount || 0;
}

/**
 * COUNT
 */
export async function count(
  table: string,
  where?: { [key: string]: any }
): Promise<number> {
  const result = await select<{ count: string }>(table, 'COUNT(*) as count', where);
  return parseInt(result[0]?.count || '0', 10);
}
