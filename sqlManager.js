//created by lvm

fs = require('fs');

exports.insertBookToDb = function (con, author, book, text) {
    var sqlAuthor = "INSERT INTO t_Authors (Description) VALUES ('" + author + "')";
    con.query(sqlAuthor, function (err, result) {
        if (err) throw err;

        var sqlBook = "INSERT INTO t_Books (Name, AuthorId) VALUES ('" + book + "', '" + result.insertId + "')";

        con.query(sqlBook, function (err, result) {
            if (err) throw err;
            findOffsets(con, text, result.insertId)
        });

        findOffsets(con, text, result.insertId)
    });
};

exports.selectAuthors = function (con, callback) {
    con.query("SELECT * FROM t_Authors", callback);
}

findOffsets = function (con, text, bookId) {
    var wordCounter = 0;
    var isSpaceDetected = true;
    var startIndex = 0;

    for (var i = 0; i < text.length; i++) {
        // console.log(text.charAt(i) + ' ' + /\s/.test(text.charAt(i)))
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
        // if (isSpaceDetected) {
        //     if (isLetter(text.charAt(i)) || isDigit(text.charAt(i))) {
        //         wordCounter++;
        //         isSpaceDetected = false;
        //     }
        // } else {
        //     isSpaceDetected = /\s/.test(text.charAt(i));
        //     console.log((/\s/.test(text.charAt(i))) + ' wordCounter :' + wordCounter + ' i: ' + i);
        // }
        //
        // if (isSpaceDetected) {
        //     if (wordCounter === 2) {
        //         wordCounter = 0;
        //         console.log("1 text.substring: " + 'start index : ' + startIndex
        //             + ' i : ' + i + ' ' + text.substring(startIndex, i))
        //         insertOffset(con, text.substring(startIndex, i), bookId);
        //         startIndex = i + 1;
        //     }
        // }
        // if (i === text.length - 1) {
        //     console.log("2 text.substring: " + 'start index : ' + startIndex
        //         + ' i : ' + i + ' ' + text.substring(startIndex, i))
        //     insertOffset(con, text.substring(startIndex, text.length), bookId);
        // }
    }
};

exports.getBooksList = function (con, callback) {
    var sql = "SELECT * FROM t_Books";
    con.query(sql, callback);
};

exports.getBooksByAuthor = function (con, authorId) {
    var sqlSelect = "SELECT aut.Description, bks.Name FROM t_Authors aut, t_Books bks WHERE bks.AuthorId  = aut.Id AND aut.Id = " + authorId;
    return con.query(sqlSelect, function (err, result) {
        if (err) throw err;
        console.log(result);
        return result;
    });
};

exports.getNext = function (con, userId) {
    var sqlSelect = "SELECT off.Content, off.Id FROM t_Users usr, t_Offsets off WHERE usr.OffsetId + 1 = off.Id AND usr.Id =" + userId;

    con.query(sqlSelect, function (err, result) {

        if (err) throw err;
        console.log(result);

        var sqlUpdate = "UPDATE t_Users usr SET usr.OffsetId = " + result.Id + " WHERE usr.Id = " + userId;
        con.query(sqlUpdate, function (err, result) {
            if (err) throw err;
            console.log(result);
        });

        return result.Content;
    });
};


exports.setBookToUser = function (con, userId, bookId) {
    var sqlUpdate = "UPDATE t_Users usr SET usr.OffsetId = (SELECT off.Id FROM t_Offsets off WHERE off.BookId = "
        + bookId + " LIMIT 1), usr.BookId = "
        + bookId + " WHERE usr.Id =" + userId;
    con.query(sqlUpdate, function (err, result) {
        if (err) throw err;
        console.log(result);
    });
};

exports.checkIfUserExists = function (con, userId) {
    return new Promise(function (resolve, reject) {
        var sql = "SELECT * FROM t_Users usr WHERE usr.Id = " + userId;
        con.query(sql, function (err, result) {
            if (err) {
                reject(err);
                throw err;
            }
            console.log(result);

            if (result.length < 1) {

                var sql = "INSERT INTO t_Users (Id, BookId, OffsetId) VALUES(" + userId + ",0,0)";
                con.query(sql, function (err, result) {
                    if (err) {
                        reject(err);
                        throw err;
                    }
                    console.log(result);
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

    console.log("1 record inserted : " + content);
};

function isLetter(char) {
    return char.length === 1 && char.match(/[a-zA-Z]/i);
}

function isDigit(char) {
    return char.length === 1 && char.match(/[0-9]/i);
}

exports.readStringFromFile = function (callback) {
    fs.readFile("1984.txt", "utf8",
        callback);
};