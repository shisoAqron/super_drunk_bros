const fs = require("fs")
const path = require("path")
const request = require('request')
const Obniz = require("obniz")

const tokenObj = JSON.parse(fs.readFileSync(path.join(__dirname,'/token.json'), 'utf8'))
const obniz = new Obniz(tokenObj.id)
const debug = false

obniz.onconnect = async () => {
  /**
   * init ioPINs
   * io0-3: sensor1
   * io4-7: sensor2
  */

  obniz.io2.output(true)
  obniz.io3.output(false)
  obniz.ad0.start()
  let running = false

  obniz.io6.output(true)
  obniz.io7.output(false)
  obniz.ad4.start()
  let jumpping = false

  obniz.ad0.onchange = async voltage =>{
    if(debug) console.log("light2 changed to "+voltage+" v")
    if(voltage > 1 && running == false){
      running = true
      sendCommand('dpad/hold/6')
      setTimeout(
        () => {
          sendCommand('dpad/hold/5')
          running = false
        }
        ,50)
    }
  }

  obniz.ad4.onchange = async voltage =>{
    if(debug) console.log("light2 changed to "+voltage+" v")
    if(voltage > 1 && jumpping == false){
      jumpping = true
      sendCommand('dpad/hold/6')
      //await obniz.wait(200);
      sendCommand('btn/hold/8')
      setTimeout(
        () => {
          sendCommand('btn/release/8')
          jumpping = false
        }
        ,700)
      setTimeout(
        () => {
          sendCommand('dpad/hold/5')
        }
        ,300)
    }
  }

}

obniz.onclose = async () => {
  sendCommand('dpad/hold/5')
  sendCommand('btn/release/8')
  sendCommand('btn/release/9')
}

const sendCommand = param =>{
  let baseurl = 'http://10.0.231.232:1880/'
  let options = {
    url: baseurl + param,
    method: 'GET'
  }
  request(
    options,
    (error, response, body) => {
      if(debug) console.log(body)
    }
  )
}

