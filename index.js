const express = require('express');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const { LocalAuth, Client } = require('whatsapp-web.js');

// memanggil express dan port
const app = express()
const port = process.env.PORT || 3000;

// memanggil library qrcode untuk scan whatsapp
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'faizz-bot-wa' })
});

// penggunaan AI Ollama
const getOllamaChat = async messageFromUser => {
    try {
        const response = await axios.post('url_ip_public_server', { // ganti ke http://localhost:11434/api/chat, jika ingin menjalankan secara local,
            model: 'deepseek-r1:1.5b',
            messages: [
                {
                    role: "user",
                    content: messageFromUser
                },
            ],
            stream: false
        })

        const content = response.data.message.content;
        console.log(content);

        return content;
    } catch (error) {
        console.error("sedang error", error);
        return('Lagi error ya guys');
    }
}

//memberikan bahwa sudah melakukan scan
client.on('qr', qr => qrcode.generate(qr, { small: true }))
client.on('authenticated', () => console.log("Sudah di scan.."))
client.on('ready', () => console.log('service sudah siap...'))

//pesan whatsapp AI
client.on('message', async message => {
    const messageBody = (message.body.trim().toLowerCase()); //merubah huruf menjadi kecil semua
    if (messageBody.startsWith("ai:")) {  // keyword penggunaa
        const userQuestion = message.body.substring(3) // menghilangkan 3 kata depan
        const answer = await getOllamaChat(userQuestion); // mengambil jawaban dari Ollama
        message.reply(answer); // membalas pesan mu
    }
})

app.listen(port, () => console.log("Server bot running port by " + port));

client.initialize(); // menampilkan QR-Code