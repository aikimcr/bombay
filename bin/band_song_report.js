#! /usr/local/bin/node

// Node Standard includes
var fs = require('fs');
var path = require('path');
var util = require('util');

// Third-party packages
var SqlGenerator = require('sql-generator');
var flow = require('flow');
var jade = require('jade');

// Bombay packages
var db_orm = require('lib/db_orm');
var path_util = require('lib/path_util');
var mail_util = require('lib/mail_util');

function flatten(err, rows, callback) {
  if (err) throw err;
  var flat_rows = JSON.parse(JSON.stringify(rows)); 
  callback(null, flat_rows);
}

function average_lo_to_hi(where, callback) {
  db_orm.SongRatingSnapshot.find(where)
    .limit(10)
    .order('average_rating')
    .order('-variance')
    .order('song_name')
    .order('artist_name')
    .run(function(err, rows) { flatten(err, rows, callback) });
}

function average_hi_to_lo(where, callback) {
  db_orm.SongRatingSnapshot.find(where)
    .limit(10)
    .order('-average_rating')
    .order('variance')
    .order('song_name')
    .order('artist_name')
    .run(function(err, rows) { flatten(err, rows, callback) });
}

function variance_lo_to_hi(where, callback) {
  db_orm.SongRatingSnapshot.find(where)
    .limit(10)
    .order('variance')
    .order('-average_rating')
    .order('song_name')
    .order('artist_name')
    .run(function(err, rows) { flatten(err, rows, callback) });
}

function variance_hi_to_lo(where, callback) {
  db_orm.SongRatingSnapshot.find(where)
    .limit(10)
    .order('-variance')
    .order('average_rating')
    .order('song_name')
    .order('artist_name')
    .run(function(err, rows) { flatten(err, rows, callback) });
}

function calc_agreement(tables, callback) {
  Object.keys(tables).forEach(function(key) {
    if (!tables[key]) throw new Error('No table entry for ' + key);
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
  
  db_orm.SongRatingSnapshot.find(where).only(['average_rating', 'variance'])
    .run(function(err, rows) {
      if (err) {
        callback(err);
      } else {
        var count = rows.length;
        var rating_total = 0;
        var agreement_total = 0;

        rows.forEach(function(row) {
          rating_total += row.average_rating;
          var stddev = Math.sqrt(row.variance);
          var agreement = ((2 - stddev) / 2) * 100;
          agreement_total += agreement;
        });

        var average_rating = Math.round((rating_total / count) * 100) / 100;
        var average_agreement = Math.round(agreement_total / count);
        callback(null, count, average_rating, average_agreement);
      }
    });
}

function calc_member_count(band_id, callback) {
  db_orm.BandMember.count({band_id: band_id}, callback);
}

function get_to_addresses(band_id, callback) {
  db_orm.Person
    .findByBands({band_id: band_id}).only('email')
    .where('email IS NOT NULL').run(function(err, rows) {
      if (err) {
        callback(err);
      } else {
        var valid_emails = rows.map(function(person) {
          return person.email;
        }).filter(function(email) {
          return email.match(/[^@]+@[^@]+/);
        });
        callback(null, valid_emails.join(','));
      }
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
    function(err, rows) {
      if (err) throw err;
      tables.average_lo_to_hi = rows;
      average_hi_to_lo(where, this);
    },
    function(err, rows) {
      if (err) throw err;
      tables.average_hi_to_lo = rows;
      variance_lo_to_hi(where, this);
    },
    function(err, rows) {
      if (err) throw err;
      tables.variance_lo_to_hi = rows;
      variance_hi_to_lo(where, this);
    },
    function(err, rows) {
      if (err) throw err;
      tables.variance_hi_to_lo = rows;
      calc_agreement(tables, this);
    },
    function() {
      db_orm.Snapshot.get(snapshot_id, function(err, row) {
        if (err) throw err;
        this(row.timestamp);
      }.bind(this));
    },
    function(snapshot_time) {
      this.snapshot_time = snapshot_time;
      db_orm.Band.get(band_id, function(err, row) {
        if (err) throw err;
        this(row.name);
      }.bind(this));
    },
    function(band_name) {
      this.band_name = band_name;
      calc_other_averages(where, this);
    },
    function(err, song_count, average_rating, average_agreement) {
      if (err) throw err;
      this.song_count = song_count; 
      this.average_rating = average_rating;
      this.average_agreement = average_agreement;
      calc_member_count(band_id, this);
    },
    function(err, member_count) {
      if (err) throw err;
      this.member_count = member_count;
      get_to_addresses(band_id, this);
    },
    function(err, to_addresses) {
      if (err) throw err;
      this.to_addresses = to_addresses;
      this.formatted_time = new Date(this.snapshot_time);
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
      if (err) throw err;
      var report_subject = util.format('%s Songs Report from %s', this.band_name, this.formatted_time.toLocaleString());
      var report_name = 'songs_report.html'

      var report_file = 'band_song_summary_' + this.snapshot_time + '.html';
      report_file = encodeURIComponent(report_file.replace(/[\s-+:]/g, '_'));
      var report_full_path = path.join(path_util.reports_path(band_id), report_file);

      fs.writeFile(report_full_path, report_text, {encoding: 'utf8'}, function(err) {
        if (err) throw err;
        this(null, report_file, report_full_path, report_subject, report_name);
      }.bind(this));
    },
    function(err, report_file, report_full_path, report_subject, report_name) {
      if (err) throw err;
//XXX      console.log('"' + this.to_addresses + '"');
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
      this(null, report_full_path);
    },
    function(err, report_full_path) {
      if (err) throw err;
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
    db_orm.execSqlList(build_stats_sql, function(err) {
      if (err) throw err;
      this();
    }.bind(this));
  },
  function() {
    db_orm.Snapshot.aggregate().max('id').get(function(err, snapshot_id) {
      if (err) throw err;
      if (snapshot_id) {
        this(null, snapshot_id);
      } else {
        throw new Error('failed to get snapshot id');
      }
    }.bind(this));
  },
  function(err, snapshot_id) {
    if (err) throw err;
    var style_sheet = path.join(path_util.css_path(), 'report.css');
    var style_info = fs.readFileSync(style_sheet, {encoding: 'utf8'});
    db_orm.Band.find(function(err, rows) {
      if (err) throw err;
      rows.forEach(function(band) {
        generate_band_report(snapshot_id, band.id, style_info);
      });
    }.bind(this));
  }
);

report();
