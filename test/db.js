var should = require('should');

var sqlite3 = require('sqlite3');
var fs = require('fs');

process.env.db_name = 'bombay_test.db';
var db = require('lib/db');

describe('db_utility', function() {
  describe('#path', function() {
    it('should set the path', function(done) {
      db.setDbPath();
      var path = db.getDbPath();
      should.exist(path);
      done();
    });

    it('should set the path to a given value', function(done) {
      db.setDbPath('./bombay_test.db');
      var path = db.getDbPath();
      should.exist(path);
      path.should.eql(fs.realpathSync('./bombay_test.db'));
      done();
    });
  });
});

describe('db_basic', function() {
  describe('#execute', function() {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      var sqlite_handle = new sqlite3.Database(db.getDbPath());
      sqlite_handle.exec(sql, done);
      sqlite_handle.close();
    });

    var dbh;
    it('should open the database', function(done) {
      dbh = new db.Handle();
      should.exist(dbh);
      done();
    });

    it('should not get any rows', function(done) {
      dbh.doSqlQuery('SELECT * FROM band', [], 'band', function(result) {
	should.exist(result);
	should.exist(result.band);
	should.not.exist(result.err);
	result.band.length.should.eql(0);
	done();
      });
    });

    it('should insert one row', function(done) {
      dbh.doSqlExec(['INSERT INTO band (name) VALUES (\'Looney Tunes\');'], function(err) {
	should.not.exist(err);
	done();
      });
    });

    var row_id;
    it('should get the row just inserted', function(done) {
      dbh.doSqlGet('SELECT * FROM band WHERE name = $1', ['Looney Tunes'], 'band', function(result) {
	should.exist(result);
	should.exist(result.band);
	should.not.exist(result.err);
	result.band.name.should.eql('Looney Tunes');
	row_id = result.band.id;
	done();
      });
    });

    it('should delete the row', function(done) {
      dbh.doSqlRun('DELETE FROM band WHERE id = $1', [row_id], 'band', function(result) {
	should.exist(result);
	should.exist(result.band);
	should.not.exist(result.err);
	result.band.should.eql(1);
	done();
      });
    });

    it('should insert some rows', function(done) {
      var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
	should.not.exist(err);
	done();
      });
    });

    it('should get the rows', function(done) {
      dbh.doSqlQuery('SELECT * FROM band', [], 'band', function(result) {
	should.exist(result);
	should.exist(result.band);
	should.not.exist(result.err);
	result.band.length.should.eql(4);
	result.band.should.eql([{
	  id: 4, name: 'Jazz Wild',
	}, {
	  id: 2, name: 'Live! Dressed! Girls!',
	}, {
	  id: 3, name: 'Sally Says Go',
	}, {
	  id: 1, name: 'Wild At Heart',
	}]);
	done();
      });
    });

    after(function(done) {
      dbh.close();
      done();
    });
  });

  describe('#transaction', function() {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      var sqlite_handle = new sqlite3.Database(db.getDbPath());
      sqlite_handle.exec(sql, done);
      sqlite_handle.close();
    });

    var dbh;
    before(function(done) {
      dbh = new db.Handle();
      done();
    });

    describe('#rollback', function() {
      it('should start a transaction', function(done) {
	dbh.beginTransaction(function(err) {
	  should.not.exist(err);
	  done();
	});
      });

      it('should add some bands', function(done) {
	var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8');
	dbh.doSqlExec(sql, function(err) {
	  should.not.exist(err);
	  done();
	});
      });

      it('should get the bands', function(done) {
	dbh.doSqlQuery('SELECT * FROM band', [], 'band', function(result) {
	  should.exist(result);
	  should.exist(result.band);
	  should.not.exist(result.err);
	  result.band.length.should.eql(4);
	  result.band.should.eql([{
	    id: 4, name: 'Jazz Wild',
	  }, {
	    id: 2, name: 'Live! Dressed! Girls!',
	  }, {
	    id: 3, name: 'Sally Says Go',
	  }, {
	    id: 1, name: 'Wild At Heart',
	  }]);
	  done();
	});
      });

      it('should roll them back', function(done) {
	dbh.rollback(function(err) {
	  should.not.exist(err);
	  done();
	});
      });

      it('should not find the bands', function(done) {
	dbh.doSqlQuery('SELECT * FROM band', [], 'band', function(result) {
	  should.exist(result);
	  should.exist(result.band);
	  should.not.exist(result.err);
	  result.band.length.should.eql(0);
	  done();
	});
      });
    });

    describe('#commit', function() {
      it('should start a transaction', function(done) {
	dbh.beginTransaction(function(err) {
	  should.not.exist(err);
	  done();
	});
      });

      it('should add some bands', function(done) {
	var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8');
	dbh.doSqlExec(sql, function(err) {
	  should.not.exist(err);
	  done();
	});
      });

      it('should get the bands', function(done) {
	dbh.doSqlQuery('SELECT * FROM band', [], 'band', function(result) {
	  should.exist(result);
	  should.exist(result.band);
	  should.not.exist(result.err);
	  result.band.length.should.eql(4);
	  result.band.should.eql([{
	    id: 4, name: 'Jazz Wild',
	  }, {
	    id: 2, name: 'Live! Dressed! Girls!',
	  }, {
	    id: 3, name: 'Sally Says Go',
	  }, {
	    id: 1, name: 'Wild At Heart',
	  }]);
	  done();
	});
      });

      it('should commit them', function(done) {
	dbh.commit(function(err) {
	  should.not.exist(err);
	  done();
	});
      });

      it('should find the bands', function(done) {
	dbh.doSqlQuery('SELECT * FROM band', [], 'band', function(result) {
	  should.exist(result);
	  should.exist(result.band);
	  should.not.exist(result.err);
	  result.band.length.should.eql(4);
	  result.band.should.eql([{
	    id: 4, name: 'Jazz Wild',
	  }, {
	    id: 2, name: 'Live! Dressed! Girls!',
	  }, {
	    id: 3, name: 'Sally Says Go',
	  }, {
	    id: 1, name: 'Wild At Heart',
	  }]);
	  done();
	});
      });
    });
  });
});
