// Vincula a função ao clique do botão (ajuste o id do botão se necessário)
document.getElementById("btnSalvarCliente")?.addEventListener("click", async function () {
  console.log("➡️ Botão 'Salvar Cliente' clicado.");
  const codigoOmie = await enviarClienteParaAPI();
  if (codigoOmie) {
    console.log("Cliente incluído! Código Omie:", codigoOmie);
  } else {
    console.log("Falha ao incluir cliente.");
  }
});

// Gera um código de integração aleatório (interno)
function gerarCodigoClienteIntegracao() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let codigo = "";
  for (let i = 0; i < 7; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  console.log("📦 Código de integração gerado:", codigo);
  return codigo;
}

// Função para remover caracteres não numéricos
function limparNumero(valor) {
  const limpo = (valor || "").replace(/\D/g, "");
  console.log("🔢 Número limpo:", limpo);
  return limpo;
}

// Aplica máscara dinâmica para CPF ou CNPJ (apenas visual)
function aplicarMascaraCnpjCpf(valor) {
  valor = limparNumero(valor);
  if (valor.length <= 11) {
    // CPF: 000.000.000-00
    return valor
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  } else {
    // CNPJ: 00.000.000/0000-00
    return valor
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
      .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2})/, "$1.$2.$3/$4-$5");
  }
}

// Validação de CPF (valor SEM pontuação)
function validarCPF(cpf) {
  cpf = limparNumero(cpf);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    console.warn("❌ CPF com tamanho inválido ou repetido:", cpf);
    return false;
  }
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += +cpf[i] * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== +cpf[9]) {
    console.warn("❌ Primeiro dígito verificador inválido para CPF:", cpf);
    return false;
  }
  soma = 0;
  for (let i = 0; i < 10; i++) soma += +cpf[i] * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  const valido = resto === +cpf[10];
  if (!valido) console.warn("❌ Segundo dígito verificador inválido para CPF:", cpf);
  else console.log("✅ CPF validado com sucesso:", cpf);
  return valido;
}

// Validação de CNPJ (valor SEM pontuação) - 100% funcional
function validarCNPJ(cnpj) {
  cnpj = limparNumero(cnpj);

  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
    console.warn("❌ CNPJ com tamanho inválido ou repetido:", cnpj);
    return false;
  }

  var tamanho = cnpj.length - 2;
  var numeros = cnpj.substring(0, tamanho);
  var digitos = cnpj.substring(tamanho);
  var soma = 0;
  var pos = tamanho - 7;

  for (var i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }

  var resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0), 10)) {
    console.warn("❌ Primeiro dígito verificador inválido para CNPJ:", cnpj);
    return false;
  }

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (var i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i), 10) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

  const valido = resultado === parseInt(digitos.charAt(1), 10);
  if (!valido) console.warn("❌ Segundo dígito verificador inválido para CNPJ:", cnpj);
  else console.log("✅ CNPJ validado com sucesso:", cnpj);
  return valido;
}

// Abre o popup e limpa os campos
function abrirPopupIncluirCliente() {
  console.log("🟢 Função abrirPopupIncluirCliente chamada.");
  const form = document.getElementById("popupCliente_form");
  const modalEl = document.getElementById("popupClienteModal");
  if (!form || !modalEl) {
    console.warn("⚠️ Popup ou formulário não encontrado.");
    return;
  }
  form.reset();
  console.log("Popup de inclusão de cliente aberto e formulário limpo.");
  new bootstrap.Modal(modalEl).show();
}

// Envia cliente para API (sempre sem pontuação no CPF/CNPJ)
async function enviarClienteParaAPI() {
  console.log("🟢 Função enviarClienteParaAPI chamada.");

  const form = document.getElementById("popupCliente_form");
  if (!form) {
    console.error("❌ Formulário popupCliente_form não encontrado!");
    return null;
  }
  console.log("Formulário capturado com sucesso:", form);

  // Checa campos críticos
  const campos = [
    "popupCliente_email",
    "popupCliente_cnpjcpf",
    "popupCliente_razao",
    "popupCliente_fantasia"
  ];
  for (const id of campos) {
    const el = document.getElementById(id);
    if (!el) {
      console.error("❌ Campo não encontrado:", id);
      return null;
    } else {
      console.log(`Campo ${id} OK. Valor:`, el.value);
    }
  }

  if (!form.checkValidity()) {
    console.warn("⚠️ Formulário de cliente inválido! Corrija os campos.");
    form.reportValidity();
    return null;
  }
  console.log("✅ Formulário validado!");

  const email = document.getElementById("popupCliente_email").value.trim();
  if (!email.includes("@")) {
    alert("⚠️ Por favor, insira um e-mail válido.");
    console.warn("❌ E-mail inválido:", email);
    return null;
  }
  console.log("✅ E-mail validado:", email);

  const cnpjCpfRaw = document.getElementById("popupCliente_cnpjcpf").value.trim();
  const cnpjCpf = limparNumero(cnpjCpfRaw);

  // Detecta tipo e valida
  let tipoValido = false;
  if (cnpjCpf.length === 11) tipoValido = validarCPF(cnpjCpf);
  if (cnpjCpf.length === 14) tipoValido = validarCNPJ(cnpjCpf);

  if (!tipoValido) {
    alert("⚠️ CPF ou CNPJ inválido.");
    console.warn("❌ CPF ou CNPJ inválido enviado:", cnpjCpfRaw, "Formatado:", cnpjCpf);
    return null;
  }
  console.log("✅ Documento válido:", cnpjCpf);

  
  mostrarCarregando(); // descomente depois de testar

  const cliente = {
    codigo_cliente_integracao: gerarCodigoClienteIntegracao(),
    razao_social: document.getElementById("popupCliente_razao").value.trim(),
    nome_fantasia: document.getElementById("popupCliente_fantasia").value.trim(),
    email,
    cnpj_cpf: cnpjCpf, // SEM pontuação
    estado: "MG"
  };

  console.log("➡️ Enviando cliente para API:", cliente);

  try {
    const resposta = await fetch("https://ulhoa-0a02024d350a.herokuapp.com/clientes/incluirCliente", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente),
    });
    console.log("⏳ Aguardando resposta da API...");

    // Só segue se for ok!
    if (resposta.ok) {
      const resultado = await resposta.json();
      const codigoOmie = resultado?.codigo_cliente_omie || "";

      console.log("✅ Cliente incluído com sucesso! Código Omie:", codigoOmie);
      bootstrap.Modal.getInstance(document.getElementById("popupClienteModal"))?.hide();

      preencherCamposCliente({
        nome_razao_social: cliente.razao_social,
        codigoOmie,
        cpfCnpj: cliente.cnpj_cpf,
        nome_contato: cliente.nome_fantasia,
        funcao: "",
        telefone: ""
      });

      const mensagem = `Cliente ${cliente.razao_social} foi cadastrado com sucesso e está disponível para seleção.Código Omie:</b> ${codigoOmie}`;
      ocultarCarregando(); // descomente depois de testar
      mostrarPopupCustomizado("✅ Cliente incluído com sucesso!", mensagem, "success");

      // Retorna o código Omie para uso externo, se desejar
      return codigoOmie;
    } else {
      let erroMensagem;
      try {
        const resultado = await resposta.json();
        erroMensagem = resultado?.message || "Erro inesperado ao incluir cliente.";
      } catch (e) {
        erroMensagem = "Erro inesperado ao incluir cliente.";
      }
      console.error("❌ Erro ao incluir cliente:", erroMensagem);
      mostrarPopupCustomizado("❌ Erro ao incluir cliente", erroMensagem, "danger");
      //ocultarCarregando();
      return null;
    }
  } catch (err) {
    const erroMensagem = "Erro inesperado ao incluir cliente.";
    console.error("❌ Erro inesperado no catch ao incluir cliente:", err);
    mostrarPopupCustomizado("❌ Erro ao incluir cliente", erroMensagem, "danger");
    //ocultarCarregando();
    return null;
  }
}

// Aplica máscara ao digitar (apenas visual, o valor real sempre vai "limpo" para API)
document.addEventListener("input", function (e) {
  if (e.target.id === "popupCliente_cnpjcpf") {
    const antigo = e.target.value;
    e.target.value = aplicarMascaraCnpjCpf(e.target.value);
    console.log("✍️ Campo CNPJ/CPF digitado:", antigo, "-> mascarado:", e.target.value);
  }
});

// Preenche campos no formulário principal (após inclusão do cliente)
function preencherCamposCliente(cliente) {
  console.log("🟢 Função preencherCamposCliente chamada:", cliente);
  const container = document.querySelector(".cliente-item");
  if (!container) {
    console.warn("⚠️ Container de cliente não encontrado para preenchimento!");
    return;
  }
  container.querySelector(".razaoSocial").value = cliente.nome_razao_social || "";
  container.querySelector(".codigoCliente").value = cliente.codigoOmie || "";
  container.querySelector(".cpfCnpj").value = cliente.cpfCnpj || "";
  container.querySelector(".nomeContato").value = cliente.nome_contato || "";
  container.querySelector(".funcaoCliente").value = cliente.funcao || "";
  container.querySelector(".telefoneCliente").value = cliente.telefone || "";
  console.log("✅ Campos do cliente preenchidos no formulário principal:", cliente);
}
