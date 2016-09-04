'use strict';

const BslParser = require('./bslParser');
const BslInterpreter = require('./bslInterpreter');

const Script = require('smooch-bot').Script;
const fs = require('fs');
//const async = require("async");

module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },

    start: {
        receive: () => 'speak'
    },

    speak: {
        receive: (bot, message) => {
            // compile bsl script
            let dirname = __dirname;
            let scenarioJson = {};
            let bslSource = fs.readFileSync(__dirname + '/script.bsl', 'utf8');
            try {
                scenarioJson = BslParser.parse(bslSource);
            }
            catch(err) {
                //var message = err.message + ' on Line:'+err.location.start.line+' column:'+err.location.start.column;
                scenarioJson = {};
            }
            var bslJsonString = JSON.stringify({ program: scenarioJson });
            // TODO: cache to file ?
            //var programJson = { program: scenarioJson };
            // end compile bsl script

            var bslInterpreter = new BslInterpreter({'bot':bot, 'programJson': scenarioJson});

            bslInterpreter.startInterpret(message.text.trim());
            //return bot.getProp('name').then(() => 'speak');
            return 'speak';
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
        receive: () => 'speak'
    }
});
