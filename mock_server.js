/**
 * Mock Server for the dev
 */
const fs = require('fs');
const express = require('express');
const app = express();
const PORT = 1235;
const cors = require('cors')
const bodyParser = require('body-parser')
app.use(cors());

const jsonParser = bodyParser.json();
const logDateFormat = new Intl.DateTimeFormat('en-US', {
    timeZoneName: "short", 
    year: "numeric",
    month: "2-digit",
    day: "2-digit", 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: false,
    timeZone: 'America/New_York'
});


// Test endpoint 
app.get('/', function (req, res) {
    res.json({ "status": 200, "data": "The mock_data API works. Use /rpa_projects or /rpa_projects/:rpaId to retrieve data." });
});

app.get('/inputData/', async function (req,res,next) {
    const data = await fs.readFileSync('inputData.txt','utf8')
    if (data.toString() === "") {
        return res.status(400).send('[]');
    }
    // console.log(JSON.parse(data))
    return res.json(JSON.parse(data))
})

app.get('/logs/', async function (req,res,next) {
    const data = await fs.readFileSync('logs.txt','utf8')
    if (data.toString() === "") {
        return res.status(400).send('[]');
    }
    // console.log(JSON.parse(data))
    return res.json(JSON.parse(data))
})

app.get('/adminList/', async function (req,res,next) {
    const data = await fs.readFileSync('adminList.txt','utf8')
    if (data.toString() === "") {
        return res.status(400).send('[]');
    }
    // console.log(JSON.parse(data))
    return res.status(200).send(data)
})

app.get('/dbConfig/', async function (req,res,next) {
    const data = await fs.readFileSync('dbConfig.txt','utf8')
    if (data.toString() === "") {
        return res.status(400).send('[]');
    }
    // console.log(JSON.parse(data))
    return res.status(200).send(data)
})

app.get('/lmtData/', async function (req,res,next) {
    const data = await fs.readFileSync('lmtData.txt','utf8')
    if (data.toString() === "") {
        return res.status(400).send('[]');
    }
    // console.log(JSON.parse(data))
    return res.status(200).send(data)
})

app.get('/lmtOfficeData/', async function (req,res,next) {
    const data = await fs.readFileSync('lmtOfficeData.txt','utf8')
    if (data.toString() === "") {
        return res.status(400).send('[]');
    }
    // console.log(JSON.parse(data))
    return res.status(200).send(data)
})

app.get('/lmtTenantData/', async function (req,res,next) {
    const data = await fs.readFileSync('lmtTenantData.txt','utf8')
    if (data.toString() === "") {
        return res.status(400).send('[]');
    }
    // console.log(JSON.parse(data))
    return res.status(200).send(data)
})

app.post('/submitForm',jsonParser, async function (req,res,next) {
    try { 
        const data = req.body;
        if (!data) {
            return res.status(400).send([]);
        }
        console.log(data)
        // Place updated data into the file (database)
        fs.appendFile('output.txt', JSON.stringify(data), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error adding data');
            }
            res.status(200).send(data);
        });
    }
    catch(e){
        console.log(`Error while attempting to post ${err.message}`);
        res.send(`Error while attempting to post ${err.message}`);
    }
})



// Setting the server to listen at port 3000 
app.listen(PORT, function (req, res) {
    console.log("Mock rpa data server is running on port " + PORT);
}); 