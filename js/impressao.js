function gerarOrcamentoParaImpressao() {
  abrirTodasSanfonas();

  // ---------- 1. VALIDA CAMPOS OBRIGATÓRIOS ----------
  const idsObrigatorios = [
    "numeroOrcamento",
    "dataOrcamento",
    "origemCliente",
    "nomeOrigem",
    "telefoneOrigem",
    "emailOrigem",
    "operadorInterno",
    "vendedorResponsavel"
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
      `Existem ${pendentes.length} campo(s) obrigatório(s) vazio(s).\n` +
      `Eles foram destacados em vermelho.\n\nDeseja continuar mesmo assim?`
    );
    if (!continuar) return;
  }

  // ---------- 2. FUNÇÃO AUXILIAR ----------
  const getValue = id => document.getElementById(id)?.value || "-";

  // ---------- 3. COLETA DADOS GERAIS ----------
  const dados = {
    numero:             getValue("numeroOrcamento"),
    data:               getValue("dataOrcamento"),
    origem:             getValue("origemCliente"),
    nomeOrigem:         getValue("nomeOrigem"),
    codigoOrigem:       getValue("codigoOrigem"),
    telefoneOrigem:     getValue("telefoneOrigem"),
    emailOrigem:        getValue("emailOrigem"),
    comissao:           getValue("comissaoArquiteto"),
    operador:           getValue("operadorInterno"),
    enderecoObra:       getValue("enderecoObra"),
    contatoResponsavel: getValue("contatoResponsavel"),
    prazos:             getValue("prazosArea"),
    condicao:           getValue("condicaoPagamento"),
    condicoesGerais:    getValue("condicoesGerais"),
    vendedor: document.getElementById("vendedorResponsavel")
               ?.selectedOptions[0]?.textContent || "-"
  };

  // ---------- 4. DADOS DO CLIENTE ----------
  const clienteWrapper = document.querySelector(".cliente-item");
  dados.nomeCliente     = clienteWrapper?.querySelector(".razaoSocial")?.value || "-";
  dados.cpfCnpj         = clienteWrapper?.querySelector(".cpfCnpj")?.value || "-";
  dados.telefoneCliente = clienteWrapper?.querySelector(".telefoneCliente")?.value || "-";

  // ---------- 5. PRODUTOS / GRUPOS ----------
  let totalGeral = 0;
  let corpoHTML = "";
  const produtosPorAmbiente = {};

  const gruposContainers = document.querySelectorAll('#included-products-container > div[data-group]');

  gruposContainers.forEach(container => {
    const grupo = container.getAttribute("data-group");
    const inputAmbiente = container.querySelector("input[placeholder='Descreva o ambiente...']");
    const nomeAmbiente = inputAmbiente?.value.trim() || "Sem Ambiente";
    const produtosGrupo = includedProducts.filter(p => p.class === grupo);
    if (!produtosGrupo.length) return;

    const resumoGrupo = document.getElementById(`resumo-${grupo}`)?.value.trim() || "";

    (produtosPorAmbiente[nomeAmbiente] ||= []).push({
      grupo,
      descricao:   groupPopupsData[grupo]?.descricao      || "-",
      unidade:     groupPopupsData[grupo]?.unidade_medida || "-",
      nomeProduto: produtosGrupo[0]?.descricao            || "-",
      observacao:  container.querySelector("td.editable-observacoes")?.textContent.trim() || "",
      resumoGrupo,
      totalGrupo:  produtosGrupo.reduce(
                    (acc, p) => acc + (parseFloat(p.cost || 0) * parseFloat(p.quantity || 0)), 0)
    });
  });

  // ---------- 6. MONTA HTML POR AMBIENTE ----------
  Object.entries(produtosPorAmbiente).forEach(([ambiente, grupos]) => {
    let totalAmbiente = 0;
    let blocos = "";

    grupos.forEach((g, i) => {
      totalAmbiente += g.totalGrupo;
      blocos += `
        <div class="parent border mb-0">
          <div class="div1 border p-2">Item ${i + 1}</div>
          <div class="div2 border p-2">${g.descricao}</div>
          <div class="div3 border p-2">${g.unidade}</div>
          <div class="div4 border p-2">${g.nomeProduto}</div>
          <div class="div6 border p-2">${g.observacao}</div>
        </div>
        ${g.resumoGrupo ? `<div class="border p-2 small text-muted"><strong>Resumo do Grupo:</strong><br>${g.resumoGrupo}</div>` : ""}
      `;
    });

    corpoHTML += `
      <div class="mt-4 border">
        <div class="fw-bold border p-2 bg-light text-center">AMBIENTE: ${ambiente.toUpperCase()}</div>
        ${blocos}
        <div class="border p-2 text-end fw-bold bg-light">Total do Ambiente: R$ ${totalAmbiente.toFixed(2).replace('.', ',')}</div>
      </div>
    `;

    totalGeral += totalAmbiente;
  });

  corpoHTML += `
    <div class="border p-2 text-end fw-bold mt-4 bg-light">Total Geral: R$ ${totalGeral.toFixed(2).replace('.', ',')}</div>
    <div class="border p-2 mt-3">
      <strong>Prazo:</strong><br>${dados.prazos}<br><br>
      <strong>Condições de Pagamento:</strong><br>${dados.condicao}<br><br>
      <strong>Condições Gerais:</strong><br>${dados.condicoesGerais}
    </div>
  `;

  // ---------- 7. HTML COMPLETO PARA IMPRESSÃO ----------
  const htmlCompleto = `
    <html>
      <head>
        <title>Orçamento ${dados.numero}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { padding: 40px; font-family: Arial, sans-serif; font-size: 13px; }
          .parent { display: grid; grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(3, 1fr); }
          .div1 { grid-area: 1 / 1 / 6 / 2; }
          .div2 { grid-area: 1 / 2 / 2 / 3; }
          .div3 { grid-area: 1 / 3 / 2 / 4; }
          .div4 { grid-area: 1 / 4 / 2 / 6; }
          .div6 { grid-area: 2 / 2 / 4 / 6; }
        </style>
      </head>
      <body>
        <div style="margin-bottom:40px;">
          <table class="table table-bordered table-sm w-100">
            <tr>
              <td style="width:40%;text-align:center;vertical-align:middle;">
                <img src="logo.jpg" style="max-height:80px;"><br><br>
                CNPJ: 00.000.000/0000-00<br>(31) 99999-9999<br>www.ferreiraulhoa.com.br
              </td>
              <td style="width:60%;">
                <table class="table table-sm w-100">
                  <tr><td><strong>Orçamento:</strong></td><td>${dados.numero}</td></tr>
                  <tr><td><strong>Data:</strong></td><td>${dados.data}</td></tr>
                  <tr><td><strong>Telefone Origem:</strong></td><td>${dados.telefoneOrigem}</td></tr>
                </table>
              </td>
            </tr>
          </table>

          <table class="table table-bordered table-sm w-100 mt-2">
            <tr><td><strong>Email Origem:</strong></td><td>${dados.emailOrigem}</td></tr>
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
    </html>
  `;

  // ---------- 8. IMPRESSÃO ----------
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(htmlCompleto);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 1000);

  marcarEnviadoParaCliente();
}

// ---------- CSS DESTACAR CAMPOS OBRIGATÓRIOS ----------
const styleTag = document.createElement("style");
styleTag.textContent = `.campo-pendente { border:2px solid #dc3545 !important; }`;
document.head.appendChild(styleTag);
