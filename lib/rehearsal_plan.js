/*
 * Rehearsal Plan Utilities
 */

var db_orm = require('./db_orm');

function base10Weight(value) {
  if (value === 0) return 0;
  if (isNaN(value)) return 0;
  return value * Math.log(value) / Math.LN10;
}

function base2Weight(value) {
  if (value === 0) return 0;
  if (isNaN(value)) return 0;
  return value * Math.log(value) / Math.LN2;
}

function getDayScore(rehearsal_date, row, inverse) {
  if (row.last_rehearsal_date) {
    var days = (rehearsal_date - new Date(row.last_rehearsal_date)) / (24 * 60 * 60 * 1000);
    if (inverse) days = 1 / days;
    return base2Weight(days / 7);
  }
  if (inverse) return 0;
  return base2Weight(360);
}

var find_run_through_songs = [
  'SELECT',
  '  a.id AS band_song_id',
  ', a.song_id AS song_id',
  ', a.name AS song_name',
  ', a.song_status AS song_status',
  ', MAX(c.rehearsal_date) AS last_rehearsal_date',
  ', AVG(d.rating) AS average_rating',
  '  FROM (SELECT * from band_song, song ',
  '         WHERE band_song.song_id = song.id',
  '           AND band_song.song_status > 1',
  '           AND band_song.band_id = $1) a',
  '  LEFT OUTER JOIN rehearsal_run_through b ON b.band_song_id = a.id',
  '  LEFT JOIN rehearsal_plan c ON c.id = b.rehearsal_plan_id',
  '  LEFT JOIN song_rating d ON d.band_song_id = a.id',
  '  GROUP BY a.song_id',
  '  ORDER BY last_rehearsal_date desc, song_status, a.name'
];

var find_learning_songs = [
  'SELECT',
  '  a.id AS band_song_id',
  ', a.song_id AS song_id',
  ', a.name AS song_name',
  ', a.song_status AS song_status',
  ', MAX(c.rehearsal_date) AS last_rehearsal_date',
  ', AVG(d.rating) AS average_rating',
  '  FROM (SELECT * from band_song, song ',
  '         WHERE band_song.song_id = song.id',
  '           AND band_song.song_status in (0, 1)',
  '           AND band_song.band_id = $1) a',
  '  LEFT OUTER JOIN rehearsal_learning b ON b.band_song_id = a.id',
  '  LEFT JOIN rehearsal_plan c ON c.id = b.rehearsal_plan_id',
  '  LEFT JOIN song_rating d ON d.band_song_id = a.id',
  '  GROUP BY a.song_id',
  '  ORDER BY last_rehearsal_date desc, song_status, a.name'
];

exports.getRunThroughList = function(band_id, rehearsal_date, cb) {
  db_orm.querySql(find_run_through_songs.join(' '), [band_id], function(err, rows) {
    if (err) {
      cb(err);
    } else {
      var sorted_rows = rows.map(function(row) {
        var day_score = getDayScore(rehearsal_date, row) * 10;
        var status_score = base10Weight(5 - row.song_status) * 100;
        row.score = day_score + status_score + row.average_rating;
        return row;
      }).sort(function(row_a, row_b) {
        if (row_a.score > row_b.score) {
          return -1;
        } else if (row_a.score < row_b.score) {
          return 1;
        } else if (row_a.name > row_b.name) {
          return -1;
        } else if (row_a.name < row_b.name) {
          return 1;
        } else {
          return 0;
        }
      });

      cb(null, sorted_rows);
    }
  });
};

exports.getLearningList = function(band_id, rehearsal_date, cb) {
  db_orm.querySql(find_learning_songs.join(' '), [band_id], function(err, rows) {
    if (err) {
      cb(err);
    } else {
      var sorted_rows = rows.map(function(row) {
        var rating_score = base2Weight(row.average_rating) * 10;
        var day_score = getDayScore(rehearsal_date, row, true) * 100;
        var status_score = base10Weight(row.song_status);
        row.score = rating_score + day_score + status_score;
        return row;
      }).sort(function(row_a, row_b) {
        if (row_a.score > row_b.score) {
          return -1;
        } else if (row_a.score < row_b.score) {
          return 1;
        } else if (row_a.name > row_b.name) {
          return -1;
        } else if (row_a.name < row_b.name) {
          return 1;
        } else {
          return 0;
        }
      });

      cb(null, sorted_rows);
    }
  });
};

exports.save = function(rehearsal_date, run_through, learning, cb) {
  db_orm.RehearsalPlan.create([{rehearsal_date: rehearsal_date}], function(err, rows) {
    if (err) {
      cb(err);
    } else {
      var sequence = 0;
      var plan_id = rows[0].id;
      var rt_songs = run_through.map(function(song) {
        sequence++;
        return ({
          rehearsal_plan_id: plan_id,
          band_song_id: song.band_song_id,
          sequence: sequence
        });
      });

      db_orm.RehearsalRunThrough.create(rt_songs, function(err, rows) {
        if (err) {
          cb(err);
        } else {
          sequence = 0;
          var learning_songs = learning.map(function(song) {
            sequence++;
            return ({
              rehearsal_plan_id: plan_id,
              band_song_id: song.band_song_id,
              sequence: sequence
            });
          });
          db_orm.RehearsalLearning.create(learning_songs, function(err, rows) {
            if (err) {
              cb(err);
            } else {
              cb(null, plan_id);
            }
          });
        }
      });
    }
  });
};

exports.get = function(plan_id, cb) {
  db_orm.RehearsalPlan.get(plan_id, function(err, plan) {
    if (err) {
      cb(err);
    } else {
      db_orm.RehearsalRunThrough.find({rehearsal_plan_id: plan.id}, ['sequence'], function(err, run_through_songs) {
        if (err) {
          cb(err);
        } else {
          db_orm.RehearsalLearning.find({rehearsal_plan_id: plan.id}, ['sequence'], function(err, learning_songs) {
            if (err) {
              cb(err);
            } else {
              cb(null, {
                rehearsal_plan: plan,
                run_through_songs: run_through_songs,
                learning_songs: learning_songs
              });
            }
          });
        }
      });
    }
  });
};
