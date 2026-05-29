# 🍔 Burger House

Starter para o projeto **🍔 Burger House** — Curso de Web Design Híbrido · Vocação (Módulos 13–15).

## 📁 Estrutura

```
hamburgueria/
├── index.html        ← página principal (HTML semântico + ARIA)
├── css/
│   └── style.css     ← design system com tokens (CSS Variables)
├── js/
│   ├── dados.js      ← cardápio/serviços (edite aqui!)
│   └── app.js        ← renderização + validação de formulário
└── README.md
```

## ✅ O que já vem pronto

- HTML semântico (`<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`)
- Skip link para teclado
- `:focus-visible` com contraste alto
- `aria-label`, `aria-required`, `aria-live`, `role="status"`
- Formulário com validação acessível
- Design responsivo (mobile-first)
- `prefers-reduced-motion` respeitado
- Tokens CSS para fácil customização da cor

## 🛠 Como começar

1. Abra `index.html` no navegador (ou use o **Live Server** do VS Code).
2. Edite `js/dados.js` para trocar os itens.
3. Ajuste o `--cor-primaria` em `css/style.css` se quiser.
4. Faça o **commit semântico** das suas mudanças:

```
git add .
git commit -m "feat(hamburgueria): adiciona itens reais do cardápio"
git push
```

## 🚀 Deploy

- **GitHub Pages**: Settings → Pages → branch `main` → `/root`.
- **Vercel**: importe o repositório, deploy automático.

## 📝 Próximos passos sugeridos (Sprint 1)

- [ ] Trocar textos placeholder pelo conteúdo real
- [ ] Adicionar 4 itens reais no `dados.js`
- [ ] Trocar emoji do logo por uma imagem (com `alt`)
- [ ] Auditar contraste com o Lighthouse
- [ ] Testar navegação só com Tab

Bom código! 💜
