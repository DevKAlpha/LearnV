# LearnV — validación previa a dispositivo real

Fecha: 23 de agosto de 2026  
Versión auditada: `739805c`  
Entorno publicado: `https://devkalpha.github.io/LearnV/`

## Resultado ejecutivo

- Estado: apto para iniciar pruebas en un dispositivo real.
- Pruebas automatizadas: 26/26 correctas en 6 archivos.
- TypeScript y compilación de producción: correctos.
- Dependencias de producción: sin vulnerabilidades conocidas (`pnpm audit --prod`).
- GitHub Pages: despliegue correcto y rutas directas recuperables mediante `404.html` y `BrowserRouter`.
- Navegador móvil: comprobado a 320 × 700, 390 × 844 y 430 × 932 px.
- Idiomas: español, inglés y coreano sin desbordamiento horizontal en Inicio, Estudiar, Documentos y Perfil.
- Temas: claro y oscuro funcionales; el botón principal del simulador alcanza contraste 6.85:1 en claro.
- Consola del navegador durante la regresión: sin errores.

## Matriz de historias

| # | Historia | Evidencia verificada | Estado |
|---|---|---|---|
| 1 | Interfaz móvil intuitiva | Menú inferior fijo, navegación directa, retorno superior y 3 anchos móviles sin desbordamiento | Correcta |
| 2 | Datos reales GKS | GKS-U 2026 oficial como referencia histórica; NIIED, Study in Korea y Embajada en España enlazados | Correcta |
| 3 | Material en inglés y coreano | Bibliotecas separadas, filtros de idioma/tipo y fuentes institucionales | Correcta |
| 4 | Pruebas en ambos idiomas | 30 etapas por idioma: 10 escritura, 10 escucha y 10 pronunciación | Correcta |
| 5 | Retroalimentación completa | Cada pregunta tiene respuesta, explicación y mejora; el cierre genera nota orientativa no oficial | Correcta |
| 6 | Tema claro/oscuro | Persistencia, paletas específicas y contraste del simulador comprobados | Correcta |
| 7 | Speaking y Writing | Rutas de escritura y pronunciación presentes en inglés y coreano | Correcta |
| 8 | Apartado de entrevistas | Guía, estructura de respuesta, banco de 12 preguntas, práctica y video externo | Correcta |
| 9 | Videos | Iframes `youtube-nocookie`, carga diferida, título accesible y enlace alternativo | Correcta; reproducción física pendiente |
| 10 | Apartados independientes | `/study/english` y `/study/korean`, con cambio automático al idioma aprendido | Correcta |
| 11 | Animaciones | Transiciones de ruta, tarjetas y cargador; compatibilidad con reducción de movimiento | Correcta |
| 12 | Beca actualizada a diario | GitHub Actions ejecuta el radar todos los días a las 06:17 UTC y en cada publicación | Correcta |
| 13 | Paleta de tulipanes | Morado, rosa, rojo, amarillo y verde adaptados a claro/oscuro | Correcta |
| 14 | Interactividad | Tarjetas con destinos o acciones, estados de presión/foco y controles explicables | Correcta |
| 15 | Favicon dinámico | SVG cambia por sección, idioma, tema y progreso | Correcta |
| 16 | Calidad de iconos/texto | Iconos vectoriales/CSS y fuentes variables; no dependen de bitmaps pequeños | Correcta |
| 17 | Adaptabilidad por idioma | ES/EN/KO comprobados a 320 y 430 px sin elementos fuera del viewport | Correcta |
| 18 | Logo y detalles | Tulipán morado renovado en marca, perfil, favicon y elementos decorativos | Correcta |
| 19 | Simulador escrito | Flujo, autosave, revisión, referencia oficial, contraste y reinicio desde menú flotante | Correcta |
| 20 | Explicación de funciones | Guía modal, textos introductorios, etiquetas de fuentes y límites no oficiales | Correcta |
| 21 | Fuente | Manrope variable + Noto Sans KR variable aplicadas como sistema único | Correcta |

## Contenido y fuentes

- GKS: Study in Korea, NIIED y Embajada de Corea en España.
- TOPIK: portal TOPIK, tutoriales oficiales y PDF de prueba pública.
- Coreano: Nuri–King Sejong Institute y contenidos audiovisuales identificados.
- Inglés: IELTS y British Council, con niveles B1/B2 hacia C1.
- Videos: 21 identificadores únicos revisados; los reemplazos recientes apuntan a contenidos disponibles.
- Entrevistas: el video se presenta expresamente como experiencia personal, no como regla oficial.
- La aplicación conserva la distinción entre referencia GKS-U 2026 y convocatoria GKS-U 2027 aún no publicada.

El radar automatizado obtuvo respuesta de 2 de 3 fuentes en el último snapshot. La página oficial de la Embajada está activa, pero puede bloquear o demorar solicitudes automatizadas; LearnV muestra esa indisponibilidad en vez de convertirla en una confirmación falsa.

## Flujos ejecutados en navegador

1. Apertura directa de Inicio, Beca, Estudiar, Inglés, Coreano, Entrevistas, Simulador, ambas rutas de pruebas, Documentos y Perfil.
2. Ruta desconocida redirigida a Inicio sin mostrar el 404 bruto de GitHub Pages.
3. Cambio ES → EN → KO mediante controles visibles.
4. Cambio de tema y comprobación de estilos calculados.
5. Scroll al final de Beca y cambio a Estudiar: nueva vista en `scrollY = 0`.
6. Menú inferior: posición `fixed` y sin desbordamiento a 320 px.
7. Simulador: inicio, solicitud de reinicio, confirmación y retorno al estado inicial.
8. Documentos: marcado, actualización de porcentaje y persistencia; estado de auditoría restaurado al finalizar.
9. Guía de uso: apertura y cierre del diálogo.
10. Favicon: cambio confirmado entre contexto general y coreano.
11. Entrevistas y escucha: iframe seguro, diferido y con título accesible.

## Correcciones surgidas de esta auditoría

- Se definió el acento del simulador escrito y se fijó el contraste del botón principal en tema claro.
- Se añadió reinicio con doble confirmación al menú flotante del simulador.
- Se actualizaron enlaces de IELTS y de la Embajada en España.
- Se reemplazaron tres videos antiguos o no verificables.
- Se normalizó el uso de Manrope y Noto Sans KR.
- Se creó el fallback SPA para GitHub Pages.
- Se migró de `HashRouter` a `BrowserRouter` con `basename`, permitiendo recargas y enlaces directos reales.

## Límites que deben probarse en el teléfono

- Permiso de micrófono, captura de voz y comportamiento de la alternativa cuando se deniega.
- Reproducción real de YouTube bajo la red, cuenta y restricciones regionales del dispositivo.
- Audio, volumen, auriculares, teclado virtual, safe areas y gestos del navegador móvil.
- Rendimiento térmico y de memoria durante sesiones largas.
- Instalación como acceso directo/PWA no forma parte del alcance actual.

No debe interpretarse la puntuación de LearnV como resultado oficial de GKS, TOPIK, IELTS o TOEFL.
