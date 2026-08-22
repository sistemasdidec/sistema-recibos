/**
 * Entrypoint Principal de la Aplicación GeoAntenas D.I.D.EC.
 * Orquesta los servicios, mapa, UI, búsqueda y matemática.
 */

import { StorageService } from './services/storageService.js';
import { CsvService } from './services/csvService.js';
import { GeocodingService } from './services/geocodingService.js';
import { ImpactService } from './services/impactService.js';
import { MapManager } from './map/mapManager.js';
import { FormUI } from './ui/formUI.js';
import { SectorListUI } from './ui/sectorListUI.js';
import { DisclaimerUI } from './ui/disclaimerUI.js';
import { ImpactUI } from './ui/impactUI.js';
import { GuideUI } from './ui/guideUI.js';
import { CollapsibleUI } from './ui/collapsibleUI.js';
import { descargarKML } from './utils/kmlGenerator.js';
import { Toast } from './utils/toast.js';

class App {
  constructor() {
    this.sectores = [];
    this.impactos = [];
    this.mapManager = new MapManager('map');
    this.formUI = new FormUI();
    this.sectorListUI = new SectorListUI();
    this.disclaimerUI = new DisclaimerUI();
    this.impactUI = new ImpactUI();
    this.guideUI = new GuideUI();

    this.verSectores = true;
    this.verImpactos = true;
  }

  init() {
    // 1. Cargar estado guardado
    this.sectores = StorageService.obtenerSectores();
    this.impactos = ImpactService.obtenerImpactos();

    // 2. Inicializar mapa y componentes UI
    this.mapManager.init();
    this.formUI.init();
    this.disclaimerUI.init();
    this.impactUI.init();
    this.guideUI.init();
    CollapsibleUI.init();

    // 3. Vincular eventos de la UI y servicios
    this.bindEvents();

    // 4. Renderizar estado inicial
    this.actualizarInterfaz();
  }

  bindEvents() {
    // A. Captura de Clics en el Mapa con Feedback Visual
    this.mapManager.setOnMapClick((lat, lon) => {
      if (this.formUI.capturandoCoordenadas) {
        this.formUI.setCoordenadas(lat, lon);
        this.mapManager.mostrarMarcadorCaptura(lat, lon);
        this.formUI.toggleCapturaMapa(false);
      } else if (this.impactUI.capturandoImpacto) {
        this.impactUI.setCoordenadas(lat, lon);
        this.mapManager.mostrarMarcadorCaptura(lat, lon);
        this.impactUI.toggleCapturaImpacto(false);
      }
    });

    // B. Previsualización en Vivo mediante Sliders de Rango
    this.formUI.setOnLivePreview((secPreview) => {
      this.mapManager.mostrarPrevisualizacion(secPreview);
    });

    // C. Submit Formulario -> Agregar Sector Único
    this.formUI.setOnSubmit((nuevoSector) => {
      this.sectores.push(nuevoSector);
      StorageService.guardarSectores(this.sectores);
      this.mapManager.limpiarMarcadorCaptura();
      this.mapManager.limpiarPrevisualizacion();
      this.actualizarInterfaz();
      this.mapManager.flyTo(nuevoSector.lat, nuevoSector.lon);
      Toast.success(`Sector "${nuevoSector.nombre}" agregado.`);
    });

    // D. Carga Rápida -> Torre Tri-Sectorial (3 Celdas 360°)
    this.formUI.setOnTriSectorSubmit((sectoresTri) => {
      this.sectores.push(...sectoresTri);
      StorageService.guardarSectores(this.sectores);
      this.mapManager.limpiarMarcadorCaptura();
      this.mapManager.limpiarPrevisualizacion();
      this.actualizarInterfaz();
      this.mapManager.fitBounds(this.sectores, this.impactos);
      Toast.success("Torre 3 Celdas 360° cargada con éxito.");
    });

    // E. Capturar Coordenadas del Formulario de Antena o Impacto
    const btnPickMap = document.getElementById("btnPickMap");
    if (btnPickMap) {
      btnPickMap.addEventListener("click", () => {
        this.impactUI.toggleCapturaImpacto(false);
        this.formUI.toggleCapturaMapa(!this.formUI.capturandoCoordenadas);
      });
    }

    const btnCancelBanner = document.querySelector("#pickerBanner button");
    if (btnCancelBanner) {
      btnCancelBanner.addEventListener("click", () => {
        this.formUI.toggleCapturaMapa(false);
        this.impactUI.toggleCapturaImpacto(false);
      });
    }

    // F. Acciones Lista de Sectores
    this.sectorListUI.setOnDelete((id) => {
      this.sectores = this.sectores.filter(s => s.id !== id);
      StorageService.guardarSectores(this.sectores);
      this.actualizarInterfaz();
      Toast.info("Sector eliminado.");
    });

    this.sectorListUI.setOnFocus((sec) => {
      this.mapManager.flyTo(sec.lat, sec.lon);
    });

    // G. Acciones Puntos de Impacto
    this.impactUI.setOnAdd((nuevoImpacto) => {
      this.impactos = ImpactService.agregarImpacto(nuevoImpacto);
      this.mapManager.limpiarMarcadorCaptura();
      this.actualizarInterfaz();
      this.mapManager.flyTo(nuevoImpacto.lat, nuevoImpacto.lon);
      Toast.success(`Impacto "${nuevoImpacto.nombre}" registrado.`);
    });

    this.impactUI.setOnDelete((id) => {
      this.impactos = ImpactService.eliminarImpacto(id);
      this.actualizarInterfaz();
      Toast.info("Punto de impacto eliminado.");
    });

    this.impactUI.setOnFocus((imp) => {
      this.mapManager.flyTo(imp.lat, imp.lon);
    });

    // H. Buscador de Direcciones y Limpieza
    const formSearch = document.getElementById("formSearchAddress");
    if (formSearch) {
      formSearch.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = document.getElementById("inputSearchAddress");
        const query = input ? input.value : "";
        if (!query) return;

        try {
          Toast.info("Buscando dirección...");
          const resultados = await GeocodingService.buscarDireccion(query);
          if (resultados && resultados.length > 0) {
            const primerRes = resultados[0];
            this.mapManager.mostrarBusqueda(primerRes.lat, primerRes.lon, primerRes.nombre);
            this.formUI.setCoordenadas(primerRes.lat, primerRes.lon);
            Toast.success("Ubicación localizada.");
          } else {
            Toast.warning("No se encontraron resultados para esa dirección.");
          }
        } catch (error) {
          Toast.error("Error al buscar dirección: " + error.message);
        }
      });
    }

    const btnClearSearch = document.getElementById("btnClearSearch");
    if (btnClearSearch) {
      btnClearSearch.addEventListener("click", () => {
        window.limpiarBusquedaMapa();
      });
    }

    window.limpiarBusquedaMapa = () => {
      this.mapManager.limpiarBusqueda();
      const input = document.getElementById("inputSearchAddress");
      if (input) input.value = "";
    };

    // I. Filtros de Visibilidad por Capa con Feedback Visual
    const btnToggleSectores = document.getElementById("btnToggleSectores");
    if (btnToggleSectores) {
      btnToggleSectores.addEventListener("click", () => {
        this.verSectores = !this.verSectores;
        this.mapManager.toggleVisibilidadSectores(this.verSectores);
        this.actualizarEstiloBotonFiltro(btnToggleSectores, this.verSectores, "Antenas");
      });
    }

    const btnToggleImpactos = document.getElementById("btnToggleImpactos");
    if (btnToggleImpactos) {
      btnToggleImpactos.addEventListener("click", () => {
        this.verImpactos = !this.verImpactos;
        this.mapManager.toggleVisibilidadImpactos(this.verImpactos);
        this.actualizarEstiloBotonFiltro(btnToggleImpactos, this.verImpactos, "Llamadas");
      });
    }

    // J. Exportación de Imagen PNG del Mapa
    const triggerPngExport = () => {
      this.mapManager.exportarImagenPNG();
    };

    const btnExportPng = document.getElementById("btnExportPng");
    if (btnExportPng) btnExportPng.addEventListener("click", triggerPngExport);

    const btnExportPngSide = document.getElementById("btnExportPngSide");
    if (btnExportPngSide) btnExportPngSide.addEventListener("click", triggerPngExport);

    // K. Cambio de capas del mapa (Osm / Satellite / Dark)
    document.querySelectorAll(".map-layer-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".map-layer-btn").forEach(b => b.classList.remove("active"));
        const targetBtn = e.target.closest(".map-layer-btn");
        targetBtn.classList.add("active");
        const tileType = targetBtn.getAttribute("data-tile");
        this.mapManager.setBaseLayer(tileType);
      });
    });

    // L. Herramientas rápidas del mapa
    window.centrarTodosLosSectores = () => {
      this.mapManager.fitBounds(this.sectores, this.impactos);
    };

    window.cargarEjemploDemostracion = () => {
      this.cargarDemostracion();
    };

    window.confirmarLimpiarLista = () => {
      if (this.sectores.length === 0 && this.impactos.length === 0) return;
      const modal = document.getElementById("modalConfirm");
      if (modal) modal.showModal();
    };

    window.ejecutarLimpiarLista = () => {
      this.sectores = [];
      this.impactos = [];
      StorageService.limpiarTodo();
      ImpactService.limpiarImpactos();
      this.mapManager.limpiarMarcadorCaptura();
      this.mapManager.limpiarBusqueda();
      this.mapManager.limpiarPrevisualizacion();
      this.actualizarInterfaz();
      const modal = document.getElementById("modalConfirm");
      if (modal) modal.close();
      Toast.info("Se borraron todos los datos.");
    };

    // M. Exportación KML Combinada
    const btnExportKml = document.getElementById("btnExportKml");
    if (btnExportKml) {
      btnExportKml.addEventListener("click", () => {
        descargarKML(this.sectores, this.impactos);
        Toast.success("Archivo KML descargado.");
      });
    }

    // N. Importación CSV
    const fileCsv = document.getElementById("fileCsv");
    if (fileCsv) {
      fileCsv.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        CsvService.parsearCSV(file, this.formUI.colorSeleccionado)
          .then(nuevosSectores => {
            if (nuevosSectores.length > 0) {
              this.sectores.push(...nuevosSectores);
              StorageService.guardarSectores(this.sectores);
              this.actualizarInterfaz();
              this.mapManager.fitBounds(this.sectores, this.impactos);
              Toast.success(`Se importaron ${nuevosSectores.length} sectores del CSV.`);
            } else {
              Toast.warning("No se encontraron datos válidos en el CSV.");
            }
          })
          .catch(err => Toast.error("Error al importar CSV: " + err.message));
      });
    }
  }

  actualizarEstiloBotonFiltro(btn, visible, texto) {
    if (!btn) return;
    if (visible) {
      btn.innerHTML = `<i class="fa-solid fa-eye"></i> ${texto}`;
      btn.classList.add("filter-on");
      btn.classList.remove("filter-off");
    } else {
      btn.innerHTML = `<i class="fa-solid fa-eye-slash"></i> ${texto} (Oculto)`;
      btn.classList.remove("filter-on");
      btn.classList.add("filter-off");
    }
  }

  actualizarInterfaz() {
    this.sectorListUI.render(this.sectores);
    this.impactUI.render(this.impactos);
    this.mapManager.renderSectores(this.sectores);
    this.mapManager.renderImpactos(this.impactos);

    const btnToggleSectores = document.getElementById("btnToggleSectores");
    if (btnToggleSectores) this.actualizarEstiloBotonFiltro(btnToggleSectores, this.verSectores, "Antenas");

    const btnToggleImpactos = document.getElementById("btnToggleImpactos");
    if (btnToggleImpactos) this.actualizarEstiloBotonFiltro(btnToggleImpactos, this.verImpactos, "Llamadas");

    const hasData = this.sectores.length > 0 || this.impactos.length > 0;
    const btnExportKml = document.getElementById("btnExportKml");
    if (btnExportKml) btnExportKml.disabled = !hasData;

    const btnExportPngSide = document.getElementById("btnExportPngSide");
    if (btnExportPngSide) btnExportPngSide.disabled = !hasData;
  }

  cargarDemostracion() {
    this.sectores = [
      { id: "1", nombre: "Radiobase Belgrano - Sec 1", lat: -34.5621, lon: -58.4568, azimuth: 30, apertura: 65, radio: 600, color: "#ff3366" },
      { id: "2", nombre: "Radiobase Belgrano - Sec 2", lat: -34.5621, lon: -58.4568, azimuth: 150, apertura: 65, radio: 600, color: "#00f2fe" },
      { id: "3", nombre: "Radiobase Belgrano - Sec 3", lat: -34.5621, lon: -58.4568, azimuth: 270, apertura: 65, radio: 600, color: "#00e676" },
      { id: "4", nombre: "Antena Obelisco Forense", lat: -34.6037, lon: -58.3816, azimuth: 90, apertura: 90, radio: 800, color: "#ffab00" }
    ];

    this.impactos = [
      { id: "101", nombre: "Llamada Sospechoso #1", lat: -34.5605, lon: -58.4540, timestamp: "22/08/2026 14:15:00", notas: "Llamada entrante celda sec 1" },
      { id: "102", nombre: "Llamada Víctima", lat: -34.6028, lon: -58.3750, timestamp: "22/08/2026 15:30:12", notas: "Impacto cercano Obelisco" }
    ];

    StorageService.guardarSectores(this.sectores);
    ImpactService.guardarImpactos(this.impactos);
    this.actualizarInterfaz();
    this.mapManager.fitBounds(this.sectores, this.impactos);
    Toast.success("Caso de prueba cargado.");
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.init();
});
