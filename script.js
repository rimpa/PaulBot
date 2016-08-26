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
            // compile BSL script
            var scenarioJson = {};
            let bsLSource = fs.readFileSync('script.bsl');
            console.log(bsLSource);
            try {
                scenarioJson = bslParser.parse(bsLSource);
            }
            catch(err) {
                //var message = err.message + ' on Line:'+err.location.start.line+' column:'+err.location.start.column;
                scenarioJson = {};
            }
            var bsl = JSON.stringify({ program: scenarioJson });

            let upperText = message.text.trim().toUpperCase();
            return bot.say("Labas, testas 1 praėjo:" + upperText)
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
