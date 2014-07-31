#change Add request table

DROP TABLE IF EXISTS request;
CREATE TABLE request (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description VARCHAR,
  timestamp VARCHAR DEFAULT CURRENT_TIMESTAMP,
  request_type INTEGER NOT NULL,
  status INTEGER,
  band_id INTEGER,
  person_id INTEGER
);
