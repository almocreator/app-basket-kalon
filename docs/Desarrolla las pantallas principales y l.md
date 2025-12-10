Desarrolla las pantallas principales y la lógica de servidor (Server Actions).

Dashboard (/): Muestra una lista de partidos futuros ordenados por fecha. Cada tarjeta de partido debe mostrar: Título, Fecha, Lugar, y un resumen de asistencia (X Asistirán, Y No Asistirán).

Acción de Votar: Crea una Server Action voteInMatch(matchId, attendance) que verifique si el usuario está autenticado, busque si ya votó, y cree o actualice su voto en la base de datos.

Interfaz de Voto: En la tarjeta del partido, añade dos botones: 'Asistiré' (Verde) y 'No Asistiré' (Rojo). El botón activo debe resaltarse según el voto actual del usuario.

Crear Partido: Una página /matches/new con un formulario para crear partidos, protegida para que solo usuarios logueados accedan