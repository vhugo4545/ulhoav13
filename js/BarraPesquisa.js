// 📦 carregarProdutosModelo.js

const loadingOverlay = document.createElement("div");
loadingOverlay.id = "loadingOverlay";
loadingOverlay.style.position = "fixed";
loadingOverlay.style.top = 0;
loadingOverlay.style.left = 0;
loadingOverlay.style.width = "100%";
loadingOverlay.style.height = "100%";
loadingOverlay.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
loadingOverlay.style.zIndex = 9999;
loadingOverlay.style.display = "flex";
loadingOverlay.style.justifyContent = "center";
loadingOverlay.style.alignItems = "center";
loadingOverlay.innerHTML = `
  <div class="text-center">
    <div class="spinner-border text-primary mb-3" role="status"></div>
    <p class="text-primary fw-semibold">Carregando proposta modelo...</p>
  </div>`;
document.body.appendChild(loadingOverlay);

let grupos = [];
carregarPropostaModelo();

async function carregarPropostaModelo() {
  const id = "6851c413b30e3e4dda354132"; // ID fixo da proposta
  const url = `https://ulhoa-0a02024d350a.herokuapp.com/api/propostas/${id}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro ao buscar proposta por ID");

    const proposta = await res.json();

    if (!proposta?.grupos) {
      console.warn("❌ Proposta com ID não encontrada ou sem grupos.");
      return;
    }

    grupos = proposta.grupos;
    requestIdleCallback(() => renderLista());
  } catch (err) {
    console.error("❌ Erro ao carregar proposta por ID:", err);
  } finally {
    loadingOverlay.remove();
  }
}

function formatarNome(nome) {
  if (!nome || typeof nome !== "string") return "";
  return nome
    .toLowerCase()
    .split(" ")
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(" ");
}


function renderLista(filtro = "") {

  const searchInput = document.getElementById("buscaProduto");
  const grupoList = document.getElementById("sugestoesProdutos");
  grupoList.innerHTML = "";
  const nomesUnicos = new Set();

  grupos
    .filter(grupo => grupo.nome?.toLowerCase().includes(filtro.toLowerCase()))
    .forEach(grupo => {
      if (!nomesUnicos.has(grupo.nome)) {
        nomesUnicos.add(grupo.nome);

        const li = document.createElement("li");
        const nomeFormatado = formatarNome(grupo.nome);
        li.textContent = nomeFormatado;
        li.className = "list-group-item list-group-item-action";
        li.style.cursor = "pointer";

        li.addEventListener("click", () => {
          const grupoSelecionado = grupos.find(g => g.nome === grupo.nome);
          if (!grupoSelecionado) return;

          searchInput.value = "";
          grupoList.style.display = "none";

          criarBlocoDeProposta(nomeFormatado);

          setTimeout(() => {
            const ultimoBloco = document.querySelector("#blocosProdutosContainer .main-container:last-child");
            if (!ultimoBloco) return;

            const parametros = grupoSelecionado.parametros || {};
            const inputs = ultimoBloco.querySelectorAll(`input[name]`);
            inputs.forEach(input => {
              const param = input.name;
              if (parametros[param] !== undefined) {
                input.value = parametros[param];
              }
            });

            const tabela = ultimoBloco.querySelector(`table tbody`);
            const totalTd = ultimoBloco.querySelector(`table tfoot td[colspan="6"], table tfoot td:last-child`);
            tabela.innerHTML = "";

            let total = 0;
           (grupoSelecionado.itens || []).forEach(item => {
  const quantidadeCalculada = calcularQuantidadeDesejada(item, { groupId: ultimoBloco.id });
  const quantidadeArredondada = Math.ceil(quantidadeCalculada || 1);
  const custoUnitario = parseFloat(item.custo) || 0;

  // ✅ Agora usa a quantidade ARREDONDADA no cálculo
  const valorTotal = custoUnitario * quantidadeArredondada;

  const tr = document.createElement("tr");
  tr.dataset.idSuffix = ultimoBloco.id;

 tr.innerHTML = `
 <td>
  <textarea class="form-control form-control-sm" rows="3">
${item.descricao_utilizacao|| "Utilização Barra de pesquisa"}
  </textarea>
</td>


  <td>${item.nome_produto || item.nome || ""}</td>
  <td class="custo-unitario">R$ ${valorTotal.toFixed(2)}</td>
  <td class="venda-unitaria">R$ ${custoUnitario.toFixed(2)}</td>
  <td>${item.codigo_omie || ""}</td>
  <td>
    <input type="number" class="form-control form-control-sm quantidade"
           value="${quantidadeArredondada}" min="1">
  </td>
  <td>
    <input type="text" class="form-control form-control-sm quantidade-desejada"
           value="${quantidadeCalculada}"
           data-formula="${item.formula_quantidade || ""}">
  </td>
  <td>
    <button class="btn btn-sm btn-danger d-block mb-1" onclick="this.closest('tr').remove()">Remover</button>
    <button class="btn btn-sm btn-secondary d-block" onclick="abrirSubstituirProduto(this)">Substituir</button>
  </td>`;

  tabela.appendChild(tr);
  total += valorTotal;
});


            if (totalTd) {
              totalTd.innerHTML = `<strong>R$ ${total.toFixed(2)}</strong>`;
            }

            new Sortable(tabela, {
              animation: 100,
              handle: "td",
              ghostClass: "bg-warning-subtle"
            });

            inicializarCamposDeFormulaQuantidade(ultimoBloco, { groupId: ultimoBloco.id });

          }, 100);
        });

        grupoList.appendChild(li);
      }
    });

  grupoList.style.display = grupoList.children.length > 0 ? "block" : "none";
}



document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("buscaProduto");
  const grupoList = document.getElementById("sugestoesProdutos");

  searchInput.addEventListener("input", () => renderLista(searchInput.value));

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#sugestoesProdutos") && e.target.id !== "buscaProduto") {
      grupoList.style.display = "none";
    }
  });

  new Sortable(document.getElementById("blocosProdutosContainer"), {
    animation: 200,
    handle: ".accordion-header",
    ghostClass: "bg-light"
  });
});

window.blocoIndex ??= 1;

// 💾 Cache global dos produtos da Omie
window._produtosOmieCache = null;

async function atualizarPrecosOmieNaDOM() {
  const ENDPOINT = "https://ulhoa-0a02024d350a.herokuapp.com/produtos/visualizar";

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

  try {
    // ⚡ Usa cache se já estiver carregado
    if (!window._produtosOmieCache) {
      const res = await fetch(ENDPOINT);
      if (!res.ok) throw new Error(`Erro ao buscar produtos: ${res.status}`);
      const listaAPI = await res.json();
      window._produtosOmieCache = listaAPI;
    }

    const listaAPI = window._produtosOmieCache;

    // Monta dicionário por código
    const lookup = {};
    listaAPI.forEach((p) => {
      const codigo = String(p.codigo_produto || p.codigo || "").trim();
      const preco = p.preco_unitario ?? p.valor_unitario ?? p.preco ?? p.price ?? 0;
      if (codigo) lookup[codigo] = toNumber(preco);
    });

    const linhasCorrigidas = [];

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
        const qtd = parseFloat(inputQtd?.value?.replace(",", ".") || "1") || 1;
        const novoCustoFinal = precoAPI * qtd;

        unitarioTd.textContent = `R$ ${precoAPI.toFixed(2)}`;
        custoTd.textContent = `R$ ${novoCustoFinal.toFixed(2)}`;

        tr.style.backgroundColor = "#e5ffe5";
        unitarioTd.style.color = "green";
        custoTd.style.color = "green";

        linhasCorrigidas.push(codigo);
      }
    });

    // ⏳ Aguarda DOM se estabilizar antes de reativar sanfonas
    setTimeout(() => {
      document.querySelectorAll(".accordion-collapse").forEach(el => {
        const instance = bootstrap.Collapse.getOrCreateInstance(el);
        if (!el.classList.contains("show")) {
          instance.hide();
        } else {
          instance.show();
        }
      });
    }, 500); // ⏱️ Ajuste o tempo se necessário

    // Recalcula totais
    if (typeof ativarRecalculoEmTodasTabelas === "function") {
      ativarRecalculoEmTodasTabelas();
    }

    const mensagem = `${linhasCorrigidas.length} produto(s) com preço atualizado com sucesso.`;

    if (!window.location.pathname.includes("criar.html")) {
      if (linhasCorrigidas.length > 0) {
        mostrarPopupCustomizado("✅ Preços Atualizados", mensagem, "success");
        
        mostrarPopupCustomizado("⚠️ Ajustes Realizados", "Os preços foram atualizados com a Omie. Por conta disso, os campos de desconto e parcelas foram resetados para garantir consistência nos valores.", "warning");
        ativarEventosDescricao()
      } else {
        alert("✔️ Todos os preços já estavam atualizados.");
      }
    }

  } catch (err) {
    console.error("❌ Erro ao atualizar preços:", err);
    if (!window.location.pathname.includes("criar.html")) {
      alert("Erro ao atualizar preços com a Omie.");
    }
  }
}

function ativarEventosDescricao() {
  setTimeout(() => {
    console.log("Campos Ajustados")
    const campos = document.querySelectorAll('input[name="descricao"]');

    campos.forEach(campo => {
      campo.dispatchEvent(new Event('focus',  { bubbles: true }));
      campo.dispatchEvent(new Event('input',  { bubbles: true }));
      campo.dispatchEvent(new Event('change', { bubbles: true }));
      campo.dispatchEvent(new Event('blur',   { bubbles: true }));
    });
  }, 2000); // 2 segundos de espera
}



function forcarEventosDescricao(input) {
  if (!input) return;

  const valorOriginal = input.value;
  
  // Foco
  input.focus();

  // Simula digitação (sem mudar valor)
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  
  // Foco perdido
  input.blur();

  // Força DOM reatividade (alguns sistemas precisam disso)
  input.value = valorOriginal + " ";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.value = valorOriginal;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}
