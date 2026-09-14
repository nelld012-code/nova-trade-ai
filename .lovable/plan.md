# Completar la fase DEMO y administrativa

## Objetivo
Dejar NOVA AI, los ciclos DEMO, fondos e interfaces administrativas funcionando de extremo a extremo, sin habilitar LIVE ni mostrar datos financieros inventados.

## Cambios
- Corregir NOVA AI para usar `LOVABLE_API_KEY` con el modelo obligatorio y streaming del Responses API, conservar OpenAI solo como fallback configurado, traducir errores a mensajes seguros y probar la función desplegada.
- Unificar la actualización posterior a cada ciclo DEMO para que panel principal, portafolio, operaciones y gráfico vuelvan a consultar los datos reales automáticamente.
- Fortalecer el histórico 7D/30D/90D/1Y, incluyendo actualización tras cada ciclo, estados de carga/error/vacío y formato móvil.
- Separar los formularios de depósito y retiro, validar importes y destino, mostrar estados seguros y actualizar el historial automáticamente.
- Añadir funciones protegidas para todas las lecturas administrativas entre usuarios y retirar los permisos directos de edición financiera que ya no sean necesarios.
- Ajustar chat, panel DEMO, fondos y administración en pantallas móviles.
- Ejecutar revisión de seguridad, comprobación de tipos, compilación y pruebas autenticadas disponibles.

## Detalles técnicos
- Mantener TanStack, React y las versiones actuales.
- Mantener RLS y validación de rol en servidor; ningún control visual será considerado una barrera de seguridad.
- Mantener DEMO y LIVE separados; LIVE seguirá bloqueado.
- No insertar snapshots, operaciones, balances o P&L de muestra.
