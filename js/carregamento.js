function mostrarCarregando() {
  if (!document.getElementById('overlay-carregando')) {
    // CSS embutido
    const estilo = document.createElement('style');
    estilo.innerHTML = `
      #overlay-carregando {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9999;
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
        border-top: 6px solid white;
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

    // Elemento visual
    const overlay = document.createElement('div');
    overlay.id = 'overlay-carregando';
    overlay.innerHTML = `
      <div class="spinner"></div>
      <div class="texto">Carregando...</div>
    `;
    document.body.appendChild(overlay);
  }

  // Exibe
  document.getElementById("overlay-carregando").style.display = "flex";
}

function ocultarCarregando() {
  const overlay = document.getElementById("overlay-carregando");
  if (overlay) overlay.style.display = "none";
}
