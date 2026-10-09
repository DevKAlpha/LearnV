# QA de aprendizaje en GitHub Pages

- Producción: https://devkalpha.github.io/LearnV/
- QA: https://devkalpha.github.io/LearnV/qa/

QA se compila desde la rama `qa`, con Inicio, Estudio, ejercicios de inglés/coreano, simuladores, recomendaciones y chatbot. Beca, Documentos y Perfil siguen restringidos; sus URL redirigen a Estudio. Es un sitio público de pruebas, no un control de acceso ni un entorno para introducir datos personales reales.

## Publicar una mejora para probarla

1. Trabajar y ejecutar `pnpm run check:architecture`, `pnpm test` y `pnpm run build:qa` en `qa`.
2. Hacer commit y push a `qa`.
3. En Actions, esperar que **Validate learning QA** y luego **Deploy LearnV to GitHub Pages** finalicen correctamente.
4. Abrir `/LearnV/qa/`. La franja QA identifica el commit probado. Los metadatos completos están en `/LearnV/qa/deployment.json`.
5. Validar Inicio → Estudio → ambos idiomas → ejercicios → feedback → resultados → recomendaciones/chatbot; recargar en una ruta interna y repetir en móvil/modo oscuro. Confirmar persistencia al volver y que producción no cambió su progreso.
6. Solo después de aprobar, integrar los cambios a `main` y hacer push para publicarlos en producción.

El despliegue genera un solo artefacto con `main` en la raíz y `qa` en el subdirectorio. Un push a QA **no integra código a main**. El workflow de producción vuelve a validar la última versión de QA; si algún build o prueba falla, conserva el sitio anterior. El evento `workflow_run` se ejecuta desde la rama predeterminada: no necesita cambiar las restricciones del entorno Pages ni añadir secretos.

## Rutas y datos

Las recargas directas pasan por el 404 de Pages; las rutas QA vuelven a su propio index y se restauran antes de arrancar React, manteniendo parámetros y fragmentos. Sus assets usan `/LearnV/qa/`, no los de producción. El progreso y los diagnósticos usan claves `qa:`; idioma y tema son preferencias compartidas. QA no es una copia de los datos del usuario ni un respaldo remoto.

Para probar sin publicar: `pnpm dev:qa`. Para verificar las dos builds juntas localmente, configurar `VITE_BASE_PATH=/LearnV/` en producción y `/LearnV/qa/` en QA, compilar a directorios separados y ejecutar `node scripts/assemble-pages.mjs dist <directorio-qa>`. Servir `dist` con un servidor estático que utilice `dist/404.html` para rutas inexistentes (no con fallback universal a index).

`pnpm preview:pages` proporciona ese servidor local en `http://127.0.0.1:5176/LearnV/`. No modifica tus ramas ni publica cambios.
