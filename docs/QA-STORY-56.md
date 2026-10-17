# Historia 56 · experiencia editorial ilustrada

Revisión: 17 de octubre de 2026. Segunda iteración visual tras la revisión del usuario.

## Historia refinada

Como estudiante, quiero que LearnV se sienta como un libro de aprendizaje ilustrado, con una jerarquía editorial y detalles de viñeta, sin perder los tulipanes, sus colores, mis avances ni la rapidez para encontrar y abrir mi siguiente actividad.

## Criterios de aceptación

1. Inicio, Beca, Estudio, Documentos y Perfil comparten capítulos, marcos y superficies de papel. Se conserva la familia original Manrope/Noto Sans KR en los títulos; el carácter editorial se consigue mediante composición, jerarquía y viñetas, no cambiándola por Georgia.
2. Se mantienen ambas paletas de tulipán, los brillos culturales, el contraste específico del perfil y el recorrido de actividades, incluido el dorado C1. Las ilustraciones originales no sustituyen los controles ni el contenido educativo.
3. La portada contiene tres viñetas con una estudiante, Seúl y un escritorio. Se añaden seis escenas SVG originales locales: lectura, Seúl, biblioteca inglesa, escritorio, viaje y jardín de tulipanes. Son decorativas y escalables, con trazos oscuros y superficies coloreadas legibles en ambos temas; ninguna usa mapas de bits, filtros, scripts ni peticiones remotas.
4. El capítulo no añade enlaces ni encabezados y no aparece en prácticas ni en el simulador escrito. QA conserva únicamente sus rutas permitidas y su numeración independiente.
5. La navegación sigue siendo interna, con los mismos enlaces, carga diferida, precarga existente y persistencia. Se respetan movimiento reducido y colores forzados.
6. La entrada JavaScript no carga los bancos de preguntas. Ambos modos de compilación verifican un máximo de 450.000 bytes sin comprimir y 150.000 bytes gzip, y rechazan los bancos de preguntas dentro de su mapa inicial.
7. El catálogo ligero coincide con los 150 ejercicios por idioma. El desbloqueo, los contadores, la promoción automática C1 y el repaso siguen teniendo el mismo comportamiento que el catálogo completo.

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
