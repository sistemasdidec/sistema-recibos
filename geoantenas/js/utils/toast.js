/**
 * Sistema de Notificaciones Flotantes (Toasts)
 * Reemplaza las alertas abruptas por avisos nativos y elegantes.
 */

export class Toast {
  static show(mensaje, tipo = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${tipo}`;
    
    const icon = tipo === 'success' ? 'fa-circle-check' :
                 tipo === 'error' ? 'fa-circle-xmark' :
                 tipo === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info';

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span>${mensaje}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  static success(msg) { this.show(msg, 'success'); }
  static error(msg) { this.show(msg, 'error'); }
  static warning(msg) { this.show(msg, 'warning'); }
  static info(msg) { this.show(msg, 'info'); }
}
