#change Restore Band Song Triggers
DROP TRIGGER IF EXISTS new_band_song;
DROP TRIGGER IF EXISTS del_band_song;

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

