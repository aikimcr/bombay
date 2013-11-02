var should = chai.should();
chai.Assertion.includeStack = true;

function check_classlist(got, expected) {
  should.exist(got);
  got.length.should.eql(expected.length);
  for (var i = 0; i < expected.length; i++) {
    got.contains(expected[i]).should.be.true;
  }
  return got;
};

function check_row(row, child_count, attr_length) {
  should.exist(row);
  row.children.length.should.eql(child_count);
  row.attributes.length.should.eql(attr_length);
  return row;
};

function check_cell(cell, tag, text, attr_length, expected_classlist) {
  should.exist(cell);
  cell.tagName.should.eql(tag);

  if (text !== '<HTML>') {
    cell.innerHTML.should.eql(text);
  }

  cell.attributes.length.should.eql(attr_length);
  check_classlist(cell.classList, expected_classlist);
  return cell;
};

function check_checkbox(box, checked, expected_classlist) {
  should.exist(box);
  box.tagName.should.eql('INPUT');
  box.attributes.getNamedItem('type').value.should.eql('checkbox');
  box.checked.should.eql(checked);
  check_classlist(box.classList, expected_classlist);
};

function check_select(select, value, exp_name, exp_options, expected_classlist) {
  should.exist(select);
  select.tagName.should.eql('SELECT');
  select.attributes.getNamedItem('name').value.should.eql(exp_name);
  var option_list = select.querySelectorAll('option');
  option_list.length.should.eql(exp_options.length);
  var got_options = [];
  for(var i = 0; i < option_list.length; i++) {
    window.console.log(i);
    var got = {value: option_list[i].value, label: option_list[i].innerHTML};
    got.should.eql(exp_options[i]);
  }
  check_classlist(select.classList, expected_classlist);
};
