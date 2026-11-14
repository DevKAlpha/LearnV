# Fase 4 · Ciclo GKS y perfil

Implementación y revisión: **13 de noviembre de 2026**. Rama `feature/phase4-gks-profile`, sobre `feature/phase3-learning-engine`.

## Cambios

### Línea temporal del ciclo (`src/domain/models/gks-cycle.ts`)
- **Fases del ciclo GKS-U:** preparación, convocatoria, solicitud, primera ronda, segunda ronda, resultados y antes de viajar. El ciclo se nombra por el año de ingreso.
- **Fechas:**
  - Cada fase tiene una ventana estimada a partir de ciclos anteriores y se muestra como «fecha estimada».
  - Las fechas confirmadas por una guía oficial (`src/infrastructure/data/gks-cycle-data.ts`) sustituyen a la estimación y se marcan como «confirmada en la guía». Hoy solo está confirmada la publicación de la guía 2027 (9-9-2026).
- **Ciclo objetivo** (`targetEntryYear`):
  - Quien se prepara apunta a la primera convocatoria cuya solicitud no ha cerrado. Hoy (13-11-2026) es GKS-U 2028.
  - Quien ya presentó la solicitud sigue su ciclo (GKS-U 2027, primera ronda).
  - Se elige en Beca con «¿En qué punto estás?».
- **Siguiente acción según la fase.** En preparación depende de los días que faltan para la convocatoria:
  - más de 180 días: certificado de idioma;
  - entre 75 y 180: documentos oficiales;
  - menos de 75: borradores.
  - Después: leer la guía, entregar, entrevista, mantener el ritmo, resultados y viaje.
- **Dónde se ve:**
  - En Inicio hay una tarjeta «Estás aquí» con la acción y su enlace; se carga en diferido y no aparece en el modo QA de aprendizaje.
  - En Beca aparece la misma tarjeta junto a la línea temporal completa.
  - Se elimina la tarjeta fija «Trabajar con la guía 0914»: siempre mandaba a documentos.

### Radar
- Nuevo desplegable «Estado de cada fuente»: cada fuente oficial muestra si responde, no responde o ha cambiado, con la fecha real de la comprobación.
- La lista de fuentes explica la diferencia entre oficial, histórico y práctica.

### Perfil editable (`src/domain/models/applicant-profile.ts`)
- **Campos:** carrera, vía (universidad o embajada), estado de la solicitud, fecha de nacimiento y nivel declarado de coreano e inglés.
  - Se guardan en `learnv-applicant-profile-v1`, con validación campo a campo, y entran en la copia del dispositivo.
  - «Medicina» deja de estar fijo: Perfil muestra la carrera elegida o «Sin definir».
- **Límite de edad:** según la guía 2027, hay que tener menos de 25 años el 1 de marzo del año de ingreso.
  - Se calcula para el ciclo objetivo e indica el último ciclo dentro del límite.
  - La fecha de nacimiento no sale del dispositivo.
- **Vía embajada:** al elegirla aparece un aviso. En 2026 España no estaba en la lista de países de esa vía.
- **Nivel declarado frente a nivel medido** (`measured-level.ts`):
  - El nivel medido sale de la etapa más avanzada superada o desbloqueada por el test de nivel en cada habilidad, con la media de las seis habilidades.
  - Sustituye a la «media de mejores notas», que premiaba repetir etapas fáciles.
  - Es orientativo y lo dice.

### Documentos
- **Documentos nuevos:** pasaporte vigente (visado y viaje) y méritos y premios (si la guía los admite). La carta de recomendación y el compromiso médico ya estaban.
- **Calendario para el ciclo objetivo:**
  - Fecha de entrega estimada y, para cada documento pendiente, «Empieza antes del…» según su plazo de preparación. Por ejemplo: idioma 240 días, pasaporte 90, documentos con apostilla 45–60, recomendación 42.
  - **«Añadir al tablero»** crea una tarea del área GKS con esa fecha (`gks-doc-<documento>-<año>`). No se duplica y respeta el límite del tablero.
  - El calendario solo aparece hasta la fase de solicitud.

### Estructura
- `useLocalToday` pasa a ser compartido (`application/controllers/useLocalToday.ts`).
- Los textos de la fase están en `gks-profile-copy.ts` (ES/EN/KO) y se cargan en diferido. Los componentes nuevos usan la hoja Tailwind diferida.

## Verificación
- **Vitest:** 89 archivos / 851 pruebas.
  - Ciclo: fase por fecha, ciclo objetivo, acción y fechas de inicio.
  - Perfil: validación, edad en la fecha de corte y último ciclo elegible.
  - Nivel medido.
  - Plan de documentos con 11 elementos.
- **Playwright:** 90/90. Los tres flujos nuevos usan una fecha fija (13-11-2026):
  - Beca: GKS-U 2028 en preparación; GKS-U 2027 en primera ronda tras marcar «Ya presenté la solicitud».
  - Perfil: carrera guardada tras recargar y aviso de límite de edad.
  - Documentos: el pasaporte pasa al tablero con fecha y área GKS.
- `tsc -b`, lint (0 avisos), arquitectura, build, CSP y presupuestos pasan:
  - JS de arranque: 378 940 B;
  - CSS de arranque: 377 826 B.
- Capturas a 390 px de Beca (oscuro), Perfil (claro), Documentos (oscuro) e Inicio (claro).

## Pendiente
- Confirmar con la guía de cada nuevo ciclo las fechas por fase y el límite de edad (`gks-cycle-data.ts`, `AGE_LIMIT`).
- El radar sigue con datos del 21-9-2026: falta que el cron de actualización haga commit (pendiente de la Fase 1).
- Integración completa con el tablero (sugerencias automáticas y vista «Hoy»): Fase 5.
