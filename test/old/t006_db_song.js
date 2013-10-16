var db = require("../routes/db");
var should = require("should");
var sqlite3 = require("sqlite3");
var fs = require("fs");

describe('band_songs', function() {
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

  describe('#getBandSongs', function(){
    it("should be sorted by name, no filters", function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getBandSongs(dbh, 1, 1, 'song_name', {}, function(result) {
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
      dbh.close();
    });

    it("should be sorted by artist_name reversed, no filters", function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getBandSongs(dbh, 1, 1, 'song_name_rev', {}, function(result) {
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
      dbh.close();
    });

    it("should be sorted by artist_name, filter on name", function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getBandSongs(dbh, 1, 1, 'artist_name', {song_name: 'You'}, function(result) {
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
      dbh.close();
    });

    it("should be sorted by average rating reversed, filter on artist_id", function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getBandSongs(dbh, 1, 1, 'average_rating_rev', {artist_id: 4}, function(result) {
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
      dbh.close();
    });
  });
  
  describe('#createASong', function() {
    it('should create a song', function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.createASong(dbh, 'Houses of the Holy', 3, function(result) {
        should.exist(result);
        should.exist(result.song_id);
        result.song_id.should.eql(8);
        done();
      });
      dbh.close();
    });
    
    it('should find the song', function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getSongById(dbh, 8, function(song) {
        should.exist(song);
        song.should.eql({
          song: {
            id: 8,
            name: 'Houses of the Holy',
            artist_id: 3
          }
        });
        done();
      });
      dbh.close();
    });
  });
  
  describe('#addBandSong', function() {
    it('should add the song to the band', function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.addBandSong(dbh, 4, 8, function(result) {
        should.exist(result);
        should.exist(result.band_song_id);
        result.band_song_id.should.eql(6);
        done();
      });
      dbh.close();
    });
    
    it('should find the band song', function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getBandSongById(dbh, 6, function(band_song) {
        should.exist(band_song);
        band_song.should.eql({
          band_song: {
            id: 6,
            band_id: 4,
            song_id: 8,
            song_status: 0
          }
        });
        done();
      });
      dbh.close();
    });
  });
});

describe('songs', function() {
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

  describe('#other_songs', function() {
    it("should get the songs not used by this band, sorted by name with description", function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getOtherSongs(dbh, 1, function(result) {
        result.should.eql({
          other_songs: [{
            id: 6,
            name: 'Help',
            artist_id: 4,
            artist_name: 'The Beatles',
            description: 'Help by The Beatles'
          }, {
            id: 7,
            name: 'Stairway To Heaven',
            artist_id: 3,
            artist_name: 'Led Zeppelin',
            description: 'Stairway To Heaven by Led Zeppelin'
          }]
        });
        done();
      });
      dbh.close();
    });
  });
  
  describe('#routes', function() {
    it("should send back the right json", function(done) {
      var req = {
        session: {
          passport: {
            user: 1
          }
        },
        query: {
          band_id: 1,
          sort_type: 'song_name',
          filters: JSON.stringify({artist_id: 1})
        }
      };
      
      var res = {
        json: function(obj) {
          obj.should.eql({
            permissions: {
              person_id: 1,
              is_sysadmin: 1,
              band_id: 1,
              is_band_admin: false
            },
            band_id: 1,
            person_id: 1,
            band_songs: [{
              name: 'You Shook Me All Night Long',
              artist_name: 'AC/DC',
              band_song_id: 3,
              song_status: 3,
              rating: 3,
              avg_rating: 3
            }],
            artists: [{
              id: 1, name: 'AC/DC', song_count: 1
            }, {
              id: 5, name: 'David Bowie', song_count: 2
            }, {
              id: 3, name: 'Led Zeppelin', song_count: 1
            }, {
              id: 4, name: 'The Beatles', song_count: 3
            }, {
              id: 2, name: 'ZZ Top', song_count: 0
            }],
            other_songs: [{
              id: 6,
              name: 'Help',
              artist_id: 4,
              artist_name: 'The Beatles',
              description: 'Help by The Beatles'
            }, {
              id: 7,
              name: 'Stairway To Heaven',
              artist_id: 3,
              artist_name: 'Led Zeppelin',
              description: 'Stairway To Heaven by Led Zeppelin'
            }],
            sort_type: 'song_name',
            filters: {artist_id: 1}
          });
          done();
        }
      };

      db.bandSongs(req, res);
    });
  });
});
