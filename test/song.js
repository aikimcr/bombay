var should = require('should');

var sqlite3 = require('sqlite3');
var fs = require('fs');

var test_util = require('test/lib/util');

var db = require('lib/db');
var dbh;

describe('song_table', function() {
  describe('#GetLists', function() {
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

    it('should insert some rows', function(done) {
      var sql = fs.readFileSync('./test/support/addSongs.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    var song;
    it('should get the song object', function(done) {
      song = dbh.song();
      should.exist(song);
      done();
    });

    it('should get all the songs', function(done) {
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
      song.getAll(function(result) {
        test_util.check_list(result, expected, 'all_songs', ['id', 'name', 'artist_id']);
        done();
      });
    });

    it('should get all the songs by The Beatles', function(done) {
      var expected = [{
	id: 6, name: 'Help', artist_id: 4
      }, {
	id: 5, name: 'I Wanna Hold Your Hand', artist_id: 4
      }, {
	id: 4, name: 'Love Me Do', artist_id: 4
      }];
      song.getAllWithArgs({ where: { artist_id: 4 } }, function(result) {
        test_util.check_list(result, expected, 'all_songs', ['id', 'name', 'artist_id']);
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
    var other_song_id;
    it('should return an error message', function(done) {
      var data = {
        artist_id: 2
      };
      song.create(data, function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Song Create missing key(s): name');
        done();
      });
    });

    it('should return an error message', function(done) {
      var data = {
        name: 'La Grange',
      };
      song.create(data, function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Song Create missing key(s): artist_id');
        done();
      });
    });

    it('should return an error message', function(done) {
      var data = {
      };
      song.create(data, function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Song Create missing key(s): name,artist_id');
        done();
      });
    });

    it('should create the song', function(done) {
      var data = {
        name: 'La Grange',
        artist_id: 2,
      };
      song.create(data, function(result) {
        song_id = test_util.check_result(result, 'song_id');
        done();
      });
    });

    it('should return an error message', function(done) {
      var data = {
        name: 'La Grange',
        artist_id: 2,
      };
      song.create(data, function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Song \'La Grange\' by \'ZZ Top\' already exists');
        done();
      });
    });

    it('should create another song', function(done) {
      var data = {
        name: 'Precious and Grace',
        artist_id: 2,
      };
      song.create(data, function(result) {
        other_song_id = test_util.check_result(result, 'song_id');
        done();
      });
    });

    it('should create another song', function(done) {
      var data = {
        name: 'La Grange',
        artist_id: 1,
      };
      song.create(data, function(result) {
        other_song_id = test_util.check_result(result, 'song_id');
        done();
      });
    });

    it('should get the first song', function(done) {
      var expected = {
        id: song_id,
        name: 'La Grange',
        artist_id: 2,
      };
      song.getById(song_id, function(result) {
        test_util.check_item(result, expected, 'song', ['id', 'name', 'artist_id']);
        done();
      });
    });

    it('should update the song', function(done) {
      song.update({id: song_id, name: 'TV Dinners'}, function(result) {
        test_util.check_result(result, 'song');
        done();
      });
    });

    it('should return an error message', function(done) {
      song.update({id: other_song_id, name: 'TV Dinners', artist_id: 2}, function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Song \'TV Dinners\' by \'ZZ Top\' already exists');
        done();
      });
    });

    it('should get the song', function(done) {
      var expected = {
        id: song_id,
        name: 'TV Dinners',
        artist_id: 2,
      };
      song.getById(song_id, function(result) {
        test_util.check_item(result, expected, 'song', ['id', 'name', 'artist_id']);
        done();
      });
    });

    it('should delete the song', function(done) {
      song.deleteById(song_id, function(result) {
        should.exist(result);
        should.exist(result.song);
        result.song.should.eql(3);
        done();
      });
    });
  });
});
