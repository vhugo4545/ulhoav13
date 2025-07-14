
    function toggleForms() {
      const login = document.getElementById('loginForm');
      const cad = document.getElementById('cadastroForm');
      login.style.display = login.style.display === 'none' ? 'block' : 'none';
      cad.style.display = cad.style.display === 'none' ? 'block' : 'none';
    }
async function carregarVendedores() {
  const TOKEN = localStorage.getItem('accessToken');

  try {
    const response = await fetch('https://ulhoa-0a02024d350a.herokuapp.com/omie/vendedores', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
    });

    if (!response.ok) throw new Error('Erro ao buscar vendedores');

    const vendedores = await response.json(); // contém { cadastro: [...] }

    const select = document.getElementById('vendedorResponsavel');
    if (!select) {
      console.warn('⚠️ Elemento #vendedorResponsavel não encontrado no DOM.');
      return;
    }

    select.innerHTML = '<option value="">Selecione</option>';

    (vendedores.cadastro || []).forEach(v => {
      const nomeMaiusculo = v.nome.toUpperCase();
      const opt = new Option(nomeMaiusculo, nomeMaiusculo); // nome como texto e valor
      select.appendChild(opt);
    });

    console.log(
      `%c✅ ${vendedores.cadastro?.length || 0} vendedores carregados com sucesso.`,
      'color: green; font-weight: bold;'
    );

  } catch (err) {
    console.error('❌ Erro ao carregar vendedores:', err);
  }
}


    async function cadastrar() {
      const select = document.getElementById('cadastroNome');
      const nomesSelecionados = Array.from(select.selectedOptions).map(opt => opt.value);
      const nome = nomesSelecionados.join(', ');
      const email = document.getElementById('cadastroEmail').value;
      const senha = document.getElementById('cadastroSenha').value;
      const tipo = document.getElementById('cadastroTipo').value;

      const res = await fetch('https://ulhoa-0a02024d350a.herokuapp.com/api/auth/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha, tipo })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Cadastro realizado! Faça login.');
        location.reload();
      } else {
        alert(data.erro || 'Erro no cadastro');
      }
    }

    async function login() {
      const email = document.getElementById('loginEmail').value;
      const senha = document.getElementById('loginSenha').value;

      const res = await fetch('https://ulhoa-0a02024d350a.herokuapp.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuarioId', data.usuario.id);
        localStorage.setItem('usuarioNome', data.usuario.nome);
        localStorage.setItem('usuarioTipo', data.usuario.tipo);

        console.log("✅ Login realizado:");
        console.log("🆔 ID:", data.usuario.id);
        console.log("👤 Nome:", data.usuario.nome);
        console.log("🔐 Tipo:", data.usuario.tipo);
        console.log("🪪 Token:", data.token);

        window.location.href = 'pages/listagem.html';
      } else {
        alert(data.erro || 'Erro no login');
      }
    }
    async function carregarVendedoresCadastro() {
  try {
    const res = await fetch('https://ulhoa-0a02024d350a.herokuapp.com/omie/vendedores');
    const dados = await res.json();
    const vendedores = dados.cadastro || [];

    const select = document.getElementById('cadastroNome');
    if (!select) return;

    vendedores.forEach(v => {
      const opt = new Option(v.nome, v.nome); // nome como valor
      select.appendChild(opt);
    });

  } catch (err) {
    console.error('❌ Erro ao carregar vendedores para o cadastro:', err);
  }
}


    document.addEventListener('DOMContentLoaded', carregarVendedoresCadastro);
