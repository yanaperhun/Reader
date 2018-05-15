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

exports.getNext = function (user) {
    return 'Next value from DB';
};

exports.setBookToUser = function (user, book) {
    return "success";
};

exports.getBooksList = function() {
    return  ['1', '2', '3'];
};

exports.getAuthorsList = function() {
    return  ['a1', 'a2', 'a3'];
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