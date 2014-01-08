var should = chai.should();

describe('util', function() {
  describe('#encryption', function() {
    var original_text = 'Plover is a shore bird';
    var pubkey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJ4+czkdnq6/dqAoPCGSrdf2drOLpORpiqSXVeYirZ4YTHa5uRE7HYdSXLipExn1GsLd5J+Ot3p4N2FniR5LbW8CAwEAAQ==';
    var privkey = 'MIIBOgIBAAJBAJ4+czkdnq6/dqAoPCGSrdf2drOLpORpiqSXVeYirZ4YTHa5uRE7HYdSXLipExn1GsLd5J+Ot3p4N2FniR5LbW8CAwEAAQJASt5jJ4/DBwyhNG802/GI/JeoW5RjRIpGxU6wnnyjxhscfcyGNvurAEWS22x46yag8PJyQ32tTdPg/vvmIQ3c0QIhAMzsLito4Bmh24Jgq3Ulrm23Jn5qwHCDxb2sP0bC6gJJAiEAxa/Fr2WDqR6zI3xEBecizVCDGkyd/QZ07UmOGTd5cfcCIDb+m1VjC+FVIsfWka0as7kWEeqTU5neg07nzwN6g7qhAiEAi0SLhkeD+68PEN7IpUfycqZX1j1HyCu2UDzTiNxWCH0CIBI/mMd4eg8KHglqO1RaqOr47G4O9R8DxXX1h4Dl4Js+';
    var encrypted;
    var decrtyped;

    it('should encrypt the original text', function(done) {
      encrypted = util.encrypt(pubkey, original_text);
      should.exist(encrypted);
      encrypted.should.not.eql(original_text);
      done();
    });

    it('should decrypt the encrypted text', function(done) {
      decrypted = util.decrypt(privkey, encrypted);
      should.exist(decrypted);
      decrypted.should.eql(original_text);
      done();
    });
  });
});
