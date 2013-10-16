var should = require('should');

var sqlite3 = require('sqlite3');
var fs = require('fs');

var db = require('lib/db');
var dbh;

describe('song_table', function() {
  before(function(done) {
    db.setDbPath('./bombay_test.db');
    dbh = new db.Handle()
    var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
    dbh.doSqlExec([sql], done);
  });

  before(function(done) {
    var sql = fs.readFileSync('./test/support/addArtists.sql', 'utf8');
    dbh.doSqlExec(sql, function(err) {
      done();
    });
  });

  var song;
  it('should get the song object', function(done) {
    song = dbh.song();
    should.exist(song);
    done();
  });

  var song_id;
  it('should create the song', function(done) {
    song.create({
      name: 'La Grange',
      artist_id: 2,
    }, function(result) {
      should.exist(result);
      should.exist(result.song_id);
      should.not.exist(result.err);
      song_id = result.song_id;
      done();
    });
  });

  it('should get the song', function(done) {
    song.getById(song_id, function(result) {
      should.exist(result);
      should.exist(result.song);
      result.song.id.should.eql(song_id);
      result.song.name.should.eql('La Grange');
      result.song.artist_id.should.eql(2);
      done();
    });
  });

  it('should delete the song', function(done) {
    song.deleteById(song_id, function(result) {
      should.exist(result);
      should.exist(result.song);
      result.song.should.eql(1);
      done();
    });
  });

  it('should insert some rows', function(done) {
    var sql = fs.readFileSync('./test/support/addSongs.sql', 'utf8');
    dbh.doSqlExec(sql, function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should get all the songs', function(done) {
    song.getAll(function(result) {
      should.exist(result);
      should.exist(result.all_songs);
      result.all_songs.should.eql([{
	id: 6, name: 'Help', artist_id: 4
      }, {
	id: 5, name: 'I Wanna Hold Your Hand', artist_id: 4
      }, {
	id: 4, name: 'Love Me Do', artist_id: 4
      }, {
	id: 2, name: 'Rebel, Rebel', artist_id: 5
      }, {
	id: 1, name: 'Space Oddity', artist_id: 5
      }, {
	id: 7, name: 'Stairway To Heaven', artist_id: 3
      }, {
	id: 3, name: 'You Shook Me All Night Long', artist_id: 1      
      }]);  
      done();
    });
  });
});
