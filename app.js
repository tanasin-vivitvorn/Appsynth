const express = require('express');
const fs = require('fs')
const https = require('https')
const app = express();
const path = require('path');
const shid = require('shortid');
const dns = require('dns');
const { MongoClient } = require('mongodb');

const databaseUrl = 'mongodb://localhost:27017';

MongoClient.connect(databaseUrl, { useNewUrlParser: true })
    .then(client => {
        app.locals.db = client.db('shortener');
    })
    .catch(() => console.error('Failed to connect to the database'));

// Command to create shorten URL
const shortenURL = (db, url) => {
    const shortenedURLs = db.collection('shortenedURLs');
    return shortenedURLs.findOneAndUpdate({ original_url: url },
        {
            $setOnInsert: {
                original_url: url,
                short_id: shid.generate(),
            },
        },
        {
            returnOriginal: false,
            upsert: true,
        }
    );
};

// Command to get existing original URL from shorten
const checkIfShortIdExists = (db, code) => db.collection('shortenedURLs')
    .findOne({ short_id: code });

app.use(express.json());

// To handle form request
app.get('/', (req, res) => {
    const htmlPath = path.join(__dirname, 'form', 'index.html');
    res.sendFile(htmlPath);
});

// To create new shorten URL
app.post('/new', (req, res) => {
    let originalUrl;
    try {
        console.log("originalUrl:" + req.body.url);
        originalUrl = new URL(req.body.url);
    } catch (err) {
        return res.status(400).send({ error: 'invalid URL' });
    }

    dns.lookup(originalUrl.hostname, (err) => {
        if (err) {
            return res.status(404).send({ error: 'Address not found' });
        };

        const { db } = req.app.locals;
        shortenURL(db, originalUrl.href)
            .then(result => {
                const doc = result.value;
                res.json({
                    original_url: doc.original_url,
                    short_id: doc.short_id,
                });
            })
            .catch(console.error);
    });
});

// To redirect from shorten to original
app.get('/:short_id', (req, res) => {
    const shortId = req.params.short_id;
    console.log('shortId: ', shortId);

    const { db } = req.app.locals;
    checkIfShortIdExists(db, shortId)
        .then(doc => {
            if (doc === null) return res.send('Uh oh. We could not find a link at that URL');

            res.redirect(doc.original_url)
        })
        .catch(console.error);

});

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
}, app).listen(443, function () {
    console.log('Example app listening on port 443! Go to https://localhost/')
})