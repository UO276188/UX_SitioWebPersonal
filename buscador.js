class Buscador {

    constructor(mapaURL, modoResultados = false) {
        console.print("Inicializando Buscador...");
        this.mapaURL = mapaURL;
        this.paginas = [];

        this.modoResultados = modoResultados;

        if (!modoResultados) {
            // Modo formulario
            this.form = document.querySelector("form.buscador");
        } else {
            // Modo resultados en busqueda.html
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
        console.print("Cargando mapa");
        const respuesta = await fetch(this.mapaURL);
        const datos = await respuesta.json();
        this.paginas = datos.paginas;
    }

    limpiarResultados() {
        if (this.modoResultados) {
            this.lista.innerHTML = "";
            this.seccionResultados.hidden = true;
        }
    }

    agregarResultado(pagina) {
        const li = document.createElement("li");
        li.textContent = `La palabra "${this.palabra}" aparece en ${pagina}`;
        this.lista.appendChild(li);
        this.seccionResultados.hidden = false;
    }

    async iniciarBusqueda() {
        this.limpiarResultados();

        for (const pagina of this.paginas) {
            try {
                const contenido = await fetch(pagina).then(r => r.text());
                if (contenido.toLowerCase().includes(this.palabra)) {
                    this.agregarResultado(pagina);
                }
            } catch (err) {
                console.error("Error cargando", pagina, err);
            }
        }
    }
}
