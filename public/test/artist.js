var artist_model = {
  person_id: 1,
  system_admin: 1,
  band_id: 1, 
  band_admin: 1,
  artists: [{
    id: 1, name: 'AC/DC', song_count: 10,
  }, {
    id: 2, name: 'The Bangles', song_count: 0,
  }, {
    id: 3, name: 'ZZ Top', song_count: 20
  }],
};

describe('artist', function() {
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
    it('should render the artist list form including delete buttons', function(done) {
      var list_form = new app_form.List.Artist(artist_model, true);
      list_form.render(test_div);

      should.exist(test_div.firstChild);
      test_div.children.length.should.eql(1);

      // Should be a table.
      var table = test_div.firstChild;
      table.tagName.should.eql('TABLE');
      var rows = table.querySelectorAll('tr');
      rows.length.should.eql(4);
      rows[0].children.length.should.eql(2);

      // Check the header row.
      var header = check_row(rows[0], 2, 0);
      check_cell(header.children[0], 'TH', 'Artist Name', 0, []);
      check_cell(header.children[1], 'TH', '', 0, []);

      // Check first artist row.
      var artist = check_row(rows[1], 2, 2);
      should.exist(artist);
      artist.attributes.getNamedItem('artist_id').value.should.eql('1');
      check_cell(artist.children[0], 'TD', 'AC/DC', 0, []);
      check_cell(artist.children[1], 'TD', '10', 0, []);

      // Check second artist row.
      artist = check_row(rows[2], 2, 2);
      should.exist(artist);
      artist.attributes.getNamedItem('artist_id').value.should.eql('2');
      check_cell(artist.children[0], 'TD', 'The Bangles', 0, []);
      check_cell(artist.children[1], 'TD', '\u2327', 1, ['delete']);

      done();
    });

    it('should call the delete API', function(done) {
      var list_form = new app_form.List.Artist(artist_model, true);
      list_form.render(test_div);

      should.exist(test_div.firstChild);
      var table = test_div.firstChild;
      var rows = table.querySelectorAll('tr');
      var delete_cell = rows[2].querySelector('.delete');
      delete_cell.dispatchEvent(new Event('click'));

      var dialog_box = document.querySelector('.dialog_box');
      should.exist(dialog_box);
      var dialog_message = dialog_box.querySelector('.dialog_message');
      should.exist(dialog_message);
      dialog_message.innerHTML.should.eql('Remove The Bangles?');
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
        './artist?artist_id=2',
        'function'
      ]]);
      done();
    });
  });

  describe('#new', function() {
    it('should render the new artist form', function(done) {
      var add_form = new app_form.Editor.Creator.ArtistNew(artist_model, true);
      add_form.render(test_div);

      should.exist(test_div.firstChild);
      test_div.children.length.should.eql(1);

      var form = test_div.querySelector('form');
      should.exist(form);
      var fields = form.children;
      should.exist(fields);
      fields.length.should.eql(2);

      // Artist Name
      fields[0].tagName.should.eql('INPUT');
      fields[0].attributes.getNamedItem('type').value.should.eql('text');
      fields[0].attributes.getNamedItem('name').value.should.eql('artist_name');
      fields[0].attributes.getNamedItem('placeholder').value.should.eql('New Artist Name');
      fields[0].value.should.eql('');

      // Submit Button
      fields[1].tagName.should.eql('INPUT');
      fields[1].attributes.getNamedItem('type').value.should.eql('submit');
      fields[1].value.should.eql('New');
      done();
    });

    it('should call the create API', function(done) {
      var add_form = new app_form.Editor.Creator.ArtistNew(artist_model, true);
      add_form.render(test_div);

      var svc = service.getInstance();
      var form = test_div.querySelector('form');
      var fields = form.children;
      fields[0].value = 'David Bowie';
      fields[1].dispatchEvent(new Event('click'));

      svc.set.calls.should.eql(1);
      svc.set.params.length.should.eql(1);
      svc.set.params.should.eql([[
        './artist',
        'function',
        {
          name: 'David Bowie',
        }
      ]]);
      done();
    });
  });
});
