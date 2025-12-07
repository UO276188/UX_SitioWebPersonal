class Buscador {

    constructor(mapaURL, modoResultados = false) {
        this.mapaURL = mapaURL;
        this.paginas = [];
        this.modoResultados = modoResultados;

        if (modoResultados) {
            this.seccionResultados = document.querySelector("section.resultados");
            this.lista = this.seccionResultados.querySelector("ul");

            const params = new URLSearchParams(window.location.search);
            const q = params.get("q")?.trim().toLowerCase() || "";
            this.terminos = q.split(/\s+/); // Búsqueda avanzada: varias palabras

            if (q.length > 0) {
                this.iniciar();
            }
        }

        this.cargarMapa();
    }

    async cargarMapa() {
        const respuesta = await fetch(this.mapaURL);
        const datos = await respuesta.json();
        this.paginas = datos.paginas;
    }

    limpiar() {
        this.lista.innerHTML = "";
        this.seccionResultados.hidden = true;
    }

    /**
     * Extrae solo el texto visible de una página HTML.
     */
    extraerTexto(html) {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.innerText.toLowerCase();
    }

    /**
     * Encuentra fragmentos donde aparece la palabra.
     */
    obtenerFragmentos(texto, termino) {
        const fragmentos = [];
        let pos = texto.indexOf(termino);

        while (pos !== -1) {
            const inicio = Math.max(0, pos - 30);
            const fin = Math.min(texto.length, pos + termino.length + 30);
            let frag = texto.substring(inicio, fin);

            // Resaltar coincidencia
            const regex = new RegExp(termino, "gi");
            frag = frag.replace(regex, match => `**${match}**`);

            fragmentos.push(frag);
            pos = texto.indexOf(termino, pos + 1);
        }

        return fragmentos;
    }

    /**
     * Comprueba si todos los términos están en el texto.
     */
    coincideBusqueda(texto) {
        return this.terminos.every(t => texto.includes(t));
    }

    /**
     * Agrega resultado detallado a la lista.
     */
    agregarResultado(pagina, fragmentos) {
        const li = document.createElement("li");

        let html = `<strong>${pagina}</strong><ul>`;
        fragmentos.forEach(f => {
            html += `<li>${f}</li>`;
        });
        html += "</ul>";

        li.innerHTML = html;

        this.lista.appendChild(li);
        this.seccionResultados.hidden = false;
    }

    async iniciar() {
        this.limpiar();

        for (const pagina of this.paginas) {
            try {
                const html = await fetch(pagina).then(r => r.text());
                const texto = this.extraerTexto(html);

                if (!this.coincideBusqueda(texto)) continue;

                // Juntar fragmentos de todos los términos
                let todosFragmentos = [];

                for (const termino of this.terminos) {
                    todosFragmentos.push(...this.obtenerFragmentos(texto, termino));
                }

                if (todosFragmentos.length > 0) {
                    this.agregarResultado(pagina, todosFragmentos);
                }

            } catch (err) {
                console.error("Error cargando", pagina, err);
            }
        }
    }
}
