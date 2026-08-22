/**
 * Módulo para Renderizado de la Lista de Sectores Guardados
 */

export class SectorListUI {
  constructor() {
    this.onDeleteCallback = null;
    this.onFocusCallback = null;
  }

  /**
   * Actualiza el contador y renderiza las tarjetas de la lista
   * @param {Array<Object>} sectores
   */
  render(sectores) {
    const sectorCounter = document.getElementById("sectorCounter");
    const btnExportKml = document.getElementById("btnExportKml");
    const emptyState = document.getElementById("emptyState");
    const sectorsList = document.getElementById("sectorsList");

    if (sectorCounter) sectorCounter.textContent = sectores.length;
    if (btnExportKml) btnExportKml.disabled = sectores.length === 0;

    if (!sectorsList) return;
    sectorsList.innerHTML = "";

    if (sectores.length === 0) {
      if (emptyState) emptyState.style.display = "flex";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    sectores.forEach((sec) => {
      const item = document.createElement("div");
      item.className = "sector-item";
      item.style.borderLeftColor = sec.color;

      item.innerHTML = `
        <div class="sector-info">
          <h4>
            <span style="color:${sec.color};">●</span> ${this.escapeHtml(sec.nombre)}
          </h4>
          <div class="sector-details">
            <span class="sector-tag">Lat: ${sec.lat.toFixed(4)}</span>
            <span class="sector-tag">Lon: ${sec.lon.toFixed(4)}</span>
            <span class="sector-tag">Az: ${sec.azimuth}°</span>
            <span class="sector-tag">Ap: ${sec.apertura}°</span>
            <span class="sector-tag">R: ${sec.radio}m</span>
          </div>
        </div>
        <div class="sector-actions">
          <button class="btn-item-action btn-focus" title="Ver en el mapa" data-id="${sec.id}">
            <i class="fa-solid fa-crosshairs"></i>
          </button>
          <button class="btn-item-action btn-item-delete btn-delete" title="Eliminar" data-id="${sec.id}">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;

      // Eventos individuales
      item.querySelector(".btn-focus").addEventListener("click", () => {
        if (this.onFocusCallback) this.onFocusCallback(sec);
      });

      item.querySelector(".btn-delete").addEventListener("click", () => {
        if (this.onDeleteCallback) this.onDeleteCallback(sec.id);
      });

      sectorsList.appendChild(item);
    });
  }

  setOnDelete(callback) {
    this.onDeleteCallback = callback;
  }

  setOnFocus(callback) {
    this.onFocusCallback = callback;
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
