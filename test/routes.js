var should = require('should');
var fs = require('fs');

var test_util = require('test/lib/util');

var db = require('lib/db');
var db_orm = require('lib/db_orm');
var constants = require('lib/constants');
var encryption = require('routes/encryption');
var request = require('lib/request');
var routes = require('routes/db');
var util = require('lib/util');
var constants = require('lib/constants');

db.setLogDbErrors(false);

describe('routes', function() {
  var dbh;
  before(function(done) {
    db.setDbPath('./bombay_test.db');
    db_orm.setDBName('bombay_test.db');
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

  // Blow away the defaults and add some predictable ones.
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
          user: JSON.stringify({ id: 1, system_admin: false })
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
          id: 5,
          name: 'kkeys',
          full_name: 'Kevin Keys',
          password: 'concerto',
          email: 'kkeys@musichero.foo',
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
          id: 6, band_id: 3, person_id: 5, band_admin: true
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
      // Band creation should be a system_admin function.  The 
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
      it('should create an add_band_member request', function(done) {
        req.session.passport.user = JSON.stringify({ id: 5, system_admin: false });
        req.body = {band_id: 3, person_id: 1};
        var res = {
          json: function(result) {
            should.exist(result.request);
            should.exist(result.request.request_type);
            result.request.request_type.should.eql(constants.request_type.add_band_member);
            should.exist(result.request.band_id);
            result.request.band_id.should.eql(3);
            should.exist(result.request.person_id);
            result.request.person_id.should.eql(1);
            should.exist(result.request.description);
            result.request.description.should.eql('Sally Says Go is inviting System Admin User to join');
            should.exist(result.request.status);
            result.request.status.should.eql(constants.request_status.pending);
            should.exist(result.request.id);
            result.request.id.should.eql(1);
            should.exist(result.request.timestamp);
            done();
          }
        };
        routes.postBandMemberTable(req, res);
      });

      it('should return an error', function(done) {
        req.body = {band_id: 3, person_id: 1};
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
        req.body = {band_id: 3, song_id: 1, key_signature: '', song_status: 3};
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

  describe('#put', function() {
    describe('#band', function() {
      it('should update the band name', function(done) {
        req.query = {id: 1, name: 'Groove On The Side'};
        var res = {
          json: function(result) {
            band_id = test_util.check_result(result, 'band');
            done();
          }
        };
        routes.putBandTable(req, res);
      });

      it('should get the band', function(done) {
        var expected = {id: 1, name: 'Groove On The Side'};
        dbh.band().getById(1, function(result) {
          test_util.check_item(result, expected, 'band', ['id', 'name']);
          done();
        });
      });
    });

    describe('#person', function() {
      it('should update the person name', function(done) {
        req.query = {id: 1, email: 'admin@musichero.foo'};
        var res = {
          json: function(result) {
            person_id = test_util.check_result(result, 'person');
            done();
          }
        };
        routes.putPersonTable(req, res);
      });

      it('should get the person', function(done) {
        var expected = {
          id: 1,
          name: 'admin',
          full_name: 'System Admin User',
          email: 'admin@musichero.foo',
          system_admin: true
        };
        dbh.person().getById(1, function(result) {
          test_util.check_item(result, expected, 'person', ['id', 'name', 'full_name', 'email', 'system_admin']);
          done();
        });
      });
    });

    describe('#password', function() {
      var old_password = 'admin';
      var new_password = 'xyzzy';
      var change_token;

      before(function(done) {
        var pem = util.get_pem_file('crypto/rsa_public.pem');
        var ct = JSON.stringify([old_password, new_password]);
        change_token = encodeURIComponent(util.encrypt(pem, ct));
        done();
      });

      before(function(done) {
        var pem = util.get_pem_file('crypto/rsa_public.pem');
        dbh.person().update({
          id: 1,
          password: util.encrypt(pem, old_password)
        }, function(result) {
          if (result.err) {
            throw new Error(result.err);
          }
          done();
        });
      });

      it('should update the password', function(done) {
        req.query = {id: 1, token: change_token};
        var res = {
          json: function(result) {
            person_id = test_util.check_result(result, 'person');
            done();
          }
        };
        routes.putPersonTable(req, res);
      });

      it('should get the new password', function(done) {
        var expected = {id: 1, password: new_password};
        dbh.person().getById(1, function(result) {
          var pem = util.get_pem_file('crypto/rsa_private.pem');
          result.person.password = util.decrypt(pem, result.person.password);
          test_util.check_item(result, expected, 'person', ['id', 'password']);
          done();
        });
      });

      it('should reject the new password because old password is wrong', function(done) {
        req.query = {id: 1, token: change_token};
        var res = {
          json: function(result) {
            should.exist(result);
            result.should.have.property('err');
            result.err.should.eql('Old password did not match');
            done();
          }
        };
        routes.putPersonTable(req, res);
      });

      it('should get the new password', function(done) {
        var expected = {id: 1, password: new_password};
        dbh.person().getById(1, function(result) {
          var pem = util.get_pem_file('crypto/rsa_private.pem');
          result.person.password = util.decrypt(pem, result.person.password);
          test_util.check_item(result, expected, 'person', ['id', 'password']);
          done();
        });
      });

      it('should update the password again', function(done) {
        var pem = util.get_pem_file('crypto/rsa_public.pem');
        var ct = JSON.stringify([new_password, old_password]);
        var new_change_token = encodeURIComponent(util.encrypt(pem, ct));
        req.query = {id: 1, token: new_change_token};
        var res = {
          json: function(result) {
            person_id = test_util.check_result(result, 'person');
            done();
          }
        };
        routes.putPersonTable(req, res);
      });

      it('should get the old password', function(done) {
        var expected = {id: 1, password: old_password};
        dbh.person().getById(1, function(result) {
          var pem = util.get_pem_file('crypto/rsa_private.pem');
          result.person.password = util.decrypt(pem, result.person.password);
          test_util.check_item(result, expected, 'person', ['id', 'password']);
          done();
        });
      });
    });

    describe('#artist', function() {
      it('should update the artist name', function(done) {
        req.query = {id: 1, name: 'Mott The Hoople'};
        var res = {
          json: function(result) {
            artist_id = test_util.check_result(result, 'artist');
            done();
          }
        };
        routes.putArtistTable(req, res);
      });

      it('should get the artist', function(done) {
        var expected = {id: 1, name: 'Mott The Hoople'};
        dbh.artist().getById(1, function(result) {
          test_util.check_item(result, expected, 'artist', ['id', 'name']);
          done();
        });
      });
    });

    describe('#song', function() {
      it('should update the song name', function(done) {
        req.query = {id: 1, name: 'Ziggy Stardust'};
        var res = {
          json: function(result) {
            song_id = test_util.check_result(result, 'song');
            done();
          }
        };
        routes.putSongTable(req, res);
      });

      it('should get the song', function(done) {
        var expected = {id: 1, name: 'Ziggy Stardust', artist_id: 5};
        dbh.song().getById(1, function(result) {
          test_util.check_item(result, expected, 'song', ['id', 'name', 'artist_id']);
          done();
        });
      });
    });

    describe('#band_member', function() {
      it('should update the band_member name', function(done) {
        req.query = {id: 1, band_admin: true};
        var res = {
          json: function(result) {
            band_member_id = test_util.check_result(result, 'band_member');
            done();
          }
        };
        routes.putBandMemberTable(req, res);
      });

      it('should get the band_member', function(done) {
        var expected = {id: 1, band_id: 1, person_id: 1, band_admin: true};
        dbh.band_member().getById(1, function(result) {
          test_util.check_item(result, expected, 'band_member', ['id', 'band_id', 'person_id', 'band_admin']);
          done();
        });
      });
    });

    describe('#band_song', function() {
      it('should update the band_song name', function(done) {
        req.query = {id: 1, song_status: 2};
        var res = {
          json: function(result) {
            band_song_id = test_util.check_result(result, 'band_song');
            done();
          }
        };
        routes.putBandSongTable(req, res);
      });

      it('should get the band_song', function(done) {
        var expected = {id: 1, band_id: 1, song_id: 1, song_status: 2};
        dbh.band_song().getById(1, function(result) {
          test_util.check_item(result, expected, 'band_song', ['id', 'band_id', 'song_id', 'song_status']);
          done();
        });
      });
    });

    describe('#song_rating', function() {
      it('should update the song_rating name', function(done) {
        req.query = {id: 1, rating: 2};
        var res = {
          json: function(result) {
            song_rating_id = test_util.check_result(result, 'song_rating');
            done();
          }
        };
        routes.putSongRatingTable(req, res);
      });

      it('should get the song_rating', function(done) {
        var expected = {id: 1, band_member_id: 1, band_song_id: 1, rating: 2};
        dbh.song_rating().getById(1, function(result) {
          test_util.check_item(result, expected, 'song_rating', ['id', 'band_member_id', 'band_song_id', 'rating']);
          done();
        });
      });
    });
  });

  describe('#delete', function() {
    describe('#band_song', function() {
      it('should get the band_song', function(done) {
        dbh.band_song().getById(5, function(result) {
          should.exist(result);
          result.should.have.property('band_song');
          done();
        });
      });

      it('should delete the band_song', function(done) {
        req.query = {id: 5};
        var res = {
          json: function(result) {
            band_song_id = test_util.check_result(result, 'band_song');
            done();
          }
        };
        routes.deleteBandSongTable(req, res);
      });

      it('should not get the band_song', function(done) {
        dbh.band_song().getById(5, function(result) {
          should.exist(result);
          result.should.not.have.property('band_song');
          done();
        });
      });
    });

    describe('#band_member', function() {
      it('should get the band_member', function(done) {
        dbh.band_member().getById(5, function(result) {
          should.exist(result);
          result.should.have.property('band_member');
          done();
        });
      });

      it('should delete the band_member', function(done) {
        req.query = {id: 5};
        var res = {
          json: function(result) {
            band_member_id = test_util.check_result(result, 'band_member');
            done();
          }
        };
        routes.deleteBandMemberTable(req, res);
      });

      it('should not get the band_member', function(done) {
        dbh.band_member().getById(5, function(result) {
          should.exist(result);
          result.should.not.have.property('band_member');
          done();
        });
      });
    });

    describe('#song', function() {
      it('should get the song', function(done) {
        dbh.song().getById(7, function(result) {
          should.exist(result);
          result.should.have.property('song');
          done();
        });
      });

      it('should delete the song', function(done) {
        req.query = {id: 7};
        var res = {
          json: function(result) {
            song_id = test_util.check_result(result, 'song');
            done();
          }
        };
        routes.deleteSongTable(req, res);
      });

      it('should not get the song', function(done) {
        dbh.song().getById(7, function(result) {
          should.exist(result);
          result.should.not.have.property('song');
          done();
        });
      });
    });

    describe('#band', function() {
      before(function(done) {
        dbh.band_member().getAllWithArgs({ where: { band_id: 4}}, function(result) {
          result.all_band_members.forEach(function(band_member) {
            dbh.band_member().deleteById(band_member.id, function(dres) {
              should.exist(dres);
              dres.should.not.have.property('err');
            });
          });
          done();
        });
      });

      before(function(done) {
        dbh.band_song().getAllWithArgs({ where: { band_id: 4}}, function(result) {
          result.all_band_songs.forEach(function(band_song) {
            dbh.band_song().deleteById(band_song.id, function(dres) {
              should.exist(dres);
              dres.should.not.have.property('err');
            });
          });
          done();
        });
      });

      it('should get the band', function(done) {
        dbh.band().getById(4, function(result) {
          should.exist(result);
          result.should.have.property('band');
          done();
        });
      });

      it('should delete the band', function(done) {
        req.query = {id: 4};
        var res = {
          json: function(result) {
            band_id = test_util.check_result(result, 'band');
            done();
          }
        };
        routes.deleteBandTable(req, res);
      });

      it('should not get the band', function(done) {
        dbh.band().getById(4, function(result) {
          should.exist(result);
          result.should.not.have.property('band');
          done();
        });
      });
    });

    describe('#person', function() {
      before(function(done) {
        dbh.band_member().getAllWithArgs({ where: { person_id: 4}}, function(result) {
          result.all_band_members.forEach(function(band_member) {
            dbh.band_member().deleteById(band_member.id, function(dres) {
              should.exist(dres);
              dres.should.not.have.property('err');
            });
          });
          done();
        });
      });

      it('should get the person', function(done) {
        dbh.person().getById(4, function(result) {
          should.exist(result);
          result.should.have.property('person');
          done();
        });
      });

      it('should delete the person', function(done) {
        req.query = {id: 4};
        var res = {
          json: function(result) {
            person_id = test_util.check_result(result, 'person');
            done();
          }
        };
        routes.deletePersonTable(req, res);
      });

      it('should not get the person', function(done) {
        dbh.person().getById(4, function(result) {
          should.exist(result);
          result.should.not.have.property('person');
          done();
        });
      });
    });

    describe('#artist', function() {
      before(function(done) {
        dbh.song().getAllWithArgs({ where: { artist_id: 3}}, function(result) {
          result.all_songs.forEach(function(song) {
            dbh.song().deleteById(song.id, function(dres) {
              should.exist(dres);
              dres.should.not.have.property('err');
            });
          });
          done();
        });
      });

      it('should get the artist', function(done) {
        dbh.artist().getById(3, function(result) {
          should.exist(result);
          result.should.have.property('artist');
          done();
        });
      });

      it('should delete the artist', function(done) {
        req.query = {id: 3};
        var res = {
          json: function(result) {
            artist_id = test_util.check_result(result, 'artist');
            done();
          }
        };
        routes.deleteArtistTable(req, res);
      });

      it('should not get the artist', function(done) {
        dbh.artist().getById(3, function(result) {
          should.exist(result);
          result.should.not.have.property('artist');
          done();
        });
      });
    });
  });

  describe('route_encryption', function() {
    var original_text = 'Plover is a shore bird';
    var pub_pem;
    var parsed_pem;
    var pubkey;
    var encrypted;

    before(function(done) {
      pub_pem = util.get_pem_file('crypto/rsa_public.pem');
      parsed_pem = util.parse_pem(pub_pem);
      done();
    });

    it('should get the public key', function(done) {
      req.query = {action: 'pubkey'};
      var res = {
        json: function(result) {
          should.exist(result);
          result.should.have.property('public_key');
          result.public_key.should.eql(parsed_pem);
          pubkey = result.public_key;
          done();
        }
      };
      encryption.encryption(req, res);
    });

    it('should check the encrypted value', function(done) {
      encrypted = util.encrypt(pub_pem, 'Plover');
      req.query = {action: 'check', clear: 'Plover', encrypted: encrypted};
      var res = {
        json: function(result) {
          should.exist(result);
          result.should.have.property('match');
          result.match.should.eql(true);
          done();
        }
      };
      encryption.encryption(req, res);
    });
  });
});

describe('request_routes', function() {
  var dbh;
  before(function(done) {
    db.setDbPath('./bombay_test.db');
    db_orm.setDBName('bombay_test.db');
    dbh = new db.Handle()
    var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
    dbh.doSqlExec([sql], done);
  });

  before(function(done) {
    var sql_cmds = [
      'INSERT INTO band (id, name) VALUES (1, \'Wild At Heart\');',
      'INSERT INTO person (id, name, full_name) VALUES (3, \'bbunny\', \'Bugs Bunny\');',
      'INSERT INTO person (id, name, full_name) VALUES (2, \'efudd\', \'Elmer Fudd\');',
      'INSERT INTO person (id, name, full_name) VALUES (4, \'dduck\', \'Daffy Duck\');',
      'INSERT INTO person (id, name, full_name) VALUES (5, \'tbird\', \'Tweety Bird\');',
      'INSERT INTO person (id, name, full_name) VALUES (6, \'scat\', \'Sylvester Cat\');',
      'INSERT INTO band_member (id, band_id, person_id, band_admin) VALUES (1, 1, 3, 1);',
    ];
    var sql = sql_cmds.join('\n');
    dbh.doSqlExec(sql, function(err) {
      done();
    });
  });

  var req;
  beforeEach(function(done) {
    req = {
      session: {
        passport: {
          user: JSON.stringify({ id: 3, system_admin: false })
        }
      },
      query: {
      },
      params: {
      },
    };
    done();
  });

  var res;
  beforeEach(function(done) {
    res = {
      json: function(result) {
        done('No JSON function set');
      }
    };
    done();
  });

  it('should not find a matching band_member', function(done) {
    dbh.band_member().getAllWithArgs({
      where: { band_id: 1, person_id: 2}
    }, function(result) {
      should.exist(result);
      result.should.have.property('all_band_members');
      result.all_band_members.should.eql([]);
      done();
    });
  });

  it('attempt to create a join request should fail', function(done) {
    req.body = {band_id: 1, person_id: 2, action: 'join_band'};
    var res = {
      json: function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Join requests can only be for logged in user');
        done();
      }
    };
    routes.createRequest(req, res);
  });

  var all_request_ids = [];
  var request_id;
  it('should create a join request', function(done) {
    req.body = {band_id: 1, person_id: 2, action: 'join_band'};
    req.session.passport.user = JSON.stringify({ id: 2, system_admin: false })
    var res = {
      json: function(result) {
        should.exist(result);
        result.should.not.have.property('err');
        result.should.have.property('request');
        result.request.should.have.property('id');
        request_id = result.request.id;
        all_request_ids.push(request_id);
        done();
      }
    };
    routes.createRequest(req, res);
  });

  it('should not find a matching band_member', function(done) {
    dbh.band_member().getAllWithArgs({
      where: { band_id: 1, person_id: 2}
    }, function(result) {
      should.exist(result);
      result.should.have.property('all_band_members');
      result.all_band_members.should.eql([]);
      done();
    });
  });

  var last_req;
  var now = new Date();
  it('should get the request', function(done) {
    var expected = {
      id: request_id,
      description: 'Elmer Fudd is asking to join Wild At Heart',
      request_type: constants.request_type.join_band,
      status: constants.request_status.pending,
      band_id: 1,
      person_id: 2,
    };
    req.query = {id: request_id};
    var res = {
      json: function(result) {
        test_util.check_request(result, expected, now);
        last_req = result.request;
        done();
      }
    };
    routes.getRequest(req, res);
  });

  it('should reject the request', function(done) {
    var expected = {
      id: request_id,
      description: 'Elmer Fudd is asking to join Wild At Heart',
      request_type: constants.request_type.join_band,
      status: constants.request_status.rejected,
      band_id: 1,
      person_id: 2,
    };
    req.query = {id: request_id, action: 'reject'};
    req.session.passport.user = JSON.stringify({ id: 3, system_admin: false })
    var res = {
      json: function(result) {
        test_util.check_request(result, expected, now);
        done();
      }
    };
    routes.updateRequest(req, res);
  });

  it('should not find a matching band_member', function(done) {
    dbh.band_member().getAllWithArgs({
      where: { band_id: 1, person_id: 2}
    }, function(result) {
      should.exist(result);
      result.should.have.property('all_band_members');
      result.all_band_members.should.eql([]);
      done();
    });
  });

  it('should reopen the request', function(done) {
    var expected = {
      id: request_id,
      description: 'Elmer Fudd is asking to join Wild At Heart',
      request_type: constants.request_type.join_band,
      status: constants.request_status.pending,
      band_id: 1,
      person_id: 2,
    };
    req.query = {id: request_id, action: 'reopen'};
    req.session.passport.user = JSON.stringify({ id: 2, system_admin: false })
    var res = {
      json: function(result) {
        test_util.check_request(result, expected, now);
        done();
      }
    };
    routes.updateRequest(req, res);
  });

  it('should not find a matching band_member', function(done) {
    dbh.band_member().getAllWithArgs({
      where: { band_id: 1, person_id: 2}
    }, function(result) {
      should.exist(result);
      result.should.have.property('all_band_members');
      result.all_band_members.should.eql([]);
      done();
    });
  });

  it('should accept the request', function(done) {
    var expected = {
      id: request_id,
      description: 'Elmer Fudd is asking to join Wild At Heart',
      request_type: constants.request_type.join_band,
      status: constants.request_status.accepted,
      band_id: 1,
      person_id: 2,
    };
    req.query = {id: request_id, action: 'accept'};
    req.session.passport.user = JSON.stringify({ id: 3, system_admin: false })
    var res = {
      json: function(result) {
        test_util.check_request(result, expected, now);
        done();
      }
    };
    routes.updateRequest(req, res);
  });

  it('should find a matching band_member', function(done) {
    var expected = [{
      band_id: 1,
      person_id: 2,
      band_admin: false
    }];
    dbh.band_member().getAllWithArgs({
      where: { band_id: 1, person_id: 2}
    }, function(result) {
      test_util.check_list(
        result, expected, 'all_band_members',
        ['band_id', 'person_id', 'band_admin']
      );
      done();
    });
  });

  it('should not find a matching band_member', function(done) {
    dbh.band_member().getAllWithArgs({
      where: { band_id: 1, person_id: 4}
    }, function(result) {
      should.exist(result);
      result.should.have.property('all_band_members');
      result.all_band_members.should.eql([]);
      done();
    });
  });

  it('should fail attempting to create an add member request', function(done) {
    req.body = {band_id: 1, person_id: 4, action: 'add_band_member'};
    req.session.passport.user = JSON.stringify({ id: 2, system_admin: false })
    var res = {
      json: function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Only band Admin may add members');
        done();
      }
    };
    routes.createRequest(req, res);
  });

  it('should create an add member request', function(done) {
    req.body = {band_id: 1, person_id: 4, action: 'add_band_member'};
    req.session.passport.user = JSON.stringify({ id: 3, system_admin: false })
    var res = {
      json: function(result) {
        should.exist(result);
        result.should.not.have.property('err');
        result.should.have.property('request');
        result.request.should.have.property('id');
        request_id = result.request.id;
        all_request_ids.push(request_id);
        done();
      }
    };
    routes.createRequest(req, res);
  });

  it('should not find a matching band_member', function(done) {
    dbh.band_member().getAllWithArgs({
      where: { band_id: 1, person_id: 4}
    }, function(result) {
      should.exist(result);
      result.should.have.property('all_band_members');
      result.all_band_members.should.eql([]);
      done();
    });
  });

  it('should get the request', function(done) {
    var expected = {
      id: request_id,
      description: 'Wild At Heart is inviting Daffy Duck to join',
      request_type: constants.request_type.add_band_member,
      status: constants.request_status.pending,
      band_id: 1,
      person_id: 4,
    };
    req.query = {id: request_id};
    var res = {
      json: function(result) {
        test_util.check_request(result, expected, now);
        last_req = result.request;
        done();
      }
    };
    routes.getRequest(req, res);
  });

  it('should not find a matching band_member', function(done) {
    dbh.band_member().getAllWithArgs({
      where: { band_id: 1, person_id: 4}
    }, function(result) {
      should.exist(result);
      result.should.have.property('all_band_members');
      result.all_band_members.should.eql([]);
      done();
    });
  });

  it('should accept the request', function(done) {
    var expected = {
      id: request_id,
      description: 'Wild At Heart is inviting Daffy Duck to join',
      request_type: constants.request_type.add_band_member,
      status: constants.request_status.accepted,
      band_id: 1,
      person_id: 4,
    };
    req.query = {id: request_id, action: 'accept'};
    req.session.passport.user = JSON.stringify({ id: 4, system_admin: false })
    var res = {
      json: function(result) {
        test_util.check_request(result, expected, now);
        done();
      }
    };
    routes.updateRequest(req, res);
  });

  it('should find a matching band_member', function(done) {
    var expected = [{
      band_id: 1,
      person_id: 4,
      band_admin: false
    }];
    dbh.band_member().getAllWithArgs({
      where: { band_id: 1, person_id: 4}
    }, function(result) {
      test_util.check_list(
        result, expected, 'all_band_members',
        ['band_id', 'person_id', 'band_admin']
      );
      done();
    });
  });

  it('should create a request to add Tweety Bird to Wild At Heart', function(done) {
    request.addBandMember({band_id: 1, person_id: 5}, function(result) {
      should.exist(result);
      result.should.not.have.property('err');
      result.should.have.property('request');
      result.request.should.have.property('id');
      all_request_ids.push(result.request.id);
      done();
    });
  });

  it('should create a request for Sylvester Cat to join Wild At Heart', function(done) {
    request.joinBand({band_id: 1, person_id: 6}, function(result) {
      should.exist(result);
      result.should.not.have.property('err');
      result.should.have.property('request');
      result.request.should.have.property('id');
      all_request_ids.push(result.request.id);
      done();
    });
  });

  it('should get the requests', function(done) {
    var expected = [{
      id: all_request_ids[0],
      description: 'Elmer Fudd is asking to join Wild At Heart',
      request_type: constants.request_type.join_band,
      status: constants.request_status.accepted,
      band_id: 1,
      person_id: 2,
    }, {
      id: all_request_ids[3],
      description: 'Sylvester Cat is asking to join Wild At Heart',
      request_type: constants.request_type.join_band,
      status: constants.request_status.pending,
      band_id: 1,
      person_id: 6,
    }, {
      id: all_request_ids[1],
      description: 'Wild At Heart is inviting Daffy Duck to join',
      request_type: constants.request_type.add_band_member,
      status: constants.request_status.accepted,
      band_id: 1,
      person_id: 4,
    }, {
      id: all_request_ids[2],
      description: 'Wild At Heart is inviting Tweety Bird to join',
      request_type: constants.request_type.add_band_member,
      status: constants.request_status.pending,
      band_id: 1,
      person_id: 5,
    }];
    var res = {
      json: function(result) {
        test_util.check_request_list(result.all_requests, expected, now);
        done();
      }
    };
    routes.getRequest(req, res);
  });
});
