module.exports = function () {

    process.env.NTBA_FIX_319 = 1;
    const TelegramBot = require('node-telegram-bot-api');

    const token = '574778308:AAHPlkfVje9Ai_TwxkMVBGv3iXPhNBLTLeQ';

// Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(token, {polling: true});


// Matches "/echo [whatever]"
    bot.onText(/\/echo (.+)/, (msg, match) => {
        // 'msg' is the received Message from Telegram
        // 'match' is the result of executing the regexp above on the text content
        // of the message

        const chatId = msg.chat.id;
        const resp = match[1]; // the captured "whatever"

        // send back the matched "whatever" to the chat
        bot.sendMessage(chatId, resp);
    });

    bot.on('callback_query', (msg) => {

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
        console.log(msg.toString())
        // send a message to the chat acknowledging receipt of their message
        // bot.sendMessage(chatId, 'Received your message');
        bot.sendMessage(msg.chat.id, 'Хотите почитать?', {
            reply_markup: {

                inline_keyboard: [[
                    {
                        text: 'читать далее',
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
        })
    });

}
