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
