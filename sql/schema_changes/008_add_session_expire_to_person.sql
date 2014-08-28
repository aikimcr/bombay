#change Add Session Expires to person

ALTER TABLE person ADD COLUMN session_expires INTEGER NOT NULL DEFAULT 30;
