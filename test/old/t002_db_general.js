var db = require("../routes/db");
var should = require("should");
var sqlite3 = require("sqlite3");
var fs = require("fs");

describe('db_general', function() {
  describe('#pathNotSet', function() {
    it("Path is not set", function(done) {
      var path = db.getDbPath();
      should.not.exist(path);
      done();
    });
  });
  
  describe('#pathSet', function() {
    before(function(done) {
      db.setDbPath();
      done();
    });
  
    it("getDbPath defined", function(done) {
      should.exist(db.getDbPath);
      done();
    });
    
    it("Should get the path", function(done) {
      var path = db.getDbPath();
      path.should.eql('./bombay.db');
      done();
    });
    
    it("Should set the path to the value passed in", function(done) {
      db.setDbPath('./bombay_test.db');
      var path = db.getDbPath();
      path.should.eql('./bombay_test.db');
      done();
    });
  });
});

describe('transactions', function() {
  before(function(done) {
    db.setDbPath('./bombay_test.db');
    var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
    var dbh = new sqlite3.Database(db.getDbPath());
    dbh.exec(sql, done);
    dbh.close();
  });
    
  describe('#begin and rollback', function() {
    var dbh;
    before(function(done) {
      dbh = new sqlite3.Database(db.getDbPath());
      done();
    });
    
    it('should start the transaction', function(done) {
      db.beginTransaction(dbh, done);
    });
    
    it('should insert a row', function(done) {
      dbh.exec('INSERT INTO band (id, name) VALUES (1, "Skywalker");', done);
    });
    
    it('should find the row', function(done) {
      dbh.all('SELECT * FROM band', function(err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.length.should.eql(1);
        rows.should.eql([{id: 1, name: 'Skywalker'}]);
        done();
      });
    });

    it('should rollback the transaction', function(done) {
      db.rollback(dbh, done);
    });
    
    it('should not find the row', function(done) {
      dbh.all('SELECT * FROM band', function(err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.length.should.eql(0);
        rows.should.eql([]);
        done();
      });
    });
    
    after(function(done) {
      dbh.close();
      done();
    });
  });

  describe('#begin and commit', function() {
    var dbh;
    before(function(done) {
      dbh = new sqlite3.Database(db.getDbPath());
      done();
    });
    
    it('should start the transaction', function(done) {
      db.beginTransaction(dbh, done);
    });
    
    it('should insert a row', function(done) {
      dbh.exec('INSERT INTO band (id, name) VALUES (2, "Chewbacca");', done);
    });
    
    it('should find the row', function(done) {
      dbh.all('SELECT * FROM band', function(err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.length.should.eql(1);
        rows.should.eql([{id: 2, name: 'Chewbacca'}]);
        done();
      });
    });

    it('should rollback the transaction', function(done) {
      db.commit(dbh, done);
    });
    
    it('should still find the row', function(done) {
      dbh.all('SELECT * FROM band', function(err, rows) {
        should.not.exist(err);
        should.exist(rows);
        rows.length.should.eql(1);
        rows.should.eql([{id: 2, name: 'Chewbacca'}]);
        done();
      });
    });
    
    after(function(done) {
      dbh.close();
      done();
    });
  });
});

