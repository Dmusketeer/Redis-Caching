// importing all the require package
const express= require('express');
const axios= require('axios');
const redis = require('redis');

// create a instance of express:
const app = express();

// port on which serser and redis bd is running :
const PORT =3000;
const redis_port = 6379;

const redisClient = redis.createClient(redis_port);

// middleware:
const cache =(req,res,next)=>{
    const { userName } = req.params;
    redisClient.get(userName,(err,reply)=>{
        if(err){
            console.log(err);
        }else{
            if(reply){
                return res.json({public_repos:reply})
            }
        }
        next();
    })
} 


// get request:
app.get('/repos/:userName',cache, async (req, res)=>{
    // res.send("hey Dheeraj");
    // make request to github to get information of user repos
    try{
        const {userName} = req.params;
        const reponse = await axios(`https://api.github.com/users/${userName}`);
        const {public_repos} = reponse.data;
        redisClient.set(userName, public_repos);
        
        res.json({public_repos});
        // res.json(reponse.data);
    }catch(err){
            console.log(err);
    }
});

// server running on port number 3000:
app.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
});