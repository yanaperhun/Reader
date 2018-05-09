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
const express = require('express');
const app = express();
const port = 3000;


app.get('/', (request, response) => {
    response.send('Hello from Express!')
});

app.get('/books', (request, response) => {
    response.send(books.getBooksNames());
    // let array = "[Book 1, Book 2, Book 3]";
    // console.log(a.b);
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