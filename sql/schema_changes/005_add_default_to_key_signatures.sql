#change Add Default to Key Signature columns

DROP TABLE IF EXISTS modify_band_song;
CREATE TABLE modify_band_song (
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

INSERT INTO modify_band_song (id, band_id, song_id, song_status, key_signature)
  SELECT id, band_id, song_id, song_status, key_signature
    FROM band_song;


DROP TABLE band_song;
ALTER TABLE modify_band_song RENAME TO band_song;

DROP TRIGGER IF EXISTS del_band_member;
CREATE TRIGGER del_band_member BEFORE DELETE ON band_member FOR EACH ROW
BEGIN
  DELETE FROM song_rating WHERE song_rating.band_member_id = OLD.id;
  UPDATE band_song SET primary_vocal_id = null where primary_vocal_id = OLD.id;
  UPDATE band_song SET secondary_vocal_id = null where primary_vocal_id = OLD.id;
END;

DROP TABLE IF EXISTS modify_song;
CREATE TABLE modify_song (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR NOT NULL,
  artist_id INTEGER NOT NULL,
  key_signature VARCHAR DEFAULT '',
  FOREIGN KEY (artist_id) REFERENCES artist(id),
  UNIQUE (name, artist_id)
);

INSERT INTO modify_song (id, name, artist_id, key_signature)
  SELECT id, name, artist_id, key_signature
    FROM song;

DROP TABLE song;
ALTER TABLE modify_song RENAME TO song;

UPDATE band_song SET key_signature = '' WHERE key_signature is null;
UPDATE band_song SET key_signature = '' WHERE key_signature = 'null';

UPDATE song SET key_signature = '' WHERE key_signature is null;
UPDATE song SET key_signature = '' WHERE key_signature = 'null';
