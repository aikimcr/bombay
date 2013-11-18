var should = require('should');

var sqlite3 = require('sqlite3');
var fs = require('fs');

var test_util = require('test/lib/util');

var db = require('lib/db');
var dbh;

describe('band_song_table', function() {
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
        should.not.exist(err);
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addArtists.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addSongs.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    var band_song;
    it('should get the band_song object', function(done) {
      band_song = dbh.band_song();
      should.exist(band_song);
      done();
    });

    it('should insert some rows', function(done) {
      var sql = fs.readFileSync('./test/support/addBandSongs.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should get all the band_songs', function(done) {
      var expected = [{
	id: 1, band_id: 1, song_id: 1, song_status: 4
      }, {
	id: 2, band_id: 1, song_id: 2, song_status: 2
      }, {
	id: 3, band_id: 1, song_id: 3, song_status: 3
      }, {
	id: 4, band_id: 1, song_id: 4, song_status: 1
      }, {
	id: 5, band_id: 1, song_id: 5, song_status: -1
      }];
      band_song.getAll(function(result) {
        test_util.check_list(result, expected, 'all_band_songs', ['id', 'band_id', 'song_id', 'song_status']);
        done();
      });
    });

    it('should get all the band_songs with status < 3', function(done) {
      var expected = [{
	id: 2, band_id: 1, song_id: 2, song_status: 2
      }, {
	id: 4, band_id: 1, song_id: 4, song_status: 1
      }, {
	id: 5, band_id: 1, song_id: 5, song_status: -1
      }];
      band_song.getAllWithArgs({ where : { song_status: { '<': 3 } } }, function(result) {
        test_util.check_list(result, expected, 'all_band_songs', ['id', 'band_id', 'song_id', 'song_status']);
        done();
      });
    });

    it('should get all the band_songs with status < 3 and status > 0', function(done) {
      var expected = [{
	id: 2, band_id: 1, song_id: 2, song_status: 2
      }, {
	id: 4, band_id: 1, song_id: 4, song_status: 1
      }];
      band_song.getAllWithArgs({ where : { song_status: { '<': 3, '>': 0 } } }, function(result) {
        test_util.check_list(result, expected, 'all_band_songs', ['id', 'band_id', 'song_id', 'song_status']);
        done();
      });
    });
  });

  describe('#CreateAndUpdate', function() {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      dbh = new db.Handle()
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      dbh.doSqlExec([sql], done);
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addArtists.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addSongs.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    var band_song;
    it('should get the band_song object', function(done) {
      band_song = dbh.band_song();
      should.exist(band_song);
      done();
    });

    var band_song_id;
    it('should create the band_song', function(done) {
      band_song.create({
        band_id: 1,
        song_id: 1,
        song_status: 3,
      }, function(result) {
        should.exist(result);
        should.exist(result.band_song_id);
        should.not.exist(result.err);
        band_song_id = result.band_song_id;
        done();
      });
    });

    it('should get the band_song', function(done) {
      band_song.getById(band_song_id, function(result) {
        should.exist(result);
        should.exist(result.band_song);
        result.band_song.id.should.eql(band_song_id);
        result.band_song.band_id.should.eql(1);
        result.band_song.song_id.should.eql(1);
        result.band_song.song_status.should.eql(3);
        done();
      });
    });

    it('should delete the band_song', function(done) {
      band_song.deleteById(band_song_id, function(result) {
        should.exist(result);
        should.exist(result.band_song);
        result.band_song.should.eql(1);
        done();
      });
    });
  });
});
