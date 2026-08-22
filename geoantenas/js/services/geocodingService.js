/**
 * Servicio de Geocodificación Gratuito (Nominatim OpenStreetMap)
 * No requiere API key y es 100% libre.
 */

export class GeocodingService {
  /**
   * Busca la latitud y longitud de una dirección o lugar
   * @param {string} direccion - Texto a buscar (ej: "Av. Corrientes 1234, Buenos Aires")
   * @returns {Promise<Array<Object>>} Lista de resultados con lat, lon, display_name
   */
  static async buscarDireccion(direccion) {
    if (!direccion || direccion.trim().length < 3) {
      throw new Error("Ingresa al menos 3 caracteres para buscar.");
    }

    const query = encodeURIComponent(direccion.trim());
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`;

    const response = await fetch(url, {
      headers: {
        "Accept-Language": "es"
      }
    });

    if (!response.ok) {
      throw new Error("Error al consultar el servicio de mapa.");
    }

    const data = await response.json();
    return data.map(item => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      nombre: item.display_name
    }));
  }
}
