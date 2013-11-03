var song_model = {
  person_id: 1,
  system_admin: 1,
  band_id: 1,
  band_admin: true,
  all_artists: [{
    id: 1, name: 'AC/DC'
  }, {
    id: 2, name: 'Jethro Tull'
  }, {
    id: 3, name: 'The Beatles'
  }],
  band_songs: [{
    artist_name: 'Jethro Tull',
    avg_rating: 2,
    band_song_id: 5,
    name: 'Thick As A Brick',
    rating: 5,
    song_status: 3
  }, {
    artist_name: 'AC/DC',
    avg_rating: 5,
    band_song_id: 2,
    name: 'You Shook Me All Night Long',
    rating: 5,
    song_status: 4
  }],
  other_songs: [{
    artist_id: 3,
    artist_name: 'The Beatles',
    description: 'Help by The Beatles',
    id: 7,
    name: 'Help'
  }, {
    artist_id: 1,
    artist_name: 'AC/DC',
    description: 'Whole Lotta Rosie by AC/DC',
    id: 9,
    name: 'Whole Lotta Rosie'
  }],
  sort_type: "song_name",
  filters: {}
};

describe('band_song', function() {
  describe('#list', function() {
    var test_div;
    var svc;
    var list_form;
    var table;
    var rows;

    before(function(done) {
      test_div = document.createElement('div');
      document.body.appendChild(test_div);
      svc = service.getInstance();
      done();
    });

    after(function(done) {
      document.body.removeChild(test_div);
      test_div = null;
      service.getInstance().resetCalls();
      done();
    });

    it('should render the band_song list form', function(done) {
      list_form = new app_form.List.BandSong(song_model, true);
      list_form.render(test_div);

      should.exist(test_div.firstChild);
      test_div.children.length.should.eql(1);

      // Should be a table.
      table = test_div.firstChild;
      table.tagName.should.eql('TABLE');
      rows = table.querySelectorAll('tr');
      rows.length.should.eql(3);

      // Check the header row.
      var header = check_row(rows[0], 6, 0);
      check_cell(header.children[0], 'TH', 'Song Name', 0, []);
      check_cell(header.children[1], 'TH', 'Artist Name', 0, []);
      check_cell(header.children[2], 'TH', 'Song Status', 0, []);
      check_cell(header.children[3], 'TH', 'Personal Rating', 0, []);
      check_cell(header.children[4], 'TH', 'Average Rating', 0, []);
      check_cell(header.children[5], 'TH', '', 0, []);

      // Check first band row.
      var song = check_row(rows[1], 6, 1);
      should.exist(song);
      song.attributes.getNamedItem('band_song_id').value.should.eql('5');
      check_cell(song.children[0], 'TD', 'Thick As A Brick', 0, []);
      check_cell(song.children[1], 'TD', 'Jethro Tull', 0, []);
      var song_status_cell = check_cell(song.children[2], 'TD', '<HTML>', 0, []);
      var song_status_select = song_status_cell.querySelector('select');
      check_select(song_status_select, 3, 'song_status', [{
        value: '-2', label: 'Retired'
      }, {
        value: '-1', label: 'Proposed'
      }, {
        value: '0', label: 'New'
      }, {
        value: '1', label: 'Learning'
      }, {
        value: '2', label: 'Run Through'
      }, {
        value: '3', label: 'Ready'
      }, {
        value: '4', label: 'Standard'
      }], []);

      var rating_cell = check_cell(song.children[3], 'TD', '<HTML>', 0, []);
      var rating_select = rating_cell.querySelector('select');
      check_select(rating_select, 5, 'song_rating', [{
        value: '1', label: '\u2605',
      }, {
        value: '2', label: '\u2605\u2605'
      }, {
        value: '3', label: '\u2605\u2605\u2605'
      }, {
        value: '4', label: '\u2605\u2605\u2605\u2605'
      }, {
        value: '5', label: '\u2605\u2605\u2605\u2605\u2605'
      }], []);

      var avg_cell = check_cell(song.children[4], 'TD', '<HTML>', 1, []);
      avg_cell.attributes.getNamedItem('name').value.should.eql('avg_rating');
      var avg_rating = avg_cell.querySelector('div');
      should.exist(avg_rating);
      avg_rating.attributes.getNamedItem('value').value.should.eql('2');
      avg_rating.attributes.getNamedItem('style').value.should.eql('overflow: hidden; width: 40px;');
      var rating_img = avg_rating.querySelector('img[src="/images/five_stars.png"]');
      should.exist(rating_img);
      rating_img.attributes.getNamedItem('width').value.should.eql('100px');
      rating_img.attributes.getNamedItem('height').value.should.eql('20px');

      check_cell(song.children[5], 'TD', '\u2327', 1, ['delete']);

      done();
    });

    it('should call the delete API', function(done) {
      var delete_cell = rows[1].querySelector('.delete');
      fireClick(delete_cell);

      var dialog_box = document.querySelector('.dialog_box');
      should.exist(dialog_box);
      var dialog_message = dialog_box.querySelector('.dialog_message');
      should.exist(dialog_message);
      dialog_message.innerHTML.should.eql('Remove Thick As A Brick?');
      var dialog_buttons = dialog_box.querySelector('.dialog_buttons');
      should.exist(dialog_buttons);
      dialog_buttons.children[0].attributes.getNamedItem('name').value.should.eql('okay');
      dialog_buttons.children[1].attributes.getNamedItem('name').value.should.eql('cancel');

      svc.resetCalls();
      fireClick(dialog_buttons.children[1]);
      svc.delete.calls.should.eql(0);
      svc.delete.params.should.eql([]);

      svc.resetCalls();
      fireClick(delete_cell);
      dialog_box = document.querySelector('.dialog_box');
      dialog_buttons = dialog_box.querySelector('.dialog_buttons');
      fireClick(dialog_buttons.children[0]);
      svc.delete.calls.should.eql(1);
      svc.delete.params.should.eql([[
        './band_song?band_song_id=5',
        'function'
      ]]);
      done();
    });

    it('should call the update API for song_status', function(done) {
      var status_select = rows[1].querySelector('[name="song_status"]');
      should.exist(status_select);

      svc.resetCalls();
      status_select.value = 4;
      fireChange(status_select);
      svc.put.calls.should.eql(1);
      svc.put.params.should.eql([[
        './band_song',
        'function',
        {
          band_song_id: 5,
          song_status: 4
        }
      ]]);

      done();
    });

    it('should call the update API for song_rating', function(done) {
      var status_select = rows[1].querySelector('[name="song_rating"]');
      should.exist(status_select);

      svc.resetCalls();
      status_select.value = 4;
      fireChange(status_select);
      svc.put.calls.should.eql(1);
      svc.put.params.should.eql([[
        './song_rating',
        'function',
        {
          band_song_id: 5,
          rating: 4
        }
      ]]);

      done();
    });
  });

  describe('#add', function() {
    var test_div;
    var svc;
    var add_form;
    var form;
    var fields;

    before(function(done) {
      test_div = document.createElement('div');
      document.body.appendChild(test_div);
      svc = service.getInstance();
      done();
    });

    after(function(done) {
      document.body.removeChild(test_div);
      test_div = null;
      service.getInstance().resetCalls();
      done();
    });

    it('should render the add form', function(done) {
      add_form = new app_form.Editor.Creator.BandSongAdd(song_model, true);
      add_form.render(test_div);

      should.exist(test_div.firstChild);
      test_div.children.length.should.eql(1);

      form = test_div.querySelector('form');
      should.exist(form);
      fields = form.children;
      should.exist(fields);
      fields.length.should.eql(3);

      // Band ID
      fields[0].tagName.should.eql('INPUT');
      fields[0].attributes.getNamedItem('type').value.should.eql('hidden');
      fields[0].attributes.getNamedItem('name').value.should.eql('band_id');
      fields[0].value.should.eql('1');

      // Song ID
      fields[1].tagName.should.eql('SELECT');
      check_select(fields[1], 7, 'song_id', [{
        value: '7', label: 'Help by The Beatles'
      }, {
        value: '9', label: 'Whole Lotta Rosie by AC/DC'
      }], []);

      // Submit Button
      fields[2].tagName.should.eql('INPUT');
      fields[2].attributes.getNamedItem('type').value.should.eql('submit');
      fields[2].value.should.eql('Add');
      done();
    });

    it('should call the add API', function(done) {
      svc.resetCalls();
      fireClick(fields[2]);

      svc.set.calls.should.eql(1);
      svc.set.params.length.should.eql(1);
      svc.set.params.should.eql([[
        './band_song',
        'function',
        {
          band_id: 1,
          song_id: 7
        }
      ]]);
      done();
    });
  });

  describe('#new', function() {
    var test_div;
    var svc;
    var new_form;
    var form;
    var fields;

    before(function(done) {
      test_div = document.createElement('div');
      document.body.appendChild(test_div);
      svc = service.getInstance();
      done();
    });

    after(function(done) {
      document.body.removeChild(test_div);
      test_div = null;
      service.getInstance().resetCalls();
      done();
    });

    it('should render the new song form', function(done) {
      new_form = new app_form.Editor.Creator.BandSongNew(song_model, true);
      new_form.render(test_div);

      should.exist(test_div.firstChild);
      test_div.children.length.should.eql(1);

      form = test_div.querySelector('form');
      should.exist(form);
      fields = form.children;
      should.exist(fields);
      fields.length.should.eql(3);

      // New Song Name
      fields[0].tagName.should.eql('INPUT');
      fields[0].attributes.getNamedItem('type').value.should.eql('text');
      fields[0].attributes.getNamedItem('name').value.should.eql('song_name');
      fields[0].attributes.getNamedItem('placeholder').value.should.eql('New Song Name');
      fields[0].value.should.eql('');

      // New Artist Id
      fields[1].tagName.should.eql('SELECT');
      check_select(fields[1], 1, 'artist_id', [{
        value: '1', label: 'AC/DC'
      }, {
        value: '2', label: 'Jethro Tull'
      }, {
        value: '3', label: 'The Beatles'
      }], []);

      // Submit Button
      fields[2].tagName.should.eql('INPUT');
      fields[2].attributes.getNamedItem('type').value.should.eql('submit');
      fields[2].value.should.eql('New');
      done();
    });

    it('should call the new API', function(done) {
      svc.resetCalls();
      fields[0].value = 'I Wanna Hold Your Hand';
      fields[1].value = 3;
      fireClick(fields[2]);

      svc.set.calls.should.eql(1);
      svc.set.params.length.should.eql(1);
      svc.set.params.should.eql([[
        './song',
        'function',
        {
          name: 'I Wanna Hold Your Hand',
          artist_id: 3
        }
      ]]);
      done();
    });
  });

  describe('#filters', function() {
    var test_div;
    var svc;
    var filter_form;
    var top_div;

    before(function(done) {
      test_div = document.createElement('div');
      document.body.appendChild(test_div);
      svc = service.getInstance();
      done();
    });

    after(function(done) {
      document.body.removeChild(test_div);
      test_div = null;
      service.getInstance().resetCalls();
      done();
    });

    it('should render the filters', function(done) {
      filter_form = new app_form.Filters.BandSong(song_model, true);
      filter_form.render(test_div);

      should.exist(test_div.firstChild);
      test_div.children.length.should.eql(1);

      top_div = test_div.firstChild;
      top_div.tagName.should.eql('DIV');
      done();
    });

    describe('sort select', function() {
      var sort_div;
      var sort_select;
      var listener;

      after(function(done) {
        filter_form.removeEventListener('app_filter_change', listener);
        done();
      });

      it('should have rendered the sort selector', function(done) {
        sort_div = top_div.querySelector('div.sort');
        should.exist(sort_div);
        sort_select = sort_div.querySelector('select');
        check_select(sort_select, 'song_name', 'sort_type', [{
          value: 'song_name', label: 'Song Name (A-Z)'
        }, {
          value: 'song_name_rev', label: 'Song Name (Z-A)'
        }, {
          value: 'artist_name', label: 'Artist Name (A-Z)'
        }, {
          value: 'artist_name_rev', label: 'Artist Name (Z-A)'
        }, {
          value: 'average_rating', label: 'Average Rating (Low-High)'
        }, {
          value: 'average_rating_rev', label: 'Average Rating (High-Low)'
        }], []);
        var sort_label = sort_div.querySelector('label[for="sort_type"]');
        should.exist(sort_label);
        sort_label.innerHTML.should.eql('Sort');
        done();
      });

      it('should should fire the app_filter_change', function(done) {
        listener = function(e) {
          e.type.should.eql('app_filter_change');
          done();
        };

        filter_form.addEventListener('app_filter_change', listener);
        sort_select.value = 'artist_name';
        fireChange(sort_select);
      });
    });

    describe('filter_divs', function() {
      var filter_divs;
      var song_name_filter;
      var artist_id_filter;
      var listener;
      var finish_listen;

      before(function(done) {
        listener = function(e) {
          e.type.should.eql('app_filter_change');
          finish_listen();
        };

        filter_form.addEventListener('app_filter_change', listener);
        done();
      });

      after(function(done) {
        filter_form.removeEventListener('app_filter_change', listener);
        done();
      });

      it('should have rendered the filters', function(done) {
        filter_divs = top_div.querySelectorAll('div.filter');
        should.exist(filter_divs);
        filter_divs.length.should.eql(2);
        done();
      });

      it('should have rendered the song name filter', function(done) {
        song_name_filter = filter_divs[0].querySelector('input[name="song_name"]');
        should.exist(song_name_filter);
        song_name_filter.value.should.eql('');
        var song_name_label = filter_divs[0].querySelector('label[for="song_name"]');
        should.exist(song_name_label);
        song_name_label.innerHTML.should.eql('By Name');
        done();
      });

      it('should fire the app_filter_change', function(done) {
        finish_listen = function() { done(); };
        song_name_filter.value = 'Thick';
        fireChange(song_name_filter);
      });

      it('should have rendered the artist id filter', function(done) {
        artist_id_filter = filter_divs[1].querySelector('select[name="artist_id"]');
        should.exist(artist_id_filter);
        check_select(artist_id_filter, 1, 'artist_id', [{
          value: '-1', label: '--All Artists--'
        }, {
          value: '1', label: 'AC/DC'
        }, {
          value: '2', label: 'Jethro Tull'
        }, {
          value: '3', label: 'The Beatles'
        }], []);
        var artist_id_label = filter_divs[1].querySelector('label[for="artist_id"]');
        should.exist(artist_id_label);
        artist_id_label.innerHTML.should.eql('For Artist');
        done();
      });

      it('should fire the app_filter_change', function(done) {
        finish_listen = function() { done(); };
        song_name_filter.value = 1;
        fireChange(artist_id_filter);
      });
    });

    describe('get and set filter values', function() {
      it('should get the sort and filter values all set', function(done) {
        filter_form.setFilterField('sort_type', 'artist_name');
        filter_form.setFilterField('song_name', 'Thick');
        filter_form.setFilterField('artist_id', 1);
        var filter_values = filter_form.getFilterValues();
        should.exist(filter_values);
        filter_values.should.eql({
          sort_type: 'artist_name',
          filters: {
            song_name: 'Thick',
            artist_id: 1
          }
        });
        done();
      });

      it('should get the filter query all set', function(done) {
        filter_form.setFilterField('sort_type', 'artist_name');
        filter_form.setFilterField('song_name', 'Thick');
        filter_form.setFilterField('artist_id', 1);
        var filter_query = filter_form.getFilterQuery();
        should.exist(filter_query);
        filter_query.should.eql('sort_type=artist_name&filters={"song_name":"Thick","artist_id":1}');
        done();
      });

      it('should get the sort and filter values only sort', function(done) {
        filter_form.setFilterField('sort_type', 'artist_name_rev');
        filter_form.setFilterField('song_name', '');
        filter_form.setFilterField('artist_id', -1);
        var filter_values = filter_form.getFilterValues();
        should.exist(filter_values);
        filter_values.should.eql({
          sort_type: 'artist_name_rev',
          filters: {}
        });
        done();
      });

      it('should get the filter query only sort', function(done) {
        filter_form.setFilterField('sort_type', 'artist_name_rev');
        filter_form.setFilterField('song_name', '');
        filter_form.setFilterField('artist_id', -1);
        var filter_query = filter_form.getFilterQuery();
        should.exist(filter_query);
        filter_query.should.eql('sort_type=artist_name_rev');
        done();
      });
    });
  });
});
