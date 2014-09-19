var should = require('should');
var util = require('util');
var diff = require('deep-diff').diff;
var db_orm = require('lib/db_orm');

var test_util = require('test/lib/util');

var rehearsal_plan = require('lib/rehearsal_plan');
var rehearsal_plan_routes = require('routes/rehearsal_plan');

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
  describe('lib', function() {
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
        average_rating: 3,
        score: 30716.807523202726
      }, {
        band_song_id: 7,
        song_id: 7,
        song_name: 'Song 1 by Artist 4',
        song_status: 2,
        last_rehearsal_date: null,
        average_rating: 3,
        score: 30716.807523202726
      }, {
        band_song_id: 4,
        song_id: 4,
        song_name: 'Song 2 by Artist 2',
        song_status: 2,
        last_rehearsal_date: null,
        average_rating: 3,
        score: 30716.807523202726
      }, {
        band_song_id: 5,
        song_id: 5,
        song_name: 'Song 1 by Artist 3',
        song_status: 3,
        last_rehearsal_date: null,
        average_rating: 4,
        score: 30634.87714591962
      }, {
        band_song_id: 2,
        song_id: 2,
        song_name: 'Song 2 by Artist 1',
        song_status: 3,
        last_rehearsal_date: null,
        average_rating: 4,
        score: 30634.87714591962
      }, {
        band_song_id: 8,
        song_id: 8,
        song_name: 'Song 2 by Artist 4',
        song_status: 3,
        last_rehearsal_date: null,
        average_rating: 4,
        score: 30634.87714591962
      }, {
        band_song_id: 3,
        song_id: 3,
        song_name: 'Song 1 by Artist 2',
        song_status: 4,
        last_rehearsal_date: null,
        average_rating: 5,
        score: 30575.671146786826
      }, {
        band_song_id: 6,
        song_id: 6,
        song_name: 'Song 2 by Artist 3',
        song_status: 4,
        last_rehearsal_date: null,
        average_rating: 5,
        score: 30575.671146786826
      }];

      learning_list = [{
        band_song_id: 9,
        song_id: 9,
        song_name: 'Song 1 by Artist 5',
        song_status: 0,
        last_rehearsal_date: null,
        average_rating: 5,
        score: 116.09640474436813
      }, {
        band_song_id: 12,
        song_id: 12,
        song_name: 'Song 2 by Artist 6',
        song_status: 1,
        last_rehearsal_date: null,
        average_rating: 5,
        score: 116.09640474436813
      }, {
        band_song_id: 11,
        song_id: 11,
        song_name: 'Song 1 by Artist 6',
        song_status: 0,
        last_rehearsal_date: null,
        average_rating: 4,
        score: 80
      }, {
        band_song_id: 10,
        song_id: 10,
        song_name: 'Song 2 by Artist 5',
        song_status: 1,
        last_rehearsal_date: null,
        average_rating: 3,
        score: 47.54887502163469
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
    var rehearsal_plan_id;
    it('should save the plan', function(done) {
      var run_through = run_through_list.splice(0, 5);
      var learning = learning_list.splice(0, 2);
      run_through_list = [{
        band_song_id: 8,
        song_id: 8,
        song_name: 'Song 2 by Artist 4',
        song_status: 3,
        last_rehearsal_date: null,
        average_rating: 4,
        score: 30634.87714591962
      }, {
        band_song_id: 3,
        song_id: 3,
        song_name: 'Song 1 by Artist 2',
        song_status: 4,
        last_rehearsal_date: null,
        average_rating: 5,
        score: 30575.671146786826
      }, {
        band_song_id: 6,
        song_id: 6,
        song_name: 'Song 2 by Artist 3',
        song_status: 4,
        last_rehearsal_date: null,
        average_rating: 5,
        score: 30575.671146786826
      }, {
        band_song_id: 1,
        song_id: 1,
        song_name: 'Song 1 by Artist 1',
        song_status: 2,
        last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
        average_rating: 3,
        score: 146.13637641589872
      }, {
        band_song_id: 7,
        song_id: 7,
        song_name: 'Song 1 by Artist 4',
        song_status: 2,
        last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
        average_rating: 3,
        score: 146.13637641589872
      }, {
        band_song_id: 4,
        song_id: 4,
        song_name: 'Song 2 by Artist 2',
        song_status: 2,
        last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
        average_rating: 3,
        score: 146.13637641589872
      }, {
        band_song_id: 5,
        song_id: 5,
        song_name: 'Song 1 by Artist 3',
        song_status: 3,
        last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
        average_rating: 4,
        score: 64.20599913279622
      }, {
        band_song_id: 2,
        song_id: 2,
        song_name: 'Song 2 by Artist 1',
        song_status: 3,
        last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
        average_rating: 4,
        score: 64.20599913279622
      }];

      learning_list = [{
        band_song_id: 9,
        song_id: 9,
        song_name: 'Song 1 by Artist 5',
        song_status: 0,
        last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
        average_rating: 5,
        score: 104.63781322576567
      }, {
        band_song_id: 12,
        song_id: 12,
        song_name: 'Song 2 by Artist 6',
        song_status: 1,
        last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
        average_rating: 5,
        score: 104.63781322576567
      }, {
        band_song_id: 11,
        song_id: 11,
        song_name: 'Song 1 by Artist 6',
        song_status: 0,
        last_rehearsal_date: null,
        average_rating: 4,
        score: 80
      }, {
        band_song_id: 10,
        song_id: 10,
        song_name: 'Song 2 by Artist 5',
        song_status: 1,
        last_rehearsal_date: null,
        average_rating: 3,
        score: 47.54887502163469
      }];
      old_rehearsal_date = rehearsal_date;

      rehearsal_plan.save(rehearsal_date, run_through, learning, function(err, plan_id) {
        should.not.exist(err);
        should.exist(plan_id);
        rehearsal_plan_id = plan_id;
        done();
      });
    });

    it('should get the plan', function(done) {
      rehearsal_plan.get(rehearsal_plan_id, function(err, plan) {
        should.not.exist(err);
        should.exist(plan);
        plan.should.have.property('rehearsal_plan');
        plan.should.have.property('run_through_songs');
        plan.should.have.property('learning_songs');
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
        average_rating: 5,
        score: 30718.807523202726
      }, {
        band_song_id: 4,
        song_id: 4,
        song_name: 'Song 2 by Artist 2',
        song_status: 2,
        last_rehearsal_date: old_rehearsal_date.toISOString().substr(0, 10),
        average_rating: 3,
        score: 166.13637641589872
      }, {
        band_song_id: 1,
        song_id: 1,
        song_name: 'Song 1 by Artist 1',
        song_status: 2,
        last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
        average_rating: 3,
        score: 146.13637641589872
      }, {
        band_song_id: 7,
        song_id: 7,
        song_name: 'Song 1 by Artist 4',
        song_status: 2,
        last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
        average_rating: 3,
        score: 146.13637641589872
      }, {
        band_song_id: 5,
        song_id: 5,
        song_name: 'Song 1 by Artist 3',
        song_status: 3,
        last_rehearsal_date: old_rehearsal_date.toISOString().substr(0, 10),
        average_rating: 4,
        score: 84.20599913279622
      }, {
        band_song_id: 2,
        song_id: 2,
        song_name: 'Song 2 by Artist 1',
        song_status: 3,
        last_rehearsal_date: old_rehearsal_date.toISOString().substr(0, 10),
        average_rating: 4,
        score: 84.20599913279622
      }, {
        band_song_id: 8,
        song_id: 8,
        song_name: 'Song 2 by Artist 4',
        song_status: 3,
        last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
        average_rating: 4,
        score: 64.20599913279622
      }, {
        band_song_id: 3,
        song_id: 3,
        song_name: 'Song 1 by Artist 2',
        song_status: 4,
        last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
        average_rating: 5,
        score: 5
      }, {
        band_song_id: 6,
        song_id: 6,
        song_name: 'Song 2 by Artist 3',
        song_status: 4,
        last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
        average_rating: 5,
        score: 5
      }];

      learning_list = [{
        band_song_id: 12,
        song_id: 12,
        song_name: 'Song 2 by Artist 6',
        song_status: 1,
        last_rehearsal_date: rehearsal_date.toISOString().substr(0, 10),
        average_rating: 5,
        score: 104.63781322576567
      }, {
        band_song_id: 11,
        song_id: 11,
        song_name: 'Song 1 by Artist 6',
        song_status: 0,
        last_rehearsal_date: null,
        average_rating: 4,
        score: 80
      }, {
        band_song_id: 10,
        song_id: 10,
        song_name: 'Song 2 by Artist 5',
        song_status: 1,
        last_rehearsal_date: null,
        average_rating: 3,
        score: 47.54887502163469
      }];

      rehearsal_plan.save(rehearsal_date, run_through, learning, function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should get the plan', function(done) {
      rehearsal_plan.get(rehearsal_plan_id, function(err, plan) {
        should.not.exist(err);
        should.exist(plan);
        plan.should.have.property('rehearsal_plan');
        plan.should.have.property('run_through_songs');
        plan.should.have.property('learning_songs');
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

  describe('routes', function() {
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

    var req;
    var res;
    beforeEach(function(done) {
      req = {
        session: {
          passport: {
            user: JSON.stringify({ id: 1, system_admin: false })
          }
        },
        query: {
        },
        params: {
        },
        body: {
        },
      };
      res = {
        send: function(result_code, err) {
          done(util.format(
            'Sending code %d with err %s',
            result_code,
            util.inspect(err)
          ));
        }
      };
      done();
    });

    var plan_lists;
    it('should get the lists', function(done) {
      req.query = {
        rehearsal_date: '2014-06-01',
        band_id: 1
      };
      var expected = {
        rehearsal_date: req.query.rehearsal_date,
        run_through_songs: [{
          band_song_id: 1,
          song_id: 1,
          song_name: 'Song 1 by Artist 1',
          song_status: 2,
          last_rehearsal_date: null,
          average_rating: 3,
          score: 30716.807523202726
        }, {
          band_song_id: 7,
          song_id: 7,
          song_name: 'Song 1 by Artist 4',
          song_status: 2,
          last_rehearsal_date: null,
          average_rating: 3,
          score: 30716.807523202726
        }, {
          band_song_id: 4,
          song_id: 4,
          song_name: 'Song 2 by Artist 2',
          song_status: 2,
          last_rehearsal_date: null,
          average_rating: 3,
          score: 30716.807523202726
        }, {
          band_song_id: 5,
          song_id: 5,
          song_name: 'Song 1 by Artist 3',
          song_status: 3,
          last_rehearsal_date: null,
          average_rating: 4,
          score: 30634.87714591962
        }, {
          band_song_id: 2,
          song_id: 2,
          song_name: 'Song 2 by Artist 1',
          song_status: 3,
          last_rehearsal_date: null,
          average_rating: 4,
          score: 30634.87714591962
        }, {
          band_song_id: 8,
          song_id: 8,
          song_name: 'Song 2 by Artist 4',
          song_status: 3,
          last_rehearsal_date: null,
          average_rating: 4,
          score: 30634.87714591962
        }, {
          band_song_id: 3,
          song_id: 3,
          song_name: 'Song 1 by Artist 2',
          song_status: 4,
          last_rehearsal_date: null,
          average_rating: 5,
          score: 30575.671146786826
        }, {
          band_song_id: 6,
          song_id: 6,
          song_name: 'Song 2 by Artist 3',
          song_status: 4,
          last_rehearsal_date: null,
          average_rating: 5,
          score: 30575.671146786826
        }],
        learning_songs: [{
          band_song_id: 9,
          song_id: 9,
          song_name: 'Song 1 by Artist 5',
          song_status: 0,
          last_rehearsal_date: null,
          average_rating: 5,
          score: 116.09640474436813
        }, {
          band_song_id: 12,
          song_id: 12,
          song_name: 'Song 2 by Artist 6',
          song_status: 1,
          last_rehearsal_date: null,
          average_rating: 5,
          score: 116.09640474436813
        }, {
          band_song_id: 11,
          song_id: 11,
          song_name: 'Song 1 by Artist 6',
          song_status: 0,
          last_rehearsal_date: null,
          average_rating: 4,
          score: 80
        }, {
          band_song_id: 10,
          song_id: 10,
          song_name: 'Song 2 by Artist 5',
          song_status: 1,
          last_rehearsal_date: null,
          average_rating: 3,
          score: 47.54887502163469
        }]
      };
      res.json = function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.exist(result);

        var result_diff = diff(result, expected);

        should.not.exist(result_diff);
        plan_lists = result;
        done();
      };
      rehearsal_plan_routes.getPlanLists(req, res);
    });

    it('should save a plan', function(done) {
      var run_through_sequence = 0;
      var learning_sequence = 0;
      req.body = {
        rehearsal_date: plan_lists.rehearsal_date,
        run_through_songs: JSON.stringify(plan_lists.run_through_songs.splice(0, 5).map(function(song) {
          
          run_through_sequence++;
          return({
            band_song_id: song.band_song_id,
            sequence: run_through_sequence
          });
        })),
        learning_songs: JSON.stringify(plan_lists.learning_songs.splice(0, 2).map(function(song) {
          learning_sequence++;
          return({
            band_song_id: song.band_song_id,
            sequence: learning_sequence
          });
        }))
      };
      var expected = {
        rehearsal_plan: {
          id: 1,
          rehearsal_date: req.body.rehearsal_date,
        },
        run_through_songs: [{
          id: 1,
          rehearsal_plan_id: 1,
          band_song_id: 1,
          sequence: 1
        }, {
          id: 2,
          rehearsal_plan_id: 1,
          band_song_id: 7,
          sequence: 2
        }, {
          id: 3,
          rehearsal_plan_id: 1,
          band_song_id: 4,
          sequence: 3
        }, {
          id: 4,
          rehearsal_plan_id: 1,
          band_song_id: 5,
          sequence: 4
        }, {
          id: 5,
          rehearsal_plan_id: 1,
          band_song_id: 2,
          sequence: 5
        }],
        learning_songs: [{
          id: 1,
          rehearsal_plan_id: 1,
          band_song_id: 9,
          sequence: 1
        }, {
          id: 2,
          rehearsal_plan_id: 1,
          band_song_id: 12,
          sequence: 2
        }]
      };
      res.json = function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.exist(result);

        var result_diff = diff(result, expected);

        should.not.exist(result_diff, util.inspect({
          got: result,
          expected: expected,
          diff: result_diff
        }, {depth: 4}));
        plan_lists = result;
        done();
      };
      rehearsal_plan_routes.postPlan(req, res);
    });
  });
});
