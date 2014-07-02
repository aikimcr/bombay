#! /usr/local/bin/node

// Node standard modules
var fs = require('fs');

// Bombay modules
var util = require('lib/util');
var path_util = require('lib/path_util');

var public_pem = util.get_public_pem();
var private_pem = util.get_private_pem();


if (process.argv[2] == '-create' || process.argv[2] == '-c') {
  var info = {
    user: process.argv[3],
    password: util.encrypt(public_pem, process.argv[4]),
    server: process.argv[5],
    url: process.argv[6],
    sender: process.argv[7]
  };
  var info_string = JSON.stringify(info);
  var info_path = path_util.mail_info_path();
  fs.writeFile(info_path, info_string, {encoding: 'utf8'}, function(err) {
    if (err) throw err;
    console.log('Mail Info Written');
  });
} else if (process.argv[2] == '-display' || process.argv[2] == '-d') {
  var info_string = util.get_mail_file();
  var info = JSON.parse(info_string);

  if (process.argv[3] == '-password') info.password = util.decrypt(private_pem, info.password);
  console.log(info);
}
