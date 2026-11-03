# Historia 61 · Una voz cercana que también orienta

Validada el 2 de noviembre de 2026. Rama: `app-voice-polish`.

## Resultado

Se revisaron 61 mensajes por idioma (183 en español, inglés y coreano). La voz acompaña al usuario con explicaciones prácticas, humor ocasional y ánimo ligado a una acción posible. Se mantienen nombres reconocibles en navegación y controles.

| Espacio | Qué aporta el nuevo texto |
| --- | --- |
| Inicio | Sitúa la preparación antes del viaje, explica cómo completar una tarea y reconoce avances sin exigir una racha perfecta. |
| Beca | Convierte una intención en acciones: revisar convocatoria, confirmar vía y consultar fuentes. |
| Estudiar | Explica qué contiene cada idioma y permite empezar por una sola actividad. |
| Repaso inicial | Invita a recuperar la base y presenta los errores como parte del aprendizaje; mantiene su alcance opcional. |
| Pruebas | Sustituye «recorrido procedural» y «tarea productiva» por lenguaje cotidiano. El resultado perfecto describe los aciertos de ese intento, sin afirmar dominio general. |
| Resultados y materiales | Explica para qué sirven el análisis y la selección de recursos; el estado inicial indica cómo obtener el primer resultado. |
| Simulador escrito | Invita a escribir un primer borrador y conecta experiencias, acciones y objetivos. |
| Entrevistas | Propone hablar con voz propia y ejemplos; la bienvenida del chat conserva las cuatro preguntas y sus repreguntas. |
| Documentos | Añade un guiño breve, seguido de una instrucción clara sobre marcas y archivos personales. |
| Perfil y aprendizaje | Presenta los niveles como referencia y las estadísticas como orientación para elegir un siguiente paso. |
| Tablero | Explica las tres columnas y propone una acción pequeña, con un guiño a las «veinte pestañas abiertas». |
| Biblioteca | Explica el toque en la portada, la apertura en otra pestaña y cómo aprovechar la lectura. Una búsqueda vacía ofrece formas concretas de continuar. |
| Guía cultural | Acompaña la preparación de la estancia con historias, situaciones y frases. |
| Ayuda general | Actualiza la presentación de las cinco áreas, incluida la guía cultural, el repaso y las prácticas. La ayuda contextual existente conserva la explicación de los botones flotantes. |

## Criterios para continuar esta voz

- Primero explica qué puede hacer el usuario; después ofrece contexto o ánimo.
- Una o dos frases en introducciones. No añadir párrafos solo para sonar inspirador.
- Humor ligero sobre situaciones cotidianas, nunca sobre errores, datos personales, requisitos, nacionalidades o dificultades del usuario.
- Reconocer acciones y avances observables. Evitar prometer selección, fluidez, certificación o dominio por una puntuación aislada.
- Mantener verbos literales en botones: abrir, guardar, borrar, cerrar. Las instrucciones importantes deben entenderse sin metáforas.
- Adaptar la intención a cada idioma; conservar niveles, números y variables de interpolación.
- Mantener avisos de límites y privacidad claros y precisos.

## Validación

- `VITE_BASE_PATH=/LearnV/ pnpm run validate`: arquitectura, TypeScript, 722 pruebas en 63 archivos, compilación, fallback SPA y presupuesto de carga correctos.
- `VITE_BASE_PATH=/LearnV/qa/ pnpm run build:qa`: compilación y presupuesto correctos. Esto comprueba compatibilidad con QA; no promueve la rama ni publica el ambiente.
- Comparación de los seis catálogos contra `HEAD`: mismas claves, mismas variables, 61 cambios por idioma, sin cadenas vacías. Se conservaron los textos protegidos de requisitos, privacidad, errores de almacenamiento, borrado, alcance y limitaciones de evaluación.
- `git diff --check`: correcto.
- Revisión mediante navegador: Inicio en inglés y español; Estudiar en ES/EN/KO; ayuda de la pantalla y desplegable de las otras áreas; tablero vacío; biblioteca y búsqueda sin coincidencias; bienvenida del chat; Documentos.
- Comprobaciones responsive: Documentos a 320 × 640; tablero y chat a 390 × 844. Sin desbordamiento horizontal ni recorte horizontal de los párrafos y títulos comprobados. Los paneles conservan su desplazamiento vertical.
- Estudiar revisado en tema claro y oscuro. Se restauró el tamaño normal del navegador al terminar.
- No se añadieron dependencias, peticiones ni lógica nueva. Se conserva la carga diferida de paneles y bancos de actividades.

Carga inicial: producción **442 670 B / 145 581 B gzip**; QA **442 628 B / 145 714 B gzip**. Ambos dentro de 450 000 B / 150 000 B gzip. Frente a la revisión anterior, producción añade 4 859 B sin comprimir y 1 998 B gzip por los nuevos textos.

Las pruebas comprueban integración y funcionamiento; la revisión de tono es editorial, sin estudio con usuarios finales. Se mantienen los enunciados didácticos, formularios, reglas de evaluación, datos de convocatoria y testimonios existentes.

## Entrega

Vista local: `http://127.0.0.1:5217/LearnV/study`. El usuario autorizó el commit, la integración en `main` y la publicación en producción. La entrega se realiza desde `app-voice-polish`, conservando esta validación como evidencia. El despliegue se comprueba con GitHub Actions y con la revisión servida por `https://devkalpha.github.io/LearnV/`. La rama independiente de QA no se promueve en esta entrega.
