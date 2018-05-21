fs = require('fs');

exports.insertBookToDb = function (con, author, book, text) {
    console.log('insertBookToDb');
    var sqlAuthor = "INSERT INTO t_Authors (Description) VALUES ('" + author + "')";
    con.query(sqlAuthor, function (err, result) {
        if (err) throw err;

        var sqlBook = "INSERT INTO t_Books (Name, AuthorId) VALUES ('" + book + "', '" + result.insertId + "')";

        con.query(sqlBook, function (err, result) {
            if (err) throw err;
            findOffsets(con, text, result.insertId)
        });

    });
};

exports.selectAuthors = function (con, callback) {
    con.query("SELECT * FROM t_Authors", callback);
};

findOffsets = function (con, text, bookId) {
    console.log("find offsets");
    var wordCounter = 0;
    var startIndex = 0;

    for (var i = 0; i < text.length; i++) {

        if (/\s/.test(text.charAt(i))) {
            wordCounter++;
        }

        if (wordCounter === 200) {
            insertOffset(con, text.substring(startIndex, i), bookId);
            startIndex = i + 1;
            wordCounter = 0;
        }

        if (i === text.length - 1) {
            insertOffset(con, text.substring(startIndex, i), bookId);
        }
    }
};

exports.getBooksList = function (con, callback) {
    var sql = "SELECT * FROM t_Books";
    con.query(sql, callback);
};

exports.getBooksByAuthor = function (con, authorId, callback) {
    var sqlSelect = "SELECT aut.Description, bks.Name,  bks.Id FROM t_Authors aut, t_Books bks WHERE bks.AuthorId  = aut.Id AND aut.Id = " + authorId;
    return con.query(sqlSelect, callback);
};

exports.getNext = function (con, userId, callback) {
    var sqlSelect = "SELECT off.Content, off.Id FROM t_Users usr, t_Offsets off WHERE usr.OffsetId + 1 = off.Id AND usr.Id =" + userId;

    con.query(sqlSelect, function (err, result) {

        if (err) {
            console.log(err);
            callback("Next content is empty", null);
        } else {

            if (result.length > 0) {
                var content = result[0].Content;
                var sqlUpdate = "UPDATE t_Users usr SET usr.OffsetId = " + result[0].Id + " WHERE usr.Id = " + userId;
                con.query(sqlUpdate, function (err, result) {
                    if (err) throw err;
                    console.log(result);
                    callback(err, content);
                });
            } else {
                callback("Next content is empty", null);
            }
        }

    });
};


exports.setBookToUser = function (con, userId, bookId, callback) {
    var sqlUpdateUser = "UPDATE t_Users usr SET usr.OffsetId = (SELECT off.Id FROM t_Offsets off WHERE off.BookId = "
        + bookId + " ORDER BY off.Id ASC LIMIT 1), usr.BookId = "
        + bookId + " WHERE usr.Id =" + userId;
    con.query(sqlUpdateUser, function (err, result) {
        if (err) throw err;
        var sqlSelectFirstElement = "SELECT off.Content, off.Id FROM t_Users usr, t_Offsets off WHERE usr.OffsetId = off.Id AND usr.Id =" + userId;

        con.query(sqlSelectFirstElement, function (err, result) {
            if (err || result.length < 1) {
                callback(err, "Can't get first element for book")
            } else {
                callback(null, result[0].Content);
            }

        })
    });
};

exports.checkIfUserExists = function (con, userId, username) {
    return new Promise(function (resolve, reject) {
        var sql = "SELECT * FROM t_Users usr WHERE usr.Id = " + userId;
        con.query(sql, function (err, result) {
            if (err) {
                reject("Can't select from t_Users");

            }
            console.log("SELECT * FROM t_Users : " + result + 'time: ' + new Date().toISOString());

            if (result.length < 1) {

                var sql = "INSERT INTO t_Users (Id, BookId, OffsetId, Username) VALUES(" + userId + ",0,0, '" + username + "')";
                con.query(sql, function (err, result) {
                    if (err) {
                        reject("Can't insert to t_Users");

                    }
                    console.log(result);
                    console.log("INSERT INTO t_Users : " + result + 'time: ' + new Date().toISOString());
                    resolve();
                });
            } else {
                resolve();
            }
        });
    })
};


insertOffset = function (con, content, bookId) {
    var sql = "INSERT INTO t_Offsets (BookId, Content) VALUES ('" + bookId + "','" + content + "')";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted : " + content);
    });
    //
    // console.log('insert :' + content);

};

function isLetter(char) {
    return char.length === 1 && char.match(/[a-zA-Z]/i);
}

function isDigit(char) {
    return char.length === 1 && char.match(/[0-9]/i);
}

exports.readStringFromFile = function (fileName, callback) {
    fs.readFile(fileName, "utf8",
        callback);
};
