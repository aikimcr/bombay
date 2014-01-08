var should = chai.should();


describe('util', function() {
  describe('#encryption', function() {
    var original_text = 'Plover is a shore bird';
    var pubkey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJ4+czkdnq6/dqAoPCGSrdf2drOLpORpiqSXVeYirZ4YTHa5uRE7HYdSXLipExn1GsLd5J+Ot3p4N2FniR5LbW8CAwEAAQ==';
    var privkey = 'MIIBOgIBAAJBAJ4+czkdnq6/dqAoPCGSrdf2drOLpORpiqSXVeYirZ4YTHa5uRE7HYdSXLipExn1GsLd5J+Ot3p4N2FniR5LbW8CAwEAAQJASt5jJ4/DBwyhNG802/GI/JeoW5RjRIpGxU6wnnyjxhscfcyGNvurAEWS22x46yag8PJyQ32tTdPg/vvmIQ3c0QIhAMzsLito4Bmh24Jgq3Ulrm23Jn5qwHCDxb2sP0bC6gJJAiEAxa/Fr2WDqR6zI3xEBecizVCDGkyd/QZ07UmOGTd5cfcCIDb+m1VjC+FVIsfWka0as7kWEeqTU5neg07nzwN6g7qhAiEAi0SLhkeD+68PEN7IpUfycqZX1j1HyCu2UDzTiNxWCH0CIBI/mMd4eg8KHglqO1RaqOr47G4O9R8DxXX1h4Dl4Js+';
    var encrypted;
    var decrtyped;

    var server_pubkey;

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

    it('should get the public key from the server', function(done) {
      var ajax = new XMLHttpRequest();
      ajax.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200 || this.status == 304) {
            var response;
            try {
              response = JSON.parse(this.responseText);
            } catch(e) {
              window.console.log('Error parsing response text');
              window.console.log(e);
            }
          } else {
            window.console.log("error");
          }

          should.exist(response);
          response.should.have.property('public_key');
          server_pubkey = response.public_key;
          done();
        }
      };

      ajax.open('GET', '/encryption?action=pubkey');
      ajax.send();
    });

    it('should encrypt the text with the server key', function(done) {
      original_text = 'Plover';
      encrypted = util.encrypt(server_pubkey, original_text);
      should.exist(encrypted);
      encrypted.should.not.eql(original_text);
      done();
    });

    it('should check the encryption with the server', function(done) {
      var ajax = new XMLHttpRequest();
      ajax.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200 || this.status == 304) {
            var response;
            try {
              response = JSON.parse(this.responseText);
            } catch(e) {
              window.console.log('Error parsing response text');
              window.console.log(e);
            }
          } else {
            window.console.log("error");
            should.not.exist('status error');
          }
          should.exist(response);
          response.should.have.property('match');
          response.match.should.eql(true);
          done();
        }
      };

      ajax.open('GET', '/encryption?action=check&clear=' + original_text + '&encrypted=' + encrypted);
      ajax.send();
    });
  });
});
