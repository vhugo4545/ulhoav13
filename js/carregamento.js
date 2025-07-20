function mostrarCarregando() {
  try {
    // Verifica e adiciona CSS só uma vez
    if (!document.getElementById('estilo-overlay-carregando')) {
      const estilo = document.createElement('style');
      estilo.id = 'estilo-overlay-carregando';
      estilo.innerHTML = `
        #overlay-carregando {
          position: fixed !important;
          top: 0; left: 0;
          width: 100vw; height: 100vh;
          background: rgba(0, 0, 0, 0.7);
          z-index: 2147483647 !important;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          backdrop-filter: blur(2px);
        }
        #overlay-carregando .spinner {
          width: 60px;
          height: 60px;
          border: 6px solid rgba(255, 255, 255, 0.2);
          border-top: 6px solid #fff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          box-shadow: 0 0 15px rgba(0,0,0,0.4);
        }
        #overlay-carregando .texto {
          color: #fff;
          margin-top: 15px;
          font-size: 1rem;
          font-family: Arial, sans-serif;
          opacity: 0.9;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(estilo);
    }

    let overlay = document.getElementById('overlay-carregando');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'overlay-carregando';
      overlay.innerHTML = `
        <div class="spinner"></div>
        <div class="texto">Carregando...</div>
      `;
      document.body.appendChild(overlay);
    }

    overlay.style.display = "flex";
    overlay.style.zIndex = "2147483647"; // Força por cima de tudo
    overlay.style.visibility = "visible";
  } catch (e) {
    alert("Carregando... Aguarde.");
    // Falha extrema: fallback visual mínimo
  }
}

function ocultarCarregando() {
  try {
    const overlay = document.getElementById("overlay-carregando");
    if (overlay) {
      overlay.style.display = "none";
      overlay.style.visibility = "hidden";
    }
  } catch (e) {
    // Silêncio
  }
}
