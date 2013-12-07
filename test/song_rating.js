var should = require('should');

var sqlite3 = require('sqlite3');
var fs = require('fs');

var test_util = require('test/lib/util');

var db = require('lib/db');
var dbh;

describe('song_rating_table', function() {
  describe('#GetLists', function() {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      dbh = new db.Handle()
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      dbh.doSqlExec([sql], done);
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addPeople.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addArtists.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addSongs.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addBandMembers.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addBandSongs.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    it('should load all the records into the db', function(done) {
      var sql = fs.readFileSync('./test/support/addSongRatings.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    var song_rating;
    it('should get the song_rating object', function(done) {
      song_rating = dbh.song_rating();
      should.exist(song_rating);
      done();
    });

    it('should get all the song_ratings', function(done) {
      var expected = [{
        id: 1, band_member_id: 1, band_song_id: 1, rating: 1
      }, {
        id: 2, band_member_id: 1, band_song_id: 2, rating: 2
      }, {
        id: 3, band_member_id: 1, band_song_id: 3, rating: 3
      }, {
        id: 4, band_member_id: 1, band_song_id: 4, rating: 4
      }, {
        id: 5, band_member_id: 1, band_song_id: 5, rating: 5
      }, {
        id: 6, band_member_id: 2, band_song_id: 1, rating: 1
      }, {
        id: 7, band_member_id: 2, band_song_id: 2, rating: 3
      }, {
        id: 8, band_member_id: 2, band_song_id: 3, rating: 3
      }, {
        id: 9, band_member_id: 2, band_song_id: 4, rating: 3
      }, {
        id: 10, band_member_id: 2, band_song_id: 5, rating: 5
      }];
      song_rating.getAll(function(result) {
        test_util.check_list(result, expected, 'all_song_ratings', ['id', 'band_member_id', 'band_song_id', 'rating']);
        done();
      });
    });

    it('should get all the song_ratings with rating > 2 and rating < 5', function(done) {
      var expected = [{
        id: 3, band_member_id: 1, band_song_id: 3, rating: 3
      }, {
        id: 4, band_member_id: 1, band_song_id: 4, rating: 4
      }, {
        id: 7, band_member_id: 2, band_song_id: 2, rating: 3
      }, {
        id: 8, band_member_id: 2, band_song_id: 3, rating: 3
      }, {
        id: 9, band_member_id: 2, band_song_id: 4, rating: 3
      }];
      song_rating.getAllWithArgs({ where: { rating: { '>': 2, '<': 5 } } }, function(result) {
        test_util.check_list(result, expected, 'all_song_ratings', ['id', 'band_member_id', 'band_song_id', 'rating']);
        done();
      });
    });
  });

  describe('#GetAndUpdate', function() {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      dbh = new db.Handle()
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      dbh.doSqlExec([sql], done);
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addPeople.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addArtists.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addSongs.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addBandMembers.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addBandSongs.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    it('should load all the records into the db', function(done) {
      var sql = fs.readFileSync('./test/support/addSongRatings.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    var song_rating;
    it('should get the song_rating object', function(done) {
      song_rating = dbh.song_rating();
      should.exist(song_rating);
      done();
    });

    var song_rating_id;
    it('should get all the song_ratings for band_member 1 and band_song 4', function(done) {
      var expected = [{
        id: 4, band_member_id: 1, band_song_id: 4, rating: 4
      }];
      song_rating.getAllWithArgs({ where: {
        band_member_id: 1,
        band_song_id: 4
      }}, function(result) {
        test_util.check_list(result, expected, 'all_song_ratings', ['id', 'band_member_id', 'band_song_id', 'rating']);
        song_rating_id = result.all_song_ratings[0].id;
        done();
      });
    });

    it('should get the song_rating', function(done) {
      song_rating.getById(song_rating_id, function(result) {
        should.exist(result);
        should.exist(result.song_rating);
        result.song_rating.id.should.eql(song_rating_id);
        result.song_rating.band_member_id.should.eql(1);
        result.song_rating.band_song_id.should.eql(4);
        result.song_rating.rating.should.eql(4);
        done();
      });
    });
  });
});
