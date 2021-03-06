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
  this.createReport();
  this.createRehearsalPlan();
  this.createRehearsalPlanRunThroughSong();
  this.createRehearsalPlanLearningSong();

  this.tab_list = ko.computed(function() {
    var result = [
      { value: 3, value_text: 'My Bands' },
      { value: 4, value_text: 'Band Members' },
      { value: 5, value_text: 'Artists' },
      { value: 6, value_text: 'All Songs' },
      { value: 7, value_text: 'Band Songs' }
    ];

    if (this.current_person() && this.current_person().system_admin()) {
      result.unshift({ value: 2, value_text: 'All People' });
      result.unshift({ value: 1, value_text: 'All Bands' });
    }

    result.unshift({ value: 0, value_text: 'Dashboard' });

    return result;
  }.bind(this));

  this.current_tab = ko.observable(this.tab_list[0]);

  var person_menu = document.querySelector('#person_edit');
  this.showPersonDropDown = function(row, event) {
    var person_menu = document.querySelector('#person_edit');

    var handlePersonMenuSelect = function(event) {
      console.log(event);
      person_menu.removeEventListener('select', handlePersonMenuSelect);

      if (event.target.value == 'profile') {
        row.showForm(row, event);
      } else if (event.target.value == 'password') {
        row.table.change_password_form.showForm(row, event);
      } else {
        console.log('invalid selection');
      }
    }

    person_menu.show(event);
    person_menu.addEventListener('select', handlePersonMenuSelect);
  }.bind(this);

  this.dashboard_list = ko.observable('');

  this.dashboard_click = function(object, event) {
    var target = event.target;
    this.dashboard_list(target.attributes.getNamedItem('name').value);
  }.bind(this);

  this.testClick = function() {
    console.log('Test Click');
  };
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
      }, {
        name: 'otherSongs',
        compute: function(row) {
          var song_list = ko.utils.arrayFilter(this.song.list.list(), function(song) {
            var songs = this.band_song.list.find({
              song_id: song.id,
              band_id: row.id
            });
            return (!songs) || songs.length <= 0;
          }.bind(this));
          return song_list.sort(function(a, b) {
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

  this.person.edit_profile_form = {
    showForm: function(show_form_object, event) {
      this.current_person().showForm(this.current_person(), event, '/forms/person.html');
    }.bind(this)
  };

  this.person.change_password_form = {
    showForm: function(show_form_object, event) {
      var row = {
        id: ko.observable(show_form_object.id()),
        old_password: ko.observable(),
        new_password: ko.observable(),
        confirm_password: ko.observable()
      };
      Object.keys(show_form_object.table.columns).forEach(function(column_name) {
        row[column_name] = ko.observable(show_form_object[column_name]()); 
      })
      show_form_object.showForm(
        row, event, '/forms/change_password.html',
        function(form_element, form_columns, data) {
          if (data.old_password() && data.old_password().length > 0) {
            if (data.new_password() && data.new_password().length > 0) {
              if (data.new_password() !== data.confirm_password()) {
                this.form.setMessage('Passwords do not match');
                return false;
              }
            } else {
              this.form.setMessage('Please provide a new password');
              return false;
            }
          } else {
            this.form.setMessage('Please provide old password');
            return false;
          }
          this.form.clearMessage();
          return true;
        }.bind(show_form_object), function(data, column_names, callback) {
          var pk = document.querySelector('input[name="pubkey"]').value;
          var ct = JSON.stringify([
            data.old_password(),
            data.new_password()
          ]);
          var encrypted_ct = util.encrypt(pk, ct);
          callback({ id: data.id(), token: encrypted_ct });
        },
        {
          old_password: 'string',
          new_password: 'string',
          confirm_password: 'string',
        }
      );
    }.bind(this)
  };
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
      name: 'max_band_song_count',
      type: 'max',
      column_name: 'bandSongCount'
    }, {
      name: 'min_band_song_count',
      type: 'min',
      column_name: 'bandSongCount'
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
    }, {
      name: 'description',
      compute: function(row) {
        return row.name() + ' by ' + row.artist_name();
      }
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
    }, {
      name: 'description',
      compute: function(row) {
        return row.person_full_name() + ' of ' + row.band_name();
      }
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

  this.band_member.add_member_form = {
    showForm: function(show_form_object, event) {
      this.request.showForm(this.request, event, '/forms/band_member.html');
      this.request.form.row.band_id(this.current_band().id());
    }.bind(this)
  };

  this.band_member.join_band_form = {
    showForm: function(show_form_object, event) {
      this.request.showForm(this.request, event, '/forms/join_band.html');
      this.request.form.row.person_id(this.current_person().id());
    }.bind(this)
  };
};

Manager.prototype.createBandSong = function() {
  this.band_song = orm.define(this, 'band_song', {
    band_id: {type: 'reference', reference_table: this.band},
    song_id: {type: 'reference', reference_table: this.song},
    song_status: {type: 'enum', value_map: this.song_status_map},
    key_signature: {type: 'enum', value_map: this.key_signature_map},
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
      name: 'description',
      parent: 'song',
      column_name: 'description'
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
      type: 'equal',
      column_name: 'is_new'
    }, {
      name: 'max_average_rating',
      type: 'max_float',
      column_name: 'average_rating'
    }, {
      name: 'min_average_rating',
      type: 'min_float',
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
    }, {
      name: 'song_name',
      type: 'match',
      column_name: 'song_name'
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
    }, {
      name: 'song_status_asc',
      label: 'Song Status (Lo-Hi)',
      definition: { song_status: 'asc' }
    }, {
      name: 'song_status_desc',
      label: 'Song Status (Hi-Lo)',
      definition: { song_status: 'desc' }
    }]
  });

  this.band_song.otherSongs = ko.computed(function() {
    if (this.current_band()) {
      return this.current_band().otherSongs();
    } else {
      return [];
    }
  }.bind(this)).extend({rateLimit: orm.max_compute_rate, method: 'notifyWhenChangeStop'});

  this.band_song.add_song_form = {
    showForm: function(show_form_object, event) {
      this.band_song.showForm(this.band_song, event);
      this.band_song.form.row.band_id(this.current_band().id());
      this.band_song.form.row.key_signature('');
      this.band_song.form.row.song_status(-1);
    }.bind(this)
  };
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
    return ((manager.current_person() && manager.current_person().system_admin()) ||
            (row.request_type() == constants.request_type.join_band && row.isSelf()) ||
            (row.request_type() == constants.request_type.add_band_member && row.isAdmin()));
  };

  var is_owner = function() {
    return ((manager.current_person() && manager.current_person().system_admin()) ||
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
        var person = row.person();

        if (person) {
          var members = ko.utils.arrayFilter(person.bandMemberList(), function(member) {
            return member.band_id() == row.band_id() && member.band_admin();
          });
          return members.length > 0;
        } else {
          return false;
        }
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

  this.request.applyRequestAction = function(row, event) {
    var target = event.target;
    var action = target.value;

    if (action) {
      if (action === 'delete') {
        var del_row = this.list.get(row.id());
        del_row.deleteRow(row, event, function(err) {
          if (err) {
            this.last_error = err;
            target.value = '';
          } else {
            this.last_error = null;
          }
        }.bind(this));
      } else {
        row.modify({id: row.id()}, target);
      }
    }
  }.bind(this.request);
};

Manager.prototype.createReport = function() {
  this.report = orm.define(this, 'report', {
    name: {type: 'string' },
    band_id: {type: 'reference', reference_table: this.band},
    report_type: {type: 'string'},
    timestamp: {type: 'date'},
  }, {
    computes: [{
      name: 'band_name',
      parent: 'band',
      column_name: 'name'
    }, {
      name: 'url',
      compute: function(row) {
        return '/report/' + row.band_id() + '/' + row.name();
      }
    }],
    filters: [{
      name: 'report_type',
      type: 'match',
      column_name: 'report_type'
    }, {
      name: 'name',
      type: 'match',
      column_name: 'name'
    }],
    sort: [{
      name: 'name_asc',
      label: 'Report Name (Lo-Hi)',
      definition: {name: 'asc'}
    }, {
      name: 'name_desc',
      label: 'Report Name (Hi-Lo)',
      definition: {name: 'desc'}
    }, {
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

Manager.CreatePlanForm = function(context_base) {
  this.context_base = context_base;

  this.handleEvent = function(e) {
    if (e.type === 'change' && e.target.tagName.toLowerCase() === 'date-selector') {
      var request = this.loadLists(e.target.value, this.context_base.current_band());
      request.get()
        .then(function(list_result) {
          this.initializeLists(list_result);
        }.bind(this))
        .fail(function(err) {
          throw err;
        });
    }
  };
};

Manager.CreatePlanForm.prototype.showForm = function(show_form_object, event) {
  // Knockout will call this with 'this' set to the Manager object
  this.rehearsal_plan.form = new orm.form(
    '/forms/create_rehearsal_plan.html',
    {
      rehearsal_date: {type: 'date'},
      run_through_unselected: {type: 'array'},
      run_through_selected: {type: 'array'},
      learning_unselected: {type: 'array'},
      learning_selected: {type: 'array'}
    },
    function(form_element, form_columns, data) {
      return true;
    }.bind(this),
    function(data, column_names, callback) {
      callback({
        band_id: this.context_base.current_band().id(),
        rehearsal_date: data.rehearsal_date().toISOString().substr(0, 10),
        run_through_songs: this.mapSelectedSongs(data.run_through_selected()),
        learning_songs: this.mapSelectedSongs(data.learning_selected())
      });
    }.bind(this.rehearsal_plan.create_plan_form)
  );

  this.rehearsal_plan.form.on('show', function(form_element) {
    var request = this.rehearsal_plan.create_plan_form.loadLists(new Date(), this.current_band());
    request.get()
      .then(function(list_result) {
        this.initializeLists(list_result);
        this.dsel = form_element.querySelector('date-selector');
        this.dsel.addEventListener('change', this);
      }.bind(this.rehearsal_plan.create_plan_form))
      .fail(function(err) {
        throw err;
      });
  }.bind(this));

  this.rehearsal_plan.form.on('update', function(result) {
    var last_err;
    this.rehearsal_plan.updateFromResult(result, function(err) {
      if (err) {
        last_err = err;
        this.form.setMessage(err.toString());
      }
    }.bind(this.rehearsal_plan));
    return last_err == null;
  }.bind(this));

  this.rehearsal_plan.form.on('dispose', function() {
    this.dsel.removeEventListener('change', this);
    desl = null;
  }.bind(this.rehearsal_plan.create_plan_form));

  this.rehearsal_plan.form.show('/rehearsal_plan', 'Create');
};

Manager.CreatePlanForm.prototype.loadLists = function(query_date, band) {
    var query_date_str = query_date.toISOString().substr(0, 10);
    var url = '/plan_lists?band_id=' +
      band.id() +
      '&rehearsal_date=' + query_date_str;

    return Ajax.getInstance().getRequest(url, 'json');
};

Manager.CreatePlanForm.prototype.initializeLists = function(list_result) {
  var form = this.context_base.rehearsal_plan.form;

  var rehearsal_date = new Date();
  var date_parts = list_result.rehearsal_date.substr(0, 10).split('-');
  rehearsal_date.setFullYear(date_parts[0]);
  rehearsal_date.setMonth(date_parts[1] - 1);
  rehearsal_date.setDate(date_parts[2]);

  form.row.rehearsal_date(rehearsal_date);
  form.row.run_through_selected([]);
  form.row.learning_selected([]);
  form.row.run_through_unselected(
    this.mapUnselectedSongs(list_result.run_through_songs)
  );

  form.row.learning_unselected(
    this.mapUnselectedSongs(list_result.learning_songs)
  );
};

Manager.CreatePlanForm.prototype.mapSelectedSongs = function(list) {
  var sequence = 1;
  var params = list.map(function (song) {
    return {
      band_song_id: song.value(),
      sequence: sequence++
    };
  });
  return JSON.stringify(params);
};

Manager.CreatePlanForm.prototype.mapUnselectedSongs = function(list) {
  var sequence = 0;
  return list.map(function(song) {
    sequence++;
    return {
      sort_key: ko.observable(sequence),
      value: ko.observable(song.band_song_id),
      description: ko.computed(function() {
        var display_date = song.last_rehearsal_date ?
          new Date(song.last_rehearsal_date).toDateString() :
          'Never';

        var display_status = this.context_base.song_status_map.filter(function(map_row) {
          return map_row.value == song.song_status;
        })[0].value_text;

        return '(' + sequence + ')' + song.song_name + ': ' + display_status + '(' + display_date + ')';
      }.bind(this))
    };
  }.bind(this));
};

Manager.prototype.showCreatePlanForm_ = function(show_form_object, event) {
};

Manager.prototype.createRehearsalPlan = function() {
  this.rehearsal_plan = orm.define(this, 'rehearsal_plan', {
    band_id: {type: 'reference', reference_table: this.band},
    rehearsal_date: {type: 'date'}
  }, {
/*
    computes: [{
    }],
*/
    filters: [{
      name: 'max_rehearsal_plan_run_through_song_count',
      type: 'max',
      column_name: 'rehearsalPlanRunThroughSongCount'
    }, {
      name: 'min_rehearsal_plan_run_through_song_count',
      type: 'min',
      column_name: 'rehearsalPlanRunThroughSongCount'
    }, {
      name: 'max_rehearsal_plan_learning_song_count',
      type: 'max',
      column_name: 'rehearsalPlanLearningSongCount'
    }, {
      name: 'min_rehearsal_plan_learning_song_count',
      type: 'min',
      column_name: 'rehearsalPlanLearningSongCount'
    }],
    sort: [{
      name: 'date_asc',
      label: 'Rehearsal Date (Lo-Hi)',
      definition: {rehearsal_date: 'asc'}
    }, {
      name: 'date_desc',
      label: 'Rehearsal Date (Hi-Lo)',
      definition: {rehearsal_date: 'desc'}
    }]
  });

  this.rehearsal_plan.create_plan_form = new Manager.CreatePlanForm(this);
};

Manager.prototype.createRehearsalPlanRunThroughSong = function() {
  this.rehearsal_plan_run_through_song = orm.define(this, 'rehearsal_plan_run_through_song', {
    rehearsal_plan_id: {type: 'reference', reference_table: this.rehearsal_plan},
    sequence: {type: 'integer'},
    band_song_id: {type: 'reference', reference_table: this.band_song}
/*
  }, {
    computes: [],
    filters: [],
    sort: []
*/
  });
};

Manager.prototype.createRehearsalPlanLearningSong = function() {
  this.rehearsal_plan_learning_song = orm.define(this, 'rehearsal_plan_learning_song', {
    rehearsal_plan_id: {type: 'reference', reference_table: this.rehearsal_plan},
    sequence: {type: 'integer'},
    band_song_id: {type: 'reference', reference_table: this.band_song}
/*
  }, {
    computes: [],
    filters: [],
    sort: []
*/
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
    .then(this.loadReports_())
    .then(this.loadRehearsalPlan_())
    .then(this.loadRehearsalPlanRunThroughSongs_())
    .then(this.loadRehearsalPlanLearningSongs_())
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
        var iv = setInterval(function() {
          if (this.current_person()) {
            var memberships = this.current_person().bandMemberList();

            if (memberships.length > 0) {
              this.current_band(this.band.list.get(memberships[0].band_id()));
            }
            
            clearInterval(iv);
          }
        }.bind(this), 500);
        
        return resolve(null, result);
      }
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

Manager.prototype.loadReports_ = function() {
  return Q.promise(function(resolve, reject, notify) {
    this.report.load(function(err, result) {
      if (err) return reject(err, result);
      return resolve(null, result);
    });
  }.bind(this));
};

Manager.prototype.loadRehearsalPlan_ = function() {
  return Q.promise(function(resolve, reject, notify) {
    this.rehearsal_plan.load(function(err, result) {
      if (err) return reject(err, result);
      return resolve(null, result);
    });
  }.bind(this))
};

Manager.prototype.loadRehearsalPlanRunThroughSongs_ = function() {
  return Q.promise(function(resolve, reject, notify) {
    this.rehearsal_plan_run_through_song.load(function(err, result) {
      if (err) return reject(err, result);
      return resolve(null, result);
    });
  }.bind(this))
};

Manager.prototype.loadRehearsalPlanLearningSongs_ = function() {
  return Q.promise(function(resolve, reject, notify) {
    this.rehearsal_plan_learning_song.load(function(err, result) {
      if (err) return reject(err, result);
      return resolve(null, result);
    });
  }.bind(this))
};
