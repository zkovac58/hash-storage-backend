const logger = require("./util/log.js");
const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const { connectDB } = require("./config/db.js");
const stateRoutes = require("./routes/State.routes.js");

const app = express();
const PORT = process.env.PORT || 5000; 

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => { 
    logger.info("********** REQUEST ************");        
    logger.info(`${req.method} ${req.url}`); 
    logger.info(req.headers);
    logger.info("******************************");    

    const originalSend = res.send;
    res.send = function (body) {
        res.send = originalSend;
        res.body = body;
        logger.info("********** RESPONSE ************");
        logger.info(res.getHeaders());
        logger.info(res.body);
        logger.info("********************************");
        return res.send(body);
    };

    next();      
});

app.use("/api/state", stateRoutes);

app.get('/', (req, res) => {
    res.send("Hash storage test");
});

app.listen(PORT, () => {
    connectDB();    
    console.log("Server started at http://localhost:" + PORT);
});