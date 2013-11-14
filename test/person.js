var should = require('should');

var sqlite3 = require('sqlite3');
var fs = require('fs');

var test_util = require('test/lib/util');

var db = require('lib/db');
var dbh;

describe('person_table', function() {
  describe('#CreateAndUpdate', function() {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      dbh = new db.Handle()
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      dbh.doSqlExec([sql], done);
    });

    var person;
    it('should get the person object', function(done) {
      person = dbh.person();
      should.exist(person);
      done();
    });

    var person_id;
    it('should create the person', function(done) {
      person.create({
        name: 'jguitar',
        full_name: 'Johnny Guitar',
        email: 'jguitar@musichero.foo',
        system_admin: false,
      }, function(result) {
        should.exist(result);
        should.exist(result.person_id);
        should.not.exist(result.err);
        person_id = result.person_id;
        done();
      });
    });

    it('should get the person', function(done) {
      person.getById(person_id, function(result) {
        should.exist(result);
        should.exist(result.person);
        result.person.id.should.eql(person_id);
        result.person.name.should.eql('jguitar');
        result.person.full_name.should.eql('Johnny Guitar');
        result.person.email.should.eql('jguitar@musichero.foo');
        result.person.system_admin.should.eql(false);
        done();
      });
    });


    it('should update the person', function(done) {
      var data = {
        id: person_id,
        name: 'fukulele',
        full_name: 'Fred Ukulele',
        password: 'grassshack',
        email: 'fukulele@slackkey.hi',
        system_admin: true
      };

      person.update(data, function(result) {
        should.exist(result);
        should.not.exist(result.err);
        person.getById(person_id, function(result) {
	  should.exist(result);
	  should.exist(result.person);
	  should.not.exist(result.err);
	  result.person.should.eql({
            id: person_id,
            name: 'fukulele',
            full_name: 'Fred Ukulele',
            password: 'grassshack',
            email: 'fukulele@slackkey.hi',
            system_admin: true
	  });
	  done();
        });
      });
    });

    it('should delete the person', function(done) {
      person.deleteById(person_id, function(result) {
        should.exist(result);
        should.exist(result.person);
        result.person.should.eql(1);
        done();
      });
    });
  });

  describe('#GetLists', function() {
    before(function(done) {
      db.setDbPath('./bombay_test.db');
      dbh = new db.Handle()
      var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
      dbh.doSqlExec([sql], done);
    });

    it('should insert some rows', function(done) {
      var sql = fs.readFileSync('./test/support/addPeople.sql', 'utf8');
      dbh.doSqlExec(sql, function(err) {
        should.not.exist(err);
        done();
      });
    });

    var person;
    it('should get the person object', function(done) {
      person = dbh.person();
      should.exist(person);
      done();
    });

    it('should get all the persons sorted by full name', function(done) {
      var expected = [{
	id: 2,
	name: 'aposer',
	full_name: 'Alan Poser',
	password: 'fakeit',
	email: 'aposer@wannabe.net',
	system_admin: false
      }, {
	id: 3,
	name: 'ddrums',
	full_name: 'Danny Drums',
	password: 'backbeat',
	email: 'ddrums@musichero.foo',
	system_admin: false
      }, {
	id: 4,
	name: 'jguitar',
	full_name: 'Johnny Guitar',
	password: 'tonefreak',
	email: 'jguitar@musichero.foo',
	system_admin: false
      }, {
	id: 1,
	name: 'admin',
	full_name: 'System Admin User',
	password: 'admin',
	email: 'admin@allnightmusic.com',
	system_admin: true
      }];

      person.getAll(function(result) {
        test_util.check_list(result, expected, 'all_persons', ['id', 'name', 'full_name', 'password', 'email', 'system_admin']);
        done();
      });
    });
  });
});
