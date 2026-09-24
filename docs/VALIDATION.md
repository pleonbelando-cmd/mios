# Validación de la rama Stocklana

Fecha: 24/09/2026. Entorno local: Windows, Node 24.19.0.

## Comprobaciones ejecutadas

- 52 tests de Vitest correctos: firmas Ed25519, dominio, nonce firmado, caducidad, cuerpos inválidos, elegibilidad server-side, límites de tiers, agregación de cuentas, vigencia de precios, cambio de wallet, refresco, consulta pública y rechazo de firma.
- TypeScript sin errores y ESLint sin errores.
- Build de Next.js para producción correcto.
- Prueba HTTP completa sobre servidor local: desafío 200 → firma Ed25519 de una wallet temporal sin fondos → emisión 200 con descuento 0 % → verificación HTML 200. RPC de Solana y cotizaciones de Jupiter reales, sin movimientos de fondos. Las claves de prueba se generan en memoria.
- Inspección de portada y marketplace en navegador, escritorio y viewport móvil de 390 px. Sin desbordamiento horizontal; emisión desactivada sin wallet; carrito responde.

## Pendiente de aceptación

- Firma manual con Phantom y la wallet con xStocks del equipo.
- Revisión de Pepe, integración y comprobación del commit publicado en producción.
- Grabación del vídeo y confirmación de envío en Stocklana.

La prueba con wallet temporal no acredita el recorrido manual del equipo. Los mocks de las pruebas unitarias no se usan en la aplicación.

