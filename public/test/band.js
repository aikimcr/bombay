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
  });
});
