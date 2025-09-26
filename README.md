# User Feedback System

Sistema completo de coleta e gestão de feedbacks para produtos digitais.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)

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

- Node.js 18.x ou superior
- pnpm (recomendado) ou npm
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

Edite o arquivo \`.env.local\` com suas credenciais do Supabase.

4. Execute a aplicação:
\`\`\`bash
pnpm dev
\`\`\`

A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

### Configuração do Banco de Dados

1. Acesse \`/api/setup-database\` para criar as tabelas necessárias
2. Acesse \`/api/setup-projects\` para configurar os projetos iniciais

## Como Rodar com Docker

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

- \`pnpm dev\` - Inicia o servidor de desenvolvimento
- \`pnpm build\` - Gera build de produção
- \`pnpm start\` - Executa a versão de produção
- \`pnpm lint\` - Executa verificação de código

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
- Configuração de banco via endpoints HTTP (não migrations automáticas)
- Suporte limitado a tipos de elementos de survey
- Analytics básicos (sem integração com Google Analytics)

## Contribuindo

Leia o arquivo [CONTRIBUTING.md](CONTRIBUTING.md) para detalhes sobre como contribuir com o projeto.

## Código de Conduta

Este projeto adere ao [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, você concorda em seguir estas diretrizes.

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
