var should = require("should");
var db = require("../routes/db");
var sqlite3 = require("sqlite3");
var fs = require("fs");

describe('db', function() {
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
  
  describe('#getBandsForMenu', function(){
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
    
    it("should get bands", function(done) {
      db.getBandsForMenu(1, function(result) {
        result.should.eql([{
          id: 1, name: 'band1'
        }, {
          id: 2, name: 'band2'
        }]);
        done();
      });
    });
  });
});
