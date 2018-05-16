// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');
//
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
//
// var app = express();
//
// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'pug');
//
// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
//
// app.use('/', indexRouter);
// app.use('/users', usersRouter);
//
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });
//
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });
//
// module.exports = app;
//
// var dt = require('./myfirstmodul');
//
// console.log("test");
//
// var http = require('http');
//
// http.createServer(function (req, res) {
//     res.writeHead(200, {'Content-Type': 'text/plain'});
//     res.write("The date and time are currently: " + dt.myDateTime());
//     res.end('Hello World Yana!');
// }).listen(8080);

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
    // sqlManager.insertBookToDb(connection, "Оурел", "1984", )
    sqlManager.readStringFromFile(function (error, data) {
        console.log("Асинхронное чтение файла");
        if (error) {
            console.log(error);
            throw  error;
        } else {
            response.send(data)
            console.log(data.toString());
            sqlManager.insertBookToDb(con, 'Джордж Оруэлл', '1984', data)
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

//// Matches "/echo [whatever]"
// bot.onText(/\/start (.+)/,
bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    sqlManager
        .checkIfUserExists(con, msg.from.id)
        .then(() => {
            bot.sendMessage(msg.chat.id, "Далее:", startKeyboard)
        });
    console.log(msg.from);

});

bot.on('callback_query', (msg) => {
    console.log("callback_query from.is_bot:" + msg.message.from.is_bot + " message_id: " + msg.message.message_id + "msg id: " + msg.id);
    if (msg.data === 'authors') {
        sqlManager.selectAuthors(con, function (err, result) {
            if (err) throw err;

            console.log(result);
            bot.answerCallbackQuery(msg.id)
                .then(() => {
                    let arrayOfAuthors = JSON.parse(JSON.stringify(result));
                    let mappedArray = arrayOfAuthors.map(result => result.Description);
                    console.log(mappedArray);
                    bot.sendMessage(msg.message.chat.id, 'Список:', authorsKeyboard(mappedArray));
                });
        });
    }

    if (msg.data === 'read_next') {
        sqlManager.selectAuthors(con, function (err, result) {
            if (err) throw err;

            console.log(result);
            bot.answerCallbackQuery(msg.id)
                .then(() => {
                    bot.sendMessage(msg.message.chat.id, sqlManager.getNext("user"), fullKeyboard);
                });
        });
    }

    if (msg.data === 'select_new_book') {
        sqlManager.selectAuthors(con, function (err, result) {
            if (err) throw err;

            console.log(result);

            sqlManager.getBooksList(con, function (err, result) {
                if (err) throw err;

                console.log(result);
                bot.answerCallbackQuery(msg.id)
                    .then(() => {
                        let arrayOfAuthors = JSON.parse(JSON.stringify(result));
                        let mappedArray = arrayOfAuthors.map(result => result.Name);
                        console.log(mappedArray);
                        bot.sendMessage(msg.message.chat.id, 'Книги:', booksKeyboard(mappedArray));
                    });
            });
        });
    }

    var regBook = /\/book (.+)/;
    if (regBook.test(msg.data)) {
        const resp = msg.data.match(regBook);
        bot.answerCallbackQuery(msg.id)
            .then(() => {
                var a = ('первое предложение %s', resp[1]);
                bot.sendMessage(msg.message.chat.id, a.toString(), fullKeyboard);
            });
    }
    console.log(msg.data);
});
// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    //{
    //   "message_id": 5,
    //   "from": {
    //     "id": 47485282,
    //     "is_bot": false,
    //     "first_name": "Qa",
    //     "last_name": "Ti",
    //     "username": "qa_ti",
    //     "language_code": "ru-RU"
    //   },
    //   "chat": {
    //     "id": 47485282,
    //     "first_name": "Qa",
    //     "last_name": "Ti",
    //     "username": "qa_ti",
    //     "type": "private"
    //   },
    //   "date": 1525966284,
    //   "text": "1"
    // }
    console.log("message", msg.toString())
    // send a message to the chat acknowledging receipt of their message
    // bot.sendMessage(chatId, 'Received your message');
    // bot.sendMessage(msg.chat.id, msg.text, fullKeyboard)
});


let booksKeyboard = function (names) {
    let inline_keyboard = [];
    names.forEach(function (value) {
        console.log(value);
        let element = [{text: value, callback_data: "/book " + value}];
        inline_keyboard.push(element);
    });
    inline_keyboard.push([
        {
            text: 'Выбрать книгу',
            callback_data: 'select_new_book'
        },
        {
            text: 'Список авторов',
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
        let element = [{text: value, callback_data: "/book " + value}];
        inline_keyboard.push(element);
    });
    inline_keyboard.push([
        {
            text: 'Выбрать книгу',
            callback_data: 'select_new_book'
        },
        {
            text: 'Читать далее',
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
                text: 'Читать далее ',
                callback_data: 'read_next'
            },
            {
                text: 'Выбрать книгу',
                callback_data: 'select_new_book'
            },
            {
                text: 'Список авторов',
                callback_data: 'authors'
            }
        ]]
    }
};

let startKeyboard = {
    reply_markup: {
        inline_keyboard: [[
            {
                text: 'Выбрать книгу',
                callback_data: 'select_new_book'
            },
            {
                text: 'Список авторов',
                callback_data: 'authors'
            }
        ]]
    }
};
