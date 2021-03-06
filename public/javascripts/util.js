function util() {}

util.inherits = function(target, source) {
  target.prototype = Object.create(source.prototype);
  target.prototype.constructor = target;
  target.prototype.super = source;
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
  return pidCryptUtil.encodeBase64(pidCryptUtil.convertFromHex(rsa.encrypt(input)));
};

util.decrypt = function(key_in, input) {
  var rsa = new pidCrypt.RSA();
  var key = pidCryptUtil.decodeBase64(key_in);
  var asn = new pidCrypt.ASN1.decode(pidCryptUtil.toByteArray(key));
  var tree = asn.toHexTree();
  rsa.setPrivateKeyFromASN(tree);
  var buffer = pidCryptUtil.decodeBase64(pidCryptUtil.stripLineFeeds(input));
  var hex = pidCryptUtil.convertToHex(buffer);
  return rsa.decrypt(hex);
};
