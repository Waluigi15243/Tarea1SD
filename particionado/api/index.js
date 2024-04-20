const express = require('express');
const session = require('express-session');
const redis = require('redis');
const connectRedis = require('connect-redis');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const RedisStore = connectRedis(session);

// Configuración de las instancias de Redis
const redisInstances = [
    { host: 'caching1', port: 6379 },
    { host: 'caching2', port: 6379 }
];

// Función para determinar la instancia Redis basada en la clave
function getRedisInstance(key) {
    const index = Math.abs(hashCode(key)) % redisInstances.length;
    return redisInstances[index];
}

// Función de hash simple
function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convierte a 32 bits entero
    }
    return hash;
}

// Configura el cliente Redis para que utilice el primer nodo por defecto
const defaultRedisInstance = redisInstances[0];
const redisClient = redis.createClient(defaultRedisInstance.port, defaultRedisInstance.host);

redisClient.on("error", function(error) {
    console.error(error);
});

app.use(session({
    store: new RedisStore({
        client: redisClient,
        // Utiliza la función de hash para determinar la instancia de Redis
        host: (options) => getRedisInstance(options.req.sessionID).host,
        port: (options) => getRedisInstance(options.req.sessionID).port
    }),
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000
    }
}));

app.get("/", (req, res) => {
    const sess = req.session;
    console.log(sess);
    if (sess.username && sess.password) {
        res.write(`<h1>Welcome ${sess.username} </h1><br>`)
        res.write(`<h3>This is the Home page</h3>`);
        res.end('<a href=' + '/logout' + '>Click here to log out</a >')
    } else {
        res.sendFile(__dirname + "/login.html")
    }
});

app.post("/login", (req, res) => {
    const sess = req.session;
    const { username, password } = req.body
    sess.username = username
    sess.password = password
    res.end("success")
});

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return console.log(err);
        }
        res.redirect("/")
    });
});

app.listen(3000, () => {
    console.log("Server started at port 3000");
});
