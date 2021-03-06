BEGIN TRANSACTION;

CREATE TABLE new_song_rating (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  band_member_id INTEGER NOT NULL,
  band_song_id INTEGER NOT NULL,
  rating INTEGER NOT NULL DEFAULT 3,
  FOREIGN KEY (band_member_id) REFERENCES band_member(id) ON DELETE CASCADE,
  FOREIGN KEY (band_song_id) REFERENCES band_song(id) ON DELETE CASCADE,
  UNIQUE (band_member_id, band_song_id)
);

INSERT INTO new_song_rating (id, band_member_id, band_song_id, rating)
       SELECT a.id, b.id, a.band_song_id, a.rating 
         FROM song_rating a, band_member b, band_song c
        WHERE c.id = a.band_song_id
          AND b.person_id = a.person_id
          AND b.band_id = c.band_id;

DROP TABLE song_rating;

CREATE TABLE song_rating (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  band_member_id INTEGER NOT NULL,
  band_song_id INTEGER NOT NULL,
  rating INTEGER NOT NULL DEFAULT 3,
  FOREIGN KEY (band_member_id) REFERENCES band_member(id) ON DELETE CASCADE,
  FOREIGN KEY (band_song_id) REFERENCES band_song(id) ON DELETE CASCADE,
  UNIQUE (band_member_id, band_song_id)
);

INSERT INTO song_rating (id, band_member_id, band_song_id, rating)
       SELECT id, band_member_id, band_song_id, rating FROM new_song_rating;

DROP TABLE new_song_rating;

INSERT INTO schema_change (name, timestamp)
       VALUES ('Convert song_rating to use band_member_id', datetime('now'));

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

COMMIT;