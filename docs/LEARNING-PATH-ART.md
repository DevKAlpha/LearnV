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

## Brillo y nitidez

El brillo es estático y se aplica mediante dos `drop-shadow` CSS: un borde luminoso fino y un halo exterior. No se desenfoca la ilustración original, no se anima el filtro ni se crea una capa permanente con `will-change`. El tema oscuro usa violeta, el claro un ámbar suave y C1 un halo dorado; en móvil el radio baja a 6 px. Con colores forzados o pantallas de actualización lenta se omite el efecto.

Los originales siguen siendo vectores, no PNG ampliados ni versiones reducidas. Su `viewBox` conserva el detalle a distintos tamaños y densidades de pantalla; `image-rendering: auto` evita forzar un acabado pixelado. Aumentar una supuesta resolución en píxeles no añade detalle a un SVG. Para añadir detalle real hay que modificar sus formas, no generar copias 2x o 4x. El brillo no cambia los tamaños ni la posición de las decoraciones y no añade bytes a los archivos SVG.
