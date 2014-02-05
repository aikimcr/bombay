var should = require('should');

var sqlite3 = require('sqlite3');
var fs = require('fs');

var test_util = require('test/lib/util');

var db = require('lib/db');
var dbh;

describe('artist_table', function() {
  describe('#GetLists', function() {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      dbh = new db.Handle()
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      dbh.doSqlExec([sql], done);
    });

    it('should insert some rows', function(done) {
      var sql = fs.readFileSync('./test/support/addArtists.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    var artist;
    it('should get the artist object', function(done) {
      artist = dbh.artist();
      should.exist(artist);
      done();
    });

    it('should get all the artists, sorted by name', function(done) {
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
      artist.getAll(function(result) {
        test_util.check_list(result, expected, 'all_artists', ['id', 'name']);
        done();
      });
    });
  });

  describe('#CreateAndUpdate', function() {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      dbh = new db.Handle()
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      dbh.doSqlExec([sql], done);
    });

    var artist;
    it('should get the artist object', function(done) {
      artist = dbh.artist();
      should.exist(artist);
      done();
    });

    var artist_id;
    it('should create the artist', function(done) {
      artist.create({name: 'Mott the Hoople'}, function(result) {
        artist_id = test_util.check_result(result, 'artist_id');
        done();
      });
    });

    it('should return an error message', function(done) {
      artist.create({name: 'Mott the Hoople'}, function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Artist \'Mott the Hoople\' already exists');
        done();
      });
    });

    it('should get the artist', function(done) {
      var expected = {id: artist_id, name: 'Mott the Hoople'};
      artist.getById(artist_id, function(result) {
        test_util.check_item(result, expected, 'artist', ['id', 'name']);
        done();
      });
    });

    it('should update the artist', function(done) {
      artist.update({id: artist_id, name: 'Britney Spears'}, function(result) {
        test_util.check_result(result, 'artist');
        done();
      });
    });

    it('should return an error message', function(done) {
      artist.update({id: artist_id + 1, name: 'Britney Spears'}, function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Artist \'Britney Spears\' already exists');
        done();
      });
    });

    it('should get the artist', function(done) {
      var expected = {id: artist_id, name: 'Britney Spears'};
      artist.getById(artist_id, function(result) {
        test_util.check_item(result, expected, 'artist', ['id', 'name']);
        done();
      });
    });

    it('should delete the artist', function(done) {
      artist.deleteById(artist_id, function(result) {
        should.exist(result);
        should.exist(result.artist);
        result.artist.should.eql(1);
        done();
      });
    });
  });
});
