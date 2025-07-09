async function salvarPropostaEditavel() {
  try {
   abrirTodasSanfonas();
await new Promise(resolve => setTimeout(resolve, 2000));

    // 👥 Clientes
    const clientes = Array.from(document.querySelectorAll(".cliente-item")).map(el => ({
      nome_razao_social: el.querySelector(".razaoSocial")?.value || "",
      nome_contato: el.querySelector(".nomeContato")?.value || "",
      codigoOmie: el.querySelector(".codigoCliente")?.value || "",
      cpfCnpj: el.querySelector(".cpfCnpj")?.value || "",
      funcao: el.querySelector(".funcaoCliente")?.value || "",
      telefone: el.querySelector(".telefoneCliente")?.value || ""
    }));

    // 💳 Condição e parcelas
    const condicaoPagamento = document.getElementById("condicaoPagamento")?.value || "";
    let parcelas = [];

    if (condicaoPagamento === "parcelado") {
      const linhas = document.querySelectorAll("#listaParcelas .row");
      parcelas = Array.from(linhas).map(row => {
        const data = row.querySelector(".data-parcela")?.value || "";
        const valor = row.querySelector(".valor-parcela")?.value || "";
        const tipo = row.querySelector(".tipo-monetario")?.value || "";
        const condSelect = row.querySelector("select.condicao-pagto");
        const condInput = row.querySelector("input.condicao-pagto");
        const condicao = condSelect?.value || condInput?.value || "";
        return { data, valor, tipo, condicao };
      });
    }

    // 📋 Campos do formulário
    const camposFormulario = {
      numeroOrcamento: document.getElementById("numeroOrcamento")?.value || "",
      dataOrcamento: document.getElementById("dataOrcamento")?.value || "",
      origemCliente: document.getElementById("origemCliente")?.value || "",
      clientes,
      cep: document.getElementById("cep")?.value || "",
      rua: document.getElementById("rua")?.value || "",
      numero: document.getElementById("numero")?.value || "",
      complemento: document.getElementById("complemento")?.value || "",
      bairro: document.getElementById("bairro")?.value || "",
      cidade: document.getElementById("cidade")?.value || "",
      estado: document.getElementById("estado")?.value || "",
      vendedorResponsavel: document.getElementById("vendedorResponsavel")?.value || "",
      operadorInterno: document.getElementById("operadorInterno")?.value || "",
      prazosArea: document.getElementById("prazosArea")?.value || "",
      condicaoPagamento,
      condicoesGerais: document.getElementById("condicoesGerais")?.value || "",
      parcelas
    };

    // 🔄 Grupos e produtos
    const grupos = [];
    document.querySelectorAll(".main-container").forEach(bloco => {
      const blocoId = bloco.id;
      const nomeGrupo = bloco.querySelector(`span[id^='titulo-accordion-']`)?.textContent?.trim() || blocoId;
      const ambiente = bloco.querySelector(`input[data-id-grupo="${blocoId}"]`)?.value?.trim() || "";

      const tabela = bloco.querySelector(`#tabela-${blocoId}`);
      if (!tabela) {
        console.warn(`⚠️ Tabela não encontrada no bloco ${blocoId}`);
        return;
      }

      const itens = [];
      tabela.querySelectorAll("tbody tr:not(.extra-summary-row)").forEach(tr => {
        const nome_produto = tr.querySelector("td:nth-child(2)")?.textContent?.trim() || "";
        const custoStr = tr.querySelector("td:nth-child(3)")?.textContent?.replace("R$", "").replace(/\s/g, "") || "0";
        const precoStr = tr.querySelector("td:nth-child(4)")?.textContent?.replace("R$", "").replace(/\s/g, "") || "0";
        const custo = parseFloat(custoStr.replace(",", ".")) || 0;
        const preco = parseFloat(precoStr.replace(",", ".")) || 0;
        const codigo_omie = tr.querySelector("td:nth-child(5)")?.textContent?.trim() || "";
        const quantidade = tr.querySelector("input.quantidade")?.value || "";
        const inputQtdDesejada = tr.querySelector("input.quantidade-desejada");
        const quantidade_desejada = inputQtdDesejada?.value || "";
        const formula_quantidade = inputQtdDesejada?.dataset.formula || "";

        itens.push({
          nome_produto,
          custo,
          preco,
          codigo_omie,
          quantidade,
          quantidade_desejada,
          formula_quantidade
        });
      });

      // 📐 Parâmetros
      const parametros = {};
      bloco.querySelectorAll(".tab-pane input[name]").forEach(input => {
        const nome = input.name;
        let valor = input.value?.trim();
        if (valor?.includes(",")) valor = valor.replace(",", ".");
        parametros[nome] = isNaN(valor) ? valor : parseFloat(valor);
      });

      if (itens.length > 0) {
        grupos.push({ nome: nomeGrupo, ambiente, itens, parametros });
      }
    });

    if (!grupos.length) {
      console.warn("⚠️ Nenhum grupo ou item para salvar.");
      return { erro: "Nenhum produto informado." };
    }

    // 🧾 Proposta final
    const numeroProposta = camposFormulario.numeroOrcamento || Date.now().toString();
    const proposta = {
      tipoProposta: "editavel",
      numeroProposta,
      camposFormulario,
      grupos
    };

    // 🚀 Envia para o servidor
    const resposta = await fetch("https://ulhoa-0a02024d350a.herokuapp.com/api/propostas", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proposta)
    });

    const resultado = await resposta.json();
    console.log("📦 Proposta salva com sucesso:", resultado);
     mostrarPopupCustomizado("✅ Sucesso", "Proposta atualizada com sucesso!", "success");
    return resultado;

  } catch (erro) {
    console.error("❌ Erro ao salvar proposta:", erro);
   mostrarPopupCustomizado("❌ Erro", "Erro ao atualizar proposta. Verifique o console.", "error");

    return { erro: "Erro inesperado ao salvar proposta." };
  }
}


async function atualizarPropostaEditavel() {
  try {
   abrirTodasSanfonas();
await new Promise(resolve => setTimeout(resolve, 2000));

    const idProposta = new URLSearchParams(window.location.search).get("id");
    if (!idProposta) {
      alert("❌ ID da proposta não encontrado na URL.");
      return { erro: "ID da proposta não encontrado." };
    }

    // 👥 Clientes
    const clientes = Array.from(document.querySelectorAll(".cliente-item")).map(el => ({
      nome_razao_social: el.querySelector(".razaoSocial")?.value || "",
      nome_contato: el.querySelector(".nomeContato")?.value || "",
      codigoOmie: el.querySelector(".codigoCliente")?.value || "",
      cpfCnpj: el.querySelector(".cpfCnpj")?.value || "",
      funcao: el.querySelector(".funcaoCliente")?.value || "",
      telefone: el.querySelector(".telefoneCliente")?.value || ""
    }));

    // 💳 Condição e parcelas
    const condicaoPagamento = document.getElementById("condicaoPagamento")?.value || "";
    let parcelas = [];

    if (condicaoPagamento === "parcelado") {
      const linhas = document.querySelectorAll("#listaParcelas .row");
      parcelas = Array.from(linhas).map(row => {
        const data = row.querySelector(".data-parcela")?.value || "";
        const valor = row.querySelector(".valor-parcela")?.value || "";
        const tipo = row.querySelector(".tipo-monetario")?.value || "";
        const condSelect = row.querySelector("select.condicao-pagto");
        const condInput = row.querySelector("input.condicao-pagto");
        const condicao = condSelect?.value || condInput?.value || "";
        return { data, valor, tipo, condicao };
      });
    }

    // 📋 Campos do formulário
    const camposFormulario = {
      numeroOrcamento: document.getElementById("numeroOrcamento")?.value || "",
      dataOrcamento: document.getElementById("dataOrcamento")?.value || "",
      origemCliente: document.getElementById("origemCliente")?.value || "",
      clientes,
      cep: document.getElementById("cep")?.value || "",
      rua: document.getElementById("rua")?.value || "",
      numero: document.getElementById("numero")?.value || "",
      complemento: document.getElementById("complemento")?.value || "",
      bairro: document.getElementById("bairro")?.value || "",
      cidade: document.getElementById("cidade")?.value || "",
      estado: document.getElementById("estado")?.value || "",
      vendedorResponsavel: document.getElementById("vendedorResponsavel")?.value || "",
      operadorInterno: document.getElementById("operadorInterno")?.value || "",
      prazosArea: document.getElementById("prazosArea")?.value || "",
      condicaoPagamento,
      condicoesGerais: document.getElementById("condicoesGerais")?.value || "",
      parcelas
    };

    // 🔄 Grupos e produtos
    const grupos = [];
    document.querySelectorAll(".main-container").forEach(bloco => {
      const blocoId = bloco.id;
      const nomeGrupo = bloco.querySelector(`span[id^='titulo-accordion-']`)?.textContent?.trim() || blocoId;
      const ambiente = bloco.querySelector(`input[data-id-grupo="${blocoId}"]`)?.value?.trim() || "";

      const tabela = bloco.querySelector(`#tabela-${blocoId}`);
      if (!tabela) {
        console.warn(`⚠️ Tabela não encontrada no bloco ${blocoId}`);
        return;
      }

      const itens = [];
      tabela.querySelectorAll("tbody tr:not(.extra-summary-row)").forEach(tr => {
        const nome_produto = tr.querySelector("td:nth-child(2)")?.textContent?.trim() || "";
        const custoStr = tr.querySelector("td:nth-child(3)")?.textContent?.replace("R$", "").replace(/\s/g, "") || "0";
        const precoStr = tr.querySelector("td:nth-child(4)")?.textContent?.replace("R$", "").replace(/\s/g, "") || "0";
        const custo = parseFloat(custoStr.replace(",", ".")) || 0;
        const preco = parseFloat(precoStr.replace(",", ".")) || 0;
        const codigo_omie = tr.querySelector("td:nth-child(5)")?.textContent?.trim() || "";
        const quantidade = tr.querySelector("input.quantidade")?.value || "";
        const inputQtdDesejada = tr.querySelector("input.quantidade-desejada");
        const quantidade_desejada = inputQtdDesejada?.value || "";
        const formula_quantidade = inputQtdDesejada?.dataset.formula || "";

        itens.push({
          nome_produto,
          custo,
          preco,
          codigo_omie,
          quantidade,
          quantidade_desejada,
          formula_quantidade
        });
      });

      // 📐 Parâmetros do grupo
      const parametros = {};
      bloco.querySelectorAll(".tab-pane input[name]").forEach(input => {
        const nome = input.name;
        let valor = input.value?.trim();
        if (valor?.includes(",")) valor = valor.replace(",", ".");
        parametros[nome] = isNaN(valor) ? valor : parseFloat(valor);
      });

      if (itens.length > 0) {
        grupos.push({ nome: nomeGrupo, ambiente, itens, parametros });
      }
    });

    if (!grupos.length) {
      console.warn("⚠️ Nenhum grupo ou item para atualizar.");
      return { erro: "Nenhum produto informado." };
    }

    // 🔄 Objeto de proposta atualizado
    const numeroProposta = camposFormulario.numeroOrcamento || Date.now().toString();
    const propostaAtualizada = {
      tipoProposta: "editavel",
      numeroProposta,
      camposFormulario,
      grupos
    };

    // 🚀 Envia para o backend com PUT
    const resposta = await fetch(`https://ulhoa-0a02024d350a.herokuapp.com/api/propostas/${idProposta}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(propostaAtualizada)
    });

    const resultado = await resposta.json();
    console.log("✅ Proposta atualizada com sucesso:", resultado);
    mostrarPopupCustomizado("✅ Sucesso", "Proposta atualizada com sucesso!", "success");
  
    return resultado;

  } catch (erro) {
    console.error("❌ Erro ao atualizar proposta:", erro);
    mostrarPopupCustomizado("❌ Erro", "Erro ao atualizar proposta. Verifique o console.", "error");

    return { erro: erro.message };
  }
}

async function atualizarPropostaModelo() {
  try {
   abrirTodasSanfonas();
await new Promise(resolve => setTimeout(resolve, 2000));

    const idProposta = "6851c413b30e3e4dda354132"
    if (!idProposta) {
      alert("❌ ID da proposta não encontrado na URL.");
      return { erro: "ID da proposta não encontrado." };
    }

    // 👥 Clientes
    const clientes = Array.from(document.querySelectorAll(".cliente-item")).map(el => ({
      nome_razao_social: el.querySelector(".razaoSocial")?.value || "",
      nome_contato: el.querySelector(".nomeContato")?.value || "",
      codigoOmie: el.querySelector(".codigoCliente")?.value || "",
      cpfCnpj: el.querySelector(".cpfCnpj")?.value || "",
      funcao: el.querySelector(".funcaoCliente")?.value || "",
      telefone: el.querySelector(".telefoneCliente")?.value || ""
    }));

    // 💳 Condição e parcelas
    const condicaoPagamento = document.getElementById("condicaoPagamento")?.value || "";
    let parcelas = [];

    if (condicaoPagamento === "parcelado") {
      const linhas = document.querySelectorAll("#listaParcelas .row");
      parcelas = Array.from(linhas).map(row => {
        const data = row.querySelector(".data-parcela")?.value || "";
        const valor = row.querySelector(".valor-parcela")?.value || "";
        const tipo = row.querySelector(".tipo-monetario")?.value || "";
        const condSelect = row.querySelector("select.condicao-pagto");
        const condInput = row.querySelector("input.condicao-pagto");
        const condicao = condSelect?.value || condInput?.value || "";
        return { data, valor, tipo, condicao };
      });
    }

    // 📋 Campos do formulário
    const camposFormulario = {
      numeroOrcamento: document.getElementById("numeroOrcamento")?.value || "",
      dataOrcamento: document.getElementById("dataOrcamento")?.value || "",
      origemCliente: document.getElementById("origemCliente")?.value || "",
      clientes,
      cep: document.getElementById("cep")?.value || "",
      rua: document.getElementById("rua")?.value || "",
      numero: document.getElementById("numero")?.value || "",
      complemento: document.getElementById("complemento")?.value || "",
      bairro: document.getElementById("bairro")?.value || "",
      cidade: document.getElementById("cidade")?.value || "",
      estado: document.getElementById("estado")?.value || "",
      vendedorResponsavel: document.getElementById("vendedorResponsavel")?.value || "",
      operadorInterno: document.getElementById("operadorInterno")?.value || "",
      prazosArea: document.getElementById("prazosArea")?.value || "",
      condicaoPagamento,
      condicoesGerais: document.getElementById("condicoesGerais")?.value || "",
      parcelas
    };

    // 🔄 Grupos e produtos
    const grupos = [];
    document.querySelectorAll(".main-container").forEach(bloco => {
      const blocoId = bloco.id;
      const nomeGrupo = bloco.querySelector(`span[id^='titulo-accordion-']`)?.textContent?.trim() || blocoId;
      const ambiente = bloco.querySelector(`input[data-id-grupo="${blocoId}"]`)?.value?.trim() || "";

      const tabela = bloco.querySelector(`#tabela-${blocoId}`);
      if (!tabela) {
        console.warn(`⚠️ Tabela não encontrada no bloco ${blocoId}`);
        return;
      }

      const itens = [];
      tabela.querySelectorAll("tbody tr:not(.extra-summary-row)").forEach(tr => {
        const nome_produto = tr.querySelector("td:nth-child(2)")?.textContent?.trim() || "";
        const custoStr = tr.querySelector("td:nth-child(3)")?.textContent?.replace("R$", "").replace(/\s/g, "") || "0";
        const precoStr = tr.querySelector("td:nth-child(4)")?.textContent?.replace("R$", "").replace(/\s/g, "") || "0";
        const custo = parseFloat(custoStr.replace(",", ".")) || 0;
        const preco = parseFloat(precoStr.replace(",", ".")) || 0;
        const codigo_omie = tr.querySelector("td:nth-child(5)")?.textContent?.trim() || "";
        const quantidade = tr.querySelector("input.quantidade")?.value || "";
        const inputQtdDesejada = tr.querySelector("input.quantidade-desejada");
        const quantidade_desejada = inputQtdDesejada?.value || "";
        const formula_quantidade = inputQtdDesejada?.dataset.formula || "";

        itens.push({
          nome_produto,
          custo,
          preco,
          codigo_omie,
          quantidade,
          quantidade_desejada,
          formula_quantidade
        });
      });

      // 📐 Parâmetros do grupo
      const parametros = {};
      bloco.querySelectorAll(".tab-pane input[name]").forEach(input => {
        const nome = input.name;
        let valor = input.value?.trim();
        if (valor?.includes(",")) valor = valor.replace(",", ".");
        parametros[nome] = isNaN(valor) ? valor : parseFloat(valor);
      });

      if (itens.length > 0) {
        grupos.push({ nome: nomeGrupo, ambiente, itens, parametros });
      }
    });

    if (!grupos.length) {
      console.warn("⚠️ Nenhum grupo ou item para atualizar.");
      return { erro: "Nenhum produto informado." };
    }

    // 🔄 Objeto de proposta atualizado
    const numeroProposta = camposFormulario.numeroOrcamento || Date.now().toString();
    const propostaAtualizada = {
      tipoProposta: "editavel",
      numeroProposta,
      camposFormulario,
      grupos
    };

    // 🚀 Envia para o backend com PUT
    const resposta = await fetch(`https://ulhoa-0a02024d350a.herokuapp.com/api/propostas/${idProposta}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(propostaAtualizada)
    });

    const resultado = await resposta.json();
    console.log("✅ Proposta atualizada com sucesso:", resultado);
     mostrarPopupCustomizado("✅ Sucesso", "Proposta atualizada com sucesso!", "success");
    marcarPendenteAprovacao()
    return resultado;

  } catch (erro) {
    console.error("❌ Erro ao atualizar proposta:", erro);
    alert("Erro ao atualizar proposta. Verifique o console.");
    return { erro: erro.message };
  }
}




function getIdDaURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// 1️⃣ Orçamento Iniciado
async function marcarOrcamentoIniciado() {
  await atualizarStatus("Orçamento Iniciado");
}

// 2️⃣ Pendente de aprovação
async function marcarPendenteAprovacao() {
  await atualizarStatus("Pendente de aprovação");
}

// 3️⃣ Aprovado Pelo Gestor
async function marcarAprovadoPeloGestor() {
  await marcarPrecosDivergentesOmie()
  
  await atualizarStatus("Aprovado Pelo Gestor");
 
}

// 4️⃣ Enviado Para o Cliente
async function marcarEnviadoParaCliente() {
  await atualizarStatus("Enviado Para o Cliente");
   gerarOrcamentoParaImpressaoCompleta() 
 
}


// 5️⃣ Orçamento Aprovado pelo Cliente
async function marcarAprovadoPeloCliente() {
  await atualizarStatus("Orçamento Aprovado pelo Cliente");
}

// 6️⃣ Pedido Enviado para a Omie
async function marcarPedidoEnviadoParaOmie() {
  await atualizarStatus("Pedido Enviado para a Omie");
}

// 🔁 Função base reutilizável
// 🔁 Função base reutilizável
async function atualizarStatus(novoStatus) {
  try {
    const id = getIdDaURL();
    if (!id) {
      alert("❌ ID da proposta não encontrado na URL.");
      return;
    }

    const resposta = await fetch(`https://ulhoa-0a02024d350a.herokuapp.com/api/propostas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ statusOrcamento: novoStatus })
    });

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    const resultado = await resposta.json();
    console.log(`✅ Status atualizado para "${novoStatus}":`, resultado);
   
 mostrarPopupCustomizado("✅ Sucesso", `Status atualizado para "${novoStatus}".`, "success");
   return resultado;

  } catch (erro) {
    console.error("❌ Erro ao atualizar status:", erro);
    alert("Erro ao atualizar status da proposta. Verifique o console.");
    return { erro: erro.message };
  }
}


function mostrarPopupCustomizado(titulo, mensagem, tipo = "info") {
  const popupExistente = document.getElementById("popup-status-omie");
  if (popupExistente) popupExistente.remove();

  const overlay = document.createElement("div");
  overlay.id = "popup-status-omie";
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = 9999;

  const box = document.createElement("div");
  box.style.backgroundColor = "#fff";
  box.style.borderRadius = "8px";
  box.style.padding = "24px";
  box.style.boxShadow = "0 0 15px rgba(0, 0, 0, 0.2)";
  box.style.maxWidth = "500px";
  box.style.width = "90%";
  box.style.textAlign = "center";
  box.style.fontFamily = "Arial, sans-serif";

  const tituloEl = document.createElement("h2");
  tituloEl.textContent = titulo;
  tituloEl.style.color = tipo === "success" ? "green" : tipo === "error" ? "red" : "#333";
  tituloEl.style.marginBottom = "12px";

  const mensagemEl = document.createElement("p");
  mensagemEl.textContent = mensagem;
  mensagemEl.style.marginBottom = "20px";

  const botao = document.createElement("button");
  botao.textContent = "Fechar";
  botao.style.padding = "8px 20px";
  botao.style.border = "none";
  botao.style.backgroundColor = "#007BFF";
  botao.style.color = "#fff";
  botao.style.borderRadius = "4px";
  botao.style.cursor = "pointer";
  botao.addEventListener("click", () => overlay.remove());

  box.appendChild(tituloEl);
  box.appendChild(mensagemEl);
  box.appendChild(botao);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}




async function marcarPrecosDivergentesOmie() {
  const ENDPOINT = "https://ulhoa-0a02024d350a.herokuapp.com/produtos/visualizar";
  const LOGIN_URL = "https://ulhoa-0a02024d350a.herokuapp.com/api/auth/login";

  const toNumber = (v) => {
    if (v === undefined || v === null) return 0;
    let s = String(v).replace(/\s+/g, "").replace("R$", "");
    const hasDot = s.includes(".");
    const hasComma = s.includes(",");
    if (hasDot && hasComma) s = s.replace(/\./g, "").replace(",", ".");
    else if (!hasDot && hasComma) s = s.replace(",", ".");
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };

  const mostrarPopupGestor = () => {
    return new Promise((resolve) => {
      const fundo = document.createElement("div");
      fundo.style.position = "fixed";
      fundo.style.top = "0";
      fundo.style.left = "0";
      fundo.style.width = "100vw";
      fundo.style.height = "100vh";
      fundo.style.backgroundColor = "rgba(0,0,0,0.5)";
      fundo.style.zIndex = "10000";
      fundo.style.display = "flex";
      fundo.style.alignItems = "center";
      fundo.style.justifyContent = "center";

      const popup = document.createElement("div");
      popup.style.background = "white";
      popup.style.padding = "20px";
      popup.style.borderRadius = "8px";
      popup.style.width = "300px";
      popup.innerHTML = `
        <h5>⚠️ Orçamento antigo</h5>
        <p>Digite e-mail e senha do gestor:</p>
        <input id="email-gestor" type="email" placeholder="E-mail" class="form-control mb-2">
        <input id="senha-gestor" type="password" placeholder="Senha" class="form-control mb-3">
        <div class="d-flex justify-content-end">
          <button id="verificar-credenciais" class="btn btn-primary btn-sm">Verificar</button>
        </div>
      `;

      fundo.appendChild(popup);
      document.body.appendChild(fundo);

      document.getElementById("verificar-credenciais").onclick = async () => {
        const email = document.getElementById("email-gestor").value;
        const senha = document.getElementById("senha-gestor").value;
        try {
          const res = await fetch(LOGIN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha }),
          });
          if (!res.ok) throw new Error("Credenciais inválidas");
          const data = await res.json();

          // Limpa e insere os botões de decisão após autenticação
          popup.innerHTML = `
            <h5>✅ Acesso autorizado</h5>
            <p>Deseja atualizar os valores ou manter os atuais?</p>
            <div class="d-flex justify-content-end gap-2">
              <button id="cancelar-popup" class="btn btn-secondary btn-sm">Manter valores</button>
              <button id="confirmar-popup" class="btn btn-primary btn-sm">Atualizar valores</button>
            </div>
          `;

          document.getElementById("cancelar-popup").onclick = () => {
            fundo.remove();
            resolve(false);
          };

          document.getElementById("confirmar-popup").onclick = () => {
            fundo.remove();
            resolve(true);
          };
        } catch (err) {
          alert("❌ Falha na autenticação do gestor: " + err.message);
        }
      };
    });
  };

  try {
    let exigirAutorizacao = false;
    let podeAtualizarValores = false;

    const inputData = document.querySelector("#dataOrcamento");
    if (inputData && inputData.value) {
      const dataOrc = new Date(inputData.value);
      const hoje = new Date();
      const diffDias = Math.floor((hoje - dataOrc) / (1000 * 60 * 60 * 24));
      if (diffDias > 10) exigirAutorizacao = true;
    }

    const res = await fetch(ENDPOINT);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const listaAPI = await res.json();

    const lookup = {};
    listaAPI.forEach((p) => {
      const codigo = String(p.codigo_produto || p.codigo || "").trim();
      const preco = p.preco_unitario ?? p.valor_unitario ?? p.preco ?? p.price ?? 0;
      if (codigo) lookup[codigo] = toNumber(preco);
    });

    document.querySelectorAll(".accordion-collapse").forEach(div => div.classList.add("show"));

    let linhasDivergentes = [];

    document.querySelectorAll("table[id^='tabela-'] tbody tr").forEach((tr) => {
      const codigoCell = tr.querySelector("td:nth-child(5)");
      const custoTd = tr.querySelector("td:nth-child(3)");
      const unitarioTd = tr.querySelector("td:nth-child(4)");
      const inputQtd = tr.querySelector("td:nth-child(6) input");

      if (!codigoCell || !unitarioTd || !custoTd || !inputQtd) return;

      const codigo = String(codigoCell.textContent || "").trim();
      const precoAPI = lookup[codigo];
      if (!precoAPI) return;

      const precoAtual = toNumber(unitarioTd?.textContent);
      if (Math.abs(precoAtual - precoAPI) > 0.009) {
        linhasDivergentes.push({ tr, precoAPI, precoAtual, codigo, inputQtd, custoTd, unitarioTd });
      }
    });

    if (linhasDivergentes.length === 0) {
      alert("✅ Todos os preços estão atualizados.");
      return;
    }

    if (exigirAutorizacao) {
      const tokenOuFalse = await mostrarPopupGestor();
      podeAtualizarValores = !!tokenOuFalse;
    } else {
      podeAtualizarValores = false;
      alert("⚠️ Há preços divergentes. Linhas foram destacadas.");
    }

    linhasDivergentes.forEach(({ tr, precoAPI, precoAtual, inputQtd, custoTd, unitarioTd, codigo }) => {
      const qtd = parseFloat(inputQtd.value || "1");

      if (podeAtualizarValores) {
        unitarioTd.textContent = `R$ ${precoAPI.toFixed(2)}`;
        const novoCustoFinal = precoAPI * qtd;
        custoTd.textContent = `R$ ${novoCustoFinal.toFixed(2)}`;
        tr.style.backgroundColor = "#e5ffe5";
        unitarioTd.style.color = "green";
        custoTd.style.color = "green";
        const prejuizo = precoAtual - precoAPI;
        console.log(`⚠️ Código ${codigo}: valor atualizado. Diferença de R$ ${prejuizo.toFixed(2)}`);
      } else {
        tr.style.backgroundColor = "#ffe5e5";
        unitarioTd.style.color = "red";
        custoTd.style.color = "red";
        console.log(`❌ Código ${codigo}: divergente. Mantido valor antigo R$ ${precoAtual.toFixed(2)} vs Omie R$ ${precoAPI.toFixed(2)}`);
      }
    });

    console.log("🔍 Verificação finalizada. Atualizações aplicadas conforme autorização.");
    ativarRecalculoEmTodasTabelas() 
    aguardarTabelasEExecutar(forcarEventosDescricao);
  } catch (err) {
    console.error("❌ Erro ao verificar preços:", err);
    alert("Erro ao verificar preços na Omie. Tente novamente mais tarde.");
  }
}

