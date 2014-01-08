var db = require('lib/db');
var util = require('lib/util');

var dbh = new db.Handle();
var person_handle = dbh.person();
var public_pem = util.get_pem_file('crypto/rsa_public.pem');
var private_pem = util.get_pem_file('crypto/rsa_private.pem');

if (process.argv[2] == '-decrypt' || process.argv[2] == '-d') {
  person_handle.getAll(function(result) {
    result.all_persons.forEach(function(person) {
      console.log(person.full_name + ': ' + util.decrypt(private_pem, person.password));
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
