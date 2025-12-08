import { es } from './es.js';
import { en } from './en.js';

export class I18n {
    constructor(defaultLang = 'es') {
        // Comprobar si ya hay idioma guardado en localStorage
        const savedLang = localStorage.getItem('language');

        this.language = savedLang || defaultLang;
        this.texts = { es, en };

        // Detectar página actual
        this.page = this.detectPage();

        // Aplicar textos
        this.updateTexts();
    }

    // Detecta qué archivo HTML está cargado
    detectPage() {
        const file = window.location.pathname.split("/").pop();
        return file.replace(".html", "");
    }

    // Cambiar el idioma
    setLanguage(lang) {
        if (this.texts[lang]) {
            this.language = lang;

            // Guardar la preferencia en localStorage
            localStorage.setItem('language', lang);

            window.langActual = lang;  // <--- actualizar variable global
            this.updateTexts();
        }
    }

    // Aplica la traducción según la página actual
    updateTexts() {
        const lang = this.texts[this.language];

        if (!lang) return;

        this.translateSearch(lang);
        this.translateLangSwitcher(lang);
        this.translateMenu(lang);
        this.translateFooter(lang);

        
        // ------- PÁGINA ESPECÍFICA -------
        switch (this.page) {

            case "index":
                this.translateIndex(lang.index);
                break;

            case "aficiones":
                this.translateAficiones(lang.aficiones);
                break;

            case "proyectos":
                this.translateProyectos(lang.proyectos);
                break;

            case "contacto":
                this.translateContacto(lang.contacto);
                break;

            case "busqueda":
                this.translateBusqueda(lang.busqueda);
                break;
        }
    }

    translateSearch(lang) {
        const label = document.querySelector('label[for="buscar"]');
        const input = document.querySelector('input[name="q"]');

        if (label) label.textContent = lang.search.label;
        if (input) input.placeholder = lang.search.placeholder;
    }

    translateLangSwitcher(lang) {
        const p = document.querySelector("header p");
        if (p && lang.lang.label) {
            p.firstChild.nodeValue = lang.lang.label + " ";
        }
    }

    translateMenu(lang) {
        const nav = lang.nav;
        if (!nav) return;

        const map = {
            inicio: 'index.html',
            aficiones: 'aficiones.html',
            cv: 'proyectos.html',
            contacto: 'contacto.html'
        };

        for (const key in map) {
            const a = document.querySelector(`nav a[href="${map[key]}"]`);
            if (a) a.textContent = nav[key];
        }
    }

    translateFooter(lang) {
        const imgs = document.querySelectorAll("footer img"); // sin traducción
        const p = document.querySelectorAll("footer p");

        if (p[0] && lang.footer.lastedit) p[0].textContent = lang.footer.lastedit;
        if (p[1] && lang.footer.copy) p[1].textContent = lang.footer.copy;
    }



    // ------------------------------
    // TRADUCCIONES POR PÁGINA
    // ------------------------------

    translateIndex(texts) {
        // === Título del documento ===
        if (texts.title) document.title = texts.title;

        const h1 = document.querySelector("header h1");
        if (h1 && texts.heading) h1.textContent = texts.heading;

        const h2 = document.querySelector("main h2");
        if (h2 && texts.welcome) h2.textContent = texts.welcome;

        const ps = document.querySelectorAll("main p");
        if (ps.length >= 4) {
            ps[0].textContent = texts.p1;
            ps[1].textContent = texts.p2;
            ps[2].textContent = texts.p3;
            ps[3].textContent = texts.p4;
        }

        const img = document.querySelector("main img");
        if (img) img.alt = texts.altPhoto;
    }

    translateAficiones(texts) {
        // === Título del documento ===
        if (texts.title) document.title = texts.title;

        const h1 = document.querySelector("header h1");
        if (h1) h1.textContent = texts.heading;

        const pIntro = document.querySelector("main > p");
        if (pIntro) pIntro.textContent = texts.intro;

        const h2List = document.querySelectorAll("main h2");
        if (h2List[0]) h2List[0].textContent = texts.torneosTitulo;
        if (h2List[1]) h2List[1].textContent = texts.musicaTitulo;

        const ps = document.querySelectorAll("main p");
        if (ps[1]) ps[1].textContent = texts.torneosIntro;
        if (ps[2]) ps[2].textContent = texts.musicaIntro;

        const liTorneos = document.querySelectorAll("main ul")[0].querySelectorAll("li");
        liTorneos.forEach((li, i) => { if (texts.torneos[i]) li.textContent = texts.torneos[i]; });

        const liGrupos = document.querySelectorAll("main ul")[1].querySelectorAll("li");
        liGrupos.forEach((li, i) => { if (texts.grupos[i]) li.textContent = texts.grupos[i]; });

        const video = document.querySelector("main video");
        if (video) video.setAttribute("aria-label", texts.videoAlt);
    }

    translateProyectos(texts) {
        // === Título del documento ===
        if (texts.title) document.title = texts.title;

        // Header
        const h1 = document.querySelector("header h1");
        if (h1 && texts.heading) h1.textContent = texts.heading;

        // Formación Académica
        const secciones = document.querySelectorAll("main section");
        if (secciones.length >= 3) {
            // Formación
            const formacionH2 = secciones[0].querySelector("h2");
            if (formacionH2 && texts.formacion) formacionH2.textContent = texts.formacion;

            const formacionLi = secciones[0].querySelectorAll("li");
            formacionLi.forEach((li, i) => {
                if (texts.formacionLista[i]) li.textContent = texts.formacionLista[i];
            });

            // Experiencia
            const expH2 = secciones[1].querySelector("h2");
            if (expH2 && texts.experiencia) expH2.textContent = texts.experiencia;

            const expLi = secciones[1].querySelectorAll("li");
            expLi.forEach((li, i) => {
                if (texts.experienciaLista[i]) li.textContent = texts.experienciaLista[i];
            });

            // Proyectos
            const proyectosH2 = secciones[2].querySelector("h2");
            if (proyectosH2 && texts.proyectosTitulo) proyectosH2.textContent = texts.proyectosTitulo;

            const pIntro = secciones[2].querySelector("p");
            if (pIntro && texts.proyectosIntro) pIntro.textContent = texts.proyectosIntro;

            const proyectosLi = secciones[2].querySelectorAll("li");
            proyectosLi.forEach((li, i) => {
                const textoTraducido = texts.proyectosLista[i];
                if (!textoTraducido) return;

                // Encuentra el enlace dentro del <li>
                const a = li.querySelector("a");

                if (a) {
                    // Cambiar solo el texto ANTES del enlace
                    li.firstChild.nodeValue = textoTraducido + " ";
                } else {
                    // Si no hay enlace, solo cambiar el contenido completo
                    li.textContent = textoTraducido;
                }
            });

            // TFG
            const tfgH2 = secciones[2].querySelectorAll("h2")[1];
            if (tfgH2 && texts.tfgTitulo) tfgH2.textContent = texts.tfgTitulo;

            const tfgP = secciones[2].querySelectorAll("p")[1];
            if (tfgP && texts.tfgDesc) tfgP.textContent = texts.tfgDesc;
        }
    }

    translateContacto(texts) {
        // === Header ===
        const h1 = document.querySelector("header h1");
        if (h1 && texts.heading) h1.textContent = texts.heading;

        // === Título del documento ===
        if (texts.title) document.title = texts.title;

        // === Secciones del main ===
        const secciones = document.querySelectorAll("main section");
        if (secciones.length < 2) return;

        // ============================
        //   SECCIÓN 1: Información
        // ============================
        const info = secciones[0];

        const infoH2 = info.querySelector("h2");
        if (infoH2 && texts.infoTitulo) infoH2.textContent = texts.infoTitulo;

        const infoP = info.querySelectorAll("p");

        // Nombre
        if (infoP[0] && texts.nombre) infoP[0].textContent = texts.nombre;

        // Email (mantener <a>)
        if (infoP[1]) {
            const a = infoP[1].querySelector("a");
            if (a) {
                infoP[1].innerHTML = texts.emailLabel + " " + a.outerHTML;
            } else {
                if (texts.emailLabel) infoP[1].textContent = texts.emailLabel;
            }
        }

        // Ubicación
        if (infoP[2] && texts.ubicacion) infoP[2].textContent = texts.ubicacion;

        // Redes sociales
        if (infoP[3] && texts.redes) infoP[3].textContent = texts.redes;

        // Lista LinkedIn / GitHub
        const redesLi = info.querySelectorAll("ul li a");
        if (redesLi.length >= 2) {
            if (texts.linkedin) redesLi[0].textContent = texts.linkedin;
            if (texts.github) redesLi[1].textContent = texts.github;
        }

        // ============================
        //   SECCIÓN 2: Feedback
        // ============================
        const feedback = secciones[1];

        const feedbackH2 = feedback.querySelector("h2");
        if (feedbackH2 && texts.feedbackTitulo)
            feedbackH2.textContent = texts.feedbackTitulo;

        const feedbackP = feedback.querySelector("p");
        if (feedbackP) {
            const a = feedbackP.querySelector("a");
            if (a) {
                feedbackP.innerHTML = texts.feedbackTexto + " " + a.outerHTML;
            } else {
                if (texts.feedbackTexto) feedbackP.textContent = texts.feedbackTexto;
            }
        }
    }

    translateBusqueda(texts) {
        // === Header ===
        const h1 = document.querySelector("header h1");
        if (h1 && texts.heading) h1.textContent = texts.heading;

        // === Título del documento ===
        if (texts.title) document.title = texts.title;

        // === Secciones del main ===
        const secciones = document.querySelectorAll("main section");
        if (secciones.length === 0) return;

        const resultados = secciones[0];

        // Título "Coincidencias"
        const h2 = resultados.querySelector("h2");
        if (h2 && texts.coincidencias) h2.textContent = texts.coincidencias;
    }
}


// Crear instancia y exponer al window
window.traduccion = new I18n('es');

window.I18N_TEXTS = { es, en };   // tus objetos de traducción
window.langActual = window.traduccion.language;  // idioma activo

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("header button").forEach(btn => {
        btn.addEventListener("click", () => {
            const lang = btn.textContent.toLowerCase();
            window.traduccion.setLanguage(lang);
        });
    });
});

