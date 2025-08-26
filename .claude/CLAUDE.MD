# User Feedback – Sistema de Coleta e Gestão de Feedbacks
Plataforma completa para criação, gestão e análise de pesquisas e feedbacks em produtos digitais.

---

## Premissas
- NÃO criar novos arquivos de documentação sem solicitação explícita.  
- Documentações adicionais devem ir para `docs/` seguindo o padrão de nomenclatura já existente.  

---

## 🛠️ Comandos Principais

### Desenvolvimento
```bash
pnpm dev        # Inicia o servidor Next.js em modo desenvolvimento
pnpm build      # Gera build de produção
pnpm start      # Roda build em produção
pnpm lint       # Verifica padrões de código
```

### Banco de Dados
- Configuração inicial via endpoints:
  - `/api/setup-database`
  - `/api/setup-projects`
- Schemas definidos diretamente na camada de API (rotas em `app/api/...`)  
- Não há migrations automáticas: a configuração inicial é feita por rotas de setup.

---

## 📁 Estrutura do Projeto
```plaintext
app/                 # Aplicação Next.js (App Router)
 ├── globals.css     # Estilos globais
 ├── layout.tsx      # Layout base
 ├── page.tsx        # Página inicial
 ├── admin/          # Área administrativa
 ├── api/            # Rotas de API (Next.js API Routes)
 │    ├── auth/      # Login, registro e troca de senha
 │    ├── projects/  # CRUD de projetos
 │    ├── surveys/   # CRUD de surveys, métricas, respostas
 │    ├── feedbacks/ # Feedbacks diretos
 │    └── setup-*    # Endpoints de inicialização do sistema
 └── embed/          # Rotas de embed de surveys

components.json      # Configuração de componentes
tailwind.config.ts   # Configuração do Tailwind
tsconfig.json        # Configuração do TypeScript
```

---

## 🎯 Tecnologias Principais
- **Frontend / Fullstack**: Next.js (App Router) + TypeScript  
- **Estilização**: Tailwind CSS  
- **Autenticação**: Rotas próprias (`/api/auth`) com bcrypt  
- **Banco de Dados**: Integração via rotas de setup (sem ORM explícito)  
- **Infraestrutura**: Deploy agnóstico (Docker configurável, suporte a Vercel/Node)  

---

## 📝 Diretrizes de Código

### Estilo de Código
- Sempre usar **TypeScript**  
- Imports com **ES Modules** (`import/export`), nunca `require`  
- `camelCase` para variáveis/funções  
- `PascalCase` para componentes React/Next.js  
- `kebab-case` para arquivos e diretórios  

### Estrutura de Arquivos
- APIs em `app/api/*`  
- Componentes React em `app/*`  
- Configurações raiz (`tsconfig.json`, `tailwind.config.ts`)  

---

## 🔐 Autenticação & Segurança
- Sistema próprio de login/registro em `/api/auth`  
- Senhas protegidas com **bcrypt**  
- Sessões e tokens customizados via API  

---

## 🧪 Testing & Debug
- `pnpm lint` para checar padrões  
- Logs de debug disponíveis nos endpoints de API (`console.log`)  
- Recomenda-se Postman/Insomnia para testar rotas REST  

---

## ⚠️ Comportamentos Específicos
- Surveys podem ser **embeddados** em outras aplicações (`/api/embed/[id]`)  
- O setup inicial precisa rodar via rotas dedicadas (`/api/setup-database`, `/api/setup-projects`)  
- Respostas e métricas são versionadas dentro da pasta `app/api/surveys/[id]/...`  

---

## 🔧 Troubleshooting
Problemas comuns:
- **Banco não configurado** → Rodar `/api/setup-database`  
- **Erro de autenticação** → Verificar bcrypt e variáveis de ambiente  
- **Build falhando** → Rodar `pnpm install && pnpm build`  
