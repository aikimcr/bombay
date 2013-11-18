var should = require('should');
var fs = require('fs');

var test_util = require('test/lib/util');

var db = require('lib/db');
var routes = require('routes/db');

db.setLogDbErrors(false);

describe('routes', function() {
  var dbh;
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

  var req;
  beforeEach(function(done) {
    req = {
      session: {
        passport: {
          user: 1
        }
      },
      query: {
      },
      params: {
      },
    };
    done();
  });

  describe('#get', function() {
    describe('#band', function() {
      it('should return all the bands, sorted by name', function(done) {
        var expected = [{
	  id: 4, name: 'Jazz Wild'
        }, {
	  id: 2, name: 'Live! Dressed! Girls!'
        }, {
	  id: 3, name: 'Sally Says Go'
        }, {
	  id: 1, name: 'Wild At Heart'
        }];
        var res = {
          json: function(result) {
            test_util.check_list(result, expected, 'all_bands', ['id', 'name']);
	    done();
          }
        };
        routes.getBandTable(req, res);
      });

      it('should return band with id 1', function(done) {
        var expected = {id: 1, name: 'Wild At Heart' };
        req.query.id = 1;
        var res = {
          json: function(result) {
            test_util.check_item(result, expected, 'band', ['id', 'name']);
	    done();
          }
        };
        routes.getBandTable(req, res);
      });
    });

    describe('#person', function() {
      it('should return all the persons, sorted by full name', function(done) {
        var expected = [{
	  id: 2,
	  name: 'aposer',
	  full_name: 'Alan Poser',
	  password: 'fakeit',
	  email: 'aposer@wannabe.net',
	  system_admin: false
        }, {
	  id: 3,
	  name: 'ddrums',
	  full_name: 'Danny Drums',
	  password: 'backbeat',
	  email: 'ddrums@musichero.foo',
	  system_admin: false
        }, {
	  id: 4,
	  name: 'jguitar',
	  full_name: 'Johnny Guitar',
	  password: 'tonefreak',
	  email: 'jguitar@musichero.foo',
	  system_admin: false
        }, {
	  id: 1,
	  name: 'admin',
	  full_name: 'System Admin User',
	  password: 'admin',
	  email: 'admin@allnightmusic.com',
	  system_admin: true
        }];
        var res = {
          json: function(result) {
            test_util.check_list(result, expected, 'all_persons', ['id', 'name', 'full_name', 'password', 'email', 'system_admin']);
	    done();
          }
        };
        routes.getPersonTable(req, res);
      });

      it('should return person with id 1', function(done) {
        var expected = {
	  id: 1,
	  name: 'admin',
	  full_name: 'System Admin User',
	  password: 'admin',
	  email: 'admin@allnightmusic.com',
	  system_admin: true
        };
        req.query.id = 1;
        var res = {
          json: function(result) {
            test_util.check_item(result, expected, 'person', ['id', 'name', 'full_name', 'password', 'email', 'system_admin']);
	    done();
          }
        };
        routes.getPersonTable(req, res);
      });
    });

    describe('#artist', function() {
      it('should return all the artists, sorted by name', function(done) {
        var expected = [{
	  id: 1, name: 'AC/DC'
        }, {
	  id: 5, name: 'David Bowie'
        }, {
	  id: 3, name: 'Led Zeppelin'
        }, {
	  id: 4, name: 'The Beatles'
        }, {
	  id: 2, name: 'ZZ Top'      
        }];
        var res = {
          json: function(result) {
            test_util.check_list(result, expected, 'all_artists', ['id', 'name']);
	    done();
          }
        };
        routes.getArtistTable(req, res);
      });

      it('should return artist with id 1', function(done) {
        var expected = {id: 1, name: 'AC/DC' };
        req.query.id = 1;
        var res = {
          json: function(result) {
            test_util.check_item(result, expected, 'artist', ['id', 'name']);
	    done();
          }
        };
        routes.getArtistTable(req, res);
      });
    });

    describe('#song', function() {
      it('should return all the songs, sorted by name', function(done) {
        var expected = [{
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
        }];
        var res = {
          json: function(result) {
            test_util.check_list(result, expected, 'all_songs', ['id', 'name', 'artist_id']);
	    done();
          }
        };
        routes.getSongTable(req, res);
      });

      it('should return song with id 1', function(done) {
        var expected = {id: 1, name: 'Space Oddity', artist_id: 5 };
        req.query.id = 1;
        var res = {
          json: function(result) {
            test_util.check_item(result, expected, 'song', ['id', 'name', 'artist_id']);
	    done();
          }
        };
        routes.getSongTable(req, res);
      });
    });

    describe('#band_member', function() {
      it('should return all the band_members, sorted by band_id and person_id', function(done) {
        var expected = [{
	  id: 1, band_id: 1, person_id: 1, band_admin: false
        }, {
	  id: 5, band_id: 1, person_id: 3, band_admin: false
        }, {
	  id: 2, band_id: 2, person_id: 1, band_admin: true
        }, {
	  id: 3, band_id: 3, person_id: 2, band_admin: false
        }, {
	  id: 4, band_id: 4, person_id: 2, band_admin: true
        }];
        var res = {
          json: function(result) {
            test_util.check_list(result, expected, 'all_band_members', ['id', 'band_id', 'person_id', 'band_admin']);
	    done();
          }
        };
        routes.getBandMemberTable(req, res);
      });

      it('should return band_member with id 1', function(done) {
        var expected = {id: 1, band_id: 1, person_id: 1, band_admin: false };
        req.query.id = 1;
        var res = {
          json: function(result) {
            test_util.check_item(result, expected, 'band_member', ['id', 'band_id', 'person_id', 'band_admin']);
	    done();
          }
        };
        routes.getBandMemberTable(req, res);
      });
    });

    describe('#band_song', function()  {
      it('should return all the band_songs, sorted by band_id and song_id', function(done) {
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
        var res = {
          json: function(result) {
            test_util.check_list(result, expected, 'all_band_songs', ['id', 'band_id', 'song_id', 'song_status']);
	    done();
          }
        };
        routes.getBandSongTable(req, res);
      });

      it('should return band_song with id 1', function(done) {
        var expected = {id: 1, band_id: 1, song_id: 1, song_status: 4 };
        req.query.id = 1;
        var res = {
          json: function(result) {
            test_util.check_item(result, expected, 'band_song', ['id', 'band_id', 'song_id', 'song_status']);
	    done();
          }
        };
        routes.getBandSongTable(req, res);
      });
    });

    describe('#song_rating', function()  {
      it('should return all the song_ratings, sorted by band_member_id and band_song_id', function(done) {
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
        var res = {
          json: function(result) {
            test_util.check_list(result, expected, 'all_song_ratings', ['id', 'band_member_id', 'band_song_id', 'rating']);
	    done();
          }
        };
        routes.getSongRatingTable(req, res);
      });

      it('should return song_rating with id 1', function(done) {
        var expected = {id: 1, band_member_id: 1, band_song_id: 1, rating: 1 };
        req.query.id = 1;
        var res = {
          json: function(result) {
            test_util.check_item(result, expected, 'song_rating', ['id', 'band_member_id', 'band_song_id', 'rating']);
	    done();
          }
        };
        routes.getSongRatingTable(req, res);
      });
    });
  });

  describe('#post', function() {
    describe('#band', function() {
      // Band creation should a a system_admin function.  The 
      // process should be to create a band, create a person then
      // make that person a band_member with band_admin privileges
      // for the new band.

      var band_id;
      it('should create a band', function(done) {
        req.body = {name: 'Cover Story'};
        var res = {
          json: function(result) {
            band_id = test_util.check_result(result, 'band_id');
            done();
          }
        };
        routes.postBandTable(req, res);
      });

      it('should return an error', function(done) {
        req.body = {name: 'Cover Story'};
        var res = {
          json: function(result) {
            var error = test_util.check_error_result(result, 'band_id');
            done();
          }
        };
        routes.postBandTable(req, res);
      });
    });

    describe('#person', function() {
      var person_id;
      it('should create a person', function(done) {
        req.body = {
          name: 'bbongos',
          full_name: 'Billy Bongos',
          password: 'clave',
          email: 'bbongos@musichero.foo',
          system_admin: false,
        };
        var res = {
          json: function(result) {
            person_id = test_util.check_result(result, 'person_id');
            done();
          }
        };
        routes.postPersonTable(req, res);
      });

      it('should return an error', function(done) {
        req.body = {
          name: 'bbongos',
          full_name: 'Billy Bongos',
          password: 'clave',
          email: 'bbongos@musichero.foo',
          system_admin: false,
        };
        var res = {
          json: function(result) {
            var error = test_util.check_error_result(result, 'person_id');
            done();
          }
        };
        routes.postPersonTable(req, res);
      });
    });

    describe('#artist', function() {
      var artist_id;
      it('should create a artist', function(done) {
        req.body = {name: 'Mott the Hoople'};
        var res = {
          json: function(result) {
            artist_id = test_util.check_result(result, 'artist_id');
            done();
          }
        };
        routes.postArtistTable(req, res);
      });

      it('should return an error', function(done) {
        req.body = {name: 'Mott the Hoople'};
        var res = {
          json: function(result) {
            var error = test_util.check_error_result(result, 'artist_id');
            done();
          }
        };
        routes.postArtistTable(req, res);
      });
    });

    describe('#song', function() {
      var song_id;
      it('should create a song', function(done) {
        req.body = {name: 'La Grange', artist_id: 2};
        var res = {
          json: function(result) {
            song_id = test_util.check_result(result, 'song_id');
            done();
          }
        };
        routes.postSongTable(req, res);
      });

      it('should return an error', function(done) {
        req.body = {name: 'La Grange', artist_id: 2};
        var res = {
          json: function(result) {
            var error = test_util.check_error_result(result, 'song_id');
            done();
          }
        };
        routes.postSongTable(req, res);
      });
    });

    describe('#band_member', function() {
      var band_member_id;
      it('should create a band_member', function(done) {
        req.body = {band_id: 3, person_id: 1, band_admin: true};
        var res = {
          json: function(result) {
            band_member_id = test_util.check_result(result, 'band_member_id');
            done();
          }
        };
        routes.postBandMemberTable(req, res);
      });

      it('should return an error', function(done) {
        req.body = {band_id: 3, person_id: 1, band_admin: true};
        var res = {
          json: function(result) {
            var error = test_util.check_error_result(result, 'band_member_id');
            done();
          }
        };
        routes.postBandMemberTable(req, res);
      });
    });

    describe('#band_song', function() {
      var band_song_id;
      it('should create a band_song', function(done) {
        req.body = {band_id: 3, song_id: 1, song_status: 3};
        var res = {
          json: function(result) {
            band_song_id = test_util.check_result(result, 'band_song_id');
            done();
          }
        };
        routes.postBandSongTable(req, res);
      });

      it('should return an error', function(done) {
        req.body = {band_id: 3, song_id: 1, song_status: 4};
        var res = {
          json: function(result) {
            var error = test_util.check_error_result(result, 'band_song_id');
            done();
          }
        };
        routes.postBandSongTable(req, res);
      });
    });

    describe('#song_rating', function() {
      var song_rating_id;
      it('should create a song_rating', function(done) {
        req.body = {band_member_id: 3, band_song_id: 1, rating: 3};
        var res = {
          json: function(result) {
            song_rating_id = test_util.check_result(result, 'song_rating_id');
            done();
          }
        };
        routes.postSongRatingTable(req, res);
      });

      it('should return an error', function(done) {
        req.body = {band_member_id: 3, band_song_id: 1, rating: 4};
        var res = {
          json: function(result) {
            var error = test_util.check_error_result(result, 'song_rating_id');
            done();
          }
        };
        routes.postSongRatingTable(req, res);
      });
    });
  });
});
