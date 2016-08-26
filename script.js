'use strict';

const bslParser = require('./bsl_parser');
const Script = require('smooch-bot').Script;
const fs = require('fs');

module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say('').then(() => 'speak');
        }
    },

    speak: {
        receive: (bot, message) => {
            function fileExists(filePath) {
              try
              {
                  return fs.statSync(filePath).isFile();
              }
              catch (err)
              {
                  return false;
              }
            }
            let answer = 'no';
            if (fileExists('script.bsl')) {
                answer = 'yes';
            }
            // compile BSL script
            let dirname = __dirname;
            let scenarioJson = {};
            let bslSource = fs.readFileSync(__dirname + '/script.bsl', 'utf8');
            try {
                scenarioJson = bslParser.parse(bslSource);
            }
            catch(err) {
                //var message = err.message + ' on Line:'+err.location.start.line+' column:'+err.location.start.column;
                scenarioJson = {};
            }
            var bslJsonString = JSON.stringify({ program: scenarioJson });

            let upperText = message.text.trim().toUpperCase();
            return bot.say("Labas, testas 4 praėjo:" + bslJsonString.substring(0,50))
                .then(() => 'speak');
        }
    },

    askName: {
        prompt: (bot) => bot.say('What\'s your name?'),
        receive: (bot, message) => {
            const name = message.text;
            return bot.setProp('name', name)
                .then(() => bot.say(`Great! I'll call you ${name}
Is that OK? %[Yes](postback:yes) %[No](postback:no)`))
                .then(() => 'finish');
        }
    },

    finish: {
        receive: (bot, message) => {
            return bot.say('finish').then(() => 'speak');
            /*return bot.getProp('name')
                .then((name) => bot.say(`Sorry ${name}, my creator didn't ` +
                        'teach me how to do anything else!'))
                .then(() => 'finish');*/
        }
    }
});
