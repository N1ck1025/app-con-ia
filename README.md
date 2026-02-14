# Sistema de Reservas — Frontend (Demo)

Los 10 prompts más importantes (resumidos):
1. Especificación del sistema: roles (admin/operador/cliente), tecnologías y requisitos (CRUD, estados, localStorage).
2. "si": confirmar que siguiera con el desarrollo sin más preguntas.
3. Generar esqueleto (HTML/CSS/JS) y autenticación simple en `localStorage`.
4. "solo codigo": entregar implementación mínima funcional.
5. Corregir: el modal de login no cerraba y el selector de rol persistente debía ocultarse; usar `cliente` por defecto.
6. Hacer que el panel de operador funcione (confirmar/reprogramar) y cambiar seed demo.
7. "hay un error en el js": revisar y reparar errores de sintaxis y lógica.
8. El operador no veía reservas actualizadas — modificar vista para mostrar solo "pendiente" y añadir refrescar.
9. Cambiar colores: `main` en blanco y todo lo demás oscuro para contraste.
10. Comentar el código y pedir todos los prompts (se pidió listado de prompts).

Resumen muy breve del funcionamiento:
- Tecnologías: HTML5 + Tailwind (CDN) + JavaScript vanilla. Persistencia: `localStorage`.
- Roles: `admin` (ver y gestionar todas las reservas, estadísticas), `operador` (atender reservas pendientes del día, confirmar o reprogramar), `cliente` (registrarse, crear y cancelar reservas propias).
- Autenticación simple: usuarios almacenados en `sr_users`; sesión en `sr_current`.
- Reservas: CRUD completo en `sr_reservations`. Estados: `pendiente`, `confirmada`, `cancelada`.
- Rol por defecto para nuevos registros: guardado en `sr_default_role` (banner para elegirlo).

Credenciales demo:
- admin@demo / admin123
- operador@demo / operador123

Cómo probar rápido:
1. Abrir `index.html` en el navegador.
2. Usar el banner "Pide tu reserva" o `Iniciar sesión`.
3. Como cliente: crear reserva (fecha >= hoy).
4. Como operador: abrir panel, ver reservas pendientes hoy, confirmar o reprogramar.
5. Como admin: ver todas las reservas, cambiar estados y eliminar.

Notas técnicas (claves de `localStorage`): `sr_users`, `sr_reservations`, `sr_current`, `sr_default_role`.

Reflexión breve sobre crear la app con IA:
Usar IA aceleró la generación del esqueleto, lógica y correcciones rápidas, pero la supervisión humana fue esencial para ajustar UX, seguridad básica (no usar contraseñas reales en localStorage) y decisiones de diseño. La IA facilita prototipos funcionales y repetibles; para un producto real se necesitaría transformar estas ideas en un backend seguro, validación robusta y pruebas de usabilidad.

---

Versión: demo frontend — sin servidor (localStorage).
