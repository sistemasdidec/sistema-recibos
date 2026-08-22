/**
 * Módulo UI para Gestión de Puntos de Impacto / Llamadas (CDRs)
 */

export class ImpactUI {
  constructor() {
    this.capturandoImpacto = false;
    this.onAddCallback = null;
    this.onDeleteCallback = null;
    this.onFocusCallback = null;
  }

  init() {
    const formImpact = document.getElementById("formImpact");
    if (formImpact) {
      formImpact.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    const btnPickImpactMap = document.getElementById("btnPickImpactMap");
    if (btnPickImpactMap) {
      btnPickImpactMap.addEventListener("click", () => {
        this.toggleCapturaImpacto(!this.capturandoImpacto);
      });
    }
  }

  handleSubmit() {
    const nombre = document.getElementById("impactNombre").value.trim();
    const lat = parseFloat(document.getElementById("impactLat").value);
    const lon = parseFloat(document.getElementById("impactLon").value);
    const timestamp = document.getElementById("impactTime").value.trim();
    const notas = document.getElementById("impactNotas").value.trim();

    if (isNaN(lat) || isNaN(lon)) {
      alert("Ingresa una Latitud y Longitud válidas para el Punto de Impacto.");
      return;
    }

    const impactoData = {
      id: Date.now().toString(),
      nombre: nombre || "Punto de Impacto",
      lat,
      lon,
      timestamp,
      notas
    };

    // Limpiar formulario de impactos
    document.getElementById("formImpact").reset();

    if (this.onAddCallback) {
      this.onAddCallback(impactoData);
    }
  }

  setCoordenadas(lat, lon) {
    document.getElementById("impactLat").value = lat.toFixed(6);
    document.getElementById("impactLon").value = lon.toFixed(6);
    document.getElementById("impactNombre").focus();
  }

  toggleCapturaImpacto(activar) {
    this.capturandoImpacto = activar;
    const btnPickImpactMap = document.getElementById("btnPickImpactMap");
    const banner = document.getElementById("pickerBanner");

    if (activar) {
      if (btnPickImpactMap) btnPickImpactMap.classList.add("active");
      if (banner) {
        banner.style.display = "flex";
        banner.querySelector("span").innerHTML = `<i class="fa-solid fa-crosshairs"></i> Haz clic en el mapa para fijar la posición del Punto de Impacto`;
      }
    } else {
      if (btnPickImpactMap) btnPickImpactMap.classList.remove("active");
      if (banner) {
        banner.style.display = "none";
        banner.querySelector("span").innerHTML = `<i class="fa-solid fa-hand-pointer"></i> Haz clic en cualquier lugar del mapa para fijar Latitud y Longitud`;
      }
    }
  }

  render(impactos) {
    const impactCounter = document.getElementById("impactCounter");
    const impactList = document.getElementById("impactList");

    if (impactCounter) impactCounter.textContent = impactos.length;
    if (!impactList) return;

    impactList.innerHTML = "";

    if (impactos.length === 0) {
      impactList.innerHTML = `<div class="empty-state-sm"><i class="fa-solid fa-crosshairs"></i> <p>No hay puntos de impacto agregados.</p></div>`;
      return;
    }

    impactos.forEach((imp) => {
      const item = document.createElement("div");
      item.className = "impact-item";
      item.innerHTML = `
        <div class="impact-info">
          <h4><i class="fa-solid fa-location-crosshairs text-red"></i> ${this.escapeHtml(imp.nombre)}</h4>
          <span class="impact-coords">Lat: ${imp.lat.toFixed(4)}, Lon: ${imp.lon.toFixed(4)}</span>
          ${imp.timestamp ? `<span class="impact-time"><i class="fa-solid fa-clock"></i> ${this.escapeHtml(imp.timestamp)}</span>` : ''}
        </div>
        <div class="impact-actions">
          <button class="btn-item-action btn-focus-impact" title="Ver en mapa"><i class="fa-solid fa-crosshairs"></i></button>
          <button class="btn-item-action btn-delete-impact btn-danger-icon" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      `;

      item.querySelector(".btn-focus-impact").addEventListener("click", () => {
        if (this.onFocusCallback) this.onFocusCallback(imp);
      });

      item.querySelector(".btn-delete-impact").addEventListener("click", () => {
        if (this.onDeleteCallback) this.onDeleteCallback(imp.id);
      });

      impactList.appendChild(item);
    });
  }

  setOnAdd(callback) { this.onAddCallback = callback; }
  setOnDelete(callback) { this.onDeleteCallback = callback; }
  setOnFocus(callback) { this.onFocusCallback = callback; }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
