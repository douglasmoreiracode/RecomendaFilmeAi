# 🎬 Recomenda FilmeAí

Plataforma interna para compartilhar recomendações de filmes e séries entre amigos da Desban.

## 🎯 Objetivo

Criar um mural simples e rápido de recomendações para uso casual (ex: horário de almoço).

Sem autenticação.
Sem backend.
Versão 1.0 estática.

---

## 🧱 Stack

- HTML5
- CSS3
- JavaScript Vanilla
- Deploy: GitHub + Vercel
- Fonte: Rethink Sans
- Assets: SVG (inline quando necessário)

---

## 📁 Estrutura do Projeto

recomenda-filmeai/
│
├── index.html
├── /assets
│ ├── /icons
│ ├── /logo
│ └── /images
│
├── /css
│ ├── reset.css
│ ├── variables.css
│ └── styles.css
│
├── /js
│ ├── data.js
│ ├── render.js
│ └── modal.js
│
└── README.md


---

## 🎨 Design System (Base)

### Cores principais

- Background: #0F0F0F
- Primary: #FF2E63
- Purple Accent: #6C2BD9
- Texto principal: #FFFFFF
- Texto secundário: #B3B3B3

### Radius
- Cards: 24px
- Botões: 999px

### Tipografia
- Rethink Sans
- 700 → títulos
- 600 → subtítulos
- 500 → labels
- 400 → corpo

---

## 🗂 Modelo de Dados (Versão 1.0)

Cada recomendação é independente.

```js
{
  id: string,
  tipo: "filme" | "serie",
  titulo: string,
  indicadoPor: string,
  nota: number, // 0 a 10 (step 0.5)
  plataforma: string,
  generos: string[],
  trailer: string,
  criadoEm: timestamp
}
```

## 🧾 Estados do formulário

- Estado vazio: todos os campos limpos.
- Estado foco: campo ativo recebe borda de destaque.
- Estado erro: mensagem abaixo do campo com `Campo obrigatório`.
- Estado loading: botão principal exibe `Publicando...`.
- Estado sucesso: modal fecha e toast mostra `Recomendação adicionada com sucesso 🎬`.
