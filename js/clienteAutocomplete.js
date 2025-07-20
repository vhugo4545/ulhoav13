// clienteAutocomplete.js

let listaCompletaClientes = [];

/**
 * Busca a lista de clientes apenas uma vez.
 */

async function carregarClientes() {
  if (listaCompletaClientes.length > 0) {
    return listaCompletaClientes.filter(cliente => cliente.inativo === "N");
  }

  try {
    const resposta = await fetch("https://ulhoa-0a02024d350a.herokuapp.com/clientes/visualizar");
    const dados = await resposta.json();
    if (!Array.isArray(dados)) throw new Error("Resposta inválida");

    listaCompletaClientes = dados;

    const ativos = dados.filter(cliente => cliente.inativo === "N");
    console.log(`✅ ${ativos.length} clientes ativos carregados.`);
    return ativos;
  } catch (error) {
    console.error("❌ Erro ao buscar clientes:", error);
    return [];
  }
}


/**
 * Aplica o autocomplete a um campo de cliente dentro do container fornecido.
 */
async function aplicarAutocompleteCliente(container) {
  const input = container.querySelector(".razaoSocial");
  const codigoInput = container.querySelector(".codigoCliente");
  const cpfInput = container.querySelector(".cpfCnpj");
  const telefoneInput = container.querySelector(".telefoneCliente");

  let sugestoes = container.querySelector(".sugestoesCliente");

  if (!input || !codigoInput) {
    console.warn("⚠️ Campos obrigatórios de autocomplete não encontrados.");
    return;
  }

  // Cria a lista de sugestões se ainda não existir
  if (!sugestoes) {
    sugestoes = document.createElement("ul");
    sugestoes.className = "list-group sugestoesCliente position-absolute w-100 zindex-dropdown";
    sugestoes.style.display = "none";
    sugestoes.style.maxHeight = "200px";
    sugestoes.style.overflowY = "auto";
    input.parentElement.appendChild(sugestoes);
  }

  // Garante que os dados estejam carregados antes de ativar
  const clientesAtivos = await carregarClientes();

  // Função para filtrar e mostrar sugestões
  function mostrarSugestoes(termo) {
    const resultados = clientesAtivos.filter(c =>
      (c.nome_fantasia || "").toLowerCase().includes(termo.toLowerCase()) ||
      (c.razao_social || "").toLowerCase().includes(termo.toLowerCase())
    );

    sugestoes.innerHTML = "";

    resultados.forEach(cliente => {
      const item = document.createElement("li");
      item.className = "list-group-item list-group-item-action";
      item.textContent = cliente.nome_fantasia || cliente.razao_social;
      item.dataset.nome = cliente.nome_fantasia || cliente.razao_social;
      item.dataset.codigo = cliente.codigo_cliente_omie || "";
      item.dataset.cpfcnpj = cliente.cnpj_cpf || "";
      item.dataset.telefone = cliente.telefone1_numero || "";

      item.addEventListener("click", () => {
        input.value = item.dataset.nome;
        codigoInput.value = item.dataset.codigo;
        if (cpfInput) cpfInput.value = item.dataset.cpfcnpj;
        if (telefoneInput) telefoneInput.value = item.dataset.telefone;
        sugestoes.style.display = "none";
        input.dispatchEvent(new Event("input")); // Dispara para permitir novo filtro
        console.log(`✅ Cliente selecionado: ${item.dataset.nome}`);
      });

      sugestoes.appendChild(item);
    });

    sugestoes.style.display = resultados.length ? "block" : "none";
  }

  // Evento de digitação
  input.addEventListener("input", () => {
    const termo = input.value.trim();
    if (termo.length === 0) {
      sugestoes.innerHTML = "";
      sugestoes.style.display = "none";
      return;
    }
    mostrarSugestoes(termo);
  });

  // Reexibe sugestões ao focar, se já houver texto
  input.addEventListener("focus", () => {
    const termo = input.value.trim();
    if (termo.length >= 1) mostrarSugestoes(termo);
  });

  // Oculta sugestões ao clicar fora
  document.addEventListener("click", (e) => {
    if (!container.contains(e.target)) {
      sugestoes.style.display = "none";
    }
  });
}

/**
 * Adiciona um novo bloco de cliente relacionado ao formulário.
 */
function adicionarClienteRelacionado() {
  const wrapper = document.getElementById("clientesWrapper");
  if (!wrapper) {
    console.warn("⚠️ Wrapper de clientes não encontrado.");
    return;
  }

  const clienteBase = wrapper.querySelector(".cliente-item");
  if (!clienteBase) {
    console.warn("⚠️ Cliente base não encontrado para clonagem.");
    return;
  }

  // Clona o bloco .cliente-item completo
  const novo = clienteBase.cloneNode(true);

  // Limpa os valores dos campos de input
  novo.querySelectorAll("input").forEach(input => input.value = "");

  // Remove botão de incluir cliente (popup) se existir
  const botaoMais = novo.querySelector("button[onclick='abrirPopupIncluirCliente()']");
 

  // Remove sugestão de autocomplete duplicada, se houver
  const sugestoesAntigas = novo.querySelector(".sugestoesCliente");
  if (sugestoesAntigas) sugestoesAntigas.remove();

  // Recria a lista de sugestões vazia
  const novaLista = document.createElement("ul");
  novaLista.className = "sugestoesCliente list-group position-absolute w-100 shadow bg-white";
  novaLista.style.zIndex = "10";
  novaLista.style.maxHeight = "200px";
  novaLista.style.overflowY = "auto";
  novaLista.style.display = "none";

  // Reinsere a lista de sugestões abaixo do input de Razão Social
  const inputRazaoSocial = novo.querySelector(".razaoSocial");
  if (inputRazaoSocial) {
    inputRazaoSocial.insertAdjacentElement("afterend", novaLista);
  }

  // Reaplica autocomplete ao novo bloco
  aplicarAutocompleteCliente(novo);

  // Insere uma linha separadora visual
  wrapper.appendChild(document.createElement("hr"));

  // Adiciona o novo bloco ao wrapper
  wrapper.appendChild(novo);

  console.log("➕ Cliente relacionado adicionado.");
}



// Inicializa o autocomplete no cliente principal ao carregar a página
document.addEventListener("DOMContentLoaded", async () => {
  const primeiro = document.querySelector(".cliente-item");
  if (primeiro) {
    await aplicarAutocompleteCliente(primeiro);
    console.log("✅ Autocomplete de cliente inicial aplicado.");
  } else {
    console.warn("⚠️ Nenhum cliente inicial encontrado.");
  }
});
