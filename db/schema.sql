-- =====================================================================
--  agenda_estudiantil · Esquema de la base de datos (MariaDB / MySQL)
--  Se puede correr cuantas veces se quiera: borra y vuelve a crear todo.
-- =====================================================================
CREATE DATABASE IF NOT EXISTS agenda_estudiantil
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agenda_estudiantil;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS mensajes, preferencias, documentos, grupo_usuarios,
                     grupos, eventos, tareas, materias, usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- Tabla 1. Usuarios
CREATE TABLE usuarios (
  id_usuario     INT          NOT NULL AUTO_INCREMENT,
  nombre         VARCHAR(50)  NOT NULL,
  apellido       VARCHAR(50)  NOT NULL,
  correo         VARCHAR(100) NOT NULL,
  contrasena     VARCHAR(255) NOT NULL,          -- hash bcrypt, nunca texto plano
  fecha_registro DATE         NOT NULL,
  PRIMARY KEY (id_usuario),
  UNIQUE KEY uq_usuarios_correo (correo)
) ENGINE=InnoDB;

-- Tabla 2. Materias
CREATE TABLE materias (
  id_materia  INT          NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(100) NOT NULL,
  descripcion TEXT         NULL,
  id_usuario  INT          NOT NULL,
  PRIMARY KEY (id_materia),
  CONSTRAINT fk_materias_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla 3. Tareas
CREATE TABLE tareas (
  id_tarea      INT          NOT NULL AUTO_INCREMENT,
  titulo        VARCHAR(150) NOT NULL,
  descripcion   TEXT         NULL,
  fecha_entrega DATE         NULL,
  estado        VARCHAR(20)  NOT NULL DEFAULT 'Pendiente',
  id_usuario    INT          NOT NULL,
  id_materia    INT          NOT NULL,
  PRIMARY KEY (id_tarea),
  CONSTRAINT ck_tareas_estado CHECK (estado IN ('Pendiente','En progreso','Completada')),
  CONSTRAINT fk_tareas_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_tareas_materia FOREIGN KEY (id_materia)
    REFERENCES materias (id_materia) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla 4. Eventos
CREATE TABLE eventos (
  id_evento   INT          NOT NULL AUTO_INCREMENT,
  titulo      VARCHAR(150) NOT NULL,
  descripcion TEXT         NULL,
  fecha       DATE         NOT NULL,
  tipo        VARCHAR(50)  NOT NULL,
  id_usuario  INT          NOT NULL,
  PRIMARY KEY (id_evento),
  CONSTRAINT ck_eventos_tipo CHECK (tipo IN ('Examen','Entrega','Evento','Reunión')),
  CONSTRAINT fk_eventos_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla 5. Grupos
CREATE TABLE grupos (
  id_grupo       INT          NOT NULL AUTO_INCREMENT,
  nombre         VARCHAR(100) NOT NULL,
  descripcion    TEXT         NULL,
  fecha_creacion DATE         NOT NULL,
  PRIMARY KEY (id_grupo)
) ENGINE=InnoDB;

-- Tabla 6. Grupo_usuarios (llave primaria compuesta)
CREATE TABLE grupo_usuarios (
  id_grupo   INT         NOT NULL,
  id_usuario INT         NOT NULL,
  rol        VARCHAR(20) NOT NULL DEFAULT 'miembro',
  PRIMARY KEY (id_grupo, id_usuario),
  CONSTRAINT ck_gu_rol CHECK (rol IN ('admin','miembro')),
  CONSTRAINT fk_gu_grupo FOREIGN KEY (id_grupo)
    REFERENCES grupos (id_grupo) ON DELETE CASCADE,
  CONSTRAINT fk_gu_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla 7. Documentos
CREATE TABLE documentos (
  id_documento INT          NOT NULL AUTO_INCREMENT,
  nombre       VARCHAR(150) NOT NULL,
  url          VARCHAR(255) NOT NULL,
  fecha_subida DATE         NOT NULL,
  id_usuario   INT          NOT NULL,
  id_grupo     INT          NOT NULL,
  PRIMARY KEY (id_documento),
  CONSTRAINT fk_docs_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_docs_grupo FOREIGN KEY (id_grupo)
    REFERENCES grupos (id_grupo) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla 8. Mensajes
CREATE TABLE mensajes (
  id_mensaje         INT      NOT NULL AUTO_INCREMENT,
  contenido          TEXT     NOT NULL,
  fecha_envio        DATETIME NOT NULL,
  id_usuario_emisor  INT      NOT NULL,
  id_usuario_receptor INT     NOT NULL,
  PRIMARY KEY (id_mensaje),
  CONSTRAINT fk_msg_emisor FOREIGN KEY (id_usuario_emisor)
    REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_msg_receptor FOREIGN KEY (id_usuario_receptor)
    REFERENCES usuarios (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla 9. Preferencias (una fila por usuario)
CREATE TABLE preferencias (
  id_preferencia INT         NOT NULL AUTO_INCREMENT,
  color_tema     VARCHAR(50) NULL,
  idioma         VARCHAR(20) NULL,
  notificaciones TINYINT(1)  NOT NULL DEFAULT 1,
  id_usuario     INT         NOT NULL,
  PRIMARY KEY (id_preferencia),
  UNIQUE KEY uq_pref_usuario (id_usuario),
  CONSTRAINT fk_pref_usuario FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB;
