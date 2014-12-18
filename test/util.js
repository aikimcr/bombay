var should = require('should');

var util = require('../lib/util');

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

  describe('rsa encryption', function() {
    var original_text = 'Plover is a shore bird';
    var pubkey = '-----BEGIN PUBLIC KEY-----\nMFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJ4+czkdnq6/dqAoPCGSrdf2drOLpORp\niqSXVeYirZ4YTHa5uRE7HYdSXLipExn1GsLd5J+Ot3p4N2FniR5LbW8CAwEAAQ==\n-----END PUBLIC KEY-----\n';
    var pubkey_base64 = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJ4+czkdnq6/dqAoPCGSrdf2drOLpORpiqSXVeYirZ4YTHa5uRE7HYdSXLipExn1GsLd5J+Ot3p4N2FniR5LbW8CAwEAAQ==';
    var privkey = '-----BEGIN RSA PRIVATE KEY-----\nMIIBOgIBAAJBAJ4+czkdnq6/dqAoPCGSrdf2drOLpORpiqSXVeYirZ4YTHa5uRE7\nHYdSXLipExn1GsLd5J+Ot3p4N2FniR5LbW8CAwEAAQJASt5jJ4/DBwyhNG802/GI\n/JeoW5RjRIpGxU6wnnyjxhscfcyGNvurAEWS22x46yag8PJyQ32tTdPg/vvmIQ3c\n0QIhAMzsLito4Bmh24Jgq3Ulrm23Jn5qwHCDxb2sP0bC6gJJAiEAxa/Fr2WDqR6z\nI3xEBecizVCDGkyd/QZ07UmOGTd5cfcCIDb+m1VjC+FVIsfWka0as7kWEeqTU5ne\ng07nzwN6g7qhAiEAi0SLhkeD+68PEN7IpUfycqZX1j1HyCu2UDzTiNxWCH0CIBI/\nmMd4eg8KHglqO1RaqOr47G4O9R8DxXX1h4Dl4Js+\n-----END RSA PRIVATE KEY-----\n';
    var privkey_base64 = 'MIIBOgIBAAJBAJ4+czkdnq6/dqAoPCGSrdf2drOLpORpiqSXVeYirZ4YTHa5uRE7HYdSXLipExn1GsLd5J+Ot3p4N2FniR5LbW8CAwEAAQJASt5jJ4/DBwyhNG802/GI/JeoW5RjRIpGxU6wnnyjxhscfcyGNvurAEWS22x46yag8PJyQ32tTdPg/vvmIQ3c0QIhAMzsLito4Bmh24Jgq3Ulrm23Jn5qwHCDxb2sP0bC6gJJAiEAxa/Fr2WDqR6zI3xEBecizVCDGkyd/QZ07UmOGTd5cfcCIDb+m1VjC+FVIsfWka0as7kWEeqTU5neg07nzwN6g7qhAiEAi0SLhkeD+68PEN7IpUfycqZX1j1HyCu2UDzTiNxWCH0CIBI/mMd4eg8KHglqO1RaqOr47G4O9R8DxXX1h4Dl4Js+';
    var pubkey_file = 'test/support/rsa_public.pem';
    var privkey_file = 'test/support/rsa_private.pem';
    var encrypted;
    var decrypted;

    it('should encrypt the original text', function(done) {
      encrypted = util.encrypt(pubkey, original_text);
      should.exist(encrypted);
      encrypted.should.not.eql(original_text);
      done();
    });

    it('should decrypt the original text', function(done) {
      decrypted = util.decrypt(privkey, encrypted);
      should.exist(decrypted);
      decrypted.should.eql(original_text);
      done();
    });

    it('should get the public key and parse it', function(done) {
      var pem = util.get_pem_file(pubkey_file);
      should.exist(pem);
      pem.should.eql(pubkey);
      var key = util.parse_pem(pem);
      should.exist(pem);
      key.should.eql(pubkey_base64);
      done();
    });

    it('should get the private key and parse it', function(done) {
      var pem = util.get_pem_file(privkey_file);
      should.exist(pem);
      pem.should.eql(privkey);
      var key = util.parse_pem(pem);
      should.exist(pem);
      key.should.eql(privkey_base64);
      done();
    });
  });
});
