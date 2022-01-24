const Imap = require('imap')

const imap = new Imap({
  user: process.env.NAVER_USER,
  password: process.env.NAVER_PASSWORD,
  host: 'imap.naver.com',
  port: 993,
  tls: true,
})

const mails = []

imap.once('ready', () => {
  imap.openBox('INBOX', true, (err, box) => {
    if (err) throw err

    const f = imap.seq.fetch('4:5', {
      bodies: ['HEADER', 'TEXT'],
      struct: true,
    })

    f.on('message', (msg, seqno) => {
      // console.log('Message #%d', seqno)

      msg.on('body', (stream, info) => {
        console.log('👀 - info', info)
        let buffer = ''

        stream.on('data', (chunk) => {
          buffer += chunk.toString('utf8')
        })

        stream.once('end', () => {
          if (info.which === 'HEADER') {
            mails.push(Imap.parseHeader(buffer))
          } else if (info.which === 'TEXT') {
            // mails.push(buffer.toString())
            // console.log('👀 - buffer', buffer)
          }
          // console.log('Parsed header: ', Imap.parseHeader(buffer))
        })
      })

      msg.once('attributes', (attrs) => {
        // console.log(prefix + 'Attributes: ', JSON.stringify(attrs, null, 2))
      })

      msg.once('end', () => {
        // console.log(prefix + 'Finished')
      })
    })

    f.once('error', (err) => {
      console.log('Fetch error: ' + err)
    })

    f.once('end', () => {
      console.log(mails)
      imap.end()
    })
  })
})

imap.once('error', (err) => {
  console.log(err)
})

imap.once('end', () => {
  console.log('Connection ended')
})

imap.connect()
