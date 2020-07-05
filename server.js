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
// SCRAP ANIMES BY SEASON
async function scrapAnimes() {
    const seasonStart = {
        season: 'summer',
        year: 2020
    }
    let resumeLoop = false;
    const startPoint = 'https://myanimelist.net/anime/season/archive';
    reqOptions.url = startPoint;
    // 
    console.log("Acquiring list of seasons...");
    const seasonsReqBody = await _REQUEST(reqOptions);
    console.log("List acquired.");
    const $_seasons = _CHEERIO.load(seasonsReqBody);
    // 
    try {
        let season_data_rows = $_seasons('.anime-seasonal-byseason.mt8.mb16 > tbody').first().children('tr');
        for (let row_index = 0; row_index < season_data_rows.length; row_index++) {
            let season_data_cols = $_seasons(season_data_rows[row_index]).children('td').has('a');
            for (let col_index = 0; col_index < season_data_cols.length; col_index++) {
                const seasonText = $_seasons(season_data_cols[col_index]).first().text().trim().toLowerCase();
                const seasonLink = $_seasons(season_data_cols[col_index]).first().children('a').attr('href');
                let seasonData = seasonText.split(" ");
                // 
                if ((seasonStart.season == seasonData[0] && seasonStart.year == seasonData[1]) || resumeLoop) {
                    let seasonInsertRes = 1;
                    resumeLoop = true;
                    // 
                    // let seasonExists = await __DB.checkSeason(seasonData[0], seasonData[1]);
                    // if (!seasonExists)
                    // seasonInsertRes = await __DB.insertData(new __CLASSES.mal_season(seasonData[0], seasonData[1]));
                    if (seasonInsertRes > 0) {
                        // FETCH SEASONAL ANIMES
                        reqOptions.url = seasonLink;
                        console.log(`Getting list of animes for "${seasonText}"...`);
                        const seasonalReqBody = await _REQUEST(reqOptions);
                        console.log('Acquiring done.');
                        const $_stemp = _CHEERIO.load(seasonalReqBody);
                        // 
                        const anime_type_blocks = $_stemp('.seasonal-anime-list');
                        for (let block_index = 0; block_index < anime_type_blocks.length; block_index++) {
                            const anime_type_block_childs = $_stemp(anime_type_blocks[block_index]).children('div');
                            const anime_type = $_stemp(anime_type_block_childs).first().text().split(" ").shift();
                            // 

                        }
                    } else throw {
                        id: 100,
                        data: seasonText
                    };
                }

            }
        }
    } catch (err) {
        // ERROR CODES
        // 100 : SEASON NOT SAVED
        console.log(err);
    }
}
// 
scrapAnimes();