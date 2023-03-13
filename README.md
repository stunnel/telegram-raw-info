# Telegram Raw info

A Telegram bot that responds for the user infomation and group infomation.

## Usage

1. What do you need?

- A Telegram bot
- A domain name or use CloudFlare Workers domain

2. Set the environment variables, then run the bot. Recommended to use CloudFlare Workers.

- `TELEGRAM_TOKEN` - Telegram bot token
- `BOT_USERNAME` - Telegram bot username
- `DOMAIN` - Domain name to bind webhook
- `PREFIX` - Prefix of webhook path
- `MASTER_ID` - Telegram ID/GroupID to recive error message

3. Set the webhook, then the bot will start to work.

Access `https://DOMAIN/init` to bind the webhook.  
This is only necessary at the first time or you change "DOMAIN" and/or "PREFIX".

4. Chat with the bot, or mention it in a group, then it will reply the message infomation.

```json
{
    "update_id": 123456789,
    "message": {
        "message_id": 1,
        "from": {
            "id": 12345678,
            "is_bot": false,
            "first_name": "First Name",
            "last_name": "Last Name",
            "username": "username",
            "language_code": "en"
        },
        "chat": {
            "id": 12345678,
            "first_name": "First Name",
            "last_name": "Last Name",
            "username": "username",
            "type": "private"
        },
        "date": 1678339954,
        "text": "hello"
    }
}
```

## Misc

- [My Bot](https://t.me/TravisInfoBot)
- [Telegram Bot API](https://core.telegram.org/bots/api)
