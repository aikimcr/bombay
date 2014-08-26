#change Add Session Table

DROP TABLE IF EXISTS session;
CREATE TABLE session (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_token VARCHAR,
  session_start VARCHAR NOT NULL,
  person_id INTEGER NOT NULL,
  UNIQUE (session_token),
  FOREIGN KEY (person_id) REFERENCES person(id) ON DELETE CASCADE
);
