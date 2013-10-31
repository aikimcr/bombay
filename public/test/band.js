var band_model = {
  band_admin: null,
  band_id: null,
  other_bands: [{
    id: 5, name: 'Dexter\'s Laboratory'
  }, {
    id: 10, name: 'Samurai Jack'
  }],
  person_bands: [{
    id: 2, name: 'Phineas And Pherb'
  }, {
    id: 3, name: 'The Fairly Odd Parents'
  }],
  person_id: 1,
  system_admin: 1
};

describe('band', function() {
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
    it('should render the band list form including delete buttons', function(done) {
      var list_form = new app_form.List.Band(band_model, true);
      list_form.render(test_div);

      should.exist(test_div.firstChild);
      test_div.children.length.should.eql(1);

      // Should be a table.
      var table = test_div.firstChild;
      table.tagName.should.eql('TABLE');
      var rows = table.querySelectorAll('tr');
      rows.length.should.eql(3);
      rows[0].children.length.should.eql(2);

      // Check the header row.
      var header = check_row(rows[0], 2, 0);
      check_cell(header.children[0], 'TH', 'Band Name', 0, []);
      check_cell(header.children[1], 'TH', '', 0, []);

      // Check first band row.
      var band = check_row(rows[1], 2, 2);
      should.exist(band);
      band.attributes.getNamedItem('band_id').value.should.eql('2');
      check_cell(band.children[0], 'TD', 'Phineas And Pherb', 0, []);
      check_cell(band.children[1], 'TD', '\u2327', 1, ['delete']);

      done();
    });

    it('should call the delete API', function(done) {
      var list_form = new app_form.List.Band(band_model, true);
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
      dialog_message.innerHTML.should.eql('Quit Phineas And Pherb?');
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
        './person_band?band_id=2&person_id=1',
        'function'
      ]]);
      done();
    });
  });

  describe('#add', function() {
    it('should render the add form', function(done) {
      var add_form = new app_form.Editor.Creator.BandJoin(band_model, true);
      add_form.render(test_div);

      should.exist(test_div.firstChild);
      test_div.children.length.should.eql(1);

      var form = test_div.querySelector('form');
      should.exist(form);
      var fields = form.children;
      should.exist(fields);
      fields.length.should.eql(3);

      // Person ID
      fields[0].tagName.should.eql('INPUT');
      fields[0].attributes.getNamedItem('type').value.should.eql('hidden');
      fields[0].attributes.getNamedItem('name').value.should.eql('person_id');
      fields[0].value.should.eql('1');

      // Band ID
      fields[1].tagName.should.eql('SELECT');
      fields[1].attributes.getNamedItem('name').value.should.eql('band_id');
      fields[1].options.length.should.eql(2);
      fields[1].options[0].innerHTML.should.eql('Dexter\'s Laboratory');
      fields[1].options[0].value.should.eql('5');
      fields[1].options[1].innerHTML.should.eql('Samurai Jack');
      fields[1].options[1].value.should.eql('10');

      // Submit Button
      fields[2].tagName.should.eql('INPUT');
      fields[2].attributes.getNamedItem('type').value.should.eql('submit');
      fields[2].value.should.eql('Join');
      done();
    });

    it('should call the add API', function(done) {
      var add_form = new app_form.Editor.Creator.BandJoin(band_model, true);
      add_form.render(test_div);

      var svc = service.getInstance();
      var form = test_div.querySelector('form');
      var fields = form.children;
      fields[2].dispatchEvent(new Event('click'));

      svc.set.calls.should.eql(1);
      svc.set.params.length.should.eql(1);
      svc.set.params.should.eql([[
        './person_band',
        'function',
        {
          band_id: 5,
          person_id: 1
        }
      ]]);
      done();
    });
  });

  describe('#new', function() {
    it('should render the new band form', function(done) {
      var add_form = new app_form.Editor.Creator.BandCreator(band_model, true);
      add_form.render(test_div);

      should.exist(test_div.firstChild);
      test_div.children.length.should.eql(1);

      var form = test_div.querySelector('form');
      should.exist(form);
      var fields = form.children;
      should.exist(fields);
      fields.length.should.eql(3);

      // Person ID
      fields[0].tagName.should.eql('INPUT');
      fields[0].attributes.getNamedItem('type').value.should.eql('hidden');
      fields[0].attributes.getNamedItem('name').value.should.eql('person_id');
      fields[0].value.should.eql('1');

      // Band Name
      fields[1].tagName.should.eql('INPUT');
      fields[1].attributes.getNamedItem('type').value.should.eql('text');
      fields[1].attributes.getNamedItem('name').value.should.eql('band_name');
      fields[1].attributes.getNamedItem('placeholder').value.should.eql('New Band Name');
      fields[1].value.should.eql('');

      // Submit Button
      fields[2].tagName.should.eql('INPUT');
      fields[2].attributes.getNamedItem('type').value.should.eql('submit');
      fields[2].value.should.eql('New');
      done();
    });

    it('should call the create API', function(done) {
      var add_form = new app_form.Editor.Creator.BandCreator(band_model, true);
      add_form.render(test_div);

      var svc = service.getInstance();
      var form = test_div.querySelector('form');
      var fields = form.children;
      fields[1].value = 'Johnny Bravo';
      fields[2].dispatchEvent(new Event('click'));

      svc.set.calls.should.eql(1);
      svc.set.params.length.should.eql(1);
      svc.set.params.should.eql([[
        './band',
        'function',
        {
          name: 'Johnny Bravo',
        }
      ]]);
      done();
    });
  });
});
