# Entrega Stocklana — control de cierre

Objetivo interno: viernes 25 de septiembre de 2026, 18:00 Europe/Madrid.
Cierre oficial comprobado: 25 de septiembre, 16:00 ET / 22:00 Madrid.
Fuente: https://hackathons.solana.com/hackathons/stocklana

## Revisión técnica y vista previa

- [ ] PR codex/stocklana-demo revisada con Pepe.
- [ ] Node 24, tests, tipos, lint y build correctos en el commit final.
- [ ] Preview con COUPON_SECRET de al menos 32 bytes y RPC funcional para cuentas Token-2022 y getBlockTime.
- [ ] Portada, marketplace, ejemplo y verificación revisados en móvil y escritorio.
- [ ] Propietario conecta su wallet con xStocks y firma personalmente el mensaje.
- [ ] Resultado real mostrado, incluido 0 % si no alcanza el umbral.
- [ ] Consulta pública no permite emitir; la wallet acreditada coincide con la firmante.
- [ ] Cupón abre /verify y muestra demostración, wallet, descuentos y caducidad.
- [ ] El mismo recorrido sigue funcionando tras actualizar o cambiar de wallet.

No copiar secretos en issues, PR, vídeos o chat. Configurar las variables en Preview sin cambiar Production.
SOLANA_RPC_URL puede ser exclusivo del servidor; NEXT_PUBLIC_SOLANA_RPC_URL es visible al navegador.
El RPC público es un fallback y puede limitar solicitudes. Los precios de antigüedad desconocida se bloquean.

## Integración y publicación (después de la revisión)

1. Revisar que main no haya cambiado y resolver conflictos sin pisar el trabajo de Pepe.
2. Integrar la PR aprobada; verificar que Vercel publica el commit esperado con Node 24.
3. Comprobar la URL pública, precios y flujo de cupón. Los cupones antiguos v1 se rechazan intencionadamente; emitir otros con el nuevo flujo.
4. Si aparece una regresión, volver al despliegue anterior solo como demo de consulta, sin presentar sus cupones como prueba segura de elegibilidad.

## Candidatura y vídeo

- [ ] Confirmar miembros y cuenta del equipo con Pepe.
- [ ] Revisar docs/SUBMISSION.md y sustituir todos los pendientes.
- [ ] Grabar el vídeo según docs/VIDEO.md y añadir su enlace.
- [ ] Usar una demo accesible al jurado, sin protección de preview que requiera iniciar sesión.
- [ ] Revisar los términos del portal y enviar desde la cuenta del equipo.
- [ ] Guardar enlace o comprobante de confirmación. No marcar “enviado” solo por rellenar el formulario.

## Después del concurso

Validar un comercio dispuesto a financiar una campaña concreta. Antes de beneficios comerciales: acordar presupuesto, condiciones, límites de uso y permanencia si procede; añadir registro de canje atómico, controles de abuso y métricas. Compras/ventas integradas siguen fuera del alcance de esta entrega.
