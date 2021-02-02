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
let attempt = 0

module.exports = {
  init() {
    transporter.verify(async err => {
      if (err) {
        if (attempt > 3) return console.error(`[MAILER] Connection failed, killing connection`)
        attempt++
        if (err.errno === -4077) {
          this.init()
          return  console.error(`[MAILER] Killing of previous instance`)
        }
        console.log('[MAILER] Mail failed to connect.')
        setTimeout(() => {
          return this.init()
        }, 5000)
      } else {
        connected = true
        console.log('[MAILER] Mail service initiated')
        setInterval(() => {
          emailList.forEach(d => {
            this.sendMail(d.data)
          })
          emailList = []
        }, 15000)
      }
    })
  },
  sendMail({from, to, subject, text, html}) {
    console.log(`[MAILER] Sending email to ( ${to} )`)
    return transporter.sendMail({
      from: from,
      to,
      subject,
      text,
      html
    })
  },
  send(type, data) {
    if (emailList.filter(d => d.email === data.email && d.type === type).length > 0) return
    emailList.push({data: data, type: type})
  }
}

