# Historia 53 · Movimiento ligero en los idiomas

La personalización de la historia 52 ahora tiene gestos breves, sin cambiar ejercicios, puntuaciones, progreso ni desbloqueos.

## Comportamiento

- Ilustraciones: llegada de 460 ms, desplazamiento de 4 px y opacidad inicial de 0,8; nunca se ocultan los textos ni se espera a que termine la animación para navegar. Al cambiar de idioma, la nueva ilustración repite su llegada.
- Inglés: libro y globo de conversación responden al foco o al hover. Coreano: la pieza de Hangul responde con un desplazamiento discreto. Regresan al reposo al salir del elemento.
- Tarjetas: hover solo con puntero fino; botones y enlaces tienen respuesta breve al toque. El teclado conserva su foco visible. Las cabeceras no interactivas permanecen quietas.
- Habilidades: el icono seleccionado se asienta en 280 ms. Se eliminó el pulso infinito del anillo del próximo ejercicio; el icono ofrece una señal finita y respuesta al foco. Las etapas bloqueadas no se vuelven interactivas.
- Distintivos de las sesiones y resultados: no tienen animación cultural. No se mueven el texto de las preguntas ni los controles de respuesta.
- `prefers-reduced-motion: reduce` o `update: slow`: movimiento local desactivado, incluidos hover, foco y pulsación. La navegación Pruebas/Materiales consulta la preferencia de movimiento en cada interacción y usa scroll inmediato al solicitar reducción.

## Coste y accesibilidad

CSS local, SVG existentes y un pequeño lector de preferencias de scroll. Sin paquetes, recursos externos, observers, bucles de JavaScript, temporizadores, `will-change` permanente ni animaciones continuas nuevas. Solo se interpolan `transform` y `opacity`; los filtros y las sombras de estas tarjetas ya no forman parte de sus transiciones.

Referencias técnicas: [web.dev · High-performance CSS animations](https://web.dev/articles/animations-guide) y [MDN · prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).

## Validación

- 316 pruebas automatizadas: 307 existentes y 9 nuevas para límites de duración, propiedades animadas, carga de estilos, aislamiento de las sesiones, movimiento reducido y lectura dinámica de preferencias.
- Arquitectura, TypeScript y compilaciones de producción y QA.
- Navegación real: las seis habilidades de ambos idiomas, expansión a 22 etapas (21 bloqueadas en una cuenta nueva), entrada al primer ejercicio y navegación Pruebas/Materiales.
- Vista local revisada en 320, 390, 768, 1024 y 1440 px, con temas claro y oscuro. Sin desbordamiento interno en las piezas culturales. A 320 px solicitados, el navegador reserva 15 px de scrollbar y sigue existiendo el mínimo global previo de 320 px; no se modificó el layout responsive.
- El navegador de revisión tiene movimiento reducido activo: se verificó el modo estático real, el foco y la navegación. Las reglas de movimiento normal se verifican por pruebas automatizadas; no se ha medido fluidez/FPS en hardware móvil real ni se ha desactivado la preferencia de accesibilidad del sistema para forzar las animaciones.
