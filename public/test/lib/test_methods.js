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
    var got = {value: option_list[i].value, label: option_list[i].innerHTML};
    got.should.eql(exp_options[i]);
  }
  check_classlist(select.classList, expected_classlist);
};

function fireChange(target) {
  target.dispatchEvent(new CustomEvent('change', {bubbles: true}));
};

function fireClick(target) {
  target.dispatchEvent(new CustomEvent('click', {bubbles: true}));
};

function load_test_models() {
  load_test_model(manager.bands, {
    all_bands: [{
      id: 1, name: 'Wild At Heart'
    }, {
      id: 2, name: 'Aces and Eights'
    }, {
      id: 3, name: 'Cover Story'
    }, {
      id: 4, name: 'Time Out'
    }]
  });

  load_test_model(manager.persons, {
    all_persons: [{
      id: 1, name: 'admin', full_name: 'Administrator', email: 'admin@foo.com', system_admin: 1
    }, {
      id: 2, name: 'dduck', full_name: 'Daffy Duck', email: 'dduck@foo.com', system_admin: 0
    }, {
      id: 3, name: 'bbunny', full_name: 'Bugs Bunny', email: 'bbunny@foo.com', system_admin: 0
    }, {
      id: 4, name: 'efudd', full_name: 'Elmer Fudd', email: 'efudd@foo.com', system_admin: 0
    }]
  });

  load_test_model(manager.artists, {
    all_artists: [{
      id: 1, name: 'David Bowie'
    }, {
      id: 2, name: 'The Beatles'
    }, {
      id: 3, name: 'AC/DC'
    }, {
      id: 4, name: 'Led Zeppelin'
    }, {
      id: 5, name: 'Black Sabbath'
    }, {
      id: 6, name: 'Katy Perry'
    }, {
      id: 7, name: 'Madonna'
    }, {
      id: 8, name: 'Deep Purple'
    }]
  });

  load_test_model(manager.songs, {
    all_songs: [{
      id: 1, name: 'Changes', artist_id: 1
    }, {
      id: 2, name: 'Help', artist_id: 2
    }, {
      id: 3, name: 'You Shook Me All Night Long', artist_id: 3
    }, {
      id: 4, name: 'You Shook Me', artist_id: 4
    }, {
      id: 5, name: 'Changes', artist_id: 5
    }, {
      id: 6, name: 'California Girls', artist_id: 6
    }, {
      id: 7, name: 'Material Girl', artist_id: 7
    }, {
      id: 8, name: 'Lazy', artist_id: 8
    }]
  });

  load_test_model(manager.band_members, {
    all_band_members: [{
      id: 1, band_id: 1, person_id: 1, band_admin: 0
    }, {
      id: 2, band_id: 1, person_id: 2, band_admin: 1
    }, {
      id: 3, band_id: 1, person_id: 3, band_admin: 0
    }, {
      id: 4, band_id: 2, person_id: 2, band_admin: 0
    }, {
      id: 5, band_id: 2, person_id: 3, band_admin: 1
    }, {
      id: 6, band_id: 2, person_id: 4, band_admin: 0
    }, {
      id: 7, band_id: 3, person_id: 3, band_admin: 0
    }, {
      id: 8, band_id: 3, person_id: 4, band_admin: 1
    }, {
      id: 9, band_id: 4, person_id: 0, band_admin: 0
    }]
  });

  load_test_model(manager.band_songs, {
    all_band_songs: [{
      id: 1, band_id: 1, song_id: 1, status: 0
    }, {
      id: 2, band_id: 1, song_id: 2, status: 1
    }, {
      id: 3, band_id: 1, song_id: 3, status: -1
    }, {
      id: 4, band_id: 1, song_id: 4, status: 3
    }, {
      id: 5, band_id: 2, song_id: 5, status: 4
    }, {
      id: 6, band_id: 2, song_id: 6, status: 0
    }, {
      id: 7, band_id: 2, song_id: 7, status: 2
    }, {
      id: 8, band_id: 2, song_id: 8, status: -1
    }]
  });

  var rating_model = [];
  var next_id = 1;
  manager.band_members.list().forEach(function(band_member) {
    manager.band_songs.list().forEach(function(band_song) {
      rating_model.push({
        id: next_id++,
        band_member_id: band_member.id(),
        band_song_id: band_song.id()
      });
    });
  });

  load_test_model(manager.song_ratings, {all_song_ratings: rating_model});
};

function load_test_model(view_model, test_data) {
  view_model.list([]);
  view_model.load_(test_data);
};
