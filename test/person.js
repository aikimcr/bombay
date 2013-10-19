var should = require('should');

var sqlite3 = require('sqlite3');
var fs = require('fs');

var db = require('lib/db');
var dbh;

describe('person_table', function() {
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
      name: 'bbunny',
      full_name: 'Bugs Bunny',
      email: 'bugs@warnerbros.com',
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
      result.person.name.should.eql('bbunny');
      result.person.full_name.should.eql('Bugs Bunny');
      result.person.email.should.eql('bugs@warnerbros.com');
      result.person.system_admin.should.eql(false);
      done();
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

  it('should insert some rows', function(done) {
    var sql = fs.readFileSync('./test/support/addPeople.sql', 'utf8');
    dbh.doSqlExec(sql, function(err) {
      should.not.exist(err);
      done();
    });
  });

  it('should get all the persons', function(done) {
    person.getAll(function(result) {
      should.exist(result);
      should.exist(result.all_persons);
      result.all_persons.should.eql([{
	id: 4,
	name: 'bbunny',
	full_name: 'Bugs Bunny',
	password: 'carrot',
	email: null,
	system_admin: false
      }, {
	id: 3,
	name: 'hjones',
	full_name: 'Herkimer Jones',
	password: 'nerd',
	email: null,
	system_admin: false
      }, {
	id: 2,
	name: 'other_test',
	full_name: 'Non System Admin Test User',
	password: 'regular',
	email: null,
	system_admin: false
      }, {
	id: 1,
	name: 'test',
	full_name: 'System Admin Test User',
	password: 'admin',
	email: null,
	system_admin: true
      }]);
      done();
    });
  });

  it('should update the person', function(done) {
    var data = {
      id: 4,
      name: 'bugsy',
      full_name: 'Bugs Bunny, ESQ',
      password: 'lettuce',
      email: 'bugsy@wb.com',
      system_admin: true
    };

    person.update(data, function(result) {
      should.exist(result);
      should.not.exist(result.err);
      person.getById(4, function(result) {
	should.exist(result);
	should.exist(result.person);
	should.not.exist(result.err);
	result.person.should.eql({
	  id: 4,
	  name: 'bugsy',
	  full_name: 'Bugs Bunny, ESQ',
	  password: 'lettuce',
	  email: 'bugsy@wb.com',
	  system_admin: true
	});
	done();
      });
    });
  });
});

describe('person_views', function() {
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

  var person;
  before(function(done) {
    person = dbh.person();
    done();
  });

  it('should be sysadmin', function(done) {
    person.getLoginPermissions(1, null, function(result) {
      result.should.eql({
        person_id: 1,
        system_admin: true,
        band_id: null,
        band_admin: null,
      });
      done();
    });
  });
  
  it('should be sysadmin, not band admin',function(done) {
    person.getLoginPermissions(1, 1, function(result) {
      result.should.eql({
        person_id: 1,
        system_admin: true,
        band_id: 1,
        band_admin: false
      });
      done();
    });
  });
  
  it('should be sysadmin and band admin',function(done) {
    person.getLoginPermissions(1, 2, function(result) {
      result.should.eql({
        person_id: 1,
        system_admin: true,
        band_id: 2,
        band_admin: true
      });
      done();
    });
  });
  
  it('should be ordinary user',function(done) {
    person.getLoginPermissions(2, 3, function(result) {
      result.should.eql({
        person_id: 2,
        system_admin: false,
        band_id: 3,
        band_admin: false
      });
      done();
    });
  });
  
  it('should not be sysadmin, should be band admin',function(done) {
    person.getLoginPermissions(2, 4, function(result) {
      result.should.eql({
        person_id: 2,
        system_admin: false,
        band_id: 4,
        band_admin: true
      });
      done();
    });
  });
});
