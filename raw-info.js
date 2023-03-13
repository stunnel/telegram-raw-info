// A Telegram bot that responds for the user infomation and group infomation.

const version = '1.0.7';

// Get token from environment variable, e.g. from cloudflare workers
// Must be set in the environment variable
const token = TELEGRAM_TOKEN;  // bot token
const bot_username = BOT_USERNAME;  // to check if the message mentions your bot, e.g. bot_username
const domain = DOMAIN;  // domain to bind webhook
const prefix = PREFIX;  // e.g. /telegram/bot
const master_id = MASTER_ID;  // Telegram ID/GroupID to recive error message, e.g. 123456789

const botID = token.split(':')[0];
const webHookUrl = `${prefix}/${token.trim()}/info`;
const webHookUrl2 = `${prefix}/${botID}:REDACTED/info`;
const myHeaders = { 'Cache-Control': 'max-age=60', 'X-Version': version };

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const { pathname } = new URL(request.url);
    if ((pathname === webHookUrl || pathname === webHookUrl2) && request.method === 'POST') {
        let data = await request.json()
        return tg_message(data);
    }
    if (pathname === `/`) {
        return new Response('ok', { status: 200, headers: myHeaders });
    }
    if (pathname === `/version`) {
        return new Response(version, { status: 200, headers: myHeaders });
    }
    if (pathname === `/init`) {
        return bindTelegramWebHook(request);
    }
    if (pathname.startsWith(`${prefix}`) && pathname.endsWith(`/setWebhook`)) {
        return bindTelegramWebHook(request);
    }
    return new Response('not found', { status: 404, headers: myHeaders });
}

async function bindTelegramWebHook() {
    const url = `https://${domain}${webHookUrl}`;
    let t = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      }
    )

    let d = await t.json()

    return new Response(JSON.stringify(d), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

async function tg_message(d) {
    try {
        if ((d.message.chat.type === 'group') || (d.message.chat.type === 'supergroup')) {
            // Check if the message mentions your bot
            const mentioned = d.message.text.includes(`@${bot_username}`)
            // If the message doesn't mention your bot, reply nothing
            if (!mentioned) {
                return new Response(null, { status: 204 })
            }
        }

        let chat_id = d.message.chat.id
        //let messageData = JSON.stringify(d, null, 4);
        let messageData = '```json\n' + JSON.stringify(d, null, 4) + '\n```';
        let data = { chat_id: chat_id, text: messageData, parse_mode: 'MarkdownV2' }

        await tg(token, 'sendMessage', data, true)

        return new Response('ok', { status: 200, headers: myHeaders })
    } catch (e) {
        console.log(e)
        return new Response(null, { status: 204 })
    }
}

async function tg(token, type, data, n = true) {
    try {
        let t = await fetch('https://api.telegram.org/bot' + token + '/' + type, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        let d = await t.json()
        if (!d.ok && n)
            throw d
        else
            return d
    } catch (e) {
        // Cloudflare workers limit runtime for 10ms, So error report maybe not works.
        await tg(token, 'sendMessage', {
            chat_id: master_id,
            text: 'Request tg error\n\n' /**+ JSON.stringify(data) + '\n\n' */ + JSON.stringify(e)
        }, false)
        return e
    }
}
