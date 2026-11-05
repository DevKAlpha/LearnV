# Centrado de los botones flotantes en escritorio

Validado el 4 de noviembre de 2026. Rama: `desktop-floating-alignment`.

La columna usaba una distancia respecto a la ventana que no coincidía con el ancho real del marco. En portátiles podía quedar fuera del contenedor o invadir las tarjetas.

Se comparten las medidas del marco, sus bordes y la página mediante variables CSS. El eje de los botones se coloca en el punto medio entre el borde derecho del contenido y el borde interior derecho del marco. Se reserva un lateral mínimo de 90 px: el botón de 66 px dispone de 12 px por lado. En pantallas amplias se aprovecha el hueco natural de la página.

El ajuste se aplica al escritorio de al menos 900 px de ancho y 551 px de alto. La adaptación horizontal existente para ventanas muy bajas y el diseño móvil conservan sus reglas. No se añadieron cálculos JavaScript, observadores de tamaño ni dependencias.

## Comprobaciones

- Doce configuraciones de escritorio: 900 × 700, 900 × 600, 1024 × 768, 1024 × 600, 1280 × 720, 1366 × 768, 1440 × 900, 1536 × 864, 1599 × 900, 1600 × 900, 1920 × 1080 y 2560 × 1440.
- Desviación del centro inferior a 0,03 px en las medidas finales. Los cuatro controles comparten exactamente el mismo eje.
- Verificado en Perfil, Inicio, Beca, Estudiar y el espacio de inglés, donde se muestran tres controles flotantes.
- Verificado con barra de desplazamiento, después de cambiar de ruta y al abrir/cerrar el resumen de aprendizaje. El panel queda dentro de la ventana.
- Ambos temas comprobados. Regresión móvil comprobada a 390 × 844 y horizontal a 844 × 390.
- Capturas y mediciones guardadas fuera del repositorio. Se restauró el tamaño normal del navegador al terminar.

| Ancho de ventana | Hueco lateral | Espacio a cada lado del botón grande |
| --- | --- | --- |
| 900–1366 px | 90 px | Aproximadamente 12 px |
| 1440 px | 90,20 px | Aproximadamente 12,10 px |
| 1536–1599 px | 111 px | 22,5 px |
| 1600–2560 px | 112 px | 23 px |

## Validación técnica

- `VITE_BASE_PATH=/LearnV/ pnpm run validate`: arquitectura, TypeScript, **722 pruebas en 63 archivos**, compilación y fallback correctos.
- Carga inicial de producción: **442 670 B / 145 580 B gzip**, dentro del presupuesto.
- `VITE_BASE_PATH=/LearnV/qa/ pnpm run build:qa`: correcto; **442 628 B / 145 711 B gzip**.
- `git diff --check`: correcto.

Vista local: `http://127.0.0.1:5219/LearnV/profile`. El usuario autorizó el commit, la integración en `main` y la publicación en producción desde `desktop-floating-alignment`. La entrega se verifica con GitHub Actions y con la revisión servida por `https://devkalpha.github.io/LearnV/`. La rama independiente de QA no se promueve en esta entrega.
