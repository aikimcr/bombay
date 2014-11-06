var manager;

function Manager() {
  manager = this;

  this.song_status_map = [
    { value: -2, value_text: 'Retired' },
    { value: -1, value_text: 'Proposed' },
    { value: 0, value_text: 'New' },
    { value: 1, value_text: 'Learning' },
    { value: 2, value_text: 'Run Through' },
    { value: 3, value_text: 'Ready' },
    { value: 4, value_text: 'Standard' }
  ];

  this.key_signature_map = [
    { value: '', value_text: '' },
    { value: 'Ab', value_text: 'Ab' },
    { value: 'Abm', value_text: 'Abm' },
    { value: 'A', value_text: 'A' },
    { value: 'Am', value_text: 'Am' },
    { value: 'A#', value_text: 'A#' },
    { value: 'A#m', value_text: 'A#m' },
    { value: 'Bb', value_text: 'Bb' },
    { value: 'Bbm', value_text: 'Bbm' },
    { value: 'B', value_text: 'B' },
    { value: 'Bm', value_text: 'Bm' },
    { value: 'C', value_text: 'C' },
    { value: 'Cm', value_text: 'Cm' },
    { value: 'C#', value_text: 'C#' },
    { value: 'C#m', value_text: 'C#m' },
    { value: 'Db', value_text: 'Db' },
    { value: 'Dbm', value_text: 'Dbm' },
    { value: 'D', value_text: 'D' },
    { value: 'Dm', value_text: 'Dm' },
    { value: 'D#', value_text: 'D#' },
    { value: 'D#m', value_text: 'D#m' },
    { value: 'Eb', value_text: 'Eb' },
    { value: 'Ebm', value_text: 'Ebm' },
    { value: 'E', value_text: 'E' },
    { value: 'Em', value_text: 'Em' },
    { value: 'F', value_text: 'F' },
    { value: 'Fm', value_text: 'Fm' },
    { value: 'F#', value_text: 'F#' },
    { value: 'F#m', value_text: 'F#m' },
    { value: 'Gb', value_text: 'Gb' },
    { value: 'Gbm', value_text: 'Gbm' },
    { value: 'G', value_text: 'G' },
    { value: 'Gm', value_text: 'Gm' },
    { value: 'G#', value_text: 'G#' },
    { value: 'G#m', value_text: 'G#m' }
  ];

  this.current_person = ko.observable();
  this.current_band = ko.observable();

  this.current_band_member = ko.computed(function() {
    if (this.current_band() && this.current_person()) {
      var members = this.current_band().bandMemberList();
      var result = ko.utils.arrayFirst(members, function(member_row) {
        return member_row.person_id() == this.current_person().id();
      }.bind(this))
      return result;
    } else {
      return null;
    }
  }.bind(this));

  this.current_band_list = ko.computed(function() {
    if (this.current_person()) {
      return ko.utils.arrayMap(this.current_person().bandMemberList(), function(member) {
        return member.band();
      });
    } else {
      return [];
    }
  }.bind(this));

  this.current_full_name = ko.computed(function() {
    if (this.current_person()) {
      return this.current_person().full_name();
    } else {
      return null;
    }
  }.bind(this));

  this.current_is_system_admin = ko.computed(function() {
    if (this.current_person()) {
      return this.current_person().system_admin();
    } else {
      return false;
    }
  }.bind(this));

  this.createBandTable();
  this.createPersonTable();
  this.createArtistTable();
  this.createSongTable();
  this.createBandMember();
  this.createBandSong();
  this.createSongRating();
  this.createRequest();

  // XXX this.reports = new ReportList();

//XXX This sucks.  Do it better.
  this.tab_list = ko.computed(function() {

    var result = tab_list = [
/*
      { value: 3, value_text: 'My Bands' },
*/
      { value: 4, value_text: 'Band Members' },
      { value: 5, value_text: 'Artists' },
      { value: 6, value_text: 'All Songs' }/*,
      { value: 7, value_text: 'Band Songs' }
*/
    ];

    if (this.current_person() && this.current_person().system_admin()) {
      result.unshift({ value: 2, value_text: 'All People' });
      result.unshift({ value: 1, value_text: 'All Bands' });
    }
/*
    result.unshift({ value: 0, value_text: 'Dashboard' });
*/

    return result;
  }.bind(this));

  this.current_tab = ko.observable(this.tab_list[0]);

/* XXX It's possible I can eliminate this whole block of code
  this.current_bands = ko.computed(function() {
    return ko.utils.arrayMap(
      this.current_person().bandMemberList(),
      function(member_row) { return member_row.band() }
    );
  }.bind(this)).extend({ throttle: 50 });

  this.non_band_songs = ko.computed(function() {
    if (this.current_band()) {
      return ko.utils.arrayFilter(this.songs.list(), function(song_row) {
        var filter = orm.table.list.filter.columnFilterFactory(
          song_row.bandSongList,
          'equal',
          'band_id'
        );
        filter.setFilterValue(this.current_band().id());
        return filter.getList().length == 0;
      }.bind(this));
    } else {
      return this.songs.list();
    }
  }.bind(this)).extend({ throttle: 50 });
*/

/*
  this.current_reports = ko.computed(function() {
    if (this.current_band() && this.current_band().id() > 0) {
      var band_reports = this.reports.list()[this.current_band().id()] || ko.observableArray();
      return band_reports().sort(function(a, b) {
        if (! a.name().match(/_([0-9]+)\.html$/)) {
          if (a.name() == b.name()) return 0;
          return -1;
        }
        if (! b.name().match(/_([0-9]+)\.html$/)) {
          if (a.name() == b.name()) return 0;
          return 1;
        }
        if (a.name() > b.name()) return -1;
        if (a.name() < b.name()) return 1;
        return 0;
      });
    } else {
      return [];
    }
  }.bind(this)).extend({ throttle: 50 });
*/

/*
  this.request_msg = ko.observable('');
  this.send_request_action = function(data, event) {
    request_action = event.target.parentElement.querySelector('select').value;
    if (request_action == 'delete') {
      data.delete(function(result_code, result) {
        if (result_code != 200 && result_code != 304) {
          this.request_msg(result);
        } else {
          this.band_members.load();
          this.song_ratings.load();
          this.request_msg('');
        }
      }.bind(this), event);
    } else if (request_action != '') {
      data.change_status(request_action, function(result_code, result) {
        if (result_code != 200 && result_code != 304) {
          this.request_msg(result);
        } else {
          if (result.band_member) {
            this.band_members.insertNew(result.band_member);
          }

          if (result.song_ratings) {
            this.song_ratings.insertList(result.song_ratings);
          }

          this.request_msg('');
        }
      }.bind(this), event);
    }
  }.bind(this);

  this.testClick = function() {
    console.log('Test Click');
  };
*/
}

Manager.prototype.createBandTable = function() {
  this.band = orm.define(
    this,
    'band',
    {name: {type: 'string'}},
    {
      computes: [{
        name: 'is_populated',
        compute: function(row) {
          return row.bandSongCount() || row.bandMemberCount();
        }.bind(this)
      }, {
        name: 'otherPersons',
        compute: function(row) {
          var person_list = ko.utils.arrayFilter(this.person.list.list(), function(person) {
            var members = this.band_member.list.find({
              person_id: person.id,
              band_id: row.id
            });
            return (!members) || members.length <= 0;
          }.bind(this));
          return person_list.sort(function(a, b) {
            if (a.full_name() < b.full_name()) return -1;
            if (a.full_name() > b.full_name()) return 1;
            if (a.name() < b.name()) return -1;
            if (a.name() > b.name()) return 1;
            return 0;
          });
        }.bind(this)
      }],
      filters: [{
        name: 'max_song_count',
        type: 'max',
        column_name: 'bandSongCount'
      }, {
        name: 'min_song_count',
        type: 'min',
        column_name: 'bandSongCount'
      }, {
        name: 'max_member_count',
        type: 'max',
        column_name: 'bandMemberCount'
      }, {
        name: 'min_member_count',
        type: 'min',
        column_name: 'bandMemberCount'
      }, {
        name: 'name',
        type: 'match',
        column_name: 'name'
      }],
      sort: [{
        name: 'name_asc',
        label: 'Name (Lo-Hi)',
        definition: {name: 'asc'}
      }, {
        name: 'name_desc',
        label: 'Name (Hi-Lo)',
        definition: {name: 'desc'}
      }, {
        name: 'member_asc',
        label: 'Member Count (Lo-Hi)',
        definition: {bandMemberCount: 'asc'}
      }, {
        name: 'member_desc',
        label: 'Member Count (Hi-Lo)',
        definition: {bandMemberCount: 'desc'}
      }, {
        name: 'song_asc',
        label: 'Song Count (Lo-Hi)',
        definition: {bandSongCount: 'asc'}
      }, {
        name: 'song_desc',
        label: 'Song Count (Hi-Lo)',
        definition: {bandSongCount: 'desc'}
      }]
    }
  );
};

Manager.prototype.createPersonTable = function() {
  this.person = orm.define(this, 'person', {
    name: {type: 'string'},
    full_name: {type: 'string'},
    email: {type: 'string'},
    system_admin: {type: 'boolean'}
  }, {
    computes: [{
      name: 'bandList',
      sub_join: 'bandMemberList',
      join_list: 'band'
    }, {
      name: 'otherBands',
      compute: function(row) {
        var band_list = ko.utils.arrayFilter(this.band.list.list(), function(band) {
          var members = this.band_member.list.find({
            person_id: row.id,
            band_id: band.id
          });
          return (!members) || members.length <= 0;
        }.bind(this));
        return band_list.sort(function(a, b) {
          if (a.name() < b.name()) return -1;
          if (a.name() > b.name()) return 1;
          return 0;
        });
      }.bind(this)
    }],
    filters: [{
      name: 'max_band_count',
      type: 'max',
      column_name: 'bandMemberCount'
    }, {
      name: 'min_band_count',
      type: 'min',
      column_name: 'bandMemberCount'
    }, {
      name: 'system_admin',
      type: 'bool',
      column_name: 'system_admin'
    }, {
      name: 'email',
      type: 'match',
      column_name: 'email'
    }, {
      name: 'full_name',
      type: 'match',
      column_name: 'full_name'
    }, {
      name: 'name',
      type: 'match',
      column_name: 'name'
    }],
    sort: [{
      name: 'name_asc',
      label: 'Name (Lo-Hi)',
      definition: {name: 'asc'}
    }, {
      name: 'name_desc',
      label: 'Name (Hi-Lo)',
      definition: {name: 'desc'}
    }, {
      name: 'full_name_asc',
      label: 'Full Name (Lo-Hi)',
      definition: {full_name: 'asc'}
    }, {
      name: 'full_name_desc',
      label: 'Full Name (Hi-Lo)',
      definition: {full_name: 'desc'}
    }, {
      name: 'email_asc',
      label: 'E-Mail (Lo-Hi)',
      definition: {email: 'asc'}
    }, {
      name: 'email_desc',
      label: 'E-Mail (Hi-Lo)',
      definition: {email: 'desc'}
    }]
  });
};

Manager.prototype.createArtistTable = function() {
  this.artist = orm.define(this, 'artist', {
    name: {type: 'string'}
  }, {
    filters: [{
      name: 'max_song_count',
      type: 'max',
      column_name: 'songCount'
    }, {
      name: 'min_song_count',
      type: 'min',
      column_name: 'songCount'
    }, {
      name: 'name',
      type: 'match',
      column_name: 'name'
    }],
    sort: [{
      name: 'name_asc',
      label: 'Name (Lo-Hi)',
      definition: {name: 'asc'}
    }, {
      name: 'name_desc',
      label: 'Name (Hi-Lo)',
      definition: {name: 'desc'}
    }, {
      name: 'song_count_asc',
      label: 'Song Count (Lo-Hi)',
      definition: {songCount: 'asc'}
    }, {
      name: 'song_count_desc',
      label: 'Song Count (Hi-Lo)',
      definition: {songCount: 'desc'}
    }]
  });
};

Manager.prototype.createSongTable = function() {
  this.song = orm.define(this, 'song', {
    name: {type: 'string'},
    artist_id: {type: 'reference', reference_table: this.artist},
    key_signature: {type: 'enum', value_map: this.key_signature_map}
  }, {
    filters: [{
      name: 'max_band_count',
      type: 'max',
      column_name: 'bandCount'
    }, {
      name: 'min_band_count',
      type: 'min',
      column_name: 'bandCount'
    }, {
      name: 'artist_id',
      type: 'id',
      select_list: {
        row_list: this.artist.list,
        label_column: 'name'
      },
      column_name: 'artist_id'
    }, {
      name: 'name',
      type: 'match',
      column_name: 'name'
    }],
    sort: [{
      name: 'name_asc',
      label: 'Name (Lo-Hi)',
      definition: {name: 'asc'}
    }, {
      name: 'name_desc',
      label: 'Name (Hi-Lo)',
      definition: {name: 'desc'}
    }, {
      name: 'artist_name_asc',
      label: 'Artist Name (Lo-Hi)',
      definition: {artist_name: 'asc'}
    }, {
      name: 'artist_name_desc',
      label: 'Artist Name (Hi-Lo)',
      definition: {artist_name: 'desc'}
    }],
    computes: [{
      name: 'artist_name',
      parent: 'artist',
      column_name: 'name'
    }]
  });
};

Manager.prototype.createBandMember = function() {
  this.band_member = orm.define(this, 'band_member', {
    band_id: {type: 'reference', reference_table: this.band},
    person_id: {type: 'reference', reference_table: this.person},
    band_admin: {type: 'boolean'}
  }, {
    computes: [{
      name: 'band_name',
      parent: 'band',
      column_name: 'name'
    }, {
      name: 'person_full_name',
      parent: 'person',
      column_name: 'full_name'
    }, {
      name: 'person_email',
      parent: 'person',
      column_name: 'email'
    }],
    views: [{
      name: 'person_bands',
      filters: [{
        name: 'band_name',
        type: 'match',
        column_name: 'band_name'
      }],
      sort: [{
        name: 'band_name_asc',
        label: 'Band Name (Lo-Hi)',
        definition: {band_name: 'asc'}
      }, {
        name: 'band_name_desc',
        label: 'Band Name (Hi-Lo)',
        definition: {band_name: 'desc'}
      }]
    }, {
      name: 'band_persons',
      filters: [{
        name: 'band_admin',
        type: 'bool',
        column_name: 'band_admin'
      }, {
        name: 'person_email',
        type: 'match',
        column_name: 'person_email'
      }, {
        name: 'person_full_name',
        type: 'match',
        column_name: 'person_full_name'
      }],
      sort: [{
        name: 'person_full_name_asc',
        label: 'Member Full Name (Lo-Hi)',
        definition: {person_full_name: 'asc'}
      }, {
        name: 'person_full_name_desc',
        label: 'Member Full Name (Hi-Lo)',
        definition: {person_full_name: 'desc'}
      }, {
        name: 'person_email_asc',
        label: 'Member E-Mail Name (Lo-Hi)',
        definition: {person_email: 'asc'}
      }, {
        name: 'person_email_desc',
        label: 'Member E-Mail (Hi-Lo)',
        definition: {person_email: 'desc'}
      }]
    }]
  });

  this.band_member.otherPersons = ko.computed(function() {
    if (this.current_band()) {
      return this.current_band().otherPersons();
    } else {
      return [];
    }
  }.bind(this)).extend({ throttle: 500 });

  this.band_member.otherBands = ko.computed(function() {
    if (this.current_person()) {
      return this.current_person().otherBands();
    } else {
      return [];
    }
  }.bind(this)).extend({ throttle: 500 });

  this.band_member.add_member_form = {
    showForm: function(show_form_object, element) {
      this.band_member.showForm(this.band_member, element);
      this.band_member.form.row.band_id(this.current_band().id());
      this.band_member.form.row.band_admin(false);
    }.bind(this)
  };
};

Manager.prototype.createBandSong = function() {
  this.band_song = orm.define(this, 'band_song', {
    band_id: {type: 'reference', reference_table: this.band},
    song_id: {type: 'reference', reference_table: this.song},
    song_status: {type: 'integer'}, //XXX S.B. enum
    key_signature: {type: 'string'},
    primary_vocal_id: {type: 'reference', reference_table: this.band_member},
    secondary_vocal_id: {type: 'reference', reference_table: this.band_member}
  }, {
    computes: [{
      name: 'band_name',
      parent: 'band',
      column_name: 'name'
    }, {
      name: 'song_name',
      parent: 'song',
      column_name: 'name'
    }, {
      name: 'artist_id',
      parent: 'song',
      column_name: 'artist_id'
    }, {
      name: 'artist_name',
      parent: 'song',
      column_name: 'artist_name'
    }, {
      name: 'average_rating',
      average: 'songRatingList',
      column_name: 'rating'
    }, {
      name: 'currentMemberRating',
      crossref: this.current_band_member,
      details: 'songRatingList',
      column_name: 'band_member_id'
    }, {
      name: 'member_rating',
      parent: 'currentMemberRating',
      column_name: 'rating'
    }, {
      name: 'is_new',
      parent: 'currentMemberRating',
      column_name: 'is_new'
    }],
    filters: [{
      name: 'is_new',
      type: 'bool',
      column_name: 'is_new'
    }, {
      name: 'max_average_rating',
      type: 'max',
      column_name: 'average_rating'
    }, {
      name: 'min_average_rating',
      type: 'min',
      column_name: 'average_rating'
    }, {
      name: 'max_song_status',
      type: 'max',
      column_name: 'song_status'
    }, {
      name: 'min_song_status',
      type: 'min',
      column_name: 'song_status'
    }, {
      name: 'artist_id',
      type: 'id',
      select_list: {
        row_list: this.artist.list,
        label_column: 'name'
      },
      column_name: 'artist_id'
    }],
    sort: [{
      name: 'song_name_asc',
      label: 'Song Name (Lo-Hi)',
      definition: {song_name: 'asc'}
    }, {
      name: 'song_name_desc',
      label: 'Song Name (Hi-Lo)',
      definition: {song_name: 'desc'}
    }, {
      name: 'artist_name_asc',
      label: 'Artist Name (Lo-Hi)',
      definition: {artist_name: 'asc'}
    }, {
      name: 'artist_name_desc',
      label: 'Artist Name (Hi-Lo)',
      definition: {artist_name: 'desc'}
    }, {
      name: 'average_rating_asc',
      label: 'Average Rating (Lo-Hi)',
      definition: {average_rating: 'asc'}
    }, {
      name: 'average_rating_desc',
      label: 'Average Rating (Hi-Lo)',
      definition: {average_rating: 'desc'}
    }]
  });
};

Manager.prototype.createSongRating = function() {
  this.song_rating = orm.define(this, 'song_rating', {
    band_member_id: {type: 'reference', reference_table: this.band_member},
    band_song_id: {type: 'reference', reference_table: this.band_song},
    rating: {type: 'integer'},
    is_new: {type: 'boolean'},
  });
};

Manager.prototype.request_actions = function(row) {
  var possible_actions = [{
    value: 'delete',
    label: 'Delete',
    permissions: 'originator',
    status: 'resolved'
  }, {
    value: 'reopen',
    label: 'Reopen',
    permissions: 'originator',
    status: 'rejected'
  }, {
    value: 'accept',
    label: 'Accept',
    permissions: 'owner',
    status: 'pending'
  }, {
    value: 'reject',
    label: 'Reject',
    permissions: 'owner_or_originator',
    status: 'pending'
  }];

  var is_originator = function() {
    return (manager.current_person().system_admin() ||
            (row.request_type() == constants.request_type.join_band && row.isSelf()) ||
            (row.request_type() == constants.request_type.add_band_member && row.isAdmin()));
  };

  var is_owner = function() {
    return (manager.current_person().system_admin() ||
            (row.request_type() == constants.request_type.join_band && row.isAdmin()) ||
            (row.request_type() == constants.request_type.add_band_member && row.isSelf()));
  };

  return possible_actions.filter(function(action) {
    if (action.permissions === 'originator' && is_originator() ||
        action.permissions === 'owner' && is_owner() ||
        action.permissions === 'owner_or_originator' && (is_owner() || is_originator())) {
      return ((action.status === 'resolved' &&
               (row.status() == constants.request_status.accepted ||
                row.status() == constants.request_status.rejected)) ||
              (action.status === 'rejected' &&
               row.status() == constants.request_status.rejected) ||
              (action.status === 'pending' &&
               (row.status() == constants.request_status.pending)));
    }
    return false;
  });
};

Manager.prototype.createRequest = function() {
  this.request = orm.define(this, 'request', {
    request_type: {type: 'integer'},
    timestamp: {type: 'date'},
    person_id: {type: 'reference', reference_table: this.person},
    band_id: {type: 'reference', reference_table: this.band},
    description: {type: 'string'},
    status: {type: 'integer'}
  }, {
    computes: [{
      name: 'person_name',
      parent: 'person',
      column_name: 'name'
    }, {
      name: 'band_name',
      parent: 'band',
      column_name: 'name'
    }, {
      name: 'pretty_request_type',
      map: constants.pretty_request_type,
      column_name: 'request_type'
    }, {
      name: 'pretty_status',
      map: constants.pretty_request_status,
      column_name: 'status'
    }, {
      name: 'is_admin',
      compute: function(row) {
        var members = ko.utils.arrayFilter(row.person().bandMemberList(), function(member) {
          return member.band_id() == row.bind_id() && member.band_admin();
        });
        return members.length > 0;
      }.bind(this)
    }, {
      name: 'actions_list',
      compute: this.request_actions.bind(this)
    }],
    filters: [{
      name: 'request_type',
      type: 'map',
      column_name: 'request_type',
      map: constants.pretty_request_type
    }],
    sort: [{
      name: 'time_asc',
      label: 'Request Time (Lo-Hi)',
      definition: {timestamp: 'asc'}
    }, {
      name: 'time_desc',
      label: 'Request Time (Hi-Lo)',
      definition: {timestamp: 'desc'}
    }]
  });
};

Manager.prototype.loadTables = function(cb) {
  this.loadBands_()
    .then(this.loadPersons_())
    .then(this.loadSession_())
    .then(this.loadMembers_())
    .then(this.loadArtists_())
    .then(this.loadSongs_())
    .then(this.loadBandSongs_())
    .then(this.loadSongRatings_())
    .then(this.loadRequests_())
    .then(cb)
    .done();
};

Manager.prototype.loadBands_ = function() {
  return Q.promise(function(resolve, reject, notify) {
    this.band.load(function(err, result) {
      if (err) return reject(err, result);
      return resolve(null, result);
    });
  }.bind(this));
};

Manager.prototype.loadPersons_ = function() {
  return Q.promise(function(resolve, reject, notify) {
    this.person.load(function(err, result) {
      if (err) return reject(err, result);
      return resolve(null, result);
    });
  }.bind(this));
};

Manager.prototype.loadSession_ = function() {
  return Q.promise(function(resolve, reject, notify) {
    var svc = service.getInstance();
    svc.get('./session_info', function(result_code, result) {
      if (result_code != 200 && result_code != 304) {
        reject(new Error('Unexpected result ' + result_code));
      }

      this.current_person(this.person.list.get(result.person.id));
      resolve(null, result);
    }.bind(this));
  }.bind(this));
};

Manager.prototype.loadMembers_ = function() {
  return Q.promise(function(resolve, reject, notify) {
    this.band_member.load(function(err, result) {
      if (err) return reject(err, result);

      if (result.length > 0) {
        var memberships = this.current_person().bandMemberList();

        if (memberships.length > 0) {
          this.current_band(this.band.list.get(memberships[0].band_id()));
        }
      }

      return resolve(null, result);
    }.bind(this));
  }.bind(this));
};

Manager.prototype.loadArtists_ = function() {
  return Q.promise(function(resolve, reject, notify) {
    this.artist.load(function(err, result) {
      if (err) return reject(err, result);
      return resolve(null, result);
    });
  }.bind(this));
};

Manager.prototype.loadSongs_ = function() {
  return Q.promise(function(resolve, reject, notify) {
    this.song.load(function(err, result) {
      if (err) return reject(err, result);
      return resolve(null, result);
    });
  }.bind(this));
};

Manager.prototype.loadBandSongs_ = function() {
  return Q.promise(function(resolve, reject, notify) {
    this.band_song.load(function(err, result) {
      if (err) return reject(err, result);
      return resolve(null, result);
    });
  }.bind(this));
};

Manager.prototype.loadSongRatings_ = function() {
  return Q.promise(function(resolve, reject, notify) {
    this.song_rating.load(function(err, result) {
      if (err) return reject(err, result);
      return resolve(null, result);
    });
  }.bind(this));
};

Manager.prototype.loadRequests_ = function() {
  return Q.promise(function(resolve, reject, notify) {
    this.request.load(function(err, result) {
      if (err) return reject(err, result);
      return resolve(null, result);
    });
  }.bind(this));
};
