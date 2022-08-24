require('dotenv').config()

const express = require('express');
const app = express();

app.get("/", function(req, res, next) {
    res.send("Hello");
});

app.get("/db", function(req, res, next) {
    var MongoClient = require('mongodb').MongoClient;
    var url = process.env.MONGODB_CONNECTION_STRING;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("uni");
        dbo.collection("students").find({}).toArray(function(err, result) {
            if (err) throw err;
            res.send(result);
            db.close();
          });
    });
})

// Format: podName.serviceName.namespace
// example-mongodb-0.example-mongodb-svc.mongodb

app.listen(process.env.PORT || 3000);
module.exports = app;