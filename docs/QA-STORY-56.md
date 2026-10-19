# Historia 56 · experiencia editorial ilustrada

Última revisión: 19 de octubre de 2026. Diseño de la segunda iteración: 17 de octubre de 2026.

## Historia refinada

Como estudiante, quiero que LearnV se sienta como un libro de aprendizaje ilustrado, con una jerarquía editorial y detalles de viñeta, sin perder los tulipanes, sus colores, mis avances ni la rapidez para encontrar y abrir mi siguiente actividad.

## Criterios de aceptación

1. Inicio, Beca, Estudio, Documentos y Perfil comparten capítulos, marcos y superficies de papel. Se conserva la familia original Manrope/Noto Sans KR en los títulos; el carácter editorial se consigue mediante composición, jerarquía y viñetas, no cambiándola por Georgia.
2. Se mantienen ambas paletas de tulipán, los brillos culturales, el contraste específico del perfil y el recorrido de actividades, incluido el dorado C1. Las ilustraciones originales no sustituyen los controles ni el contenido educativo.
3. La portada contiene tres viñetas con una estudiante, Seúl y un escritorio. Se añaden seis escenas SVG originales locales: lectura, Seúl, biblioteca inglesa, escritorio, viaje y jardín de tulipanes. Son decorativas y escalables, con trazos oscuros y superficies coloreadas legibles en ambos temas; ninguna usa mapas de bits, filtros, scripts ni peticiones remotas.
4. El capítulo no añade enlaces ni encabezados y no aparece en prácticas ni en el simulador escrito. QA conserva únicamente sus rutas permitidas y su numeración independiente.
5. La navegación sigue siendo interna, con los mismos enlaces, carga diferida, precarga existente y persistencia. Se respetan movimiento reducido y colores forzados.
6. El grafo JavaScript inicial no carga los bancos de preguntas. Ambos modos de compilación verifican un máximo conjunto de 450.000 bytes sin comprimir y 150.000 bytes gzip. Se recorren las importaciones estáticas transitivas del manifiesto y sus mapas de fuentes; las preguntas permanecen en destinos diferidos.
7. El catálogo ligero coincide con los 150 ejercicios por idioma. El desbloqueo, los contadores, la promoción automática C1 y el repaso siguen teniendo el mismo comportamiento que el catálogo completo.
8. Las ilustraciones no cubren enlaces ni botones. Por debajo de 900 px la ruta inicial no muestra su ilustración flotante y en tableta recupera el ancho antes reservado para ella.
9. Los tomos muestran foco visible con contraste en ambos temas. En colores forzados se retiran las escenas y sus marcos vacíos, conservando textos, progreso y acciones; se recupera también el espacio lateral de la ruta inicial.

## Implementación y optimización

- Estilos acotados a la variante editorial; portada, separador de capítulos y textos ES/EN/KO en componentes y catálogo propios.
- Textura mediante CSS, sin nuevas dependencias ni fuentes descargadas. Animación de entrada de 160 ms, no permanente; se elimina con movimiento reducido.
- Menor desenfoque en navegación móvil y sin desenfoque en cabecera de escritorio; se retira la reserva permanente de composición de la barra.
- Metadatos separados del banco educativo, con búsqueda por identificador en un mapa. Inicio, Perfil y los contadores dejan de importar las preguntas completas.
- Se corrige el contraste del número de capítulo en oscuro y la posición móvil del progreso frente al botón de entrevista.

### Revisión visual de fondo

La primera entrega conservaba demasiado la composición anterior y cambió la fuente de títulos sin una razón suficiente. Esta iteración sustituye aquel enfoque:

- **Referencias anime/manhwa 1, 2 y 3:** portada asimétrica de tres viñetas, personaje original lector, escenas que ocupan una parte importante del espacio y pequeñas cartelas. No se copian personajes de las referencias.
- **Referencias anime1, book2 y manhwa2:** biblioteca de tomos ilustrados, con lomo, numeración, portada cultural y enlace real al idioma. Las tarjetas de Estudio incorporan panorámicas de Londres y Seúl, no solo un símbolo pequeño.
- **Referencias book1, book3 y boook4:** jerarquía tipográfica marcada, retícula, tramas discretas, contornos y separación del dossier en dos columnas en escritorio. Se mantiene la tipografía original solicitada en la revisión.
- **Cabeceras propias:** lectura para Estudio, viaje para Beca, escritorio para Documentos y jardín para Perfil. Los laboratorios de escritura y entrevista también incorporan escenas.
- **Logo:** se elimina el relleno asimétrico legado y se centra el SVG dentro del recuadro. En navegador, los centros del contenedor y del SVG coinciden tanto en móvil como en escritorio.
- El atlas SVG anterior, ya sin uso, se retira del código. Los 12 SVG del camino, las formas de actividades, el dorado C1 y el contraste específico del tulipán de Perfil se conservan.
- Las ilustraciones se sirven como archivos SVG independientes, con dimensiones explícitas, decodificación asíncrona y carga diferida salvo la escena principal. Se aprovecha la caché al reutilizar cada escena, sin insertar todos sus trazados en JavaScript.

## Evidencia de rendimiento

Comparación de compilaciones locales de producción, mismo repositorio y entorno:

| Entrada JavaScript | Antes | Después |
| --- | ---: | ---: |
| Sin comprimir | 620,11 KB | 418,01 KB |
| Gzip informado por Vite | 209,99 KB | 137,76 KB |

La reducción del archivo inicial sin comprimir es aproximadamente 32,6 %. No equivale a una medición de mejora de latencia: no se afirma un porcentaje de velocidad. El contenido de preguntas se descarga al abrir su área de práctica, no se elimina. Los seis SVG suman aproximadamente 17,2 KiB sin comprimir después de optimizarlos con SVGO; cada archivo queda por debajo de 4,3 KiB. No se añade ninguna dependencia. El verificador conserva los presupuestos de 450.000 bytes iniciales y 150.000 bytes gzip.

## Validación

- `pnpm run validate`: arquitectura, TypeScript, pruebas y compilación de producción. La regresión se amplía a 468 pruebas en 50 archivos con escenas, portadas, enlaces de idioma y cabeceras diferenciadas en ES/EN/KO.
- `pnpm run build:qa`: compilación y presupuesto inicial correctos.
- Paridad automática de los 300 ejercicios: identificadores, destrezas, orden y umbral. Se compara el desbloqueo de todos los ejercicios después de cada paso hasta completar cada idioma y C1, incluido el repaso de los 132 ejercicios iniciales.
- Capítulos localizados, ausencia de navegación duplicada y de distracciones en ejercicios, SVG acotado, ausencia de recursos remotos y preferencias de accesibilidad cubiertos por pruebas.
- Segunda iteración: escenas comprobadas en Inicio, Estudio, Beca, Documentos, Perfil y el espacio inglés; panoramas de ambos idiomas cubiertos por pruebas. En 320 px se comprueba también el ancho interno de viñetas, pie de portada y tomos; ninguno desborda su contenedor. Revisión visual adicional en 390, 768, 960 y 1280 px, con ES/EN/KO y ambos temas. Se verifica la carga real de las seis escenas al llegar a sus secciones y la ausencia de errores de consola. El acceso desde el tomo inglés abre su espacio y su cadena manteniendo 1/132, la segunda actividad disponible y la tercera bloqueada.
- Navegador local: Inicio, Beca, Estudio, Documentos, Perfil, espacio coreano y cadena inglesa; temas claro y oscuro. Anchos revisados: 320, 390, 768, 900, 960 y 1280 px. Sin desbordamiento horizontal en las vistas medidas; cinco destinos disponibles en escritorio y barra inferior móvil. En 900 px las etiquetas largas pueden abreviarse visualmente, conservando su nombre accesible completo.
- Práctica real `en-reading-01`: 4/4 respuestas, 100/100; al volver se muestra 1/132, la segunda actividad disponible y la tercera bloqueada. El resultado se mantiene tras recargar.
- QA local: solo Inicio/Estudio, capítulo 02, sin enlaces de Beca/Documentos/Perfil y con progreso independiente. Sin errores de consola capturados en la sesión principal.

La práctica manual se realizó en el origen local aislado `127.0.0.1:5190`; no se modificaron datos de usuarios de producción. La comprobación local de QA no supone actualizar su rama de publicación independiente. Las capturas de revisión se conservan en el directorio de artefactos de este chat, fuera del código distribuido.

## Auditoría de pulido · 19 de octubre de 2026

Se conservaron y validaron los cambios locales de pulido que ya estaban iniciados en `codex/story56-qa-polish`. La revisión añadió pruebas de prefijos y proporciones de los SVG y reparó problemas confirmados en el navegador. No se actualizó producción ni se modificaron las ramas remotas.

### Hallazgos y correcciones

| Hallazgo | Resultado de la revisión |
| --- | --- |
| Las reglas antiguas de tema podían reintroducir vidrio y desenfoque en la portada. | Selector reforzado; se comprueba `backdrop-filter: none` en el paquete compilado, en claro y oscuro. |
| El menú estrecho de escritorio reservaba espacio al nombre de marca y truncaba etiquetas. | Entre 900 y 1100 px usa el tulipán centrado sin el bloque de nombre; a 900 px las cinco etiquetas inglesas caben sin truncamiento. Se conserva el nombre accesible del enlace. |
| Las tarjetas de idioma ocultaban el dibujo antiguo pero mantenían su columna vacía. | El texto cultural utiliza una columna completa; verificado en móvil y tableta. |
| La ilustración flotante de la ruta inicial se superponía a los pasos a 768 px. | Se oculta hasta 899 px y se retira el espacio reservado en tableta. Los tres enlaces pasan de 475 a 641 px útiles en la vista comprobada, sin dibujo encima. |
| La regla oscura antigua seguía imponiendo su foco amarillo, aunque la nueva regla aparecía en el archivo. | Se refuerza la especificidad y se verifica el estilo calculado: foco de 3 px, separado 5 px, oscuro sobre claro y claro sobre oscuro. No se usa el texto del CSS como única prueba. |
| En colores forzados quedaban espacios de ilustraciones ocultas. | Se colapsan las escenas, sus marcos y columnas; la ruta inicial recupera el margen lateral. Se mantienen las acciones y el progreso. |
| El control anterior medía solo un archivo de entrada. | Se valida todo el grafo estático del manifiesto, sin contar ni leer destinos diferidos; hay casos para dependencias transitivas, ciclos, deduplicación, bancos filtrados, mapas ausentes y límites exactos. |

### Pruebas automáticas y compilaciones

- `pnpm run validate`: arquitectura, TypeScript, **500 pruebas en 51 archivos** y compilación correctos.
- `VITE_BASE_PATH=/LearnV/ pnpm run build`: correcto. Grafo inicial: **418.042 bytes / 137.593 bytes gzip**, un archivo estático; los bancos completos siguen diferidos. Son tamaños de compilación, no una medición de latencia.
- `VITE_BASE_PATH=/LearnV/qa/ pnpm run build:qa`: correcto. Grafo inicial: **418.000 bytes / 137.763 bytes gzip**.
- Dieciocho combinaciones de seis escenas y tres bases (`/`, `/LearnV/`, `/LearnV/qa/`): URL correcta, proporciones idénticas al `viewBox`, dimensiones reservadas, sin foco ni nombres redundantes para lectores de pantalla.
- Los seis SVG siguen por debajo de 20.000 bytes conjuntos; sin scripts, eventos ejecutables, imágenes incrustadas ni dependencias nuevas.
- Se conservan las regresiones de progreso, preguntas iniciales y repeticiones, desbloqueo, promoción C1, archivo de repaso y aislamiento de idiomas.

### Comprobación manual sobre los paquetes compilados

No se utilizó únicamente el servidor de desarrollo: el servidor estático local reproduce el subdirectorio y el fallback de Pages.

- **320 px:** Inicio, Estudio, Documentos, Perfil y Beca; sin desbordamiento de texto o controles en las zonas revisadas. El logo permanece centrado; Perfil conserva los pétalos profundos y su brillo específico en claro. Las decoraciones recortadas intencionadamente no se contabilizan como desbordamiento de contenido.
- **768 px:** Estudio y tomos en español/coreano, temas claro/oscuro; pasos de la ruta inicial libres después de la reparación, Noto Sans KR en títulos coreanos, tarjetas con toda la columna de texto disponible.
- **900 px:** cinco destinos completos de navegación, sin truncar `Scholarship` ni `Documents`; portada sin desenfoque.
- **1280 px:** portada, fuente original, SVG servidos bajo `/LearnV/` y centrado geométrico del logo.
- **Teclado:** Tab entre tomos, foco visible real en ambos temas y apertura con Enter del tomo coreano. Se comprueba que las ilustraciones decorativas no añaden paradas de foco.
- **Persistencia:** marcar un documento actualiza 1/7 y 14 %; al recargar directamente `/LearnV/checklist` se conserva. Se desmarca al terminar y vuelve a 0/7. La navegación no marca actividades como completadas.
- **Simulador:** entrada desde Estudio, comienzo de sesión, ausencia del separador de capítulos y cancelación del diálogo de reinicio sin confirmar borrado. No se envían respuestas ni documentos a terceros.
- **QA:** paquete bajo `/LearnV/qa/`, alcance `learning-qa`, solo Inicio/Estudio, capítulo 02, cero enlaces a Beca/Documentos/Perfil y escena visible cargada desde el prefijo QA correcto.
- Sin errores de consola capturados en las dos sesiones de comprobación.

Los datos de prueba se limitaron a los orígenes locales `127.0.0.1:5196` y `127.0.0.1:5197`; no se tocaron datos de producción. La simulación local iniciada se deja guardada en ese origen aislado. La revisión no audita la vigencia de enlaces externos o requisitos de becas: su alcance es la experiencia de la historia 56.

### Límites y evidencia

Las preferencias de movimiento reducido y colores forzados se cubren con pruebas de reglas y componentes, no con una emulación del sistema operativo. No se afirma una certificación integral de accesibilidad, un resultado Lighthouse ni una mejora porcentual de velocidad real. Las pruebas de 150 actividades por idioma y de C1 son automáticas; no se simularon 300 sesiones completas manuales.

Capturas de esta auditoría, conservadas fuera del paquete distribuido: `story56-audit-tablet-20261019.jpg` (pasos libres en tableta) y `story56-audit-focus-20261019.jpg` (foco visible en los tomos), en el directorio de artefactos del chat.
