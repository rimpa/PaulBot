'use strict';

class BslInterpreter {
    constructor(options) {
        options = options || {};
        //if (!options.store || !options.lock || !options.userId) {
        if (!options.bot || !options.programJson) {
            throw new Error('Invalid arguments. bot and programJson are required');
        }
        this.bot = options.bot;
        this.programJson = options.programJson;

        this.scenario = 'main_scenario';
        this.step = 0;

`       // set default scenario and step`
        this.bot.getProp('scenario').then((scenario) => {
          if (typeof scenario === 'undefined') {
            this.bot.setProp('scenario',this.scenario);
          }
        });
        this.bot.getProp('step').then((step) => {
          if (typeof step === 'undefined') {
            this.bot.setProp('step',this.step);
          }
        });
    }

    interpret(message) {
        /*if (this.scenario == 'none') {
            this.scenario = this.getScenario(message);
            this.bot.setProp('scenario',this.scenario);
        }*/
        var next = true;
        while (next) {
            var statementJson = this.getStatement();
            if (typeof statementJson === 'undefined') {
                this.setScenario('none');
                this.setStep(0);
                break;
            }
            next = this.execStetement(message);
            message = '';
            if (next) {
                this.increaseStep();
            }
        }
    }

    getScenario(message) {
        console.log(message.toLowerCase());
        console.log(this.programJson.scenarios);
        for (var i = 0, len = this.programJson.scenarios.length; i < len; i++) {
          var scenario = this.programJson.scenarios[i];
          for (var j = 0, len2 = scenario.invoke.length; j < len2; j++) {
            if (scenario.invoke[j].value == message.toLowerCase()) {
              return scenario.scenario.value;
            }
          }
        }
        //var dnundString = this.getDnund();
        //this.say(dnundString);
        return 'none';
    };

    say(text) {
        this.bot.say(text + this.bot.getProp('scenario'));
    }

}

module.exports = BslInterpreter;
