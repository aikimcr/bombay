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
  });
});
