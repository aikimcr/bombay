var should = require('should');

var util = require('lib/util');

describe('util', function() {
  describe('obj_merge', function() {
    it("should return a new object from two objects", function (done) {
      var new_obj = util.obj_merge({thing1: 'lamp', thing2: 'table'}, {thing3: 'chair'});
      should.exist(new_obj);
      new_obj.should.eql({thing1: 'lamp', thing2: 'table', thing3: 'chair'});
      done();
    });
    
    it('should take the last value for a key', function(done) {
      var new_obj = util.obj_merge({thing1: 'sedan'}, {thing1: 'pickup'});
      should.exist(new_obj);
      new_obj.should.eql({thing1: 'pickup'});
      done();
    });
    
    it('should recursively merge objects', function(done) {
      var new_obj = util.obj_merge({
        thing1: {sub_thing1: 'bulb', sub_thing2: 'flower'},
        thing2: {sub_thing1: 'bush', sub_thing3: 'tree'}
      }, {
        thing1: {sub_thing3: 'weed'},
        thing2: {sub_thing1: 'rock'},
        thing3: {sub_thing1: 'grass'}
      });
      should.exist(new_obj);
      new_obj.should.eql({
        thing1: {sub_thing1: 'bulb', sub_thing2: 'flower', sub_thing3: 'weed'},
        thing2: {sub_thing1: 'rock', sub_thing3: 'tree'},
        thing3: {sub_thing1: 'grass'}
      });
      done();
    });
  });

  describe('encryption', function() {
    var test_string = 'How Now Brown Cow';
    var password = 'xyzzy';
    var encrypted_string;

    it('should encrypt the string with the password', function(done) {
      encrypted_string = util.strMapCharsToStr(password, test_string);
      should.exist(encrypted_string);
      encrypted_string.should.not.eql(test_string);
      done();
    });

    it('should decrypt the string with the password', function(done) {
      var decrypted = util.strMapCharsToStr(password, encrypted_string);
      should.exist(decrypted);
      decrypted.should.eql(test_string);
      done();
    });
  });
});
