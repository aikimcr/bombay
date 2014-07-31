#change Add Key Signature column to song and band_song tables

ALTER TABLE song ADD COLUMN key_signature VARCHAR;

ALTER TABLE band_song ADD COLUMN key_signature VARCHAR;
