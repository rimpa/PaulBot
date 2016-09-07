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
        this.sayArray = [];
    }

    getProperty(prop) {
      this.getPropertyName = prop;
      this.bot.getProp(prop).then((val) => {
        this.properties[this.getPropertyName] = val;
        this._continue();
      });
    }

    _continue() {
      if (typeof this.properties === 'undefined') {
        this.properties = [];
      }
      if (typeof this.properties['scenario'] === 'undefined') {
        return this.getProperty('scenario');
      }
      this.scenario = this.properties['scenario'];
      if (typeof this.scenario === 'undefined') {
        this.scenario = 'main_scenario';
        this.bot.setProp('scenario','main_scenario');
      }
      if (typeof this.properties['step'] === 'undefined') {
        return this.getProperty('step');
      }
      this.step = this.properties['step'];
      if (typeof this.step === 'undefined') {
        this.step = 0;
        this.bot.setProp('step',0);
      }

      if (this.scenario == 'none') {
          var scenario = this.getScenario(this.message);
          if (scenario == 'none') {
            return;
          }
          this.setScenario(scenario);
          this.setStep(0);
      }

      var statementJson = this.getStatement();
      if (typeof statementJson === 'undefined') {
          this.setScenario('none');
          this.setStep(0);
          return;
      }
      console.log(this.scenario);
      console.log(this.step);
      console.log('statement');
      console.log(statementJson);
      return this.execStetement(this.message, statementJson);
    }

    startInterpret(message) {
      this.message = message;
      return this._continue();
    }

    increaseStep() {
        this.step++;
        this.bot.setProp('step',this.step);
    }

    setStep(step) {
        this.step = step;
        this.bot.setProp('step',this.step);
    }

    setScenario(scenario) {
        this.scenario = scenario;
        this.bot.setProp('scenario',this.scenario);
    }

    execStetement(message, statement) {
      //console.log(statement);
      if (typeof statement === 'undefined') { return; }
      if (typeof statement.statement === 'undefined') { return; }

      switch (statement.statement) {
        case "SAY":
            var randMess = this._getRandomArrayValue(statement.body);
            if (typeof randMess.value !== 'undefined') {
                return this.say(randMess.value, true);
            }
            break;
        case "ASK":
            console.log('ask1');
            if (typeof this.properties['asked'] === 'undefined') {
              return this.getProperty('asked');
            }
            this.asked = this.properties['asked'];
            if (typeof this.asked === 'undefined') {
              this.asked = 'false';
            }
            if (this.asked === 'true') {
              console.log(message);
              this.say('gavau'+message);
              if (!message) {
                return;
              }
              var collectedValue = message.trim();
              var collectedVariable = statement.body.collect.body.value.value;

              this.properties[collectedVariable] = collectedValue;
              this.asked = 'false';

              this.bot.setProp(collectedVariable, collectedValue);
              this.bot.setProp('asked', 'false');

              this.increaseStep();
              return this._continue();
            } else {
              var randMess = this._getRandomArrayValue(statement.body.ask);
              if (typeof randMess.value !== 'undefined') {
                  this.bot.setProp('asked', 'true');
                  this.say(randMess.value);
              }
            }
            break;
        /*case "PLUGIN":
            console.log("Plugin");
            return true;
            break;*/
      }

      return false;
    }

    getScenario(message) {
        for (var i = 0, len = this.programJson.scenarios.length; i < len; i++) {
          var scenario = this.programJson.scenarios[i];
          for (var j = 0, len2 = scenario.invoke.length; j < len2; j++) {
            if (scenario.invoke[j].value == message.toLowerCase()) {
              return scenario.scenario.value;
            }
          }
        }
        var dnundString = this.getDnund();
        this.say(dnundString);
        return 'none';
    }

    _getRandomArrayValue(arr) {
      if (typeof arr !== 'undefined') {
        if (typeof arr.length !== 'undefined') {
          return arr[Math.floor(Math.random()*arr.length)];
        }
      }
      return null;
    }

    getStatement() {
        if (this.scenario === 'main_scenario') {
            if (typeof this.programJson.main.body[this.step] !== 'undefined') {
                return this.programJson.main.body[this.step];
            }
        }
        for (var i = 0, len = this.programJson.scenarios.length; i < len; i++) {
            if (this.programJson.scenarios[i].scenario.value == this.scenario) {
                if (typeof this.programJson.scenarios[i].body[this.step] !== 'undefined') {
                    return this.programJson.scenarios[i].body[this.step];
                }
            }
        }
    }

    getDnund() {
      var vals = [];
      for (var i = 0, len = this.programJson.declaration.length; i < len; i++) {
        var statement = this.programJson.declaration[i];
        if (statement.statement == 'DNUND') {
          vals.push(statement.body.value);
        }
      }
      if (!vals.length) {
        return '';
      }
      return this._getRandomArrayValue(vals);
    }
/*
    sayLater(text) {
      this.sayArray.push(text);
    }

    sayArrayDelayed() {
      if (!this.sayArray.length) {
        return;
      }
      this.say(this.sayArray.shift());
      setTimeout(() => {
          this.sayArrayDelayed();
      }, 1000);
    }
*/
    say(text, cont) {
      this.bot.say(text).then(() => {
        if (cont === true) {
          this.increaseStep();
          this._continue();
        }
      });
    }
}

module.exports = BslInterpreter;
