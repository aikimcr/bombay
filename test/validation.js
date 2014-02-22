var should = require('should');

var fs = require('fs');
var node_util = require('util');

var test_util = require('test/lib/util');

var validate = require('routes/validation');
var db = require('lib/db');
var dbh;

GLOBAL.breakit = false;//XXX

describe('validation', function() {
  before(function(done) {
    dbh = new db.Handle();
    done();
  });

  var req;
  beforeEach(function(done) {
    req = {
      session: {
        passport: {
        }
      },
      query: {
      },
      params: {
      },
      body: {
      },
      path: '/'
    };
    done();
  });

  var res;
  beforeEach(function(done) {
    res = {
      json: function(result) {
        done('Attempt to return json result ' + node_util.inspect(result));
      },
      redirect: function(url) {
        done('Attempt to redirect to ' + url);
      }
    };
    done();
  });

  describe('findParam', function() {
    it('should return null', function() {
      var param = validate.findParam(req, 'band_id');
      should.not.exist(param);
    });

    it('should return 1', function() {
      req.query.band_id = 1;
      var param = validate.findParam(req, 'band_id');
      should.exist(param);
      param.should.eql(1);
    });

    it('should return 2', function() {
      req.params.band_id = 2;
      var param = validate.findParam(req, 'band_id');
      should.exist(param);
      param.should.eql(2);
    });

    it('should return 3', function() {
      req.body.band_id = 3;
      var param = validate.findParam(req, 'band_id');
      should.exist(param);
      param.should.eql(3);
    });
  });

  describe('requireLogin', function() {
    it('should redirect to login', function(done) {
      res.redirect = function(url) {
        should.exist(url);
        url.should.eql('/login');
        done();
      };
      validate.requireLogin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should call next', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: true});
      validate.requireLogin(req, res, function() {
        done();
      });
    });
  });

  describe('requireSysAdmin', function() {
    it('should return an error', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      res.json = function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Permission Denied');
        done();
      };
      validate.requireSysAdmin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should call next', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: true});
      validate.requireSysAdmin(req, res, function() {
        done();
      });
    });
  });

  describe('requireBandAdmin', function(done) {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      dbh = new db.Handle()
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      dbh.doSqlExec([sql], done);
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addPeople.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addBandMembers.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    it('should return an error', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      res.json = function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Permission Denied');
        done();
      };
      validate.requireBandAdmin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should return an error', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.query.band_id = 1;
      res.json = function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Permission Denied');
        done();
      };
      validate.requireBandAdmin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should return an error', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.params.band_id = 1;
      res.json = function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Permission Denied');
        done();
      };
      validate.requireBandAdmin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should return an error', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.body.band_id = 1;
      res.json = function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Permission Denied');
        done();
      };
      validate.requireBandAdmin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should call next', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: true});
      req.query.band_id = 2;
      validate.requireBandAdmin(req, res, function() {
        done();
      });
    });

    it('should call next', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: true});
      req.params.band_id = 2;
      validate.requireBandAdmin(req, res, function() {
        done();
      });
    });

    it('should call next', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: true});
      req.body.band_id = 2;
      validate.requireBandAdmin(req, res, function() {
        done();
      });
    });
  });

  describe('requireSelfOrAdmin', function(done) {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      dbh = new db.Handle()
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      dbh.doSqlExec([sql], done);
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addBands.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addPeople.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addBandMembers.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });


    before(function(done) {
      var sql = fs.readFileSync('./test/support/addArtists.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addSongs.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = fs.readFileSync('./test/support/addBandSongs.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    before(function(done) {
      var sql = 'INSERT INTO band_member (id, band_id, person_id, band_admin) VALUES (6, 2, 2, 0);'
      dbh.doSqlExec(sql, function(err) {
        done();
      });
    });

    it('should return an error - no user', function(done) {
      res.json = function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Permission Denied');
        done();
      };
      validate.requireSelfOrAdmin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should return an error - user is not sysadmin with no id', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.path = '/person';
      res.json = function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Permission Denied');
        done();
      };
      validate.requireSelfOrAdmin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should return an error - user is wrong person (query)', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.query.id = 2;
      req.path = '/person';
      res.json = function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Permission Denied');
        done();
      };
      validate.requireSelfOrAdmin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should return an error - user is wrong person (params)', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.params.id = 2;
      req.path = '/person';
      res.json = function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Permission Denied');
        done();
      };
      validate.requireSelfOrAdmin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should return an error - user is wrong person (body)', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.body.id = 2;
      req.path = '/person';
      res.json = function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Permission Denied');
        done();
      };
      validate.requireSelfOrAdmin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should return an error - user is wrong member (query)', function(done) {
      req.session.passport.user = JSON.stringify({id: 2, system_admin: false});
      req.query.id = 1;
      req.path = '/band_member';
      res.json = function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Permission Denied');
        done();
      };
      validate.requireSelfOrAdmin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should return an error - user is wrong member (params)', function(done) {
      req.session.passport.user = JSON.stringify({id: 2, system_admin: false});
      req.params.id = 1;
      req.path = '/band_member';
      res.json = function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Permission Denied');
        done();
      };
      validate.requireSelfOrAdmin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should return an error - user is wrong member (body)', function(done) {
      req.session.passport.user = JSON.stringify({id: 2, system_admin: false});
      req.body.id = 1;
      req.path = '/band_member';
      res.json = function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Permission Denied');
        done();
      };
      validate.requireSelfOrAdmin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should return an error - user and song mismatch (query)', function(done) {
      req.session.passport.user = JSON.stringify({id: 2, system_admin: false});
      req.query.id = 1;
      req.path = '/song_rating';
      res.json = function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Permission Denied');
        done();
      };
      validate.requireSelfOrAdmin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should return an error - user and song mismatch (params)', function(done) {
      req.session.passport.user = JSON.stringify({id: 2, system_admin: false});
      req.params.id = 1;
      req.path = '/song_rating';
      res.json = function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Permission Denied');
        done();
      };
      validate.requireSelfOrAdmin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should return an error - user and song mismatch (body)', function(done) {
      req.session.passport.user = JSON.stringify({id: 2, system_admin: false});
      req.body.id = 1;
      req.path = '/song_rating';
      res.json = function(result) {
        should.exist(result);
        result.should.have.property('err');
        result.err.should.eql('Permission Denied');
        done();
      };
      validate.requireSelfOrAdmin(req, res, function() {
        done('Attempt to call next');
      });
    });

    it('should call next - user is sysadmin', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: true});
      req.path = '/person';
      validate.requireSelfOrAdmin(req, res, function() {
        done();
      });
    });

    it('should call next - user is bandadmin (query)', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.query.id = 6;
      req.path = '/band_member';
      validate.requireSelfOrAdmin(req, res, function() {
        done();
      });
    });

    it('should call next - user and person match (query)', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.query.id = 1;
      req.path = '/person';
      validate.requireSelfOrAdmin(req, res, function() {
        done();
      });
    });

    it('should call next - user and person match (params)', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.params.id = 1;
      req.path = '/person';
      validate.requireSelfOrAdmin(req, res, function() {
        done();
      });
    });

    it('should call next - user and person match (body)', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.body.id = 1;
      req.path = '/person';
      validate.requireSelfOrAdmin(req, res, function() {
        done();
      });
    });

    it('should call next - user and member match (query)', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.query.id = 1;
      req.path = '/band_member';
      validate.requireSelfOrAdmin(req, res, function() {
        done();
      });
    });

    it('should call next - user and member match (params)', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.params.id = 1;
      req.path = '/band_member';
      validate.requireSelfOrAdmin(req, res, function() {
        done();
      });
    });

    it('should call next - user and member match (body)', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.body.id = 1;
      req.path = '/band_member';
      validate.requireSelfOrAdmin(req, res, function() {
        done();
      });
    });

    it('should call next - user and song match (query)', function(done) {
GLOBAL.breakit = true;
debugger;//XXX THis one
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.query.id = 1;
      req.path = '/song_rating';
      validate.requireSelfOrAdmin(req, res, function() {
        done();
      });
    });

    it('should call next - user and song match (params)', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.params.id = 1;
      req.path = '/song_rating';
      validate.requireSelfOrAdmin(req, res, function() {
        done();
      });
    });

    it('should call next - user and song match (body)', function(done) {
      req.session.passport.user = JSON.stringify({id: 1, system_admin: false});
      req.body.id = 1;
      req.path = '/song_rating';
      validate.requireSelfOrAdmin(req, res, function() {
        done();
      });
    });
  });
});
