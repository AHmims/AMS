//PACKAGES DECLARATION
const _REQUEST = require('request-promise');
const _CHEERIO = require('cheerio');
const _PATH = require('path');
//SAFE LOAD
// var http = require('http');
// var https = require('https');
// http.globalAgent.maxSockets = 1;
// https.globalAgent.maxSockets = 1;
//IMPORTED MODULES
// const __PDF = require('./model/savePdf');
const __CLASSES = require('./model/classes');
const __DB = require('./model/unlimited_db_works');
const {
    resolve
} = require('path');
const {
    rejects
} = require('assert');
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
    const seasonStart = 'su2020';
    let resumeLoop = false;
    const startPoint = 'https://myanimelist.net/anime/season/archive';
    reqOptions.url = startPoint;
    // 
    console.log("Acquiring list of seasons...");
    const seasonsReqBody = await _REQUEST(reqOptions);
    console.log("List acquired.\n------");
    const $_seasons = _CHEERIO.load(seasonsReqBody);
    // 
    try {
        let season_data_rows = $_seasons('.anime-seasonal-byseason.mt8.mb16 > tbody').first().children('tr');
        for (let row_index = 0; row_index < season_data_rows.length; row_index++) {
            let season_data_cols = $_seasons(season_data_rows[row_index]).children('td').has('a');
            for (let col_index = 0; col_index < season_data_cols.length; col_index++) {
                const seasonText = $_seasons(season_data_cols[col_index]).first().text().trim().toLowerCase();
                const seasonLink = $_seasons(season_data_cols[col_index]).first().children('a').attr('href');
                // 
                let seasonData = seasonText.split(" ");
                const seasonId = `${seasonData[0].substring(0,2)}${seasonData[1]}`;
                // 
                // console.log(seasonId, seasonStart);
                if ((seasonId == seasonStart) || resumeLoop) {
                    let seasonInsertRes = 1;
                    resumeLoop = true;
                    // 
                    // let seasonExists = await __DB.checkExistance({
                    //     table: 'mal_season',
                    //     key: 'season_id',
                    //     value: seasonId
                    // });
                    // if (!seasonExists)
                    //     seasonInsertRes = await __DB.insertData(new __CLASSES.mal_season(seasonId, seasonData[0], seasonData[1]));
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
                            // 
                            const anime_type = $_stemp(anime_type_block_childs).first().text().split(" ").shift();
                            // LOOP THROUGH ANIMES
                            for (let anime_index = 1; anime_index < anime_type_block_childs.length; anime_index++) {
                                let animeData = {
                                    id: "",
                                    name_main: "_",
                                    name_other: "_",
                                    type: anime_type,
                                    link: '',
                                    season: seasonId
                                };
                                const anime_block = $_stemp(anime_type_block_childs).get(anime_index);
                                // GET GENRES OF CURRENT ANIME
                                const anime_genres_array = $_stemp(anime_block).attr('data-genre').split(',');
                                // 
                                animeData.name_main = $_stemp(anime_block).children('div').first().children('div').first().children('p').first().text().trim();
                                // 
                                const anime_img_block = $_stemp(anime_block).children('div').get(1);
                                animeData.link = $_stemp(anime_img_block).children('a').get(0).attribs.href;
                                animeData.id = animeData.link.split('/')[4];
                                // console.log(animeData);
                                // INSERT ANIME
                                let animeExists = await __DB.checkExistance({
                                    table: 'mal_anime',
                                    key: 'anime_id',
                                    value: animeData.id
                                });
                                if (!animeExists) {
                                    let animeInsertRes = await __DB.insertData(new __CLASSES.mal_anime(...Object.values(animeData)));
                                    if (animeInsertRes > 0) {
                                        // DOWNLOAD IMAGE
                                        const anime_img_element = $_stemp(anime_img_block).children('a').first().children('img').first();
                                        const anime_img_link = ($_stemp(anime_img_element).attr('src') || $_stemp(anime_img_element).attr('data-src'));
                                        let imgDownloadResult = await img_download(anime_img_link, animeData.id);
                                        // 
                                        // LINK ANIME TO IT'S GENRES
                                        if (anime_genres_array.length > 0) {
                                            anime_genres_array.forEach(async genre => {
                                                let genreInsertRes = await __DB.insertData(new __CLASSES.mal_anime_genre(animeData.id, genre));
                                            });
                                        }
                                        // 
                                        reqOptions.url = encodeURI(animeData.link);
                                        console.log(`Get data for : ${animeData.id} | ${animeData.name_main}`);
                                        const animeReqBody = await _REQUEST(reqOptions);
                                        console.log(`Getting data done!`);
                                        const $_anime = _CHEERIO.load(animeReqBody);
                                        // 
                                        const anime_ost_blocks = $_anime('.theme-songs.js-theme-songs');
                                        for (let ost_block_index = 0; ost_block_index < anime_ost_blocks.length; ost_block_index++) {
                                            // console.log($_anime(this).hasClass('opnening'));
                                            let ost_batch_type = $_anime(anime_ost_blocks[ost_block_index]).hasClass('opnening') ? 'op' : 'end';
                                            // 
                                            const ost_list = $_anime(anime_ost_blocks[ost_block_index]).find('span');
                                            for (let ost_index = 0; ost_index < ost_list.length; ost_index++) {
                                                let ost_data = {
                                                    name_eng: '_',
                                                    name_jp: '_',
                                                    performer: '_'
                                                }
                                                // 
                                                let ost_fullData = $_anime(ost_list[ost_index]).text();
                                                let ost_fullName = ost_fullData.split('"')[1].split('(');
                                                ost_data.name_eng = ost_fullName[0];
                                                ost_data.name_jp = ost_fullName.length > 1 ? ost_fullName[1].substring(0, ost_fullName[1].length - 1) : '_';
                                                let ost_perfromerData = ost_fullData.split('"')[2].split("by");
                                                ost_data.performer = ost_perfromerData[ost_perfromerData.length - 1].trimLeft();
                                                // 
                                                let {
                                                    affectedRows: songInsertRes,
                                                    insertId: songId
                                                } = await __DB.insertSong(...Object.values(ost_data));
                                                // 
                                                // if (songInsertRes)
                                                if (songInsertRes > 0) {
                                                    let songLinkInsertRes = await __DB.insertData(new __CLASSES.mal_anime_song(ost_batch_type, animeData.id, songId));
                                                    if (songLinkInsertRes > 0)
                                                        console.log('Done!!\n***');
                                                    else throw 103;
                                                } else throw 102;
                                            }
                                        }
                                    } else throw 101;
                                }
                            }
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
        // 101 : ANIME NOT SAVED
        // 102 : SONG NOT SAVED
        // 103 : LINK SONG TO ANIME NOT SAVED
        console.log(err);
    }
}
async function img_download(url, animeId) {
    return new Promise((resolve, reject) => {
        const fs = require('fs');
        const path = require('path');
        // 
        try {
            let imgExists = false;
            let originalName = url.split('/')[6].split('.');
            originalName[0] = animeId;
            const fileName = originalName.join('.');
            // 
            fs.readdir('./img', (err, files) => {
                files.forEach(file => {
                    if (file == fileName)
                        imgExists = true;
                });
            });
            if (!imgExists) {
                _REQUEST.head(url, () => {
                    _REQUEST(url).pipe(fs.createWriteStream(path.join(__dirname, 'img', fileName))).on('close', () => {
                        resolve(true);
                    });
                });
            } else resolve(true);
        } catch (err) {
            resolve(false);
        }
    });
}
// scrapAnimes();
getGenres();