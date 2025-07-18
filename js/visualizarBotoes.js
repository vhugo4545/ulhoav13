async function controlarBotoesSidebar() {
  const tipoUsuario = localStorage.getItem("usuarioTipo") || "usuario";
  const paginaAtual = window.location.pathname.split("/").pop();

  const botoes = {
    criar: document.getElementById("btn-criar"),
    editarModelo: document.getElementById("btn-editar-modelo"),
    atualizar: document.getElementById("btn-atualizar"),
    solicitar: document.getElementById("btn-solicitar"),
    autorizar: document.getElementById("btn-autorizar"),
    enviarCliente: document.getElementById("btn-enviar-cliente"),
    aprovadoCliente: document.getElementById("btn-aprovado-cliente"),
    gerarPedido: document.getElementById("btn-gerar-pedido"),
    atualizarPrecos: document.getElementById("btn-atualizar-precos"),
    auditar: document.getElementById("btn-auditar-valores")
  };


  function esconderTodos() {
    Object.values(botoes).forEach(btn => btn && (btn.style.display = "none"));
  }

  esconderTodos();

  // 📝 Página de criação
  if (paginaAtual === "criar.html" || paginaAtual === "criarPropostaV2.html") {
    if (botoes.criar) botoes.criar.style.display = "block";
    return;
  }

  // 🔄 Carrega proposta se não estiver em window
  if (!window.proposta) {
    const id = new URLSearchParams(location.search).get("id");
    if (!id) return;

    try {
      const resposta = await fetch(`https://ulhoa-0a02024d350a.herokuapp.com/api/propostas/${id}`);
      const dados = await resposta.json();
      window.proposta = dados;
    } catch (erro) {
      console.error("❌ Erro ao carregar proposta:", erro);
      return;
    }
  }

  const status = window.proposta?.statusOrcamento || "";

  // 👑 Admin na página de edição: mostra todos os botões
  if (tipoUsuario === "admin" && paginaAtual === "editar.html") {
    Object.values(botoes).forEach(btn => btn && (btn.style.display = "block"));
    return;
  }

  // 👑 Admin fora da edição: mostra auditar
  if (tipoUsuario === "admin") {
    if (botoes.auditar) botoes.auditar.style.display = "block";
  }

  // 🧾 Usuário padrão com status específico
  if (paginaAtual === "editar.html") {
    if (status === "Orçamento Iniciado" || status === "Pendente de aprovação") {
      if (botoes.editar) botoes.editar.style.display = "block";
      if (botoes.solicitar) botoes.solicitar.style.display = "block";
      return;
    }

    if (status === "Aprovado Pelo Gestor" && tipoUsuario === "usuario") {
      if (botoes.editar) botoes.editar.style.display = "block";
      if (botoes.enviar) botoes.enviar.style.display = "block";
      return;
    }

    if (botoes.editar) botoes.editar.style.display = "block";
    return;
  }

  if (status === "Orçamento Iniciado") {
    if (botoes.editar) botoes.editar.style.display = "block";
    if (botoes.solicitar) botoes.solicitar.style.display = "block";
    return;
  }
}

document.addEventListener("DOMContentLoaded", controlarBotoesSidebar);
