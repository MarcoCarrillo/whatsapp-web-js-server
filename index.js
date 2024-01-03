const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const app = express();
const port = 3001;
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"]
    },
});

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>')
})

server.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});

const allSessions = {};
const createWhatsappSession = (id, socket) => {

    const client = new Client({
        puppeteer: {
            headless: false
        },
        authStrategy: new LocalAuth({
            clientId: id
        })
    });

    client.on('qr', (qr) => {
        console.log("QR Received", qr);
        socket.emit('qr', {
            qr
        })
    });

    client.on('authenticated', () => {
        console.log('AUTHENTICATED');
    })

    client.on('ready', () => {
        console.log("Client is ready");
        allSessions[id] = client;
        socket.emit('ready', {
            id,
            message: 'Client is ready!'
        })

        client.on('message', async (msg) => {
            console.log('MESSAGE', msg);
            const chat = await msg.getChat();
            const contact = await msg.getContact();

            await chat.sendMessage(`Esta es una notificacion @${contact.id.user}`, {
                mentions: [contact]
            });
        });
    });

    client.initialize();
}




io.on('connection', (socket) => {
    console.log('User connected', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('connected', (data) => {
        socket.emit('hello', 'Hello from the server');
    });

    socket.on('createSession', (data) => {
        console.log(data);
        const { id } = data;
        createWhatsappSession(id, socket)
    });

    socket.on('getAllChats', async (data) => {
        const { id } = data;
        const client = allSessions[id];
        const allChats = await client.getChats();
        socket.emit('allChats', { allChats })
    })



})

