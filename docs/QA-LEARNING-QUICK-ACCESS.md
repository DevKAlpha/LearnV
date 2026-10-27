# Acceso flotante a Tu aprendizaje

Revisión del 25 de octubre de 2026. Base `878c129`, rama `learning-quick-access`. Entrega en producción mediante integración en `main`; el QA remoto conserva su rama independiente y no se actualiza con esta entrega.

## Alcance

- Se retira exclusivamente el resumen compacto de Estudiar. El resumen completo del perfil conserva el mismo componente, contenido, estilos, cinco indicadores, recomendación y nota de privacidad. El resumen de Inicio también se conserva.
- Un botón SVG de 48 px aparece encima de entrevistas, sin animación, contadores, notificaciones ni apertura automática. El acceso se mantiene también en las páginas de idiomas y pruebas, donde entrevistas continúa oculto como antes.
- El panel solo monta sus indicadores al abrirlo. Reutiliza el controlador y la recomendación existentes; no añade almacenamiento, sesiones, peticiones, dependencias ni seguimiento. Los enlaces siguen respetando las restricciones de QA.
- El panel no bloquea el fondo. Se cierra con X, Escape, pulsación fuera, salida de foco, selección de recomendación o cambio de ruta. Escape y X devuelven el foco sin desplazar la página. Los identificadores del panel flotante son únicos y no alteran los del perfil.
- Los controles comparten una cuadrícula fija para mantener el orden. Móvil y tableta reservan espacio sobre la navegación inferior; en pantallas bajas el panel se sitúa al lado y su contenido permite desplazamiento, manteniendo el cierre visible.

## Verificación

- `pnpm run validate`: arquitectura, 558 pruebas en 54 archivos, TypeScript, build, fallback y presupuesto inicial correctos.
- Regresiones en español, inglés y coreano: ausencia del resumen dentro de Estudiar; perfil con su panel completo idéntico; acceso global cerrado y sin indicadores montados inicialmente; destino accesible real; IDs distintos al coexistir con el panel de Inicio.
- `VITE_BASE_PATH=/LearnV/qa/ pnpm run build:qa` correcto. JavaScript inicial completo: 420 175 B / 138 187 B gzip; QA: 420 133 B / 138 339 B gzip. Dentro del presupuesto de 450 000 B / 150 000 B gzip. Los bancos de preguntas siguen diferidos. No se afirma una mejora de latencia medida.
- Navegador sobre desarrollo local aislado: Estudiar, Perfil, espacios inglés/coreano y ruta de pruebas coreana; ayudas en tres idiomas; temas claro y oscuro; 1280 × 900, 768 × 900, 320 × 640 y 640 × 360.
- Se comprobó apertura manual, cierre, Escape con foco devuelto, Tab hacia entrevistas, navegación y recomendación hacia la misma página. Abrir entrevistas cierra el resumen y deja un solo diálogo visible. Perfil y acceso muestran la misma cantidad de sesiones; el perfil conserva cinco indicadores y el flotante cuatro. Sin IDs duplicados ni desbordamiento horizontal en las vistas revisadas.
- Se corrigió el recorte del panel a 320 px causado por el ancho de la barra de desplazamiento y se verificó margen entre entrevistas y navegación inferior en móvil y horizontal. No se modificaron respuestas, resultados, documentos ni datos de producción.

La revisión de teclado y semántica no sustituye una auditoría completa con lector de pantalla. QA se verificó mediante compilación y regresiones de rutas; no se desplegó en el entorno remoto.

## Pulida visual del 26 de octubre

Base `ea4908e`, rama `learning-panel-depth`. Entrega en producción mediante integración en `main`; el QA remoto conserva su rama independiente y no se actualiza con esta entrega.

- Emblema original de libro y tulipán en el botón, ilustración de cabecera y cuatro símbolos SVG para racha, mejor racha, sesiones y tiempo. Vectores decorativos, sin IDs, filtros, imágenes externas ni animación; el botón conserva sus 48 px.
- Papel superpuesto, bordes dobles, sombras de apoyo, cabecera cálida y tarjetas con relieve. La recomendación y su acción usan superficies de mayor contraste. Variables propias para crema/lila en claro y ciruela en oscuro; los tulipanes conservan pétalos violetas y hojas verdes.
- La ilustración se activa únicamente desde el acceso flotante. El perfil conserva cinco indicadores, privacidad y apariencia original; no se muestran allí los nuevos SVG. Inicio también conserva su presentación.
- `pnpm run validate`: arquitectura, 558 pruebas en 54 archivos, TypeScript y compilación correctos. Build QA con base `/LearnV/qa/` correcto. JavaScript inicial completo: 422 946 B / 139 094 B gzip; QA: 422 904 B / 139 253 B gzip. Ambos dentro del presupuesto; no se añadieron dependencias ni fuentes.
- Navegador local: claro/oscuro en escritorio 1280 × 900 y móvil 320 × 640, contenido sin desbordamiento horizontal, cuatro tarjetas sin recorte interno y cinco SVG decorativos en el panel. El contenido completo cabe en el escritorio revisado; en móvil conserva el desplazamiento del cuerpo y el cierre visible. Escape devuelve el foco al botón. Perfil con cinco indicadores y cero ilustraciones nuevas; consola sin errores ni advertencias.
- Comprobación de pares de color aplicados y extremos de sus degradados: título claro 12,70:1, título oscuro 13,03:1; indicadores 11,58:1 y 8,09:1; texto de recomendación 7,64:1 y 10,95:1; etiqueta de recomendación 6,38:1 y 9,14:1; acción 9,94:1. Son muestras de contraste del componente, no una auditoría completa de accesibilidad de toda la aplicación.
