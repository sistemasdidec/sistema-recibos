/**
 * Servicio de Gestión de Puntos de Impacto (Llamadas / Registros CDR)
 */

export class ImpactService {
  static STORAGE_KEY = "geoantenas_impactos_v1";

  static obtenerImpactos() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error al leer puntos de impacto:", error);
      return [];
    }
  }

  static guardarImpactos(impactos) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(impactos));
    } catch (error) {
      console.error("Error al guardar puntos de impacto:", error);
    }
  }

  static agregarImpacto(impacto) {
    const lista = this.obtenerImpactos();
    lista.push(impacto);
    this.guardarImpactos(lista);
    return lista;
  }

  static eliminarImpacto(id) {
    const lista = this.obtenerImpactos().filter(imp => imp.id !== id);
    this.guardarImpactos(lista);
    return lista;
  }

  static limpiarImpactos() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
