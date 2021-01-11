const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  secure: true,
  auth: {
    user: process.env.MAILER_AUTH_USER,
    pass: process.env.MAILER_AUTH_PASS
  }
})

let emailList = []
let connected = false

module.exports = {
  init() {
    transporter.verify(async err => {
      if (err) {
        if (err.errno === -4077) return console.error(`[MAILER] Killing of previous instance`)
        console.log('[MAILER] Mail failed to connect.')
        setTimeout(() => {
          return init()
        }, 5000)
      } else {
        connected = true
        console.log('[MAILER] Mail service initiated')
        setInterval(() => {
          emailList.forEach(d => {
            this.sendMail(d)
          })
          emailList = []
        }, 15000)
      }
    })
  },
  sendMail(type, {from, to, subject, text, html}) {
    console.log({from, to, subject, text, html})
    console.log(`[MAILER] Sending email to ( ${to} )`)
    return transporter.sendMail({
      from: from,
      to,
      subject,
      text,
      html
    })
  },
  send(data) {
    if (emailList.filter(d => d.to.includes(data.to) && d.type.includes(type))) return
    emailList.push(data)
  }
}

