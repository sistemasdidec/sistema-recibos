/**
 * Servicio de Importación y Parsing de Archivos CSV
 */

export class CsvService {
  /**
   * Lee e interpreta un archivo CSV cargado por el usuario
   * @param {File} file - Archivo CSV seleccionado
   * @param {string} colorPorDefecto - Color por defecto si no viene especificado
   * @returns {Promise<Array<Object>>} Promesa que resuelve con los sectores parseados
   */
  static parsearCSV(file, colorPorDefecto = "#ff3366") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const lines = content.split(/\r?\n/);
          const sectoresAgregados = [];

          lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed) return;

            // Ignorar cabecera si la primera línea contiene palabras clave como "lat" o "azimuth"
            if (index === 0 && (trimmed.toLowerCase().includes("lat") || trimmed.toLowerCase().includes("azimuth"))) {
              return;
            }

            const cols = trimmed.split(",").map(c => c.trim());
            if (cols.length >= 5) {
              const lat = parseFloat(cols[0]);
              const lon = parseFloat(cols[1]);
              const azimuth = parseFloat(cols[2]);
              const apertura = parseFloat(cols[3]);
              const radio = parseFloat(cols[4]);
              const nombre = cols[5] || `Celda CSV ${sectoresAgregados.length + 1}`;
              const color = cols[6] || colorPorDefecto;

              if (!isNaN(lat) && !isNaN(lon) && !isNaN(azimuth) && !isNaN(apertura) && !isNaN(radio)) {
                sectoresAgregados.push({
                  id: (Date.now() + index).toString(),
                  nombre,
                  lat,
                  lon,
                  azimuth,
                  apertura,
                  radio,
                  color
                });
              }
            }
          });

          resolve(sectoresAgregados);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Error al leer el archivo CSV"));
      reader.readAsText(file);
    });
  }
}
