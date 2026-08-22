/**
 * Encapsulamiento del Mapa Interactivo (Leaflet.js)
 */

import { CONFIG } from '../config.js';
import { calcularCoordenada, obtenerPuntosSector } from '../utils/geodesic.js';
import { Toast } from '../utils/toast.js';

export class MapManager {
  constructor(elementId) {
    this.elementId = elementId;
    this.map = null;
    this.tileLayers = {};
    this.sectorGroup = null;
    this.impactGroup = null;
    this.previewGroup = null;
    this.searchMarker = null;
    this.pickerMarker = null;
    this.onMapClickCallback = null;
  }

  /**
   * Inicializa el mapa Leaflet en el contenedor especificado
   */
  init() {
    const { lat, lon, zoom } = CONFIG.DEFAULT_LOCATION;

    this.map = L.map(this.elementId, {
      center: [lat, lon],
      zoom: zoom,
      zoomControl: false,
      preferCanvas: true
    });

    L.control.zoom({ position: "topright" }).addTo(this.map);

    // Crear capas de mapas base
    Object.keys(CONFIG.TILE_LAYERS).forEach(key => {
      const layerConf = CONFIG.TILE_LAYERS[key];
      this.tileLayers[key] = L.tileLayer(layerConf.url, {
        maxZoom: layerConf.maxZoom,
        attribution: layerConf.attribution,
        crossOrigin: true
      });
    });

    // Capa inicial por defecto: CALLES (OpenStreetMap)
    this.tileLayers.osm.addTo(this.map);

    // Grupos para capas dinámicas
    this.sectorGroup = L.layerGroup().addTo(this.map);
    this.impactGroup = L.layerGroup().addTo(this.map);
    this.previewGroup = L.layerGroup().addTo(this.map);

    // Registrar escuchador global de clics en el mapa
    this.map.on('click', (e) => {
      if (this.onMapClickCallback) {
        this.onMapClickCallback(e.latlng.lat, e.latlng.lng);
      }
    });
  }

  /**
   * Asigna la función callback para eventos de clic en el mapa
   */
  setOnMapClick(callback) {
    this.onMapClickCallback = callback;
  }

  /**
   * Cambia la capa base (osm / satellite / dark)
   */
  setBaseLayer(layerKey) {
    if (!this.tileLayers[layerKey]) return;
    Object.values(this.tileLayers).forEach(layer => this.map.removeLayer(layer));
    this.tileLayers[layerKey].addTo(this.map);
  }

  /**
   * Alterna la visibilidad de la capa de sectores
   */
  toggleVisibilidadSectores(visible) {
    if (visible) {
      this.map.addLayer(this.sectorGroup);
    } else {
      this.map.removeLayer(this.sectorGroup);
    }
  }

  /**
   * Alterna la visibilidad de la capa de puntos de impacto
   */
  toggleVisibilidadImpactos(visible) {
    if (visible) {
      this.map.addLayer(this.impactGroup);
    } else {
      this.map.removeLayer(this.impactGroup);
    }
  }

  /**
   * Muestra previsualización en vivo en el mapa a medida que se mueven los sliders
   */
  mostrarPrevisualizacion(sec) {
    if (!this.previewGroup) return;
    this.previewGroup.clearLayers();

    const [latAz, lonAz] = calcularCoordenada(sec.lat, sec.lon, sec.radio, sec.azimuth);
    const lineaAzimuth = L.polyline([[sec.lat, sec.lon], [latAz, lonAz]], {
      color: sec.color,
      weight: 3,
      dashArray: '3, 3',
      opacity: 0.9
    });

    const puntosSector = obtenerPuntosSector(sec.lat, sec.lon, sec.radio, sec.azimuth, sec.apertura);
    const poligonoSector = L.polygon(puntosSector, {
      color: sec.color,
      weight: 2,
      fillColor: sec.color,
      fillOpacity: 0.4
    });

    this.previewGroup.addLayer(lineaAzimuth);
    this.previewGroup.addLayer(poligonoSector);
  }

  limpiarPrevisualizacion() {
    if (this.previewGroup) {
      this.previewGroup.clearLayers();
    }
  }

  /**
   * Muestra un pin/marcador de captura visual temporal cuando se hace clic en el mapa
   */
  mostrarMarcadorCaptura(lat, lon) {
    this.limpiarMarcadorCaptura();

    const pickerIcon = L.divIcon({
      className: 'custom-picker-icon',
      html: `<div class="pulse-picker-marker" title="Coordenada Capturada"><i class="fa-solid fa-location-crosshairs"></i></div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    this.pickerMarker = L.marker([lat, lon], { icon: pickerIcon }).addTo(this.map);
    this.pickerMarker.bindPopup(`
      <div class="popup-content">
        <h3><i class="fa-solid fa-crosshairs text-cyan"></i> Coordenada Capturada</h3>
        <p><strong>Latitud:</strong> ${lat.toFixed(6)}</p>
        <p><strong>Longitud:</strong> ${lon.toFixed(6)}</p>
      </div>
    `).openPopup();
  }

  /**
   * Elimina el marcador de captura temporal del mapa
   */
  limpiarMarcadorCaptura() {
    if (this.pickerMarker) {
      this.map.removeLayer(this.pickerMarker);
      this.pickerMarker = null;
    }
  }

  /**
   * Muestra un marcador temporal para el resultado de búsqueda de dirección
   */
  mostrarBusqueda(lat, lon, nombre) {
    this.limpiarBusqueda();

    const searchIcon = L.divIcon({
      className: 'custom-search-icon',
      html: `<div style="background:#f59e0b; color:#fff; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 15px #f59e0b;"><i class="fa-solid fa-magnifying-glass-location"></i></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    this.searchMarker = L.marker([lat, lon], { icon: searchIcon }).addTo(this.map);
    this.searchMarker.bindPopup(`
      <div class="popup-content">
        <h3><i class="fa-solid fa-location-dot"></i> Dirección Encontrada</h3>
        <p>${nombre}</p>
        <p><strong>Coordenadas:</strong> ${lat.toFixed(6)}, ${lon.toFixed(6)}</p>
        <button type="button" class="btn-subtle-sm" onclick="window.limpiarBusquedaMapa()"><i class="fa-solid fa-trash-can"></i> Quitar marca de búsqueda</button>
      </div>
    `).openPopup();

    this.flyTo(lat, lon, 16);
  }

  /**
   * Elimina el pin de búsqueda del mapa
   */
  limpiarBusqueda() {
    if (this.searchMarker) {
      this.map.removeLayer(this.searchMarker);
      this.searchMarker = null;
    }
  }

  /**
   * Redibuja todos los sectores en el mapa
   * @param {Array<Object>} sectores
   */
  renderSectores(sectores) {
    if (!this.sectorGroup) return;
    this.sectorGroup.clearLayers();

    sectores.forEach((sec) => {
      const markerIcon = L.divIcon({
        className: 'custom-tower-icon',
        html: `<div class="tower-map-pin" style="background:${sec.color}; box-shadow:0 0 12px ${sec.color};" title="${sec.nombre} (Antena)"><i class="fa-solid fa-tower-cell"></i></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([sec.lat, sec.lon], { icon: markerIcon });
      marker.bindPopup(`
        <div class="popup-content">
          <h3><i class="fa-solid fa-tower-cell"></i> ${sec.nombre}</h3>
          <p><strong>Ubicación:</strong> ${sec.lat.toFixed(5)}, ${sec.lon.toFixed(5)}</p>
          <p><strong>Azimuth:</strong> ${sec.azimuth}°</p>
          <p><strong>Apertura:</strong> ${sec.apertura}°</p>
          <p><strong>Radio:</strong> ${sec.radio} metros</p>
        </div>
      `);
      this.sectorGroup.addLayer(marker);

      const [latAz, lonAz] = calcularCoordenada(sec.lat, sec.lon, sec.radio, sec.azimuth);
      const lineaAzimuth = L.polyline([[sec.lat, sec.lon], [latAz, lonAz]], {
        color: sec.color,
        weight: 3,
        dashArray: '5, 5',
        opacity: 0.9
      });
      this.sectorGroup.addLayer(lineaAzimuth);

      const puntosSector = obtenerPuntosSector(sec.lat, sec.lon, sec.radio, sec.azimuth, sec.apertura);
      const poligonoSector = L.polygon(puntosSector, {
        color: sec.color,
        weight: 2,
        fillColor: sec.color,
        fillOpacity: 0.35
      });
      poligonoSector.bindPopup(`
        <div class="popup-content">
          <h3><i class="fa-solid fa-pie-chart"></i> ${sec.nombre}</h3>
          <p><strong>Cobertura Estimada:</strong> ${sec.apertura}° haz @ ${sec.radio}m</p>
          <p><strong>Azimuth Central:</strong> ${sec.azimuth}°</p>
        </div>
      `);
      this.sectorGroup.addLayer(poligonoSector);
    });
  }

  /**
   * Renderiza los Puntos de Impacto / Llamadas en el mapa con Icono de Teléfono (fa-phone)
   * @param {Array<Object>} impactos
   */
  renderImpactos(impactos) {
    if (!this.impactGroup) return;
    this.impactGroup.clearLayers();

    impactos.forEach((imp) => {
      const impactIcon = L.divIcon({
        className: 'custom-impact-icon',
        html: `<div class="pulse-impact-marker" title="${imp.nombre} (Llamada)"><i class="fa-solid fa-phone"></i></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      const marker = L.marker([imp.lat, imp.lon], { icon: impactIcon });
      marker.bindPopup(`
        <div class="popup-content popup-impact">
          <h3><i class="fa-solid fa-phone"></i> Punto de Impacto / Llamada</h3>
          <p><strong>Nombre/Etiqueta:</strong> ${imp.nombre}</p>
          <p><strong>Ubicación:</strong> ${imp.lat.toFixed(5)}, ${imp.lon.toFixed(5)}</p>
          ${imp.timestamp ? `<p><strong>Fecha/Hora:</strong> ${imp.timestamp}</p>` : ''}
          ${imp.notas ? `<p><strong>Notas:</strong> ${imp.notas}</p>` : ''}
        </div>
      `);
      this.impactGroup.addLayer(marker);
    });
  }

  /**
   * Enfoca el mapa para encuadrar todos los sectores e impactos cargados
   */
  fitBounds(sectores, impactos = []) {
    const coords = [];
    if (sectores) sectores.forEach(s => coords.push([s.lat, s.lon]));
    if (impactos) impactos.forEach(i => coords.push([i.lat, i.lon]));
    if (coords.length === 0) return;

    const bounds = L.latLngBounds(coords);
    this.map.fitBounds(bounds, { padding: [50, 50] });
  }

  /**
   * Vuela hacia una posición en particular
   */
  flyTo(lat, lon, zoom = 15) {
    this.map.flyTo([lat, lon], zoom, { duration: 1 });
  }

  /**
   * Exporta la vista actual del mapa a una imagen PNG limpia (html2canvas)
   */
  async exportarImagenPNG() {
    if (typeof html2canvas === 'undefined') {
      Toast.warning("Cargando motor de imagen. Intenta de nuevo en un instante.");
      return;
    }

    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    try {
      Toast.info("Generando imagen HD del mapa...");
      const canvas = await html2canvas(mapElement, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        scale: 2
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const link = document.createElement("a");
      link.download = `GeoAntenas_DIDEC_Mapa_${timestamp}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      Toast.success("Imagen descargada con éxito.");
    } catch (error) {
      Toast.error("Error al generar imagen: " + error.message);
    }
  }
}
