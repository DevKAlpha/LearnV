# Revisión de contenedores y adaptación del texto

Fecha: 3 de noviembre de 2026. Rama: `responsive-container-polish`.

## Problema reproducido

En Beca, la tarjeta cultural empezaba exactamente donde terminaba el último desplegable: **0 px de separación**. El resto de páginas acumulaba márgenes independientes, con saltos distintos entre secciones. Al ampliar la letra, algunos elementos reservaban un ancho o una altura insuficiente para su contenido.

## Cambios

| Contenedores | Corrección |
| --- | --- |
| Secciones de página | El contenedor de página gestiona el espacio con `gap`, sin sumar márgenes de cada tarjeta. Separación de 1,5–2 rem; se excluye la sesión de práctica, que conserva su distribución propia. |
| Beca | La guía cultural queda separada de los desplegables. Las insignias de certificaciones y videos tienen su propia fila. Los números y símbolos de apertura conservan espacio. |
| Documentos | Separación uniforme entre etapas; el contador pasa a otra fila cuando el ancho es pequeño. |
| Títulos y párrafos | Interlineado unitario de 1,18 y 1,6 respectivamente, con salto de palabras largas cuando es necesario. Se conserva la familia tipográfica existente. |
| Tarjetas y estadísticas | Columnas según el espacio y la fuente, no únicamente según el ancho del dispositivo. Los valores numéricos no se comprimen. |
| Rutas y prácticas | El indicador circular de avance crece con la fuente. Las pestañas permiten varias líneas en lugar de truncar nombres. Las flechas de los controles conservan su ancho. |
| Materiales | Los filtros y las acciones cambian de fila cuando necesitan más ancho. |
| Entrevistas | La cabecera y los botones de navegación pueden distribuirse en varias filas. El título del video permite saltos de línea y su marco reserva altura proporcional a la fuente. |
| Tablero móvil vertical | La cabecera deja de consumir la zona disponible de las notas: el contenido completo puede desplazarse. Las ideas iniciales usan columnas que responden al tamaño de letra. En horizontal se conserva la distribución de tres columnas. |
| Paneles flotantes y ayuda | Se evita que la cruz de cierre y los símbolos decorativos crezcan fuera de sus controles. La biblioteca mantiene sus portadas SVG y sus títulos de lectura. |

En la reproducción móvil de Beca, el hueco anterior a la tarjeta cultural es ahora **24 px con fuente de 16 px** y **48 px con fuente de 32 px**. Los desplegables internos usan 1 rem de separación.

## Comprobación visual y geométrica

- Once vistas: Inicio, Beca, Estudiar, Documentos, Perfil, los espacios de inglés y coreano, simulador escrito, preparación de entrevista y las rutas de pruebas de ambos idiomas.
- Matriz inicial de **55 combinaciones**: esas once vistas a 320 × 640, 390 × 844, 768 × 1024, 1280 × 800 y 844 × 390. Las incidencias encontradas en enlaces estrechos se corrigieron y se comprobaron de nuevo.
- Las once vistas se revisaron además a **320 × 640 con fuente raíz de 32 px (200 %)**. La pasada final no detectó desbordamiento horizontal de página ni texto recortado horizontalmente en los elementos inspeccionados.
- Se comprobó también la primera sesión de lectura de inglés con fuente normal y ampliada; conserva sus separaciones y sus controles.
- Las cinco páginas generales se revisaron a 320 px en inglés y coreano, además de español.
- Se abrieron las cuatro etapas documentales, los desplegables de Beca, la guía cultural, certificaciones, orientación audiovisual y los apoyos de estudio para comprobar el contenido oculto inicialmente.
- Paneles comprobados con fuente ampliada: tablero vacío, editor, nota larga, biblioteca, bienvenida de entrevista y resumen de aprendizaje. Se creó y eliminó una nota sintética para comprobar el tablero y el cambio a horizontal.
- Se comprobó Beca en tema claro y oscuro; se guardaron capturas y mediciones fuera del repositorio. El tamaño del navegador se restauró al terminar.

La ampliación de texto se realizó mediante una página temporal de desarrollo que fijaba la fuente raíz al 200 %. La página se eliminó antes de la entrega. Esta comprobación se centra en el tamaño de texto y no simula todos los ajustes posibles del sistema operativo. Los controles de formulario mantienen su desplazamiento interno cuando corresponde; las ilustraciones decorativas no se consideran recortes de texto de lectura.

## Validación técnica final

- `VITE_BASE_PATH=/LearnV/ pnpm run validate`: arquitectura y TypeScript correctos; **722 pruebas aprobadas en 63 archivos**; compilación, fallback SPA y presupuesto de carga aprobados.
- Producción: **442 670 B / 145 576 B gzip** en la carga inicial de JavaScript, dentro de 450 000 B / 150 000 B gzip.
- `VITE_BASE_PATH=/LearnV/qa/ pnpm run build:qa`: correcto; **442 628 B / 145 701 B gzip**.
- `git diff --check`: correcto.
- No se añadieron dependencias ni lógica de navegación. Los paneles y las actividades conservan su carga diferida.

## Entrega

Vista local: `http://127.0.0.1:5218/LearnV/gks`. El usuario autorizó el commit, la integración en `main` y la publicación en producción desde `responsive-container-polish`. El despliegue se comprueba con GitHub Actions y con la revisión servida por `https://devkalpha.github.io/LearnV/`. La rama independiente de QA no se promueve en esta entrega.
