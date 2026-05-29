// Renderiza a lista de itens e cuida do formulário e carrinho.
(function () {
  "use strict";

  // --- Utilitários de escape XSS ---
  function escapar(txt) {
    var div = document.createElement("div");
    div.textContent = String(txt == null ? "" : txt);
    return div.innerHTML;
  }

  function escaparAttr(txt) {
    return String(txt == null ? "" : txt)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // --- Formatação de preço ---
  function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function parsePreco(preco) {
    var valor = String(preco || "")
      .replace(/[^0-9,.-]/g, "")
      .replace(/\./g, "")
      .replace(/,/, ".");
    var numero = Number(valor);
    return Number.isFinite(numero) ? numero : 0;
  }

  // --- Ano no rodapé ---
  var anoEl = document.getElementById("ano");
  if (anoEl) anoEl.textContent = new Date().getFullYear();

  // --- Referências do DOM ---
  var lista          = document.getElementById("lista-itens");
  var cartPanel      = document.getElementById("cart-panel");
  var cartItems      = document.getElementById("cart-items");
  var cartTotal      = document.getElementById("cart-total");
  var cartEmpty      = document.querySelector(".cart-empty");
  var cartClear      = document.getElementById("cart-clear");
  var cartIcon       = document.querySelector(".cart-icon");
  var cartClose      = document.querySelector(".cart-close");
  var paymentOptions = document.getElementById("payment-options");
  var paymentFeedback= document.getElementById("payment-feedback");
  var checkoutBtn    = document.getElementById("checkout-btn");
  var body           = document.body;

  var cart = [];

  // --- Funções do carrinho ---
  function getSelectedPayment() {
    var selected = document.querySelector("#payment-options input[name='payment']:checked");
    return selected ? selected.value : null;
  }

  function setPaymentEnabled(enabled) {
    document.querySelectorAll("#payment-options input[name='payment']").forEach(function (input) {
      input.disabled = !enabled;
    });
  }

  function updatePaymentFeedback() {
    if (!paymentFeedback) return;
    var selected = getSelectedPayment();
    paymentFeedback.textContent = selected
      ? "Método selecionado: " + selected + "."
      : "Selecione uma forma de pagamento para continuar.";
  }

  function atualizarCarrinho() {
    if (!cartItems || !cartTotal || !cartEmpty || !cartClear || !paymentFeedback || !checkoutBtn || !paymentOptions) return;

    if (!cart.length) {
      cartEmpty.style.display   = "block";
      cartItems.innerHTML       = "";
      cartTotal.textContent     = formatarPreco(0);
      cartClear.disabled        = true;
      checkoutBtn.disabled      = true;
      setPaymentEnabled(false);
      paymentFeedback.textContent = "Adicione itens para escolher a forma de pagamento.";
      return;
    }

    cartEmpty.style.display = "none";
    var total = 0;

    cartItems.innerHTML = cart.map(function (item) {
      total += item.preco * item.quantidade;
      return (
        '<li class="cart-item">' +
          '<div class="cart-item-info">' +
            '<strong>' + escapar(item.nome) + '</strong>' +
            '<span>Qtd: ' + item.quantidade + '</span>' +
            '<span>' + formatarPreco(item.preco) + '</span>' +
          '</div>' +
          '<button type="button" class="cart-remove" data-index="' + item.index + '" aria-label="Remover ' + escaparAttr(item.nome) + '">×</button>' +
        '</li>'
      );
    }).join("");

    cartTotal.textContent    = formatarPreco(total);
    cartClear.disabled       = false;
    setPaymentEnabled(true);
    checkoutBtn.disabled     = !getSelectedPayment();
    updatePaymentFeedback();
  }

  function addToCart(item, index) {
    var preco    = parsePreco(item.preco);
    var existing = cart.find(function (p) { return p.index === index; });
    if (existing) {
      existing.quantidade += 1;
    } else {
      cart.push({ index: index, nome: item.nome.trim(), preco: preco, quantidade: 1 });
    }
    atualizarCarrinho();
  }

  function removeFromCart(index) {
    cart = cart.filter(function (p) { return p.index !== index; });
    atualizarCarrinho();
  }

  function clearCart() {
    cart = [];
    // Limpa seleção de pagamento
    document.querySelectorAll("#payment-options input[name='payment']").forEach(function (i) { i.checked = false; });
    atualizarCarrinho();
  }

  function openCart() {
    body.classList.add("cart-open");
    if (cartPanel) cartPanel.setAttribute("aria-hidden", "false");
    if (cartClose) cartClose.focus();
  }

  function closeCart() {
    body.classList.remove("cart-open");
    if (cartPanel) cartPanel.setAttribute("aria-hidden", "true");
    if (cartIcon) cartIcon.focus();
  }

  function finalizarPedido() {
    var metodo = getSelectedPayment();
    if (!metodo || !cart.length) {
      if (paymentFeedback) paymentFeedback.textContent = "Escolha um pagamento e adicione pelo menos um item.";
      return;
    }
    if (paymentFeedback) paymentFeedback.textContent = "✓ Pedido finalizado com " + metodo + ". Obrigado!";
    // Limpa seleção de pagamento antes de zerar o carrinho
    document.querySelectorAll("#payment-options input[name='payment']").forEach(function (i) { i.checked = false; });
    cart = [];
    atualizarCarrinho();
  }

  // --- Renderiza cards do cardápio ---
  if (lista && Array.isArray(ITENS)) {
    lista.innerHTML = ITENS.map(function (item, index) {
      var imgHtml = item.imagem
        ? '<img src="' + escaparAttr(item.imagem) + '" alt="' + escaparAttr(item.nome.trim()) + '" loading="lazy">'
        : "";
      return (
        '<li class="card">' +
          imgHtml +
          '<div class="card-content">' +
            '<h3>' + escapar(item.nome.trim()) + '</h3>' +
            '<p>' + escapar(item.descricao) + '</p>' +
            '<p class="preco">' + escapar(item.preco) + '</p>' +
            '<button type="button" class="btn btn-small cart-add" data-index="' + index + '">Adicionar ao carrinho</button>' +
          '</div>' +
        '</li>'
      );
    }).join("");
  }

  // --- Eventos do cardápio ---
  if (lista) {
    lista.addEventListener("click", function (event) {
      var button = event.target.closest(".cart-add");
      if (!button) return;
      var index = Number(button.dataset.index);
      if (Number.isNaN(index) || !ITENS[index]) return;
      addToCart(ITENS[index], index);
      openCart();
    });
  }

  // --- Eventos do carrinho ---
  if (cartItems) {
    cartItems.addEventListener("click", function (event) {
      var button = event.target.closest(".cart-remove");
      if (!button) return;
      var index = Number(button.dataset.index);
      if (!Number.isNaN(index)) removeFromCart(index);
    });
  }

  if (paymentOptions) {
    paymentOptions.addEventListener("change", function () {
      updatePaymentFeedback();
      if (checkoutBtn) checkoutBtn.disabled = !getSelectedPayment();
    });
  }

  if (cartIcon)     cartIcon.addEventListener("click", openCart);
  if (cartClose)    cartClose.addEventListener("click", closeCart);
  if (cartClear)    cartClear.addEventListener("click", clearCart);
  if (checkoutBtn)  checkoutBtn.addEventListener("click", finalizarPedido);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && body.classList.contains("cart-open")) closeCart();
  });

  // Estado inicial do carrinho
  atualizarCarrinho();

  // --- Formulário de contato ---
  var form   = document.querySelector(".form");
  var status = document.getElementById("form-status");

  if (form && status) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome  = form.nome.value.trim();
      var email = form.email.value.trim();

      if (!nome || !email) {
        status.textContent = "⚠ Preencha nome e e-mail.";
        status.className   = "form-status erro";
        return;
      }
      if (!/^[^\@\s]+@[^\@\s]+\.[^\@\s]+$/.test(email)) {
        status.textContent = "⚠ E-mail inválido.";
        status.className   = "form-status erro";
        return;
      }

      status.textContent = "✓ Mensagem enviada! Entraremos em contato em breve.";
      status.className   = "form-status ok";
      form.reset();
    });
  }

})();
