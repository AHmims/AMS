CREATE DATABASE IF NOT EXISTS ams_db;
use ams_db;
drop database ams_db;
/*   */
SELECT * FROM mal_genre;
drop table mal_anime;
/*   */
CREATE TABLE IF NOT EXISTS mal_anime(
	anime_id INT(11) PRIMARY KEY,
	anime_name_main CHAR(250), 
    anime_name_other TEXT,
    anime_type CHAR(10) DEFAULT 'TV',
    anime_link CHAR(250),
    season_id INT(11),
    KEY FK_SEASON (season_id)
);
/*   */
CREATE TABLE IF NOT EXISTS mal_genre(
	genre_id INT(11) PRIMARY KEY,
    genre_name CHAR(30)
);
/*   */
CREATE TABLE IF NOT EXISTS mal_song(
	song_id INT(11) PRIMARY KEY auto_increment,
    song_name_eng CHAR(250),
    song_name_jp CHAR(250),
    song_performer CHAR(250)
);
/*   */
CREATE TABLE IF NOT EXISTS mal_season(
	season_id CHAR(10) PRIMARY KEY,
    season_season CHAR(10),
    season_year INT(11)
);
/*   */
CREATE TABLE IF NOT EXISTS mal_anime_genre(
	anime_id INT(11),
    genre_id INT(11),
	KEY FK_gLINK_ANIME (anime_id),
    KEY FK_gLINK_GENRE (genre_id)
);
/*   */
drop table mal_anime_song;
CREATE TABLE IF NOT EXISTS mal_anime_song(
	ost_type CHAR(3),
	anime_id INT(11),
    song_id INT(11),
	KEY FK_sLINK_ANIME (anime_id),
    KEY FK_sLINK_SONG (song_id)
);