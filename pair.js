const express = require('express');
const fs = require('fs');
const pino = require('pino');
const {
    default: makeWASocket,
    Browsers,
    delay,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    PHONENUMBER_MCC,
    makeCacheableSignalKeyStore,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");
const NodeCache = require('node-cache');
const chalk = require('chalk');
const readline = require('readline');

let router = express.Router();
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    let phoneNumber = req.query.number || "";
    const pairingCode = !!phoneNumber || req.query.pairingCode;
    const useMobile = req.query.mobile;

    async function qr() {
        let { version } = await fetchLatestBaileysVersion();
        const { state, saveCreds } = await useMultiFileAuthState('./sessions');
        const msgRetryCounterCache = new NodeCache();

        const XeonBotInc = makeWASocket({
            logger: pino({ level: 'silent' }),
            printQRInTerminal: !pairingCode,
            browser: Browsers.windows('Firefox'),
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            getMessage: async (key) => {
                let jid = jidNormalizedUser(key.remoteJid);
                let msg = await store.loadMessage(jid, key.id);
                return msg?.message || "";
            },
            msgRetryCounterCache,
            defaultQueryTimeoutMs: undefined,
        });

        if (pairingCode && !XeonBotInc.authState.creds.registered) {
            if (useMobile) return res.status(400).send('Cannot use pairing code with mobile API');

            if (phoneNumber) {
                phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
                if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
                    return res.status(400).send("Commencez par le code du pays de votre numéro WhatsApp, exemple : +24160338758");
                }
            } else {
                phoneNumber = await question(chalk.bgBlack(chalk.greenBright("Veuillez saisir votre numéro WhatsApp \nPar exemple : +24102150169 : ")));
                phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

                if (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
                    return res.status(400).send("Commencez par le code du pays de votre numéro WhatsApp, exemple : +24102150169");
                }
            }

            setTimeout(async () => {
                let code = await XeonBotInc.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }, 3000);
        }

        XeonBotInc.ev.on("connection.update", async (s) => {
            const { connection, lastDisconnect } = s;
            if (connection === "open") {
                await delay(10000);
                await XeonBotInc.sendMessage(XeonBotInc.user.id, { text: `*◕ ⚠️ ᴘʟᴇᴀꜱᴇ ᴅᴏ ɴᴏᴛ ꜱʜᴀʀᴇ ʏᴏᴜʀ ᴄʀᴇᴅ.ᴊꜱᴏɴ ꜰɪʟᴇ ᴡɪᴛʜ ᴀɴʏᴏɴᴇ ᴘʟᴇᴀꜱᴇ ᴜꜱᴇ ᴛʜᴇ ᴠᴇʀꜱɪᴏɴ ᴏꜰ famous ᴏʀ ʙᴜɢ ᴊᴏɪɴ ᴛʜᴇ ꜱᴜᴘᴘᴏʀᴛ ɢʀᴏᴜᴘ ᴀɴᴅ ᴛʜᴇ ᴄʜᴀɴɴᴇʟ ꜰᴏʀ ᴜᴘᴅᴀᴛᴇꜱ ᴛᴏ ᴄᴏᴍᴇ ʙᴇꜱᴛ ʀᴇɢᴀʀᴅꜱ PAPA IGWE.*` });
                await XeonBotInc.sendMessage(XeonBotInc.user.id, { text: `*ɢʀᴏᴜᴘ:* https://chat.whatsapp.com/C6ivOH7HeeR5URsOcTeGhE\n*ᴄʜᴀɴᴇʟ:* https://whatsapp.com/channel/0029VartOqACMY0OUI2n350j\n*ʏᴏᴜᴛᴜʙᴇ:* https://youtube.com/igwwtech\n*ɪɴꜱᴛᴀɢʀᴀᴍ:* https://www.instagram.com/igwe\n*ɢɪᴛʜᴜʙ:* https://github.com/Papaigwe1234/FAMOUS-BUG` });
                
                let sessionXeon = fs.readFileSync('./sessions/creds.json');
                await delay(2000);
                const xeonses = await XeonBotInc.sendMessage(XeonBotInc.user.id, { document: sessionXeon, mimetype: 'application/json', fileName: 'creds.json' });
                await XeonBotInc.groupAcceptInvite("Kjm8rnDFcpb04gQNSTbW2d");
                await XeonBotInc.sendMessage(XeonBotInc.user.id, {
                    text: `*FAMOUS-BUG-V1*



　　　⢀⡤⠔⠒⠒⢌⡛⠒⢦⣄     
　　⡠⠚⠁　⣀⡠⠒⠚⡄⠑　⠈⠳⡄   
　⢀⡞⠁⠠⠦　　　⠸⠠ 　⢀⠤⠜⣆  
⢀⡎　　⠡⡀　⠐⠂　⠈　　⣁ ⣀⣸⡆ 
⢸ ⡤⡀　⡧　　　⠠⠤　⠨　　　⢧ 
 ⢧　⠈⢀⠆⣤⣤⣶⣶⣦⣤⠁⢀⠔⣢⣴⣶⢨⠇
　⠘⡆⡄　 ⣿⣿⣿⣿⣿⣿⡆　⣼⣿⣿⣿⡏ 
　　⢻ ⠇　⠙⢿⣿⣿⡿⢿⠁ ⠻⠿⠿⢿⡅ 
  ⢈⡷⢼⠈⢈⣀⠠　⠐⠊⢀⣾⡟⣦⠤⠼⠁ 
　　⠘⣆⠅⣽⠉⠘⡆⠆　⢀⠛⠓⡁⢻    
　　　⢺⠐⠙⢦⢀⡧⣈⣘⣈⣀⣢⣣⣾    
　　　⠈⠳⢌⠈⠛⢷⣓⡜⢤⠧⡗⣿⡇    
　　　　　⠳⣄  ⠉⠍⠉⡀⡞     
　　　　　　⠉⠑⠲⠤⠴⠚⠁`
                }, { quoted: xeonses });
                await delay(2000);
                removeFile('./sessions');
                process.exit(0);
            }
            if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                qr();
            }
        });

        XeonBotInc.ev.on('creds.update', saveCreds);
        XeonBotInc.ev.on("messages.upsert", () => { });
    }

    qr().catch(err => {
        console.log("Erreur lors de la configuration du bot:", err);
        if (!res.headersSent) {
            res.status(500).send("Erreur interne du serveur");
        }
    });
});

process.on('uncaughtException', function (err) {
    let e = String(err);
    if (e.includes("conflict") || e.includes("not-authorized") || e.includes("Socket connection timeout") ||
        e.includes("rate-overlimit") || e.includes("Connection Closed") || e.includes("Timed Out") ||
        e.includes("Value not found")) return;
    console.log('Caught exception: ', err);
});

module.exports = router;
