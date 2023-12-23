const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const app = express();
const port = 3001;

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});

const allSessions = {};
const client = new Client({
    puppeteer: {
        headless: false
    },
    authStrategy: new LocalAuth({
        clientId: "CLIENT_ID_1"
    })
});

client.on('qr', (qr) => {
    console.log("QR Received", qr);
});

client.on('ready', () => {
    console.log("Client is ready");
});

client.initialize();