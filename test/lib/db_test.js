/*
 * Utilities for setting up database tests.
 */
var fs = require('fs');

process.env.db_name = 'bombay_test.db';
var db_orm = require('lib/db_orm');

exports.resetDb = function(done) {
  var sql = fs.readFileSync('./sql/schema.sql', 'utf8');
  db_orm.execSqlList(sql, function(err) {
    if (err) throw err;
    done();
  });
};

function flattenSql(sql) {
  if (sql instanceof Array) {
    var sql_text = '';
    sql.forEach(function(sql_item) {
      sql_text += '\n' + flattenSql(sql_item);
    });
    return sql_text;
  } else if (sql instanceof Object) {
    if (sql.file) {
      return fs.readFileSync(sql.file, 'utf8');
    } else if (sql.sql) {
      return sql.sql;
    } else {
      return sql.text || '';
    }
  } else {
    return sql;
  }
}

exports.loadSql = function(sql, done) {
  db_orm.execSqlList(flattenSql(sql), function(err) {
    if (err) throw err;
    done();
  });
};
