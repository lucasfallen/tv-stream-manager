# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# TV Stream Manager

Aplicação para gerenciar a exibição de dashboards e streams em TVs, com suporte para controle remoto via WebSocket.

## Funcionalidades

- Exibição de dashboards em rotação automática
- Área administrativa separada para controle
- Comunicação em tempo real via WebSocket
- Compartilhamento de status entre TVs e área administrativa
- Controle remoto das TVs a partir da área administrativa

## Arquitetura

A aplicação é composta por:

- **Frontend React**: Interface de usuário com rotas para TV e administração
- **WebSocket Server**: Servidor para comunicação em tempo real entre os clientes
- **Socket.IO**: Biblioteca utilizada para implementação de WebSockets

## Pré-requisitos

- Node.js 18.x ou superior
- pnpm

## Instalação

Clone o repositório e instale as dependências:

```bash
git clone <url-do-repositorio>
cd tv-stream-manager
pnpm install
```

## Execução

### Desenvolvimento

Para executar a aplicação em modo de desenvolvimento:

```bash
# Iniciar o servidor WebSocket e a aplicação React simultaneamente
pnpm dev:all

# Ou, para iniciar cada um separadamente:
# Frontend React
pnpm dev

# Servidor WebSocket
pnpm server
```

### Produção

Para executar em produção:

```bash
# Compilar a aplicação
pnpm build

# Iniciar o servidor (que também servirá os arquivos estáticos)
pnpm start
```

## Acessando a Aplicação

- **Modo TV**: http://localhost:5173/ (desenvolvimento) ou http://localhost:3001/ (produção)
- **Área Administrativa**: http://localhost:5173/admin (desenvolvimento) ou http://localhost:3001/admin (produção)

## Como Usar

1. Acesse a área administrativa em `/admin`
2. Configure os dashboards que deseja exibir
3. Abra a visualização de TV em outra janela ou dispositivo acessando a rota principal `/`
4. Controle a exibição a partir da área administrativa, todas as alterações serão refletidas em tempo real nas TVs conectadas
