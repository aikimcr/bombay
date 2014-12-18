#! /usr/local/bin/node
var util = require('util');

var db_orm = require('../lib/db_orm');
var bombay_util = require('../lib/util');

var public_pem = bombay_util.get_public_pem();
var private_pem = bombay_util.get_private_pem();

if (process.argv[2] == '-encrypt-string' || process.argv[2] == '-es') {
  if (process.argv[3]) {
    var encrypted = bombay_util.encrypt(public_pem, process.argv[3]);
    console.log('Password: "' + encrypted + '"');
  } else {
    console.log('No password given to encrypt');
  }
} else if (process.argv[2] == '-decrypt-string' || process.argv[2] == '-ds') {
  if (process.argv[3]) {
    var decrypted = bombay_util.decrypt(private_pem, process.argv[3]);
    console.log('Password: "' + decrypted + '"');
  } else {
    console.log('No password given to decrypt');
  }
} else if (process.argv[2] == '-decrypt' || process.argv[2] == '-d') {
  db_orm.Person.find(function(err, rows) {
    if (err) {
      throw err;
      exit(1);
    } else {
      rows.forEach(function(person) {
        console.log(person.full_name + ': ' + bombay_util.decrypt(private_pem, person.password));
      });
    }
  });
} else if (process.argv[2] == '-decrypt-write' || process.argv[2] == '-dw') {
  db_orm.Person.find(function(err, rows) {
    if (err) {
      throw err;
      exit(1);
    } else {
      rows.forEach(function(person) {
        if (person.password.length > 20) {
          person.save({password: bombay_util.decrypt(private_pem, person.password)}, function(err) {
            if (err) {
              console.log(
                util.format(
                  'Error saving person %d (%s): %s',
                  person.id, person.name, util.inspect(err)
                )
              );
            }
          });
        }
      });
    }
  });
} else {
    db_orm.Person.find(function(err, rows) {
    rows.forEach(function(person) {
      if (person.password.length <= 20) {
        person.save({password: bombay_util.encrypt(public_pem, person.password)}, function(err) {
          if (err) {
            console.log(
              util.format(
                'Error saving person %d (%s): %s',
                person.id, person.name, util.inspect(err)
              )
            );
          }
        });
      }
    });
  });
}
