# Solo el tablero durante el aprendizaje

Revisión: **7 de noviembre de 2026**, hora de Bogotá. Rama `focused-learning-tools`, desde `016b07a`. Entrega autorizada para integrar en `main` y publicar en GitHub Pages. El historial de Git y la ejecución de despliegue registran la revisión publicada.

- La biblioteca flotante sigue la misma condición que el chat de entrevista: no se monta en los espacios de inglés y coreano ni en sus rutas y sesiones de pruebas (`/study/english`, `/study/korean`, `/tests/...`). Solo permanece el tablero.
- Se reutiliza `isImmersiveLearningRoute`, sin ampliar ni cambiar su alcance. Los materiales de cada idioma siguen disponibles dentro de su propia página.
- Fuera de estas rutas, biblioteca y entrevista vuelven a montarse. El perfil y el resumen de aprendizaje no cambian. El tablero conserva su estado y acceso global.
- La ayuda deja de incluir los accesos ocultos. Sus pruebas existentes cubren ambos idiomas, rutas y sesiones, tanto en producción como en QA; también verifican que los accesos sigan documentados fuera del aprendizaje inmersivo.

## Validación

- `VITE_BASE_PATH=/LearnV/ pnpm run validate`: arquitectura, TypeScript, **744 pruebas en 65 archivos**, build, fallback SPA y presupuesto de inicio aprobados.
- `VITE_BASE_PATH=/LearnV/qa/ pnpm run build:qa`: correcto. No se amplían rutas ni se publica QA.
- Navegador: en el espacio inglés, una sesión de lectura inglesa y el espacio coreano se comprobaron **1 tablero, 0 bibliotecas y 0 chats de entrevista**. El tablero se abrió dentro de la sesión y se cerró con su control. Al pasar a Perfil se comprobaron nuevamente los tres accesos.
- Las comprobaciones se realizaron sin escribir respuestas, finalizar intentos ni crear notas. Sin errores de consola en la revisión final.
- Sin cambios de estilos, dependencias o almacenamiento. `git diff --check` correcto.

Vista local: `http://127.0.0.1:5222/LearnV/study/english`.

Evidencia: `focused-learning-board-only.png` en el directorio de artefactos del chat.
