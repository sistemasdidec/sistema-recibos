/**
 * Servicio de Almacenamiento y Persistencia Local (localStorage)
 */

import { CONFIG } from '../config.js';

export class StorageService {
  /**
   * Guarda el arreglo de sectores en localStorage
   * @param {Array<Object>} sectores
   */
  static guardarSectores(sectores) {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(sectores));
    } catch (error) {
      console.error("Error al guardar sectores en localStorage:", error);
    }
  }

  /**
   * Obtiene la lista de sectores guardada previamente
   * @returns {Array<Object>} Lista de sectores o arreglo vacío
   */
  static obtenerSectores() {
    try {
      const data = localStorage.getItem(CONFIG.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error al leer localStorage:", error);
      return [];
    }
  }

  /**
   * Borra todos los datos guardados en la sesión
   */
  static limpiarTodo() {
    try {
      localStorage.removeItem(CONFIG.STORAGE_KEY);
    } catch (error) {
      console.error("Error al borrar localStorage:", error);
    }
  }

  /**
   * Verifica si el usuario ya aceptó el aviso legal / disclaimer
   */
  static esDisclaimerAceptado() {
    try {
      return localStorage.getItem("geoantenas_disclaimer_aceptado") === "true";
    } catch (error) {
      return false;
    }
  }

  /**
   * Guarda la marca de aceptación del disclaimer
   */
  static guardarDisclaimerAceptado() {
    try {
      localStorage.setItem("geoantenas_disclaimer_aceptado", "true");
    } catch (error) {
      console.error("Error al guardar disclaimer en localStorage:", error);
    }
  }
}
