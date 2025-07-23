// 1. Função principal: chamada pelo botão "Visualizar Proposta"
function gerarOrcamentoParaImpressaoCompleta() {
  const idsObrigatorios = [
    "numeroOrcamento", "dataOrcamento", "origemCliente",
    "nomeOrigem", "telefoneOrigem", "emailOrigem",
    "operadorInterno", "vendedorResponsavel"
  ];

  const pendentes = [];
  idsObrigatorios.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const valor = (el.value || el.textContent || "").trim();
    if (!valor) {
      pendentes.push(el);
      el.classList.add("campo-pendente");
    } else {
      el.classList.remove("campo-pendente");
    }
  });

  if (pendentes.length) {
    const continuar = confirm(
      `Existem ${pendentes.length} campo(s) obrigatório(s) vazio(s).\nEles foram destacados em vermelho.\n\nDeseja continuar mesmo assim?`
    );
    if (!continuar) return;
  }

  // Captura lista de grupos/blocos para montar popup
  const grupos = [];
  document.querySelectorAll("table[id^='tabela-bloco-']").forEach(tabela => {
    const grupoId = tabela.id.replace("tabela-", "");
    const inputAmbiente = document.querySelector(`input[data-id-grupo='${grupoId}'][placeholder='Ambiente']`);
    const nomeAmbiente = inputAmbiente?.value.trim() || "Sem Ambiente";
    const linhaProduto = tabela.querySelector("tbody tr");
    let nomeProduto = "";
    if (linhaProduto) {
      const colunas = linhaProduto.querySelectorAll("td");
      nomeProduto = (colunas[1]?.textContent || colunas[0]?.textContent || "").trim();
    }
    const totalGrupo = parseFloat(
      tabela.querySelector("tfoot td[colspan='6'] strong")?.textContent.replace(/[^\d,\.]/g, '').replace(',', '.') || "0"
    );
    grupos.push({
      grupoId, nomeAmbiente, totalGrupo, nomeProduto
    });
  });

  // Valor final com desconto (para mostrar no popup)
  const valorFinalComDescontoStr = document.getElementById("valorFinalTotal")?.textContent || "R$ 0,00";
  const valorFinalComDesconto = parseFloat(valorFinalComDescontoStr.replace(/[^\d,\.]/g, "").replace(",", "."));

  // Exibe popup e chama impressão quando confirmar
  mostrarPopupSelecaoGruposEstetico(grupos, valorFinalComDesconto, function(gruposOcultarProduto) {
    gerarHTMLParaImpressao(gruposOcultarProduto);
  });
}

// 2. Função de popup estético para ocultar produtos
function mostrarPopupSelecaoGruposEstetico(grupos, valorFinal, onConfirmar) {
  // CSS do popup (apenas uma vez)
  if (!document.getElementById("estetico-popup-style")) {
    const style = document.createElement("style");
    style.id = "estetico-popup-style";
    style.innerHTML = `
#popup-overlay-custom {
  position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;
  background:rgba(34,37,51,0.79);display:flex;align-items:center;justify-content:center;
  animation:popupfadein .12s;
}
@keyframes popupfadein{from{opacity:0}to{opacity:1}}
#popup-modal-custom {
  background:#fff;border-radius:15px;box-shadow:0 6px 38px #1118;
  padding:0;min-width:320px;max-width:430px;width:98%;overflow:hidden;max-height:96vh;display:flex;flex-direction:column;
}
#popup-modal-custom .header {
  background:linear-gradient(90deg,#377dff 0,#2a4d94 100%);
  color:#fff;padding:20px 25px 14px 25px;border-radius:15px 15px 0 0;
  font-size:1.22rem;font-weight:600;letter-spacing:.01em;box-shadow:0 2px 16px #2132;
}
#popup-modal-custom .body {
  padding:22px 18px 7px 22px;flex:1;overflow-y:auto;max-height:400px;
}
#popup-modal-custom .grupo-row {
  display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;gap:9px;border-bottom:1px solid #f2f4f7;
  padding-bottom:10px;
}
#popup-modal-custom .grupo-row:last-child{border-bottom:0}
#popup-modal-custom .grupo-info strong{font-size:1.07em;}
#popup-modal-custom .grupo-info {flex:1;}
#popup-modal-custom .grupo-info .produto{color:#222;font-size:.96em;}
#popup-modal-custom .grupo-info .valor{color:#2a4d94;font-size:.99em;font-weight:600;}
#popup-modal-custom .grupo-checkbox {margin-left:8px;white-space:nowrap;min-width:125px;}
#popup-modal-custom .footer {
  border-top:1px solid #f4f6fa;padding:14px 22px 18px 22px;display:flex;flex-direction:column;align-items:flex-end;background:#f8fafb;
}
#popup-modal-custom .footer .total {
  font-weight:bold;font-size:1.09em;color:#345;letter-spacing:.01em;margin-bottom:5px;
}
#popup-modal-custom .btn-row {
  display:flex;gap:11px;margin-top:10px;
}
#popup-modal-custom button {
  padding:8px 24px;border-radius:8px;border:none;outline:none;font-size:1em;
  font-weight:500;cursor:pointer;transition:background .16s;
}
#popup-modal-custom .btn-cancelar {background:#f2f2f2;color:#234;}
#popup-modal-custom .btn-cancelar:hover {background:#ececec;}
#popup-modal-custom .btn-confirmar {background:#377dff;color:#fff;}
#popup-modal-custom .btn-confirmar:hover {background:#2656af;}
    `;
    document.head.appendChild(style);
  }

  // HTML do popup
  let overlay = document.getElementById("popup-overlay-custom");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "popup-overlay-custom";
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div id="popup-modal-custom" tabindex="0">
      <div class="header">Opções de Impressão dos Ambientes</div>
      <form class="body" id="form-opcoes-grupos-custom">
        ${grupos.map(g => `
        <div class="grupo-row">
          <div class="grupo-info">
            <strong>${g.nomeAmbiente}</strong>
            <div class="valor">R$ ${g.totalGrupo.toFixed(2).replace('.', ',')}</div>
            <div class="produto">${g.nomeProduto ? `<span style="color:#375;">Produto:</span> ${g.nomeProduto}` : ''}</div>
          </div>
          <label class="grupo-checkbox">
            <input type="checkbox" name="ocultarProduto" data-grupoid="${g.grupoId}" checked>
            <span style="font-size:.99em;">Ocultar produto principal</span>
          </label>
        </div>`).join('')}
      </form>
      <div class="footer">
        <div class="total">Valor Final Geral: R$ ${valorFinal.toFixed(2).replace('.', ',')}</div>
        <div class="btn-row">
          <button type="button" class="btn-cancelar" id="btnCancelarModalCustom">Cancelar</button>
          <button type="button" class="btn-confirmar" id="btnConfirmarModalCustom">Visualizar</button>
        </div>
      </div>
    </div>
  `;

  overlay.style.display = "flex";
  overlay.querySelector("#popup-modal-custom").focus();

  overlay.querySelector("#btnCancelarModalCustom").onclick = function() {
    overlay.style.display = "none";
  };
  overlay.querySelector("#btnConfirmarModalCustom").onclick = function() {
    const checkboxes = overlay.querySelectorAll("input[name='ocultarProduto']");
    const opcoes = {};
    checkboxes.forEach(cb => {
      opcoes[cb.dataset.grupoid] = cb.checked;
    });
    overlay.style.display = "none";
    onConfirmar(opcoes);
  };
}





// 3. Função que realmente gera o HTML da impressão
function gerarHTMLParaImpressao(gruposOcultarProduto) {
  const getValue = id => document.getElementById(id)?.value || "-";
  const dados = {
    numero: getValue("numeroOrcamento"),
    data: new Date(getValue("dataOrcamento")).toLocaleDateString('pt-BR'),
    origem: getValue("origemCliente"),
    nomeOrigem: getValue("nomeOrigem"),
    codigoOrigem: getValue("codigoOrigem"),
    telefoneOrigem: getValue("telefoneOrigem"),
    emailOrigem: getValue("emailOrigem"),
    comissao: getValue("comissaoArquiteto"),
    operador: getValue("operadorInterno"),
    enderecoObra: `Rua/Avenida: ${getValue("rua")}, Número: ${getValue("numero")}, Bairro: ${getValue("bairro")} - Complemento: ${getValue("complemento")} - Cidade: ${getValue("cidade")}/${getValue("estado")} - CEP: ${getValue("cep")}`,
    prazos: getValue("prazosArea"),
    condicao: document.getElementById("condicaoPagamento")?.selectedOptions[0]?.textContent.trim() || "-",
    condicoesGerais: getValue("condicoesGerais"),
    vendedor: document.getElementById("vendedorResponsavel")?.selectedOptions[0]?.textContent || "-"
  };

const clienteWrapper = document.querySelector(".cliente-item");
dados.nomeCliente = clienteWrapper?.querySelector(".razaoSocial")?.value?.trim() || "-";
dados.cpfCnpj = clienteWrapper?.querySelector(".cpfCnpj")?.value?.trim() || "-";

// Busca telefone cliente (input ou texto)
let telefoneCliente = "-";
let telClienteEl = clienteWrapper?.querySelector(".telefoneCliente");
if (telClienteEl) {
  if (telClienteEl.value && telClienteEl.value.trim()) {
    telefoneCliente = telClienteEl.value.trim();
  } else if (telClienteEl.textContent && telClienteEl.textContent.trim()) {
    telefoneCliente = telClienteEl.textContent.trim();
  }
}
dados.telefoneCliente = telefoneCliente;

// Nome do contato
let nomeContato = clienteWrapper?.querySelector(".nomeContato")?.value?.trim() || "-";

// (Opcional: se quiser o telefone do contato separado)
let telefoneContato = telefoneCliente;

// Monta "Contato Responsável" no padrão: Nome do Contato - Telefone
if (nomeContato !== "-" || telefoneContato !== "-") {
  dados.contatoResponsavel = `${nomeContato} - ${telefoneContato}`;
} else {
  dados.contatoResponsavel = "-";
}


  // 1. Monta lista de grupos com ambiente
  let gruposDados = [];
  document.querySelectorAll("table[id^='tabela-bloco-']").forEach(tabela => {
    const grupoId = tabela.id.replace("tabela-", "");
    const inputAmbiente = document.querySelector(`input[data-id-grupo='${grupoId}'][placeholder='Ambiente']`);
    const nomeAmbiente = inputAmbiente?.value.trim() || "Sem Ambiente";
    const linhaProduto = tabela.querySelector("tbody tr");
   let resumoGrupo = document.getElementById(`resumo-${grupoId}`)?.value?.trim() || "";
resumoGrupo = resumoGrupo.replace(/\n/g, "<br>");
 const totalGrupo = parseFloat(
      tabela.querySelector("tfoot td[colspan='6'] strong")?.textContent.replace(/[^\d,\.]/g, '').replace(',', '.') || "0"
    );
    let colunas = linhaProduto?.querySelectorAll("td");
    let descricao = colunas?.[1]?.textContent.trim() || "-";
    let qtd = linhaProduto?.querySelector("input.quantidade")?.value || "1";
    gruposDados.push({
      grupoId, nomeAmbiente, totalGrupo, descricao, qtd, resumoGrupo, ocultar: !gruposOcultarProduto[grupoId]
    });
  });

  // 2. Agrupa por ambiente
  let ambientes = {};
  gruposDados.forEach(g => {
    if (!ambientes[g.nomeAmbiente]) ambientes[g.nomeAmbiente] = [];
    ambientes[g.nomeAmbiente].push(g);
  });

  let totalGeral = 0;
  let corpoHTML = "";

  // Para o resumo no final
  let ambienteTotais = [];

  // 3. Para cada ambiente
  Object.entries(ambientes).forEach(([nomeAmbiente, grupos]) => {
    // Se todos os grupos do ambiente estão ocultos, obriga mostrar o primeiro!
    const existemVisiveis = grupos.some(g => !g.ocultar);
    const valorTotalAmbiente = grupos.reduce((soma, x) => soma + x.totalGrupo, 0);

    // Lista dos grupos que serão impressos desse ambiente
    let gruposParaImprimir = grupos.filter(g => !g.ocultar);

    // Se nenhum grupo visível, força mostrar o primeiro
    if (gruposParaImprimir.length === 0) gruposParaImprimir = [grupos[0]];

    // Só soma o valor total do ambiente UMA vez!
    totalGeral += valorTotalAmbiente;

    // Registra total do ambiente para o resumo
    ambienteTotais.push({
      nome: nomeAmbiente,
      total: valorTotalAmbiente
    });

    // Monta todos os blocos do ambiente, sem mostrar total de ambiente em cada bloco
    gruposParaImprimir.forEach((g, i) => {
      corpoHTML += `
        <div class="mt-4 border">
          <div class="fw-bold border p-2 bg-light text-center">AMBIENTE: ${nomeAmbiente.toUpperCase()}</div>
          <table class="table table-sm table-bordered w-100">
            <thead class="table-light">
              <tr><th>Descrição</th><th>Quantidade</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>${g.descricao}</td>
                <td>${g.qtd}</td>
              </tr>
              ${g.resumoGrupo ? `<tr><td colspan="2"><em> ${g.resumoGrupo}</em></td></tr>` : ""}
            </tbody>
          </table>
        </div>`;
    });
  });

  // Tabela de resumo dos ambientes
  corpoHTML += `
    <div class="border p-3 mt-4">
      <h5 class="mb-3" style="font-size:1.11em">Resumo dos Totais por Ambiente</h5>
      <table class="table table-bordered table-sm w-100 mb-0">
        <thead>
          <tr>
            <th style="width:40%">Total do Ambiente</th>
            <th>Ambiente</th>
            <th style="width:22%">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${ambienteTotais.map(a => `
            <tr>
              <td><strong>Total do Ambiente</strong></td>
              <td>${a.nome}</td>
              <td><strong>R$ ${a.total.toFixed(2).replace('.', ',')}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Totalizadores gerais
  const valorFinalComDescontoStr = document.getElementById("valorFinalTotal")?.textContent || "R$ 0,00";
  const valorFinalComDesconto = parseFloat(valorFinalComDescontoStr.replace(/[^\d,\.]/g, "").replace(",", "."));
  const campoDesconto = document.getElementById("campoDescontoFinal")?.value?.trim();
  const temDescontoValido = campoDesconto && valorFinalComDesconto > 0 && valorFinalComDesconto < totalGeral;
  const descontoAplicado = temDescontoValido ? totalGeral - valorFinalComDesconto : 0;

  corpoHTML += temDescontoValido ? `
    <div class="border p-2 text-end mt-4 bg-light">
      <div><strong>Total Bruto:</strong> R$ ${totalGeral.toFixed(2).replace('.', ',')}</div>
      <div><strong>Desconto Aplicado:</strong> R$ ${descontoAplicado.toFixed(2).replace('.', ',')}</div>
      <div class="fw-bold fs-5 text-success"><strong>Total com Desconto:</strong> R$ ${valorFinalComDesconto.toFixed(2).replace('.', ',')}</div>
    </div>` : `
    <div class="border p-2 text-end mt-4 bg-light">
      <div class="fw-bold">Total Geral: R$ ${totalGeral.toFixed(2).replace('.', ',')}</div>
    </div>`;

  const condicoesGeraisFormatada = (dados.condicoesGerais || "")
    .replace(/•/g, "<br>•");

  corpoHTML += `
    <div class="border p-2 mt-3">
      <strong>Prazo:</strong><br>${dados.prazos}<br><br>
      <strong>Condições de Pagamento:</strong><br>${dados.condicao}<br><br>
      <strong>Condições Gerais:</strong><br>${condicoesGeraisFormatada}
      <br>
    </div>
  `;

  const htmlCompleto = `
    <html>
      <head>
        <title>Orçamento ${dados.numero}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { padding: 40px; font-family: Arial, sans-serif; font-size: 13px; }
          em { color: #444; font-style: italic; }
        </style>
      </head>
      <body>
        <div style="margin-bottom:40px;">
          <table class="table table-bordered table-sm w-100">
            <tr>
              <td style="width:40%;text-align:center;vertical-align:middle;">
                <img src="../js/logo.jpg" style="max-height:65px;"><br><br>
                CNPJ: 02.836.048/0001-60 <br>(31) 3332- 0616 / (31) 3271-9449<br>
              </td>
              <td style="width:40%;">
                <table class="table table-sm w-100">
                  <tr><td><strong>Orçamento:</strong></td><td>${dados.numero}</td></tr>
                  <tr><td><strong>Data:</strong></td><td>${dados.data}</td></tr>
                  <tr><td colspan="2"><strong>Proposta válida por 7 dias úteis</strong></td></tr>
                </table>
              </td>
            </tr>
          </table>

          <table class="table table-bordered table-sm w-100 mt-2">
            <tr><td><strong>Cliente:</strong></td><td>${dados.nomeCliente}</td></tr>
            <tr><td><strong>CPF/CNPJ:</strong></td><td>${dados.cpfCnpj}</td></tr>
            <tr><td><strong>Telefone Cliente:</strong></td><td>${dados.telefoneCliente}</td></tr>
            <tr><td><strong>Endereço da Obra:</strong></td><td>${dados.enderecoObra}</td></tr>
            <tr><td><strong>Contato Responsável:</strong></td><td>${dados.contatoResponsavel}</td></tr>
            <tr><td><strong>Vendedor:</strong></td><td>${dados.vendedor}</td></tr>
            <tr><td><strong>Operador:</strong></td><td>${dados.operador}</td></tr>
          </table>
        </div>
        ${corpoHTML}
      </body>
    </html>`;

  // Abre a janela de impressão normalmente
  async function abrirJanelaParaImpressao(htmlCompleto) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(htmlCompleto);
    printWindow.document.close();

    printWindow.onload = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      printWindow.focus();
      printWindow.print();
    };
  }
  abrirJanelaParaImpressao(htmlCompleto);
}
