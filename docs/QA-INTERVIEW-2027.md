# Chat de entrevistas · legibilidad y preparación GKS-U 2027

Revisión del 23 de octubre de 2026. Base `0eb4a3f`, rama de trabajo `interview-2027-polish`. Entrega en producción mediante integración en `main`; el QA remoto mantiene su rama independiente y no se actualiza con esta entrega.

## Alcance

- Se mantienen las fuentes de LearnV y los colores de los tulipanes. Mensajes y campo de respuesta usan `1rem`, peso 500 y espaciado 1.6–1.65: medidos a 18 px en escritorio y 16 px en móvil con la configuración actual. No se promete una mejora de resolución de pantalla.
- Superficies sólidas, contraste en claro/oscuro, tulipán vectorial centrado, iconos por rol y dos SVG originales: libro/conversación y cuaderno de progreso. Sin bitmaps, filtros SVG, fuentes ni dependencias nuevas.
- Estilos diferidos junto al chat; no se modifica la tipografía global. Se eliminan transformaciones del texto y desenfoques del panel. El reloj tiene estado propio y no repinta toda la conversación cada segundo. Se respeta movimiento reducido.
- La ayuda contextual relaciona cada etapa con la candidatura: Personal Statement, Study Plan/universidad, idioma/adaptación y contribución respaldada por evidencia. Se comparte la preparación con Estudio → Entrevistas.
- Se actualiza la pregunta sobre carrera/universidad y la repregunta del Study Plan. IDs, número de preguntas, adaptatividad, rúbrica y claves de progreso existentes se conservan. No se presupone que Medicina u otra carrera esté disponible: se pide verificar el programa en University Information 2027.
- Se corrige el informe con cobertura completa: ya no describe una señal presente en 8/8 respuestas como ausente o escasa. La puntuación sigue siendo una heurística estructural; no valida hechos, pronunciación, elegibilidad ni selección.

## Fuentes revisadas

1. [NIIED · convocatoria GKS-U 2027](https://www.studyinkorea.go.kr/ko/plan/gksNoticeRead.do?bbsId=BBSMSTR_000000000461&nttId=4522): se verificaron guía en inglés/coreano, formularios 0914 y archivos University Information por vía.
2. [Guía 2027 alojada por Pai Chai University](https://www.pcu.ac.kr/download/viewer/20261023/1792726976602/index.html): sección IV para Personal Statement/Study Plan y sección V para revisión documental y entrevista oral. Se consultó la representación HTML del visor.
3. [Avisos de la Embajada de Corea en España](https://overseas.mofa.go.kr/es-es/brd/m_8065/list.do): enlace de consulta local, no confirmación de una fecha de entrevista o cupo para España.

Las fichas son actividades originales de LearnV, no preguntas oficiales. No se trasladan fechas ni cupos de otra embajada. Los 90 segundos, las cuatro preguntas y la nota de LearnV no se presentan como requisitos oficiales. La fecha de revisión se muestra, sin afirmar una verificación en vivo. No se migran automáticamente todos los módulos históricos GKS 2026 ni se modifica su radar.

## Usabilidad y privacidad

- Repetir el idioma activo no reinicia la entrevista. Cambiar a otro idioma pide confirmación; cancelar conserva conversación y borrador.
- Foco dentro del modal mediante Tab/Shift+Tab, Escape para cerrar y restauración del scroll. El envío tiene nombre accesible; el historial tiene `role="log"`. Se enfoca la respuesta al comenzar y el título al mostrar el informe.
- El formulario y la ayuda tienen límites de altura específicos para ventanas bajas. En 640 × 360, con la ayuda abierta, panel y formulario quedan dentro del viewport; el contenido restante puede desplazarse.
- No se incorporan llamadas a IA, API externa, micrófono, subida de documentos ni guardado del texto del chat. Se mantienen los registros estructurales locales y el aislamiento QA existente.

## Pruebas

- `pnpm run validate` con base `/LearnV/`: arquitectura, **555 pruebas en 54 archivos**, TypeScript, build y presupuesto inicial. Quince pruebas nuevas respecto a las 540 de la base.
- `VITE_BASE_PATH=/LearnV/qa/ pnpm run build:qa`: compilación restringida, fallback y presupuesto correctos (**418 263 B / 137 870 B gzip**). No se cambia la rama ni la URL del QA remoto.
- Automatización: contenido de cuatro etapas en tres idiomas; enlaces HTTPS oficiales y fecha de revisión; uso compartido de las fichas; despliegue cerrado de la ayuda; SVG sin recursos remotos ni IDs duplicados; estilos diferidos, movimiento reducido, reloj separado e informe de cobertura completa en tres idiomas.
- Manual sobre bundle compilado: sesión completa de cuatro preguntas + cuatro repreguntas, feedback y reporte de ocho respuestas; repetición y reinicio; idioma activo sin reinicio; cancelación con borrador intacto; confirmación a inglés/coreano y envío coreano; botón deshabilitado sin texto; ayuda contextual y fuentes.
- Claro/oscuro, 1280 × 900, móvil 320 × 640 y horizontal 640 × 360. Sin desbordamiento horizontal observado; formulario visible en horizontal y con aviso de cambio en móvil. Shift+Tab desde cerrar permanece dentro del diálogo; cerrar restaura el scroll. Consola de la pestaña final sin errores ni advertencias.
- Carga inicial con base de producción: **418 305 B / 137 702 B gzip**, dentro del límite de 450 000 / 150 000 B. El nuevo contenido y sus estilos permanecen diferidos. No se declara una mejora de latencia medida con Lighthouse.

Límites: no es una auditoría con lector de pantalla ni una validación de autenticidad de candidaturas. Las pruebas responsive no sustituyen la comprobación en todos los teclados y dispositivos físicos. Las fuentes se abren por acción del usuario, sin descargar automáticamente sus adjuntos.
