async function verificarTokenOuRedirecionar() {
  console.log("token Valido")
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "../index.html";
    return;
  }

  try {
    const resposta = await fetch("https://ulhoa-0a02024d350a.herokuapp.com/api/auth/verificar-token", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!resposta.ok) {
      // Token inválido ou expirado
 
    
      return;
    }

    const dados = await resposta.json();
   

  } catch (erro) {
    console.error("Erro ao validar token:", erro);
    window.location.href = "/";
  }
}
verificarTokenOuRedirecionar()