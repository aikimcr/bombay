var manager;

ko.bindingHandlers.searchableSelect = Sapphire.searchableSelect;

ko.bindingHandlers.clickRating = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var getTargetValue = function(event) {
        return parseInt(event.target.getAttribute('value'));
      };

      element.classList.add('rating_container');
      for (var i = 1; i <= 5; i++) {
        var clicker = document.createElement('div');
        clicker.setAttribute('value', i);
        clicker.classList.add('rating_clicker');
        element.appendChild(clicker);
      }

      element.addEventListener('mouseover', function(event) {
        var clickers = event.target.parentElement.children;
        var index = getTargetValue(event);

        for(var i=0; i < clickers.length; i++) {
          clickers[i].classList.remove('rating_clicker_hover');
          if (i < index) clickers[i].classList.add('rating_clicker_hover');
        }
      });
      element.addEventListener('mouseout', function(event) {
        var clickers = event.target.parentElement.children;
        var index = getTargetValue(event);

        for(var i=0; i < clickers.length; i++) {
          clickers[i].classList.remove('rating_clicker_hover');
        }
      });
      element.addEventListener('click', function(event) {
        var index = getTargetValue(event);
        var observable = valueAccessor();
        observable(index);
      });
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var observable = valueAccessor();
      var index = observable();
      var clickers = element.children;

      for(var i=0; i < clickers.length; i++) {
        clickers[i].classList.remove('rating_clicker_selected');
        if (i < index) clickers[i].classList.add('rating_clicker_selected');
      }
    }
};

ko.bindingHandlers.showRating = {
    init: function(element, valueAccessor) {
      element.classList.add('rating_container');
      var rating = document.createElement('div');
      rating.classList.add('rating_value');
      element.appendChild(rating);
    },
    update: function(element, valueAccessor) {
      var observable = valueAccessor();
      var value = parseInt((observable() * 10) + .5) / 10;
      var width = parseInt(value * 20) + 'px';
      element.firstChild.style.width = width;
    },
};

function Manager(for_test) {
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

  this.createBandTable();
  this.createPersonTable();
  var artist = orm.define(this, 'artist', {
    name: {type: 'string'}
  });
  var song = orm.define(this, 'song', {
    name: {type: 'string'},
    artist_id: {type: 'reference', reference_table: artist},
    key_signature: {type: 'string'}
  }):
  var band_member = orm.define(this, 'band_member', {
    band_id: {type: 'reference', reference_table: band},
    person_id: {type: 'reference', reference_table: person},
    band_admin: {type: 'boolean'}
  });
  var band_song = orm.define(this, 'band_song', {
    band_id: {type: 'reference', reference_table: band},
    song_id: {type: 'reference', reference_table: song},
    key_signature: {type: 'string'},
    primary_vocal_id: {type: 'reference', reference_table: band_member},
    secondary_vocal_id: {type: 'reference', reference_table: band_member}
  });
  var song_rating = orm.define(this, 'song_rating', {
    band_member_id: {type: 'reference', reference_table: band_member},
    band_song_id: {type: 'reference', reference_table: band_song},
    rating: {type: 'integer'},
    is_new: {thpe: 'boolean'},
  });
  var request = orm.define(this, 'request', {
    request_type: {type: 'integer'},
    timestamp: {type: 'date'},
    person_id: {type: 'reference', reference_table: person},
    band_id: {type: 'reference', reference_table: band},
    description: {type: 'string'},
    status: {type: 'integer'}
  });

  this.reports = new ReportList();

  this.current_person = ko.observable();
  this.current_band = ko.observable();

  band.load(function(err, result) {
    if (err) throw err;

    person.load(function(err, result) {
      if (err) throw err;

      var svc = service.getInstance();
      svc.get('./session_info', function(result_code, result) {
        if (result_code != 200 && result_code != 304) {
          throw new Error('Unexpected result ' + result_code);
        }
        
        this.current_person(person.get(result.person_id()));
      }.bind(this));

      band_member.load(function(err, result) {
        if (err) throw err;

        if (result.length > 0) {
          var memberships = person.memberList();

          if (memberships.length > 0) {
            this.current_band(band.list.get(memberships[0].band_id()));
          }
        }
      }.bind(this));
    }.bind(this));
  }.bind(this));

  artist.load(function(err, result) {
    if (err) throw err;
  }.bind(this));
  song.load(function(err, result) {
    if (err) throw err;
  }.bind(this));
  band_song.load(function(err, result) {
    if (err) throw err;
  }.bind(this));
  song_rating.load(function(err, result) {
    if (err) throw err;
  }.bind(this));
  request.load.load(function(err, result) {
    if (err) throw err;
  }.bind(this));

  this.reports.load();

  this.tab_list = ko.computed(function() {
    var result = tab_list = [
      { value: 3, value_text: 'My Bands' },
      { value: 4, value_text: 'Band Members' },
      { value: 5, value_text: 'Artists' },
      { value: 6, value_text: 'All Songs' },
      { value: 7, value_text: 'Band Songs' }
    ];

    if (this.current_person() && this.current_person().system_admin()) {
      result.unshift({ value: 2, value_text: 'All People' });
      result.unshift({ value: 1, value_text: 'All Bands', });
    }

    result.unshift({ value: 0, value_text: 'Dashboard' });

    return result;
  }.bind(this));

  this.current_tab = ko.observable(this.tab_list[0]);

  this.current_band_member = ko.computed(function() {
    if (this.current_band() && this.current_person()) {
      var members = current_band().bandMemberList();
      var result = ko.utils.arrayFirst(members, function(member_row) {
        return member_row.person_id() == this.current_person.id();
      }.bind(this))
      return result;
    } else {
      return null;
    }
  }.bind(this)).extend({ throttle: 50 });

  this.current_bands = ko.computed(function() {
    return ko.utils.arrayMap(
      this.current_person().bandMemberList(), 
      function(member_row) { return member_row.band() }
    );
  }.bind(this)).extend({ throttle: 50 });

  this.other_bands = ko.computed(function() {
    return ko.utils.arrayFilter(this.bands.list(), function(band_row) {
      if (this.current_person()) {
        var filter = orm.table.list.filter.columnFilterFactory(
          band_row.bandMemberList,
          'equal',
          'person_id'
        );
        filter.setFilterValue(this.current_person().id());
        return filter.getList().length == 0;
      } else {
        return this.bands.list();
      }
    }.bind(this));
  }.bind(this)).extend({ throttle: 50 });

  this.non_band_members = ko.computed(function() {
    if (this.current_band()) {
      return ko.utils.arrayFilter(this.persons.list(), function(person_row) {
        var filter = orm.table.list.filter.columnFilterFactory(
          person_row.bandMemberList,
          'equal',
          'band_id'
        );
        filter.setFilterValue(this.current_band().id());
        return filter.getList().length == 0;
      }.bind(this));
    } else {
      return this.persons.list();
    }
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

  this.forms = {};
  if (!for_test) {
    this.forms.add_band = new AddBand();
    this.forms.edit_band = new EditBand();
    this.forms.join_band = new JoinBand();
    this.forms.add_person = new AddPerson();
    this.forms.edit_profile = new EditProfile();
    this.forms.change_password = new ChangePassword();
    this.forms.add_band_member = new AddBandMember();
    this.forms.add_artist = new AddArtist();
    this.forms.edit_artist = new EditArtist();
    this.forms.add_song = new AddSong();
    this.forms.edit_song = new EditSong();
    this.forms.add_band_song = new AddBandSong();
    this.forms.create_rehearsal_plan = new CreateRehearsalPlan();
  }

  this.confirm_dialog = new confirm_dialog();

  this.postFormChange = function(form_element) {
    var form_key = form_element.attributes.getNamedItem('form_key');
    if (! form_key) throw new Error('No form key for ' + form_element.toString());
    var form = this.forms[form_key.value];
    return form.postChange(form_element);
  };

  this.putFormChange = function(form_element) {
    var form_key = form_element.attributes.getNamedItem('form_key');
    if (! form_key) throw new Error('No form key for ' + form_element.toString());
    var form = this.forms[form_key.value];
    var form_result = form.putChange(form_element);
    form.hide();
    return form_result;
  };

  this.edit_table_object = function(data, event) {
    window.console.log(event);
    window.console.log(data);
    this.show(data);
  };

  this.delete_table_object = function(data, event) {
    data.delete(function(result_code, result) {
      if (result_code != 200 && result_code != 304) {
        throw new Error(result); //XXX  Display a message?
      }
    }, event);
  };

  this.update_table_object = function(data, event) {
    var target = event.target;
    var name = target.name;
    var value = target.type == 'checkbox' ? target.checked : target.value;
    var changeset = {};
    changeset[name] = value;
    data.update(changeset, function(result_code, result) {
      if (result_code == 200 || result_code == 304) {
        data.refresh(function(result_code) {
          if (result_code != 200 && result_code != 304) {
            window.console.log(result_code);
          }
        });
      } else {
        window.console.log(result_code);
      }
    });
  };

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
}

Manager.prototype.createBandTable = function() {
  var band = orm.define(
    this,
    'band',
    {name: {type: 'string'}},
    {
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
  var person = orm.define(this, 'person', {
    name: {type: 'string'},
    full_name: {type: 'string'},
    email: {type: 'string'},
    system_admin: {type: 'boolean'}
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
      label: 'Full Name (Lo-Hi)',
      definition: {full_name: 'desc'}
    }, {
      name: 'email_asc',
      label: 'E-Mail (Lo-Hi)',
      definition: {email: 'asc'}
    }, {
      name: 'email_desc',
      label: 'E-Mail (Lo-Hi)',
      definition: {email: 'desc'}
    }]
  });


};

function app_start() {
  ko.applyBindings(new Manager());
}
