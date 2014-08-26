DROP TABLE IF EXISTS setlist_song;
DROP TABLE IF EXISTS setlist_set;
DROP TABLE IF EXISTS setlist;

DROP TABLE IF EXISTS song_rating;

DROP TRIGGER IF EXISTS new_band_song;
DROP TRIGGER IF EXISTS del_band_song;
DROP TABLE IF EXISTS band_song;

DROP TABLE IF EXISTS song;

DROP TRIGGER IF EXISTS new_band_member;
DROP TRIGGER IF EXISTS del_band_member;
DROP TABLE IF EXISTS band_member;

DROP TABLE IF EXISTS artist;
DROP TABLE IF EXISTS person;
DROP TABLE IF EXISTS band;

DROP TABLE IF EXISTS schema_change;

DROP TRIGGER IF EXISTS del_song_rating_snapshot;
DROP TABLE IF EXISTS song_rating_snapshot;
DROP TABLE IF EXISTS snapshot;

DROP TABLE IF EXISTS request;

CREATE TABLE band (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR,
  UNIQUE (name)
);

CREATE TABLE person (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR NOT NULL,
  full_name VARCHAR,
  password VARCHAR NOT NULL DEFAULT 'password',
  email VARCHAR,
  system_admin INTEGER NOT NULL DEFAULT 0,
  UNIQUE (name)
);

CREATE TABLE band_member (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  band_id INTEGER NOT NULL,
  person_id INTEGER NOT NULL,
  band_admin INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (band_id) REFERENCES band(id),
  FOREIGN KEY (person_id) REFERENCES person(id),
  UNIQUE (band_id, person_id)
);

CREATE TABLE artist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR NOT NULL,
  UNIQUE (name)
);

CREATE TABLE song (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR NOT NULL,
  artist_id INTEGER NOT NULL,
  key_signature VARCHAR DEFAULT '',
  FOREIGN KEY (artist_id) REFERENCES artist(id),
  UNIQUE (name, artist_id)
);

CREATE TABLE band_song (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  band_id INTEGER NOT NULL,
  song_id INTEGER NOT NULL,
  song_status INTEGER NOT NULL DEFAULT 0,
  key_signature VARCHAR DEFAULT '',
  primary_vocal_id INTEGER,
  secondary_vocal_id INTEGER,
  FOREIGN KEY (band_id) REFERENCES band(id),
  FOREIGN KEY (song_id) REFERENCES song(id),
  FOREIGN KEY (primary_vocal_id) REFERENCES band_member(id),
  FOREIGN KEY (secondary_vocal_id) REFERENCES band_member(id),
  UNIQUE (band_id, song_id)
);

CREATE TABLE song_rating (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  band_member_id INTEGER NOT NULL,
  band_song_id INTEGER NOT NULL,
  rating INTEGER NOT NULL DEFAULT 3,
  is_new INTEGER DEFAULT 1,
  FOREIGN KEY (band_member_id) REFERENCES band_member(id) ON DELETE CASCADE,
  FOREIGN KEY (band_song_id) REFERENCES band_song(id) ON DELETE CASCADE,
  UNIQUE (band_member_id, band_song_id)
);

CREATE TRIGGER new_band_member AFTER INSERT ON band_member FOR EACH ROW
BEGIN
  INSERT INTO song_rating (band_member_id, band_song_id, rating)
    SELECT NEW.id, band_song.id, 3
      FROM band_song
     WHERE band_song.band_id = NEW.band_id;
END;

CREATE TRIGGER del_band_member BEFORE DELETE ON band_member FOR EACH ROW
BEGIN
  DELETE FROM song_rating WHERE song_rating.band_member_id = OLD.id;
  UPDATE band_song SET primary_vocal_id = null where primary_vocal_id = OLD.id;
  UPDATE band_song SET secondary_vocal_id = null where primary_vocal_id = OLD.id;
END;

CREATE TRIGGER new_band_song AFTER INSERT ON band_song FOR EACH ROW
BEGIN
  INSERT INTO song_rating (band_member_id, band_song_id, rating)
    SELECT band_member.id, NEW.id, 3
      FROM band_member
     WHERE band_member.band_id = NEW.band_id;
END;

CREATE TRIGGER del_band_song BEFORE DELETE ON band_song FOR EACH ROW
BEGIN
  DELETE FROM song_rating WHERE song_rating.band_song_id = OLD.id;
END;

DROP TABLE IF EXISTS session;
CREATE TABLE session (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_token VARCHAR,
  session_start VARCHAR NOT NULL,
  person_id INTEGER NOT NULL,
  UNIQUE (session_token),
  FOREIGN KEY (person_id) REFERENCES person(id) ON DELETE CASCADE
);

CREATE TABLE snapshot (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp VARCHAR DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE song_rating_snapshot (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_id INTEGER NOT NULL,
  band_id INTEGER NOT NULL,
  band_name VARCHAR,
  song_name VARCHAR,
  artist_name VARCHAR,
  average_rating FLOAT,
  high_rating INTEGER,
  low_rating INTEGER,
  variance FLOAT,
  FOREIGN KEY (snapshot_id) REFERENCES snapshot(id) ON DELETE CASCADE,
  FOREIGN KEY (band_id) REFERENCES band(id) ON DELETE CASCADE
);

CREATE TRIGGER del_song_rating_snapshot BEFORE DELETE ON snapshot FOR EACH ROW
BEGIN
  DELETE FROM song_rating_snapshot WHERE song_rating_snapshot.snapshot_id = OLD.id;
END;

CREATE TABLE request (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description VARCHAR,
  timestamp VARCHAR DEFAULT CURRENT_TIMESTAMP,
  request_type INTEGER NOT NULL,
  status INTEGER,
  band_id INTEGER,
  person_id INTEGER
);

CREATE TABLE setlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR,
  band_id INTEGER NOT NULL,
  FOREIGN KEY (band_id) REFERENCES band(id),
  UNIQUE (name, band_id)
);

CREATE TABLE setlist_set (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR,
  setlist_id INTEGER NOT NULL,
  FOREIGN KEY (setlist_id) REFERENCES setlist(id),
  UNIQUE (name, setlist_id)
);

CREATE TABLE setlist_song (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR,
  setlist_id INTEGER NOT NULL,
  setlist_set_id INTEGER NOT NULL,
  band_song_id INTEGER NOT NULL,
  FOREIGN KEY (band_song_id) REFERENCES band_song(id),
  FOREIGN KEY (setlist_id) REFERENCES setlist(id),
  FOREIGN KEY (setlist_set_id) REFERENCES setlist(id),
  UNIQUE (setlist_id, band_song_id),
  UNIQUE (setlist_set_id, band_song_id)
);

CREATE TABLE schema_change (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR NOT NULL,
  timestamp VARCHAR NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (name)
);

INSERT INTO person (name, full_name, password, system_admin) 
  VALUES ('admin', 'Administrator', 'admin', 1);

INSERT INTO schema_change (name, timestamp)
       VALUES ('Convert song_rating to use band_member_id', datetime('now'));

INSERT INTO schema_change (name, timestamp)
       VALUES ('Add snapshot tables for reporting', datetime('now'));

INSERT INTO schema_change (name, timestamp)
       VALUES ('Add request table', datetime('now'));

INSERT INTO schema_change (name, timestamp)
       VALUES ('Add vocalist columns to band_song', datetime('now'));

INSERT INTO schema_change (name, timestamp)
       VALUES ('Add Key Signature column to song and band_song tables', datetime('now'));

INSERT INTO schema_change (name, timestamp)
       VALUES ('Add Default to Key Signature columns', datetime('now'));

INSERT INTO schema_change (name, timestamp)
       VALUES ('Add New Flag to song_rating', datetime('now'));
