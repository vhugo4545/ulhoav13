function ativarAvisoAntesDeSair() {
  window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
    e.returnValue = ""; // Necessário para que o navegador mostre o alerta padrão
  });
  console.log("Ativada")
}
ativarAvisoAntesDeSair()