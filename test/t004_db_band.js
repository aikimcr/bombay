var db = require("../routes/db");
var should = require("should");
var sqlite3 = require("sqlite3");
var fs = require("fs");

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
    
    it("should get the band", function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getBand(dbh, 1, function(result) {
        result.should.eql({band :{
          id: 1, name: 'band1'
        }});
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
