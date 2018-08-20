const ewallet = require('ethereumjs-wallet')
const eutil = require('ethereumjs-util')
const rlp = require('rlp')
const flat = require('flat-tree')


function MerkleGenerator (roots) {
  if (!(this instanceof MerkleGenerator)) return new MerkleGenerator(roots)

  this.roots = roots || []
  this.blocks = this.roots.length ? 1 + flat.rightSpan(this.roots[this.roots.length - 1].index) / 2 : 0
  this.blockdata = []


  for (var i = 0; i < this.roots.length; i++) {
    var r = this.roots[i]
    if (r && !r.parent) r.parent = flat.parent(r.index)
  }

  this._leaf = function (leaf, roots) {
    return sha3(leaf.data)
  }
  this._parent = function (a, b) {
    return sha3([a.hash, b.hash])
  }
}

MerkleGenerator.prototype.next = function (data, nodes) {
  if (!Buffer.isBuffer(data)) data = new Buffer(data)
  if (!nodes) nodes = []

  var index = 2 * this.blocks++

  var leaf = {
    index: index,
    parent: flat.parent(index),
    hash: null,
    size: data.length,
    data: data
  }

  leaf.hash = this._leaf(leaf, this.roots)
  this.roots.push(leaf)
  // nodes.push(leaf)

  this.blockdata[leaf.index] = leaf

  while (this.roots.length > 1) {
    var left = this.roots[this.roots.length - 2]
    var right = this.roots[this.roots.length - 1]

    if (left.parent !== right.parent) break

    this.roots.pop()
    this.roots[this.roots.length - 1] = leaf = {
      index: left.parent,
      parent: flat.parent(left.parent),
      hash: this._parent(left, right),
      size: left.size + right.size,
      data: null
    }
    // nodes.push(leaf)
  }

  this.blockdata[leaf.index] = leaf

  return nodes
}

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

function splitSigForContract(data) {
  var val = data.slice(2)
  var r = `0x${val.slice(0, 64)}`
  var s = `0x${val.slice(64, 128)}`
  var v = parseInt(val.slice(128, 130),16)
  return {r ,s, v}
}

function splitSig(data) {
  var val = data.slice(2)
  var r = new Buffer(val.slice(0, 64), 'hex')
  var s = new Buffer(val.slice(64, 128), 'hex')
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
  if (Array.isArray(data)) {
    return eutil.sha3(Buffer.concat(data))
  } else {
    return eutil.sha3(data)
  }
}

function signData(data, keypair) {
  let signed = eutil.ecsign(data, keypair.getPrivateKey())
  return concatSig(eutil.ecsign(data, keypair.getPrivateKey()))
}

function verifyData(data, signed, author) {
  signed = splitSig(signed)
  let recovered = eutil.pubToAddress(eutil.ecrecover(data, signed.v, signed.r, signed.s))
  // console.log(recovered.toString('hex'))
  // console.log(author.toString('hex'))
  return recovered.toString('hex') === author.toString('hex')
}


function make(keys, type, content, timestamp, state) {
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

  payload = rlp.encode(payload)
  payload = [
    ["msgtype", type],
    ["author", author],
    ["seq", (state.seq + 1)],
    ["timestamp", timestamp],
    ["content", sha3(payload)]
  ]
  let encoded = rlp.encode(payload)
  let sha3Encoded = sha3(encoded)
  let signEncoded = signData(sha3Encoded, keys)

  let roots = state.roots
  let gen = new MerkleGenerator(roots)
  gen.next(encoded)
  let signroots = signData(sha3(gen.roots.map(x => x.hash)), keys)
  // console.log('input', signroots, (gen.roots.map(x => x.hash)), )

  let msg = {
    msgtype: type,
    author: ('0x' + author.toString('hex')),
    seq: (state.seq + 1),
    timestamp: timestamp,
    content: msg_data,
    key: ('0x' + sha3Encoded.toString('hex')),
    sig: signEncoded,
    roots: gen.roots.map(x => { return {hash: '0x' + x.hash.toString('hex'), index: x.index} } ),
    signroots: signroots,
  }
  // console.log(msg)
  return msg
}

function check(msg) {
  let author = hexdecode(msg.author)
  let payload = []
  let msgschema = schema[msg.msgtype]
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

  payload = rlp.encode(payload)
  payload = [
    ["msgtype", msg.msgtype],
    ["author", hexdecode(msg.author)],
    ["seq", msg.seq],
    ["timestamp", msg.timestamp],
    ["content", sha3(payload)]
  ]
  let encoded = rlp.encode(payload)
  let sha3Encoded = sha3(encoded)
  let roots = msg.roots.map(x => new Buffer(x.hash.slice(2), 'hex'))
  let signroots = verifyData(sha3(roots), msg.signroots, author)
  // console.log('outputs', msg.roots, signroots)

  return verifyData(sha3Encoded, msg.sig, author)
}

exports.check = check
exports.make = make
exports.verifyData = verifyData
exports.signData = signData
exports.importKey = importKey


