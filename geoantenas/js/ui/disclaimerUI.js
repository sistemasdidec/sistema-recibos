/**
 * Módulo para la Ventana Emergente de Aviso Legal y Disclaimer (DEMO)
 */

import { StorageService } from '../services/storageService.js';

export class DisclaimerUI {
  constructor() {
    this.modal = document.getElementById("modalDisclaimer");
    this.btnAceptar = document.getElementById("btnAceptarDisclaimer");
    this.btnOpenHeader = document.getElementById("btnInfoDisclaimer");
  }

  init() {
    if (!this.modal) return;

    // Verificar si el usuario ya aceptó el aviso anteriormente
    const yaAcepto = StorageService.esDisclaimerAceptado();
    if (!yaAcepto) {
      this.mostrarModal();
    }

    // Registrar evento de aceptación
    if (this.btnAceptar) {
      this.btnAceptar.addEventListener("click", () => {
        StorageService.guardarDisclaimerAceptado();
        this.cerrarModal();
      });
    }

    // Registrar evento de apertura manual desde el botón (i) del header
    if (this.btnOpenHeader) {
      this.btnOpenHeader.addEventListener("click", () => {
        this.mostrarModal();
      });
    }
  }

  mostrarModal() {
    if (this.modal && typeof this.modal.showModal === 'function') {
      this.modal.showModal();
    }
  }

  cerrarModal() {
    if (this.modal && typeof this.modal.close === 'function') {
      this.modal.close();
    }
  }
}
