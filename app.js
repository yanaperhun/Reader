const books = require('./books');
const sqlManager = require('./sqlManager');
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const token = '574778308:AAHPlkfVje9Ai_TwxkMVBGv3iXPhNBLTLeQ';
const bot = new TelegramBot(token, {polling: true});
const app = express();

process.env.NTBA_FIX_319 = 1;

// Create a bot that uses 'polling' to fetch new updates

const port = 3000;

var mysql = require('mysql');

var con = mysql.createConnection({
    host: "82.146.56.234",
    user: "root",
    password: "IDFD9thFRY",
    database: "reader"
});

con.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }


});

app.get('/', (request, response) => {
    response.send('Hello from Express!')
});


app.get('/books', (request, response) => {
    response.send(books.getBooksNames());
    // let array = "[Book 1, Book 2, Book 3]";
    // console.log(a.b);
});

app.get('/upload_book', (request, response) => {
    sqlManager.readStringFromFile("name.txt", function (error, data) {
        console.log("Асинхронное чтение файла");
        if (error) {
            console.log(error);
            throw  error;
        } else {
            response.send(data)
            // console.log(data.toString());
            sqlManager.insertBookToDb(con, '', '', data)
        }// выводим считанные данные
    })
});


app.use((err, request, response, next) => {
    // логирование ошибки, пока просто console.log
    console.log(err);
    response.status(500).send('Something broke!')
});


app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
});

bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"
    console.log("onText(start/ : " + 'time: ' + new Date().toISOString());
    sqlManager
        .checkIfUserExists(con, msg.from.id, msg.from.username)
        .then(() => {
            bot.sendMessage(msg.chat.id, "Далее:", startKeyboard)
        })
        .catch(reason => {
            console.log(reason);
        });
    console.log('start : ' + msg.from);

});

bot.on('callback_query', (msg) => {
    console.log("callback_query from.is_bot:" + msg.message.from.is_bot + " message_id: " + msg.message.message_id + "msg id: " + msg.id);
    if (msg.data === 'authors') {
        sqlManager.selectAuthors(con, function (err, result) {
            if (err) {
                console.log(err)
            } else {
                console.log(result);
                bot.answerCallbackQuery(msg.id)
                    .then(() => {
                        let arrayOfAuthors = JSON.parse(JSON.stringify(result));
                        console.log(arrayOfAuthors);
                        bot.sendMessage(msg.message.chat.id, 'Список авторов:\n', authorsKeyboard(arrayOfAuthors));
                    });
            }
        });
    }

    if (msg.data === 'read_next') {
        sqlManager.getNext(con, msg.from.id, function (err, result) {
            if (err) {
                console.log(err);
            }

            console.log(result);
            bot.answerCallbackQuery(msg.id)
                .then(() => {
                    if (result && result.length > 0) {
                        bot.sendMessage(msg.message.chat.id, result, fullKeyboard);
                        pinProgress(msg.message.chat.id);
                    } else {
                        bot.sendMessage(msg.message.chat.id, "Вы еще не выбрали книгу", startKeyboard);
                    }
                });
        });
    }

    if (msg.data === 'select_new_book') {
        sqlManager.getBooksList(con, function (err, result) {
            if (err) throw err;

            console.log(result);
            bot.answerCallbackQuery(msg.id)
                .then(() => {
                    let booksArray = JSON.parse(JSON.stringify(result));
                    // let mappedArray = arrayOfAuthors.map(result => result.Name);
                    console.log(booksArray);
                    bot.sendMessage(msg.message.chat.id, 'Список книг:\n', booksKeyboard(booksArray));
                });
        });
    }

    var regBook = /\/book (.+)/;
    if (regBook.test(msg.data)) {
        const id = msg.data.match(regBook)[1];
        if (id !== '' && isNumeric(id)) {
            sqlManager.setBookToUser(con, msg.from.id, id, function (err, result) {
                if (err) {
                    throw err;
                }
                bot.answerCallbackQuery(msg.id)
                    .then(() => {
                        bot.sendMessage(msg.message.chat.id, "Начало:\n" + result, fullKeyboard);
                    });
            });
        }

    }

    var regAuthor = /\/author (.+)/;
    if (regAuthor.test(msg.data)) {
        const id = msg.data.match(regAuthor)[1];
        if (id !== '' && isNumeric(id)) {
            sqlManager.getBooksByAuthor(con, id, function (err, result) {
                if (err) {
                    throw err;
                }
                bot.answerCallbackQuery(msg.id)
                    .then(() => {
                        let booksArray = JSON.parse(JSON.stringify(result));
                        bot.sendMessage(msg.message.chat.id, "Список книг автора:\n", booksKeyboard(booksArray));
                    });
            });
        }

    }
    console.log(msg.data);
});
// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    console.log("message", msg.text + ' from: ' + msg.from.username + ' ' + msg.from.id);

});

function pinProgress(chatId) {
}


let booksKeyboard = function (names) {
    let inline_keyboard = [];
    names.forEach(function (value) {
        console.log(value);
        let element = [{text: value.Name, callback_data: "/book " + value.Id}];
        inline_keyboard.push(element);
    });
    inline_keyboard.push([
        {
            text: 'Книги 📖',
            callback_data: 'select_new_book'
        },
        {
            text: 'Авторы 📚',
            callback_data: 'authors'
        }
    ]);
    return {
        reply_markup: {
            inline_keyboard
        }
    }
};

let authorsKeyboard = function (names) {
    let inline_keyboard = [];
    names.forEach(function (value) {
        console.log(value);
        let element = [{text: value.Description, callback_data: "/author " + value.Id}];
        inline_keyboard.push(element);
    });
    inline_keyboard.push([
        {
            text: 'Книги 📚',
            callback_data: 'select_new_book'
        },
        {
            text: 'Далее 📖💭',
            callback_data: 'read_next'
        }
    ]);
    return {
        reply_markup: {
            inline_keyboard
        }
    }
};

let fullKeyboard = {
    reply_markup: {
        inline_keyboard: [[
            {
                text: 'Далее 📖💭',
                callback_data: 'read_next'
            },
            {
                text: 'Книги 📚',
                callback_data: 'select_new_book'
            },
            {
                text: 'Авторы 📚',
                callback_data: 'authors'
            }
        ]]
    }
};

let startKeyboard = {
    reply_markup: {
        inline_keyboard: [[
            {
                text: 'Выбрать книгу 📖',
                callback_data: 'select_new_book'
            },
            {
                text: 'Список авторов 📚',
                callback_data: 'authors'
            }
        ]]
    }
};

function isNumeric(num) {
    return !isNaN(num)
}
