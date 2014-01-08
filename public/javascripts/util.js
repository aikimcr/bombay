function util() {}

util.inherits = function(target, source) {
  target.super = source.prototype;
  for (var k in source.prototype)
    target.prototype[k] = source.prototype[k];
}

util.strMapCharsToStr = function(str1, str2) {
  var pi = 0;
  var result = '';

  for (var si = 0; si < str2.length; si++) {
    var cc = str1.charCodeAt(pi) ^ str2.charCodeAt(si);
    result += String.fromCharCode(cc);
    pi++;
    if (pi >= str1.length) pi = 0;
  }

  return result;
};

util.encrypt = function(key_in, input) {
  var rsa = new pidCrypt.RSA();
  var key = pidCryptUtil.decodeBase64(key_in);
  var asn = new pidCrypt.ASN1.decode(pidCryptUtil.toByteArray(key));
  var tree = asn.toHexTree();
  rsa.setPublicKeyFromASN(tree);
  return rsa.encrypt(input);
};

util.decrypt = function(key_in, input) {
  var rsa = new pidCrypt.RSA();
  var key = pidCryptUtil.decodeBase64(key_in);
  var asn = new pidCrypt.ASN1.decode(pidCryptUtil.toByteArray(key));
  var tree = asn.toHexTree();
  rsa.setPrivateKeyFromASN(tree);
  return rsa.decrypt(input);
};
