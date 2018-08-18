
// const Web3 = require('web3')
// const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

const axios = require('axios')
const client = require('./')
const importKey = client.importKey
const signData = client.signData
const verifyData = client.verifyData
const make = client.make
const check = client.check

function hexencode(data) {
  return '0x' + data.toString('hex')
}

let key = 'c408fd08e280181e331f8c05ce5f7210f9a5a45220c44cbd5f9c8052a14ac21c'
let bob = '7f63caf88965e56f87f3aeaaf5a221a69fdea0bc14c76b3879e6679748fddcad'
let caddy = '6d0c55f6b69c5b2fd80f8e6468f2c7e92a03de9ab1a49cdadbed4fb09e711ac8'

let keypair = importKey(key)
let timer = 1534589414000 // Math.floor(Date.now())
let result = null

for (var i = 0; i < 10; i++) {
  result = make(keypair, 'post', {text: 'hello ' + (i + 1)}, result && result.seq || 0, result && result.key, timer)
  console.log(result)
  timer += 10000
}