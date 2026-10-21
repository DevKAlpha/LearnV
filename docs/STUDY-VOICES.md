# Historia 51 · Voces de estudio

Un reproductor compartido atiende los diálogos originales, los audios de las preguntas y los modelos de pronunciación. En **Personalizar voz** se eligen acento disponible, voz concreta y ritmo claro/natural/ágil. La elección se guarda por idioma y en un espacio distinto para QA.

En inglés se contemplan Reino Unido, Estados Unidos, Australia, Canadá, Irlanda, Nueva Zelanda, India, Singapur, Hong Kong y Filipinas. Solo se habilitan las variantes que el motor del dispositivo realmente declara. Coreano usa voces de idioma coreano, con `ko-KR` como estándar: no se falsean dialectos coreanos ni se lee inglés con una voz de otro idioma.

La selección automática prefiere nombres que indiquen natural/neural/enhanced/premium y, después, el idioma regional de referencia. Son pistas del proveedor, no una medición de calidad ni una garantía de voz neural. El usuario siempre ve la voz y el idioma efectivos, y puede elegir otra voz. Si una preferencia no existe en otro dispositivo, se informa del fallback.

Se conserva el texto del ejercicio, el tono propio de la voz (`pitch=1`) y una velocidad moderada por defecto (`0.98`). El ritmo claro es `0.85`; el ágil es `1.08`. Las frases se reproducen en fragmentos cortos para limitar bloqueos del navegador, sin efectos aleatorios ni modificación de las respuestas. Los videos con voces reales mantienen su grabación y acento originales.

## Seguridad y límites

- Sin reproducción automática ni nuevos servicios de pago, claves o backend.
- Las voces son las disponibles en `speechSynthesis.getVoices()`; se escucha `voiceschanged` porque pueden aparecer después del arranque.
- Las voces en línea del navegador pueden procesar el texto predefinido del ejercicio. No se les pasan respuestas escritas, grabaciones ni datos personales.
- Un inicio silencioso expira en 8 s y una frase sin finalizar en 60 s. Detener, cambiar ajustes o salir invalida callbacks anteriores.
- Solo terminar todas las frases verifica la escucha. Una transcripción permite practicar, pero no concede por sí sola la acreditación de audio.
- La mejora no garantiza calidad humana en todos los móviles: para uniformidad de calidad harían falta audios nativos grabados o un proveedor neural, lo que requiere decidir coste, privacidad y alojamiento por separado.

## Validación manual

1. Abrir una práctica de pronunciación inicial de cada idioma y desplegar los ajustes.
2. Comprobar voz efectiva, idiomas correctos y variantes disponibles/no disponibles.
3. Escuchar una misma muestra natural → clara → natural; comprobar inteligibilidad, pausas y pronunciación real en los dispositivos objetivo.
4. Cambiar acento/voz durante reproducción: se detiene, no mezcla voces, y el siguiente play usa la nueva configuración.
5. Detener/repetir, navegar fuera y regresar; comprobar persistencia por idioma y separación QA.
6. En diálogos de escucha, cancelar antes del final no debe marcar escucha completada. Si falla, usar la transcripción y reintentar audio.
7. Probar móvil/PC, temas claro/oscuro, motor sin voces, arranque tardío y reproducción sin conexión. La evaluación perceptiva requiere escuchar en los dispositivos reales; los tests de motor simulado no la sustituyen.

Referencia de API: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices

## Comprobaciones realizadas · 9 de octubre de 2026

- Suite completa: 290 pruebas, incluyendo 40 nuevas de selección de idioma/acento, preferencias, eventos tardíos, controles traducidos y ciclo de reproducción.
- Verificación en la vista QA local: seleccionar Zira `en-US`, reproducir hasta recibir finalización, detener una repetición y recuperar voz/ritmo tras recarga. Controles revisados en temas claro y oscuro.
- El navegador de esta comprobación ofrece David, Mark y Zira `en-US`, pero no voces coreanas ni variantes inglesas asiáticas. Se comprobó el aviso, las opciones deshabilitadas y la transcripción coreana; no se comprobó reproducción coreana real ni calidad perceptiva en un teléfono.
- Los acentos adicionales se verificaron con catálogos simulados, no con voces instaladas en este dispositivo. Antes de afirmar una mejora audible, completar la escucha comparativa en los navegadores y móviles objetivo.
