PRAGMA foreign_keys = ON;

DELETE FROM person;

INSERT INTO person (id, name, full_name, system_admin, email, password)
  VALUES (1, 'admin',   'System Admin User', 1, 'admin@allnightmusic.com', 'admin');
INSERT INTO person (id, name, full_name, system_admin, email, password)
  VALUES (2, 'aposer',  'Alan Poser',        0, 'aposer@wannabe.net',      'fakeit');
INSERT INTO person (id, name, full_name, system_admin, email, password)
  VALUES (3, 'ddrums',  'Danny Drums',       0, 'ddrums@musichero.foo',    'backbeat');
INSERT INTO person (id, name, full_name, system_admin, email, password)
  VALUES (4, 'jguitar', 'Johnny Guitar',     0, 'jguitar@musichero.foo',   'tonefreak');
