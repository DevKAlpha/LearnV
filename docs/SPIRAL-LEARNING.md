# Práctica conectada de idiomas

## Contenido

Cada idioma tiene 132 etapas: 22 para lectura, gramática, vocabulario, escritura, escucha y pronunciación. Las 24 etapas nuevas son las 21 y 22 de cada área e idioma. Son prácticas de integración breves, no exámenes oficiales ni niveles nuevos de certificación.

Las parejas nuevas conectan un primer problema con su continuación:

| Área | Primera aplicación | Continuación |
| --- | --- | --- |
| Lectura | Interpretar un estudio pequeño sin exagerar sus resultados | Combinarlo con otra fuente para decidir una acción |
| Gramática | Formular una explicación cautelosa | Añadir condiciones y ordenar acciones |
| Vocabulario | Recoger y analizar evidencia | Usarla para recomendar apoyo y asignar recursos |
| Escritura | Redactar una propuesta con evidencia y límites | Adaptarla a una nueva restricción |
| Escucha | Identificar cambios de hora, lugar y preparación | Distinguir información mantenida, condiciones y nuevo plazo |
| Pronunciación | Hacer audible un contraste con pausas | Responder una repregunta con un ejemplo y una aclaración |

## Progresión sin sobrecarga

- Desde la segunda etapa se recupera un solo punto del ejercicio anterior de la misma área. No se acumula una lista de todas las reglas anteriores.
- Una pregunta de recuperación sustituye una pregunta genérica; se mantienen cuatro preguntas en el primer intento y cinco en las repeticiones.
- La tarea productiva aplica el punto anterior a una situación nueva. La tercera comprobación existente verifica esa aplicación por autoevaluación, sin añadir pasos ni aumentar la extensión requerida.
- El ejemplo anterior es desplegable. El resultado anticipa la siguiente aplicación, y la navegación permanece dentro del área actual.
- Los ejercicios nuevos tienen una estimación de 8–10 minutos y no obligan a producir respuestas más largas para demostrar avance.

## Compatibilidad y límites

Se conservan los 240 identificadores originales y la clave de almacenamiento `learnv-language-tests-v1`. Aprobar una etapa 20 existente desbloquea su etapa 21. No se eliminan intentos, mejores puntuaciones ni etapas aprobadas.

Las nuevas escuchas son textos originales con voz sintética del navegador, no grabaciones auténticas de hablantes. Solo se acredita la escucha sintética después de la finalización del audio y las comprobaciones del usuario. Si no existe una voz del idioma, falla el motor o la reproducción queda detenida, se puede practicar con transcripción; esa práctica no acredita escucha ni desbloquea la siguiente etapa. Los 40 recursos de YouTube existentes conservan su flujo de verificación manual.

La puntuación sigue midiendo las respuestas objetivas. La escritura y pronunciación originales no reciben una evaluación automática de calidad: las comprobaciones productivas son formativas y locales. El chatbot y las recomendaciones conservan su integración con los resultados existentes.

## Verificación

Las pruebas de `spiral-practice.test.ts` cubren tamaños de rutas, identificadores, prerrequisitos, compatibilidad con progreso anterior, alineación de respuestas y explicaciones, repetición, límites de escritura y distinción entre audio y transcripción. La comprobación manual incluye dos sesiones consecutivas de inglés, recuentos y contenido nuevo en coreano, navegación y ausencia de desbordamiento en portátil y móvil.
