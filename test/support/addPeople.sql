PRAGMA foreign_keys = ON;

DELETE FROM person;

INSERT INTO person (id, name, full_name, system_admin, email, password, session_expires)
  VALUES (1, 'admin',   'System Admin User', 1, 'admin@allnightmusic.com', 'admin', 30);
INSERT INTO person (id, name, full_name, system_admin, email, password, session_expires)
  VALUES (2, 'aposer',  'Alan Poser',        0, 'aposer@wannabe.net',      'fakeit', 30);
INSERT INTO person (id, name, full_name, system_admin, email, password, session_expires)
  VALUES (3, 'ddrums',  'Danny Drums',       0, 'ddrums@musichero.foo',    'backbeat', 30);
INSERT INTO person (id, name, full_name, system_admin, email, password, session_expires)
  VALUES (4, 'jguitar', 'Johnny Guitar',     0, 'jguitar@musichero.foo',   'tonefreak', 30);
INSERT INTO person (id, name, full_name, system_admin, email, password, session_expires)
  VALUES (5, 'kkeys',   'Kevin Keys',        0, 'kkeys@musichero.foo',     'concerto', 30);