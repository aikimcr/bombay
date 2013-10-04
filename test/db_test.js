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

describe('permissions', function() {
  describe('#getLoginPermissions', function() {
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
    
    it('should be sysadmin', function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getLoginPermissions(dbh, 1, null, function(result) {
        result.should.eql({
          person_id: 1,
          is_sysadmin: true,
          band_id: null,
          is_band_admin: null,
        });
        done();
      });
    });
    
    it('should be sysadmin, not band admin',function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getLoginPermissions(dbh, 1, 1, function(result) {
        result.should.eql({
          person_id: 1,
          is_sysadmin: true,
          band_id: 1,
          is_band_admin: false
        });
        done();
      });
      dbh.close();
    });
    
    it('should be sysadmin and band admin',function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getLoginPermissions(dbh, 1, 2, function(result) {
        result.should.eql({
          person_id: 1,
          is_sysadmin: true,
          band_id: 2,
          is_band_admin: true
        });
        done();
      });
      dbh.close();
    });
    
    it('should be ordinary user',function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getLoginPermissions(dbh, 2, 3, function(result) {
        result.should.eql({
          person_id: 2,
          is_sysadmin: false,
          band_id: 3,
          is_band_admin: false
        });
        done();
      });
      dbh.close();
    });
    
    it('should not be sysadmin, should be band admin',function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getLoginPermissions(dbh, 2, 4, function(result) {
        result.should.eql({
          person_id: 2,
          is_sysadmin: false,
          band_id: 4,
          is_band_admin: true
        });
        done();
      });
      dbh.close();
    });
  });
});

describe('bands', function() {
  describe('utility', function(){
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
    
    it("Get member bands", function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getMemberBands(dbh, 1, function(result) {
        result.should.eql({
          member_bands: [{
            id: 1, name: 'band1'
          }, {
            id: 2, name: 'band2'
          }]
        });
        done();
      });
      dbh.close();
    });
    
    it("Get other bands", function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getOtherBands(dbh, 1, function(result) {
        result.should.eql({
          other_bands: [{
            id: 3, name: 'band3'
          }, {
            id: 4, name: 'band4'
          }]
        });
        done();
      });
      dbh.close();      
    });
    
    it("Get all bands", function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getAllBands(dbh, function(result) {
        result.should.eql({
          all_bands: [{
            id: 1, name: 'band1'
          }, {
            id: 2, name: 'band2'
          }, {
            id: 3, name: 'band3'
          }, {
            id: 4, name: 'band4'
          }]
        });
        done();
      });
      dbh.close();
    });
  });
  
  describe('#server views', function() {
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
    
    it("Get bands for menu", function(done) {
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
  
  describe('#routes',function() {
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
    
    it('should send back the right json', function(done) {
      var req = {
        session: {
          passport: {
            user: 1
          }
        }
      };
      
      var res = {
        json: function(obj) {
          obj.should.eql({
            permissions: {
              person_id: 1,
              is_sysadmin: 1,
              band_id: null,
              is_band_admin: null
            },
            member_id: 1,
            member_bands: [{
              id: 1, name: 'band1'
            }, {
              id: 2, name: 'band2'
            }],
            other_bands: [{
              id: 3, name: 'band3'
            }, {
              id: 4, name: 'band4'
            }]
          });
          done();
        }
      };

      db.memberBands(req, res);
    });
  });
});
