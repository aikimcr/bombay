BEGIN TRANSACTION;

DROP TABLE IF EXISTS snapshot;
CREATE TABLE snapshot (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp VARCHAR DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS song_rating_snapshot;
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

DROP TRIGGER IF EXISTS del_song_rating_snapshot;
CREATE TRIGGER del_song_rating_snapshot BEFORE DELETE ON snapshot FOR EACH ROW
BEGIN
  DELETE FROM song_rating_snapshot WHERE song_rating_snapshot.snapshot_id = OLD.id;
END;

INSERT INTO schema_change (name, timestamp)
       VALUES ('Add snapshot tables for reporting', datetime('now'));

COMMIT;