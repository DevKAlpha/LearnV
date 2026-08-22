# LearnV

Aplicación móvil de preparación para Global Korea Scholarship. La información se separa por convocatoria y enlaza fuentes oficiales para evitar mezclar requisitos históricos con reglas vigentes.

## Aprendizaje

- Laboratorio exclusivo de entrevista GKS con preguntas, repreguntas, rúbrica y fuentes de control.
- Dos recorridos de idioma con 30 prácticas cada uno: 10 de escritura, 10 de escucha y 10 de pronunciación/entrevista.
- La escucha usa síntesis de voz del navegador y la pronunciación usa grabaciones locales que no se suben.
- Los videos se cargan de forma diferida desde `youtube-nocookie.com`; se ofrece un enlace externo como alternativa cuando el reproductor esté bloqueado o no haya conexión.

Las pruebas son material formativo. No emiten resultados oficiales de TOPIK, IELTS ni GKS. TOPIK II no contiene una sección de pronunciación; esa ruta prepara la producción oral necesaria para entrevistas.

## Desarrollo

```bash
pnpm install
pnpm dev
```

## Producción

```bash
pnpm build
pnpm preview
```

## Movimiento y rendimiento

La navegación usa `Motion for React` con carga diferida por pantalla. Las transiciones de ruta, los indicadores activos y el feedback táctil comparten una configuración central en `AppMotionProvider`, y respetan automáticamente la preferencia del sistema `prefers-reduced-motion`.

Los efectos visuales simples permanecen en CSS para reducir el trabajo de JavaScript y mantener una respuesta fluida en móviles.

## Docker

```bash
docker compose up --build
```

La aplicación quedará disponible en `http://localhost:8080`.

## GitHub Pages

El workflow incluido compila y publica `dist`. En GitHub, selecciona **Settings → Pages → Source: GitHub Actions**. La ruta pública se calcula automáticamente a partir del nombre real del repositorio y también funciona en repositorios `usuario.github.io`.

La navegación usa `HashRouter`, por lo que las rutas internas funcionan al recargar directamente desde el dominio por defecto de GitHub Pages sin requerir un servidor con reglas de reescritura.

## Privacidad

No se deben subir certificados, expedientes, pasaportes ni otra información personal al repositorio. El prototipo solo guarda localmente el estado de tareas y casillas.
