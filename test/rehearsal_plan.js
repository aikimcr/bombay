var should = require('should');
var util = require('util');
var diff = require('deep-diff').diff;
var db_orm = require('lib/db_orm');

var test_util = require('test/lib/util');

var rehearsal_plan = require('lib/rehearsal_plan');

function artist_and_song_sql(sql, status_list, rating_list, artist_id, song_id, band_song_id) {
  var artist_name = util.format('Artist %d', artist_id);
  sql.push(util.format(
    'INSERT INTO artist (id, name) VALUES (%d, \'%s\');',
    artist_id,
    artist_name
  ));
  for (var song = 1; song <= 2; song++) {
    var song_name = util.format('Song %d by %s', song, artist_name);
    sql.push(util.format(
      'INSERT INTO song (id, name, artist_id) VALUES (%d, \'%s\', %d);',
      song_id,
      song_name,
      artist_id
    ));

    var song_status = status_list.shift();
    status_list.push(song_status);
    sql.push(util.format(
      'INSERT INTO band_song (id, band_id, song_id, song_status) VALUES (%d, %d, %d, %d);',
      band_song_id,
      1,
      song_id,
      song_status
    ));

    var song_rating = rating_list.shift();
    rating_list.push(song_rating);
    sql.push(util.format(
      'UPDATE song_rating SET rating = %d WHERE band_song_id = %d AND band_member_id = 1;',
      song_rating,
      band_song_id
    ));

    song_id++;
    band_song_id++;
  }
  return [song_id, band_song_id, status_list, rating_list];
}

describe('rehearsal_plan', function() {
  before(function(done) { test_util.db.resetDb(done); });

  before(function(done) {
    var sql = [
      'INSERT INTO band (id, name) VALUES (1, \'Wild At Heart\');',
      'INSERT INTO person (id, name, full_name) VALUES (2, \'bbunny\', \'Bugs Bunny\');',
      'INSERT INTO band_member (id, band_id, person_id, band_admin) VALUES (1, 1, 2, 1);',
    ];

    var song_id = 1;
    var band_song_id = 1;
    var status_list = [2, 3, 4];
    var rating_list = [3, 4, 5];

    for (var artist_id = 1; artist_id <= 4; artist_id++) {
      var new_values = artist_and_song_sql(sql, status_list, rating_list, artist_id, song_id, band_song_id);
      song_id = new_values[0];
      band_song_id = new_values[1];
      status_list = new_values[2];
      rating_list = new_values[3];
    }

    status_list = [0, 1];
    for (artist_id = 5; artist_id <= 6; artist_id++) {
      var new_values = artist_and_song_sql(sql, status_list, rating_list, artist_id, song_id, band_song_id);
      song_id = new_values[0];
      band_song_id = new_values[1];
      status_list = new_values[2];
      rating_list = new_values[3];
    }

    test_util.db.loadSql(sql, done);
  });

  var rehearsal_date;
  var run_through_list;
  var learning_list;
  before(function(done) {
    rehearsal_date = new Date('2014-06-01');
    run_through_list = [{
      band_song_id: 1,
      song_id: 1,
      song_name: 'Song 1 by Artist 1',
      song_status: 2,
      last_rehearsal_date: null,
      average_rating: 3
    }, {
      band_song_id: 7,
      song_id: 7,
      song_name: 'Song 1 by Artist 4',
      song_status: 2,
      last_rehearsal_date: null,
      average_rating: 3
    }, {
      band_song_id: 4,
      song_id: 4,
      song_name: 'Song 2 by Artist 2',
      song_status: 2,
      last_rehearsal_date: null,
      average_rating: 3
    }, {
      band_song_id: 5,
      song_id: 5,
      song_name: 'Song 1 by Artist 3',
      song_status: 3,
      last_rehearsal_date: null,
      average_rating: 4
    }, {
      band_song_id: 2,
      song_id: 2,
      song_name: 'Song 2 by Artist 1',
      song_status: 3,
      last_rehearsal_date: null,
      average_rating: 4
    }, {
      band_song_id: 8,
      song_id: 8,
      song_name: 'Song 2 by Artist 4',
      song_status: 3,
      last_rehearsal_date: null,
      average_rating: 4
    }, {
      band_song_id: 3,
      song_id: 3,
      song_name: 'Song 1 by Artist 2',
      song_status: 4,
      last_rehearsal_date: null,
      average_rating: 5
    }, {
      band_song_id: 6,
      song_id: 6,
      song_name: 'Song 2 by Artist 3',
      song_status: 4,
      last_rehearsal_date: null,
      average_rating: 5
    }];

    learning_list = [{
      band_song_id: 9,
      song_id: 9,
      song_name: 'Song 1 by Artist 5',
      song_status: 0,
      last_rehearsal_date: null,
      average_rating: 5
    }, {
      band_song_id: 12,
      song_id: 12,
      song_name: 'Song 2 by Artist 6',
      song_status: 1,
      last_rehearsal_date: null,
      average_rating: 5
    }, {
      band_song_id: 11,
      song_id: 11,
      song_name: 'Song 1 by Artist 6',
      song_status: 0,
      last_rehearsal_date: null,
      average_rating: 4
    }, {
      band_song_id: 10,
      song_id: 10,
      song_name: 'Song 2 by Artist 5',
      song_status: 1,
      last_rehearsal_date: null,
      average_rating: 3
    }];

    done();
  });

  it('should get the initial run through list', function(done) {
    rehearsal_plan.getRunThroughList(1, rehearsal_date, function(err, list) {
      should.not.exist(err);
      should.exist(list);

      var list_diff = diff(list, run_through_list);

      should.not.exist(list_diff);
      done();
    });
  });

  it('should get the initial learning list', function(done) {
    rehearsal_plan.getLearningList(1, rehearsal_date, function(err, list) {
      should.not.exist(err);
      should.exist(list);

      var list_diff = diff(list, learning_list);

      should.not.exist(list_diff);
      done();
    });
  });

  var old_rehearsal_date;
  it('should save the plan', function(done) {
    var run_through = run_through_list.splice(0, 5);
    var learning = learning_list.splice(0, 2);
    run_through_list = [{
      band_song_id: 8,
      song_id: 8,
      song_name: 'Song 2 by Artist 4',
      song_status: 3,
      last_rehearsal_date: null,
      average_rating: 4
    }, {
      band_song_id: 3,
      song_id: 3,
      song_name: 'Song 1 by Artist 2',
      song_status: 4,
      last_rehearsal_date: null,
      average_rating: 5
    }, {
      band_song_id: 6,
      song_id: 6,
      song_name: 'Song 2 by Artist 3',
      song_status: 4,
      last_rehearsal_date: null,
      average_rating: 5
    }, {
      band_song_id: 1,
      song_id: 1,
      song_name: 'Song 1 by Artist 1',
      song_status: 2,
      last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
      average_rating: 3
    }, {
      band_song_id: 7,
      song_id: 7,
      song_name: 'Song 1 by Artist 4',
      song_status: 2,
      last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
      average_rating: 3
    }, {
      band_song_id: 4,
      song_id: 4,
      song_name: 'Song 2 by Artist 2',
      song_status: 2,
      last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
      average_rating: 3
    }, {
      band_song_id: 5,
      song_id: 5,
      song_name: 'Song 1 by Artist 3',
      song_status: 3,
      last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
      average_rating: 4
    }, {
      band_song_id: 2,
      song_id: 2,
      song_name: 'Song 2 by Artist 1',
      song_status: 3,
      last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
      average_rating: 4
    }];

    learning_list = [{
      band_song_id: 9,
      song_id: 9,
      song_name: 'Song 1 by Artist 5',
      song_status: 0,
      last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
      average_rating: 5
    }, {
      band_song_id: 12,
      song_id: 12,
      song_name: 'Song 2 by Artist 6',
      song_status: 1,
      last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
      average_rating: 5
    }, {
      band_song_id: 11,
      song_id: 11,
      song_name: 'Song 1 by Artist 6',
      song_status: 0,
      last_rehearsal_date: null,
      average_rating: 4
    }, {
      band_song_id: 10,
      song_id: 10,
      song_name: 'Song 2 by Artist 5',
      song_status: 1,
      last_rehearsal_date: null,
      average_rating: 3
    }];
    old_rehearsal_date = rehearsal_date;

    rehearsal_plan.save(rehearsal_date, run_through, learning, function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should get a new run through list', function(done) {
    rehearsal_date = new Date('2014-06-08');
    rehearsal_plan.getRunThroughList(1, rehearsal_date, function(err, list) {
      should.not.exist(err);
      should.exist(list);

      var list_diff = diff(list, run_through_list);

      should.not.exist(list_diff);
      done();
    });
  })

  it('should get a new learning list', function(done) {
    rehearsal_plan.getLearningList(1, rehearsal_date, function(err, list) {
      should.not.exist(err);
      should.exist(list);

      var list_diff = diff(list, learning_list);

      should.not.exist(list_diff);
      done();
    });
  });

  it('should save the plan', function(done) {
    var run_through = run_through_list.splice(0, 5);
    var learning = learning_list.splice(0, 2);
    run_through_list = [{
      band_song_id: 9,
      song_id: 9,
      song_name: 'Song 1 by Artist 5',
      song_status: 2,
      last_rehearsal_date: null,
      average_rating: 5
    }, {
      band_song_id: 4,
      song_id: 4,
      song_name: 'Song 2 by Artist 2',
      song_status: 2,
      last_rehearsal_date: old_rehearsal_date.toISOString().substr(0, 10),
      average_rating: 3
    }, {
      band_song_id: 1,
      song_id: 1,
      song_name: 'Song 1 by Artist 1',
      song_status: 2,
      last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
      average_rating: 3
    }, {
      band_song_id: 7,
      song_id: 7,
      song_name: 'Song 1 by Artist 4',
      song_status: 2,
      last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
      average_rating: 3
    }, {
      band_song_id: 5,
      song_id: 5,
      song_name: 'Song 1 by Artist 3',
      song_status: 3,
      last_rehearsal_date: old_rehearsal_date.toISOString().substr(0, 10),
      average_rating: 4
    }, {
      band_song_id: 2,
      song_id: 2,
      song_name: 'Song 2 by Artist 1',
      song_status: 3,
      last_rehearsal_date: old_rehearsal_date.toISOString().substr(0, 10),
      average_rating: 4
    }, {
      band_song_id: 8,
      song_id: 8,
      song_name: 'Song 2 by Artist 4',
      song_status: 3,
      last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
      average_rating: 4
    }, {
      band_song_id: 3,
      song_id: 3,
      song_name: 'Song 1 by Artist 2',
      song_status: 4,
      last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
      average_rating: 5
    }, {
      band_song_id: 6,
      song_id: 6,
      song_name: 'Song 2 by Artist 3',
      song_status: 4,
      last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
      average_rating: 5
    }];

    learning_list = [{
      band_song_id: 12,
      song_id: 12,
      song_name: 'Song 2 by Artist 6',
      song_status: 1,
      last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
      average_rating: 5
    }, {
      band_song_id: 11,
      song_id: 11,
      song_name: 'Song 1 by Artist 6',
      song_status: 0,
      last_rehearsal_date: null,
      average_rating: 4
    }, {
      band_song_id: 10,
      song_id: 10,
      song_name: 'Song 2 by Artist 5',
      song_status: 1,
      last_rehearsal_date: null,
      average_rating: 3
    }];

    rehearsal_plan.save(rehearsal_date, run_through, learning, function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should update a band_song status', function(done) {
    db_orm.execSqlList('UPDATE band_song SET song_status = 2 WHERE id = 9', function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should get a new run through list', function(done) {
    rehearsal_date = new Date('2014-06-15');
    rehearsal_plan.getRunThroughList(1, rehearsal_date, function(err, list) {
      should.not.exist(err);
      should.exist(list);

      var list_diff = diff(list, run_through_list);

      should.not.exist(list_diff);
      done();
    });
  })

  it('should get a new learning list', function(done) {
    rehearsal_plan.getLearningList(1, rehearsal_date, function(err, list) {
      should.not.exist(err);
      should.exist(list);

      var list_diff = diff(list, learning_list);

      should.not.exist(list_diff);
      done();
    });
  });
});
