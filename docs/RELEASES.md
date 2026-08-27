# Lanzamientos de LearnV

LearnV usa dos niveles claramente separados:

- `prerelease`: integra historias terminadas, ejecuta todas las pruebas y genera un artefacto temporal descargable. Nunca publica GitHub Pages.
- `main`: contiene exclusivamente el estado liberado y es la única rama que despliega producción.

## Flujo normal

```text
rama de apartado → Pull Request a prerelease → validación y artefacto
prerelease → Pull Request de versión a main → despliegue de producción
main → etiqueta v<VERSION> → GitHub Release inmutable
```

Las ramas `home`, `scholarship`, `study`, `documents`, `profile` y `platform` se sincronizan con `prerelease` antes de comenzar una historia. Sus Pull Requests siempre apuntan a `prerelease`.

## Validación de pre-lanzamiento

Cada actualización de `prerelease` ejecuta:

1. límites de arquitectura MVC;
2. pruebas automatizadas;
3. comprobación completa de TypeScript;
4. compilación de producción y fallback para GitHub Pages;
5. creación de un artefacto `learnv-prerelease-<commit>` conservado durante 14 días.

El artefacto sirve para pruebas manuales y no constituye una versión pública.

## Apertura de una versión

La versión todavía no se ha asignado. Cuando se autorice la primera, se creará el archivo `VERSION` con:

```text
1.0.0A
```

El formato aceptado es `MAYOR.MENOR.PARCHELETRA`. Se mantiene separado de `package.json` porque `1.0.0A` es una identificación de producto propia de LearnV y no una versión SemVer de npm.

El commit que crea o modifica `VERSION`, todos los commits posteriores de esa candidata y el título del Pull Request deben incluir la versión:

```text
[1.0.0A] chore(release): abrir primera candidata
[1.0.0A] fix(study): corregir hallazgo de validación
[1.0.0A] release: LearnV 1.0.0A
```

Los commits anteriores a la apertura formal del ciclo no necesitan esa marca.

## Paso a producción

1. Confirmar que el artefacto de `prerelease` pasó la revisión manual móvil.
2. Abrir un Pull Request desde `prerelease` hacia `main`.
3. Usar un título que contenga `[VERSION]`.
4. Esperar la compuerta `Gate LearnV production release`.
5. Integrar únicamente si arquitectura, pruebas, build, origen de rama, versión y commits pasan.
6. Verificar el despliegue de GitHub Pages desde `main`.
7. Crear sobre ese commit la etiqueta `v<VERSION>`; por ejemplo `v1.0.0A`.

La etiqueta ejecuta nuevamente toda la validación, comprueba que el commit pertenece a `main`, empaqueta `dist` y crea el GitHub Release con notas automáticas. Una etiqueta o release publicado no debe moverse ni reemplazarse.

## Protecciones recomendadas en GitHub

- `prerelease`: exigir Pull Request y el estado `Validate LearnV / validate`.
- `main`: exigir Pull Request y los estados de `Gate LearnV production release`; no permitir pushes directos.
- Desactivar force-push y eliminación en ambas ramas.

Estas reglas complementan los workflows: la automatización detecta un flujo incorrecto y las protecciones impiden integrarlo.
