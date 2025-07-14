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
    enderecoObra: `${getValue("rua")}, ${getValue("numero")}, ${getValue("bairro")} - ${getValue("complemento")} - ${getValue("cidade")}/${getValue("estado")} - CEP: ${getValue("cep")}`,
    contatoResponsavel: document.querySelector(".telefoneCliente")?.value || "-",
    prazos: getValue("prazosArea"),
   condicao: document.getElementById("condicaoPagamento")?.selectedOptions[0]?.textContent.trim() || "-",

    condicoesGerais: getValue("condicoesGerais"),
    vendedor: document.getElementById("vendedorResponsavel")?.selectedOptions[0]?.textContent || "-"
  };

  const clienteWrapper = document.querySelector(".cliente-item");
  dados.nomeCliente = clienteWrapper?.querySelector(".razaoSocial")?.value || "-";
  dados.cpfCnpj = clienteWrapper?.querySelector(".cpfCnpj")?.value || "-";
  dados.telefoneCliente = clienteWrapper?.querySelector(".telefoneCliente")?.value || "-";

  let totalGeral = 0;
  let corpoHTML = "";

  document.querySelectorAll("table[id^='tabela-bloco-']").forEach(tabela => {
    const grupoId = tabela.id.replace("tabela-", "");
    const inputAmbiente = document.querySelector(`input[data-id-grupo='${grupoId}'][placeholder='Ambiente']`);
    const nomeAmbiente = inputAmbiente?.value.trim() || "Sem Ambiente";

    const linhaProduto = tabela.querySelector("tbody tr");
    if (!linhaProduto) return;

    const colunas = linhaProduto.querySelectorAll("td");
    const descricao = colunas[1]?.textContent.trim() || "-";
    const qtd = linhaProduto.querySelector("input.quantidade")?.value || "1";

    const resumoGrupo = document.getElementById(`resumo-${grupoId}`)?.value?.trim() || "";

    const totalGrupo = parseFloat(
      tabela.querySelector("tfoot td[colspan='6'] strong")?.textContent.replace(/[^\d,\.]/g, '').replace(',', '.') || "0"
    );

    corpoHTML += `
      <div class="mt-4 border">
        <div class="fw-bold border p-2 bg-light text-center">AMBIENTE: ${nomeAmbiente.toUpperCase()}</div>
        <table class="table table-sm table-bordered w-100">
          <thead class="table-light">
            <tr><th>Descrição</th><th>Quantidade</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>${descricao}</td>
              <td>${qtd}</td>
            </tr>
            ${resumoGrupo ? `<tr><td colspan="2"><em>Resumo do Grupo: ${resumoGrupo}</em></td></tr>` : ""}
          </tbody>
        </table>
        <div class="border p-2 text-end fw-bold bg-light">Total do Ambiente: R$ ${totalGrupo.toFixed(2).replace('.', ',')}</div>
      </div>`;

    totalGeral += totalGrupo;
  });

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

  corpoHTML += `
    <div class="border p-2 mt-3">
      <strong>Prazo:</strong><br>${dados.prazos}<br><br>
      <strong>Condições de Pagamento:</strong><br>${dados.condicao}<br><br>
      <strong>Condições Gerais:</strong><br>${dados.condicoesGerais}
    </div>`;

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
                <img src="/js/logo.jpg" style="max-height:65px;"><br><br>
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
