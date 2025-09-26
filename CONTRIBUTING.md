# Contribuindo para o User Feedback System

Obrigado pelo seu interesse em contribuir! Este documento fornece diretrizes para contribuir com o projeto.

## Código de Conduta

Este projeto adere ao [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, você concorda em seguir estas diretrizes.

## Como Contribuir

### Reportando Bugs

Antes de reportar um bug, verifique se ele já não foi reportado nas [issues existentes](https://github.com/your-username/user-feedback-system/issues).

Para reportar um bug:

1. Use o template de issue para bugs
2. Descreva o comportamento esperado vs. o comportamento atual
3. Inclua passos para reproduzir o problema
4. Adicione screenshots se aplicável
5. Inclua informações sobre seu ambiente (OS, browser, versão do Node.js)

### Sugerindo Melhorias

Para sugerir uma nova funcionalidade ou melhoria:

1. Verifique se a funcionalidade já não foi sugerida
2. Use o template de issue para feature requests
3. Descreva claramente a funcionalidade proposta
4. Explique por que seria útil para o projeto
5. Inclua mockups ou exemplos se possível

### Processo de Desenvolvimento

#### Configuração do Ambiente

1. Faça um fork do repositório
2. Clone seu fork localmente:
   \`\`\`bash
   git clone https://github.com/your-username/user-feedback-system.git
   \`\`\`
3. Instale as dependências:
   \`\`\`bash
   pnpm install
   \`\`\`
4. Configure as variáveis de ambiente conforme o README
5. Execute os testes para garantir que tudo está funcionando:
   \`\`\`bash
   pnpm test
   \`\`\`

#### Fazendo Alterações

1. Crie uma branch para sua funcionalidade:
   \`\`\`bash
   git checkout -b feature/nome-da-funcionalidade
   \`\`\`
2. Faça suas alterações seguindo os padrões de código
3. Adicione ou atualize testes conforme necessário
4. Execute os testes e linting:
   \`\`\`bash
   pnpm test
   pnpm lint
   \`\`\`
5. Faça commit das alterações com mensagens claras
6. Push para sua branch e abra um Pull Request

### Padrões de Código

#### TypeScript/JavaScript

- Use TypeScript para todos os novos arquivos
- Siga as configurações do ESLint e Prettier
- Use interfaces em vez de types quando possível
- Documente funções complexas com JSDoc

#### React/Next.js

- Use componentes funcionais com hooks
- Prefira composição sobre herança
- Use Tailwind CSS para estilização
- Mantenha componentes pequenos e focados

#### Commits

Use mensagens de commit descritivas seguindo o padrão:

\`\`\`
type(scope): description

Types:
- feat: nova funcionalidade
- fix: correção de bug
- docs: alterações na documentação
- style: formatação, espaços em branco, etc.
- refactor: refatoração de código
- test: adição ou correção de testes
- chore: tarefas de manutenção

Exemplos:
feat(surveys): add drag-and-drop survey builder
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
\`\`\`

### Testando

- Escreva testes para novas funcionalidades
- Mantenha coverage de testes acima de 80%
- Use Jest para testes unitários
- Use Cypress ou Playwright para testes E2E

### Pull Requests

Ao abrir um Pull Request:

1. Use o template de PR
2. Descreva as alterações feitas
3. Referencie issues relacionadas
4. Inclua screenshots se aplicável
5. Certifique-se que todos os testes passam
6. Aguarde review do maintainer

### Estrutura de Branches

- \`main\`: branch principal, sempre estável
- \`develop\`: branch de desenvolvimento
- \`feature/*\`: branches para novas funcionalidades
- \`fix/*\`: branches para correções
- \`hotfix/*\`: correções urgentes para produção

## Recursos Úteis

- [Documentação do Next.js](https://nextjs.org/docs)
- [Documentação do TypeScript](https://www.typescriptlang.org/docs/)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação do Supabase](https://supabase.com/docs)

## Obtendo Ajuda

Se você tiver dúvidas:

1. Verifique a documentação existente
2. Procure em issues fechadas
3. Abra uma issue com a tag "question"
4. Entre em contato através das issues do GitHub

Obrigado por contribuir! 🚀