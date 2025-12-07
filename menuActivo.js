export class MenuActivo {
    constructor(navSelector = 'nav') {
        this.nav = document.querySelector(navSelector);
        if (!this.nav) return;

        this.links = Array.from(this.nav.querySelectorAll('a'));
        this.currentPath = window.location.pathname.split('/').pop();
        this.setActive();
    }

    setActive() {
        this.links.forEach(link => {
            // Quitar cualquier estado previo
            link.style.fontWeight = '';
            link.style.textDecoration = '';
            link.style.color = '';

            // Comparar href con la página actual
            if (link.getAttribute('href') === this.currentPath) {
                // Estilo activo
                link.style.fontWeight = 'bold';
                link.style.textDecoration = 'underline';
                link.style.color = '#FF5722';
            }
        });
    }

    // Método para cambiar el estilo activo dinámicamente si se cambia de página sin recargar
    updatePath(path) {
        this.currentPath = path;
        this.setActive();
    }

    // Inicialización automática
    static init() {
        return new MenuActivo();
    }
}

// Auto-inicialización y exposición global
window.menuActivo = MenuActivo.init();
