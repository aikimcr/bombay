var db = require("../routes/db");
var should = require("should");
var sqlite3 = require("sqlite3");
var fs = require("fs");

describe('artists', function() {
  describe('utility', function(){
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
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

    it("should get the list of artists sorted by name", function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getArtists(dbh, function(result) {
        result.should.eql({artists: [{
          id: 1, name: 'AC/DC', song_count: 1
        }, {
          id: 5, name: 'David Bowie', song_count: 2
        }, {
          id: 3, name: 'Led Zeppelin', song_count: 1
        }, {
          id: 4, name: 'The Beatles', song_count: 3
        }, {
          id: 2, name: 'ZZ Top', song_count: 0
        }]});
        done();
      });
      dbh.close();
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8');
      var dbh = new sqlite3.Database(db.getDbPath());
      dbh.exec(sql, done);
      dbh.close();
    });
    
    it('should send back the right json', function(done) {
      var req = {
        session: {
          passport: {
            user: 1
          }
        },
        query: {
          band_id: 1
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
          });
          done();
        }
      };

      db.artists(req, res);
    });
  });
});
