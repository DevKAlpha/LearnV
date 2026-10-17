# Ilustraciones del recorrido

Colección original de SVG estáticos para acompañar las actividades sin competir con sus controles. No usa servicios externos ni dependencias de ilustración en tiempo de ejecución.

## Colección

Los archivos están en `public/illustrations/learning-path/`.

| Inglés | Coreano |
| --- | --- |
| `en-campus.svg`: academia y torre de reloj | `ko-hanok.svg`: arquitectura hanok |
| `en-reading.svg`: libro, globo y planta | `ko-hangul.svg`: caracteres y caligrafía |
| `en-city.svg`: autobús y barrio | `ko-seoul.svg`: torre, montañas y ciudad |
| `en-tea.svg`: té y libros | `ko-fan.svg`: abanico tradicional |
| `en-letters.svg`: buzón y correspondencia | `ko-tea.svg`: cerámica y té |
| `en-coast.svg`: faro y costa | `ko-market.svg`: mercado y comida |

Son referencias visuales, no una representación exhaustiva de las culturas anglófonas o coreana.

## Ampliar sin saturar

1. Crear el nuevo SVG con `viewBox="0 0 200 160"`. Mantener trazo oscuro, formas de color, fondo orgánico claro y sombra elíptica sencilla. Evitar filtros, fuentes, mapas de bits, scripts y recursos externos.
2. Añadir el nombre al catálogo de `PathCultureAccent.tsx`. La selección rota según la destreza y el índice real, de modo que expandir el camino no cambia las escenas ya visibles.
3. Ejecutar `pnpm run art:optimize`. [SVGO](https://svgo.dev/docs/introduction/) es una dependencia de desarrollo: optimiza los SVG, no genera las ilustraciones y no se importa en la aplicación.
4. Revisar el resultado en ambos temas a tamaño real, especialmente a los 72 px usados en móvil. No aumentar la frecuencia por añadir dibujos nuevos: se conserva un hito cada cuatro actividades y uno en la ventana compacta.
5. Actualizar las pruebas de la colección si cambia el número de diseños. Presupuesto actual: menos de 3 KiB por archivo y 25 KiB para el conjunto; los 12 diseños actuales suman 16.079 bytes.

Los elementos `img` son decorativos (`alt=""`, `aria-hidden`), tienen dimensiones explícitas, `loading="lazy"`, `decoding="async"` y no interceptan pulsaciones. Se resuelven desde `BASE_URL`, tanto en producción como en `/qa/`.
