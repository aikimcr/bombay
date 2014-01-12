#! /usr/local/bin/node

var db = require('lib/db');
var util = require('lib/util');

var dbh = new db.Handle();
var person_handle = dbh.person();
var public_pem = util.get_public_pem();
var private_pem = util.get_private_pem();

if (process.argv[2] == '-encrypt-string' || process.argv[2] == '-es') {
  if (process.argv[3]) {
    var encrypted = util.encrypt(public_pem, process.argv[3]);
    console.log('Password: "' + encrypted + '"');
  } else {
    console.log('No password given to encrypt');
  }
} else if (process.argv[2] == '-decrypt-string' || process.argv[2] == '-ds') {
  if (process.argv[3]) {
    var decrypted = util.decrypt(private_pem, process.argv[3]);
    console.log('Password: "' + decrypted + '"');
  } else {
    console.log('No password given to decrypt');
  }
} else if (process.argv[2] == '-decrypt' || process.argv[2] == '-d') {
  person_handle.getAll(function(result) {
    result.all_persons.forEach(function(person) {
      console.log(person.full_name + ': ' + util.decrypt(private_pem, person.password));
    });
  });
} else if (process.argv[2] == '-decrypt-write' || process.argv[2] == '-dw') {
  person_handle.getAll(function(result) {
    result.all_persons.forEach(function(person) {
      if (person.password.length > 20) {
        person_handle.update({
          id: person.id,
          password: util.decrypt(private_pem, person.password)
        }, function(result) {
          if (result.err) {
            console.log(result.err);
          }
        });
      }
    });
  });
} else {
  person_handle.getAll(function(result) {
    result.all_persons.forEach(function(person) {
      if (person.password.length <= 20) {
        person_handle.update({
          id: person.id,
          password: util.encrypt(public_pem, person.password)
        }, function(result) {
          if (result.err) {
            console.log(result.err);
          }
        });
      }
    });
  });
}
