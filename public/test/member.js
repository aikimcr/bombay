var member_model = {
  person_id: 1,
  system_admin: 1,
  band_id: 1,
  band_admin: true,
  band: {
    id: 1,
    name: 'Going To The Movies'
  },
  band_members: [{
    id: 1,
    full_name: 'Mad Max',
    email: 'max@roadwarrior.fake',
    system_admin: 0,
    band_admin: 0
  }, {
    id: 3,
    full_name: 'Goldfinger',
    email: 'gold@evilvillains.fake',
    system_admin: 0,
    band_admin: 1
  }],
  non_band_members: [{
    id: 2,
    full_name: 'Josie Wales',
    email: 'jwales@outlaws.fake',
  }, {
    id: 4,
    full_name: 'Lex Luther',
    email: 'lex@villainsrus.fake',
  }]
};

describe('band_member', function() {
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
    it('should render the band_member list form', function(done) {
      var list_form = new app_form.List.BandMember(member_model, true);
      list_form.render(test_div);

      should.exist(test_div.firstChild);
      test_div.children.length.should.eql(1);

      // Should be a table.
      var table = test_div.firstChild;
      table.tagName.should.eql('TABLE');
      var rows = table.querySelectorAll('tr');
      rows.length.should.eql(3);

      // Check the header row.
      var header = check_row(rows[0], 4, 0);
      check_cell(header.children[0], 'TH', 'Full Name', 0, []);
      check_cell(header.children[1], 'TH', 'Email', 0, []);
      check_cell(header.children[2], 'TH', 'Admin', 0, []);
      check_cell(header.children[3], 'TH', '', 0, []);

      // Check first band row.
      var band = check_row(rows[1], 4, 2);
      should.exist(band);
      band.attributes.getNamedItem('member_id').value.should.eql('1');
      check_cell(band.children[0], 'TD', 'Mad Max', 0, []);
      check_cell(band.children[1], 'TD', 'max@roadwarrior.fake', 0, []);
      var admin_cell = check_cell(band.children[2], 'TD', '<HTML>', 1, ['band_admin']);
      var admin_cb = admin_cell.querySelector('input[type="checkbox"]');
      check_checkbox(admin_cb, false, []);
      check_cell(band.children[3], 'TD', '\u2327', 1, ['delete']);

      done();
    });

    it('should call the delete API', function(done) {
      var list_form = new app_form.List.BandMember(member_model, true);
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
      dialog_message.innerHTML.should.eql('Remove Mad Max from Going To The Movies?');
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
        './band_member?person_id=1&band_id=1',
        'function'
      ]]);
      done();
    });

    it('should call the update API for band_admin', function(done) {
      var list_form = new app_form.List.BandMember(member_model, true);
      list_form.render(test_div);

      should.exist(test_div.firstChild);
      var table = test_div.firstChild;
      var rows = table.querySelectorAll('tr');
      var admin_box = rows[1].querySelector('.band_admin input');

      var svc = service.getInstance();
      admin_box.checked = true;
      admin_box.dispatchEvent(new CustomEvent('change', {bubbles: true}));
      svc.put.calls.should.eql(1);
      svc.put.params.should.eql([[
        './band_member',
        'function',
        {
          band_id: 1,
          band_admin: true,
          person_id: 1
        }
      ]]);

      done();
    });
  });

  describe('#add', function() {
    it('should render the add form', function(done) {
      var add_form = new app_form.Editor.Creator.BandMemberAdd(member_model, true);
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

      // Person ID
      fields[1].tagName.should.eql('SELECT');
      fields[1].attributes.getNamedItem('name').value.should.eql('person_id');
      fields[1].options.length.should.eql(2);
      fields[1].options[0].innerHTML.should.eql('Josie Wales');
      fields[1].options[0].value.should.eql('2');
      fields[1].options[1].innerHTML.should.eql('Lex Luther');
      fields[1].options[1].value.should.eql('4');

      // Submit Button
      fields[2].tagName.should.eql('INPUT');
      fields[2].attributes.getNamedItem('type').value.should.eql('submit');
      fields[2].value.should.eql('Add');
      done();
    });

    it('should call the add API', function(done) {
      var add_form = new app_form.Editor.Creator.BandMemberAdd(member_model, true);
      add_form.render(test_div);

      var svc = service.getInstance();
      var form = test_div.querySelector('form');
      var fields = form.children;
      fields[2].dispatchEvent(new Event('click'));

      svc.set.calls.should.eql(1);
      svc.set.params.length.should.eql(1);
      svc.set.params.should.eql([[
        './band_member',
        'function',
        {
          band_id: 1,
          person_id: 2
        }
      ]]);
      done();
    });
  });

  describe('#new', function() {
    it('should render the new member form', function(done) {
      var add_form = new app_form.Editor.Creator.BandMemberNew(member_model, true);
      add_form.render(test_div);

      should.exist(test_div.firstChild);
      test_div.children.length.should.eql(1);

      var form = test_div.querySelector('form');
      should.exist(form);
      var fields = form.children;
      should.exist(fields);
      fields.length.should.eql(4);

      // Band ID
      fields[0].tagName.should.eql('INPUT');
      fields[0].attributes.getNamedItem('type').value.should.eql('hidden');
      fields[0].attributes.getNamedItem('name').value.should.eql('band_id');
      fields[0].value.should.eql('1');

      // New Login Name
      fields[1].tagName.should.eql('INPUT');
      fields[1].attributes.getNamedItem('type').value.should.eql('text');
      fields[1].attributes.getNamedItem('name').value.should.eql('name');
      fields[1].attributes.getNamedItem('placeholder').value.should.eql('New Login Name');
      fields[1].value.should.eql('');

      // New Full Name
      fields[2].tagName.should.eql('INPUT');
      fields[2].attributes.getNamedItem('type').value.should.eql('text');
      fields[2].attributes.getNamedItem('name').value.should.eql('full_name');
      fields[2].attributes.getNamedItem('placeholder').value.should.eql('Full Name');
      fields[2].value.should.eql('');

      // Submit Button
      fields[3].tagName.should.eql('INPUT');
      fields[3].attributes.getNamedItem('type').value.should.eql('submit');
      fields[3].value.should.eql('New');
      done();
    });

    it('should call the new API', function(done) {
      var add_form = new app_form.Editor.Creator.BandMemberNew(member_model, true);
      add_form.render(test_div);

      var svc = service.getInstance();
      var form = test_div.querySelector('form');
      var fields = form.children;
      fields[1].value = 'apowers';
      fields[2].value = 'Austin Powers';
      fields[3].dispatchEvent(new Event('click'));

      svc.set.calls.should.eql(1);
      svc.set.params.length.should.eql(1);
      svc.set.params.should.eql([[
        './person',
        'function',
        {
          name: 'apowers',
          full_name: 'Austin Powers'
        }
      ]]);
      done();
    });
  });
});
