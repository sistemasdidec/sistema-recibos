/**
 * Configuración global y constantes de GeoAntenas Forense
 */

export const CONFIG = {
  EARTH_RADIUS_METERS: 6378137.0,
  DEFAULT_LOCATION: {
    lat: -34.6037,
    lon: -58.3816,
    zoom: 13
  },
  COLOR_PRESETS: [
    "#ff3366", // Rosa Neón
    "#00f2fe", // Cian Eléctrico
    "#00e676", // Verde Esmeralda
    "#ffab00", // Ámbar / Naranja
    "#d500f9", // Violeta Neón
    "#ffea00"  // Amarillo Radiante
  ],
  STORAGE_KEY: "geoantenas_sectores_v2",
  TILE_LAYERS: {
    osm: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      maxZoom: 19,
      attribution: "© OpenStreetMap"
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      maxZoom: 19,
      attribution: "© Esri World Imagery"
    },
    dark: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      maxZoom: 19,
      attribution: "© CARTO Dark Matter"
    }
  }
};
