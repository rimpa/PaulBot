'use strict';

class BslInterpreter {
    constructor(options) {
        options = options || {};
        //if (!options.store || !options.lock || !options.userId) {
        if (!options.bot) {
            throw new Error('Invalid arguments. bot and store are required');
        }

        if (typeof this.bot.getProp('scenario') === 'undefined') {
            this.bot.setProp('scenario','main_scenario');
        }

        if (typeof this.bot.getProp('step') === 'undefined') {
            this.bot.setProp('step',0);
        }

        this.bot = options.bot;
    }

    say(text) {
        this.bot.say(text + this.bot.getProp('scenario'));
    }

}

module.exports = BslInterpreter;
