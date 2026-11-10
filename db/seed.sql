-- =====================================================================
--  agenda_estudiantil · Datos de prueba
--  Contraseña de TODOS los usuarios: Demo1234  (guardada como hash bcrypt)
--  Las fechas son relativas a HOY (CURDATE), así el calendario nunca
--  se ve vacío sin importar cuándo se corra el script.
-- =====================================================================
USE agenda_estudiantil;

INSERT INTO usuarios (id_usuario, nombre, apellido, correo, contrasena, fecha_registro) VALUES
 (1, 'Julián',   'Palma Rico',     'julian@demo.com', '$2b$10$XwW0AmXLphJoSVoOAEKoBu7qNn9GD7uYjeyGCV/vtDCLUYL3Oq99u', CURDATE() - INTERVAL 30 DAY),
 (2, 'Dana',     'Díaz Contreras', 'dana@demo.com',   '$2b$10$XwW0AmXLphJoSVoOAEKoBu7qNn9GD7uYjeyGCV/vtDCLUYL3Oq99u', CURDATE() - INTERVAL 30 DAY),
 (3, 'Alexandra','Ortiz Nuño',     'alexa@demo.com',  '$2b$10$XwW0AmXLphJoSVoOAEKoBu7qNn9GD7uYjeyGCV/vtDCLUYL3Oq99u', CURDATE() - INTERVAL 28 DAY),
 (4, 'Leslie',   'Aguilar Galindo','leslie@demo.com', '$2b$10$XwW0AmXLphJoSVoOAEKoBu7qNn9GD7uYjeyGCV/vtDCLUYL3Oq99u', CURDATE() - INTERVAL 28 DAY),
 (5, 'Mariana',  'Torres Vega',    'piloto@demo.com', '$2b$10$XwW0AmXLphJoSVoOAEKoBu7qNn9GD7uYjeyGCV/vtDCLUYL3Oq99u', CURDATE() - INTERVAL 5 DAY);

INSERT INTO materias (id_materia, nombre, descripcion, id_usuario) VALUES
 (1,  'Ingeniería de Software',  'Modelos de proceso y gestión de proyectos', 1),
 (2,  'Bases de Datos',          'Modelo relacional y SQL',                   1),
 (3,  'Redes de Computadoras',   'Topologías, protocolos y configuración',    1),
 (4,  'Cálculo Diferencial',     NULL,                                        1),
 (5,  'Bases de Datos',          'Normalización y consultas',                 2),
 (6,  'Programación Web',        'HTML, CSS, JavaScript y Node',              2),
 (7,  'Ingeniería de Software',  NULL,                                        3),
 (8,  'Estructuras de Datos',    'Pilas, colas, árboles',                     3),
 (9,  'Programación Web',        NULL,                                        4),
 (10, 'Álgebra Lineal',          NULL,                                        5);

INSERT INTO tareas (id_tarea, titulo, descripcion, fecha_entrega, estado, id_usuario, id_materia) VALUES
 (1,  'Entregar Sprint III',               'Informe de consolidación y estado de la solución', CURDATE() + INTERVAL 2 DAY,  'En progreso', 1, 1),
 (2,  'Diagrama entidad-relación',         'Exportar el diagrama ER desde el gestor de BD',     CURDATE() + INTERVAL 4 DAY,  'Pendiente',   1, 2),
 (3,  'Práctica de consultas SQL',         'JOINs y subconsultas',                              CURDATE() - INTERVAL 3 DAY,  'Completada',  1, 2),
 (4,  'Configurar VLANs en Packet Tracer', 'Práctica 4 del laboratorio',                        CURDATE() + INTERVAL 7 DAY,  'Pendiente',   1, 3),
 (5,  'Ejercicios de derivadas',           'Del capítulo 3, ejercicios 1 al 20',                CURDATE() + INTERVAL 1 DAY,  'Pendiente',   1, 4),
 (6,  'Reporte de pruebas de software',    'Hoja de pruebas con los 10 criterios de éxito',     CURDATE() + INTERVAL 10 DAY, 'Pendiente',   1, 1),
 (7,  'Lectura: modelos de proceso',       NULL,                                                CURDATE() - INTERVAL 6 DAY,  'Completada',  1, 1),
 (8,  'Resumen de topologías de red',      NULL,                                                CURDATE() - INTERVAL 1 DAY,  'En progreso', 1, 3),
 (9,  'Normalizar tablas del proyecto',    'Hasta tercera forma normal',                        CURDATE() + INTERVAL 3 DAY,  'En progreso', 2, 5),
 (10, 'Maqueta de login en HTML',          NULL,                                                CURDATE() - INTERVAL 2 DAY,  'Completada',  2, 6),
 (11, 'Endpoints REST de tareas',          'CRUD con Express',                                  CURDATE() + INTERVAL 6 DAY,  'Pendiente',   2, 6),
 (12, 'Pilas y colas en Java',             NULL,                                                CURDATE() + INTERVAL 5 DAY,  'Pendiente',   3, 8),
 (13, 'Historias de usuario',              'Para el módulo de grupos',                          CURDATE() - INTERVAL 4 DAY,  'Completada',  3, 7),
 (14, 'Calendario con FullCalendar',       'Prueba de concepto',                                CURDATE() + INTERVAL 8 DAY,  'En progreso', 3, 7),
 (15, 'Manual de usuario del proyecto',    'Con capturas de pantalla',                          CURDATE() + INTERVAL 9 DAY,  'Pendiente',   4, 9),
 (16, 'Ejercicios de matrices',            NULL,                                                CURDATE() + INTERVAL 4 DAY,  'Pendiente',   5, 10);

INSERT INTO eventos (id_evento, titulo, descripcion, fecha, tipo, id_usuario) VALUES
 (1, 'Examen parcial de Bases de Datos',  'Temas 1 al 4',                    CURDATE() + INTERVAL 5 DAY,  'Examen',  1),
 (2, 'Asesoría con la mentora',           'Reunión por Meet',                CURDATE() + INTERVAL 1 DAY,  'Reunión', 1),
 (3, 'Entrega final del proyecto modular','Plataforma funcionando',          CURDATE() + INTERVAL 12 DAY, 'Entrega', 1),
 (4, 'Presentación del proyecto',         'Demo con BD e interfaz',          CURDATE() + INTERVAL 14 DAY, 'Evento',  1),
 (5, 'Examen de Cálculo',                 NULL,                              CURDATE() + INTERVAL 9 DAY,  'Examen',  1),
 (6, 'Reunión de equipo',                 'Revisión de avances',             CURDATE() - INTERVAL 2 DAY,  'Reunión', 1),
 (7, 'Asesoría con la mentora',           'Reunión por Meet',                CURDATE() + INTERVAL 1 DAY,  'Reunión', 2),
 (8, 'Examen de Estructuras de Datos',    NULL,                              CURDATE() + INTERVAL 11 DAY, 'Examen',  3);

INSERT INTO grupos (id_grupo, nombre, descripcion, fecha_creacion) VALUES
 (1, 'Equipo Proyecto Modular', 'Coordinación del proyecto modular de la plataforma', CURDATE() - INTERVAL 20 DAY),
 (2, 'Estudio Bases de Datos',  'Grupo de estudio para el examen parcial',            CURDATE() - INTERVAL 8 DAY);

INSERT INTO grupo_usuarios (id_grupo, id_usuario, rol) VALUES
 (1, 1, 'admin'), (1, 2, 'miembro'), (1, 3, 'miembro'), (1, 4, 'miembro'),
 (2, 2, 'admin'), (2, 1, 'miembro'), (2, 5, 'miembro');

-- URLs de ejemplo: cámbienlas por enlaces reales de Drive antes de la demo
INSERT INTO documentos (id_documento, nombre, url, fecha_subida, id_usuario, id_grupo) VALUES
 (1, 'Plan de trabajo Sprint I',        'https://drive.google.com/file/d/demo-plan-sprint-1/view',   CURDATE() - INTERVAL 18 DAY, 4, 1),
 (2, 'Diagrama ER v1',                  'https://drive.google.com/file/d/demo-diagrama-er/view',     CURDATE() - INTERVAL 10 DAY, 1, 1),
 (3, 'Informe de avance Sprint II',     'https://drive.google.com/file/d/demo-sprint-2/view',        CURDATE() - INTERVAL 7 DAY,  4, 1),
 (4, 'Guía de normalización',           'https://drive.google.com/file/d/demo-normalizacion/view',   CURDATE() - INTERVAL 6 DAY,  2, 2),
 (5, 'Ejercicios resueltos de SQL',     'https://drive.google.com/file/d/demo-sql-resueltos/view',   CURDATE() - INTERVAL 3 DAY,  1, 2);

INSERT INTO mensajes (contenido, fecha_envio, id_usuario_emisor, id_usuario_receptor) VALUES
 ('Ya terminé el esquema de la BD, ¿puedes revisarlo?', NOW() - INTERVAL 3 DAY, 1, 2),
 ('Listo, lo reviso hoy en la tarde.',                  NOW() - INTERVAL 3 DAY + INTERVAL 1 HOUR, 2, 1),
 ('¿Nos juntamos mañana para el calendario?',           NOW() - INTERVAL 1 DAY, 3, 1);

INSERT INTO preferencias (color_tema, idioma, notificaciones, id_usuario) VALUES
 ('azul',  'es', 1, 1), ('verde', 'es', 1, 2), ('azul', 'es', 0, 3),
 ('azul',  'es', 1, 4), ('azul',  'es', 1, 5);
