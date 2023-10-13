import express from "express";
import redis from 'redis';
import axios from 'axios';


const PORT = process.env.PORT || 6001;

// docker - redis configuration
// const redisclient = redis.createClient({
//     url: 'redis://redis:6379'
// });

// local redis configuration
const redisclient = redis.createClient({
    host: 'redis',
    port: 6379
});

(async () => {
    await redisclient.connect();
})();


redisclient.on("ready", () => {
    console.log("Connected!");
});

redisclient.on("error", (err) => {
    console.log("Error in the Connection:", err);
}); 


const app = express();


app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.get('/api', async (req, res) => {
    await redisclient.get('users')
    .then( async (users) => {
        if (users !== null) {
            return res.json(JSON.parse(users))
        } else {
            const { data } = await axios.get(`https://jsonplaceholder.typicode.com/users`);
            redisclient.setEx('users', 3600, JSON.stringify(data));
            res.send(data)
        }
    }).catch((err) => {
        console.error(err);
    })
    
});


app.listen(PORT, () => {
    console.log('server is running');
});


