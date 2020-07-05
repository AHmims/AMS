CREATE DATABASE IF NOT EXISTS ams_db;
use ams_db;
/*   */
CREATE TABLE IF NOT EXISTS mal_anime(
	anime_id INT(11) PRIMARY KEY,
	anime_name_jp CHAR(250), 
    anime_name_eng CHAR(250) DEFAULT '',
    anime_type CHAR(10) DEFAULT 'TV',
    genre_id INT(11),
    season_id INT(11),
    KEY FK_GENRE (genre_id),
    KEY FK_SEASON (season_id)
);
/*   */
CREATE TABLE IF NOT EXISTS mal_genre(
	genre_id INT(11) PRIMARY KEY,
    genre_name CHAR(30)
);
/*   */
CREATE TABLE IF NOT EXISTS mal_song(
	song_id INT(11) PRIMARY KEY,
    song_name_eng CHAR(250),
    song_name_jp CHAR(250),
    song_performer CHAR(250)
);
/*   */
CREATE TABLE IF NOT EXISTS mal_season(
	season_id INT(11) PRIMARY KEY AUTO_INCREMENT,
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
CREATE TABLE IF NOT EXISTS mal_anime_song(
	anime_id INT(11),
    song_id INT(11),
	KEY FK_sLINK_ANIME (anime_id),
    KEY FK_sLINK_SONG (song_id)
);