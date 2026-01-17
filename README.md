# User Feedback System

Sistema completo de coleta e gestão de feedbacks para produtos digitais.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)

## ⚠️ Aviso de Segurança

**Antes de usar este sistema em produção:**

1. 🔒 **Leia o arquivo [SECURITY.md](SECURITY.md)** para conhecer as melhores práticas de segurança
2. 🔑 **Crie credenciais de administrador seguras** - não há usuário padrão pré-configurado
3. 🔐 **Configure todas as variáveis de ambiente** conforme documentado
4. 🛡️ **Implemente rate limiting e CORS** apropriados para seu ambiente
5. 🔍 **Execute auditorias de segurança** regularmente com `pnpm audit`

## Visão Geral

Plataforma completa para criação, gestão e análise de pesquisas e feedbacks em produtos digitais. Permite criar surveys customizáveis, coletar respostas, analisar métricas e exportar dados.

### Funcionalidades

- 🎯 **Criação de Surveys**: Interface intuitiva para criar pesquisas personalizadas
- 📊 **Dashboard de Métricas**: Análise detalhada de respostas e engajamento
- 🔗 **Embed System**: Integração fácil em qualquer website
- 👥 **Gestão de Usuários**: Sistema completo de autenticação e autorização
- 📈 **Analytics**: Métricas em tempo real e relatórios detalhados

## Setup Local

### Pré-requisitos

- Node.js 22.x LTS (recomendado) ou 20.x
- pnpm (recomendado) ou npm
- Cliente PostgreSQL (`psql`)
- Conta no Supabase (para banco de dados)

### Instalação

1. Clone o repositório:
\`\`\`bash
git clone https://github.com/your-username/user-feedback-system.git
cd user-feedback-system
\`\`\`

2. Instale as dependências:
\`\`\`bash
pnpm install
\`\`\`

3. Configure as variáveis de ambiente:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edite o arquivo \`.env.local\` com as credenciais do Supabase **e** com a URL de conexão do PostgreSQL.

### Variáveis de Ambiente Necessárias

| Variável | Descrição | Onde Obter |
|----------|-----------|------------|
| \`DATABASE_URL\` | String de conexão do banco PostgreSQL usada pelo Supabase ou instância local | Supabase → Project Settings → Database, Railway ou banco local |
| \`NEXT_PUBLIC_SUPABASE_URL\` | URL pública do projeto Supabase | Dashboard do Supabase → Settings → API |
| \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` | Chave pública (anon) para operações client-side | Dashboard do Supabase → Settings → API |
| \`SUPABASE_SERVICE_ROLE_KEY\` | Chave de serviço para operações admin/server-side | Dashboard do Supabase → Settings → API |

**⚠️ Importante**: A chave \`SUPABASE_SERVICE_ROLE_KEY\` deve ser mantida segura e nunca exposta no frontend.

4. Execute as migrations (é necessário ter o `psql` instalado e a variável `DATABASE_URL` configurada):
\`\`\`bash
pnpm migrate
\`\`\`

5. Inicie a aplicação de desenvolvimento:
\`\`\`bash
pnpm dev
\`\`\`

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

As migrations ficam em `scripts/migrations/*.sql` com nomes ordenados por timestamp e são executadas sequencialmente pelo script. O diretório `scripts/migrations/legacy/` mantém consultas de troubleshooting usadas anteriormente.

### Primeiro Usuário Administrador

⚠️ **IMPORTANTE:** Por questões de segurança, não há usuário administrador pré-configurado.

Você tem duas opções para criar o primeiro admin:

**Opção 1 - Manual via Banco (Recomendado para produção):**

1. Gere um hash bcrypt para sua senha:
\`\`\`bash
node -e "console.log(require('bcryptjs').hashSync('SUA_SENHA_SEGURA', 12))"
\`\`\`

2. Edite o arquivo `scripts/migrations/20241001_005_seed_default_admin.sql` e descomente as linhas INSERT, substituindo o hash

3. Execute as migrations:
\`\`\`bash
pnpm migrate
\`\`\`

**Opção 2 - Via Interface (Apenas Desenvolvimento):**

1. Inicie a aplicação
2. Acesse a página de registro
3. Crie o primeiro usuário (será automaticamente admin se for o primeiro)

> 🔒 **Produção:** Sempre use senhas fortes (mínimo 12 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos)

## Como Rodar com Docker

O container precisa da variável `DATABASE_URL` apontando para o Postgres. Garanta que o arquivo `.env.local` (ou variáveis de ambiente no provider) contenha essa configuração. O comando `pnpm migrate` é executado automaticamente no start da imagem.

### Usando Docker Compose (Recomendado)

\`\`\`bash
docker-compose up -d
\`\`\`

### Usando Docker diretamente

\`\`\`bash
docker build -t user-feedback-system .
docker run -p 3000:3000 --env-file .env.local user-feedback-system
\`\`\`

## Scripts Disponíveis

- \`pnpm migrate\` - Executa todas as migrations SQL usando o `DATABASE_URL`
- \`pnpm dev\` - Inicia o servidor de desenvolvimento
- \`pnpm build\` - Gera build de produção
- \`pnpm start\` - Executa a versão de produção
- \`pnpm lint\` - Executa verificação de código- \`pnpm audit\` - Verifica vulnerabilidades de segurança

## Segurança

Este projeto leva segurança a sério. Consulte [SECURITY.md](SECURITY.md) para:

- Relatar vulnerabilidades de segurança
- Melhores práticas de deployment
- Checklist de segurança para produção
- Configurações de headers de segurança
- Compliance com GDPR/LGPD

### Recursos de Segurança

- ✅ Senhas com bcrypt (12 salt rounds)
- ✅ Sessões com expiração automática (24h)
- ✅ Validação de entrada de dados
- ✅ Proteção contra SQL injection (via Supabase)
- ✅ Node.js 22 LTS e Next.js 14.2.35 (versões seguras)
- ✅ Dependências auditadas regularmente
- ⚠️ Rate limiting - **Implementar em produção**
- ⚠️ CSRF protection - **Implementar em produção**
- ⚠️ CSP headers - **Configurar em produção**
## Arquitetura

### Stack Tecnológico

- **Frontend/Backend**: Next.js 14 (App Router) + TypeScript
- **Estilização**: Tailwind CSS + Radix UI
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Sistema customizado com bcrypt
- **Deploy**: Docker + Node.js

### Estrutura do Projeto

\`\`\`
app/                 # Next.js App Router
├── api/            # API Routes
│   ├── auth/       # Autenticação
│   ├── surveys/    # CRUD de surveys
│   └── projects/   # Gestão de projetos
components/          # Componentes React
├── ui/             # Componentes base (Radix UI)
├── surveys/        # Componentes de surveys
└── auth/           # Componentes de autenticação
lib/                # Utilitários e configurações
types/              # Definições TypeScript
\`\`\`

## Limitações Conhecidas

- Sistema de autenticação customizado (não usa NextAuth.js)
- Fluxo de migrations baseado em scripts SQL (não há histórico automático de execuções)
- Suporte limitado a tipos de elementos de survey
- Analytics básicos (sem integração com Google Analytics)

## Contribuindo

Leia o arquivo [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre como contribuir com o projeto.

## Código de Conduta

Este projeto adere ao [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, você concorda em seguir estas diretrizes.

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
