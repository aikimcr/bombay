var should = require("should");
var db = require("../routes/db");

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
  });
});

/*
describe('getBandsForMenu', function() {
  describe('getEm', function() {
    db.setDbPath();
    db.getBandsForMenu(1, function(result) {
      it("Should return a structure with all bands in it", function() {
        should.deepEqual(result, [
          {id: 1, name: 'All Night Music'},
        ]);
      });
    });
  });
});
*/