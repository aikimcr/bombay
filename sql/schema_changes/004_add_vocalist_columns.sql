#change Add vocalist columns to band_song

ALTER TABLE band_song ADD COLUMN primary_vocal INTEGER REFERENCES person(id);
ALTER TABLE band_song ADD COLUMN secondary_vocal INTEGER REFERENCES person(id);
