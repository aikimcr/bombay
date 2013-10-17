var should = require('should');

var sqlite3 = require('sqlite3');
var fs = require('fs');

var db = require('lib/db');
var dbh;

describe('song_rating_table', function() {
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

  var song_rating;
  it('should get the song_rating object', function(done) {
    song_rating = dbh.song_rating();
    should.exist(song_rating);
    done();
  });

  var song_rating_id;
  it('should create the song_rating', function(done) {
    song_rating.create({
      person_id: 1,
      band_song_id: 1,
      rating: 4,
    }, function(result) {
      should.exist(result);
      should.exist(result.song_rating_id);
      should.not.exist(result.err);
      song_rating_id = result.song_rating_id;
      done();
    });
  });

  it('should get the song_rating', function(done) {
    song_rating.getById(song_rating_id, function(result) {
      should.exist(result);
      should.exist(result.song_rating);
      result.song_rating.id.should.eql(song_rating_id);
      result.song_rating.person_id.should.eql(1);
      result.song_rating.band_song_id.should.eql(1);
      result.song_rating.rating.should.eql(4);
      done();
    });
  });

  it('should delete the song_rating', function(done) {
    song_rating.deleteById(song_rating_id, function(result) {
      should.exist(result);
      should.exist(result.song_rating);
      result.song_rating.should.eql(1);
      done();
    });
  });

  it('should insert some rows', function(done) {
    var sql = fs.readFileSync('./test/support/addSongRatings.sql', 'utf8');
    dbh.doSqlExec(sql, function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should get all the song_ratings', function(done) {
    song_rating.getAll(function(result) {
      should.exist(result);
      should.exist(result.all_song_ratings);
      result.all_song_ratings.should.eql([{
	id: 1, person_id: 1, band_song_id: 1, rating: 1
      }, {
	id: 2, person_id: 1, band_song_id: 2, rating: 2
      }, {
	id: 3, person_id: 1, band_song_id: 3, rating: 3
      }, {
	id: 4, person_id: 1, band_song_id: 4, rating: 4
      }, {
	id: 5, person_id: 1, band_song_id: 5, rating: 5
      }, {
	id: 6, person_id: 2, band_song_id: 1, rating: 1
      }, {
	id: 7, person_id: 2, band_song_id: 2, rating: 3
      }, {
	id: 8, person_id: 2, band_song_id: 3, rating: 3
      }, {
	id: 9, person_id: 2, band_song_id: 4, rating: 3
      }, {
	id: 10, person_id: 2, band_song_id: 5, rating: 5
      }]);
      done();
    });
  });
});

describe('song_rating_util', function() {
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

  var song_rating;
  before(function(done) {
    song_rating = dbh.song_rating();
    done();
  });

  it('should add the ratings for a band member', function(done) {
    song_rating.addForBandMember(1, 1, function(result) {
      should.exist(result);
      should.exist(result.last_song_rating_id);
      should.not.exist(result.err);
      done();
    });
  });

  it('should get the ratings for a band member', function(done) {
    song_rating.getForBandMember(1, 1, function(result) {
      should.exist(result);
      should.exist(result.member_ratings);
      should.not.exist(result.err);
      result.member_ratings.should.eql([{
	id: 1, person_id: 1, band_song_id: 1, rating: 3
      }, {
	id: 2, person_id: 1, band_song_id: 2, rating: 3
      }, {
	id: 3, person_id: 1, band_song_id: 3, rating: 3
      }, {
	id: 4, person_id: 1, band_song_id: 4, rating: 3
      }, {
	id: 5, person_id: 1, band_song_id: 5, rating: 3
      }]);
      done();
    });
  });
});
