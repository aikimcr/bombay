var should = require('should');
var fs = require('fs');
var base64_encode = require('base64').encode;

var test_util = require('test/lib/util');

var db_orm = require('lib/db_orm');
var constants = require('lib/constants');
var encryption = require('routes/encryption');
var request = require('lib/request');
var routes = require('routes/db');
var util = require('lib/util');
var constants = require('lib/constants');

describe('routes', function() {
  before(function(done) { test_util.db.resetDb(done); });

  before(function(done) {
    test_util.db.loadSql([
      {file: './test/support/addBands.sql'},
      {file: './test/support/addPeople.sql'},
      {file: './test/support/addBandMembers.sql'},
      {file: './test/support/addArtists.sql'},
      {file: './test/support/addSongs.sql'},
      {file: './test/support/addBandSongs.sql'},

      // Blow away the defaults and add some predictable ones.
      {file: './test/support/addSongRatings.sql'},
    ], done);
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
          json: function(result_code, result) {
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
          json: function(result_code, result) {
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
          email: 'aposer@wannabe.net',
          system_admin: false
        }, {
          id: 3,
          name: 'ddrums',
          full_name: 'Danny Drums',
          email: 'ddrums@musichero.foo',
          system_admin: false
        }, {
          id: 4,
          name: 'jguitar',
          full_name: 'Johnny Guitar',
          email: 'jguitar@musichero.foo',
          system_admin: false
        }, {
          id: 5,
          name: 'kkeys',
          full_name: 'Kevin Keys',
          email: 'kkeys@musichero.foo',
          system_admin: false
        }, {
          id: 1,
          name: 'admin',
          full_name: 'System Admin User',
          email: 'admin@allnightmusic.com',
          system_admin: true
        }];
        var res = {
          json: function(result_code, result) {
            test_util.check_list(result, expected, 'all_persons', ['id', 'name', 'full_name', 'email', 'system_admin']);
            result.all_persons.forEach(function(person) {
              person.should.not.have.property('password');
            });
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
          email: 'admin@allnightmusic.com',
          system_admin: true
        };
        req.query.id = 1;
        var res = {
          json: function(result_code, result) {
            test_util.check_item(result, expected, 'person', ['id', 'name', 'full_name', 'email', 'system_admin']);
            result.person.should.not.have.property('password');
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
          json: function(result_code, result) {
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
          json: function(result_code, result) {
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
          json: function(result_code, result) {
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
          json: function(result_code, result) {
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
          json: function(result_code, result) {
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
          json: function(result_code, result) {
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
          id: 1,
          band_id: 1,
          song_id: 1,
          song_status: 4,
          primary_vocal_id: 1,
          secondary_vocal_id: null
        }, {
          id: 2,
          band_id: 1,
          song_id: 2,
          song_status: 2,
          primary_vocal_id: null,
          secondary_vocal_id: null
        }, {
          id: 3,
          band_id: 1,
          song_id: 3,
          song_status: 3,
          primary_vocal_id: 1,
          secondary_vocal_id: 2
        }, {
          id: 4,
          band_id: 1,
          song_id: 4,
          song_status: 1,
          primary_vocal_id: 1,
          secondary_vocal_id: null
        }, {
          id: 5,
          band_id: 1,
          song_id: 5,
          song_status: -1,
          primary_vocal_id: 1,
          secondary_vocal_id: null
        }];
        var res = {
          json: function(result_code, result) {
            test_util.check_list(result, expected, 'all_band_songs', [
              'id',
              'band_id',
              'song_id',
              'song_status',
              'primary_vocal_id',
              'secondary_vocal_id'
            ]);
            done();
          }
        };
        routes.getBandSongTable(req, res);
      });

      it('should return band_song with id 1', function(done) {
        var expected = {
          id: 1,
          band_id: 1,
          song_id: 1,
          song_status: 4,
          primary_vocal_id: 1,
          secondary_vocal_id: null
        };
        req.query.id = 1;
        var res = {
          json: function(result_code, result) {
            test_util.check_item(result, expected, 'band_song', [
              'id',
              'band_id',
              'song_id',
              'song_status',
              'primary_vocal_id',
              'secondary_vocal_id'
            ]);
            done();
          }
        };
        routes.getBandSongTable(req, res);
      });
    });

    describe('#song_rating', function()  {
      it('should return all the song_ratings, sorted by band_member_id and band_song_id', function(done) {
        var expected = [{
          id: 1, band_member_id: 1, band_song_id: 1, rating: 1, is_new: true
        }, {
          id: 2, band_member_id: 1, band_song_id: 2, rating: 2, is_new: true
        }, {
          id: 3, band_member_id: 1, band_song_id: 3, rating: 3, is_new: true
        }, {
          id: 4, band_member_id: 1, band_song_id: 4, rating: 4, is_new: true
        }, {
          id: 5, band_member_id: 1, band_song_id: 5, rating: 5, is_new: true
        }, {
          id: 6, band_member_id: 2, band_song_id: 1, rating: 1, is_new: true
        }, {
          id: 7, band_member_id: 2, band_song_id: 2, rating: 3, is_new: true
        }, {
          id: 8, band_member_id: 2, band_song_id: 3, rating: 3, is_new: true
        }, {
          id: 9, band_member_id: 2, band_song_id: 4, rating: 3, is_new: true
        }, {
          id: 10, band_member_id: 2, band_song_id: 5, rating: 5, is_new: true
        }];
        var res = {
          json: function(result_code, result) {
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
          json: function(result_code, result) {
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
          json: function(result_code, result) {
            band_id = test_util.check_result(result, 'band', req.body);
            done();
          }
        };
        routes.postBandTable(req, res);
      });

      it('should return an error', function(done) {
        req.body = {name: 'Cover Story'};
        var res = {
          json: function(result_code, result) {
            var error = test_util.check_error_result(result_code, result, 500);
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
          json: function(result_code, result) {
            delete req.body.password;
            person_id = test_util.check_result(result, 'person', req.body);
            done();
          }
        };
        routes.postPersonTable(req, res);
      });

      it('should encrypt the password', function(done) {
        db_orm.Person.get(person_id, function(err, row) {
          should.not.exist(err);
          row.password.should.not.eql('clave');
          var pem = util.get_pem_file('crypto/rsa_private.pem');
          var password = util.decrypt(pem, row.password);
          password.should.eql('clave');
          done();
        });
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
          json: function(result_code, result) {
            var error = test_util.check_error_result(result_code, result, 500);
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
          json: function(result_code, result) {
            artist_id = test_util.check_result(result, 'artist', req.body);
            done();
          }
        };
        routes.postArtistTable(req, res);
      });

      it('should return an error', function(done) {
        req.body = {name: 'Mott the Hoople'};
        var res = {
          json: function(result_code, result) {
            var error = test_util.check_error_result(result_code, result, 500);
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
          json: function(result_code, result) {
            song_id = test_util.check_result(result, 'song', req.body);
            done();
          }
        };
        routes.postSongTable(req, res);
      });

      it('should return an error', function(done) {
        req.body = {name: 'La Grange', artist_id: 2};
        var res = {
          json: function(result_code, result) {
            var error = test_util.check_error_result(result_code, result, 500);
            done();
          }
        };
        routes.postSongTable(req, res);
      });
    });

    describe('#band_member', function() {
      var band_member_id;
      it('should create a band_member', function(done) {
        req.body = {band_id: 3, person_id: 1, band_admin: false};
        var res = {
          json: function(result_code, result) {
            band_member_id = test_util.check_result(result, 'band_member', req.body);
            done();
          }
        };
        routes.postBandMemberTable(req, res);
      });

      it('should return an error', function(done) {
        req.body = {band_id: 3, person_id: 1};
        var res = {
          json: function(result_code, result) {
            var error = test_util.check_error_result(result_code, result, 500);
            done();
          }
        };
        routes.postBandMemberTable(req, res);
      });
    });

    describe('#band_song', function() {
      var band_song_id;
      it('should create a band_song', function(done) {
        req.body = {
          band_id: 3,
          song_id: 1,
          key_signature: '',
          song_status: 3,
          primary_vocal_id: 3,
          secondary_vocal_id: 4
        };
        var res = {
          json: function(result_code, result) {
            band_song_id = test_util.check_result(result, 'band_song', req.body);
            should.exist(result.song_ratings);
            result.song_ratings.length.should.eql(3);
            test_util.check_rows(result.song_ratings, [{
              rating: 3,
              id: 11,
              band_member_id: 7,
              band_song_id: band_song_id,
              is_new: true
            }, {
              rating: 3,
              id: 12,
              band_member_id: 3,
              band_song_id: band_song_id,
              is_new: true
            }, {
              rating: 3,
              id: 13,
              band_member_id: 6,
              band_song_id: band_song_id,
              is_new: true
            }], ['rating']);
            done();
          }
        };
        routes.postBandSongTable(req, res);
      });

      it('should return an error', function(done) {
        req.body = {
          band_id: 3,
          song_id: 1,
          key_signature: '',
          song_status: 4,
          primary_vocal_id: 3,
          secondary_vocal_id: 4
        };
        var res = {
          json: function(result_code, result) {
            var error = test_util.check_error_result(result_code, result, 500);
            done();
          }
        };
        routes.postBandSongTable(req, res);
      });
    });

    describe('#song_rating', function() {
      var song_rating_id;
      it('should create a song_rating', function(done) {
        req.body = {band_member_id: 3, band_song_id: 1, rating: 3, is_new: true};
        var res = {
          json: function(result_code, result) {
            song_rating_id = test_util.check_result(result, 'song_rating', req.body);
            done();
          }
        };
        routes.postSongRatingTable(req, res);
      });

      it('should return an error', function(done) {
        req.body = {band_member_id: 3, band_song_id: 1, rating: 4, is_new: true};
        var res = {
          json: function(result_code, result) {
            var error = test_util.check_error_result(result_code, result, 500);
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
          json: function(result_code, result) {
            band_id = test_util.check_result(result, 'band', req.query);
            done();
          }
        };
        routes.putBandTable(req, res);
      });

      it('should get the band', function(done) {
        var expected = {id: 1, name: 'Groove On The Side'};
        db_orm.Band.get(1, function(err, row) {
          should.not.exist(err);
          test_util.check_record(row, expected, ['id', 'name']);
          done();
        });
      });
    });

    describe('#person', function() {
      it('should update the person name', function(done) {
        req.query = {id: 1, email: 'admin@musichero.foo'};
        var res = {
          json: function(result_code, result) {
            person_id = test_util.check_result(result, 'person', req.query);
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
        db_orm.Person.get(1, function(err, row) {
          should.not.exist(err);
          test_util.check_record(row, expected, ['id', 'name', 'full_name', 'email', 'system_admin']);
          done();
        });
      });

      it('should update the person to be not system_admin', function(done) {
        req.query = {id: 1, system_admin: 'false', email: 'admin@musiczero.foo'};
        var expected = {id: 1, system_admin: false, email: 'admin@musiczero.foo'};
        var res = {
          json: function(result_code, result) {
            person_id = test_util.check_result(result, 'person', expected);
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
          email: 'admin@musiczero.foo',
          system_admin: false
        };
        db_orm.Person.get(1, function(err, row) {
          should.not.exist(err);
          test_util.check_record(row, expected, ['id', 'name', 'full_name', 'email', 'system_admin']);
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
        var ct = base64_encode(JSON.stringify([old_password, new_password]));
        change_token = encodeURIComponent(util.encrypt(pem, ct));
        done();
      });

      before(function(done) {
        var pem = util.get_pem_file('crypto/rsa_public.pem');
        db_orm.Person.get(1, function(err, row) {
          if (err) throw err;
          row.save({password: util.encrypt(pem, old_password)}, function(err) {
            if (err) throw err;
            done();
          });
        });
      });

      it('should update the password', function(done) {
        req.query = {id: 1, token: change_token};
        var res = {
          json: function(result_code, result) {
            should.exist(result_code);
            result_code.should.eql(200);
            person_id = test_util.check_result(result, 'person');
            result.person.should.have.property('password');
            done();
          }
        };
        routes.putPersonTable(req, res);
      });

      it('should get the new password', function(done) {
        db_orm.Person.get(1, function(err, row) {
          should.not.exist(err);
          var pem = util.get_pem_file('crypto/rsa_private.pem');
          var password = util.decrypt(pem, row.password);
          password.should.eql(new_password);
          done();
        });
      });

      it('should reject the new password because old password is wrong', function(done) {
        req.query = {id: 1, token: change_token};
        var res = {
          json: function(result_code, result) {
            should.exist(result_code);
            result_code.should.eql(500);
            should.exist(result);
            result.should.eql('Old password did not match');
            done();
          }
        };
        routes.putPersonTable(req, res);
      });

      it('should get the new password', function(done) {
        db_orm.Person.get(1, function(err, row) {
          should.not.exist(err);
          var pem = util.get_pem_file('crypto/rsa_private.pem');
          var password = util.decrypt(pem, row.password);
          password.should.eql(new_password);
          done();
        });
      });

      it('should update the password again', function(done) {
        var pem = util.get_pem_file('crypto/rsa_public.pem');
        var ct = base64_encode(JSON.stringify([new_password, old_password]));
        var new_change_token = encodeURIComponent(util.encrypt(pem, ct));
        req.query = {id: 1, token: new_change_token};
        var res = {
          json: function(result_code, result) {
            person_id = test_util.check_result(result, 'person');
            done();
          }
        };
        routes.putPersonTable(req, res);
      });

      it('should get the old password', function(done) {
        db_orm.Person.get(1, function(err, row) {
          should.not.exist(err);
          var pem = util.get_pem_file('crypto/rsa_private.pem');
          var password = util.decrypt(pem, row.password);
          password.should.eql(old_password);
          done();
        });
      });
    });

    describe('#artist', function() {
      it('should update the artist name', function(done) {
        req.query = {id: 1, name: 'Mott The Hoople'};
        var res = {
          json: function(result_code, result) {
            artist_id = test_util.check_result(result, 'artist');
            done();
          }
        };
        routes.putArtistTable(req, res);
      });

      it('should get the artist', function(done) {
        var expected = {id: 1, name: 'Mott The Hoople'};
        db_orm.Artist.get(1, function(err, row) {
          should.not.exist(err);
          test_util.check_record(row, expected, ['id', 'name']);
          done();
        });
      });
    });

    describe('#song', function() {
      it('should update the song name', function(done) {
        req.query = {id: 1, name: 'Ziggy Stardust'};
        var res = {
          json: function(result_code, result) {
            song_id = test_util.check_result(result, 'song');
            done();
          }
        };
        routes.putSongTable(req, res);
      });

      it('should get the song', function(done) {
        var expected = {id: 1, name: 'Ziggy Stardust', artist_id: 5};
        db_orm.Song.get(1, function(err, row) {
          should.not.exist(err);
          test_util.check_record(row, expected, ['id', 'name', 'artist_id']);
          done();
        });
      });
    });

    describe('#band_member', function() {
      it('should update the band_member name', function(done) {
        req.query = {id: 1, band_admin: true};
        var res = {
          json: function(result_code, result) {
            band_member_id = test_util.check_result(result, 'band_member');
            done();
          }
        };
        routes.putBandMemberTable(req, res);
      });

      it('should get the band_member', function(done) {
        var expected = {id: 1, band_id: 1, person_id: 1, band_admin: true};
        db_orm.BandMember.get(1, function(err, row) {
          should.not.exist(err);
          test_util.check_record(row, expected, ['id', 'band_id', 'person_id', 'band_admin']);
          done();
        });
      });
    });

    describe('#band_song', function() {
      it('should update the band_song name', function(done) {
        req.query = {id: 1, song_status: 2};
        var res = {
          json: function(result_code, result) {
            band_song_id = test_util.check_result(result, 'band_song');
            done();
          }
        };
        routes.putBandSongTable(req, res);
      });

      it('should get the band_song', function(done) {
        var expected = {
          id: 1,
          band_id: 1,
          song_id: 1,
          song_status: 2,
          primary_vocal_id: 1,
          secondary_vocal_id: null
        };
        db_orm.BandSong.get(1, function(err, row) {
          should.not.exist(err);
          test_util.check_record(row, expected, [
            'id',
            'band_id',
            'song_id',
            'song_status',
            'primary_vocal_id',
            'secondary_vocal_id'
          ]);
          done();
        });
      });
    });

    describe('#song_rating', function() {
      it('should update the song_rating name', function(done) {
        req.query = {id: 1, rating: 2};
        var res = {
          json: function(result_code, result) {
            song_rating_id = test_util.check_result(result, 'song_rating');
            done();
          }
        };
        routes.putSongRatingTable(req, res);
      });

      it('should get the song_rating', function(done) {
        var expected = {id: 1, band_member_id: 1, band_song_id: 1, rating: 2, is_new: false};
        db_orm.SongRating.get(1, function(err, row) {
          should.not.exist(err);
          test_util.check_record(row, expected, ['id', 'band_member_id', 'band_song_id', 'rating', 'is_new']);
          done();
        });
      });
    });
  });

  describe('#delete', function() {
    describe('#band_song', function() {
      it('should get the band_song', function(done) {
        db_orm.BandSong.get(5, function(err, row) {
          should.not.exist(err);
          should.exist(row);
          done();
        });
      });

      it('should delete the band_song', function(done) {
        req.query = {id: 5};
        var res = {
          json: function(result_code, result) {
            band_song_id = test_util.check_result(result, 'band_song');
            done();
          }
        };
        routes.deleteBandSongTable(req, res);
      });

      it('should not get the band_song', function(done) {
        db_orm.BandSong.get(5, function(err, row) {
          should.exist(err);
          err.should.have.property('message');
          var msg = err.message.toUpperCase();
          msg.should.eql('NOT FOUND');
          should.not.exist(row);
          done();
        });
      });
    });

    describe('#band_member', function() {
      it('should get the band_member', function(done) {
        db_orm.BandMember.get(5, function(err, row) {
          should.not.exist(err);
          should.exist(row);
          done();
        });
      });

      it('should delete the band_member', function(done) {
        req.query = {id: 5};
        var res = {
          json: function(result_code, result) {
            band_member_id = test_util.check_result(result, 'band_member');
            done();
          }
        };
        routes.deleteBandMemberTable(req, res);
      });

      it('should not get the band_member', function(done) {
        db_orm.BandMember.get(5, function(err, row) {
          should.exist(err);
          err.should.have.property('message');
          var msg = err.message.toUpperCase();
          msg.should.eql('NOT FOUND');
          should.not.exist(row);
          done();
        });
      });
    });

    describe('#song', function() {
      it('should get the song', function(done) {
        db_orm.Song.get(7, function(err, row) {
          should.not.exist(err);
          should.exist(row);
          done();
        });
      });

      it('should delete the song', function(done) {
        req.query = {id: 7};
        var res = {
          json: function(result_code, result) {
            song_id = test_util.check_result(result, 'song');
            done();
          }
        };
        routes.deleteSongTable(req, res);
      });

      it('should not get the song', function(done) {
        db_orm.Song.get(7, function(err, row) {
          should.exist(err);
          err.should.have.property('message');
          var msg = err.message.toUpperCase();
          msg.should.eql('NOT FOUND');
          should.not.exist(row);
          done();
        });
      });
    });

    describe('#band', function() {
      before(function(done) {
        db_orm.BandMember.find({band_id: 4}).remove(function(err) {
          if (err) throw err;
          done();
        });
      });

      before(function(done) {
        db_orm.BandSong.find({band_id: 4}).remove(function(err) {
          if (err) throw err;
          done();
        });
      });

      it('should get the band', function(done) {
        db_orm.Band.get(4, function(err, row) {
          should.not.exist(err);
          should.exist(row);
          done();
        });
      });

      it('should delete the band', function(done) {
        req.query = {id: 4};
        var res = {
          json: function(result_code, result) {
            band_id = test_util.check_result(result, 'band');
            done();
          }
        };
        routes.deleteBandTable(req, res);
      });

      it('should not get the band', function(done) {
        db_orm.Band.get(4, function(err, row) {
          should.exist(err);
          err.should.have.property('message');
          var msg = err.message.toUpperCase();
          msg.should.eql('NOT FOUND');
          should.not.exist(row);
          done();
        });
      });
    });

    describe('#person', function() {
      before(function(done) {
        db_orm.BandMember.find({person_id: 4}).remove(function(err) {
          if (err) throw err;
          done();
        });
      });

      it('should get the person', function(done) {
        db_orm.Person.get(4, function(err, row) {
          should.not.exist(err);
          should.exist(row);
          done();
        });
      });

      it('should delete the person', function(done) {
        req.query = {id: 4};
        var res = {
          json: function(result_code, result) {
            person_id = test_util.check_result(result, 'person');
            done();
          }
        };
        routes.deletePersonTable(req, res);
      });

      it('should not get the person', function(done) {
        db_orm.Person.get(4, function(err, row) {
          should.exist(err);
          err.should.have.property('message');
          var msg = err.message.toUpperCase();
          msg.should.eql('NOT FOUND');
          should.not.exist(row);
          done();
        });
      });
    });

    describe('#artist', function() {
      before(function(done) {
        db_orm.Song.find({artist_id: 3}).remove(function(err) {
          if (err) throw err;
          done();
        });
      });

      it('should get the artist', function(done) {
        db_orm.Artist.get(3, function(err, row) {
          should.not.exist(err);
          should.exist(row);
          done();
        });
      });

      it('should delete the artist', function(done) {
        req.query = {id: 3};
        var res = {
          json: function(result_code, result) {
            artist_id = test_util.check_result(result, 'artist');
            done();
          }
        };
        routes.deleteArtistTable(req, res);
      });

      it('should not get the artist', function(done) {
        db_orm.Artist.get(3, function(err, row) {
          should.exist(err);
          err.should.have.property('message');
          var msg = err.message.toUpperCase();
          msg.should.eql('NOT FOUND');
          should.not.exist(row);
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
        json: function(result_code, result) {
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
        json: function(result_code, result) {
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
  before(function(done) { test_util.db.resetDb(done); });

  before(function(done) {
    test_util.db.loadSql([
      'INSERT INTO band (id, name) VALUES (1, \'Wild At Heart\');',
      'INSERT INTO person (id, name, full_name) VALUES (3, \'bbunny\', \'Bugs Bunny\');',
      'INSERT INTO person (id, name, full_name) VALUES (2, \'efudd\', \'Elmer Fudd\');',
      'INSERT INTO person (id, name, full_name) VALUES (4, \'dduck\', \'Daffy Duck\');',
      'INSERT INTO person (id, name, full_name) VALUES (5, \'tbird\', \'Tweety Bird\');',
      'INSERT INTO person (id, name, full_name) VALUES (6, \'scat\', \'Sylvester Cat\');',
      'INSERT INTO band_member (id, band_id, person_id, band_admin) VALUES (1, 1, 3, 1);',
      'INSERT INTO artist (id, name) VALUES (1, \'Led Zeppelin\');',
      'INSERT INTO song (id, name, artist_id) VALUES (1, \'Rock-n-Roll\', 1);',
      'INSERT INTO song (id, name, artist_id) VALUES (2, \'Bron-Y-Aur\', 1);',
      'INSERT INTO band_song (id, band_id, song_id) VALUES (1, 1, 1);',
      'INSERT INTO band_song (id, band_id, song_id) VALUES (2, 1, 2);'
    ], done);
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
      json: function(result_code, result) {
        done('No JSON function set');
      }
    };
    done();
  });

  it('should not find a matching band_member', function(done) {
    db_orm.BandMember.count({band_id: 1, person_id: 2}, function(err, count) {
      should.not.exist(err);
      should.exist(count);
      count.should.eql(0);
      done();
    });
  });

  it('attempt to create a join request should fail', function(done) {
    req.params = {action: 'join_band'};
    req.body = {band_id: 1, person_id: 2};
    var res = {
      json: function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(500);
        should.exist(result);
        result.should.eql('Join requests can only be for logged in user');
        done();
      }
    };
    routes.createRequest(req, res);
  });

  var all_request_ids = [];
  var request_id;
  it('should create a join request', function(done) {
    req.params = {action: 'join_band'};
    req.body = {band_id: 1, person_id: 2};
    req.session.passport.user = JSON.stringify({ id: 2, system_admin: false })
    var res = {
      json: function(result_code, result) {
        should.exist(result);
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
    db_orm.BandMember.count({band_id: 1, person_id: 2}, function(err, count) {
      should.not.exist(err);
      should.exist(count);
      count.should.eql(0);
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
      json: function(result_code, result) {
        should.exist(result);
        result.should.have.property('request');
        test_util.check_request(null, result.request, expected, now);
        last_req = result;
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
    req.params = {action: 'reject'};
    req.query = {id: request_id};
    req.session.passport.user = JSON.stringify({ id: 3, system_admin: false })
    var res = {
      json: function(result_code, result) {
        should.exist(result);
        result.should.have.property('request');
        test_util.check_request(null, result.request, expected, now);
        done();
      }
    };
    routes.updateRequest(req, res);
  });

  it('should not find a matching band_member', function(done) {
    db_orm.BandMember.count({band_id: 1, person_id: 2}, function(err, count) {
      should.not.exist(err);
      should.exist(count);
      count.should.eql(0);
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
    req.params = {action: 'reopen'}
    req.query = {id: request_id};
    req.session.passport.user = JSON.stringify({ id: 2, system_admin: false })
    var res = {
      json: function(result_code, result) {
        should.exist(result);
        result.should.have.property('request');
        test_util.check_request(null, result.request, expected, now);
        done();
      }
    };
    routes.updateRequest(req, res);
  });

  it('should not find a matching band_member', function(done) {
    db_orm.BandMember.count({band_id: 1, person_id: 2}, function(err, count) {
      should.not.exist(err);
      should.exist(count);
      count.should.eql(0);
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
    req.params = {action: 'accept'};
    req.query = {id: request_id};
    req.session.passport.user = JSON.stringify({ id: 3, system_admin: false })
    var res = {
      json: function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.exist(result);
        result.should.have.property('request');
        test_util.check_request(null, result.request, expected, now);
        result.should.have.property('band_member');
        result.band_member.band_id.should.eql(1);
        result.band_member.person_id.should.eql(2);
        result.band_member.band_admin.should.eql(false);
        result.should.have.property('song_ratings');
        result.song_ratings.length.should.eql(2);
        test_util.check_rows(result.song_ratings, [{
          rating: 3, id: 3, band_member_id: 2, band_song_id: 1
        }, {
          rating: 3, id: 3, band_member_id: 2, band_song_id: 2
        }], ['rating']);
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
    db_orm.BandMember.find({ band_id: 1, person_id: 2}, function(err, rows) {
      should.not.exist(err);
      test_util.check_rows(rows, expected, ['band_id', 'person_id', 'band_admin']);
      done();
    });
  });

  it('should not find a matching band_member', function(done) {
    db_orm.BandMember.count({band_id: 1, person_id: 4}, function(err, count) {
      should.not.exist(err);
      should.exist(count);
      count.should.eql(0);
      done();
    });
  });

  it('should fail attempting to create an add member request', function(done) {
    req.params = {action: 'add_band_member'};
    req.body = {band_id: 1, person_id: 4};
    req.session.passport.user = JSON.stringify({ id: 2, system_admin: false })
    var res = {
      json: function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(500);
        should.exist(result);
        result.should.eql('Only band Admin may add members');
        done();
      }
    };
    routes.createRequest(req, res);
  });

  it('should create an add member request', function(done) {
    req.params = {action: 'add_band_member'};
    req.body = {band_id: 1, person_id: 4};
    req.session.passport.user = JSON.stringify({ id: 3, system_admin: false })
    var res = {
      json: function(result_code, result) {
        should.exist(result);
        result.should.have.property('request')
        result.request.should.have.property('id');
        request_id = result.request.id;
        all_request_ids.push(request_id);
        done();
      }
    };
    routes.createRequest(req, res);
  });

  it('should not find a matching band_member', function(done) {
    db_orm.BandMember.count({band_id: 1, person_id: 4}, function(err, count) {
      should.not.exist(err);
      should.exist(count);
      count.should.eql(0);
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
      json: function(result_code, result) {
        should.exist(result);
        result.should.have.property('request');
        test_util.check_request(null, result.request, expected, now);
        last_req = result.request;
        done();
      }
    };
    routes.getRequest(req, res);
  });

  it('should not find a matching band_member', function(done) {
    db_orm.BandMember.count({band_id: 1, person_id: 4}, function(err, count) {
      should.not.exist(err);
      should.exist(count);
      count.should.eql(0);
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
    req.params = {action: 'accept'};
    req.query = {id: request_id};
    req.session.passport.user = JSON.stringify({ id: 4, system_admin: false })
    var res = {
      json: function(result_code, result) {
        should.exist(result_code);
        result_code.should.eql(200);
        should.exist(result);
        result.should.have.property('request');
        test_util.check_request(null, result.request, expected, now);
        result.should.have.property('band_member');
        result.band_member.band_id.should.eql(1);
        result.band_member.person_id.should.eql(4);
        result.band_member.band_admin.should.eql(false);
        result.should.have.property('song_ratings');
        result.song_ratings.length.should.eql(2);
        test_util.check_rows(result.song_ratings, [{
          rating: 3, id: 5, band_member_id: 3, band_song_id: 1
        }, {
          rating: 3, id: 5, band_member_id: 3, band_song_id: 2
        }], ['rating']);
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
    db_orm.BandMember.find({ band_id: 1, person_id: 4}, function(err, rows) {
      should.not.exist(err);
      test_util.check_rows(rows, expected, ['band_id', 'person_id', 'band_admin']);
      done();
    });
  });

  it('should create a request to add Tweety Bird to Wild At Heart', function(done) {
    request.addBandMember({band_id: 1, person_id: 5}, function(err, result) {
      should.exist(result);
      result.should.have.property('id');
      all_request_ids.push(result.id);
      done();
    });
  });

  it('should create a request for Sylvester Cat to join Wild At Heart', function(done) {
    request.joinBand({band_id: 1, person_id: 6}, function(err, result) {
      should.exist(result);
      result.should.have.property('id');
      all_request_ids.push(result.id);
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
      json: function(result_code, result) {
        test_util.check_request_list(null, result.all_requests, expected, now);
        done();
      }
    };
    routes.getRequest(req, res);
  });
});
