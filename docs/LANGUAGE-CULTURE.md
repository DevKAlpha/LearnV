# Historia 52 · Identidad cultural de los idiomas

La identidad pertenece al idioma de la ruta, no al idioma de la interfaz. Los rótulos `EN · English` y `KO · 한국어` se conservan al traducir los textos de apoyo a español, inglés o coreano. Los saludos llevan su atributo `lang` para lectores de pantalla.

## Diseño y alcance

- Inglés: ilustración original de libros, ventana de biblioteca, ciudad y conversación. La idea es un idioma compartido por distintas culturas, no una única bandera ni un monumento presentado como representativo de todo el mundo anglófono.
- Coreano: ilustración original inspirada en la arquitectura hanok y en las letras ㄱ / ㅏ, con el saludo cortés `안녕하세요`. Es una referencia visual, no un catálogo exhaustivo de la cultura coreana.
- Tarjetas en Estudio e Inicio, cabecera de cada espacio y tarjetas de acceso a pruebas: identidad ilustrada. Ruta, ejercicio y resultado: distintivo compacto sin ilustración para conservar el foco.
- Sin cambios en pruebas, respuestas, puntuación, almacenamiento, tiempos o desbloqueos.
- SVG en línea sin imágenes remotas, nuevas fuentes, paquetes, filtros de desenfoque ni animaciones continuas. Los dibujos son decorativos (`aria-hidden`, no enfocables); el idioma permanece explícito en texto.
- Colores de tinta azul/cobre para inglés y verde/coral para coreano, dentro de los temas claro cálido y oscuro violeta existentes. Paletas oscuras específicas y texto no superpuesto al dibujo.

## Comprobaciones

Suite automatizada: variantes tarjeta/cabecera/distintivo en tres idiomas de interfaz, atributos de idioma y accesibilidad, ausencia de recursos externos, integración con progreso, enlaces y etapas bloqueadas. Comprobar además las compilaciones normal y QA.

Vista QA local revisada con anchos solicitados de 320, 390, 768, 1024 y 1440 px: las piezas culturales no presentan desbordamiento interno. El navegador con barras de desplazamiento reserva 15 px; al solicitar 320 px el contenedor global existente mantiene su mínimo de 320 px, mientras el área cliente mide 305 px. Ese mínimo no fue introducido ni cambiado por esta historia. La revisión es una simulación responsive en navegador, no una prueba en hardware móvil real.

Referencias de contexto cultural: [Korea.net · Korean Homes](https://www.korea.net/Events/Overseas/view?articleId=9192) y [British Council · Six tips for speaking English internationally](https://learnenglish.britishcouncil.org/level/improve-your-english-level/six-tips-speaking-english-internationally). Las ilustraciones son propias, no imágenes obtenidas de estas páginas.
