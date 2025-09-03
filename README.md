# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# TV Stream Manager

Sistema de gerenciamento de dashboards para TVs corporativas com controle centralizado e sincronização em tempo real.

## ✨ Características

- **Interface Moderna e Intuitiva**: Design system completo com componentes reutilizáveis
- **Controle Centralizado**: Painel administrativo para gerenciar todas as TVs
- **Sincronização em Tempo Real**: Comunicação via WebSocket para controle instantâneo
- **Sistema de Rotação**: Dashboards alternam automaticamente conforme configuração
- **Responsivo**: Interface adaptável para diferentes tamanhos de tela
- **Drag & Drop**: Reordenação intuitiva de dashboards
- **Modo Tela Cheia**: Otimizado para exibição em TVs

## 🎨 Design System

O projeto implementa um design system completo com:

- **Variáveis CSS**: Cores, espaçamentos, tipografia e sombras consistentes
- **Componentes Base**: Botões, inputs, cards e badges padronizados
- **Sistema de Cores**: Paleta de cores semânticas (sucesso, aviso, erro, primário)
- **Tipografia**: Hierarquia de fontes com pesos e tamanhos consistentes
- **Animações**: Transições suaves e micro-interações
- **Responsividade**: Breakpoints e layouts adaptáveis

### Paleta de Cores

- **Primário**: Azul (#3B82F6) para ações principais
- **Sucesso**: Verde (#22C55E) para confirmações
- **Aviso**: Amarelo (#F59E0B) para alertas
- **Erro**: Vermelho (#EF4444) para problemas
- **Neutro**: Tons de cinza para conteúdo secundário

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Estado**: Redux Toolkit + Context API
- **Comunicação**: Socket.IO para tempo real
- **Estilização**: CSS Modules + Design System
- **Backend**: Node.js + Express + SQLite
- **Build**: Vite para desenvolvimento e produção

## 📱 Páginas

### 1. **AdminPage** (`/admin`)
- Gerenciamento de dashboards
- Controle de TVs conectadas
- Editor visual com drag & drop
- Modo de controle em tempo real

### 2. **TvDisplayPage** (`/`)
- Exibição de dashboards em tela cheia
- Identificação automática da TV
- Status de conexão em tempo real
- Interface otimizada para TVs

## 🛠️ Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd tv-stream-manager

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📖 Uso

### Configurando uma TV

1. Abra a URL da TV em uma nova janela
2. Digite um nome para identificar a TV
3. A TV será conectada automaticamente ao servidor

### Gerenciando Dashboards

1. Acesse `/admin` para o painel administrativo
2. Adicione novos dashboards com URL e duração
3. Reordene os dashboards arrastando e soltando
4. Use o modo de controle para gerenciar TVs em tempo real

### Controle de TVs

- **Modo Transmissão**: Comandos enviados para todas as TVs
- **Controle Individual**: Selecione uma TV específica para controle direto
- **Status em Tempo Real**: Visualize o estado de todas as TVs conectadas

## 🎯 Funcionalidades Principais

### Dashboard Controls
- Navegação entre dashboards
- Controle de reprodução (play/pause)
- Seletor de dashboard
- Informações detalhadas
- Prévia em tempo real

### Dashboard Editor
- Criação e edição de dashboards
- Validação de URLs
- Reordenação por drag & drop
- Feedback visual para ações
- Interface responsiva

### Dashboard Viewer
- Exibição em tela cheia
- Tratamento de erros
- Overlay de informações
- Status de reprodução
- Modo de espera

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Porta do servidor
PORT=3000

# Porta do cliente
VITE_CLIENT_PORT=8080

# URL do servidor WebSocket
VITE_SOCKET_URL=ws://localhost:3000
```

### Personalização do Design

O design system pode ser personalizado editando as variáveis CSS em `src/styles/design-system.css`:

```css
:root {
  --primary-600: #3B82F6;    /* Cor primária */
  --success-600: #22C55E;    /* Cor de sucesso */
  --warning-600: #F59E0B;    /* Cor de aviso */
  --error-600: #EF4444;      /* Cor de erro */
}
```

## 📱 Responsividade

O sistema é totalmente responsivo com breakpoints:

- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Desktop**: 768px - 1024px
- **Large**: > 1024px

## 🎨 Componentes

### Botões
- `.btn` - Base
- `.btn-primary` - Ação principal
- `.btn-success` - Confirmação
- `.btn-danger` - Ação perigosa
- `.btn-secondary` - Ação secundária

### Inputs
- `.input` - Campo de entrada
- `.input.error` - Estado de erro
- Validação visual e feedback

### Cards
- `.card` - Container de conteúdo
- `.card-header` - Cabeçalho
- `.card-body` - Corpo
- `.card-footer` - Rodapé

## 🚀 Melhorias Implementadas

### Interface do Usuário
- ✅ Design system completo com variáveis CSS
- ✅ Componentes reutilizáveis e consistentes
- ✅ Animações e transições suaves
- ✅ Estados visuais claros (hover, focus, disabled)
- ✅ Feedback visual para todas as ações

### Experiência do Usuário
- ✅ Navegação intuitiva e clara
- ✅ Feedback imediato para ações
- ✅ Estados de carregamento e erro
- ✅ Interface responsiva para todos os dispositivos
- ✅ Modo tela cheia otimizado para TVs

### Acessibilidade
- ✅ Contraste adequado de cores
- ✅ Estados de focus visíveis
- ✅ Textos alternativos para ícones
- ✅ Navegação por teclado
- ✅ Estrutura semântica HTML

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ para melhorar a experiência de gerenciamento de TVs corporativas**
