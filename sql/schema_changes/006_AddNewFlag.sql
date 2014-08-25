#change Add New Flag to song_rating

ALTER TABLE song_rating ADD COLUMN is_new INTEGER DEFAULT 1;
UPDATE song_rating SET is_new = 0 WHERE rating != 3;
