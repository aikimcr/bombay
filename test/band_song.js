var should = require('should');

var sqlite3 = require('sqlite3');
var fs = require('fs');

var db = require('lib/db');
var dbh;

describe('band_song_table', function() {
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

  it('should insert some rows', function(done) {
    var sql = fs.readFileSync('./test/support/addBandSongs.sql', 'utf8');
    dbh.doSqlExec(sql, function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should get all the band_songs', function(done) {
    band_song.getAll(function(result) {
      should.exist(result);
      should.exist(result.all_band_songs);
      result.all_band_songs.should.eql([{
	id: 1, band_id: 1, song_id: 1, song_status: 4
      }, {
	id: 2, band_id: 1, song_id: 2, song_status: 2
      }, {
	id: 3, band_id: 1, song_id: 3, song_status: 3
      }, {
	id: 4, band_id: 1, song_id: 4, song_status: 1
      }, {
	id: 5, band_id: 1, song_id: 5, song_status: -1
      }]);
      done();
    });
  });
});
