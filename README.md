# 📦 Stock-Pro App


**Estokpro** é uma aplicação moderna de controle de estoque e ponto de venda, desenvolvida com **React**, **TypeScript** e **Vite**, com suporte multiplataforma — podendo rodar tanto como **aplicativo desktop** (via [Tauri](https://tauri.app/) e [Nuitka](https://nuitka.net/)) quanto como **aplicação web em servidor**.

Ideal para pequenos e médios comércios, o sistema oferece recursos completos para gerenciar produtos, categorias, vendas, promoções, clientes e muito mais.

---

## 🛠️ Tecnologias Utilizadas

- ⚛️ [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- ⚡ [Vite](https://vitejs.dev/) – Build rápido e leve
- 💅 [Chakra UI](https://chakra-ui.com/) – Componentes acessíveis e estilizados
- 🔒 Zod + React Hook Form – Validação e controle de formulários
- 📁 React Router DOM – Navegação SPA
- 🖨️ jsPDF + SheetJS – Exportação de relatórios (PDF e XLSX)
- 🧩 Tauri + Nuitka – Deploy como aplicativo desktop com backend Python
- 🧠 Integração com API (ex: FastAPI ou similar)

---

## 🔑 Funcionalidades

- 📦 **Gestão de Produtos** com múltiplos preços (varejo, atacado, promoção)
- 🏷️ **Categorias de produtos**
- 👥 **Clientes** com preferências e histórico
- 🛒 **Carrinho de vendas** com possibilidade de salvar e recuperar
- 🎟️ **Promoções** com cupons e descontos personalizados
- 💰 **Ponto de Venda (PDV)** intuitivo com resumo e controle de itens
- 🧾 **Fechamento de caixa diário**
- 📊 **Métricas e gráficos de vendas**
- 📤 **Exportação de relatórios** em PDF e XLSX
- 🔐 **Controle de acesso** com múltiplos níveis de usuário:
  - superAdmin
  - admin
  - vendedor

---

## ⚙️ Instalação (modo desenvolvimento)

1. Clone o repositório:

```bash
git clone https://github.com/Faguiro/Stock-Pro-App.git
cd Stock-Pro-App
npm install
npm run dev
```
Acesse via http://localhost:5173

---
** 🖥️ Versão Desktop

- Para gerar a versão desktop:
- Tauri CLI
- C++ Compiller
- [Baixe aqui o servidor local: 💾](https://raw.githubusercontent.com/Faguiro/API-Stock-Pro/refs/heads/main/main.exe?token=GHSAT0AAAAAADBF5B3Z2YA2O6BUMADCCWSI2BMZSCA)
  
- Acesse via: http://localhost:8000/docs

---
** 🤝 Contribuindo
Sinta-se à vontade para abrir issues, sugerir melhorias ou enviar pull requests!

** 📄 Licença
Distribuído sob a licença MIT. Veja LICENSE para mais detalhes.

---

Feito com 💙 por Faguiro.



