# Historia 62 · Tu beca, de principio a fin

Implementación y revisión: **5 de noviembre de 2026**, hora de Bogotá. Rama `scholarship-life-guide`, desde `2c9135c`. Entrega autorizada para integrar en `main` y publicar en GitHub Pages. El historial de Git y la ejecución de despliegue registran la revisión publicada.

## Experiencia

En **Beca**, después de la guía cultural, la tarjeta ilustrada «Tu beca, de principio a fin» abre una guía bajo demanda. Enlace directo: `/gks#gks-life`.

Cinco etapas organizan doce situaciones. Se muestra una situación a la vez, con explicación, norma y límites, tres acciones, fuentes con artículos o apartados, una sección «¿Ya me está pasando?», oficina responsable y una pregunta para consultar. El guion de consulta es seleccionable y se puede copiar; no se envía ni solicita información personal en LearnV.

| Etapa | Situaciones | Fundamento principal |
| --- | --- | --- |
| Llegar y ubicarse | Registro, estancia y domicilio; organización de pagos | Study in Korea: residence; reglamento arts. 14 y 22 |
| El puente del coreano | TOPIK y transición; asistencia y justificación | Arts. 5–6, 10, 18(1), 19(2); convocatoria 2027 y requisitos del centro |
| Cuidar cada semestre | Matrícula y rendimiento; integridad; bienestar y apoyo | Arts. 9–11, 18–20, 23; procedimientos de asistencia y baja |
| Decidir con permiso | Viajes; trabajo y prácticas; bajas y cambios | Arts. 4, 7–8, 12–16, 18–19, 22 y 24; Study in Korea: trabajo y estancia |
| Graduarse y seguir | Finalización e informes; siguiente etapa profesional | Arts. 4, 11, 17, 22(7), 24(3–6); Study in Korea: cambio de estatus y empleo |

Se distinguen obligaciones, recomendaciones de organización y decisiones que requieren confirmación. La guía no calcula riesgo, no certifica cumplimiento ni promete conservar la beca. Explica que advertencia, suspensión de pagos y pérdida de condición son diferentes; recomienda pedir motivos, norma aplicada y procedimiento/plazo de respuesta o revisión. Las excepciones no se presentan como automáticas. La atención al bienestar no se equipara a perder la beca.

La tarjeta incluye un SVG original local con libro, recorrido, tulipán y graduación. Se conservan fuentes y colores del sistema. La ayuda contextual de Beca incluye el nuevo módulo en ES/EN/KO.

## Fuentes contrastadas

- **Reglamento NIIED de gestión de becarios, revisión 2026-03-01**: [publicación oficial de KMOU](https://www.kmou.ac.kr/global/na/ntt/selectNttInfo.do?mi=3841&nttSn=10364021). Se descargó y leyó el PDF bilingüe adjunto marcado `2026.3.1.개정`; su original coreano prevalece ante diferencias de interpretación. La fecha de la página sigue siendo 2025 y la versión `/english/` podía mostrar adjuntos antiguos: la aplicación enlaza la publicación `/global/` con el adjunto de 2026 y explica qué archivo abrir.
- PDF consultado: [descarga oficial del adjunto](https://www.kmou.ac.kr/common/nttFileDownload.do?fileKey=3211603880252ba1a4cb8273369a86f6). SHA-256: `16888459a0a214822a8c2e898f14e9228396a811dafb003a837ae65a1b3659e4`. No se incorpora una copia completa al repositorio.
- [Dongguk: anuncio oficial de la revisión](https://www.dongguk.edu/article/INTSTUNOTICE/detail/26763761), publicado el 3 de marzo de 2026. Se usó para localizar cambios, no para sustituir la lectura de las condiciones del PDF. En particular, el resumen de flexibilización laboral no se interpreta como autorización general para trabajar.
- [Study in Korea: Residence Eligibility and Stay Duration](https://www.studyinkorea.go.kr/en/life/residenceAndStayInfo.do): registro, prórroga, domicilio y cambio de estatus. Se contrastaron los plazos de 90 días para registro de estancias superiores a 90 días, 15 días para domicilio y solicitud de prórroga antes del vencimiento. Se informa de la obligación adicional de actualizar datos en el centro.
- [Study in Korea: Employment System for Foreigners](https://www.studyinkorea.go.kr/en/work/aboutForeignerEmploymentSystem.do). La guía señala las pestañas Part Time Job y Full Time Job. No publica un límite de horas único: la revisión de GKS incluye condiciones distintas por etapa, TOPIK y advertencias académicas, además de la autorización migratoria.
- [NIIED: convocatoria GKS-U 2027](https://www.studyinkorea.go.kr/ko/notice/scholarshipsRead.do?bbsId=BBSMSTR_000000000461&nttId=4522), publicada el 9 de septiembre de 2026 con adjuntos revisados 0914. La interfaz distingue este documento de admisión del reglamento de permanencia y pide confirmar la versión aplicable a la cohorte y los requisitos propios de la universidad.

El contenido son explicaciones y recomendaciones originales basadas en esas fuentes, sin testimonios inventados ni citas extensas. No fija prestaciones, costes, exenciones, concesión de visados o resultados disciplinarios universales. Incluye advertencia sobre posible devolución total/parcial por renuncia en los tres primeros meses y las excepciones reconocidas del art. 22(8), sin calcular un importe individual.

## Datos y carga

- Contenido completo, traducciones detalladas, almacenamiento y CSS se importan solo al abrir la tarjeta. La entrada no lee el almacenamiento. SVG local diferido; no hay iframes, nuevas dependencias ni consultas externas al recorrer situaciones.
- `learnv-scholarship-life-v1` conserva únicamente IDs de preparación; filtra valores desconocidos y duplicados. QA usa `qa:`. Se admite desmarcar, recuperar JSON inválido y seguir en memoria con aviso si falla el guardado. Eventos `storage` sincronizan otras pestañas, incluida la limpieza de almacenamiento.
- No se guardan fechas, documentos, salud, consultas o respuestas. Los textos del guion son plantillas sin datos personales. Las marcas no modifican el perfil, resultados, solicitudes o beca.
- Inicio de producción: **442 670 bytes / 145 582 gzip**, dentro de 450 000 / 150 000. El tamaño sin comprimir del inicio se mantiene respecto al anterior. No se realizó un benchmark de latencia comparativa.
- QA: compilación correcta, **442 628 bytes / 145 712 gzip**. Beca continúa fuera del alcance de las rutas de QA; esta entrega no amplía el entorno ni lo publica.

## Validación realizada

- `VITE_BASE_PATH=/LearnV/ pnpm run validate`: arquitectura, **744 pruebas en 65 archivos**, TypeScript, build, fallback SPA y presupuesto de inicio aprobados. Incluye 22 pruebas nuevas de cobertura del recorrido, trazabilidad, contenido trilingüe, normalización/guardado, denegación de almacenamiento, entrada diferida, HTML accesible y mapa de ayuda.
- `VITE_BASE_PATH=/LearnV/qa/ pnpm run build:qa`: aprobado. Compilación completa final restaurada con `VITE_BASE_PATH=/LearnV/ pnpm run build` tras QA.
- Navegador: las doce situaciones en español cambiaron al título y acciones correctos, con referencias presentes. Recorrido con teclado en la apertura. Al seleccionar una situación se enfoca el título y se desplaza al inicio, dejando margen para la cabecera fija.
- Copia del guion con confirmación visible; marca de trabajo guardada, persistente tras recarga y después retirada. Contador final 0/12 en el origen de prueba.
- Enlace directo abre la guía tras recarga. Cerrar y abrir de nuevo funciona. ES, EN y KO comprobados en pantalla; todos los textos de las doce situaciones se verifican también en los tres idiomas mediante pruebas.
- Tema claro y oscuro. Tamaños **320×640**, **390×844**, **844×390**, **1024×768** y **1280×720**: sin desbordamiento horizontal del documento; controles y texto nuevos ajustan su ancho. No se altera la disposición de las herramientas flotantes existentes.
- Sin errores de consola en la revisión final. `git diff --check` correcto.

Evidencias: `story62-entry-light.png` y `story62-guide-desktop-light.png` en el directorio de artefactos del chat. Vista local: `http://127.0.0.1:5220/LearnV/gks#gks-life`.
