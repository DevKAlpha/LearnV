# Fase 8 · Comentario con IA (opcional)

Implementación y revisión: **16 de noviembre de 2026**. Rama `feature/phase8-ai-feedback`, sobre `feature/phase7-immersion`.

## Qué hace
- **Dónde aparece:**
  - en el **laboratorio de escritura** (TOPIK II 51–54, IELTS Academic Task 1 y 2);
  - en las **respuestas de entrevista** del simulador.
- **Qué devuelve:** un comentario con la rúbrica oficial, con estas partes:
  - puntuación por criterio y su comentario;
  - total orientativo;
  - lo que funciona;
  - hasta seis correcciones (texto original, propuesta y por qué);
  - un siguiente paso.
- **Complementa el análisis determinista** de la Fase 3, que sigue apareciendo encima; no lo sustituye.
- **Solo existe en builds con cuenta** (`VITE_SYNC_API`) y cuando la API tiene `ANTHROPIC_API_KEY`. Sin clave, el panel no se muestra. En GitHub Pages no existe.

## API (`apps/api`)
- **Endpoints** `/api/v1/feedback`:

  | Método | Ruta | Qué hace |
  | --- | --- | --- |
  | `GET` | `feedback` | Estado: activado o no, consentimiento y cuota de hoy. |
  | `PUT` | `feedback/consent` | Registra el consentimiento con `{ version: AI_CONSENT_VERSION }`. |
  | `DELETE` | `feedback/consent` | Retira el consentimiento, con efecto inmediato. |
  | `POST` | `feedback/writing` | `{ format, task, text, locale }`. |
  | `POST` | `feedback/interview` | `{ question, purpose, answer, locale }`. |

- **Contrato** en `@learnv/schemas/feedback-api`:
  - esquemas zod de petición y respuesta;
  - rúbricas oficiales: TOPIK 51–52 con 5 + 5 puntos; 53 con 7/7/16; 54 con 12/12/26; IELTS con cuatro criterios de banda 0–9; entrevista con cuatro criterios de 0–4;
  - límites de texto: 6.000 caracteres para la respuesta y 4.000 para el enunciado.
- **Orden en cada petición:**
  1. sesión;
  2. CSRF (`Origin` de confianza más `X-LearnV-Client`);
  3. validación zod;
  4. consentimiento vigente;
  5. cuota reservada de forma atómica (`INSERT … ON CONFLICT DO UPDATE … WHERE requests < límite`);
  6. llamada al modelo;
  7. devolución de la cuota si el modelo falla, rechaza la petición o responde algo inválido.
- **Cuotas:**
  - `AI_DAILY_LIMIT` por persona y día UTC (10 por defecto);
  - `AI_GLOBAL_DAILY_LIMIT` para todo el servicio (300 por defecto), un techo de gasto;
  - además, un límite de ráfaga de 20 peticiones cada 15 minutos por IP.
- **Datos guardados:**
  - solo `ai_usage` (persona, día, número de peticiones) y la versión y fecha del consentimiento en `users`;
  - el texto y el comentario **no se guardan**;
  - los contadores se borran a los 60 días y con la cuenta.
- **Migración** `0001_ai_feedback.sql`, generada con `drizzle-kit`. Se aplica al arrancar.

## Llamada al modelo (`src/ai/feedback-model.ts`)
- **SDK oficial** `@anthropic-ai/sdk` 1.8:
  - `client.beta.messages.parse` con `output_config.format = betaZodOutputFormat(...)`;
  - el esquema se construye por formato, con un `enum` de los criterios de esa rúbrica.
- **Modelo y esfuerzo:** por defecto `claude-opus-5-5` con esfuerzo `medium`. Se cambian con `AI_MODEL` y `AI_EFFORT`.
- **Thinking:** adaptativo. No se envía `thinking`, porque en Opus 5.5 siempre está activo; tampoco `temperature`.
- **Rechazos:**
  - con los modelos que lo admiten se activa el fallback del servidor ante rechazos (`fallbacks: "default"`, beta `server-side-fallback-2026-07-01`);
  - si toda la cadena rechaza, la API responde 422 `ai-declined` y devuelve la cuota.
- **Normalización en el servidor:**
  - cada criterio aparece exactamente una vez y la puntuación se limita al rango oficial;
  - el total son puntos TOPIK o la media de bandas IELTS redondeada a 0,5;
  - las listas y la longitud de los textos se recortan.
  - Si falta un criterio, la respuesta es 502 `ai-invalid` y se devuelve la cuota.
- **Prompt:**
  - el prompt de sistema es estable, con las rúbricas y los errores típicos de hispanohablantes, y lleva `cache_control`;
  - todo lo variable va en el mensaje de usuario;
  - el texto del estudiante va dentro de `<learner_text>` y el prompt indica que es material que evaluar, no instrucciones;
  - el prompt de sistema no supera el mínimo cacheable del modelo, así que el caché solo empezará a ahorrar si el prompt crece.
- **Errores del proveedor:**
  - 429 se convierte en `ai-busy`;
  - los demás errores de la API o de conexión se convierten en `ai-unavailable`.
  - El log solo registra el tipo de error, nunca el texto.
- **Cliente:** timeout de 90 s y un único reintento.

## Web
- **`AiFeedbackPanel`** (`shared/ui`) se carga en diferido y solo en builds con cuenta:
  - sin sesión, remite a Perfil;
  - el consentimiento explica qué se envía y a quién (Anthropic), que LearnV no guarda nada, que es orientativo, cómo retirarlo y que por debajo de 14 años debe consentir la madre, el padre o el tutor;
  - exige marcar una casilla antes de activar;
  - si cambia la versión del aviso, vuelve a pedirlo.
- **El resultado vive solo en memoria del componente**, sin `localStorage` ni sincronización. Avisa si el texto ha cambiado desde el comentario.
- **Cliente HTTP:** timeout de 100 s solo para estas peticiones. Las respuestas se validan con los mismos esquemas zod.
- **Arranque:** 390.816 B de JS (+40 B) y CSS sin cambios. El panel va en su propio chunk.

## Verificación
- **API:** 34 pruebas (supertest + PGlite), 11 de ellas nuevas en `feedback.test.ts`:
  - rutas: sesión, consentimiento vigente y retirada, validación antes de gastar cuota, cuota por persona con reinicio al cambiar de día UTC, techo global, devolución de la cuota en cada tipo de fallo, feature desactivada sin clave y purga a los 60 días;
  - adaptador (cliente Anthropic falso):
    - forma de la petición: modelo, `max_tokens`, `output_config` con `json_schema` y esfuerzo, `system` con caché, fallbacks solo en modelos compatibles, sin `thinking` ni `temperature`;
    - texto del estudiante etiquetado;
    - mapeo de rechazo, truncado, JSON inválido, 429 y 500;
    - normalización de puntuaciones y totales.
- **Web:** Vitest con 981 pruebas, entre ellas `ai-feedback.dom.test.tsx` con 5:
  - consentimiento explícito antes de enviar;
  - resultado con rúbrica, cuota y aviso de texto cambiado;
  - cuota agotada;
  - retirada y aviso desactualizado;
  - sin sesión o sin IA en el servidor.
- **Playwright:** 99/99. La prueba «sin cuenta no hay llamadas a la API» sigue en verde.
- **Bundle de la API** (`dist/server.mjs`): arranca con el SDK empaquetado, `/health` responde y `/feedback` exige sesión.
- **No probado:** una llamada real a Claude. No hay credenciales en este equipo y cada llamada cuesta dinero. Para probarlo, pon una clave en `apps/api/.env` y usa `pnpm api:dev` y `pnpm dev:sync`.

## Para producción (decisiones del responsable)
- Crear la clave en Claude Console, con un límite de gasto en la propia consola, y guardarla como secreto (`ANTHROPIC_API_KEY`).
- Revisar el texto legal: añadir a Anthropic como encargado del tratamiento en la política de privacidad, y la retención de datos del proveedor.
- Ajustar `AI_DAILY_LIMIT`, `AI_GLOBAL_DAILY_LIMIT` y `AI_EFFORT` según el presupuesto. `medium` es el punto de partida; súbelo solo si la calidad medida lo justifica.
