# Tu aprendizaje dentro del perfil

Implementación y revisión: **6 de noviembre de 2026**, hora de Bogotá. Rama `profile-learning-summary`, desde `cca960a`. Entrega autorizada para integrar en `main` y publicar en GitHub Pages. El historial de Git y la ejecución de despliegue registran la revisión publicada.

## Cambio

- Se retira el botón flotante del libro con tulipán y su diálogo «Tu aprendizaje» de la composición global. Se eliminan el componente y sus estilos específicos.
- El resumen completo de Perfil utiliza la presentación ilustrada del antiguo panel: libro y tulipán SVG, iconos de indicadores, bordes, luces, sombras y recomendación contrastada en claro y oscuro. Conserva la introducción del perfil y añade icono a «Habilidades trabajadas».
- Se conservan cinco indicadores: racha actual, mejor racha, sesiones, minutos activos y habilidades trabajadas. El botón «Continuar mi ruta» sigue usando la recomendación del controlador existente y se mantiene la nota de privacidad.
- No cambian claves, datos, lógica de seguimiento ni cálculo de recomendaciones. No se realiza migración ni se reinicia el historial. Las cifras siguen dependiendo de la actividad del dispositivo; las capturas de prueba pertenecen a un origen local nuevo, no al almacenamiento de producción.
- Los accesos restantes quedan en orden tablero → biblioteca → entrevista, sin fila vacía. Los estilos compartidos del dock viven en `learning-floating-tools.css`, importados desde App, independientes del componente retirado. Se conserva el centrado del dock dentro del margen de escritorio y su fila horizontal en pantallas bajas.
- La ayuda contextual de Perfil explica el resumen ilustrado y su recomendación en ES/EN/KO. Se retiran las instrucciones del botón eliminado de Estudiar y del catálogo global. La biblioteca ahora se describe entre tablero y entrevista.
- El resumen compacto preexistente de Inicio continúa disponible. El traslado solicitado afecta al panel y acceso flotante, sin retirar funciones de otras páginas.

## Validación

- `pnpm run validate`: arquitectura, **744 pruebas en 65 archivos**, TypeScript, build, fallback SPA y presupuesto de inicio aprobados. Las regresiones existentes verifican un único resumen ilustrado completo en Perfil, cinco indicadores SVG, privacidad y destino de la recomendación, además de ausencia del acceso eliminado en la ayuda de las páginas.
- `VITE_BASE_PATH=/LearnV/qa/ pnpm run build:qa`: aprobado. Se mantienen las restricciones de QA: Perfil continúa fuera de sus rutas disponibles. No se amplía ni publica QA como parte de este cambio.
- Compilación completa final restaurada con `VITE_BASE_PATH=/LearnV/ pnpm run build`: **440 387 bytes / 144 999 gzip** de JavaScript inicial, dentro de los límites de 450 000 / 150 000. La eliminación reduce el inicio respecto a la versión anterior. No se realizó un benchmark de latencia.
- Navegador: un resumen en Perfil con cinco indicadores; cero botones o paneles flotantes de aprendizaje. «Continuar mi ruta» lleva a Estudiar en un historial sin resultados. Tablero, biblioteca y entrevista abren y cierran correctamente.
- Interfaz revisada en español, inglés y coreano; claro y oscuro. Tamaños 320×640, 390×844, 844×390, 1024×768 y 1280×720, sin desbordamiento horizontal del resumen. Se conserva la disposición de los otros accesos móviles.
- Sin errores de consola en la revisión final. `git diff --check` correcto.

Vista local: `http://127.0.0.1:5221/LearnV/profile`.

Evidencias: `profile-learning-summary-light.png` y `profile-learning-summary-dark.png` en el directorio de artefactos del chat.
