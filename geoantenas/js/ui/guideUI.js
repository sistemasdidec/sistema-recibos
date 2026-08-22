/**
 * Módulo UI para el Modal de Guía / Instructivo de Uso Rápido
 */

export class GuideUI {
  constructor() {
    this.modal = document.getElementById("modalGuide");
    this.btnOpenHeader = document.getElementById("btnOpenGuide");
    this.btnCloseModal = document.getElementById("btnCloseGuide");
  }

  init() {
    if (this.btnOpenHeader) {
      this.btnOpenHeader.addEventListener("click", () => {
        this.mostrarModal();
      });
    }

    if (this.btnCloseModal) {
      this.btnCloseModal.addEventListener("click", () => {
        this.cerrarModal();
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
