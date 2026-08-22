/**
 * Módulo para Generación de Archivos KML XML y Conversión de Estilos de Color
 */

import { calcularCoordenada } from './geodesic.js';

/**
 * Convierte un color HEX (#RRGGBB) a formato de color KML (AABBGGRR)
 * @param {string} hexColor - Color en formato hex #RRGGBB
 * @param {string} opacityAlphaHex - Opacidad en hex de "00" a "ff" (ej: "40" = ~25%)
 * @returns {string} Color en formato KML AABBGGRR
 */
export function hexToKmlColor(hexColor, opacityAlphaHex = "40") {
  let cleanHex = hexColor.replace("#", "");
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split("").map(c => c + c).join("");
  }
  const r = cleanHex.substring(0, 2);
  const g = cleanHex.substring(2, 4);
  const b = cleanHex.substring(4, 6);
  return `${opacityAlphaHex}${b}${g}${r}`;
}

/**
 * Escapa caracteres especiales XML para prevenir corrupción de archivo KML
 */
function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Genera el documento XML KML completo para la lista de sectores y puntos de impacto
 * @param {Array<Object>} listaSectores - Arreglo de sectores cargados
 * @param {Array<Object>} listaImpactos - Arreglo de puntos de impacto cargados
 * @returns {string} String con el contenido KML en XML
 */
export function generarKML(listaSectores = [], listaImpactos = []) {
  let kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Análisis Forense GeoAntenas D.I.D.EC.</name>
    <description>Generado con GeoAntenas D.I.D.EC.</description>\n`;

  let kmlBody = "";

  // 1. Exportar Sectores
  if (listaSectores.length > 0) {
    kmlBody += `    <!-- SECTORES DE ANTENAS -->\n`;
    listaSectores.forEach((sec, idx) => {
      const kmlColorPoly = hexToKmlColor(sec.color, "40"); // 25% opacidad
      const kmlColorLine = hexToKmlColor(sec.color, "ff"); // 100% opacidad
      const estiloId = `estilo_sec_${sec.id}`;
      const nombreEscapado = escapeXml(sec.nombre);

      // Definición de Estilos
      kmlBody += `
      <Style id="${estiloId}">
        <LineStyle><color>${kmlColorLine}</color><width>2</width></LineStyle>
        <PolyStyle><color>${kmlColorPoly}</color></PolyStyle>
      </Style>
      <Style id="${estiloId}_linea">
        <LineStyle><color>${kmlColorLine}</color><width>3</width></LineStyle>
      </Style>\n`;

      // Point (Torre)
      kmlBody += `
      <Placemark>
        <name>${nombreEscapado} (Torre)</name>
        <description>Lat: ${sec.lat}, Lon: ${sec.lon}</description>
        <Point><coordinates>${sec.lon},${sec.lat},0</coordinates></Point>
      </Placemark>\n`;

      // LineString (Azimuth)
      const [latAz, lonAz] = calcularCoordenada(sec.lat, sec.lon, sec.radio, sec.azimuth);
      kmlBody += `
      <Placemark>
        <name>Línea Azimuth ${idx + 1} (${sec.azimuth}°)</name>
        <styleUrl>#${estiloId}_linea</styleUrl>
        <LineString><coordinates>${sec.lon},${sec.lat},0 ${lonAz},${latAz},0</coordinates></LineString>
      </Placemark>\n`;

      // Polygon (Sector)
      const anguloInicio = sec.azimuth - (sec.apertura / 2);
      let coordenadasArco = `${sec.lon},${sec.lat},0\n`;
      const pasos = Math.max(1, Math.round(sec.apertura));

      for (let i = 0; i <= pasos; i++) {
        const anguloActual = anguloInicio + (i * (sec.apertura / pasos));
        const [latArco, lonArco] = calcularCoordenada(sec.lat, sec.lon, sec.radio, anguloActual);
        coordenadasArco += `              ${lonArco},${latArco},0\n`;
      }
      coordenadasArco += `              ${sec.lon},${sec.lat},0`;

      kmlBody += `
      <Placemark>
        <name>${nombreEscapado} (Az: ${sec.azimuth}°, Ap: ${sec.apertura}°, R: ${sec.radio}m)</name>
        <styleUrl>#${estiloId}</styleUrl>
        <Polygon>
          <outerBoundaryIs><LinearRing><coordinates>
                ${coordenadasArco}
          </coordinates></LinearRing></outerBoundaryIs>
        </Polygon>
      </Placemark>\n`;
    });
  }

  // 2. Exportar Puntos de Impacto
  if (listaImpactos.length > 0) {
    kmlBody += `    <!-- PUNTOS DE IMPACTO / LLAMADAS -->\n`;
    listaImpactos.forEach((imp) => {
      const nombreEscapado = escapeXml(imp.nombre);
      const desc = escapeXml(`Fecha: ${imp.timestamp || 'N/A'} | Notas: ${imp.notas || 'Ninguna'}`);
      kmlBody += `
      <Placemark>
        <name>📍 Impacto: ${nombreEscapado}</name>
        <description>${desc}</description>
        <Point><coordinates>${imp.lon},${imp.lat},0</coordinates></Point>
      </Placemark>\n`;
    });
  }

  const kmlFooter = `  </Document>\n</kml>`;
  return kmlHeader + kmlBody + kmlFooter;
}

/**
 * Triggerea la descarga del archivo KML en el navegador
 */
export function descargarKML(listaSectores = [], listaImpactos = []) {
  if ((!listaSectores || listaSectores.length === 0) && (!listaImpactos || listaImpactos.length === 0)) return;

  const kmlContent = generarKML(listaSectores, listaImpactos);
  const blob = new Blob([kmlContent], { type: "application/vnd.google-earth.kml+xml" });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const fileName = `GeoAntenas_DIDEC_${timestamp}.kml`;

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
