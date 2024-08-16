const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const mongoose = require('mongoose'); //to connect to mongodb
const User = require('./models/user');
var bodyParser = require('body-parser');
const { EncryptString, DecryptString } = require('./Helpers/EncryptDecrypt.js');
const { generateToken, validateToken, generateATFromRT } = require("./Helpers/HandleToken")
const crypto = require("crypto");

const app = express();
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const server = createServer(app);
const io = new Server(server);


//connect to mongodb and listen to requests
const username = encodeURIComponent('admin');
const password = encodeURIComponent('1234');
mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.u7m0k.mongodb.net/chatsnip?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Database connected !!"));

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

app.post("/login", jsonParser, async (req, res) => {
    const encrPass = EncryptString(req.body.password);
    if (!encrPass.error && encrPass.value) {
        const userF = await User.find({ email: req.body.email, password: encrPass.value });
        if (userF.length) {
            const accTok = generateToken({ email: userF[0].email, info: EncryptString(JSON.stringify({ claim: "AT", id: crypto.randomUUID() })).value });
            const refTok = generateToken({ email: userF[0].email, info: EncryptString(JSON.stringify({ claim: "RT", id: crypto.randomUUID() })).value }, "7d");
            return res.status(200).json({ error: false, user: { email: userF[0]?.email }, accessToken: accTok, refreshToken: refTok });
        } else return res.status(401).json({ error: true });
    } else return res.status(401).json({ error: true });
})

app.post("/register", jsonParser, async (req, res) => {
    const encryptedPass = EncryptString(req.body?.password);
    if (!encryptedPass.error && encryptedPass.value) {
        const userExisting = await User.find({ email: req.body.email });
        if (!userExisting.length) {
            const userF = await User.create({ name: req.body?.name, email: req.body?.email, password: encryptedPass.value, phone: req.body?.phone });
            return res.status(200).json({ error: false, user: userF });
        } else return res.status(403).json({ error: true, msg: "User Already Exists" });
    } else return res.status(503).json({ error: true });
})

app.get('/emm', validateToken, (req, res) => {
    // console.log("got id", req.query.id);
    // io.emit("sacred", "Hello World !");
    // io.to(req.query.id).emit('This is for you :');
    return res.json({ json: "Nishant" });
});

app.post('/getAccessToken', jsonParser, (req, res) => {
    const at = generateATFromRT(req.body?.refreshToken);
    if (at?.success) {
        return res.status(200).json({ error: false, accessToken: at.data });
    } else
        return res.status(401).json({ error: true, msg: at?.message });
});

io.on('connection', (socket) => {
    console.log('a user connected', socket);
});

// io.on('sacred', (socket) => {

//     function index() {
//         return (
//             <div>index</div>
//         )
//     }

//     io.to('pfD_nvulTqEx0ptWAAAA').emit('This is for you : O65iFwqZtfbIgQa8AAAA', socket.msg);
// });

server.listen(3001, () => {
    console.log('server running at http://localhost:3001');
});