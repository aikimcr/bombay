DROP TABLE IF EXISTS band;
DROP TABLE IF EXISTS person;
DROP TABLE IF EXISTS band_member;
DROP TABLE IF EXISTS artist;
DROP TABLE IF EXISTS song;
DROP TABLE IF EXISTS band_song;
DROP TABLE IF EXISTS song_rating;
DROP TABLE IF EXISTS setlist;
DROP TABLE IF EXISTS setlist_set;
DROP TABLE IF EXISTS setlist_song;
DROP TABLE IF EXISTS schema_change;

CREATE TABLE band (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name VARCHAR,
        UNIQUE (name)
);

CREATE TABLE person (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name VARCHAR NOT NULL,
	full_name VARCHAR,
        password VARCHAR NOT NULL DEFAULT 'password',
        email VARCHAR,
        system_admin INTEGER NOT NULL DEFAULT 0,
        UNIQUE (name)
);

CREATE TABLE band_member (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	band_id INTEGER NOT NULL,
	person_id INTEGER NOT NULL,
        band_admin INTEGER NOT NULL DEFAULT 0,
	FOREIGN KEY (band_id) REFERENCES band(id),
	FOREIGN KEY (person_id) REFERENCES person(id),
	UNIQUE (band_id, person_id)
);

CREATE TABLE artist (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name VARCHAR NOT NULL,
        UNIQUE (name)
);

CREATE TABLE song (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name VARCHAR NOT NULL,
	artist_id INTEGER NOT NULL,
	FOREIGN KEY (artist_id) REFERENCES artist(id),
        UNIQUE (name, artist_id)
);

CREATE TABLE band_song (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	band_id INTEGER NOT NULL,
	song_id INTEGER NOT NULL,
	song_status INTEGER NOT NULL DEFAULT 0,
	FOREIGN KEY (band_id) REFERENCES band(id),
	FOREIGN KEY (song_id) REFERENCES song(id),
	UNIQUE (band_id, song_id)
);

CREATE TABLE song_rating (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	person_id INTEGER NOT NULL,
	band_song_id INTEGER NOT NULL,
	rating INTEGER NOT NULL DEFAULT 3,
	FOREIGN KEY (person_id) REFERENCES person(id),
	FOREIGN KEY (band_song_id) REFERENCES band_song(id),
	UNIQUE (person_id, band_song_id)
);

CREATE TABLE setlist (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name VARCHAR,
	band_id INTEGER NOT NULL,
	FOREIGN KEY (band_id) REFERENCES band(id),
        UNIQUE (name, band_id)
);

CREATE TABLE setlist_set (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name VARCHAR,
	setlist_id INTEGER NOT NULL,
        FOREIGN KEY (setlist_id) REFERENCES setlist(id),
        UNIQUE (name, setlist_id)
);

CREATE TABLE setlist_song (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name VARCHAR,
	setlist_id INTEGER NOT NULL,
	setlist_set_id INTEGER NOT NULL,
	band_song_id INTEGER NOT NULL,
	FOREIGN KEY (band_song_id) REFERENCES band_song(id),
	FOREIGN KEY (setlist_id) REFERENCES setlist(id),
	FOREIGN KEY (setlist_set_id) REFERENCES setlist(id),
	UNIQUE (setlist_id, band_song_id),
	UNIQUE (setlist_set_id, band_song_id)
);

CREATE TABLE schema_change (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name VARCHAR NOT NULL,
	timestamp VARCHAR NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE (name)
);

