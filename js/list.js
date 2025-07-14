document.addEventListener("DOMContentLoaded", async () => {
  mostrarCarregando()
  const tableBody     = document.querySelector("#data-table tbody");
  const prevPageBtn   = document.getElementById("prev-page");
  const nextPageBtn   = document.getElementById("next-page");
  const pageInfo      = document.getElementById("page-info");
  const searchInput   = document.getElementById("search");
  const filterSeller  = document.getElementById("filter-seller");
  const filterStatus  = document.getElementById("filter-status");
  const loadingDiv    = document.getElementById("loading");
  const table         = document.getElementById("data-table");
  const alertaVencimento = document.getElementById("alerta-vencimento");

  const API_BASE = "https://ulhoa-0a02024d350a.herokuapp.com";
  const TOKEN = localStorage.getItem("accessToken");

  let data = [];
  let currentPage = 1;
  const rowsPerPage = 10;

  try {
    loadingDiv.style.display = "block";
    table.style.display = "none";

    const res = await fetch(`${API_BASE}/api/propostas`, {
      headers: {
        "Authorization": `Bearer ${TOKEN}`
      },
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error(`Erro ${res.status}: ${await res.text()}`);
    }

    const propostas = await res.json();
    const sellers = new Set();

    const hoje = new Date();
    const vencidas = [];
    const prestesAVencer = [];

    data = propostas
      .filter(p => p.tipoProposta === "editavel")
      .map(p => {
        const campos = p.camposFormulario || {};
        const grupos = p.grupos || [];

        const total = grupos.reduce((soma, grupo) => {
          return soma + grupo.itens.reduce((subtotal, item) => {
            const preco = parseFloat(item.preco) || 0;
            const qtd = parseFloat(item.quantidade) || 1;
            return subtotal + (preco * qtd);
          }, 0);
        }, 0);

        const clienteObj = (campos.clientes && campos.clientes[0]) || {};
        const nomeCliente = clienteObj.nome_razao_social || "Cliente sem nome";
        const vendedor = campos.vendedorResponsavel || "Indefinido";
        const status = p.statusOrcamento || "Sem status";
        const tipoProposta = p.tipoProposta || "--";
        const nomeEvento = campos.nomeEvento || "--";

        const createdAt = new Date(p.criado_em || p.createdAt);
        const dataCriacao = createdAt.toLocaleDateString("pt-BR");

        const validade = calcularValidade(createdAt, 5);
        const isVencida = validade < hoje;
        const diasParaVencer = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
        const isPrestes = !isVencida && diasParaVencer <= 2;

        if (isVencida) vencidas.push({ nomeCliente, validade });
        if (isPrestes) prestesAVencer.push({ nomeCliente, validade });

        sellers.add(vendedor);

        return {
          _id: p._id,
          cliente: nomeCliente,
          vendedor,
          evento: nomeEvento,
          tipoProposta,
          status,
          date: dataCriacao,
          value: `R$ ${total.toFixed(2)}`,
          validade: validade.toLocaleDateString("pt-BR"),
          vencida: isVencida
        };
      })
     

    data.forEach((item, index) => {
      item.id = index + 1;
    });

    sellers.forEach(vendedor => {
      const option = document.createElement("option");
      option.value = vendedor;
      option.textContent = vendedor;
      filterSeller.appendChild(option);
    });

    renderTable();
    renderAlertas(vencidas, prestesAVencer);
  } catch (err) {
    console.error("Erro ao buscar propostas:", err);
    loadingDiv.innerHTML = "❌ Erro ao carregar propostas.";
    return;
  } finally {
    loadingDiv.style.display = "none";
    table.style.display = "table";
  }

  function calcularValidade(dataInicial, diasUteis) {
    const result = new Date(dataInicial);
    let adicionados = 0;
    while (adicionados < diasUteis) {
      result.setDate(result.getDate() + 1);
      const dia = result.getDay();
      if (dia !== 0 && dia !== 6) adicionados++;
    }
    return result;
  }

function renderTable(filteredData = data) {
  ocultarCarregando()
  const tipoUsuario = localStorage.getItem("usuarioTipo");
  const nomeUsuario = localStorage.getItem("usuarioNome");

  // Se não for admin, filtra apenas propostas do vendedor logado
  if (tipoUsuario !== "admin") {
    filteredData = filteredData.filter(item => item.vendedor === nomeUsuario);
  }

  tableBody.innerHTML = "";
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  filteredData.slice(start, end).forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${start + index + 1}</td>
      <td>${item.date}</td>
      <td>${item.vendedor}</td>
      <td>${item.cliente}</td>
      <td>${item.evento}</td>
      <td>${item.tipoProposta}</td>
      <td><span class="status ${item.status.toLowerCase().replace(/\s/g, "-")}">${item.status}</span></td>
      <td>
        <span title="Validade da proposta">${item.validade}</span>
        ${item.vencida ? '<br><span style="color:red; font-weight:bold;">VENCIDA</span>' : ''}
      </td>
      <td class="actions">
        <button class="edit-btn" data-id="${item._id}">
          <span class="material-icons-outlined">edit</span>
        </button>
        
      </td>
    `;
    tableBody.appendChild(row);
  });

  pageInfo.textContent = `Página ${currentPage}`;
  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = end >= filteredData.length;

  addActionEventListeners(filteredData);
}


  function renderAlertas(vencidas, prestesAVencer) {
    if (!alertaVencimento) return;
    alertaVencimento.innerHTML = "";

    if (vencidas.length > 0) {
      const vencidasDiv = document.createElement("div");
      vencidasDiv.innerHTML = `<h4>Propostas Vencidas:</h4>` + vencidas.map(p => `
        <div class="alert-item vencida">
          ⚠️ ${p.nomeCliente} — ${new Date(p.validade).toLocaleDateString("pt-BR")}
        </div>`).join("");
      alertaVencimento.appendChild(vencidasDiv);
    }

    if (prestesAVencer.length > 0) {
      const prestesDiv = document.createElement("div");
      prestesDiv.innerHTML = `<h4>Próximas a Vencer:</h4>` + prestesAVencer.map(p => `
        <div class="alert-item prestes">
          ⏳ ${p.nomeCliente} — ${new Date(p.validade).toLocaleDateString("pt-BR")}
        </div>`).join("");
      alertaVencimento.appendChild(prestesDiv);
    }
  }

  function addActionEventListeners(filteredData) {
    document.querySelectorAll(".delete-btn").forEach(button => {
      button.addEventListener("click", event => {
        const itemId = event.currentTarget.getAttribute("data-id");
        data = data.filter(item => item._id !== itemId);
        filterTable();
      });
    });

    document.querySelectorAll(".edit-btn").forEach(button => {
      button.addEventListener("click", event => {
        const itemId = event.currentTarget.getAttribute("data-id");
        if (itemId) {
          window.location.href = `editar.html?id=${itemId}`;
        } else {
          alert("❌ ID não encontrado.");
        }
      });
    });

    document.querySelectorAll(".duplicate-btn").forEach(button => {
      button.addEventListener("click", event => {
        const itemId = event.currentTarget.getAttribute("data-id");
        const originalItem = data.find(item => item._id === itemId);
        if (originalItem) {
          const newItem = {
            ...originalItem,
            _id: "duplicado-" + Date.now(),
            id: data.length + 1
          };
          data.unshift(newItem);
          filterTable();
        }
      });
    });
  }

  function filterTable() {
    const searchText = searchInput.value.toLowerCase();
    const selectedSeller = filterSeller.value;
    const selectedStatus = filterStatus.value;

    const filteredData = data.filter(item => {
      const matchesSearch = Object.values(item).some(value =>
        value.toString().toLowerCase().includes(searchText)
      );
      const matchesSeller = selectedSeller === "" || item.vendedor === selectedSeller;
      const matchesStatus = selectedStatus === "" || item.status === selectedStatus;
      return matchesSearch && matchesSeller && matchesStatus;
    });

    currentPage = 1;
    renderTable(filteredData);
  }

  searchInput.addEventListener("input", filterTable);
  filterSeller.addEventListener("change", filterTable);
  filterStatus.addEventListener("change", filterTable);
  prevPageBtn.addEventListener("click", () => {
    currentPage--;
    renderTable();
  });
  nextPageBtn.addEventListener("click", () => {
    currentPage++;
    renderTable();
  });
});

function irParaPagina(pagina, params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = query ? `${pagina}?${query}` : pagina;
  window.location.href = url;
}
