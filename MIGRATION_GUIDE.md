# Guia de Migração: Supabase → PostgreSQL Puro

Data: Janeiro 17, 2026

## Visão Geral

O sistema foi migrado de **Supabase** para **PostgreSQL puro** usando o driver `pg`. Esta mudança:

✅ **Remove dependência de serviços externos** (exceto o banco PostgreSQL)  
✅ **Simplifica a arquitetura** - menos abstrações  
✅ **Mantém compatibilidade** - código existente continua funcionando  
✅ **Melhora controle** sobre conexões e queries  

## O Que Mudou

### Antes (Supabase)
```typescript
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, key)
```

### Depois (PostgreSQL Puro)
```typescript
import { getDbClient } from '@/lib/dbClient'
const supabase = getDbClient() // Retorna adapter PostgreSQL
```

### Compatibilidade

O adapter mantém a mesma API do Supabase para queries:

```typescript
// Todas estas queries ainda funcionam:
const { data } = await supabase.from('users').select('*')
const { data } = await supabase.from('users').select('*').eq('email', email).single()
const { data } = await supabase.from('users').insert({ name, email })
const { data } = await supabase.from('users').update({ name }).eq('id', id)
const { error } = await supabase.from('users').delete().eq('id', id)
```

## Migração Passo a Passo

### Para Instalações Novas

1. **Clone o repositório** (versão mais recente já tem as mudanças)

2. **Configure variáveis de ambiente:**
```bash
cp .env.example .env.local
```

Edite `.env.local`:
```bash
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=development
```

3. **Execute migrations:**
```bash
pnpm install
pnpm migrate
```

4. **Inicie a aplicação:**
```bash
pnpm dev
```

---

### Para Instalações Existentes (Atualizando)

#### Opção A: Usando mesmo banco Supabase (Recomendado)

Se você já usa Supabase, pode continuar usando **apenas o banco PostgreSQL** dele:

1. **Obtenha a connection string** no Supabase:
   - Dashboard → Settings → Database
   - Copie a "Connection string" (modo "Transaction" ou "Session")

2. **Atualize variáveis de ambiente:**

`.env.local` (ANTES):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://...
```

`.env.local` (DEPOIS):
```bash
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres
NODE_ENV=production
```

3. **Atualize o código:**
```bash
git pull origin main
pnpm install
pnpm build
```

4. **Reinicie o servidor** (sem migrations, banco já existe)

#### Opção B: Migrando para PostgreSQL Próprio

Se quiser sair do Supabase completamente:

1. **Backup do banco Supabase:**
```bash
# Via Supabase Dashboard ou pg_dump
pg_dump $OLD_DATABASE_URL > backup_supabase.sql
```

2. **Crie novo banco PostgreSQL:**
   - Local: Docker, instalação nativa
   - Cloud: Railway, Render, DigitalOcean, etc.

```bash
# Exemplo Docker:
docker run -d \
  --name user-feedback-db \
  -e POSTGRES_PASSWORD=sua_senha_forte \
  -e POSTGRES_DB=user_feedback \
  -p 5432:5432 \
  postgres:16-alpine
```

3. **Restaure o backup:**
```bash
psql $NEW_DATABASE_URL < backup_supabase.sql
```

4. **Atualize `.env.local`:**
```bash
DATABASE_URL=postgresql://postgres:sua_senha_forte@localhost:5432/user_feedback
NODE_ENV=production
```

5. **Atualize código e teste:**
```bash
git pull origin main
pnpm install
pnpm build
pnpm start
```

---

## Diferenças Técnicas

### 1. Autenticação

**Antes**: Supabase Auth (automático)  
**Depois**: Sistema customizado com bcrypt (já implementado)

✅ Não há mudanças - sempre usamos autenticação customizada

### 2. Queries

**Antes**: Supabase PostgREST API  
**Depois**: SQL direto via driver `pg`

✅ API mantida via adapter - código não precisa mudar

### 3. Real-time / Subscriptions

**Antes**: Supabase Realtime  
**Depois**: ❌ Não implementado (não era usado no projeto)

Se precisar de real-time, considere:
- WebSockets customizados
- Server-Sent Events (SSE)
- Polling

### 4. Storage

**Antes**: Supabase Storage  
**Depois**: ❌ Não implementado (não era usado no projeto)

Se precisar de storage:
- AWS S3, Cloudflare R2, DigitalOcean Spaces
- Upload direto no filesystem (desenvolvimento)

### 5. Edge Functions

**Antes**: Supabase Edge Functions  
**Depois**: Next.js API Routes (já usado no projeto)

✅ Sem mudanças

---

## Problemas Conhecidos e Soluções

### Problema 1: Erro "Missing Supabase environment variables"

**Causa**: Variáveis antigas ainda configuradas  
**Solução**: Use apenas `DATABASE_URL` em `.env.local`

### Problema 2: Connection pool exhausted

**Causa**: Muitas conexões abertas  
**Solução**: Configurar `max` em `lib/db.ts`:
```typescript
max: 20, // Ajuste conforme necessário
```

### Problema 3: SSL required in production

**Causa**: PostgreSQL na nuvem exige SSL  
**Solução**: Já configurado automaticamente em produção:
```typescript
ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
```

### Problema 4: Queries lentas

**Causa**: Falta de índices  
**Solução**: Adicione índices nas migrations:
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_surveys_project_id ON surveys(project_id);
```

---

## Performance

### Connection Pooling

O driver `pg` usa connection pooling automaticamente:

```typescript
// Em lib/db.ts
max: 20,                    // Máximo de conexões
idleTimeoutMillis: 30000,   // Timeout para conexões ociosas
connectionTimeoutMillis: 2000 // Timeout para obter conexão
```

Ajuste conforme necessário para seu ambiente.

### Prepared Statements

Todas as queries usam prepared statements automaticamente:

```typescript
// Seguro contra SQL injection
query('SELECT * FROM users WHERE email = $1', [email])
```

---

## Funcionalidades Adicionadas

### 1. Query Helpers Diretos

Além do adapter Supabase-like, você pode usar helpers SQL diretos:

```typescript
import { select, insert, update, deleteFrom } from '@/lib/db'

// SELECT
const users = await select('users', '*', { is_active: true })

// INSERT
const user = await insert('users', { name: 'João', email: 'joao@example.com' })

// UPDATE
const updated = await update('users', { name: 'João Silva' }, { id: userId })

// DELETE
await deleteFrom('users', { id: userId })
```

### 2. Transações

Execute múltiplas queries em uma transação:

```typescript
import { transaction } from '@/lib/db'

await transaction(async (client) => {
  await client.query('INSERT INTO users ...')
  await client.query('INSERT INTO profiles ...')
  // Se qualquer query falhar, tudo é revertido (ROLLBACK)
})
```

### 3. Raw Queries

Para queries complexas:

```typescript
import { query } from '@/lib/db'

const result = await query(`
  SELECT u.*, COUNT(s.id) as survey_count
  FROM users u
  LEFT JOIN surveys s ON s.created_by = u.id
  GROUP BY u.id
`, [])
```

---

## Checklist de Migração

- [ ] Backup do banco atual
- [ ] Atualizar código (`git pull`)
- [ ] Instalar dependências (`pnpm install`)
- [ ] Configurar `DATABASE_URL` em `.env.local`
- [ ] Remover variáveis antigas do Supabase
- [ ] Testar conexão com banco
- [ ] Executar migrations (se novo banco)
- [ ] Testar autenticação
- [ ] Testar CRUD de surveys
- [ ] Testar métricas e dashboards
- [ ] Monitorar logs por 24h

---

## Rollback (Reverter para Supabase)

Se precisar voltar para a versão anterior:

```bash
# 1. Checkout para commit anterior
git log --oneline  # Encontre o commit antes da migração
git checkout <commit-hash>

# 2. Reinstale dependências
pnpm install

# 3. Reconfigure variáveis de ambiente (valores antigos do Supabase)

# 4. Reinicie aplicação
pnpm build && pnpm start
```

---

## Suporte

Para problemas durante a migração:

1. Verifique logs da aplicação
2. Verifique logs do PostgreSQL
3. Abra uma issue no GitHub com:
   - Versão do Node.js
   - Versão do PostgreSQL
   - Mensagem de erro completa
   - Steps para reproduzir

---

## Benefícios da Migração

✅ **Menor custo**: Não precisa pagar por Supabase além do banco  
✅ **Mais controle**: Configuração completa do PostgreSQL  
✅ **Portabilidade**: Funciona com qualquer PostgreSQL  
✅ **Simplicidade**: Menos abstrações, mais transparência  
✅ **Performance**: Connection pooling otimizado  
✅ **Segurança**: Prepared statements nativos  

---

**Versão deste guia:** 1.0  
**Data:** Janeiro 17, 2026  
**Compatível com:** Next.js 14.2.35+, PostgreSQL 12+
