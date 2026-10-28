# Recursos añadidos al carrusel de orientación

Revisión: 28 de octubre de 2026.

Se conservan las tres opciones existentes y se añaden dos recursos complementarios:

| Recurso | Procedencia comprobada | Uso y alcance |
| --- | --- | --- |
| [2027 GKS-U How to apply?](https://www.youtube.com/watch?v=6FKKLB_eifo) | Canal GKS Alumni. La descripción atribuye la guía a GKS Buddies y NIIED. El [portal oficial Study in Korea](https://www.studyinkorea.go.kr/en/plan/scholarship.do?tab=gks-tab1) enlaza este ID como `Long Video Guide`. | Preparar los pasos de la solicitud en línea; comprobar primero si la vía elegida usa ese sistema. La ficha permite abrir el portal que acredita la procedencia. No se presenta el canal Alumni como canal institucional de NIIED. |
| [The 6 Types of GKS Applicants Who Get Rejected](https://www.youtube.com/watch?v=og8GBS3FAog) | Canal StudyChingu; publicación del 1 de abril de 2021 comprobada en YouTube. Es una fuente independiente. | Revisar la lectura de instrucciones y la comunicación durante la candidatura; convertir la orientación en tres mejoras propias. Se señala el año y no se presenta como criterios oficiales ni requisitos de 2027. |

La referencia `Application Guidelines for the GKS Degree Program`, enlazada desde NIIED con ID `21fpQhrgIZ8`, se descartó: YouTube indica que ahora es privada. El video de orientación de marzo de 2026 no se eligió porque su formato de resumen del evento aporta menos a la tarea de preparar la candidatura.

Los textos y la advertencia del carrusel se actualizan en español, inglés y coreano. Los cinco selectores pueden distribuirse en varias filas en pantallas estrechas. El reproductor conserva la carga bajo demanda: solo se crea el iframe del video seleccionado al pulsar reproducir.

Validación: `pnpm run validate` aprobó arquitectura, 639 pruebas, TypeScript, compilación y presupuesto de carga (427906 B / 140929 B gzip). En navegador se comprobó la selección de los cinco recursos, los enlaces de YouTube y de procedencia, la vuelta del quinto al primero, la creación del iframe al reproducir y su retirada al cambiar de opción. A 320 px los cinco botones se distribuyen sin desbordamiento horizontal. Se revisó el cambio de tema claro/oscuro. No se reprodujeron íntegramente los cinco videos durante esta prueba funcional.

Entrega preparada en `gks-guidance-videos` para integrar en `main` y publicar mediante GitHub Pages. La publicación se verifica mediante el resultado de GitHub Actions y la revisión servida en producción.
