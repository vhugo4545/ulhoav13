
const produtosMapeados = new Map();
let todosProdutos = [];
const sugestoesTemp = {}; // armazenamento temporário por bloco

document.addEventListener('DOMContentLoaded', carregarProdutos);

async function carregarProdutos() {
  try {
    const response = await fetch('https://ulhoa-0a02024d350a.herokuapp.com/produtos/visualizar');
    todosProdutos = await response.json();
    produtosMapeados.clear();
    todosProdutos.forEach(produto => {
      if (produto.descricao) {
        produtosMapeados.set(produto.descricao.trim().toLowerCase(), produto);
      }
    });
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
  }
}

function atualizarTituloAccordion(idSuffix, nome) {
  const titulo = document.getElementById(`titulo-accordion-${idSuffix}`);
  if (titulo) {
    const nomeLimpo = nome.trim();
    titulo.textContent = nomeLimpo || `Parâmetros e Produtos (${idSuffix})`;
  }
}





// Inclui pelo texto digitado no input
function incluirProduto(idSuffix) {
  const termo = document.getElementById(`input-${idSuffix}`).value.trim().toLowerCase();
  if (!termo) {
    alert("Digite ao menos 3 caracteres.");
    return;
  }

  // Tenta encontrar o produto correspondente na lista de todos os produtos
  const produto = todosProdutos.find(p => (p.descricao || '').trim().toLowerCase() === termo);
  if (!produto) {
    alert("Produto não encontrado.");
    return;
  }

  // Inclui diretamente via montagem da linha (sempre)
  montarLinhaProduto(idSuffix, produto);

  // Limpa campo de busca e sugestões
  document.getElementById(`input-${idSuffix}`).value = '';
  limparSugestoes(idSuffix);
}
function removerBloco(id) {
  const confirmar = confirm("Tem certeza que deseja excluir este grupo?");
  setTimeout(() => {
    adicionarTotalizadoresPorAmbienteComAgrupamento();
  }, 100); // ou 100m
  if (!confirmar) return;

  const bloco = document.getElementById(id);
  if (bloco) {
    bloco.remove();
  }
}


function abrirSubstituirProduto(botao) {
  const linha = botao.closest("tr");
  const idSuffix = linha?.dataset?.idSuffix;

  if (!idSuffix) {
    console.warn("❌ ID do grupo (idSuffix) não encontrado na linha.");
    return;
  }

  // Evita abrir mais de uma linha de substituição
  if (linha.nextElementSibling?.classList.contains("linha-substituir")) return;

  // Cria nova linha de substituição
  const novaLinha = document.createElement("tr");
  novaLinha.classList.add("linha-substituir");
  novaLinha.dataset.idSuffix = idSuffix;

  novaLinha.innerHTML = `
    <td colspan="8">
      <div class="position-relative">
        <div class="d-flex gap-2">
          <input type="text"
                 id="input-${idSuffix}-sub"
                 class="form-control form-control-sm"
                 placeholder="Novo produto..."
                 oninput="mostrarSugestoesSub(this, '${idSuffix}')">
          <button class="btn btn-success btn-sm" onclick="confirmarSubstituicao(this)">Confirmar</button>
          <button class="btn btn-outline-secondary btn-sm" onclick="this.closest('tr').remove()">Cancelar</button>
        </div>
        <div id="sugestoes-${idSuffix}-sub"
             class="tabela-sugestoes position-absolute w-100 mt-1 bg-white border"
             style="z-index:1000;"></div>
      </div>
    </td>
  `;

  linha.parentNode.insertBefore(novaLinha, linha.nextSibling);
}


function mostrarSugestoes(input, idSuffix) {
  const termo = input.value.trim().toLowerCase();
  const container = document.getElementById(`sugestoes-${idSuffix}`);
  if (!container) return;
  if (termo.length < 3) {
    container.innerHTML = '';
    return;
  }
  const resultados = todosProdutos
    .filter(prod => (prod.descricao || '').toLowerCase().includes(termo))
    .slice(0, 6);
  sugestoesTemp[idSuffix] = resultados;
  container.innerHTML = resultados.length
    ? `<table class="table table-sm mb-0"><tbody>${
        resultados.map((prod, i) => `
          <tr>
            <td>${prod.descricao}</td>
            <td>R$ ${parseFloat(prod.valor_unitario||0).toFixed(2)}</td>
            <td><button class="btn btn-success btn-sm"
                        onclick="incluirProdutoPeloIndice('${idSuffix}', ${i})">➕</button></td>
          </tr>`).join("")
      }</tbody></table>`
    : `<div class="text-muted px-2">Nenhum resultado encontrado</div>`;
}

function incluirProdutoPeloIndice(idSuffix, index) {
  const lista = sugestoesTemp[idSuffix];
  if (!lista || !lista[index]) return alert("Produto não encontrado.");
  montarLinhaProduto(idSuffix, lista[index]);
}

function montarLinhaProduto(idSuffix, produto) {
  const tabelaBody = document.querySelector(`#tabela-${idSuffix} tbody`);
  if (!tabelaBody) return;

  const linha = document.createElement("tr");
  linha.dataset.idSuffix = idSuffix;

  const descricao     = decodeHTMLEntities(produto.descricao || "");
  const utilizacao    = decodeHTMLEntities(produto.utilizacao || "Uso");
  const valorUnitario = parseFloat(produto.valor_unitario || 0).toFixed(2);
  const codigo        = produto.codigo_produto || produto.codigo || "COD";

  linha.innerHTML = `
    <td>${utilizacao}</td>
    <td>${descricao}</td>
    <td class="custo-unitario" data-valor-original="${valorUnitario}">R$ ${valorUnitario}</td>
    <td class="venda-unitaria" data-valor-original="${valorUnitario}">R$ ${valorUnitario}</td>
    <td>${codigo}</td>
    <td>
      <input type="number" class="form-control form-control-sm quantidade" value="1">
    </td>
    <td class="quantidade-desejada">
      <span class="formula-result" data-formula="" data-group-id="${idSuffix}" onclick="tornarCampoEditavel(this)">1</span>
    </td>
    <td>
      <button class="btn btn-danger btn-sm d-block mb-1" onclick="this.closest('tr').remove()">Remover</button>
      <button class="btn btn-secondary btn-sm d-block" onclick="abrirSubstituirProduto(this)">Substituir</button>
    </td>
  `;

  tabelaBody.appendChild(linha);
}




// Limpa sugestões (principal ou sub)
function limparSugestoes(idSuffix, sub=false) {
  const sel = sub ? `#sugestoes-${idSuffix}-sub` : `#sugestoes-${idSuffix}`;
  const div = document.querySelector(sel);
  if (div) div.innerHTML = "";
}

// Abre linha para substituir o produto
function abrirSubstituirProduto(botao, idSuffix) {
  const linha = botao.closest("tr");
  if (linha.nextElementSibling?.classList.contains("linha-substituir")) return;

  const novaLinha = document.createElement("tr");
  novaLinha.classList.add("linha-substituir");
  novaLinha.dataset.idSuffix = idSuffix;

  novaLinha.innerHTML = `
    <td colspan="8">
      <div class="position-relative">
        <div class="d-flex gap-2">
          <input type="text"
                 id="input-${idSuffix}-sub"
                 class="form-control form-control-sm"
                 placeholder="Novo produto..."
                 oninput="mostrarSugestoesSub(this, '${idSuffix}')">
          <button class="btn btn-success btn-sm" onclick="confirmarSubstituicao(this)">Confirmar</button>
          <button class="btn btn-outline-secondary btn-sm" onclick="this.closest('tr').remove()">Cancelar</button>
        </div>
        <div id="sugestoes-${idSuffix}-sub" class="tabela-sugestoes position-absolute w-100 mt-1 bg-white border" style="z-index:1000;"></div>
      </div>
    </td>
  `;

  linha.parentNode.insertBefore(novaLinha, linha.nextSibling);
}

// Mostra sugestões na sublinha
function normalizarTexto(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // Remove acentos
    .replace(/[\s"'\/\\\-.,]+/g, " ")  // Troca pontuações por espaço
    .trim();
}

function mostrarSugestoesSub(input, idSuffix) {
  const termo = input.value.trim();
  const container = document.getElementById(`sugestoes-${idSuffix}-sub`);
  if (!container) return;
  if (termo.length < 3) {
    container.innerHTML = '';
    return;
  }

  // Divide em termos (removendo espaços extras), normaliza cada um
  const termos = termo.split(";").map(t => normalizarTexto(t)).filter(Boolean);

  const resultados = todosProdutos.filter(prod => {
    const descNorm = normalizarTexto(prod.descricao);
    // Só retorna se TODOS os termos existirem na descrição normalizada
    return termos.every(term => descNorm.includes(term));
  }).slice(0, 6);

  sugestoesTemp[`${idSuffix}-sub`] = resultados;

  container.innerHTML = resultados.length
    ? `<table class="table table-sm mb-0"><tbody>${
        resultados.map((prod, i) => `
          <tr onclick="substituirProdutoPeloIndice('${idSuffix}', ${i})" style="cursor:pointer">
            <td>${prod.descricao}</td>
            <td>R$ ${parseFloat(prod.valor_unitario||0).toFixed(2)}</td>
          </tr>`).join("")
      }</tbody></table>`
    : `<div class="text-muted px-2">Nenhum resultado encontrado</div>`;
}


function substituirProdutoPeloIndice(idSuffix, index) {
  const key = `${idSuffix}-sub`;
  const lista = sugestoesTemp[key];
  if (!lista || !lista[index]) return alert("Produto não encontrado.");

  const prod = lista[index];

  const linhaSub = document.querySelector(`tr.linha-substituir[data-id-suffix="${idSuffix}"]`);
  if (!linhaSub) return;
  const linhaOrig = linhaSub.previousElementSibling;
  if (!linhaOrig) return;

  // Elementos da linha original
  const inputQuantidade = linhaOrig.querySelector("input.quantidade");
  const celulaQtdDesejada = linhaOrig.querySelector(".quantidade-desejada");
  const inputQtdDesejada = celulaQtdDesejada?.querySelector("input");

  const tdDescricao = linhaOrig.children[1];
  const tdCusto     = linhaOrig.querySelector(".custo-unitario");
  const tdVenda     = linhaOrig.querySelector(".venda-unitaria");
  const tdCodigo    = linhaOrig.children[4];

  // Atualiza diretamente os valores visíveis
  if (tdDescricao) tdDescricao.textContent = decodeHTMLEntities(prod.descricao || "");
  if (tdCusto)     tdCusto.textContent     = `R$ ${parseFloat(prod.valor_unitario || 0).toFixed(2)}`;
  if (tdVenda) {
    const valorVenda = parseFloat(prod.valor_unitario || 0).toFixed(2);
    tdVenda.textContent = `R$ ${valorVenda}`;
    tdVenda.dataset.valorOriginal = valorVenda;
  }
  if (tdCodigo) tdCodigo.textContent = prod.codigo_produto || "COD";

  // Zera a quantidade manual
  if (inputQuantidade) inputQuantidade.value = 0;

  // ❗ NÃO altera a célula quantidade-desejada (mantém input + fórmula + valor)

  // Remove linha de substituição e limpa sugestões
  linhaSub.remove();
  limparSugestoes(idSuffix, true);

  const sugestaoSub = document.getElementById(`sugestoes-${idSuffix}-sub`);
  if (sugestaoSub) sugestaoSub.innerHTML = "";

  const inputSub = document.getElementById(`input-${idSuffix}-sub`);
  if (inputSub) inputSub.value = "";

  // Limpa linhas órfãs
  document.querySelectorAll(".linha-substituir")?.forEach(e => e.remove());

  // Reativa blur/eval global se necessário
  if (typeof simularFocusEBlurEmTodosCamposFormula === "function") {
    simularFocusEBlurEmTodosCamposFormula();
  }
}



function decodeHTMLEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}




function limparFormulaHTML(f) {
  if (!f) return "";
  return f
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

function confirmarSubstituicao(botao) {
   alert("função")
  const linhaSub = botao.closest("tr");
  const idSuffix = linhaSub.dataset.idSuffix;
  const input = linhaSub.querySelector("input");
  const desc = input.value.trim().toLowerCase();
  if (!desc) return alert("Produto inválido.");

  const prod = produtosMapeados.get(desc);
  if (!prod) return alert("Produto não encontrado.");

  const linhaOrig = linhaSub.previousElementSibling;

  // Referências às células da linha original
  const celulaQtdDesejada = linhaOrig.querySelector(".quantidade-desejada");
  const tdUtilizacao = linhaOrig.children[0];
  const tdDescricao  = linhaOrig.children[1];
  const tdCusto      = linhaOrig.querySelector(".custo-unitario");
  const tdVenda      = linhaOrig.querySelector(".venda-unitaria");
  const tdCodigo     = linhaOrig.children[4];
  const inputQtd     = linhaOrig.querySelector("input.quantidade");

  // Atualiza conteúdo das células
  if (tdUtilizacao) tdUtilizacao.textContent = prod.utilizacao || "Uso";
  if (tdDescricao)  tdDescricao.textContent  = prod.descricao || "";

  const valor = parseFloat(prod.valor_unitario || 0).toFixed(2);

  if (tdCusto) tdCusto.textContent = `R$ ${valor}`;
  if (tdVenda) {
    tdVenda.textContent = `R$ ${valor}`;
    tdVenda.dataset.valorOriginal = valor;
  }
  if (tdCodigo) tdCodigo.textContent = prod.codigo_produto || "COD";
  if (inputQtd) inputQtd.value = 0; // Zera a quantidade manual

  // Avalia fórmula da quantidade desejada e atualiza a célula com <span>
  let formula = "";
  if (celulaQtdDesejada) {
    const campo = celulaQtdDesejada.querySelector("input, span");
    formula = campo?.dataset?.formula || campo?.value || celulaQtdDesejada?.textContent || "";
  }

  // Prepara fórmula
  formula = formula.replace(/,/g, "."); // troca vírgulas por ponto
  if (typeof limparFormulaHTML === "function") {
    formula = limparFormulaHTML(formula);
  }

  const variaveis = typeof obterVariaveisDoGrupo === "function"
    ? obterVariaveisDoGrupo(idSuffix)
    : {};

  try {
    if (typeof evaluateFormula === "function") {
      const resultado = evaluateFormula(formula, variaveis);

     celulaQtdDesejada.innerHTML = `
  <input type="text" class="form-control form-control-sm quantidade-desejada"
         value="${resultado}" data-formula="${formula}" data-group-id="${idSuffix}">
`;

    }
  } catch (erro) {
    console.error("❌ Erro ao avaliar fórmula:", formula, erro);
    celulaQtdDesejada.innerHTML = `<span class="text-danger">Erro</span>`;
  }

  // Remove a linha de substituição e limpa sugestões
  linhaSub.remove();
  limparSugestoes(idSuffix, true);

  // Reativa blur/focus global
  if (typeof simularFocusEBlurEmTodosCamposFormula === "function") {
    simularFocusEBlurEmTodosCamposFormula();
  }
}

