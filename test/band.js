var should = require('should');

var sqlite3 = require('sqlite3');
var fs = require('fs');

var test_util = require('test/lib/util');

var db = require('lib/db');
var dbh;

describe('band_table', function() {
  describe('#GetLists', function() {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      dbh = new db.Handle()
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      dbh.doSqlExec([sql], done);
    });

    it('should load all the records into the db', function(done) {
      var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    var band;
    it('should get the band object', function(done) {
      band = dbh.band();
      should.exist(band);
      done();
    });

    it('should get all the bands sorted by name', function(done) {
      var expected = [{
	id: 4, name: 'Jazz Wild',
      }, {
	id: 2, name: 'Live! Dressed! Girls!',
      }, {
	id: 3, name: 'Sally Says Go',
      }, {
	id: 1, name: 'Wild At Heart',
      }];
      band.getAll(function(result) {
        test_util.check_list(result, expected, 'all_bands', ['id', 'name']);
        done();
      });
    });

    // Using SqlGenerator syntax.
    it('should get all the bands with "Wild" in the name, sorted by name', function(done) {
      var expected = [{
	id: 4, name: 'Jazz Wild',
      }, {
	id: 1, name: 'Wild At Heart',
      }];
      band.getAllWithArgs({ where: { name: { like: '%Wild%' } } }, function(result) {
        test_util.check_list(result, expected, 'all_bands', ['id', 'name']);
        done();
      });
    });
 
    it('should get all the bands sorted by id', function(done) {
      var expected = [{
	id: 1, name: 'Wild At Heart',
      }, {
	id: 2, name: 'Live! Dressed! Girls!',
      }, {
	id: 3, name: 'Sally Says Go',
      }, {
	id: 4, name: 'Jazz Wild',
      }];
      band.getAllWithArgs({ sort: { order: 'id' } }, function(result) {
        test_util.check_list(result, expected, 'all_bands', ['id', 'name']);
        done();
      });
    });
 
    it('should just get the band names, sorted by name', function(done) {
      var expected = [{
	name: 'Jazz Wild',
      }, {
	name: 'Live! Dressed! Girls!',
      }, {
	name: 'Sally Says Go',
      }, {
	name: 'Wild At Heart',
      }];
      band.getAllWithArgs({ fields: [ 'name' ] }, function(result) {
        test_util.check_list(result, expected, 'all_bands', ['name']);
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

    var band;
    it('should get the band object', function(done) {
      band = dbh.band();
      should.exist(band);
      done();
    });

    var band_id;
    it('should create the band', function(done) {
      band.create({name: 'Cover Story'}, function(result) {
        band_id = test_util.check_result(result, 'band_id');
        done();
      });
    });

    it('should get the band', function(done) {
      var expected = {id: band_id, name: 'Cover Story'};
      band.getById(band_id, function(result) {
        test_util.check_item(result, expected, 'band', ['id', 'name']);
        done();
      });
    });

    it('should update the band', function(done) {
      band.update({id: band_id, name: 'Groove On The Side'}, function(result) {
        test_util.check_result(result, 'band');
        done();
      });
    });

    it('should get the band', function(done) {
      var expected = {id: band_id, name: 'Groove On The Side'};
      band.getById(band_id, function(result) {
        test_util.check_item(result, expected, 'band', ['id', 'name']);
        done();
      });
    });

    it('should delete the band', function(done) {
      band.deleteById(band_id, function(result) {
        should.exist(result);
        result.should.have.property('band');
        result.band.should.eql(1);
        done();
      });
    });
  });
});
