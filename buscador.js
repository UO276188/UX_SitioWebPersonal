class Buscador {

    constructor(mapaURL, modoResultados = false) {
        console.log("Inicializando Buscador...");
        this.mapaURL = mapaURL;
        this.paginas = [];

        this.modoResultados = modoResultados;

        if (!modoResultados) {
            this.form = document.querySelector("form.buscador");
        } else {
            this.seccionResultados = document.querySelector("section.resultados");
            this.lista = this.seccionResultados.querySelector("ul");

            const params = new URLSearchParams(window.location.search);
            this.palabra = params.get("q")?.trim().toLowerCase() || "";

            if (this.palabra) {
                this.iniciarBusqueda();
            }
        }

        this.cargarMapa();
    }

    async cargarMapa() {
        console.log("Cargando mapa...");
        const respuesta = await fetch(this.mapaURL);
        const datos = await respuesta.json();
        this.paginas = datos.paginas;
    }
    
    /* resto sin cambios */
}
