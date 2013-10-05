var db = require("../routes/db");
var should = require("should");
var sqlite3 = require("sqlite3");
var fs = require("fs");

describe('permissions', function() {
  describe('#utility', function() {
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

    it("should get a list of members", function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getBandMembers(dbh, 1, function(result) {
        result.should.eql({band_members: [{
          id: 3, 
          full_name: 'Herkimer Jones',
          email: null,
          system_admin: 0,
          band_admin: 0
        }, {
          id: 1,
          full_name: 'System Admin Test User',
          email: null,
          system_admin: 1,
          band_admin: 0
        }]});
        
        // Leave out name and password for security.
        should.not.exist(result.band_members[0].name);
        should.not.exist(result.band_members[0].password);
        should.not.exist(result.band_members[1].name);
        should.not.exist(result.band_members[1].password);
        done();
      });
    });

    it("should get a list of non-members", function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getNonBandMembers(dbh, 1, function(result) {
        result.should.eql({non_band_members: [{
          id: 4, 
          full_name: 'Bugs Bunny',
          email: null
        }, {
          id: 2,
          full_name: 'Non System Admin Test User',
          email: null
        }]});
        
        // Leave out name and password for security.
        should.not.exist(result.non_band_members[0].name);
        should.not.exist(result.non_band_members[0].password);
        should.not.exist(result.non_band_members[1].name);
        should.not.exist(result.non_band_members[1].password);
        done();
      });
    });

    it("should get a list of all person rows", function(done) {
      var dbh = new sqlite3.Database(db.getDbPath());
      db.getAllPeople(dbh, function(result) {
        result.should.eql({all_people: [{
          id: 4, 
          full_name: 'Bugs Bunny',
          email: null,
          system_admin: 0
        }, {
          id: 3, 
          full_name: 'Herkimer Jones',
          email: null,
          system_admin: 0
        }, {
          id: 2,
          full_name: 'Non System Admin Test User',
          email: null,
          system_admin: 0
        }, {
          id: 1,
          full_name: 'System Admin Test User',
          email: null,
          system_admin: 1,
        }]});
        
        // Leave out name and password for security.
        should.not.exist(result.all_people[0].name);
        should.not.exist(result.all_people[0].password);
        should.not.exist(result.all_people[1].name);
        should.not.exist(result.all_people[1].password);
        done();
      });
    });
  });
  
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
  
  describe('#routes', function() {
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
        },
        query: {
          band_id: 1
        }
      };
      
      var res = {
        json: function(obj) {
          obj.should.eql({
            band_id: 1,
            permissions: {
              person_id: 1,
              is_sysadmin: true,
              band_id: 1,
              is_band_admin: false
            },
            band_members: [{
              id: 3, 
              full_name: 'Herkimer Jones',
              email: null,
              system_admin: 0,
              band_admin: 0
            }, {
              id: 1,
              full_name: 'System Admin Test User',
              email: null,
              system_admin: 1,
              band_admin: 0
            }],
            non_band_members: [{
              id: 4, 
              full_name: 'Bugs Bunny',
              email: null
            }, {
              id: 2,
              full_name: 'Non System Admin Test User',
              email: null
            }],
            band: { id: 1, name: 'band1' }
          });
          done();
        }
      };

      db.bandMembers(req, res);
    });
  });
});
