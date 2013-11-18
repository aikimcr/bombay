/*
 * Test Utilities
 */
var should = require('should');

var db = require('lib/db');
var fs = require('fs');

exports.check_record = function(got_record, expected_record, fields) {
  should.exist(got_record);
  fields.forEach(function(f) {
    got_record.should.have.property(f);
    got_record[f].should.eql(expected_record[f], f + ' not equal');
  });
};

exports.check_item = function(got_item, expected_item, data_key, fields) {
  should.exist(got_item);
  got_item.should.have.property(data_key);
  exports.check_record(got_item[data_key], expected_item, fields);
};

exports.check_list = function(got_list, expected_list, data_key, fields) {
  should.exist(got_list);
  got_list.should.have.property(data_key);
  got_list[data_key].length.should.eql(expected_list.length);
  for(var i = 0; i < expected_list.length; i++) {
    var got = got_list[data_key][i];
    var exp = expected_list[i];
    exports.check_record(got, exp, fields);
  }
};

exports.check_result = function(result, data_key) {
  should.exist(result);
  result.should.have.property(data_key);
  result.should.not.have.property('err');
  return result[data_key];
};

exports.check_error_result = function(result, data_key) {
  should.exist(result);
  result.should.not.have.property(data_key);
  result.should.have.property('err');
  return result.err;
};

/*
exports.load_db = function(tables) {
  var table_files = {
    band: 'addBands.sql',
    person: 'addPeople.sql',
    artist: 'addArtists.sql',
    song: 'addSongs.sql',
    band_member: 'addBandMembers.sql',
    band_song: 'addBandSongs.sql',
    song_rating: 'addSongRatings.sql',
  };
  var exec = function() {
    db.setDbPath(fs.realpathSync('./bombay_test.db'));
    this.db_ = new db.Handle();
    console.log(this.db_);
//    this.db_.setLogSql(true);
    this.sql = [fs.realpathSync('./sql/schema.sql')];

    Object.keys(table_files).forEach(function(table_name) {
      console.log(table_name);
      if (tables[table_name]) {
        this.sql.push(fs.realpathSync('./test/support/' + table_files[table_name]));
      }
    }, this);
    this.next_sql = function(err) {
      if (err) {
        console.log(err);
      }
      var sql_file = this.sql.shift();
      console.log('-----------------------------');
      console.log(sql_file);
      console.log('-----------------------------');
      if (sql_file) {
        console.log('Doing ' + sql_file);
        var sql = fs.readFileSync(sql_file, 'utf8');
        this.db_.doSqlExec(sql, function(err) {
          if (err) console.log(err);
          console.log(sql_file + ' done');
          this.next_sql(err);
        }.bind(this));
      }
    };
    this.start = function() { this.next_sql() }
  };

  var go = new exec();
  go.start();
};
*/
