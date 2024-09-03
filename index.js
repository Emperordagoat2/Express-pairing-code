import { Boom } from '@hapi/boom'
import Baileys, {
  DisconnectReason,
  delay,
  Browsers,
  useMultiFileAuthState
} from '@whiskeysockets/baileys'
import cors from 'cors'
import express from 'express'
import fs from 'fs'
import { readFile } from 'fs/promises'
import { Pastebin, PrivacyLevel, ExpirationTime } from "pastedeno";
import path, { dirname } from 'path'
import pino from 'pino'
import { fileURLToPath } from 'url'

const app = express()

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

  res.setHeader('Pragma', 'no-cache')

  res.setHeader('Expires', '0')
  next()
})

app.use(cors())

const pastebin = new Pastebin({
  api_dev_key: "06S06TKqc-rMUHoHsrYxA_bwWp9Oo12y",
});

let PORT = process.env.PORT || 8000
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function createRandomId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < 10; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return id
}

let sessionFolder = `./auth/${createRandomId()}`
if (fs.existsSync(sessionFolder)) {
  try {
    fs.rmdirSync(sessionFolder, { recursive: true })
    console.log('Deleted the "SESSION" folder.')
  } catch (err) {
    console.error('Error deleting the "SESSION" folder:', err)
  }
}

let clearState = () => {
  fs.rmdirSync(sessionFolder, { recursive: true })
}

function deleteSessionFolder() {
  if (!fs.existsSync(sessionFolder)) {
    console.log('The "SESSION" folder does not exist.')
    return
  }

  try {
    fs.rmdirSync(sessionFolder, { recursive: true })
    console.log('Deleted the "SESSION" folder.')
  } catch (err) {
    console.error('Error deleting the "SESSION" folder:', err)
  }
}

app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/qr', async (req, res) => {
  res.sendFile(path.join(__dirname, 'qr.html'))
})

app.get('/code', async (req, res) => {
  res.sendFile(path.join(__dirname, 'pair.html'))
})

app.get('/pair', async (req, res) => {
  let phone = req.query.phone

  if (!phone) return res.json({ error: 'Please Provide Phone Number' })

  try {
    const code = await startnigg(phone)
    res.json({ code: code })
  } catch (error) {
    console.error('Error in WhatsApp authentication:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

async function startnigg(phone) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!fs.existsSync(sessionFolder)) {
        await fs.mkdirSync(sessionFolder)
      }

      const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)

      const negga = Baileys.makeWASocket({
        version: [2, 3000, 1015901307],
        printQRInTerminal: false,
        logger: pino({
          level: 'silent',
        }),
        browser: Browsers.ubuntu("Chrome"),
        auth: state,
      })

      if (!negga.authState.creds.registered) {
        let phoneNumber = phone ? phone.replace(/[^0-9]/g, '') : ''
        if (phoneNumber.length < 11) {
          return reject(new Error('Please Enter Your Number With Country Code !!'))
        }
        setTimeout(async () => {
          try {
            let code = await negga.requestPairingCode(phoneNumber)
            console.log(`Your Pairing Code : ${code}`)
            resolve(code)
          } catch (requestPairingCodeError) {
            const errorMessage = 'Error requesting pairing code from WhatsApp'
            console.error(errorMessage, requestPairingCodeError)
            return reject(new Error(errorMessage))
          }
        }, 3000)
      }

      negga.ev.on('creds.update', saveCreds)

      negga.ev.on('connection.update', async update => {
        const { connection, lastDisconnect } = update

        if (connection === 'open') {
          await delay(10000)
          let data1 = await readFile(`${sessionFolder}/creds.json`)
          const output = await pastebin.createPaste({
            text: data1.toString(),
            title: "Guru Ai",
            format: "javascript",
            privacy: PrivacyLevel.UNLISTED,
            expiration: ExpirationTime.ONE_MONTH
        });
          
          const sessi = 'GuruBot~' + output.split('https://pastebin.com/')[1]
          console.log(sessi)
          await delay(2000)
          let guru = await negga.sendMessage(negga.user.id, { text: sessi })
          await delay(2000)
          await negga.sendMessage(
            negga.user.id,
            {
              text: '*𝐉𝐎𝐇𝐍𝐋𝐄𝐎-𝐌𝐃 𝐈𝐒 𝐒𝐄𝐒𝐒𝐈𝐎𝐍 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘*
> Copy the above session Id and deploy *JOHNLEO-MD*.

*𝐅𝐎𝐋𝐋𝐎𝐖 𝐎𝐔𝐑 𝐎𝐅𝐅𝐈𝐂𝐈𝐀𝐋 𝐖𝐀.𝐂𝐇𝐀𝐍𝐍𝐄𝐋* 
> https://whatsapp.com/channel/0029VamlYh41SWssaEvw4E2i

*𝐅𝐎𝐋𝐋𝐎𝐖 𝐌𝐄 𝐎𝐍 𝐆𝐈𝐓𝐇𝐔𝐁*
> https://github.com/johnleosmith

*𝐉𝐎𝐈𝐍 𝐓𝐇𝐄 𝐖𝐀 𝐃𝐈𝐒𝐂𝐔𝐒𝐒𝐈𝐎𝐍 𝐆𝐑𝐎𝐔𝐏*
> https://chat.whatsapp.com/GkOeZ2eLZhx6lenAq1z83o

*𝐅𝐎𝐋𝐋𝐎𝐖 𝐎𝐔𝐑 𝐓𝐄𝐋𝐄𝐆𝐑𝐀𝐌 𝐂𝐇𝐀𝐍𝐍𝐄𝐋*
> https://t.me/JohnleoTech

*𝐅𝐎𝐋𝐋𝐎𝐖 𝐎𝐔𝐑 𝐘𝐎𝐔𝐓𝐔𝐁𝐄 𝐂𝐇𝐀𝐍𝐍𝐄𝐋*
> https://www.youtube.com/@JohnleoTech

> ✅✅ 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐉𝐎𝐇𝐍𝐋𝐄𝐎 𝐓𝐄𝐂𝐇✅✅',
            },
            { quoted: guru }
          )

          console.log('Connected to WhatsApp Servers')

          try {
            deleteSessionFolder()
          } catch (error) {
            console.error('Error deleting session folder:', error)
          }

          process.send('reset')
        }

        if (connection === 'close') {
          let reason = new Boom(lastDisconnect?.error)?.output.statusCode
          console.log('Connection Closed:', reason)
          if (reason === DisconnectReason.connectionClosed) {
            console.log('[Connection closed, reconnecting....!]')
            process.send('reset')
          } else if (reason === DisconnectReason.connectionLost) {
            console.log('[Connection Lost from Server, reconnecting....!]')
            process.send('reset')
          } else if (reason === DisconnectReason.loggedOut) {
            clearState()
            console.log('[Device Logged Out, Please Try to Login Again....!]')
            process.send('reset')
          } else if (reason === DisconnectReason.restartRequired) {
            console.log('[Server Restarting....!]')
            startnigg()
          } else if (reason === DisconnectReason.timedOut) {
            console.log('[Connection Timed Out, Trying to Reconnect....!]')
            process.send('reset')
          } else if (reason === DisconnectReason.badSession) {
            console.log('[BadSession exists, Trying to Reconnect....!]')
            clearState()
            process.send('reset')
          } else if (reason === DisconnectReason.connectionReplaced) {
            console.log(`[Connection Replaced, Trying to Reconnect....!]`)
            process.send('reset')
          } else {
            console.log('[Server Disconnected: Maybe Your WhatsApp Account got Fucked....!]')
            process.send('reset')
          }
        }
      })

      negga.ev.on('messages.upsert', () => {})
    } catch (error) {
      console.error('An Error Occurred:', error)
      throw new Error('An Error Occurred')
    }
  })
}

app.listen(PORT, () => {
  console.log(`API Running on PORT:${PORT}`)
})
