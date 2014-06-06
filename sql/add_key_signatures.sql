BEGIN TRANSACTION;

ALTER TABLE song ADD COLUMN key_signature VARCHAR;

ALTER TABLE band_song ADD COLUMN key_signature VARCHAR;

INSERT INTO schema_change (name, timestamp)
       VALUES ('Add Key Signature column to song and band_song tables', datetime('now'));

COMMIT;
