#! /usr/local/bin/node

// Node Standard includes
var fs = require('fs');
var path = require('path');
var node_util = require('util');

// Third-party packages
var SqlGenerator = require('sql-generator');
var flow = require('flow');
var jade = require('jade');

// Bombay packages
var db = require('lib/db');
var path_util = require('lib/path_util');
var util = require('lib/util');
var mail_util = require('lib/mail_util');

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

function get_to_addresses(band_id, callback) {
  var sql = 'select email from person where email is not null and id in (select person_id from band_member where band_id = ?)';
  dbh.doSqlQuery(sql, [band_id], 'persons', function(result) {
    var persons = result.persons.map(function(person) {
      return person.email;
    });
    var valid_emails = persons.filter(function(email) {
      return email.match(/[^@]+@[^@]+/);
    });
    callback(valid_emails.join(','));
  });
};

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
      this.member_count = member_count;
      get_to_addresses(band_id, this);
    },
    function(to_addresses) {
      this.to_addresses = to_addresses;
      this.formatted_time = new Date(this.snapshot_time + ' UTC');
      render_report({
        style_info: style_info,
        formatted_time: this.formatted_time.toLocaleString(),
        snapshot_time: this.snapshot_time,
        band_name: this.band_name,
        song_count: this.song_count,
        member_count: this.member_count,
        average_rating: this.average_rating,
        average_agreement: this.average_agreement,
        tables: tables
      }, this);
    },
    function(err, report_text) {
      var report_subject = node_util.format('%s Songs Report from %s', this.band_name, this.formatted_time.toLocaleString());
      var report_name = 'songs_report.html'

      var report_file = 'band_song_summary_' + this.snapshot_time + '.html';
      report_file = encodeURIComponent(report_file.replace(/[\s-+:]/g, '_'));
      var report_full_path = path.join(path_util.reports_path(band_id), report_file);

      fs.writeFile(report_full_path, report_text, {encoding: 'utf8'}, function(err) {
        if (err) throw err;
        this(report_file, report_full_path, report_subject, report_name);
      }.bind(this));
    },
    function(report_file, report_full_path, report_subject, report_name) {
      console.log('"' + this.to_addresses + '"');
/*
 * XXX mailing is currently broken.  I think it's a problem with Postfix.  Which sucks.  Postfix, I mean.
      if (this.to_addresses.length > 0) {
        mail_util.send_report({
          to_address: this.to_addresses,
          report_file: report_file,
          report_full_path: report_full_path,
          report_subject: report_subject,
          report_name: report_name
        }, report_full_path);
      }
*/
      this(report_full_path);
    },
    function(report_full_path) {
      var link_file = 'band_song_summary.html';
      var link_full_path = path.join(path_util.reports_path(band_id), link_file);
      try {
        fs.unlinkSync(link_full_path);
      } catch(error) {
        console.error(error);
      };
      fs.symlinkSync(report_full_path, link_full_path);
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
