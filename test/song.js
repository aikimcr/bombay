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

describe('song_views', function() {
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
    var sql = fs.readFileSync('./test/support/addBandMembers.sql', 'utf8');
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
    var sql = fs.readFileSync('./test/support/addBandSongs.sql', 'utf8');
    dbh.doSqlExec(sql, function(err) {
      done();
    });
  });

  before(function(done) {
    var sql = fs.readFileSync('./test/support/addSongRatings.sql', 'utf8');
    dbh.doSqlExec(sql, function(err) {
      done();
    });
  });

  var song;
  before(function(done) {
    song = dbh.song();
    done();
  });

  describe('#getBandList', function() {
    it("should be sorted by name, no filters", function(done) {
      song.getBandList(1, 1, 'song_name', {}, function(result) {
	should.exist(result);
	result.should.eql({
          band_songs: [{
            name: 'I Wanna Hold Your Hand',
            artist_name: 'The Beatles',
            band_song_id: 5,
            song_status: -1,
            rating: 5,
            avg_rating: 5
          }, {
            name: 'Love Me Do',
            artist_name: 'The Beatles',
            band_song_id: 4,
            song_status: 1,
            rating: 4,
            avg_rating: 3.5
          }, {
            name: 'Rebel, Rebel',
            artist_name: 'David Bowie',
            band_song_id: 2,
            song_status: 2,
            rating: 2,
            avg_rating: 2.5
          }, {
            name: 'Space Oddity',
            artist_name: 'David Bowie',
            band_song_id: 1,
            song_status: 4,
            rating: 1,
            avg_rating: 1
          }, {
            name: 'You Shook Me All Night Long',
            artist_name: 'AC/DC',
            band_song_id: 3,
            song_status: 3,
            rating: 3,
            avg_rating: 3
          }],
          sort_type: 'song_name',
          filters: {}
        });
        done();
      });
    });

    it("should be sorted by artist_name reversed, no filters", function(done) {
      song.getBandList(1, 1, 'song_name_rev', {}, function(result) {
	should.exist(result);
        result.should.eql({
          band_songs: [{
            name: 'You Shook Me All Night Long',
            artist_name: 'AC/DC',
            band_song_id: 3,
            song_status: 3,
            rating: 3,
            avg_rating: 3
          }, {
            name: 'Space Oddity',
            artist_name: 'David Bowie',
            band_song_id: 1,
            song_status: 4,
            rating: 1,
            avg_rating: 1
          }, {
            name: 'Rebel, Rebel',
            artist_name: 'David Bowie',
            band_song_id: 2,
            song_status: 2,
            rating: 2,
            avg_rating: 2.5
          }, {
            name: 'Love Me Do',
            artist_name: 'The Beatles',
            band_song_id: 4,
            song_status: 1,
            rating: 4,
            avg_rating: 3.5
          }, {
            name: 'I Wanna Hold Your Hand',
            artist_name: 'The Beatles',
            band_song_id: 5,
            song_status: -1,
            rating: 5,
            avg_rating: 5
          }],
          sort_type: 'song_name_rev',
          filters: {}
        });
        done();
      });
    });

    it("should be sorted by artist_name, filter on name", function(done) {
      song.getBandList(1, 1, 'artist_name', {song_name: 'You'}, function(result) {
	should.exist(result);
        result.should.eql({
          band_songs: [{
            name: 'You Shook Me All Night Long',
            artist_name: 'AC/DC',
            band_song_id: 3,
            song_status: 3,
            rating: 3,
            avg_rating: 3
          }, {
            name: 'I Wanna Hold Your Hand',
            artist_name: 'The Beatles',
            band_song_id: 5,
            song_status: -1,
            rating: 5,
            avg_rating: 5
          }],
          sort_type: 'artist_name',
          filters: {song_name: 'You'}
        });
        done();
      });
    });

    it("should be sorted by average rating reversed, filter on artist_id", function(done) {
      song.getBandList(1, 1, 'average_rating_rev', {artist_id: 4}, function(result) {
        result.should.eql({
          band_songs: [{
            name: 'I Wanna Hold Your Hand',
            artist_name: 'The Beatles',
            band_song_id: 5,
            song_status: -1,
            rating: 5,
            avg_rating: 5
          }, {
            name: 'Love Me Do',
            artist_name: 'The Beatles',
            band_song_id: 4,
            song_status: 1,
            rating: 4,
            avg_rating: 3.5
          }],
          sort_type: 'average_rating_rev',
          filters: {artist_id: 4}
        });
        done();
      });
    });
  });
});
