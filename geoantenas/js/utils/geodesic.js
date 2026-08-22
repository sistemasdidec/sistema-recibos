/**
 * Módulo de Matemática Geodésica y Geometría Esférica
 * Funciones puras independientes del DOM y de Leaflet
 */

import { CONFIG } from '../config.js';

/**
 * Calcula la coordenada de destino dada una posición inicial, distancia en metros y rumbo (azimuth) en grados.
 * @param {number} lat - Latitud origen en grados decimales
 * @param {number} lon - Longitud origen en grados decimales
 * @param {number} distanciaMetros - Distancia en metros
 * @param {number} rumboGrados - Azimuth en grados (0 a 360)
 * @returns {[number, number]} Coordenada [lat2, lon2] en grados decimales
 */
export function calcularCoordenada(lat, lon, distanciaMetros, rumboGrados) {
  const R = CONFIG.EARTH_RADIUS_METERS;
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  const rumboRad = (rumboGrados * Math.PI) / 180;
  const dR = distanciaMetros / R;

  const lat2Rad = Math.asin(
    Math.sin(latRad) * Math.cos(dR) +
    Math.cos(latRad) * Math.sin(dR) * Math.cos(rumboRad)
  );

  const lon2Rad = lonRad + Math.atan2(
    Math.sin(rumboRad) * Math.sin(dR) * Math.cos(latRad),
    Math.cos(dR) - Math.sin(latRad) * Math.sin(lat2Rad)
  );

  return [ (lat2Rad * 180) / Math.PI, (lon2Rad * 180) / Math.PI ];
}

/**
 * Genera el array de puntos Lat/Lon que componen el polígono del sector (arco/abanico)
 * @param {number} lat - Latitud origen
 * @param {number} lon - Longitud origen
 * @param {number} radio - Radio en metros
 * @param {number} azimuth - Azimuth en grados
 * @param {number} apertura - Apertura en grados
 * @returns {Array<[number, number]>} Puntos de coordenadas [lat, lon]
 */
export function obtenerPuntosSector(lat, lon, radio, azimuth, apertura) {
  const puntos = [];
  // Punto de la antena/torre
  puntos.push([lat, lon]);

  const anguloInicio = azimuth - (apertura / 2);
  const pasos = Math.max(1, Math.round(apertura));

  for (let i = 0; i <= pasos; i++) {
    const anguloActual = anguloInicio + (i * (apertura / pasos));
    const [latArco, lonArco] = calcularCoordenada(lat, lon, radio, anguloActual);
    puntos.push([latArco, lonArco]);
  }

  // Cerrar el polígono de regreso a la torre
  puntos.push([lat, lon]);
  return puntos;
}
