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
  var test_div;

  beforeEach(function(done) {
    test_div = document.createElement('div');
    document.body.appendChild(test_div);
    service.getInstance();
    done();
  });

  afterEach(function(done) {
    document.body.removeChild(test_div);
    test_div = null;
    service.getInstance().resetCalls();
    done();
  });

  describe('#list', function() {
    it('should render the band_song list form', function(done) {
      var list_form = new app_form.List.BandSong(song_model, true);
      list_form.render(test_div);

      should.exist(test_div.firstChild);
      test_div.children.length.should.eql(1);

      // Should be a table.
      var table = test_div.firstChild;
      table.tagName.should.eql('TABLE');
      var rows = table.querySelectorAll('tr');
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
      var list_form = new app_form.List.BandSong(song_model, true);
      list_form.render(test_div);

      should.exist(test_div.firstChild);
      var table = test_div.firstChild;
      var rows = table.querySelectorAll('tr');
      var delete_cell = rows[1].querySelector('.delete');
      delete_cell.dispatchEvent(new Event('click'));

      var dialog_box = document.querySelector('.dialog_box');
      should.exist(dialog_box);
      var dialog_message = dialog_box.querySelector('.dialog_message');
      should.exist(dialog_message);
      dialog_message.innerHTML.should.eql('Remove Thick As A Brick?');
      var dialog_buttons = dialog_box.querySelector('.dialog_buttons');
      should.exist(dialog_buttons);
      dialog_buttons.children[0].attributes.getNamedItem('name').value.should.eql('okay');
      dialog_buttons.children[1].attributes.getNamedItem('name').value.should.eql('cancel');

      var svc = service.getInstance();
      dialog_buttons.children[1].dispatchEvent(new Event('click'));
      svc.delete.calls.should.eql(0);
      svc.delete.params.should.eql([]);
      svc.resetCalls();

      delete_cell.dispatchEvent(new Event('click'));
      dialog_box = document.querySelector('.dialog_box');
      dialog_buttons = dialog_box.querySelector('.dialog_buttons');
      dialog_buttons.children[0].dispatchEvent(new Event('click'));
      svc.delete.calls.should.eql(1);
      svc.delete.params.should.eql([[
        './band_song?band_song_id=5',
        'function'
      ]]);
      done();
    });

    it('should call the update API for song_status', function(done) {
      var list_form = new app_form.List.BandSong(song_model, true);
      list_form.render(test_div);

      should.exist(test_div.firstChild);
      var table = test_div.firstChild;
      var rows = table.querySelectorAll('tr');
      var status_select = rows[1].querySelector('[name="song_status"]');
      should.exist(status_select);

      var svc = service.getInstance();
      status_select.value = 4;
      status_select.dispatchEvent(new CustomEvent('change', {bubbles: true}));
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
      var list_form = new app_form.List.BandSong(song_model, true);
      list_form.render(test_div);

      should.exist(test_div.firstChild);
      var table = test_div.firstChild;
      var rows = table.querySelectorAll('tr');
      var status_select = rows[1].querySelector('[name="song_rating"]');
      should.exist(status_select);

      var svc = service.getInstance();
      status_select.value = 4;
      status_select.dispatchEvent(new CustomEvent('change', {bubbles: true}));
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
    it('should render the add form', function(done) {
      var add_form = new app_form.Editor.Creator.BandSongAdd(song_model, true);
      add_form.render(test_div);

      should.exist(test_div.firstChild);
      test_div.children.length.should.eql(1);

      var form = test_div.querySelector('form');
      should.exist(form);
      var fields = form.children;
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
      var add_form = new app_form.Editor.Creator.BandSongAdd(song_model, true);
      add_form.render(test_div);

      var svc = service.getInstance();
      var form = test_div.querySelector('form');
      var fields = form.children;
      fields[2].dispatchEvent(new Event('click'));

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
    it('should render the new song form', function(done) {
      var add_form = new app_form.Editor.Creator.BandSongNew(song_model, true);
      add_form.render(test_div);

      should.exist(test_div.firstChild);
      test_div.children.length.should.eql(1);

      var form = test_div.querySelector('form');
      should.exist(form);
      var fields = form.children;
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
      var add_form = new app_form.Editor.Creator.BandSongNew(song_model, true);
      add_form.render(test_div);

      var svc = service.getInstance();
      var form = test_div.querySelector('form');
      var fields = form.children;
      fields[0].value = 'I Wanna Hold Your Hand';
      fields[1].value = 3;
      fields[2].dispatchEvent(new Event('click'));

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
});
