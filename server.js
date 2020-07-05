//PACKAGES DECLARATION
const _REQUEST = require('request-promise');
const _CHEERIO = require('cheerio');
const _PATH = require('path');
//SAFE LOAD
var http = require('http');
var https = require('https');
http.globalAgent.maxSockets = 1;
https.globalAgent.maxSockets = 1;
//IMPORTED MODULES
// const __PDF = require('./model/savePdf');
const __CLASSES = require('./model/classes');
const __DB = require('./model/unlimited_db_works');
// GLOBAL VARIABLES
var reqOptions = {
    method: 'GET',
    url: '',
    json: true,
    headers: {
        'Connection': 'keep-alive'
    }
}
// CALL THIS FUNCTION FIRST (1 TIME ONLY TO GET MAL GENRES)
async function getGenres() {
    reqOptions.url = 'https://myanimelist.net/anime.php';
    try {
        let reqBody = await _REQUEST(reqOptions);
        const $ = _CHEERIO.load(reqBody);
        // 
        $('.genre-link').first().children('div').each(function () {
            $(this).children('div').each(async function (i, e) {
                const genreName = $(this).first().text().split(' ').shift();
                const genreId = $(this).first().children().attr('href').split('/')[3]
                // 
                let insertRes = await __DB.insertData(new __CLASSES.mal_genre(genreId, genreName));
                if (insertRes != 1)
                    throw `Not inserted on index : ${genreId} | name : ${genreName}`;
            });
        });
    } catch (err) {
        console.log(err);
        // return 100;
    }

}
// 
async function scrapAnimes() {
    const startPoint = 'https://myanimelist.net/anime/season/archive';
}