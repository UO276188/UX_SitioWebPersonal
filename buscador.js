class Buscador {
    constructor(mapaURL) {
        this.mapaURL = mapaURL; // Ruta al archivo JSON con el listado de páginas a indexar
        this.paginas = []; // Array con las URLs de las páginas
        this.contenidos = {}; // Objeto donde se almacenará el texto limpio de cada página

        document.addEventListener("DOMContentLoaded", () => this.init());
    }

      // Inicializa el proceso del buscador
    async init() {
        const params = new URLSearchParams(window.location.search);

        // Obtiene la query (?q=...)
        this.query = params.get("q")?.trim();
        if (!this.query) return; // no hacer nada si no hay búsqueda

        await this.cargarMapa();    // Carga la lista de páginas desde mapa.json    
        await this.cargarPaginas(); // Descarga y limpia el contenido de cada página indexada
        const resultados = this.buscar(this.query); // Ejecuta la búsqueda con la query
        this.mostrarResultados(resultados);  // Muestra los resultados por pantalla
    }

    // Carga el archivo JSON con las rutas de las páginas a indexar
    async cargarMapa() {
        try {
            const res = await fetch(this.mapaURL);
            const data = await res.json();
            this.paginas = data.paginas;
        } catch (e) {
            console.error("Error cargando mapa:", e);
        }
    }

    // Descarga cada página y guarda su contenido en texto plano
    async cargarPaginas() {
        for (const url of this.paginas) {
            try {
                const res = await fetch(url);
                const html = await res.text();
                this.contenidos[url] = this.limpiarHTML(html);
            } catch (e) {
                this.contenidos[url] = "";
            }
        }
    }
    // Elimina scripts, estilos, etiquetas HTML y normaliza espacios
    limpiarHTML(html) {
        return html.replace(/<script[\s\S]*?<\/script>/gi, "")
                   .replace(/<style[\s\S]*?<\/style>/gi, "")
                   .replace(/<[^>]+>/g, " ")
                   .replace(/\s+/g, " ")
                   .trim();
    }

    // Normaliza el texto eliminando tildes y convirtiéndolo a minúsculas
    normalizar(texto) {
        return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    
    // Realiza la búsqueda sobre todas las páginas indexadas
    buscar(query) {
        // Separa la búsqueda en palabras y las normaliza
        const palabras = query.split(/\s+/).map(p => this.normalizar(p)).filter(Boolean);
        const resultados = [];

        for (const url of this.paginas) {
            const textoOriginal = this.contenidos[url];
            const textoNorm = this.normalizar(textoOriginal);
            const coincidencias = [];

            // Busca cada palabra en el texto normalizado
            for (const palabra of palabras) {
                let idx = textoNorm.indexOf(palabra);
                while (idx !== -1) {
                    coincidencias.push({ palabra, indice: idx, longitud: palabra.length });
                    idx = textoNorm.indexOf(palabra, idx + 1);
                }
            }

            // Si hay coincidencias, se crea un objeto de resultado
            if (coincidencias.length > 0) {
                resultados.push({
                    url,
                    titulo: url.replace(".html", ""),
                    textoOriginal,
                    coincidencias
                });
            }
        }

        return resultados;
    }

    // Marca con <mark> los términos encontrados en un fragmento de texto
    marcarTexto(original, coincidencias) {
        let texto = original;
        const normalizado = this.normalizar(original);

        // ordenar descendente para no romper índices
        coincidencias.sort((a, b) => b.indice - a.indice);

        for (const c of coincidencias) {
            const inicio = c.indice;
            const fin = inicio + c.longitud;
            texto = texto.slice(0, inicio) + "<mark>" + texto.slice(inicio, fin) + "</mark>" + texto.slice(fin);
        }

        return texto;
    }

    // Inserta los resultados en la página busqueda.html
    mostrarResultados(resultados) {
        const section = document.querySelector("section.resultados");
        if (!section) return;
        const ul = section.querySelector("ul");
        ul.innerHTML = "";

        //Sin resultados
        if (resultados.length === 0) {
            ul.innerHTML = "<li>No se encontraron resultados.</li>";
            section.hidden = false;
            return;
        }

        // Con resultados
        resultados.forEach(r => {
            const li = document.createElement("li");

            // Enlace a la página encontrada
            const a = document.createElement("a");
            a.href = r.url;
            a.innerHTML = `<strong>${r.titulo.charAt(0).toUpperCase() + r.titulo.slice(1)}</strong>`;
            li.appendChild(a);

            // Lista de fragmentos
            const ulFrag = document.createElement("ul");
            
            const palabrasOriginales = this.query.trim().split(/\s+/);
            const fragmentos = this.generarFragmentos(r.textoOriginal, r.coincidencias, palabrasOriginales);

            fragmentos.forEach(f => {
                const liFrag = document.createElement("li");
                liFrag.innerHTML = f;
                ulFrag.appendChild(liFrag);
            });

            li.appendChild(ulFrag);
            ul.appendChild(li);
        });

        section.hidden = false;
    }

    // Genera los fragmentos de texto donde aparecen las coincidencias
    generarFragmentos(textoOriginal, coincidencias, palabrasOriginales) {
        const fragmentos = [];
        const normalizado = this.normalizar(textoOriginal);

        // Crear fragmentos base alrededor de cada coincidencia
        let tempFrags = coincidencias.map(c => {
            const inicio = Math.max(0, c.indice - 40);
            const fin = Math.min(textoOriginal.length, c.indice + c.longitud + 40);
            return { inicio, fin };
        });

        // Combinar fragmentos que se solapan
        tempFrags.sort((a,b) => a.inicio - b.inicio);
        const combinados = [];
        tempFrags.forEach(f => {
            if (!combinados.length) {
                combinados.push(f);
            } else {
                const last = combinados[combinados.length - 1];
                if (f.inicio <= last.fin) {
                    // unir fragmentos solapados
                    last.fin = Math.max(last.fin, f.fin);
                } else {
                    combinados.push(f);
                }
            }
        });

        // Para cada fragmento combinado, resaltar TODAS las palabras
        combinados.forEach(frag => {
            let fragOriginal = textoOriginal.slice(frag.inicio, frag.fin);
            let fragNorm = this.normalizar(fragOriginal);

            palabrasOriginales.forEach(p => {
                const palabraNorm = this.normalizar(p);
                let idx = fragNorm.indexOf(palabraNorm);
                while(idx !== -1) {
                    fragOriginal = fragOriginal.slice(0, idx) + "<mark>" + fragOriginal.slice(idx, idx + p.length) + "</mark>" + fragOriginal.slice(idx + p.length);
                    
                    // actualizar fragNorm para seguir buscando
                    fragNorm = this.normalizar(fragOriginal);
                    idx = fragNorm.indexOf(palabraNorm, idx + "<mark></mark>".length + p.length);
                }
            });

            fragmentos.push(fragOriginal + "...");
        });

        return fragmentos;
    }


}

// inicialización automática
new Buscador("mapa.json");
