function preencherValoresFinanceiros(blocoId) {

  const bloco = document.getElementById(blocoId);
 atualizarValoresDasParcelas()
  if (!bloco) {
    console.warn(`Bloco ${blocoId} não encontrado.`);
    return;
  }

  const inputs = bloco.querySelectorAll('input[name]');
  const dados = {};

  // Coletar valores dos inputs
  inputs.forEach(input => {
    const nome = input.name;
    const valor = input.value.trim().replace(',', '.').replace('R$', '');
    dados[nome] = parseFloat(valor) || 0;
  });

  // Extrair percentuais
  const impostos = dados.impostos / 100;
  const margemLucro = dados.margem_lucro / 100;
  const gastosTotais = dados.gasto_operacional / 100;
  const negociacao = dados.margem_negociacao / 100;
  const miudezas = dados.miudezas / 100;
  const comissaoArquiteta = dados.comissao_arquiteta / 100;
  const margemSegunraca = dados.margem_seguranca / 100;

  
  // Obter total da tabela (soma da coluna "Valor de Custo Final")
  const tabela = bloco.querySelector("table");
  let materialBase = 0;
  tabela.querySelectorAll("tbody tr").forEach(linha => {
    const valorStr = linha.querySelector(".custo-unitario")?.textContent?.replace("R$", "").replace(",", ".");
    const valor = parseFloat(valorStr || 0);
    materialBase += valor;
  });


  // Custo total de material com miudezas
  const custoMaterial = materialBase * (1 + miudezas);

  const divisor = 1 - (gastosTotais + margemLucro + impostos);
  if (divisor <= 0) {
    console.error("❌ Erro: soma dos percentuais maior ou igual a 100%");
    return;
  }

  // Fórmula: custo de material / (1 - gastosTotais - margemLucro - impostos) * (1 + comissaoArquiteta)
  const precoMinimo = (custoMaterial / (1- gastosTotais -margemLucro - impostos )) * (1 + (comissaoArquiteta + margemSegunraca));
  const negociacao1 =  negociacao
  const precoSugerido = precoMinimo * (1 + negociacao1 );

  // Preencher os campos no HTML
  const inputMin = bloco.querySelector('input[name="precoMinimo"]');
  const inputSug = bloco.querySelector('input[name="precoSugerido"]');
  const inputCusto = bloco.querySelector('input[name="custoTotalMaterial"]');

  if (inputMin) inputMin.value = precoMinimo.toFixed(2);
  if (inputSug) inputSug.value = precoSugerido.toFixed(2);
  if (inputCusto) inputCusto.value = custoMaterial.toFixed(2);

  // Atualizar total no rodapé da tabela
  const totalRodape = bloco.querySelector('table tfoot td[colspan="6"] strong');
  if (totalRodape) totalRodape.textContent = `R$ ${precoSugerido.toFixed(2)}`;

  // Mostrar no console os valores detalhados
  const valorImpostos = precoMinimo * impostos;
  const valorMargem = precoMinimo * margemLucro;
  const valorGastos = precoMinimo * gastosTotais;
  const valorComissao = precoMinimo * comissaoArquiteta;
  const valorNegociacao = precoMinimo * negociacao;
  const valorMiudezas = materialBase * miudezas;

const campoVAlorSegunrnçaDesperdicio = precoMinimo - precoMinimo / (1 + comissaoArquiteta + margemSegunraca);
const campoValorGastosOperacionais = (precoMinimo-campoVAlorSegunrnçaDesperdicio)*(gastosTotais);

const campoValorPorcentagemImpostos = impostos;
const campoValorMinimo = precoMinimo;
const campoValorImpostos = impostos * precoMinimo;

const somaValotres = campoValorImpostos + custoMaterial + campoValorGastosOperacionais

const campoValorSeguranca = precoMinimo - precoMinimo / (1 + comissaoArquiteta + margemSegunraca);
const campoValorMargemLucro =  (campoValorMinimo-  somaValotres) - campoValorSeguranca ;
const campoValorMiudezas = custoMaterial - custoMaterial / (1 + miudezas);
const campoNegocia = precoSugerido - precoMinimo



adicionarBotaoResumoFinanceiro(blocoId)
adicionarTotalizadoresPorAmbienteComAgrupamento();

 }

 function calcularValoresFinanceiros(blocoId) {
  const bloco = document.getElementById(blocoId);
  if (!bloco) return null;

  // Tenta encontrar valores mesmo se não tiver input
  const buscarValor = (nome, padrao = 0) => {
    const input = bloco.querySelector(`input[name='${nome}']`);
    if (!input) return padrao;
    const valor = input.value.trim().replace(',', '.').replace('R$', '');
    return parseFloat(valor) || padrao;
  };

  // Busca os percentuais ou usa 0 como fallback
  const impostos = buscarValor("impostos") / 100;
  const margemLucro = buscarValor("margem_lucro") / 100;
  const gastosTotais = buscarValor("gasto_operacional") / 100;
  const negociacao = buscarValor("margem_negociacao") / 100;
  const miudezas = buscarValor("miudezas") / 100;
  const comissaoArquiteta = buscarValor("comissao_arquiteta") / 100;
  const margemSeguranca = buscarValor("margem_seguranca") / 100;

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
  if (divisor <= 0) {
    console.error("❌ Erro: soma dos percentuais maior ou igual a 100%");
    return null;
  }

  const precoMinimo = (custoMaterial / divisor) * (1 + comissaoArquiteta + margemSeguranca);
  const precoSugerido = precoMinimo * (1 + negociacao);

  const campoVAlorSegunrnçaDesperdicio = precoMinimo - precoMinimo / (1 + comissaoArquiteta + margemSeguranca);
  const campoValorGastosOperacionais = (precoMinimo - campoVAlorSegunrnçaDesperdicio) * gastosTotais;
  const campoValorImpostos = impostos * precoMinimo;
  const somaValores = campoValorImpostos + custoMaterial + campoValorGastosOperacionais;
  const campoValorMargemLucro = (precoMinimo - somaValores) - campoVAlorSegunrnçaDesperdicio;
  const campoValorMiudezas = custoMaterial - custoMaterial / (1 + miudezas);
  const campoNegocia = precoSugerido - precoMinimo;

  return {
    campoVAlorSegunrnçaDesperdicio,
    campoValorGastosOperacionais,
    campoValorImpostos,
    campoValorMinimo: precoMinimo,
    campoValorMargemLucro,
    campoValorMiudezas,
    campoNegocia
  };
}


function adicionarBotaoResumoFinanceiro(blocoId) {
  const bloco = document.getElementById(blocoId);
  if (!bloco) return;

  const botaoExistente = bloco.querySelector(".btn-detalhes-financeiros");
  if (botaoExistente) return;

  const botao = document.createElement("button");
  botao.className = "btn btn-outline-info btn-sm btn-detalhes-financeiros";
  botao.innerHTML = "📊 Ver Detalhes Financeiros";
  botao.style.marginTop = "8px";

  botao.addEventListener("click", () => {
    abrirPopupValoresFinanceiros(blocoId);
  });

  const destino = bloco.querySelector(".tab-pane") || bloco;
  destino.appendChild(botao);
}

function abrirPopupValoresFinanceiros(blocoId) {
  const valores = calcularValoresFinanceiros(blocoId);
  if (!valores) return;

  const html = `
    <div style="padding: 20px; font-size: 14px; max-width: 400px;">
      <h5 class="mb-3">Resumo Financeiro</h5>
      <ul class="list-group">
        <li class="list-group-item">💰 <strong>Valor Gastos Operacionais:</strong> R$ ${valores.campoValorGastosOperacionais.toFixed(2)}</li>
        <li class="list-group-item">📈 <strong>Margem de Lucro:</strong> R$ ${valores.campoValorMargemLucro.toFixed(2)}</li>
        <li class="list-group-item">🧾 <strong>Valor Impostos:</strong> R$ ${valores.campoValorImpostos.toFixed(2)}</li>
        <li class="list-group-item">💼 <strong>Valor Mínimo:</strong> R$ ${valores.campoValorMinimo.toFixed(2)}</li>
        <li class="list-group-item">🏗 <strong>Margem + Comissão Arquiteto:</strong> R$ ${valores.campoVAlorSegunrnçaDesperdicio.toFixed(2)}</li>
        <li class="list-group-item">📦 <strong>Miudezas:</strong> R$ ${valores.campoValorMiudezas.toFixed(2)}</li>
        <li class="list-group-item">📝 <strong>Valor Sugerido (Negociação):</strong> R$ ${valores.campoNegocia.toFixed(2)}</li>
      </ul>
      <div class="text-end mt-3">
        <button class="btn btn-sm btn-secondary" onclick="this.closest('.popup-financeiro').remove()">Fechar</button>
      </div>
    </div>
  `;

  const popup = document.createElement("div");
  popup.className = "popup-financeiro";
  popup.innerHTML = html;
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.backgroundColor = "#fff";
  popup.style.border = "1px solid #ccc";
  popup.style.borderRadius = "12px";
  popup.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
  popup.style.zIndex = 10000;

  document.body.appendChild(popup);
}


function exibirResumoFinanceiroConsole(blocoId) {
  const bloco = document.getElementById(blocoId);
  if (!bloco) return;

  const valoresCalculados = calcularValoresFinanceiros(blocoId);
  if (!valoresCalculados) return;

  console.log("Valor Gastos Operacionais:", valoresCalculados.campoValorGastosOperacionais.toFixed(2));
  console.log("Margem de Lucro:", valoresCalculados.campoValorMargemLucro.toFixed(2));
  console.log("Valor Impostos:", valoresCalculados.campoValorImpostos.toFixed(2));
  console.log("Valor Mínimo:", valoresCalculados.campoValorMinimo.toFixed(2));
  console.log("Valor Margem + comissão arquiteto:", valoresCalculados.campoVAlorSegunrnçaDesperdicio.toFixed(2));
  console.log("Miudezas:", valoresCalculados.campoValorMiudezas.toFixed(2));
  console.log("Valor sugerido:", valoresCalculados.campoNegocia.toFixed(2));
}

function calcularValoresFinanceiros(blocoId) {
  const bloco = document.getElementById(blocoId);
  if (!bloco) return null;

  const inputs = bloco.querySelectorAll('input[name]');
  const dados = {};
  inputs.forEach(input => {
    const nome = input.name;
    const valor = input.value.trim().replace(',', '.').replace('R$', '');
    dados[nome] = parseFloat(valor) || 0;
  });

  const impostos = dados.impostos / 100;
  const margemLucro = dados.margem_lucro / 100;
  const gastosTotais = dados.gasto_operacional / 100;
  const negociacao = dados.margem_negociacao / 100;
  const miudezas = dados.miudezas / 100;
  const comissaoArquiteta = dados.comissao_arquiteta / 100;
  const margemSegunraca = dados.margem_seguranca / 100;

  const tabela = bloco.querySelector("table");
  let materialBase = 0;
  tabela.querySelectorAll("tbody tr").forEach(linha => {
    const valorStr = linha.querySelector(".custo-unitario")?.textContent?.replace("R$", "").replace(",", ".");
    const valor = parseFloat(valorStr || 0);
    materialBase += valor;
  });

  const custoMaterial = materialBase * (1 + miudezas);
  const divisor = 1 - (gastosTotais + margemLucro + impostos);
  if (divisor <= 0) {
    console.error("❌ Erro: soma dos percentuais maior ou igual a 100%");
    return null;
  }

  const precoMinimo = (custoMaterial / divisor) * (1 + (comissaoArquiteta + margemSegunraca));
  const precoSugerido = precoMinimo * (1 + negociacao);

  const campoVAlorSegunrnçaDesperdicio = precoMinimo - precoMinimo / (1 + comissaoArquiteta + margemSegunraca);
  const campoValorGastosOperacionais = (precoMinimo - campoVAlorSegunrnçaDesperdicio) * gastosTotais;
  const campoValorPorcentagemImpostos = impostos;
  const campoValorMinimo = precoMinimo;
  const campoValorImpostos = impostos * precoMinimo;
  const somaValotres = campoValorImpostos + custoMaterial + campoValorGastosOperacionais;
  const campoValorSeguranca = precoMinimo - precoMinimo / (1 + comissaoArquiteta + margemSegunraca);
  const campoValorMargemLucro = (campoValorMinimo - somaValotres) - campoValorSeguranca;
  const campoValorMiudezas = custoMaterial - custoMaterial / (1 + miudezas);
  const campoNegocia = precoSugerido - precoMinimo;

  return {
    campoVAlorSegunrnçaDesperdicio,
    campoValorGastosOperacionais,
    campoValorPorcentagemImpostos,
    campoValorMinimo,
    campoValorImpostos,
    campoValorSeguranca,
    campoValorMargemLucro,
    campoValorMiudezas,
    campoNegocia
  };
}

function duplicarBlocoViaDOM(idOriginal) {
  const blocoOriginal = document.getElementById(idOriginal);
  if (!blocoOriginal) {
    console.warn(`❌ Bloco com ID ${idOriginal} não encontrado.`);
    return;
  }

  // Novo ID único
  const novoId = `bloco-${blocoIndex++}`;

  // Clonar DOM
  const novoBloco = blocoOriginal.cloneNode(true);
  novoBloco.id = novoId;

  // Atualiza todos os atributos de ID e referencias internas
  const htmlAtualizado = novoBloco.innerHTML.replaceAll(idOriginal, novoId);
  novoBloco.innerHTML = htmlAtualizado;

  // Atualiza atributos específicos que não são apenas IDs
  const elementos = novoBloco.querySelectorAll("*");
  elementos.forEach(el => {
    if (el.id?.includes(idOriginal)) el.id = el.id.replace(idOriginal, novoId);
    if (el.getAttribute("data-id-grupo") === idOriginal)
      el.setAttribute("data-id-grupo", novoId);

    if (el.getAttribute("onclick")?.includes(idOriginal))
      el.setAttribute("onclick", el.getAttribute("onclick").replaceAll(idOriginal, novoId));

    if (el.getAttribute("data-bs-target")?.includes(idOriginal))
      el.setAttribute("data-bs-target", el.getAttribute("data-bs-target").replaceAll(idOriginal, novoId));

    if (el.getAttribute("aria-controls")?.includes(idOriginal))
      el.setAttribute("aria-controls", el.getAttribute("aria-controls").replaceAll(idOriginal, novoId));

    if (el.getAttribute("data-bs-parent")?.includes(idOriginal))
      el.setAttribute("data-bs-parent", el.getAttribute("data-bs-parent").replaceAll(idOriginal, novoId));
  });

  // Copia valores dos inputs manualmente (evita inputs limpos pelo cloneNode)
  const inputsOriginais = blocoOriginal.querySelectorAll("input, select, textarea");
  const inputsDuplicados = novoBloco.querySelectorAll("input, select, textarea");

  inputsOriginais.forEach((inputOrig, index) => {
    const valor = inputOrig.value;
    const inputNovo = inputsDuplicados[index];
    if (inputNovo) inputNovo.value = valor;
  });

  // Adiciona bloco ao DOM
  const container = document.getElementById("blocosProdutosContainer");
  container.appendChild(novoBloco);

  // Reativa funcionalidades
  setTimeout(() => {
    if (typeof ativarRecalculoEmTodasTabelas === "function") ativarRecalculoEmTodasTabelas();
    if (typeof preencherValoresFinanceiros === "function") preencherValoresFinanceiros(novoId);
    if (typeof simularFocusEBlurEmTodosCamposFormula === "function") simularFocusEBlurEmTodosCamposFormula();
  }, 500);

  console.log(`✅ Bloco duplicado: ${idOriginal} → ${novoId}`);
}



window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".main-container").forEach(bloco => {
    adicionarBotaoResumoFinanceiro(bloco.id);
  });
});












// 🔁 Ativa o recálculo automático ao alterar qualquer input[name]
document.addEventListener('input', function (e) {
  const input = e.target;
  if (input.matches('input[name]')) {
    const bloco = input.closest('.main-container');
    if (bloco && bloco.id) {
      preencherValoresFinanceiros(bloco.id);
    }
  }
});

// Adiciona checkbox acima do textarea de resumo (só uma vez por grupo)
function inserirCheckboxResumo(idSuffix) {
  const textarea = document.getElementById(`resumo-${idSuffix}`);
  if (!textarea) return;

  if (!document.getElementById(`checkboxResumoManual-${idSuffix}`)) {
    const div = document.createElement("div");
    div.className = "mb-1";
    div.innerHTML = `
      <label class="form-check-label" style="font-size:0.93em">
        <input type="checkbox" class="form-check-input me-1" id="checkboxResumoManual-${idSuffix}">
        Editar manualmente
      </label>
    `;
    textarea.parentNode.insertBefore(div, textarea);

    // Ao focar ou desfocar, ativa modo manual
    textarea.addEventListener("focus", () => {
      document.getElementById(`checkboxResumoManual-${idSuffix}`).checked = true;
    });
    textarea.addEventListener("blur", () => {
      document.getElementById(`checkboxResumoManual-${idSuffix}`).checked = true;
    });
  }
}

// Função para atualizar resumo do grupo
function atualizarResumoDoGrupo(idSuffix) {
  inserirCheckboxResumo(idSuffix);

  const checkbox = document.getElementById(`checkboxResumoManual-${idSuffix}`);
  const textarea = document.getElementById(`resumo-${idSuffix}`);

  // Se não existe, não faz nada
  if (!textarea) return;

  // Se modo manual estiver ativado, não atualiza
  if (checkbox?.checked) {
    console.log("Resumo do grupo NÃO foi atualizado pois está em modo manual.");
    return;
  }

  // Atualiza automaticamente se não estiver em modo manual
  const tabela = document.querySelector(`#tabela-${idSuffix} tbody`);
  const linhas = tabela?.querySelectorAll("tr") || [];
  const alturaMontante = document.querySelector(`#collapse-${idSuffix} input[name='altura_montante']`)?.value || "";

  const primeiro = linhas[0]?.querySelector("td:nth-child(2)")?.textContent?.trim() || "";
  const segundo = linhas[1]?.querySelector("td:nth-child(2)")?.textContent?.trim() || "";

  const resumo = `${primeiro}\nem ${segundo}\nAltura do Montante: ${alturaMontante} m \nAltura Final:\nFixação:`;
  textarea.value = resumo;
  console.log("Resumo do grupo atualizado automaticamente (modo automático).");
}


// Pare aqui
function criarBlocoDeProposta(nomeGrupo = "", ambiente = "") {
  const idSuffix = `bloco-${blocoIndex++}`;
  const container = document.getElementById("blocosProdutosContainer");
  if (!container) {
    console.warn("❌ Container #blocosProdutosContainer não encontrado.");
    return idSuffix;
  }

  const estaEditandoModelo = window.location.pathname.includes("editarModelo.html");

  const parametros = [
    "miudezas", "gasto_operacional", "impostos", "margem_lucro",
    "margem_seguranca", "comissao_arquiteta", "margem_negociacao",
    "altura_montante", "numero_montantes", "numero_protecoes", "descricao"
  ];

  const camposFinanceiros = [
    { label: "Custo Total de Material", name: "custoTotalMaterial" },
    { label: "Preço Mínimo", name: "precoMinimo" },
    { label: "Preço Sugerido", name: "precoSugerido" }
  ];

  const bloco = document.createElement("div");
  bloco.className = "main-container position-relative mb-4";
  bloco.id = idSuffix;

  bloco.innerHTML = `
    <div class="accordion" id="accordion-${idSuffix}">
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading-${idSuffix}">
          <div class="d-flex align-items-center justify-content-between px-2 w-100">
            <button class="accordion-button collapsed flex-grow-1" type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapse-${idSuffix}"
              aria-expanded="false"
              aria-controls="collapse-${idSuffix}">
              <span id="titulo-accordion-${idSuffix}">
                ${nomeGrupo || `Grupo (${idSuffix})`}
              </span>
            </button>
            <div class="d-flex align-items-center gap-2 ms-4">
              <input type="text" class="form-control form-control-sm" placeholder="Ambiente"
                value="${ambiente || ""}" data-id-grupo="${idSuffix}" title="Digite o nome do ambiente"
                ${estaEditandoModelo ? 'style="display:none;"' : ''}>
              <button class="btn btn-outline-danger btn-sm" type="button" onclick="removerBloco('${idSuffix}')" title="Excluir grupo">Excluir</button>
              <button class="btn btn-outline-secondary btn-sm" type="button" onclick="duplicarBlocoViaDOM('${idSuffix}')" title="Duplicar grupo">Duplicar</button>
            </div>
          </div>
        </h2>
        <div id="collapse-${idSuffix}" class="accordion-collapse collapse" data-bs-parent="#accordion-${idSuffix}">
          <div class="accordion-body">
            <div class="row g-3">
              <div class="col-lg-4">
                <ul class="nav nav-tabs">
                  <li class="nav-item">
                    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#${idSuffix}-aba1">Parâmetros</button>
                  </li>
                  <li class="nav-item">
                    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#${idSuffix}-aba2">Valores R$</button>
                  </li>
                </ul>
                <div class="tab-content pt-3">
                  <div class="tab-pane fade show active" id="${idSuffix}-aba1">
                    <form class="row g-2">
                      ${parametros.map(param => `
                        <div class="col-6">
                          <label class="form-label">${param.replace(/_/g, ' ')}</label>
                          <input type="text" name="${param}" class="form-control form-control-sm"
                            ${(!estaEditandoModelo && !["altura_montante", "numero_montantes", "numero_protecoes", "descricao", "comissao_arquiteta", "margem_negociacao","margem_seguranca","margem_lucro"].includes(param))
                              ? "readonly style='background:#f3f3f3'" : ""}>
                        </div>
                      `).join("")}
                    </form>
                  </div>
                  <div class="tab-pane fade" id="${idSuffix}-aba2">
                    <form class="row g-2">
                      ${camposFinanceiros.map(campo => `
                        <div class="col-12">
                          <label class="form-label">${campo.label}</label>
                          <input type="text" name="${campo.name}" class="form-control form-control-sm"
                            ${!estaEditandoModelo ? "readonly style='background:#f3f3f3'" : ""}>
                        </div>
                      `).join("")}
                    </form>
                  </div>
                </div>
              </div>
              <div class="col-lg-8 grupo-tabela position-relative">
                <div class="input-group mb-3">
                  <input id="input-${idSuffix}" type="text" class="form-control form-control-sm"
                         placeholder="Pesquisar e incluir produto..."
                         oninput="mostrarSugestoes(this, '${idSuffix}')">
                  <button class="btn btn-primary btn-sm" type="button" onclick="incluirProduto('${idSuffix}')">Incluir</button>
                </div>
                <div id="sugestoes-${idSuffix}" class="tabela-sugestoes position-absolute bg-white shadow-sm" style="z-index:1000;"></div>
                <div class="table-responsive">
                  <table id="tabela-${idSuffix}" class="table table-sm table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th>Utilização</th>
                        <th>Descrição</th>
                        <th>Valor de Custo Final</th>
                        <th>Custo Unitário</th>
                        <th>Código Omie</th>
                        <th>Quantidade</th>
                        <th>Qtd. Desejada</th>
                        <th>Ação</th>
                      </tr>
                    </thead>
                    <tbody ondragover="event.preventDefault();" ondrop="handleDrop(event)"></tbody>
                    <tfoot>
                      <tr>
                        <td colspan="2"><strong>Total</strong></td>
                        <td colspan="6"><strong>R$ 0,00</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                  <div class="mt-3">
                 
                    <textarea id="resumo-${idSuffix}" class="form-control form-control-sm" rows="6" ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.appendChild(bloco);

  const tbody = bloco.querySelector("tbody");
  if (tbody) {
    const observer = new MutationObserver(() => atualizarResumoDoGrupo(idSuffix));
    observer.observe(tbody, { childList: true, subtree: true });

    // Drag-and-drop
    const dragObserver = new MutationObserver(() => {
      const linhas = tbody.querySelectorAll("tr");
      linhas.forEach(linha => {
        if (!linha.hasAttribute("draggable")) {
          linha.setAttribute("draggable", "true");
          linha.addEventListener("dragstart", () => linha.classList.add("dragging"));
          linha.addEventListener("dragend", () => {
            linha.classList.remove("dragging");
            atualizarResumoDoGrupo(idSuffix);
          });
        }
      });
    });
    dragObserver.observe(tbody, { childList: true, subtree: true });
  }

  // Altura montante reativa
  const inputAltura = bloco.querySelector(`input[name='altura_montante']`);
  if (inputAltura) {
    inputAltura.addEventListener("input", () => atualizarResumoDoGrupo(idSuffix));
  }

  setTimeout(() => {
    if (typeof ativarRecalculoEmTodasTabelas === "function") ativarRecalculoEmTodasTabelas();
    if (typeof preencherValoresFinanceiros === "function") preencherValoresFinanceiros(idSuffix);
    if (typeof simularFocusEBlurEmTodosCamposFormula === "function") simularFocusEBlurEmTodosCamposFormula();
    atualizarResumoDoGrupo(idSuffix); // primeira renderização
  }, 1000);

  if (window.location.pathname.includes("criar.html")) {
    setTimeout(() => {
      atualizarPrecosOmieNaDOM();
    //  ativarInputsDescricaoComDelay();
    }, 1000);
  }

  return idSuffix;
}


function ativarInputsDescricaoComDelay() {
  setTimeout(() => {
    const inputs = document.querySelectorAll('input[type="text"][name="descricao"].form-control.form-control-sm');

    inputs.forEach(input => {
      // Dispara eventos de input e change para "reativar" lógicas ligadas a eles
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));

      // Se quiser forçar algum valor, por exemplo, limpar ou reatribuir o mesmo texto:
      input.value = input.value; // Reatribui o próprio valor para forçar reatividade
    });

    console.log(`✅ ${inputs.length} inputs de descrição reativados após 1s`);
  }, 500);
}



// Função de drop que move as linhas
function handleDrop(event) {
  event.preventDefault();
  const dragged = document.querySelector(".dragging");
  const targetRow = event.target.closest("tr");
  if (!dragged || !targetRow || dragged === targetRow) return;

  const tbody = targetRow.closest("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const fromIndex = rows.indexOf(dragged);
  const toIndex = rows.indexOf(targetRow);

  if (fromIndex < toIndex) {
    targetRow.after(dragged);
  } else {
    targetRow.before(dragged);
  }
}



function ativarRecalculoEmTodasTabelas() {
  const tabelas = document.querySelectorAll("table[id^='tabela-bloco-']");
 

  tabelas.forEach((tabela, index) => {


    const atualizarLinha = (linha, tentativa = 0) => {
      const custoFinalCell = linha.querySelector(".custo-unitario");
      const custoUnitarioCell = linha.querySelector(".venda-unitaria");
      const inputQuantidade = linha.querySelector("input.quantidade");

      if (!custoFinalCell || !custoUnitarioCell || !inputQuantidade) {
        if (tentativa < 1) {
          console.warn("⚠️ Elemento ausente na linha. Tentando novamente em 2 segundos...", { custoFinalCell, custoUnitarioCell, inputQuantidade });
          setTimeout(() => atualizarLinha(linha, tentativa + 1), 2000);
        } else {
          console.error("❌ Elementos ainda ausentes após nova tentativa:", { custoFinalCell, custoUnitarioCell, inputQuantidade });
        }
        return;
      }

      const quantidade = parseFloat(inputQuantidade.value.replace(",", ".") || 1);
      const custoUnitario = parseFloat(

        custoUnitarioCell.textContent.replace("R$", "").replace(",", ".") ||
        0
      );

      const custoFinal = custoUnitario * quantidade;
      custoFinalCell.textContent = `R$ ${custoFinal.toFixed(2)}`;

     
    };

    const atualizarTotalTabela = (tabela) => {
      let total = 0;
      tabela.querySelectorAll("tbody tr").forEach(linha => {
        const valorStr = linha.querySelector(".custo-unitario")?.textContent?.replace("R$", "").replace(",", ".");
        const valor = parseFloat(valorStr || 0);
        total += valor;
      });
      const totalCell = tabela.querySelector("tfoot td strong");
      if (totalCell) {
        totalCell.textContent = `R$ ${total.toFixed(2)}`;
     
      }
    };

    // Escuta mudanças no campo .quantidade
    tabela.querySelectorAll("input.quantidade").forEach(input => {
      const linha = input.closest("tr");
      if (!linha) {
        console.warn("⚠️ Linha não encontrada para input.quantidade");
        return;
      }

     input.addEventListener("input", () => {
    atualizarLinha(linha);
    atualizarTotalTabela(tabela);

  const grupoId = tabela.id.replace("tabela-", ""); // ex: "tabela-bloco-0" → "bloco-0"
  console.log("📦 Grupo ID:", grupoId);

  preencherValoresFinanceiros(grupoId);
});


      atualizarLinha(linha); // Executa ao carregar

    });

    // Salva valor original de custo unitário
    tabela.querySelectorAll("tbody tr").forEach(linha => {
      const cell = linha.querySelector(".venda-unitaria");
      if (cell && !cell.dataset.valorOriginal) {
        const val = cell.textContent.replace("R$", "").replace(",", ".").trim();
        cell.dataset.valorOriginal = parseFloat(val || 0);
      
      }
    });

    atualizarTotalTabela(tabela); // Total inicial
    adicionarTotalizadoresPorAmbienteComAgrupamento();
  });
}
