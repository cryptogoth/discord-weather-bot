//RESOURCES
//API used: https://openweathermap.org/
//used for xml formatting: xmlbuilder2 https://www.npmjs.com/package/xmlbuilder2 
//lob.com for api formatting


const { parsed } = require('dotenv').config();

//xmbuilder2 converts js objects to xml and back to a js object. This is needed because USPS api only works with xml
const xmlbuilder2 = require('xmlbuilder2');
const axios = require('axios').default

//usps api credentials
const USERNAME = process.env.USPS_API_ID || parsed['USPS_API_ID'];
const OPEN_WEATHER_KEY = process.env.OPEN_WEATHER_KEY || parsed['OPEN_WEATHER_KEY'];

// Requirements for discord bot
const { Client, Intents } = require('discord.js');
const DISCORD_TOKEN = process.env.BOT_TOKEN || parsed['BOT_TOKEN'];

const { initPlusPlus, plusPlus } = require('./plusplus');

//find the city and state from USPS api based on zip code
const getCityState = async (userZip) => {
    
    let root = xmlbuilder2.create({version: '1.0'})
    .ele('CityStateLookupRequest', {USERID: USERNAME})
        .ele('ZipCode')
            .ele('Zip5').txt(`${userZip}`).up()
        .up()
    .up();

    let xml=root.end({prettyprint: true});


    const {data:response} = await axios.get('https://secure.shippingapis.com/ShippingAPI.dll?API=CityStateLookup&xml=' + encodeURIComponent(xml))

    const userLocation = xmlbuilder2.convert(response, {format: 'object'});

    const {CityStateLookupResponse:{ZipCode:{State}}, CityStateLookupResponse:{ZipCode:{City}}} = userLocation;

        let cityStateObj = {
            city: City,
            state: State
        }

    return cityStateObj

}

//get weather data from openweathermap.org based on zip code
const fetchWeatherData = async (cityStateObj) => {
    let response;

    try {
        let city = cityStateObj.city?.toLowerCase()
        let state = cityStateObj.state?.toLowerCase()

        response = await axios(`https://api.openweathermap.org/data/2.5/weather?q=${city},${state},usa&units=imperial&APPID=${OPEN_WEATHER_KEY}`);

          /**  OPENWEATHER DATA */
        const {data:weatherData} = response; //destructure

        cityStateObj.description = weatherData.weather[0].description
        cityStateObj.temperature = weatherData.main.temp
        // console.log('new object  ', cityStateObj);
        return cityStateObj;

    } catch (err) {
        console.error(err);
    }
}

//this function runs the getCityState, and fetchWeatherData functions 
async function getWeather(userZip) {
    let cityAndState =  await getCityState(userZip)
    let currentWeather = await fetchWeatherData(cityAndState)
    // let stepThree = await getWeatherDetails(stepTwo)
    // console.log(currentWeather);
    return currentWeather
  
  }
  

//permissions for discord bot
const intents = [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
]

// Create a new discord discordClient with permissions passed in (intents)
const discordClient = new Client({intents});

discordClient.login(DISCORD_TOKEN);

const onMessageHandler = async message => {
    console.log('message received');

     //if the message is from a bot, exit
     if (message.author.bot) return;

     //if the message is a direct message, exit
     if (message.type === 'dm') return;

     if (message.content.startsWith('!')) {
          
             let userMessage = message.content.substring(1)
             let userInputRegex = /^\d{5}$/
             
             if (userInputRegex.test(userMessage) ) {
                 let weatherInfo = await getWeather(userMessage)
                 let botMessage = `The current temperature in ${weatherInfo.city} is ${weatherInfo.temperature} degrees Fahrenheit.`;
                 message.channel.send(botMessage);
             }
             else if (/\+\+/.test(userMessage)) {
                console.log(`plusplus message ${userMessage}`);
                // Discord user mention is translated to a user ID number

                let username;
                
                if (/\+\+ <@\d+>/.test(userMessage)) {
                    // Discord returned a user ID number, strip the leading <@
                    const userIdPrefix = userMessage.slice(5);
                    // and trailing >
                    const userId = userIdPrefix.slice(0, userIdPrefix.length - 1);
                    console.log(`userId ${userId}`);
                    const user = await discordClient.users.fetch(userId, { cache: true });
                    username = user.username;
                    console.log(`username from id is ${username}`);
                } else if (/\+\+ @[\w\s]+/.test(userMessage)) {
                    // Discord returned a username
                    const usernamePrefix = userMessage.slice(4);
                }

                if (username) {
                    console.log(`username is ${username}`);
                    const newScore = await plusPlus(username);
                    const botMessage = `${username} now has ${newScore} points.`;
                    message.channel.send(botMessage);   
                }
            }
             else {
                 message.channel.send("Weather request format is incorrect.")
                 return
             }
             
     }
 }

discordClient.on('ready', () =>{
    console.log('discord client ready to go!')

    initPlusPlus();

    discordClient.on("messageCreate", async (message) => {
        try {
            await onMessageHandler(message);
        } catch (err) {
            await message.channel.send(err);
            console.error(err);
        }
    })  
})



