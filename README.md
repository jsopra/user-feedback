# User Feedback System

Sistema completo de coleta e gestão de feedbacks para produtos digitais.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)

## Quick Start

### Pré-requisitos

- Node.js 20.x+ (recomendado 22.x LTS)
- PostgreSQL 12+ ou Docker
- pnpm ou npm

### Setup em 3 passos

1. **Clone e instale:**
```bash
git clone https://github.com/your-username/user-feedback-system.git
cd user-feedback-system
pnpm install
```

2. **Configure o banco de dados:**
```bash
cp .env.example .env.local
# Edite .env.local com sua DATABASE_URL
pnpm migrate
```

3. **Inicie a aplicação:**
```bash
pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000). Se não houver usuários no banco, você será automaticamente redirecionado para `/setup` para criar o primeiro admin.

---

## Configuração do Banco de Dados

### Variável Necessária

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Opções Rápidas

**Local com Docker:**
```bash
docker run -d --name user-feedback-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=user_feedback \
  -p 5432:5432 \
  postgres:16-alpine

# Então use:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/user_feedback
```

**PostgreSQL Cloud:** Supabase, Railway, Render, DigitalOcean, etc.

---

## Fluxo de Admin

Quando você inicia a aplicação sem usuários:

1. ✅ Sistema detecta banco vazio
2. 🔄 Redireciona automaticamente para `/setup`
3. 📝 Você cria o primeiro usuário admin (segura com bcrypt)
4. ✅ Acesso concedido ao dashboard

Não há credenciais padrão hardcoded por questões de segurançaFuncionalidades

- 🎯 **Surveys**: Criação intuitiva de pesquisas personalizadas
- 📊 **Dashboard**: Análise de respostas em tempo real
- 🔗 **Embed**: Integre em qualquer website via JavaScript
- 📈 **Métricas**: Análise de engajamento e conversão
- 👥 **Gestão**: Gerenciamento de projetos e usuários

---

## Docker

Use Docker Compose para subir localmente com postgres incluído:

```bash
docker-compose up -d
```

Ou build manualmente:
```bash
docker build -t user-feedback .
docker run -p 3000:3000 --env-file .env.local user-feedback
```

---

## Scripts Disponíveis

```bash
pnpm dev          # Desenvolvimento
pnpm build        # Build de produção
pnpm start        # Executar build
pnpm migrate      # Rodar migrations do PostgreSQL
pnpm lint         # Checar código
pnpm audit        # Verificar vulnerabilidades
```

---

## Segurança

⚠️ **IMPORTANTE:** Leia [SECURITY.md](SECURITY.md) antes de usar em produção.

Highlights:
- ✅ Bcrypt com 12 salt rounds
- ✅ Sessões com expiração (24h)
- ✅ Sem credenciais hardcoded
- ⚠️ Configure rate limiting em produção
- ⚠️ Configure CSP headers em produção

---

## Estrutura