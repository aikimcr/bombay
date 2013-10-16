var db = require("../routes/db");
var should = require("should");
var sqlite3 = require("sqlite3");
var fs = require("fs");

describe('song_rating', function() {
  before(function(done) {
    db.setDbPath('./bombay_test.db');
    var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
    var dbh = new sqlite3.Database(db.getDbPath());
    dbh.exec(sql, done);
    dbh.close();
  });
  
  before(function(done) {
    var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8');
    var dbh = new sqlite3.Database(db.getDbPath());
    dbh.exec(sql, done);
    dbh.close();
  });
  
  before(function(done) {
    var sql = fs.readFileSync('./test/support/addSongs.sql', 'utf8');
    var dbh = new sqlite3.Database(db.getDbPath());
    dbh.exec(sql, done);
    dbh.close();
  });

  before(function(done) {
    var sql = fs.readFileSync('./test/support/addBandSongs.sql', 'utf8');
    var dbh = new sqlite3.Database(db.getDbPath());
    dbh.exec(sql, done);
    dbh.close();
  });
  
  describe('#addSongRating', function() {
    var band_id;
    var person_id;
    var song_id;
    var band_song_id;
    before(function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.createABand(dbh, 'Standing Rocks', function(result) {
        band_id = result.band_id;
        done();
      });
      dbh.close();  
    });
    
    before(function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.createAPerson(dbh, {name: 'rragged', full_name: 'Rick Ragged'}, function(result) {
        person_id = result.person_id;
        done();
      });
      dbh.close();
    });
    
    before(function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.createASong(dbh, 'Crawling Joe Burn', band_id, function(result) {
        song_id = result.song_id;
        done();
      });
      dbh.close();
    });
    
    before(function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.addBandSong(dbh, band_id, song_id, function(result) {
        band_song_id = result.band_song_id;
        done();
      });
      dbh.close();
    });
    
    it('should add a rating', function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.addSongRating(dbh, person_id, band_song_id, function(result) {
        should.exist(result);
        should.exist(result.song_rating_id);
        result.song_rating_id.should.eql(11);
        done();
      });
      dbh.close();
    });
    
    it('should find the rating', function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getSongRatingById(dbh, 11, function(song_rating) {
        should.exist(song_rating);
        song_rating.should.eql({
          song_rating: {
            id: 11,
            person_id: person_id,
            band_song_id: band_song_id,
            rating: 3
          }
        });
        done();
      });
      dbh.close();
    });
  });
});
  
describe('song_ratings', function() {
  before(function(done) {
    db.setDbPath('./bombay_test.db');
    var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
    var dbh = new sqlite3.Database(db.getDbPath());
    dbh.exec(sql, done);
    dbh.close();
  });
  
  before(function(done) {
    var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8');
    var dbh = new sqlite3.Database(db.getDbPath());
    dbh.exec(sql, done);
    dbh.close();
  });
  
  before(function(done) {
    var sql = fs.readFileSync('./test/support/addSongs.sql', 'utf8');
    var dbh = new sqlite3.Database(db.getDbPath());
    dbh.exec(sql, done);
    dbh.close();
  });

  describe('#addSongRatings', function() {
    it('should put band_songs in the database', function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      dbh.run('INSERT INTO band_song (band_id, song_id) SELECT $1, id FROM song', [1], function(result) {
        this.changes.should.eql(7);
        done();
      });
      dbh.close();
    });
  
    it('should add the ratings', function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.addSongRatings(dbh, 1, 1, function(result) {
        should.exist(result);
        should.exist(result.last_song_rating_id);
        done();
      });
      dbh.close();
    });
    
    it('should get the ratings', function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getSongRatingsForPersonId(dbh, 1, function(result) {
        should.exist(result);
        result.should.eql({
          song_ratings: [{
            id: 1, person_id: 1, band_song_id: 1, rating: 3,
          }, {
            id: 2, person_id: 1, band_song_id: 2, rating: 3,
          }, {
            id: 3, person_id: 1, band_song_id: 3, rating: 3,
          }, {
            id: 4, person_id: 1, band_song_id: 4, rating: 3,
          }, {
            id: 5, person_id: 1, band_song_id: 5, rating: 3,
          }, {
            id: 6, person_id: 1, band_song_id: 6, rating: 3,
          }, {
            id: 7, person_id: 1, band_song_id: 7, rating: 3,
          }]
        });
        done();
      });
      dbh.close();
    });
  });
});
