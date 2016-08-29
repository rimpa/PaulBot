'use strict';

class BslInterpreter {
    constructor(options) {
        options = options || {};
        //if (!options.store || !options.lock || !options.userId) {
        if (!options.bot) {
            throw new Error('Invalid arguments. bot is required');
        }

        this.bot = options.bot;
    }

    say(text) {
        this.bot.say(text);
    }
    
}

module.exports = BslInterpreter;
