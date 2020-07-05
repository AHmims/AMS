class mal_anime {
    constructor(anime_id, anime_name_main, anime_name_other, anime_type, anime_link, season_id) {
        this.anime_id = anime_id;
        this.anime_name_main = anime_name_main;
        this.anime_name_other = anime_name_other;
        this.anime_type = anime_type;
        this.anime_link = anime_link;
        this.season_id = season_id;
    }
}
// 
class mal_genre {
    constructor(genre_id, genre_name) {
        this.genre_id = genre_id;
        this.genre_name = genre_name;
    }
}
// 
class mal_song {
    constructor(song_id, song_name_eng, song_name_jp, song_performer) {
        this.song_id = song_id;
        this.song_name_eng = song_name_eng;
        this.song_name_jp = song_name_jp;
        this.song_performer = song_performer;
    }
}
// 
class mal_season {
    constructor(season_id, season_season, season_year) {
        this.season_id = season_id;
        this.season_season = season_season;
        this.season_year = season_year;
    }
}
// 
class mal_anime_genre {
    constructor(anime_id, genre_id) {
        this.anime_id = anime_id;
        this.genre_id = genre_id;
    }
}
// 
class mal_anime_song {
    constructor(anime_id, song_id) {
        this.anime_id = anime_id;
        this.song_id = song_id;
    }
}
// 
module.exports = {
    mal_anime,
    mal_genre,
    mal_song,
    mal_season,
    mal_anime_genre,
    mal_anime_song
}