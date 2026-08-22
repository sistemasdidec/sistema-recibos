/**
 * Módulo para la Interfaz y Control del Formulario de Carga y Sliders en Vivo
 */

import { CONFIG } from '../config.js';
import { Toast } from '../utils/toast.js';

export class FormUI {
  constructor() {
    this.colorSeleccionado = CONFIG.COLOR_PRESETS[0];
    this.capturandoCoordenadas = false;
    this.onFormSubmitCallback = null;
    this.onTriSectorSubmitCallback = null;
    this.onLivePreviewCallback = null;
  }

  init() {
    this.bindEvents();
    this.bindSliders();
  }

  bindEvents() {
    // 1. Selector de colores preset
    document.querySelectorAll(".color-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        this.colorSeleccionado = e.target.getAttribute("data-color");
        this.triggerLivePreview();
      });
    });

    // 2. Input de color custom
    const inputColor = document.getElementById("inputColor");
    if (inputColor) {
      inputColor.addEventListener("change", (e) => {
        document.querySelectorAll(".color-btn").forEach(b => b.classList.remove("active"));
        this.colorSeleccionado = e.target.value;
        this.triggerLivePreview();
      });
    }

    // 3. Submit de formulario estándar
    const sectorForm = document.getElementById("sectorForm");
    if (sectorForm) {
      sectorForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSubmit();
      });
    }

    // 4. Botón de Carga Rápida Torre 360° (Tri-Sectorial)
    const btnTriSector = document.getElementById("btnTriSector");
    if (btnTriSector) {
      btnTriSector.addEventListener("click", () => {
        this.handleTriSector();
      });
    }
  }

  bindSliders() {
    const pairs = [
      { numId: "inputAzimuth", rangeId: "rangeAzimuth" },
      { numId: "inputApertura", rangeId: "rangeApertura" },
      { numId: "inputRadio", rangeId: "rangeRadio" }
    ];

    pairs.forEach(({ numId, rangeId }) => {
      const numInput = document.getElementById(numId);
      const rangeInput = document.getElementById(rangeId);

      if (numInput && rangeInput) {
        rangeInput.addEventListener("input", (e) => {
          numInput.value = e.target.value;
          this.triggerLivePreview();
        });

        numInput.addEventListener("input", (e) => {
          if (e.target.value !== "") {
            rangeInput.value = e.target.value;
            this.triggerLivePreview();
          }
        });
      }
    });
  }

  triggerLivePreview() {
    if (this.onLivePreviewCallback) {
      const lat = parseFloat(document.getElementById("inputLat").value);
      const lon = parseFloat(document.getElementById("inputLon").value);
      const azimuth = parseFloat(document.getElementById("inputAzimuth").value);
      const apertura = parseFloat(document.getElementById("inputApertura").value);
      const radio = parseFloat(document.getElementById("inputRadio").value);

      if (!isNaN(lat) && !isNaN(lon) && !isNaN(azimuth) && !isNaN(apertura) && !isNaN(radio)) {
        this.onLivePreviewCallback({
          nombre: document.getElementById("inputNombre").value.trim() || "Previsualización Sector",
          lat, lon, azimuth, apertura, radio, color: this.colorSeleccionado
        });
      }
    }
  }

  handleSubmit() {
    const nombreInput = document.getElementById("inputNombre").value.trim();
    const lat = parseFloat(document.getElementById("inputLat").value);
    const lon = parseFloat(document.getElementById("inputLon").value);
    const azimuth = parseFloat(document.getElementById("inputAzimuth").value);
    const apertura = parseFloat(document.getElementById("inputApertura").value);
    const radio = parseFloat(document.getElementById("inputRadio").value);

    if (isNaN(lat) || isNaN(lon) || isNaN(azimuth) || isNaN(apertura) || isNaN(radio)) {
      Toast.warning("Ingresa valores numéricos válidos en Latitud, Longitud, Azimuth, Apertura y Radio.");
      return;
    }

    const sectorData = {
      id: Date.now().toString(),
      nombre: nombreInput || "Sector Antena",
      lat,
      lon,
      azimuth,
      apertura,
      radio,
      color: this.colorSeleccionado
    };

    document.getElementById("inputAzimuth").value = "";
    document.getElementById("inputApertura").value = "";
    document.getElementById("rangeAzimuth").value = 90;
    document.getElementById("rangeApertura").value = 65;
    document.getElementById("inputAzimuth").focus();

    if (this.onFormSubmitCallback) {
      this.onFormSubmitCallback(sectorData);
    }
  }

  handleTriSector() {
    const nombreInput = document.getElementById("inputNombre").value.trim();
    const lat = parseFloat(document.getElementById("inputLat").value);
    const lon = parseFloat(document.getElementById("inputLon").value);
    const radio = parseFloat(document.getElementById("inputRadio").value) || 500;

    if (isNaN(lat) || isNaN(lon)) {
      Toast.warning("Para generar una Torre 360° ingresa al menos Latitud y Longitud.");
      return;
    }

    const nombreBase = nombreInput || "Torre Tri-Sectorial";
    const azimuths = [0, 120, 240];
    const colores = [CONFIG.COLOR_PRESETS[0], CONFIG.COLOR_PRESETS[1], CONFIG.COLOR_PRESETS[2]];

    const sectoresTri = azimuths.map((az, index) => ({
      id: (Date.now() + index).toString(),
      nombre: `${nombreBase} - Sec ${index + 1}`,
      lat,
      lon,
      azimuth: az,
      apertura: 65,
      radio,
      color: colores[index]
    }));

    if (this.onTriSectorSubmitCallback) {
      this.onTriSectorSubmitCallback(sectoresTri);
    }
  }

  setCoordenadas(lat, lon) {
    document.getElementById("inputLat").value = lat.toFixed(6);
    document.getElementById("inputLon").value = lon.toFixed(6);
    this.triggerLivePreview();
  }

  toggleCapturaMapa(activar) {
    this.capturandoCoordenadas = activar;
    const btnPickMap = document.getElementById("btnPickMap");
    const banner = document.getElementById("pickerBanner");

    if (activar) {
      if (btnPickMap) btnPickMap.classList.add("active");
      if (banner) banner.style.display = "flex";
    } else {
      if (btnPickMap) btnPickMap.classList.remove("active");
      if (banner) banner.style.display = "none";
    }
  }

  setOnSubmit(callback) { this.onFormSubmitCallback = callback; }
  setOnTriSectorSubmit(callback) { this.onTriSectorSubmitCallback = callback; }
  setOnLivePreview(callback) { this.onLivePreviewCallback = callback; }
}
