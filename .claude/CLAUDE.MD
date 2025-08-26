# GruppyOnboarding - Sistema de Aprendizado e Avaliação

Sistema completo de gestão de aprendizado e avaliação de performance para colaboradores da Gruppy.

## Premissas

- **NÃO** crie novos arquivos de documentação a não ser que seja solicitado explicitamente.
- Se for criar uma nova documentação **específica**, coloque-a na pasta `docs/` e siga o padrão de nomenclatura existente.

## 🛠️ Comandos Principais

### Desenvolvimento
- `make start`: Inicia todos os serviços (aplicação + banco PostgreSQL via Docker)
- `make dev`: Inicia o servidor de desenvolvimento local (sem Docker)
- `make stop`: Para todos os serviços
- `make restart`: Reinicia os serviços
- `make build`: Rebuild das imagens Docker
- `make status`: Mostra status dos serviços e health checks
- `make logs`: Mostra logs em tempo real de todos os serviços
- `make logs-app`: Mostra logs apenas da aplicação
- `make install`: Instala dependências npm

### Banco de Dados
- `make db-info`: Mostra informações de conexão do PostgreSQL
- `make db-shell`: Abre shell do PostgreSQL
- `make db-tables`: Lista todas as tabelas do banco
- `make backup`: Cria backup do banco de dados
- `make migrate`: Executa migrações manualmente
- Schema definido em `shared/schema.ts` (Drizzle ORM)
- Migrations geradas em `migrations/` pelo Drizzle Kit
- **Local**: Configuração via `drizzle.config.ts`
- **Produção**: Configuração via `drizzle.config.aws.js` para AWS RDS

## 📁 Estrutura do Projeto

```
client/          # Frontend React + Vite + TypeScript
├── src/         # Código React
└── index.html   # Template HTML

server/          # Backend Express + TypeScript
├── index.ts     # Servidor principal
├── routes.ts    # Rotas da API
├── db.ts        # Configuração do banco
└── *.ts         # Serviços e utilitários

shared/          # Código compartilhado
└── schema.ts    # Schema Drizzle ORM

scripts/         # Scripts de migração e setup
kubernetes/      # Configurações K8s
attached_assets/ # Arquivos anexos
```

## 🎯 Tecnologias Principais

### Frontend
- **React 18** + TypeScript
- **Vite** (build tool)
- **Wouter** (routing)
- **TanStack Query** (estado/cache)
- **Radix UI** + **Tailwind CSS** (interface)
- **Framer Motion** (animações)

### Backend
- **Node.js** + **Express** + TypeScript
- **Drizzle ORM** (PostgreSQL)
- **Replit Auth** (autenticação)
- **AWS S3** (arquivos)
- **OpenAI GPT-4o** (IA para avaliações)

### Infraestrutura
- **Docker** + **Kubernetes**
- **AWS RDS PostgreSQL**
- **AWS S3** (storage)

## 📝 Diretrizes de Código

### IMPORTANTE - Padrões Obrigatórios
- **SEMPRE use ES modules** (`import/export`), NUNCA CommonJS (`require`)
- **SEMPRE destructure imports** quando possível: `import { foo } from 'bar'`
- **SEMPRE use TypeScript** para novos arquivos
- **SEMPRE mantenha consistência** entre `client/` e `server/` para tipos compartilhados

### Estrutura de Arquivos
- Componentes React em `client/src/components/`
- Serviços de backend em `server/`
- Schemas e tipos em `shared/schema.ts`
- Scripts de banco em arquivos `.sql` na raiz
- Scripts de migração em `scripts/`

### Estilo de Código
- Use **camelCase** para variáveis e funções
- Use **PascalCase** para componentes React
- Use **kebab-case** para arquivos e diretórios
- Prefira **arrow functions** para componentes funcionais
- Use **const assertions** quando apropriado

## 🗃️ Banco de Dados

### Configuração
- **Local**: PostgreSQL via `drizzle.config.ts`
- **Produção**: AWS RDS via `drizzle.config.aws.js`
- **ORM**: Drizzle ORM com TypeScript

### Migrações
- Schemas definidos em `shared/schema.ts`
- Drizzle Kit gera migrations automaticamente em `migrations/`
- **Desenvolvimento**: Execute `make migrate` ou `npm run db:push`
- **Produção**: Use `npx drizzle-kit push` no ambiente de produção
- Scripts manuais de migração estão na raiz (`.sql` e `.js`)
- **IMPORTANTE**: O projeto usa Drizzle Kit Push (aplica mudanças diretamente)

### IMPORTANTE - Dados Sensíveis
- **NUNCA commite** arquivos `.env*`
- **NUNCA commite** arquivos `cookies_*`
- **SEMPRE use** variáveis de ambiente para credenciais

## 🔐 Autenticação & Segurança

- **Replit Auth** para autenticação
- **Express Session** para sessões
- **bcrypt** para senhas
- **Passport.js** para estratégias de login

## 🧪 Testing & Debug

### Comandos de Debug
- `npm run check`: Verificação de tipos
- Logs de desenvolvimento em `server/index.ts`
- Use **console.log** temporariamente (remova antes do commit)

### Arquivos de Teste
- Scripts `.cjs` para testes específicos
- Arquivos `test-*.ts` para validações
- Use `tsx` para executar TypeScript diretamente

## ⚠️ Comportamentos Específicos

### Vite + Express
- Frontend e backend rodam juntos em desenvolvimento
- Build separado para produção
- Rotas da API em `/api/*`

### Drizzle ORM
- Schema único em `shared/schema.ts`
- Migrações automáticas com `db:push`
- **SEMPRE** que alterar um modelo, crie uma nova migração (migration)
- **CUIDADO**: Sempre backup antes de mudanças em produção

### Replit Integration
- Configuração específica em `replit.md`
- Auth integrado com Replit
- Deploy automático configurado

## 🔧 Troubleshooting

### Problemas Comuns
1. **Erro de tipos**: Execute `npm run check`
2. **Banco não conecta**: Execute `make db-info` e verifique `.env` e credenciais AWS
3. **Build falha**: Execute `make clean` e depois `make build`
4. **Docker não inicia**: Execute `make status` para diagnóstico e verifique se Docker está rodando
5. **Serviços não respondem**: Use `make logs` para ver logs em tempo real
6. **Problemas de dependências**: Execute `make install` para reinstalar

### Arquivos de Referência
- `TROUBLESHOOTING.md`: Guia detalhado de problemas
- `DEPLOYMENT.md`: Instruções de deploy
- `AWS_RDS_*.md`: Configuração de banco

## 📋 Workflow

### Desenvolvimento
1. **SEMPRE** rode `npm run check` antes de commits
2. **PREFIRA** commits pequenos e frequentes
3. **DOCUMENTE** mudanças importantes neste arquivo

### IMPORTANTE - Antes de Commit
- [ ] Código buildando sem erros (`npm run build` para verificar)
- [ ] Removidos logs e comentários temporários

---

💡 **Dica**: Use `#` para adicionar instruções que serão automaticamente incorporadas neste arquivo!