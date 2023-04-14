const { parsed } = require('dotenv').config({ path: `.env` });
const APP_ID = parsed['DISCORD_APP_ID'];
const BOT_TOKEN = parsed['DISCORD_BOT_TOKEN'];
const GUILD_ID = parsed['DISCORD_GUILD_ID'];

url = `https://discord.com/api/v10/applications/${APP_ID}/guilds/${GUILD_ID}/commands`

// This is an example CHAT_INPUT or Slash Command, with a type of 1
json = {
    "name": "blep",
    "type": 1,
    "description": "Send a random adorable animal photo",
    "options": [
    {
        "name": "animal",
        "description": "The type of animal",
        "type": 3,
        "required": true,
        "choices": [
            {
                "name": "Dog",
                "value": "animal_dog"
            },
            {
                "name": "Cat",
                "value": "animal_cat"
            },
            {
                "name": "Penguin",
                "value": "animal_penguin"
            }
        ]
    },
    {
        "name": "only_smol",
        "description": "Whether to show only baby animals",
        "type": 5,
        "required": false
    }
    ]
}

// For authorization, you can use either your bot token
headers = {
	    "Authorization": `Bot ${BOT_TOKEN}`
}

const register = async () => {
    console.log(`URL ${url}`);
    const response = await fetch(url, {method: 'POST', headers: headers, body: json});
    const r = response.json();
    console.log(`Registered slash command and got response ${JSON.stringify(r)}`);
}

register()
