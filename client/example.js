
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

let alice = 'c408fd08e280181e331f8c05ce5f7210f9a5a45220c44cbd5f9c8052a14ac21c' // '4e64a753b3cb46888fc85845d61de1bfa4300e60'
let bob = '7f63caf88965e56f87f3aeaaf5a221a69fdea0bc14c76b3879e6679748fddcad'
let caddy = '6d0c55f6b69c5b2fd80f8e6468f2c7e92a03de9ab1a49cdadbed4fb09e711ac8'

let keypair = importKey(alice)
let timer = 1534589414000 // Math.floor(Date.now())
let result = null

let msgs = []

let state = { seq: result && result.seq || 0, roots: [] }
result = make(keypair, 'post', {text: 'hello'}, timer, state)
msgs.push(result)
timer += 10000

console.log('result1', result)

result = make(keypair, 'post', {text: 'hello'}, timer, result)
msgs.push(result)
timer += 10000

console.log('result2', result)

result = make(keypair, 'post', {text: 'hello'}, timer, result)
msgs.push(result)
timer += 10000

console.log('result3', result)

// for (var i = 0; i < 1; i++) {
//   msgs.push(result)
//   timer += 10000
// }

console.log(check(msgs[0]))




const baseurl = 'http://localhost:3000'

async function addAccount(address) {
  return axios.post(baseurl + '/api/add_account', {pubkey: address})
}

async function getAccount(address) {
  return axios.post(baseurl + '/api/get_account', {pubkey: address})
}

async function addMessage(msg) {
  return axios.post(baseurl + '/api/add_message', {message: JSON.stringify(msg)})
}

async function getMessage(key) {
  return axios.get(baseurl + '/api/get_message', { params: { key: key} })
}


async function testFetchAddress() {
  let address = hexencode(keypair.getAddress())
  let val = await addAccount(address)
  console.log(val.data)

  val = await getAccount(address)
  console.log(val.data)
}

async function testAddMessage() {
  for (var i = 0; i < 10; i++) {
    await addMessage(msgs[i])
  }

  let value = await getMessage(msgs[0].key)
  console.log(value.data)
}

async function testMain() {
  // testFetchAddress()
  // testAddMessage()
}

testMain()
