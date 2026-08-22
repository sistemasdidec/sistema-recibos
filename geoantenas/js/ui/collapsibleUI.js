/**
 * Módulo UI para Tarjetas Plegables / Desplegables (Accordion Collapsible Cards)
 */

export class CollapsibleUI {
  static init() {
    document.querySelectorAll(".card-header").forEach(header => {
      header.classList.add("clickable-header");
      
      // Agregar botón chevron si no existe
      if (!header.querySelector(".btn-collapse")) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-collapse";
        btn.title = "Plegar / Desplegar tarjeta";
        btn.innerHTML = `<i class="fa-solid fa-chevron-down"></i>`;
        
        const headerActions = header.querySelector(".header-actions") || header.querySelector(".step-indicator")?.parentElement;
        if (headerActions) {
          headerActions.appendChild(btn);
        } else {
          header.appendChild(btn);
        }
      }

      header.addEventListener("click", (e) => {
        // Evitar desplegar/plegar si se hace clic en botones de acción como importar CSV o borrar
        if (e.target.closest(".btn-icon") || e.target.closest("input")) return;

        const card = header.closest(".card");
        if (card) {
          card.classList.toggle("collapsed");
        }
      });
    });
  }
}
