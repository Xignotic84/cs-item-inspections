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
    // Attempt to make connection to mailing service
    transporter.verify(async err => {
      if (err) {
        // If an error occurs check if attempt is greater then 3
        if (attempt > 3) return console.error(`[MAILER] Connection failed, killing connection`)
        // Add 1 attempt to variable
        attempt++
        // Check if error code indicates a previous connection exists
        if (err.errno === -4077) {
          // Restart process
          this.init()
          return  console.error(`[MAILER] Killing of previous instance`)
        }
        // Console log failure to connect
        console.log('[MAILER] Mail failed to connect.')
        // Retry after 5 seconds
        setTimeout(() => {
          return this.init()
        }, 5000)
      } else {
        // Set connect variable to true
        connected = true
        // Console log connection success
        console.log('[MAILER] Mail service initiated')
        // Loop through email array every 5 seconds to send out queued emails. Helps with large number of requests to prevent any being missed.
        setInterval(() => {
          emailList.forEach(d => {
            // Send mail using custom function
            this.sendMail(d.data)
          })
          // Clear array
          emailList = []
        }, 5000)
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

