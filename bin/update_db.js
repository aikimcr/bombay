#! /usr/local/bin/node
/*
 * Read schema changes and apply them to the database.
 **/

var fs = require('fs');
var path = require('path');
var util = require('util');
var sqlite3 = require('sqlite3');
var flow = require('flow');

var schema_dir = './sql/schema_changes';
var change_files = fs.readdirSync(schema_dir);

var dbh = new sqlite3.Database('./bombay.db', function(err) {
  if (err) {
    console.log(err);
    throw err;
  }
});
dbh.exec('PRAGMA foreigh_keys = ON;');

change_files.filter(function(x) { return ! x.match('~$'); }).sort().forEach(function(file) {
  console.log(util.format('Schema change %s', file));
  var change_text = fs.readFileSync(path.join(schema_dir, file), {encoding: 'utf8'});
  var change_spec = change_text.match(/#change\s*(.*)\n((\n.*)*)/);

  if (! change_spec) {
    console.log(change_text);
    throw new Error('Unable to parse schema_change');
  }

  var change_name = change_spec[1];
  var select = 'select id, name from schema_change where name = $1';
 
  dbh.get(select, [change_name], function(err, row) {
    if (err) {
      console.log(select);
      console.log(err);
      throw err;
    }

    if (row == null) {
      var sql = [
        ('BEGIN TRANSACTION;'),
        change_spec[2],
        util.format('INSERT INTO schema_change (name) VALUES (%s)', change_name),
        'COMMIT;',
      ];
      
      dbh.exec(sql.join(' '), function(err) {
        console.log(sql);
        console.log(err);
        if (err) throw err;
      });
    } else {
      console.log('Skip "' + change_name +'"');
    }
  });
});
