const ewallet = require('ethereumjs-wallet')
const eutil = require('ethereumjs-util')
const rlp = require('rlp')

const schema = {
  'post': [
    {name: 'title', type: 'string', default: '', requied: false},
    {name: 'text', type: 'string', default: '', requied: true},
    {name: 'channel', type: 'string', default: '', requied: false},
    {name: 'mentions', type: 'array', default: [], requied: false},
  ],
  'reply': [
    {name: 'root', type: 'string', default: null, requied: false},
    {name: 'branch', type: 'string', default: null, requied: true},
    {name: 'text', type: 'string', default: '', requied: false},
    {name: 'mentions', type: 'array', default: [], requied: false},
  ],
  'contact': [
    {name: 'contact', type: 'string', requied: true},
    {name: 'following', type: 'boolean', default: true, requied: true},
    {name: 'blocking', type: 'boolean', default: false, requied: false},
  ],
  'vote': [
    {name: 'link', type: 'string', requied: true},
    {name: 'value', type: 'number', default: 0, requied: true},
    {name: 'reason', type: 'string', requied: false},
  ],
  'about': [
    {name: 'about', type: 'string', requied: true},
    {name: 'name', type:  'string', default: null, requied: false},
    {name: 'image', type: 'string', default: null, requied: false},
  ],
}

function hexdecode(data) {
  return new Buffer(data.slice(2), 'hex')
}

function concatSig(signed) {
  const v = signed.v
  const r = signed.r
  const s = signed.s
  const rSig = eutil.fromSigned(r)
  const sSig = eutil.fromSigned(s)
  const vSig = eutil.bufferToInt(v)
  const rStr = padWithZeroes(eutil.toUnsigned(rSig).toString('hex'), 64)
  const sStr = padWithZeroes(eutil.toUnsigned(sSig).toString('hex'), 64)
  const vStr = eutil.stripHexPrefix(eutil.intToHex(vSig))
  return eutil.addHexPrefix(rStr.concat(sStr, vStr)).toString('hex')
}

function splitSig(data) {
  var val = data.slice(2)
  var r = `0x${val.slice(0, 64)}`
  var s = `0x${val.slice(64, 128)}`
  var v = parseInt(val.slice(128, 130),16)
  return {r ,s, v}
}

function padWithZeroes (number, length) {
  var myString = '' + number
  while (myString.length < length) {
    myString = '0' + myString
  }
  return myString
}

function importKey(key) {
  return ewallet.fromPrivateKey(new Buffer(key,'hex'))
}

function generateKey(key) {
  return ewallet.generate()
}

function sha3(data) {
  return eutil.sha3(data)
}

function signData(data, keypair) {
  return concatSig(eutil.ecsign(data, keypair.getPrivateKey()))
}

function verifyData(data, signed, author) {
  signed = splitSig(signed)
  let recovered = eutil.pubToAddress(eutil.ecrecover(data, signed.v, signed.r, signed.s))
  return recovered.toString('hex') === author.toString('hex')
}


function make(keys, type, content, seq, previous, timestamp) {
  let author = keys.getAddress()
  let payload = []
  let msg_data = {}
  let msgschema = schema[type]
  if (!msgschema) return null

  for(item of msgschema) {
    let name = item.name
    let value = content[item.name]
    let itemtype = item.type
    if(!!value && value !== item.default) {
      if (typeof value === itemtype || itemtype === 'array' && Array.isArray(value)) {
        if (value === true) {
          payload.push([name, 1])
        } else if (value === false) {
          payload.push([name, 0])
        } else {
          payload.push([name, value])
        }
        msg_data[name] = value
      }
    }
  }

  payload = [
    ["msgtype", type],
    ["author", author],
    ["seq", (seq + 1)],
    ["previous", previous],
    ["timestamp", timestamp],
    ["content", sha3(payload)]
  ]
  let encoded = rlp.encode(payload)
  let sha3Encoded = sha3(encoded)
  let signEncoded = signData(sha3Encoded, keys)

  // console.log('payload encoded', encoded.toString('hex'))
  // console.log('payload sig', signEncoded)
  

  let msg = {
    msgtype: type,
    author: ('0x' + author.toString('hex')),
    seq: (seq + 1),
    previous: previous,
    timestamp: timestamp,
    content: msg_data,
    key: ('0x' + sha3Encoded.toString('hex')),
    sig: signEncoded,
  }
  return msg
}

function check(msg) {
  let author = hexdecode(msg.author)
  console.log('author', author)
  let payload = []
  let msgschema = schema[msg.type]
  if (!msgschema) return false

  for(item of msgschema) {
    let name = item.name
    let value = msg.content[item.name]
    let itemtype = item.type
    if(!!value && (typeof value === itemtype || itemtype === 'array' && Array.isArray(value)) && value !== item.default) {
      if (value === true) {
        payload.push([name, 1])
      } else if (value === false) {
        payload.push([name, 0])
      } else {
        payload.push([name, value])
      }
    }
  }

  payload = [
    ["msgtype", msg.type],
    ["author", hexdecode(msg.author)],
    ["seq", msg.seq],
    ["previous", msg.previous],
    ["timestamp", msg.timestamp],
    ["content", sha3(payload)]
  ]
  console.log('payload', payload)
  let encoded = rlp.encode(payload)
  let sha3Encoded = sha3(encoded)
  // console.log('sha3', sha3Encoded)
  return verifyData(sha3Encoded, msg.sig, author)
}

exports.check = check
exports.make = make
exports.verifyData = verifyData
exports.signData = signData
exports.importKey = importKey


