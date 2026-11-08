# Validación de las historias 55–62

Revisión: **8 de noviembre de 2026**. Rama: `stories-55-62-validation`, desde `main` (`18d1115e477ed5525a8d856632711f7985142697`). Cambios preparados localmente; este informe no acredita un despliegue nuevo.

## Resultado y reparaciones

Las ocho historias conservan su funcionamiento en las comprobaciones descritas abajo. Se encontraron y repararon cuatro problemas:

1. **Material GKS desactualizado.** Las fichas de inglés/coreano y formularios seguían enlazando GKS-U 2026 y decían que 2027 no estaba publicado. Ahora usan el anuncio oficial GKS-U 2027 y explican qué adjuntos `0914` consultar, sin presentar plazos históricos como actuales.
2. **Avance de un ciclo diferente.** Las tres fichas revisadas tienen identificadores propios de 2027. Haber completado los formularios anteriores no marca automáticamente los nuevos. Se conservan las marcas históricas y el resto del avance.
3. **Error de almacenamiento silencioso.** Al marcar un material, un fallo de guardado mantiene el estado en memoria y muestra un aviso traducido. La escritura y el evento de progreso salen del actualizador de estado de React, evitando repetir esos efectos en Strict Mode.
4. **Copia al portapapeles sin respuesta.** Las dos guías podían esperar indefinidamente una petición pendiente del navegador. Ahora, tras cinco segundos, presentan su alternativa de copia manual. Se mantienen las protecciones contra respuestas de casos anteriores.

No se cambiaron fuentes, paleta de tulipanes, estructura visual, claves de almacenamiento existentes ni dependencias.

## Matriz por historia

| Historia | Prueba manual en navegador | Regresión automática y resultado |
| --- | --- | --- |
| **55 · Cadena de ejercicios** | Inglés y coreano: seis habilidades por idioma; vista compacta de tres actividades, expansión a 22, seis ilustraciones, actividad actual, bloqueos y contracción. Selección conservada al recargar. Anchos móviles sin desbordamiento horizontal de página. | `learning-path-layout`, `learning-path-art`, `language-tests`, `practice-test-metadata` y `learning-stories-validation`: disposición, SVG, contenido, desbloqueos y promoción. Las 150 actividades de cada idioma y sus reintentos se recorren mediante modelos automatizados. Conforme en este alcance. |
| **56 · Estética y rendimiento** | Revisión de estudio, materiales, perfil, biblioteca, tablero y guías; temas claro/oscuro y texto ES/EN/KO en pantallas seleccionadas. Se conservan profundidad, tipografía y detalles existentes. | Pruebas `storybook`, temas, tipografía, movimiento reducido, distribución y carga diferida. Compilación y presupuesto de inicio correctos; sin incremento de bytes de JavaScript inicial respecto a la base. Conforme en este alcance. |
| **57 · Retomar B1 / TOPIK I** | Tres microlecciones de cada idioma. Una respuesta errónea no completa la lección; la correcta da explicación y enlaza a lectura, gramática o escritura inicial. Progreso 3/3 conservado tras recargar; ruta principal continúa 0/132. Selector de ayudas comprobado. | `learning-restart` en datos y presentación: contenido, prerrequisitos, destinos, traducciones, persistencia y aislamiento de la ruta. Se mantiene breve y opcional. Conforme. |
| **58 · Biblioteca** | 22 lecturas EN y 18 KO; filtro de negocios, búsqueda sin resultados y limpieza de filtros. Libros SVG con enlaces directos. Foco contenido en el diálogo, cierre devuelve el foco al botón y restaura la página. Vista de 320 px revisada. | `reading-library` en datos/presentación: categorías, idiomas, SVG, enlaces nativos en pestaña nueva y montaje diferido. Comprobador de red: **39/39 URL distintas correctas para 40 lecturas**. Conforme en el instante de la comprobación; los sitios externos pueden cambiar. |
| **59 · España–Corea** | Ocho situaciones recorridas, con una decisión incorrecta y otra correcta en cada una. Marcado, recarga y desmarcado de preparación; tres testimonios originales contrastados. Alternativa manual visible cuando el portapapeles no responde. | `cultural-guide`: contenido, procedencia, límites de los testimonios, persistencia y datos malformados. Corrección compartida de copia cubierta con pruebas. Conforme, con la limitación consular indicada abajo. |
| **60 · Tablero** | Nota vacía rechazada. Creación con coreano y texto literal `<svg>` sin generar un elemento SVG inyectado; edición; movimientos hasta Hecho; fecha vencida; borrar/deshacer; recarga. Exportación JSON descargada y leída; importación con vista previa y restauración de copia anterior verificadas. Paisaje 844×390 con tres columnas. Nota de prueba retirada al terminar. | `task-board` en dominio, almacenamiento, presentación y editor: CRUD, fechas, límites, datos corruptos, conflictos, revisiones, importación, respaldo y sugerencias. Conforme. |
| **61 · Textos útiles** | Recorrido de textos, botones y ayudas en las nuevas secciones; comprobación de ES/EN/KO en los flujos indicados. Corregida la contradicción de ciclo GKS en los materiales. | `page-help` (77 casos), traducciones y pruebas de contenido de cada módulo. No se presenta el repaso como certificación ni las marcas de preparación como cumplimiento oficial. Conforme en las pantallas revisadas. |
| **62 · Cuidar la beca** | Cinco etapas y doce situaciones recorridas. Cada una presenta regla, tres acciones, fuente, recuperación, contacto y guion de consulta de solo lectura. Marcado conserva 1/12 al navegar/recargar y vuelve a 0/12 al desmarcar. Copia manual alternativa comprobada. | `scholarship-life` en datos y presentación: cobertura de etapas, referencias, traducciones, privacidad y almacenamiento. Distinción entre admisión 2027 y reglamento de permanencia de marzo de 2026 conservada. Conforme en este alcance. |

## Ejecuciones reproducibles

```powershell
$env:VITE_BASE_PATH='/LearnV/'
pnpm run validate
pnpm run library:check-links
$env:VITE_BASE_PATH='/LearnV/qa/'
pnpm run build:qa
$env:VITE_BASE_PATH='/LearnV/'
pnpm run build
```

- Base anterior: **744 pruebas en 65 archivos**. Resultado final: **751 pruebas en 67 archivos**, arquitectura y TypeScript correctos.
- Siete regresiones añadidas: ciclo/identificadores de los materiales (1), persistencia y fallo de guardado (2), portapapeles resuelto, denegado, pendiente y no disponible (4).
- Producción: **440.419 B iniciales / 144.999 B gzip**; base anterior 440.419 B / 145.009 B gzip. No es una medición de latencia en dispositivos reales.
- QA: **440.377 B / 145.145 B gzip**. Compilación correcta con base `/LearnV/qa/` y bancos de preguntas diferidos. Se restauró después la compilación completa con base `/LearnV/`.
- Se mantiene el alcance propio de QA: rutas de inicio y aprendizaje; Beca, Documentos y Perfil no se incorporaron a ese entorno. Su compilación no equivale a haberlo desplegado.
- Comprobaciones manuales en un origen local aislado `http://127.0.0.1:5223/LearnV/`; no se modificó almacenamiento de producción. Se probaron anchos 320, 390, 768, 1024 y el escritorio normal; tablero horizontal 844×390. No todas las combinaciones de pantalla/tema/idioma se probaron exhaustivamente.
- Marcado y desmarcado de materiales comprobados en interfaz, con persistencia tras recarga. El fallo de almacenamiento se simula en pruebas unitarias; no se bloqueó el almacenamiento del navegador del usuario.
- Sin errores ni avisos en la consola capturada al cerrar el recorrido.

## Fuentes contrastadas

Consultadas el 08/11/2026. Las fechas de revisión históricas de fuentes que no se releyeron íntegramente no se actualizaron de forma masiva.

- [NIIED · GKS-U 2027](https://www.studyinkorea.go.kr/ko/notice/scholarshipsRead.do?bbsId=BBSMSTR_000000000461&nttId=4522): anuncio de 09/09/2026 y adjuntos English, Korean y Application Forms `0914`; respalda la reparación de las fichas.
- [KMOU · Reglamento de becarios](https://www.kmou.ac.kr/global/na/ntt/selectNttInfo.do?mi=3841&nttSn=10364021) y [Dongguk · anuncio de revisión](https://www.dongguk.edu/article/INTSTUNOTICE/detail/26763761): publicación oficial y revisión efectiva 01/03/2026. En este recorrido se comprobó la publicación y versión; no se volvió a traducir íntegramente el reglamento.
- [Study in Korea · Residencia](https://www.studyinkorea.go.kr/en/life/residenceAndStayInfo.do), [empleo](https://www.studyinkorea.go.kr/ko/work/aboutForeignerEmploymentSystem.do) y [vida y alojamiento](https://www.studyinkorea.go.kr/ko/life/livingAndHousing.do): procedimientos y contexto oficial.
- [Visit Seoul · Etiqueta](https://english.visitseoul.net/essential-Info-article/Etiquette/ENN000393): orientación de contexto; no se convierte en una regla sobre todas las personas coreanas.
- [UC3M · Sara García](https://www.uc3m.es/estudios/movilidad-estudiantes-uc3m_outgoing/web-experiencias), [Alba Vilanova · Inha 2017](https://albavilanova.es/movilidad/experiencias/estudiante-intercambio-incheon-universidad-inha-parte-1/) y [Study in Korea · Hema](https://www.studyinkorea.go.kr/public/newsletter/202604/sub-2/sub_2.html): originales contrastados. Se conserva su contexto histórico y la distinción entre intercambio, GKS y perspectiva extranjera no española.

## Evidencia y límites

Evidencias locales de esta sesión:

- `C:/Users/nicol/.codex/visualizations/2026/08/18/01a012b4-456e-7342-a65c-0f10bec80155/stories-55-62-materials.jpg`: fichas actuales y tema oscuro.
- `C:/Users/nicol/.codex/visualizations/2026/08/18/01a012b4-456e-7342-a65c-0f10bec80155/stories-55-62-mobile.jpg`: guía de beca en móvil y tema claro.
- `stories-55-62-library-links.json` en ese mismo directorio: respuesta del comprobador de las 39 URL.
- Registros de validación y compilaciones en ese mismo directorio, con prefijo `stories55-62-`.

Limitaciones concretas:

- La [página consular española](https://www.exteriores.gob.es/Embajadas/seul/es/ViajarA/Paginas/Recomendaciones-de-viaje.aspx) respondió **403 Forbidden** al lector web. Se conserva el enlace oficial; no se acredita una relectura actual de su contenido.
- Los 39 enlaces de biblioteca respondieron correctamente al comprobador; esto no acredita haber leído todos los libros ni garantiza disponibilidad futura o idéntico comportamiento en todos los navegadores.
- La ruta completa avanzada/C1 se valida con pruebas del modelo y presentación; no se completaron manualmente las 300 actividades ni se forzó el progreso para simular aprobaciones.
- Responsive comprobado mediante tamaños de navegador, sin dispositivos físicos ni matriz completa de Safari/Firefox/Android/iOS. Tampoco se realizó una auditoría WCAG instrumental completa o una prueba de carga de red en hardware real.
- El portapapeles puede seguir sujeto a permisos del navegador. El remedio proporciona respuesta y copia manual; no concede permisos automáticamente.
- Sin commit, integración a `main` ni publicación de esta revisión. Los despliegues existentes permanecen como estaban.
