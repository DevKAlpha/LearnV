# Historia 55 · recorrido de actividades

Revisión: 16 de octubre de 2026.

## Historia refinada

Como estudiante de inglés o coreano, quiero reconocer mi siguiente actividad en un recorrido visual variado, identificar el reto C1 por su acabado dorado y encontrar pequeñas referencias culturales, para percibir mi avance y decidir qué practicar con claridad en móvil, tableta y ordenador.

## Criterios de aceptación

1. Cada destreza tiene un trazado reconocible. Las posiciones y formas dependen del número real de la actividad, por lo que expandir o contraer el recorrido conserva su identidad y orden.
2. La vista inicial muestra tres actividades próximas al paso actual. Una cadena de tres actividades, como C1, se muestra completa desde el principio. La ruta inicial permite consultar las 22 actividades de la destreza.
3. Los estados superado, disponible y bloqueado se distinguen mediante texto y símbolos. Solo las actividades desbloqueadas tienen enlace. C1 conserva su color dorado en los tres estados y lleva una etiqueta textual.
4. La numeración visible y la lista accesible coinciden, incluso cuando la ventana comienza por una actividad intermedia. Hay un único paso actual; al completar toda la cadena se ofrecen enlaces de repaso.
5. Las ilustraciones son decorativas, no interceptan pulsaciones y aparecen en el lado libre del nodo. La vista compacta muestra una; la ruta completa de 22 actividades muestra seis escenas distintas, espaciadas cada cuatro pasos. Hay seis diseños originales por idioma.
6. Los controles de expansión indican su estado y la lista que controlan. Contraer devuelve el foco al paso actual y respeta la preferencia de movimiento reducido.
7. La destreza seleccionada se conserva al recargar, salir de una práctica, volver desde resultados o alternar entre el repaso inicial y C1.
8. Los nodos y textos caben en los anchos comprobados; los selectores de destreza no permanecen sobre el camino en móvil, tableta o pantallas de poca altura.
9. El recorrido usa SVG y CSS. No incorpora imágenes remotas, mediciones continuas del diseño ni animaciones permanentes.
10. Las etiquetas bajo los emblemas muestran estado, título y mejor resultado cuando existe. El paso actual ofrece la preparación y el recordatorio de aprendizaje en un desplegable independiente del enlace; no se truncan los títulos para reducir su tamaño.

## Hallazgos y reparaciones

| Hallazgo | Ajuste |
| --- | --- |
| La tercera actividad C1 quedaba oculta al entrar y no existía un control para mostrarla. | Se muestran completas las cadenas de tres pasos. |
| La decoración usaba la paridad de la fila visible y podía quedar al lado del nodo. | Su lado depende de la posición absoluta del nodo; ya no cambia con la ventana. |
| Las seis destrezas repetían el mismo patrón. | Seis siluetas de recorrido, con límites de posición para móvil y escritorio. |
| El componente de página mezclaba ilustraciones, selección, progreso, trazado y controles. | Componentes separados para mapa e ilustraciones y funciones puras para ventana, posiciones y enlaces. |
| La lista intermedia seguía comenzando por el elemento 1 para tecnologías de asistencia. | `start` y `value` reflejan el número real; lista y controles tienen nombres y relaciones accesibles. |
| La insignia de aprobado o candado podía tapar el número del emblema. | El número pasa a la esquina superior izquierda y el estado permanece abajo a la derecha. |
| El selector fijo ocupaba buena parte del móvil. | Selector estático hasta 900 px o con altura máxima de 600 px. |
| Al salir de una práctica de otra destreza se volvía a Lectura. | La destreza se conserva en la URL y en los enlaces de salida y resultados. |
| El botón de expansión dependía del idioma del ejercicio, no del catálogo de interfaz. | Textos localizados en español, inglés y coreano. |
| Las tarjetas largas podían dejar muy poca distancia entre pasos. | Separación de filas basada en el alto real del contenido, sin un alto fijo. |

## Validación

Las pruebas automáticas recorren las seis destrezas de ambos idiomas, cada posición de progreso inicial, intermedia y final, y las tres actividades C1. Comprueban la ventana de tres pasos, el orden completo al expandir, el paso actual, la conservación de resultados, los límites de posición y los enlaces entre destrezas y fases. La representación de las páginas se comprueba en los tres idiomas de interfaz.

Pruebas de navegador realizadas sobre una dirección local aislada (`127.0.0.1:5186`), sin modificar datos de producción:

- Usuario nuevo: navegación por las seis destrezas de inglés; próximo ejercicio correcto y bloqueos sin enlace.
- Entrada con teclado a Pronunciación, salida mediante diálogo y recarga: se conserva Pronunciación.
- Expansión de 22 pasos y retorno: se conservan el número y la posición del paso actual y se devuelve el foco al enlace correcto.
- Realización completa de Lectura 01 en inglés y coreano: producción escrita, cuatro preguntas, resultado y regreso al camino. Ambos resultados marcan el primer paso como aprobado y desbloquean el segundo.
- Progreso intermedio con un intento fallido: lista 8–10, próximo paso 9, mejor puntuación conservada y actividad 10 bloqueada.
- C1 con una actividad aprobada: tres etiquetas C1, primer paso aprobado, segundo disponible y tercero bloqueado. Los tres mantienen el acabado dorado.
- C1 completado y repaso inicial: 18/18, tres enlaces de repaso y ningún paso pendiente; el archivo inicial muestra 132/132 y no lleva etiquetas C1. El cambio de fase conserva Gramática.
- Anchos 320, 390, 844, 1280 y 1440 px, incluida orientación horizontal de 844 × 390: sin desbordamiento horizontal en las vistas revisadas; selector estático cuando corresponde.
- Temas claro y oscuro: títulos, estados, números y candados legibles; consola del navegador sin errores durante estas pruebas.

La adaptación a movimiento reducido se verifica en las pruebas de las preferencias de desplazamiento y de animaciones del proyecto; no se cambió la configuración del sistema operativo durante la prueba de navegador.

Los datos de avance utilizados para estados intermedios y C1 proceden de una página temporal de preparación local, retirada antes de la entrega.

Resultado final: `pnpm run validate` correcto (arquitectura, 414 pruebas en 47 archivos y compilación de producción); `pnpm run build:qa` correcto. Vite mantiene el aviso ya existente sobre el tamaño del paquete inicial, de unos 620 kB; no impide compilar. Se borraron los resultados ficticios del origen local de prueba.

## Ajuste de tarjetas e ilustraciones · 16 de octubre

- Etiquetas de escritorio limitadas a 240 px de ancho; los primeros títulos de inglés ocupan unos 56 px de alto. Se elimina la repetición de la destreza y los textos secundarios permanentes, sin recortar el título ni la mejor puntuación.
- «Antes de empezar» conserva el foco didáctico, el tipo de intento y el aprendizaje que se vuelve a aplicar. Solo se ofrece en el paso actual disponible; es un `details` nativo fuera del enlace, con un área de pulsación mínima de 44 px y apertura mediante teclado.
- Colección de 12 SVG a color, con volúmenes y referencias culturales. Los archivos suman 16.079 bytes sin compresión HTTP, se cargan de forma diferida y no añaden una librería de ilustración al JavaScript de la aplicación. SVGO se usa solo en desarrollo.
- Pruebas adicionales: seis escenas distintas por destreza e idioma, existencia y presupuesto de archivos, ausencia de recursos remotos y contenido ejecutable, rutas de producción y QA, y separación entre consejos y navegación. Véase `src/app/learning-path-art.test.tsx` y `src/app/advanced-path-pages.test.tsx`.
- Navegador local aislado (`127.0.0.1:5187`): comprobados temas claro y oscuro, inglés y coreano, apertura/cierre de consejos sin navegar, expansión de 22 pasos, seis escenas distintas y bloqueos sin enlace. Acceso al primer ejercicio coreano y salida por su diálogo.
- Comprobados escritorio de 1280 px, tableta de 768 px, móvil de 390 px y C1 coreano a 320 px: sin desbordamiento horizontal ni títulos recortados en las vistas revisadas; C1 conserva el dorado y sus tres pasos. Los datos ficticios C1 se retiraron después de la prueba. La consola de la pestaña de comprobación no registró errores.
- Validación completa: arquitectura, 431 pruebas en 48 archivos y compilaciones de producción y QA correctas. Se mantiene el aviso previo del paquete inicial de aproximadamente 620 kB.
