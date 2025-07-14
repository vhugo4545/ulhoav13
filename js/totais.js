// Utilitário para gerar slugs (IDs válidos)
function slugify(text) {
  return text
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-").replace(/[^\w-]/g, "").toLowerCase();
}

// Calcula valores financeiros a partir dos dados do bloco
function calcularValoresFinanceirosDiretoDaTabela(blocoId) {
   
   
   
  const bloco = document.getElementById(blocoId);
  if (!bloco) return null;

  const buscarValorDoInput = (nome) => {
    const input = bloco.querySelector(`input[name='${nome}']`);
    if (!input) return 0;
    const valor = input.value.trim().replace(',', '.').replace('%', '').replace('R$', '');
    return parseFloat(valor) / 100 || 0;
  };

  const impostos = buscarValorDoInput("impostos");
  const margemLucro = buscarValorDoInput("margem_lucro");
  const gastosTotais = buscarValorDoInput("gasto_operacional");
  const negociacao = buscarValorDoInput("margem_negociacao");
  const miudezas = buscarValorDoInput("miudezas");
  const comissaoArquiteta = buscarValorDoInput("comissao_arquiteta");
  const margemSeguranca = buscarValorDoInput("margem_seguranca");

  const tabela = bloco.querySelector("table");
  if (!tabela) return null;

  let materialBase = 0;
  tabela.querySelectorAll("tbody tr").forEach(linha => {
    const valorStr = linha.querySelector(".custo-unitario")?.textContent?.replace("R$", "").replace(",", ".");
    const valor = parseFloat(valorStr || 0);
    materialBase += valor;
  });

  const custoMaterial = materialBase * (1 + miudezas);
  const divisor = 1 - (gastosTotais + margemLucro + impostos);
  if (divisor <= 0) return null;

  const precoMinimo = (custoMaterial / divisor) * (1 + comissaoArquiteta + margemSeguranca);
  const precoSugerido = precoMinimo * (1 + negociacao);
  const campoVAlorSegurancaDesperdicio = precoMinimo - precoMinimo / (1 + comissaoArquiteta + margemSeguranca);
  const campoValorGastosOperacionais = (precoMinimo - campoVAlorSegurancaDesperdicio) * gastosTotais;
  const campoValorImpostos = impostos * precoMinimo;
  const somaValores = campoValorImpostos + custoMaterial + campoValorGastosOperacionais;
  const campoValorMargemLucro = (precoMinimo - somaValores) - campoVAlorSegurancaDesperdicio;
  const campoValorMiudezas = custoMaterial - custoMaterial / (1 + miudezas);
  const campoNegociacao = precoSugerido - precoMinimo;

  return {
    campoValorGastosOperacionais,
    campoValorMargemLucro,
    campoValorImpostos,
    campoValorMinimo: precoMinimo,
    campoVAlorSegurancaDesperdicio,
    campoValorMiudezas,
    campoNegociacao,
    campoValorFinal: precoSugerido
  };
}

// Soma listas de valores por campo
function somarValores(lista) {
  const total = {
    campoValorGastosOperacionais: 0,
    campoValorMargemLucro: 0,
    campoValorImpostos: 0,
    campoValorMinimo: 0,
    campoVAlorSegurancaDesperdicio: 0,
    campoValorMiudezas: 0,
    campoNegociacao: 0,
    campoValorFinal: 0
  };
  lista.forEach(v => {
    for (const chave in total) {
      total[chave] += v[chave] || 0;
    }
  });
  return total;
}

// Gera HTML do totalizador por ambiente
function gerarHtmlTotalizador(nomeAmbiente, valores) {
    
  return `
    <div class="row text-center gx-4 gy-3">
      <div class="col"><div class="text-muted small">Gastos Operacionais</div><div class="fw-bold">R$ ${valores.campoValorGastosOperacionais.toFixed(2)}</div></div>
      <div class="col"><div class="text-muted small">Margem de Lucro</div><div class="fw-bold">R$ ${valores.campoValorMargemLucro.toFixed(2)}</div></div>
      <div class="col"><div class="text-muted small">Impostos</div><div class="fw-bold">R$ ${valores.campoValorImpostos.toFixed(2)}</div></div>
      <div class="col"><div class="text-muted small">Valor Mínimo</div><div class="fw-bold">R$ ${valores.campoValorMinimo.toFixed(2)}</div></div>
      <div class="col"><div class="text-muted small">Margem + Comissão</div><div class="fw-bold">R$ ${valores.campoVAlorSegurancaDesperdicio.toFixed(2)}</div></div>
      <div class="col"><div class="text-muted small">Miudezas</div><div class="fw-bold">R$ ${valores.campoValorMiudezas.toFixed(2)}</div></div>
      <div class="col"><div class="text-muted small">Valor Sugerido</div><div class="fw-bold">R$ ${valores.campoValorFinal.toFixed(2)}</div></div>
    </div>
  `;
}

function adicionarTotalizadoresPorAmbienteComAgrupamento() {
  const blocos = document.querySelectorAll("[id^='bloco-']");
  const mapaAmbientes = {};

  blocos.forEach(bloco => {
    const blocoId = bloco.id;
    const valores = calcularValoresFinanceirosDiretoDaTabela(blocoId);
    if (!valores) return;

    const inputAmbiente = document.querySelector(`input[placeholder='Ambiente'][data-id-grupo='${blocoId}']`);
    const nomeAmbiente = inputAmbiente?.value?.trim() || "Ambiente não identificado";

    if (!mapaAmbientes[nomeAmbiente]) mapaAmbientes[nomeAmbiente] = [];
    mapaAmbientes[nomeAmbiente].push(valores);

    bloco.querySelectorAll(".resumo-totalizador").forEach(el => el.remove());
    const div = document.createElement("div");
    div.className = "resumo-totalizador mt-4 p-4 border-top";
    div.innerHTML = gerarHtmlTotalizador(nomeAmbiente, valores);
    bloco.appendChild(div);
  });

  document.querySelectorAll("#totalizadoresExternosPorAmbiente")?.forEach(e => e.remove());

  const containerResumo = document.createElement("div");
  containerResumo.id = "totalizadoresExternosPorAmbiente";
  containerResumo.className = "mt-5";
  containerResumo.innerHTML = `<h4 class="mb-4">Totais Consolidados por Ambiente</h4>`;

  let totalPedidoFinal = 0;
  const checkboxes = {};

  for (const ambiente in mapaAmbientes) {
    const ambienteId = slugify(ambiente);
    const valores = somarValores(mapaAmbientes[ambiente]);

    const divResumo = document.createElement("div");
    divResumo.className = "resumo-totalizador mb-4 p-4 border rounded bg-light";
    divResumo.innerHTML = `
      <div class="form-check mb-3">
        <input class="form-check-input ambiente-toggle" type="checkbox" id="toggle-${ambienteId}" checked data-ambiente="${ambienteId}">
        <label class="form-check-label fw-semibold" for="toggle-${ambienteId}">Incluir "${ambiente}" no valor final</label>
      </div>
      ${gerarHtmlTotalizador(ambiente, valores)}
    `;
    containerResumo.appendChild(divResumo);
    checkboxes[ambienteId] = valores;
    
  }

  const inputDesconto = document.createElement("input");
  inputDesconto.type = "text";
  inputDesconto.className = "form-control w-auto mx-auto mb-3 text-center";
  inputDesconto.placeholder = "Desconto (R$ ou %)";
  inputDesconto.id = "campoDescontoFinal";
  inputDesconto.value = "";
  containerResumo.appendChild(inputDesconto);

  // valor inicial + evento no final
const calcularTotalFinal = () => {
  atualizarValoresDasParcelas();
  let total = 0;

  for (const checkbox of containerResumo.querySelectorAll(".ambiente-toggle")) {
    if (checkbox.checked) {
      const ambienteId = checkbox.dataset.ambiente;
      total += checkboxes[ambienteId]?.campoValorFinal || 0;
    }
  }

  const desconto = inputDesconto.value.trim();

  if (desconto.endsWith("%")) {
    const percentual = parseFloat(desconto.replace("%", "").replace(",", ".")) / 100;
    total -= total * percentual;
  } else {
    const valor = parseFloat(desconto.replace("R$", "").replace(",", ".").replace(/\s/g, ""));
    if (!isNaN(valor)) {
      total -= valor;
    }
  }

  finalValor.innerHTML = `R$ ${total.toFixed(2)}`;
};


  const final = document.createElement("div");
  final.className = "bg-white border border-2 rounded p-4 mb-5 text-center";
  final.innerHTML = `
    <h5 class="fw-bold mb-3">Valor Final do Pedido</h5>
    <div class="fs-4 fw-bold text-success" id="valorFinalTotal">R$ 0,00</div>
  `;
  const finalValor = final.querySelector("#valorFinalTotal");

  containerResumo.appendChild(final);

  document.querySelector("#novoOrcamentoForm")?.appendChild(containerResumo);

  inputDesconto.addEventListener("input", calcularTotalFinal);
   
  containerResumo.querySelectorAll(".ambiente-toggle").forEach(cb => {
    cb.addEventListener("change", calcularTotalFinal);
  });
  calcularTotalFinal();

}

function monitorarMudancasAmbientes() {
  document.addEventListener("input", (e) => {
    if (e.target.matches("input[placeholder='Ambiente'][data-id-grupo]")) {
      setTimeout(() => adicionarTotalizadoresPorAmbienteComAgrupamento(), 300);
      
    }
  });
}


function atualizarValoresDasParcelas() {
  setTimeout(() => {
    const textoTotal = document.querySelector("#valorFinalTotal")?.textContent?.trim() || "R$ 0.00";

    // ✅ Remove apenas "R$" e espaços
    const valorLimpo = textoTotal.replace("R$", "").trim();
    const total = parseFloat(valorLimpo) || 0;

    const linhas = document.querySelectorAll("#listaParcelas .row");
    const totalParcelasSpan = document.getElementById("totalParcelas");

    if (linhas.length === 0) {
      if (totalParcelasSpan) totalParcelasSpan.textContent = "R$ 0.00";
      return;
    }

    const valorPorParcela = total / linhas.length;
    let soma = 0;

    linhas.forEach((linha) => {
      const inputValor = linha.querySelector(".valor-parcela");
      if (!inputValor) return;

      const valor = parseFloat(valorPorParcela.toFixed(2));
      soma += valor;

      // Mantém formato com ponto decimal
      inputValor.value = `R$ ${valor.toFixed(2)}`;
      inputValor.setAttribute("data-percentual", ((valor / total) * 100).toFixed(2));
    });

    // Atualiza total das parcelas
    if (totalParcelasSpan) {
      totalParcelasSpan.textContent = `R$ ${soma.toFixed(2)}`;
    }
  }, 500);
}



document.addEventListener("DOMContentLoaded", () => {
  adicionarTotalizadoresPorAmbienteComAgrupamento();
  monitorarMudancasAmbientes();

});
