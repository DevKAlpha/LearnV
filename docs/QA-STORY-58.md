# Historia 58 · Biblioteca de lecturas

Implementación y validación: 29 de octubre de 2026. Rama de trabajo: `reading-library`. Entrega autorizada para integrar en `main` y publicar en GitHub Pages. El historial de Git y la ejecución de despliegue registran la revisión publicada.

## Experiencia entregada

- Acceso global discreto en el dock: estadísticas → biblioteca → entrevista. También aparece durante las pruebas; no modifica el bloque del perfil.
- Biblioteca en un panel independiente con desplazamiento propio. Cerrar restaura el foco, el desplazamiento de la página y la interacción con la actividad original.
- Portadas SVG originales con ilustraciones por temática, colores de tulipanes y contraste para ambos temas. Toda la tarjeta es un enlace nativo: un toque abre el texto real en otra pestaña y conserva LearnV.
- 40 entradas: 22 en inglés y 18 en coreano; 39 destinos distintos. El anuncio bilingüe GKS 2027 figura en ambos idiomas. Se distingue libro, guía y lectura breve: no se presentan todas las entradas como libros completos.
- Búsqueda por título, autor o tema, filtro de idioma y estanterías. Estado vacío recuperable, recuentos, etiquetas y ayudas en español, inglés y coreano.
- Teclado: foco inicial en cerrar, Tab/Shift+Tab dentro del diálogo, Escape, fondo inerte y retorno al botón. Enlaces con aviso de nueva pestaña y `noopener noreferrer`.

## Selección de contenido

| Área | Fuentes y utilidad |
| --- | --- |
| GKS | Study in Korea y NIIED: anuncio GKS-U 2027 y explicación general del programa, en inglés y coreano. El anuncio se identifica como tal; no equivale al PDF completo de requisitos. |
| Negocios y comercio | OpenStax: negocios, gestión, comportamiento organizacional, ética, economía, emprendimiento y marketing. KDI en coreano: competitividad, ESG, economía conductual e historia económica. |
| Salud | OpenStax: anatomía, biología, microbiología, psicología y química. NIAMS en coreano: salud de la piel, huesos y articulaciones. |
| Datos e informática médica | Python oficial en ambos idiomas; estadística OpenStax; intercambio de información sanitaria HealthIT.gov y HL7 FHIR; Data Science School y D2L en coreano. |
| Escritura e idiomas | OpenStax Writing Guide, ensayos de candidatura de UNC y gramática British Council. Dos cuentos completos en coreano de Wikisource para lectura avanzada. |

Los libros extensos abren en un capítulo sustantivo con navegación del editor. Se excluyeron destinos que exigían registro, selección de descarga, mostraban lectores rotos o bloqueos de acceso durante la revisión. No se alojan copias de los libros ni se descargan recursos externos al abrir LearnV.

Los casos históricos y la edición coreana antigua de D2L incluyen notas de contexto. Sus ejemplos MXNet no se presentan como herramientas actuales. Las fuentes generales de GKS no sustituyen la convocatoria vigente.

## Verificación

- `VITE_BASE_PATH=/LearnV/ pnpm run validate`: arquitectura, TypeScript, **653 pruebas en 57 archivos**, compilación, fallback SPA y presupuesto de inicio correctos. Incluye 14 pruebas nuevas de catálogo, filtros, Unicode, idiomas, enlaces directos, SVG y ayuda contextual.
- Producción: inicio **433 814 bytes / 142 655 gzip**, dentro del límite de 450 000 / 150 000. El catálogo y el panel se importan al abrir; no hay solicitudes a las fuentes ni montaje de las portadas mientras el botón está cerrado.
- `VITE_BASE_PATH=/LearnV/qa/ pnpm run build:qa`: correcto, **433 772 bytes / 142 791 gzip**. No cambia las rutas ni las restricciones de QA.
- `pnpm run library:check-links`: **39/39 destinos** respondieron con HTML y título válido, sin descarga obligatoria ni páginas de error detectadas. Revisión del 29 de octubre, hora de Bogotá. Esta comprobación de red es explícita y no ralentiza la compilación habitual.
- Navegador: un toque en Introduction to Business abre el capítulo legible en OpenStax; un toque en 동백꽃 abre el cuento coreano completo. No requieren registro ni una segunda acción para empezar a leer. No se recorrieron manualmente todos los capítulos de cada obra.
- Filtros: negocios, autor y título combinados, resultados vacíos/restablecimiento, cambio de idioma y búsqueda coreana `데이터` comprobados.
- Presentación clara/oscura, interfaz ES/EN/KO, escritorio y móvil de 320×640 y 390×844. A 320 px el diálogo queda dentro del viewport y no introduce desbordamiento horizontal. Los tres accesos flotantes conservan el orden y la separación.
- Modal: recorrido de teclado en ambos sentidos, Escape, bloqueo/restauración del fondo y retorno del foco comprobados.
- Actividad real: escribir una respuesta, consultar la biblioteca, buscar y cerrar conserva íntegro el borrador y la misma ruta. La biblioteca no pausa el cronómetro de una prueba.
- `git diff --check`: correcto.

## Mantenimiento y límites

El catálogo está en `src/infrastructure/data/reading-library.ts`; cada entrada registra fuente, idioma, tipo, nivel y fecha de revisión. Para añadir una entrada debe verificarse que el destino muestre texto, no solamente una tienda, un índice de descargas o una portada comercial. Ejecutar `pnpm run library:check-links` tras cambiar los enlaces.

Las fuentes son externas y su disponibilidad puede cambiar. Algunas muestran avisos de cookies, aunque el texto enlazado puede leerse sin resolverlos. No se ofrece lectura sin conexión ni se garantiza disponibilidad futura de terceros. La fecha mostrada corresponde a la revisión del enlace, no a la publicación del contenido.
