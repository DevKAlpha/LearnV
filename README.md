# LearnV

Aplicación móvil de preparación para Global Korea Scholarship. La información se separa por convocatoria y enlaza fuentes oficiales para evitar mezclar requisitos históricos con reglas vigentes.

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
