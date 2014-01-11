#! /usr/local/bin/node

// Node Standard includes
var fs = require('fs');
var path = require('path');

// Third-party packages
var SqlGenerator = require('sql-generator');
var flow = require('flow');
var jade = require('jade');

// Bombay packages
var db = require('lib/db');
var path_util = require('lib/path_util');
var util = require('lib/util');

var dbh = new db.Handle();

function average_lo_to_hi(where, callback) {
  var sqlgen = new SqlGenerator();
  var order = {
    order: [ 'average_rating', 'variance desc', 'song_name', 'artist_name'],
    limit: 10
  };
  var stmt = sqlgen.select('song_rating_snapshot', '*', where, order);
  dbh.doSqlQuery(stmt.sql, stmt.values, 'average_lo_to_hi', function(result) {
    callback(result);
  });
}

function average_hi_to_lo(where, callback) {
  var sqlgen = new SqlGenerator();
  var order = {
    order: [ 'average_rating desc', 'variance', 'song_name', 'artist_name'],
    limit: 10
  };
  var stmt = sqlgen.select('song_rating_snapshot', '*', where, order);
  dbh.doSqlQuery(stmt.sql, stmt.values, 'average_hi_to_lo', function(result) {
    callback(result);
  });
}

function variance_lo_to_hi(where, callback) {
  var sqlgen = new SqlGenerator();
  var order = {
    order: [ 'variance', 'average_rating desc', 'song_name', 'artist_name'],
    limit: 10
  };
  var stmt = sqlgen.select('song_rating_snapshot', '*', where, order);
  dbh.doSqlQuery(stmt.sql, stmt.values, 'variance_lo_to_hi', function(result) {
    callback(result);
  });
}

function variance_hi_to_lo(where, callback) {
  var sqlgen = new SqlGenerator();
  var order = {
    order: [ 'variance desc', 'average_rating', 'song_name', 'artist_name'],
    limit: 10
  };
  var stmt = sqlgen.select('song_rating_snapshot', '*', where, order);
  dbh.doSqlQuery(stmt.sql, stmt.values, 'variance_hi_to_lo', function(result) {
    callback(result);
  });
}

function calc_agreement(tables, callback) {
  Object.keys(tables).forEach(function(key) {
    tables[key].forEach(function(row) {
      row.stddev = Math.sqrt(row.variance);
      row.agreement = Math.round(((2 - row.stddev) / 2) * 100);
    });
  });
  callback();
}

function calc_other_averages(where, callback) {
  var sqlgen = new SqlGenerator();
  var stmt = sqlgen.select('song_rating_snapshot', 'average_rating, variance', where);
  dbh.doSqlQuery(stmt.sql, stmt.values, 'stats', function(result) {
    var count = 0;
    var rating_total = 0;
    var agreement_total = 0;

    result.stats.forEach(function(row) {
      count++;
      rating_total += row.average_rating;
      var stddev = Math.sqrt(row.variance);
      var agreement = ((2 - stddev) / 2) * 100;
      agreement_total += agreement;
    });

    var average_rating = Math.round((rating_total / count) * 100) / 100;
    var average_agreement = Math.round(agreement_total / count);
    callback(count, average_rating, average_agreement);
  });
}

function calc_member_count(band_id, callback) {
  var sqlgen = new SqlGenerator();
  var stmt = sqlgen.select('band_member', 'count(*) as count', {band_id: band_id});
  dbh.doSqlGet(stmt.sql, stmt.values, 'members', function(result) {
    callback(result.members.count);
  });
}

function render_report(options, callback) {
  options.title = 'Band Songs Report for ' + options.band_name + ' generated ' + options.snapshot_time;
  jade.renderFile(path.join(path_util.view_path(), 'reports', 'band_songs.jade'), options, callback);
}

function generate_band_report(snapshot_id, band_id, style_info) {
  var where =  { snapshot_id: snapshot_id, band_id: band_id } ;
  var tables = {};
  var collect = flow.define(
    function() {
      average_lo_to_hi(where, this);
    },
    function(result) {
      tables.average_lo_to_hi = result.average_lo_to_hi;
      average_hi_to_lo(where, this);
    },
    function(result) {
      tables.average_hi_to_lo = result.average_hi_to_lo;
      variance_lo_to_hi(where, this);
    },
    function(result) {
      tables.variance_lo_to_hi = result.variance_lo_to_hi;
      variance_hi_to_lo(where, this);
    },
    function(result) {
      tables.variance_hi_to_lo = result.variance_hi_to_lo;
      calc_agreement(tables, this);
    },
    function() {
      var sqlgen = new SqlGenerator();
      var stmt = sqlgen.select('snapshot', 'timestamp', { id: snapshot_id });
      dbh.doSqlGet(stmt.sql, stmt.values, 'snapshot_time', function(result) {
        this(result.snapshot_time.timestamp);
      }.bind(this));
    },
    function(snapshot_time) {
      this.snapshot_time = snapshot_time;
      var sqlgen = new SqlGenerator();
      var stmt = sqlgen.select('band', 'name', { id: band_id });
      dbh.doSqlGet(stmt.sql, stmt.values, 'band_name', function(result) {
        this(result.band_name.name);
      }.bind(this));
    },
    function(band_name) {
      this.band_name = band_name;
      calc_other_averages(where, this);
    },
    function(song_count, average_rating, average_agreement) {
      this.song_count = song_count; 
      this.average_rating = average_rating;
      this.average_agreement = average_agreement;
      calc_member_count(band_id, this);
    },
    function(member_count) {
      var formatted_time = new Date(this.snapshot_time + ' UTC');
      render_report({
        style_info: style_info,
        formatted_time: formatted_time.toLocaleString(),
        snapshot_time: this.snapshot_time,
        band_name: this.band_name,
        song_count: this.song_count,
        member_count: member_count,
        average_rating: this.average_rating,
        average_agreement: this.average_agreement,
        tables: tables
      }, this);
    },
    function(err, report_text) {
//      var report_file = this.band_name + '_' + this.snapshot_time + '.html';
      var report_file = this.band_name + '.html';
      report_file = encodeURIComponent(report_file.replace(/[\s-+:]/g, '_'));
      fs.writeFile(path.join(path_util.html_path(), report_file), report_text, {encoding: 'utf8'}, function(err) {
        if (err) throw err;
        this(report_file);
      }.bind(this));
    },
    function(report_file) {
      console.log('http://localhost:3000/html/' + report_file);
    }
  );

  collect();
}

var report = flow.define(
  function() {
    var sql_file = path.join(path_util.sql_path(), 'songsbyrating.sql');
    var build_stats_sql = fs.readFileSync(sql_file, {encoding: 'utf8'});
    dbh.doSqlExec(build_stats_sql, function(result) {
      if (!result) { this(); }
    }.bind(this));
  },
  function() {
    var sqlgen = new SqlGenerator();
    var stmt = sqlgen.select('snapshot', 'MAX(id) as snapshot_id');
    dbh.doSqlGet(stmt.sql, stmt.values, 'snapshot_id', function(result) {
      if (result.snapshot_id) {
        this(result.snapshot_id.snapshot_id);
      } else if (result.err) {
        throw result.err;
      } else {
        throw new Error("failed to get snapshot id");
      }
    }.bind(this));
  },
  function(snapshot_id) {
    var style_sheet = path.join(path_util.css_path(), 'report.css');
    var style_info = fs.readFileSync(style_sheet, {encoding: 'utf8'});
    dbh.band().getAll(function(result) {
      result.all_bands.forEach(function(band) {
        generate_band_report(snapshot_id, band.id, style_info);
      });
    }.bind(this));
  }
);

report();
