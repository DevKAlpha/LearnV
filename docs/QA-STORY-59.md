# Historia 59 · España–Corea: preparación cultural

Implementación y revisión: **30 de octubre de 2026**, hora de Bogotá. Rama de trabajo `korea-cultural-bridge`, a partir de `ef416af`. Entrega autorizada para integrar en `main` y publicar en GitHub Pages. El historial de Git y la ejecución de despliegue registran la revisión publicada.

## Experiencia

En **Beca**, después de la información esencial y antes de las certificaciones, aparece una tarjeta ilustrada «España → Corea: aprende a vivir el cambio». Abre bajo demanda una guía con ocho situaciones:

1. Trato y comunicación.
2. Aula y trabajo en equipo.
3. Amistades y límites.
4. Comida e ingredientes.
5. Alojamiento y convivencia.
6. Transporte, teléfono y llegada.
7. Visado, trabajo y condiciones de la beca.
8. Salud y canales de ayuda.

Cada situación incluye un punto de partida posible en España, qué comprobar en Corea, dos acciones concretas, una frase coreana con significado y copia, una decisión con feedback y una preparación que se puede marcar. Los ejercicios son simulaciones didácticas identificadas como tales, no incidentes atribuidos a los autores de los testimonios. No tienen nota ni desbloquean o condicionan la beca.

La comparación evita definir una personalidad española o coreana: se presenta como orientación que debe adaptarse a personas, campus y ciudades. Rechazar alcohol, establecer límites o pedir apoyo no se presenta como una falta de adaptación cultural.

## Historias reales y trazabilidad

Los textos son resúmenes originales, sin citas extensas ni fotografías copiadas. Cada relato muestra autor, contexto, enlace original y límites de su alcance:

| Persona | Fuente y contexto | Aplicación |
| --- | --- | --- |
| Sara García | [UC3M, experiencias de movilidad](https://www.uc3m.es/estudios/movilidad-estudiantes-uc3m_outgoing/web-experiencias), cuatrimestre en Ajou; no indica año ni condición GKS | Una experiencia positiva de intercambio, sin prometer que será igual para todos. |
| Alba Vilanova | [Relato propio de Inha](https://albavilanova.es/movilidad/experiencias/estudiante-intercambio-incheon-universidad-inha-parte-1/), agosto–diciembre de 2017 | Buddy, alojamiento y dificultades de comunicación en clase. Se identifica el carácter histórico; no se reproducen precios como actuales. |
| Hema | [GKS Alumni Interview, NIIED, Vol.49](https://www.studyinkorea.go.kr/public/newsletter/202604/sub-2/sub_2.html), publicada en abril de 2026 sobre estancia 2006–2010 | Apoyo de docentes y compañeros, actividades y amistades. Se aclara que es una perspectiva india, no española. Original en imágenes EN/KO, inspeccionado visualmente. |

Otras cuatro fuentes oficiales complementan los testimonios:

- [Seoul Tourism Organization: Etiquette](https://english.visitseoul.net/essential-Info-article/Etiquette/ENN000393), editada en 2020: cortesía y primeras interacciones. Se distingue de una obligación legal.
- [Study in Korea: Living and Housing](https://www.studyinkorea.go.kr/ko/life/livingAndHousing.do): vivienda, transporte, teléfono, seguro y atención sanitaria. Se contrastaron las secciones pertinentes.
- [Study in Korea: Employment System for Foreigners](https://www.studyinkorea.go.kr/ko/work/aboutForeignerEmploymentSystem.do): seleccionar **Part Time Job** en la página. El fragmento `#part-time` no seleccionaba esa pestaña al entrar directamente, por lo que la guía explica la acción en el registro de fuentes.
- [Embajada de España: recomendaciones de viaje](https://www.exteriores.gob.es/Embajadas/seul/es/ViajarA/Paginas/Recomendaciones-de-viaje.aspx): sanidad, seguridad y teléfonos. Se verificaron **112 policía** y **119 ambulancias/bomberos** para llamadas en Corea.

Las siete fuentes fueron abiertas y revisadas en el navegador. El buscador integrado no devolvió resultados útiles y el conector de búsqueda no estaba disponible; la consulta se completó mediante navegador, leyendo los originales. No se usaron resúmenes automáticos del buscador como evidencia final.

No se fijan horas de trabajo, importes de seguro, precios de alquiler ni plazos de visado como condiciones universales. La autorización migratoria y las condiciones GKS se verifican por separado. Las acciones aconsejan confirmar el caso individual con universidad y autoridad competente. La guía no garantiza la concesión ni la conservación de la beca.

## Datos y rendimiento

- Solo se guardan identificadores de tareas preparadas en `learnv-culture-preparation-v1`; QA usa `qa:`. No se guardan respuestas de ejercicios, nombres, fechas de viaje, información sanitaria ni documentos.
- El guardado admite desmarcar, filtra datos desconocidos o duplicados y se recupera de JSON inválido. Si falla el almacenamiento, la interacción sigue en memoria con aviso. Los cambios de otra pestaña se sincronizan mediante el evento `storage`.
- Se puede cerrar y volver a abrir la guía; las tareas se conservan. Las respuestas de ensayo se reinician al desmontar y nunca se convierten en una puntuación GKS.
- El contenido completo y su CSS se importan solo al abrir la tarjeta. No hay nuevas dependencias, iframes ni consultas a las fuentes durante la navegación. La ilustración SVG es local y se carga de forma diferida.
- Presupuesto de inicio de producción: **433 848 bytes / 142 675 gzip**, frente a límites de 450 000 / 150 000. El módulo cultural diferido ocupa aproximadamente **19,22 kB gzip de JS** y **2,3 kB gzip de CSS**. No se realizó un benchmark comparativo de latencia de navegación.
- Enlace directo a la guía: `/gks#gks-culture`. Los enlaces `/gks#culture-story-sara`, `-alba` y `-hema` abren la guía y sitúan la historia tras cargarla.
- QA conserva su restricción de Beca: `/gks` sigue fuera del alcance de ese entorno. Compilar QA no publica la guía ni amplía sus rutas.

## Validación

- `VITE_BASE_PATH=/LearnV/ pnpm run validate`: arquitectura, TypeScript, **675 pruebas en 59 archivos**, build, fallback SPA y presupuesto de inicio correctos. Incluye **22 pruebas nuevas** de trazabilidad, contenido en tres idiomas, almacenamiento, entrada diferida, accesibilidad del HTML y mapa de ayuda.
- `VITE_BASE_PATH=/LearnV/qa/ pnpm run build:qa`: correcto, respetando las restricciones existentes; inicio de **433 806 bytes / 142 806 gzip**.
- Navegador: las ocho situaciones muestran feedback tanto para la opción incorrecta como para la correcta; acertar no marca una preparación automáticamente.
- Copia de frase confirmada. Selección de tarea, recarga con persistencia y desmarcado confirmados. Las marcas de prueba se retiraron.
- UI en español, inglés y coreano; temas claro y oscuro. La revisión detectó y corrigió que el nuevo panel usara la tinta oscura global en el tema oscuro: ahora utiliza `--story-ink`.
- Pantallas de 320×640 y 390×844, además de escritorio: sin desbordamiento horizontal. En la menor anchura el índice usa una columna; elegir una situación lleva el foco y el comienzo de lectura por debajo de la cabecera.
- Activación con teclado y controles nativos de radio/checkbox comprobados. El foco pasa al título de la situación elegida.
- Enlaces directos a la guía y a Alba comprobados tras recarga. Ayuda contextual de Beca actualizada y verificada por el mapa automático.
- `git diff --check`: correcto.

Evidencias visuales: `story59-culture-entry-light.png`, `story59-culture-desktop-light.png` y `story59-culture-mobile-dark.png` en el directorio de artefactos del chat. Los enlaces de terceros pueden cambiar: las fechas de revisión deben actualizarse después de volver a leer las fuentes, no solo de comprobar una respuesta HTTP.
