# Property Insight

Sistema de gestão de inspeções de propriedades desenvolvido para facilitar o controle e acompanhamento de inspeções imobiliárias.

## Sobre o Projeto

O Property Insight é uma plataforma web que permite a gestão completa de inspeções de propriedades, oferecendo interfaces diferenciadas para administradores e corretores. O sistema facilita o agendamento, acompanhamento e gerenciamento de todas as etapas do processo de inspeção.

## Funcionalidades

### Painel Administrativo

- **Dashboard**: Visualização de estatísticas e métricas do sistema
- **Gestão de Propriedades**: Cadastro, edição e controle de propriedades
- **Gestão de Corretores**: Administração de usuários corretores
- **Gestão de Inspeções**: Acompanhamento e controle de todas as inspeções
- **Configurações**: Ajustes gerais do sistema

### Painel do Corretor

- **Home**: Visão geral das inspeções atribuídas
- **Agenda**: Calendário e agendamento de inspeções
- **Inspeções**: Lista e detalhes das inspeções
- **Perfil**: Gerenciamento do perfil do corretor

## Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias:

- **Vite**: Build tool e servidor de desenvolvimento
- **TypeScript**: Linguagem de programação
- **React**: Biblioteca para construção da interface
- **React Router DOM**: Roteamento da aplicação
- **shadcn-ui**: Componentes de UI
- **Tailwind CSS**: Framework CSS utilitário
- **TanStack Query**: Gerenciamento de estado do servidor
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas
- **Recharts**: Biblioteca de gráficos

## Pré-requisitos

- Node.js (recomendado usar nvm para instalação)
- npm ou yarn

## Instalação

1. Clone o repositório:
```sh
git clone <URL_DO_REPOSITORIO>
cd property-insight
```

2. Instale as dependências:
```sh
npm install
```

3. Configure as variáveis de ambiente:
```sh
cp env.example .env
```

Edite o arquivo `.env` com as configurações necessárias.

4. Inicie o servidor de desenvolvimento:
```sh
npm run dev
```

A aplicação estará disponível em `http://localhost:5173` (ou a porta configurada).

## Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Cria build de produção
- `npm run build:dev`: Cria build de desenvolvimento
- `npm run preview`: Visualiza o build de produção
- `npm run lint`: Executa o linter

## Estrutura do Projeto

```
property-insight/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── contexts/       # Contextos React (Auth, etc)
│   ├── pages/          # Páginas da aplicação
│   ├── services/       # Serviços de API
│   ├── types/          # Definições TypeScript
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilitários
│   └── integrations/   # Integrações externas
├── public/             # Arquivos estáticos
├── backend/            # Backend da aplicação
└── supabase/           # Configurações Supabase
```

## Desenvolvimento

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto é privado e de uso interno.
