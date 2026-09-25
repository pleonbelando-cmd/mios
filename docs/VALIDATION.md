# Validación de la rama Stocklana

Fecha: 24/09/2026. Entorno local: Windows, Node 24.19.0.

## Comprobaciones ejecutadas

- 52 tests de Vitest correctos: firmas Ed25519, dominio, nonce firmado, caducidad, cuerpos inválidos, elegibilidad server-side, límites de tiers, agregación de cuentas, vigencia de precios, cambio de wallet, refresco, consulta pública y rechazo de firma.
- TypeScript sin errores y ESLint sin errores.
- Build de Next.js para producción correcto.
- Prueba HTTP completa sobre servidor local: desafío 200 → firma Ed25519 de una wallet temporal sin fondos → emisión 200 con descuento 0 % → verificación HTML 200. RPC de Solana y cotizaciones de Jupiter reales, sin movimientos de fondos. Las claves de prueba se generan en memoria.
- Inspección de portada y marketplace en navegador, escritorio y viewport móvil de 390 px. Sin desbordamiento horizontal; emisión desactivada sin wallet; carrito responde.

## Revisión final del 24/09/2026

Código revisado: `7598b44184321bca2138a1cfe1650cfbb5b885cd`. `main` sigue en `c92127b91f9915582ee020ad622232b9cf5c8ef1`; la PR no tiene conflictos.

- Las 52 pruebas, TypeScript y ESLint se han ejecutado de nuevo y pasan. Los controles de GitHub, incluido el build, pasan sobre este mismo commit.
- Seguridad y corrección: sin hallazgos que bloqueen integrar esta demo; firma vinculada a dominio, wallet y activos, cálculo en servidor y rechazo de cotizaciones no utilizables.
- Rendimiento: sin nuevos bloqueos observados; consultas agrupadas y tiempos de espera limitados. La disponibilidad sigue dependiendo del RPC y de las fuentes de precios.
- Mantenibilidad: responsabilidades separadas y cobertura de los casos de autenticación, valoración y cambio de wallet. No se propone ampliar el alcance antes de grabar.
- Pepe comunica, a través de Adrián, que ha completado conectar la wallet, ver posiciones, firmar y verificar el cupón. Es aceptación comunicada por el propietario; Codex no ha realizado esa firma ni dispone de su saldo, dirección o URL de prueba.

## Pendiente de entrega

- Integración de la PR y comprobación del commit publicado en producción, incluida una nueva prueba con la wallet del equipo en esa URL.
- Grabación del vídeo y confirmación de envío en Stocklana.

Los mocks de las pruebas unitarias no se usan en la aplicación.

## Vista previa remota

Vercel ha creado la vista previa de la PR: https://mios-git-codex-stocklana-demo-pepe-leon-s-projects.vercel.app
En la primera revisión Vercel exigía acceso del equipo propietario. En la revisión final la aplicación ya es accesible desde el navegador disponible y mediante peticiones HTTP sin credenciales de prueba adicionales; no se han modificado permisos ni protecciones durante esta revisión.

- Portada en escritorio y marketplace en viewport móvil de 390 px comprobados en la URL remota. El resumen, los avisos y el botón flotante son legibles; emitir sin wallet sigue desactivado. Una dirección incorrecta muestra un error comprensible.
- Prueba HTTP completa contra la preview, con wallet temporal sin fondos y clave generada en memoria: desafío 200 → firma Ed25519 → emisión 200 con 0 % → verificación 200 mostrando firma válida. Se utilizan el RPC y Jupiter reales del despliegue, sin transferencias ni compras.
- Esta comprobación remota valida el funcionamiento observado, no constituye una inspección de los valores secretos configurados en Vercel.
