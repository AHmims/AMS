const db = require('./dbConfig');
// 
// ONLY ACCEPT A CLASS AS INPUT
async function insertData(data) {
    let {
        tableName,
        fieldsNames,
        fieldsPlaceHolders,
        values
    } = getClassValues(data);
    try {
        let req = `INSERT INTO ${tableName}(${fieldsNames}) VALUES (${fieldsPlaceHolders})`,
            cnx = await db.connect(),
            res = await cnx.query(req, values);
        cnx.release();
        // console.log(res)
        return res[0].affectedRows;
    } catch (err) {
        console.error('error :', err);
    }
}
// params = {table : tableName, key : column , value : id}
async function checkExistance(params) {
    try {
        let req = `SELECT COUNT(*) AS nb FROM ${params.table} WHERE ${params.key} = ?`,
            cnx = await db.connect(),
            res = await cnx.query(req, [params.value]);
        cnx.release();
        // 
        return res[0][0].nb > 0 ? true : false;
    } catch (err) {
        console.error('error :', err);
    }
}
// 
async function insertSong(name_eng, name_jp, performer) {
    try {
        let req = `INSERT INTO mal_song (song_name_eng,song_name_jp,song_performer) VALUES (?,?,?)`,
            cnx = await db.connect(),
            res = await cnx.query(req, [name_eng, name_jp, performer]);
        cnx.release();
        return res[0];
    } catch (err) {
        console.error('error :', err);
    }
}
//
//#region HELPER FUNCTIONS
function getClassValues(data) {
    let tableName, fieldsNames, fieldsPlaceHolders = '',
        values;
    // GET CLASS NAME FROM OBJECT
    tableName = data.constructor.name;
    // GET FIELD NAMES
    fieldsNames = Object.keys(data).join(',');
    // GET THE NUMBER OF '?' TO PLACE
    Object.keys(data).forEach(key => {
        fieldsPlaceHolders += '?,';
    });
    //REMOVE THE LAST CHAR ','
    fieldsPlaceHolders = removeLastChar(fieldsPlaceHolders);
    // GET THE VALUES
    values = Object.values(data);
    // 
    return {
        tableName,
        fieldsNames,
        fieldsPlaceHolders,
        values
    }
}

function getObjectKeysWithValues(data) {
    return [
        Object.keys(data),
        Object.values(data)
    ]
}

function removeLastChar(str) {
    return str.substring(0, str.length - 1);
}
//#endregion
// 
module.exports = {
    insertData,
    checkExistance,
    insertSong
}