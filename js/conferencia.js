function gerarPlanilhaCustos() {
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
  dados.nomeCliente = clienteWrapper?.querySelector(".razaoSocial")?.value || "-";
  dados.cpfCnpj = clienteWrapper?.querySelector(".cpfCnpj")?.value || "-";
  dados.telefoneCliente = clienteWrapper?.querySelector(".telefoneCliente")?.value || "-";
  dados.contatoResponsavel = clienteWrapper?.querySelector(".contatoResponsavel")?.value || "-";

  // 1. Coleta dos grupos
  let grupos = []; // { nomeAmbiente, nomeGrupo, produtos, totalGrupo, resumoGrupo }
  document.querySelectorAll("table[id^='tabela-bloco-']").forEach(tabela => {
    const grupoId = tabela.id.replace("tabela-", "");
    const inputAmbiente = document.querySelector(`input[data-id-grupo='${grupoId}'][placeholder='Ambiente']`);
    const nomeAmbiente = inputAmbiente?.value.trim() || "Sem Ambiente";

    let nomeGrupo = "-";
    let produtos = [];
    tabela.querySelectorAll("tbody tr").forEach((linhaProduto, idx) => {
      const colunas = linhaProduto.querySelectorAll("td");
      if (!colunas.length) return;
      const descricao = colunas[1]?.textContent.trim() || "-";
      const qtd = linhaProduto.querySelector("input.quantidade")?.value || colunas[2]?.textContent.trim() || "1";
      // ----------- ADICIONA VALOR UNITÁRIO E TOTAL -----------
      // Ajuste aqui caso a coluna do valor mude
      let valorUnit = linhaProduto.querySelector("input.valor-unitario")?.value 
                    || colunas[3]?.textContent.replace(/[^\d,\.]/g, '').replace(',', '.') 
                    || "0";
      valorUnit = parseFloat(valorUnit) || 0;
      let valorTotal = valorUnit * (parseFloat(qtd) || 0);

      produtos.push({ 
        descricao, 
        qtd, 
        valorUnit, 
        valorTotal 
      });
      if (idx === 0) nomeGrupo = descricao;
    });

    const totalGrupo = parseFloat(
      tabela.querySelector("tfoot td[colspan='6'] strong")?.textContent.replace(/[^\d,\.]/g, '').replace(',', '.') || "0"
    );

    const resumoGrupo = document.getElementById(`resumo-${grupoId}`)?.value?.trim() || "";

    grupos.push({
      nomeAmbiente,
      nomeGrupo,
      produtos,
      totalGrupo,
      resumoGrupo
    });
  });

  // 2. Agrupa por ambiente
  let ambientes = {}; // ambiente: [grupo, grupo, ...]
  grupos.forEach(grupo => {
    if (!ambientes[grupo.nomeAmbiente]) ambientes[grupo.nomeAmbiente] = [];
    ambientes[grupo.nomeAmbiente].push(grupo);
  });

  // 3. Monta HTML dos ambientes, grupos e produtos
  let totalGeral = 0;
  let corpoHTML = "";

  Object.entries(ambientes).forEach(([nomeAmbiente, gruposDoAmbiente]) => {
    let totalAmbiente = 0;
    corpoHTML += `
      <div class="mt-4 border ambiente-bloco" style="page-break-inside: avoid;">
        <div class="fw-bold border p-2 bg-light text-center">AMBIENTE: ${nomeAmbiente.toUpperCase()}</div>
    `;

    gruposDoAmbiente.forEach(grupo => {
      corpoHTML += `
      <br>
      <br>
        <div class="fw-semibold border-bottom p-1 ps-2 bg-white" style="font-size:20px">
          Grupo: ${grupo.nomeGrupo}
        </div>
        <table class="table table-sm table-bordered w-100 mb-0">
          <thead class="table-light">
            <tr>
              <th>Descrição</th>
              <th>Quantidade</th>
              <th>Valor Unitário (R$)</th>
              <th>Valor Total (R$)</th>
            </tr>
          </thead>
          <tbody>
            ${
              grupo.produtos.map(prod =>
                `<tr>
                  <td>${prod.descricao}</td>
                  <td>${prod.qtd}</td>
                  <td>${prod.valorUnit.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                  <td>${prod.valorTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                </tr>`
              ).join('')
            }
            ${grupo.resumoGrupo ? `<tr><td colspan="4"><em>${grupo.resumoGrupo}</em></td></tr>` : ""}
          </tbody>
        </table>
        <div class="border-bottom text-end p-1 bg-light">Total do Grupo: R$ ${grupo.totalGrupo.toFixed(2).replace('.', ',')}</div>
      `;
      totalAmbiente += grupo.totalGrupo;
    });

    corpoHTML += `<div class="border p-2 text-end fw-bold bg-light">Total do Ambiente: R$ ${totalAmbiente.toFixed(2).replace('.', ',')}</div></div>`;
    totalGeral += totalAmbiente;
  });

  // Totalizador/desconto/cabeçalho
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
    </div>
  `;

  // Cabeçalho final + impressão
  const htmlCompleto = `
    <html>
      <head>
        <title>Orçamento ${dados.numero}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          @media print {
            @page { size: landscape; margin: 8mm; }
            body { padding: 0 !important; }
            .ambiente-bloco { page-break-inside: avoid; break-inside: avoid; }
      
          }
          body { padding: 40px; font-family: Arial, sans-serif; font-size: 13px; }
          em { color: #444; font-style: italic; }
          .ambiente-bloco { page-break-inside: avoid; break-inside: avoid; }
        </style>
      </head>
      <body>
        <div style="margin-bottom:40px;">
          <table class="table table-bordered table-sm w-100">
            <tr>
              <td style="width:40%;text-align:center;vertical-align:middle;">
                <img src="../js/logo.jpg" style="max-height:65px;"><br><br>
                CNPJ: 02.836.048/0001-60 <br>(31) (31) 3332- 0616 / (31) 3271-9449<br>
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
          </table>
        </div>

        ${corpoHTML}
      </body>
    </html>`;

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
