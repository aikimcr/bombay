DROP TABLE IF EXISTS rating_stats_1;
CREATE TEMPORARY TABLE rating_stats_1 (
  band_song_id integer
, average_rating integer
);

INSERT INTO rating_stats_1 (band_song_id, average_rating)
  SELECT band_song_id, avg(rating)
    FROM song_rating
   GROUP BY band_song_id;

DROP TABLE IF EXISTS rating_stats_2;
CREATE TEMPORARY TABLE rating_stats_2(
  band_song_id integer
, band_member_id integer
, variances float
);

INSERT INTO rating_stats_2 (band_song_id, band_member_id, variances)
  SELECT a.band_song_id, a.band_member_id, (a.rating - b.average_rating)*(a.rating - b.average_rating)
    FROM song_rating a, rating_stats_1 b
   WHERE a.band_song_id = b.band_song_id
   GROUP BY a.band_member_id, a.band_song_id;


INSERT INTO snapshot (timestamp) VALUES (DATETIME('now'));

INSERT INTO song_rating_snapshot
  (snapshot_id, band_id, band_name, song_name, artist_name, average_rating,
   high_rating, low_rating, variance)
    SELECT
      (SELECT MAX(id) FROM snapshot)
    , band.id band_id
    , band.name band_name
    , song.name song_name
    , artist.name artist_name
    , AVG(song_rating.rating) as average_rating
    , MAX(song_rating.rating) AS high_rating
    , MIN(song_rating.rating) AS low_rating
    , AVG(rating_stats_2.variances) AS variance
      FROM band_song
      LEFT JOIN band ON (band_song.band_id == band.id)
      LEFT JOIN song ON (band_song.song_id == song.id)
      LEFT JOIN artist ON (song.artist_id == artist.id)
      LEFT JOIN rating_stats_2 ON (band_song.id == rating_stats_2.band_song_id)
      LEFT OUTER JOIN song_rating ON (band_song.id == song_rating.band_song_id)
      GROUP BY band.id, band_song.song_id
;
