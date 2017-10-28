// the main server codebase -- invoked by 'npm start'
var fs = require('fs');
var path = require('path');
var express = require('express');
var mysql = require('mysql');
var db_info = require('./db-setup.js');
var app = express();

const port = 8080;

// use ejs for dynamic html
app.set("view engine", "ejs");

// middleware to log requests for page statistics (except drum sounds)
app.use(function(req, res, next){
    if (req.url.startsWith("/music/drums_")) return next();
    var conn = mysql_conn();
    var url = req.url;
    var ip = req.ip;
    var query = "INSERT INTO Request (Url, ClientIp, RequestTime) " +
        `VALUES('${url}','${ip}',NOW());`
    // will run async, so page can still load quickly
    conn.query(query, function (err, rows, fields) {
        if (err) console.error(err);
    });
    next();
});
// root path: route to views/pages/index
app.get("/", function(req, res) {
    res.render("pages/index");
});

//handler for game page
app.get("/game", function(req, res){
    getSongs(function (songs) {
        res.render("pages/game", {
            songs: songs,
        });
    });
});
//set a handler for all music files:
getSongs(function (songs) {
        songs.forEach(function (song){
            app.get("/music/" + song, function(req, res) {
                res.sendFile(path.resolve("music/" + song));
            });
        });
});

// set a handler for stats pages (music files)
getSongs(function (songs) {
    songs.forEach(function (song){
        app.get("/stats/" + song, function(req, res) {
            // get data from mysql
            var conn = mysql_conn();
            var query = `SELECT count(id) as plays from Request where Url='/music/${song}'`;
            conn.query(query, function(err, rows) {
                var plays = rows[0].plays;
                res.render("pages/music_stats", {
                    plays: plays,
                    song: song
                });
            });
        });
    });
});

// set a handler for homepage stats
app.get("/stats", function(req, res){
    //get data from mysql
    var conn = mysql_conn();
    var query = "SELECT count(id) as views from Request where url = '/'";
    conn.query(query, function (err, rows){
        if (err) console.error(err);
        var views = rows[0].views;
        //pass data to static page
        res.render("pages/stats", {
            views: views
        });
    });
});

//start the app
app.listen(port);

//returns an array of filenames found in the ./music directory
//output is sent as single argument of callback function
function getSongs(callback) {
    var songs = [];
    fs.readdir("./music", function(err, files) {
        if (err) console.error(err);
        files.forEach(function (file) {
            songs.push(file);
        });       
        callback(songs);
    });
}
// connects to the application's schema and returns the connection variable
function mysql_conn() {
    var conn = mysql.createConnection({
        host: db_info.db_host,
        user: db_info.db_user,
        password: db_info.db_pass,
        database: db_info.db_schema
    });
    conn.connect();
    return conn;
}
