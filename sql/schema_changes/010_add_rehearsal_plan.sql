#change Add Rehearsal Plan

CREATE TABLE rehearsal_plan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rehearsal_date VARCHAR NOT NULL
);

CREATE TABLE rehearsal_run_through (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rehearsal_plan_id INTEGER NOT NULL,
  sequence INTEGER NOT NULL,
  band_song_id INTEGER NOT NULL,
  UNIQUE(rehearsal_plan_id, sequence),
  FOREIGN KEY (rehearsal_plan_id) REFERENCES rehearsal_plan(id) ON DELETE CASCADE,
  FOREIGN KEY (band_song_id) REFERENCES band_song(id) ON DELETE CASCADE
);

CREATE TABLE rehearsal_learning (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rehearsal_plan_id INTEGER NOT NULL,
  sequence INTEGER NOT NULL,
  band_song_id INTEGER NOT NULL,
  UNIQUE(rehearsal_plan_id, sequence),
  FOREIGN KEY (rehearsal_plan_id) REFERENCES rehearsal_plan(id) ON DELETE CASCADE,
  FOREIGN KEY (band_song_id) REFERENCES band_song(id) ON DELETE CASCADE
);

CREATE TRIGGER del_rehearsal_plan BEFORE DELETE ON rehearsal_plan FOR EACH ROW
BEGIN
  DELETE FROM rehearsal_run_through WHERE rehearsal_run_through.band_song_id = OLD.id;
  DELETE FROM rehearsal_learning WHERE rehearsal_learning.band_song_id = OLD.id;
END;

DROP TRIGGER IF EXISTS del_band_song;
CREATE TRIGGER del_band_song BEFORE DELETE ON band_song FOR EACH ROW
BEGIN
  DELETE FROM song_rating WHERE song_rating.band_song_id = OLD.id;
  DELETE FROM rehearsal_run_through WHERE rehearsal_run_through.band_song_id = OLD.id;
  DELETE FROM rehearsal_learning WHERE rehearsal_learning.band_song_id = OLD.id;
END;
