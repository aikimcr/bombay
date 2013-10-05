var db = require("../routes/db");
var should = require("should");
var sqlite3 = require("sqlite3");

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
