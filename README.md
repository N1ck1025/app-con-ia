# Sistema de Reservas — Frontend (Demo)

Abrir `index.html` en el navegador para ver la demo. Incluye:

- Autenticación simple con `localStorage`.
- Usuarios y reservas precargadas (botón "Cargar demo").
- Vistas básicas por rol: `admin`, `operador`, `cliente`.

Instrucciones rápidas:

1. Abrir `index.html` en el navegador.
2. Pulsar "Cargar demo" para precargar usuarios/reservas.
3. Iniciar sesión con:
   - admin@demo / admin123
   - operador@demo / operador123
   - cliente@demo / cliente123

Pruebas básicas (manual):

- Cargar demo y abrir panel como `admin` para ver estadísticas y gestionar reservas.
- Entrar como `operador` para consultar la agenda diaria y confirmar/reprogramar.
- Entrar como `cliente` para crear y cancelar reservas.

Notas:

- Esto es un prototipo frontend; la persistencia es exclusivamente en localStorage.
- Para restablecer datos: borrar las claves `sr_users`, `sr_reservations` y `sr_current` del `localStorage` del navegador.
