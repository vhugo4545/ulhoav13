// formularioOrcamento.js

async function carregarVendedores() {
  const TOKEN = localStorage.getItem('accessToken');

  try {
    const response = await fetch('https://ulhoa-0a02024d350a.herokuapp.com/omie/vendedores', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
    });

    if (!response.ok) throw new Error('Erro ao buscar vendedores');

    const vendedores = await response.json(); // contém { cadastro: [...] }

    const select = document.getElementById('vendedorResponsavel');
    if (!select) {
      console.warn('⚠️ Elemento #vendedorResponsavel não encontrado no DOM.');
      return;
    }

    select.innerHTML = '<option value="">Selecione</option>';

    (vendedores.cadastro || []).forEach(v => {
      const nomeMaiusculo = v.nome.toUpperCase();
      const opt = new Option(nomeMaiusculo, nomeMaiusculo); // nome como texto e valor
      select.appendChild(opt);
    });

    console.log(
      `%c✅ ${vendedores.cadastro?.length || 0} vendedores carregados com sucesso.`,
      'color: green; font-weight: bold;'
    );

  } catch (err) {
    console.error('❌ Erro ao carregar vendedores:', err);
  }
}


// Chame após o DOM estar carregado
document.addEventListener("DOMContentLoaded", carregarVendedores);


// Adiciona uma nova parcela com suporte a % e R$
function adicionarParcela() {
  
  const lista = document.getElementById("listaParcelas");

  const div = document.createElement("div");
  div.className = "row g-2 align-items-end mb-2";

  div.innerHTML = `
 <div class="col-3 col-lg-2">
    <label class="form-label mb-0">Tipo Monetário</label>
    <select class="form-select tipo-monetario" id="selectTipoMonetario">
      <option value="" disabled selected>Selecione…</option>
      <option value="PIX">Pix</option>
      <option value="DIN">Dinheiro</option>
      <option value="CRCP">Cartão Parcelado</option>
      <option value="CRC">Cartão de Crédito</option>
      <option value="CRD">Cartão de Débito</option>
      <option value="BOLR">Boleto Recorrente</option>
      <option value="BOLV">Boleto à Vista</option>
      <option value="PER">Permuta</option>
    </select>
  </div>

    

    <div class="col-4 col-lg-3">
      <label class="form-label mb-0">Condição de Pagto</label>
      <div class="condicao-wrapper">
        <select class="form-select condicao-pagto" onchange="verificarCondicaoPersonalizada(this)">
          <option value="" disabled selected>Selecione…</option>
          <option value="avista">3 dias após finalizar instalação completa.</option>
          <option value="na-retirada">3 dias após finalizar instalação da estrutura.</option>
          <option value="30-dias">3 dias após finalizar instalação dos vidros.</option>
          <option value="entrada+30">Na retirada/entrega do produto.</option>
          <option value="personalizado">Personalizado</option>
        </select>
      </div>
    </div>

    <div class="col-3 col-lg-2">
      <label class="form-label mb-0">Valor</label>
      <input type="text" class="form-control valor-parcela" placeholder="Ex: 1000 ou 30%">
    </div>

    <div class="col-2 col-lg-3">
      <label class="form-label mb-0">Vencimento</label>
      <input type="date" class="form-control data-parcela">
    </div>

    <div class="col-12 col-lg-2">
      <button type="button" class="btn btn-outline-danger w-100" onclick="this.closest('.row').remove(); atualizarValoresParcelas()">
        Remover
      </button>
    </div>
  `;

  lista.appendChild(div);
  setTimeout(() => aplicarEventosParcela(div), 200);
}


function aplicarEventosParcela(div) {
  const input = div.querySelector(".valor-parcela");

  input.addEventListener("focus", () => {
    const valorAtual = input.dataset.percentual;
    if (valorAtual) input.value = valorAtual + "%";
  });

  input.addEventListener("blur", () => {
    const raw = input.value.trim();
    const totalGrupos = calcularTotalDosGrupos();
    const parcelasAtuais = document.querySelectorAll(".valor-parcela");
    const index = [...parcelasAtuais].indexOf(input);
    const totalParcelas = parcelasAtuais.length;

    if (!raw || totalGrupos <= 0 || totalParcelas <= 0) return;

    let valorNumerico = 0;

    if (raw.includes("%")) {
      const percentual = parseFloat(raw.replace("%", "").replace(",", ".")) || 0;
      if (percentual > 100) return;
      valorNumerico = (percentual / 100) * totalGrupos;
      input.dataset.percentual = percentual;
      input.value = `R$ ${valorNumerico.toFixed(2).replace(".", ",")}`;
    } else {
      valorNumerico = parseFloat(raw.replace("R$", "").replace(/\./g, "").replace(",", ".")) || 0;
      delete input.dataset.percentual;
    }
  });
}


function recalcularParcelasComPercentual() {
  const totalGrupos = calcularTotalDosGrupos();
  const linhas = document.querySelectorAll("#listaParcelas .row");

  linhas.forEach(linha => {
    const input = linha.querySelector(".valor-parcela");
    const percentual = parseFloat(input.dataset.percentual);
    if (!isNaN(percentual)) {
      const novoValor = (percentual / 100) * totalGrupos;
      input.value = `R$ ${novoValor.toFixed(2).replace(".", ",")}`;
    }
  });
}


function calcularTotalDosGrupos() {
  const texto = document.querySelector("#valorFinalTotal").textContent.trim();

  // Remove "R$" e espaços extras
  const valorLimpo = texto.replace("R$", "").trim();

  // Converte direto para número com parseFloat (mantém ponto decimal)
  const numero = parseFloat(valorLimpo);

  return isNaN(numero) ? 0 : numero;
}


function validarSomatorioParcelas() {
  const totalGrupos = calcularTotalDosGrupos();
  let soma = 0;
  const parcelas = document.querySelectorAll(".valor-parcela");

  parcelas.forEach(input => {
    let valor = 0;
    const raw = input.value.trim();

    if (raw.includes("%")) {
      const percentual = parseFloat(raw.replace("%", "").replace(",", ".")) || 0;
      valor = (percentual / 100) * totalGrupos;
    } else {
      valor = parseFloat(raw.replace("R$", "").replace(/\./g, "").replace(",", ".")) || 0;
    }

    soma += valor;
  });

  return Math.abs(soma - totalGrupos) < 1;
}



/* ─────────────── HELPERS ─────────────── */

function verificarCondicaoPersonalizada(select) {
  if (select.value === "personalizado") {
    const wrapper = select.parentElement;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "form-control condicao-pagto";
    input.placeholder = "Descreva a condição de pagamento...";
    input.value = "Personalizado – ";

    wrapper.innerHTML = "";
    wrapper.appendChild(input);
  }
}

/* troca o placeholder quando muda de Valor ↔ Percentual */
function atualizarPlaceholder(selectEl) {
  const input = selectEl.closest(".row").querySelector(".valor-parcela");
  input.placeholder = selectEl.value === "percentual" ? "% 0,00" : "R$ 0,00";
}

/* soma de todos os .formula-result (valor total dos produtos) */
function valorTotalProdutos() {
  return Array.from(document.querySelectorAll(".formula-result")).reduce((total, el) => {
    const num = parseFloat(el.textContent.replace(/\./g, "").replace(",", ".")) || 0;
    return total + num;
  }, 0);
}

/* recalcula automaticamente cada parcela e mostra o total */
function atualizarValoresParcelas() {
  const totalProdutos = valorTotalProdutos();
  let totalParcelas   = 0;

  document.querySelectorAll("#listaParcelas .row").forEach(row => {
    const tipo   = row.querySelector(".tipo-parcela").value;
    const entrada = row.querySelector(".valor-parcela").value.trim();

    /* normaliza separador decimal */
    const num = parseFloat(entrada.replace(/\./g, "").replace(",", ".")) || 0;

    const valorCalculado = tipo === "percentual"
      ? (totalProdutos * num / 100)        // % do total
      : num;                               // valor direto

    /* armazena para eventual uso em salvamento */
    row.dataset.valorFinal = valorCalculado.toFixed(2);

    totalParcelas += valorCalculado;
  });

  /* exibe a soma em R$ */
  document.getElementById("totalParcelas").textContent =
    totalParcelas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/* se o total dos produtos mudar em outro ponto do sistema,
   chame simplesmente atualizarValoresParcelas() para recálculo */


function obterDadosFormularioOrcamento() {
  const getValue = (id) => document.getElementById(id)?.value || "-";

  const dados = {
    numero: getValue("numeroOrcamento"),
    data: getValue("dataOrcamento"),
    origem: getValue("origemCliente"),
    nomeOrigem: getValue("nomeOrigem"),
    codigoOrigem: getValue("codigoOrigem"),
    telefoneOrigem: getValue("telefoneOrigem"),
    emailOrigem: getValue("emailOrigem"),
    comissao: getValue("comissaoArquiteto"),
    condicao: getValue("condicaoPagamento"),
    prazos: getValue("prazosArea"),
    condicoesGerais: getValue("condicoesGerais"),
    operador: getValue("operadorInterno"),
    vendedor: document.getElementById("vendedorResponsavel")?.selectedOptions[0]?.textContent || "-"
  };

  const clienteWrapper = document.querySelector(".cliente-item");
  dados.nomeCliente = clienteWrapper?.querySelector(".razaoSocial")?.value || "-";
  dados.cpfCnpj = clienteWrapper?.querySelector(".cpfCnpj")?.value || "-";
  dados.telefoneCliente = clienteWrapper?.querySelector(".telefone")?.value || "-";
  dados.emailCliente = clienteWrapper?.querySelector(".email")?.value || "-";

  const endereco = {
    cep: getValue("cep"),
    rua: getValue("rua"),
    numero: getValue("numeroEndereco"),
    bairro: getValue("bairro"),
    cidade: getValue("cidade"),
    estado: getValue("estado")
  };

  dados.enderecoObra = endereco;

  console.log("%c📄 Dados do formulário de orçamento:", "color: navy; font-weight: bold");

  return dados;
}

// Atribui ao botão de salvar se existir
window.addEventListener("DOMContentLoaded", () => {
  const btnSalvar = document.getElementById("save-proposal");
  if (btnSalvar) {
    btnSalvar.addEventListener("click", () => {
      obterDadosFormularioOrcamento();
    });
    console.log("%c✅ Evento de salvar proposta ativado.", "color: green");
  } else {
    console.warn("⚠️ Botão 'save-proposal' não encontrado.");
  }
});

 function preencherOperadorInterno() {
    const nomeSalvo = localStorage.getItem("nomeUsuario");
    if (!nomeSalvo) return;                        // nada salvo ➜ sai

    const campoOperador = document.getElementById("operadorInterno");
    if (campoOperador) campoOperador.value = nomeSalvo;
  }
function preencherDataOrcamentoSeVazio() {
  const input = document.getElementById("dataOrcamento");
  if (!input) {
    console.warn("#dataOrcamento não encontrado.");
    return;
  }

  if (!input.value) {
    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
    const dd = String(hoje.getDate()).padStart(2, '0');
    input.value = `${yyyy}-${mm}-${dd}`;
  }
}
preencherDataOrcamentoSeVazio()
   // Executa assim que o DOM estiver pronto
  document.addEventListener("DOMContentLoaded", preencherOperadorInterno);