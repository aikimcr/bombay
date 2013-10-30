var should = chai.should();

var model = {
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

function check_row(row, child_count, attr_length) {
  should.exist(row);
  row.children.length.should.eql(child_count);
  row.attributes.length.should.eql(attr_length);
  return row;
};

function check_cell(cell, tag, text, attr_length, class_list) {
  should.exist(cell);
  cell.tagName.should.eql(tag);
  cell.innerHTML.should.eql(text);
  cell.attributes.length.should.eql(attr_length);
  cell.classList.length.should.eql(class_list.length);

  for (var i = 0; i < class_list.length; i++) {
    cell.classList.contains(class_list[i]).should.be.true;
  }

  return cell;
};

describe('band', function() {
  var test_div;

  beforeEach(function(done) {
    test_div = document.createElement('div');
    document.body.appendChild(test_div);
    done();
  });

  afterEach(function(done) {
    document.body.removeChild(test_div);
    test_div = null;
    done();
  });

  describe('#list', function() {
    it('should render the band list form including delete buttons', function(done) {
      var list_form = new app_form.List.Band(model, true);
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
      var list_form = new app_form.List.Band(model, true);
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
      var add_form = new app_form.Editor.Creator.BandJoin(model, true);
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
      done();
    });
  });
});
