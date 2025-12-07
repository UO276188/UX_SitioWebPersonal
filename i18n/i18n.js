import { es } from './es.js';
import { en } from './en.js';

export class I18n {
    constructor(defaultLang = 'es') {
         // Comprobar si ya hay idioma guardado en localStorage
        const savedLang = localStorage.getItem('language');

        this.language = savedLang || defaultLang;
        this.texts = { es, en };
        this.updateTexts();

        // this.language = language;
        // this.texts = { es, en };
    }

    // Cambiar el idioma
    setLanguage(lang) {
        if (this.texts[lang]) {
            this.language = lang;

            // Guardar la preferencia en localStorage
            localStorage.setItem('language', lang);

            this.updateTexts();
        }
    }

    // Actualizar los textos de la página
    updateTexts() {
        document.querySelector('header h1').textContent = this.texts[this.language].cv;

        // Menú
        document.querySelector('nav a[href="contacto.html"]').textContent = this.texts[this.language].contacto;
        document.querySelector('nav a[href="aficiones.html"]').textContent = this.texts[this.language].aficiones;
        document.querySelector('nav a[href="proyectos.html"]').textContent = this.texts[this.language].proyectos;

        // Secciones
        const secciones = document.querySelectorAll('main section');
        if (secciones.length >= 2) {
            secciones[0].querySelector('h2').textContent = this.texts[this.language].formacion;
            secciones[1].querySelector('h2').textContent = this.texts[this.language].experiencia;
        }

        const retro = document.querySelector('main section:nth-of-type(3) p');
        if (retro) {
            retro.textContent = this.texts[this.language].enviarCorreo + " saramaria@email.com";
        }
    }
}


// Crear instancia y exponer al window
window.traduccion = new I18n('es');
