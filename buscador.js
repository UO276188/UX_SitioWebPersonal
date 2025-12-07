class Buscador {

    constructor(mapaURL, modoResultados = false) {
        this.mapaURL = mapaURL;    // URL del JSON con páginas
        this.paginas = [];          // Array para guardar las páginas cargadas
        this.modoResultados = modoResultados; // true = busqueda.html

        if (modoResultados) {
            // Elementos de la sección de resultadoss
            this.seccionResultados = document.querySelector("section.resultados");
            this.lista = this.seccionResultados.querySelector("ul");

            // Leer los parámetros de la URL (q=palabra)
            const params = new URLSearchParams(window.location.search);
            const q = params.get("q")?.trim().toLowerCase() || "";

            // Búsqueda avanzada: separamos términos por espacios
            this.terminos = q.split(/\s+/);

            if (q.length > 0) {
                // Espera a que el mapa se cargue antes de buscar
                this.cargarMapa().then(() => this.iniciar());
            }
        } else {
            this.form = document.querySelector("form.buscador");
        }
    }

    /**
    * Carga el JSON con la lista de páginas
    */
    async cargarMapa() {
        const respuesta = await fetch(this.mapaURL);
        const datos = await respuesta.json();
        this.paginas = datos.paginas; // Guardamos todas las páginas
    }

    /**
     * Limpia los resultados anteriores
     */
    limpiar() {
        this.lista.innerHTML = "";
        this.seccionResultados.hidden = true; // Oculta la sección si no hay resultados
    }

    /**
     * Extrae solo el texto visible de un HTML
     * @param {string} html - código HTML de la página
     * @returns {string} texto visible en minúsculas
     */
    extraerTexto(html) {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.innerText.toLowerCase();
    }

    /**
     * Devuelve fragmentos de texto donde aparece la palabra
     * y resalta la palabra con <mark>
     * @param {string} texto - texto completo de la página
     * @param {string} termino - palabra buscada
     * @returns {Array<string>} array de fragmentos con palabra resaltada
     */
    obtenerFragmentos(texto, termino) {
        const fragmentos = [];
        let pos = texto.indexOf(termino);

        while (pos !== -1) {
            // Tomamos un fragmento de +-30 caracteres alrededor de la palabra
            const inicio = Math.max(0, pos - 30);
            const fin = Math.min(texto.length, pos + termino.length + 30);
            let frag = texto.substring(inicio, fin);

            // Resaltamos la coincidencia con <mark>
            const regex = new RegExp(termino, "gi");
            frag = frag.replace(regex, match => `<mark>${match}</mark>`);

            fragmentos.push(frag);
            pos = texto.indexOf(termino, pos + 1); // Buscar siguiente ocurrencia
        }

        return fragmentos;
    }

    /**
     * Comprueba si todos los términos están presentes (AND implícito)
     * @param {string} texto - texto de la página
     * @returns {boolean} true si todos los términos aparecen
     */
    coincideBusqueda(texto) {
        return this.terminos.every(t => texto.includes(t));
    }

    /**
     * Agrega un resultado en la lista de resultados
     * Cada resultado es clicable y lleva a la página correspondiente
     * @param {string} pagina - página donde se encontró la palabra
     * @param {Array<string>} fragmentos - array de fragmentos con palabra resaltada
     */
    agregarResultado(pagina, fragmentos) {
        const li = document.createElement("li");

        // Crear enlace clicable al nombre de la página
        const a = document.createElement("a");
        a.href = pagina;
        a.innerHTML = `<strong>${pagina}</strong>`;
        a.style.textDecoration = "none"; // opcional
        a.style.color = "#1a0dab";       // estilo tipo Google
        li.appendChild(a);

        // Crear lista de fragmentos debajo del enlace
        const ulFrag = document.createElement("ul");

        // Evitar fragmentos duplicados
        const fragmentsSet = new Set(fragmentos);
        fragmentsSet.forEach(f => {
            const liFrag = document.createElement("li");
            liFrag.innerHTML = f;
            ulFrag.appendChild(liFrag);
        });

        li.appendChild(ulFrag);
        this.lista.appendChild(li);

        // Mostrar la sección de resultados
        this.seccionResultados.hidden = false;
    }

    /**
     * Función principal que recorre todas las páginas
     * y busca las coincidencias de los términos
     */
    async iniciar() {
        this.limpiar();

        for (const pagina of this.paginas) {
            try {
                // Cargar HTML de la página
                const html = await fetch(pagina).then(r => r.text());
                const texto = this.extraerTexto(html);

                //Comprobar si coincide con todos los términos
                if (!this.coincideBusqueda(texto)) continue;

                //Generar fragmentos para cada término
                let todosFragmentos = [];
                for (const termino of this.terminos) {
                    todosFragmentos.push(...this.obtenerFragmentos(texto, termino));
                }

                // Si hay fragmentos, agregarlos como resultado
                if (todosFragmentos.length > 0) {
                    this.agregarResultado(pagina, todosFragmentos);
                }

            } catch (err) {
                console.error("Error cargando", pagina, err);
            }
        }
    }
}
