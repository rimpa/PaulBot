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
        this._continue({scenario: this.scenario, step: this.step });
      });
    }

    _continue(scenarioAndStep, debug) {
      /*if (debug == 2) {
        console.log(this.scenario);
        console.log('step1:'+this.step);
      }*/

      if (typeof scenarioAndStep === 'undefined') {
        scenarioAndStep = [];
      }

      if (typeof scenarioAndStep.scenario !== 'undefined') {
        this.scenario = scenarioAndStep.scenario;
      }
      if (typeof scenarioAndStep.step !== 'undefined') {
        this.step = scenarioAndStep.step;
      }
      if (typeof this.properties === 'undefined') {
        this.properties = [];
      }

      if (typeof this.scenario === 'undefined') {
        if (typeof this.properties['scenario'] === 'undefined') {
          return this.getProperty('scenario');
        }
        this.scenario = this.properties['scenario'];
        if (typeof this.scenario === 'undefined') {
          this.scenario = 'main_scenario';
          this.bot.setProp('scenario','main_scenario');
        }
      }

      /*
      if (debug == 2) {
        console.log(this.scenario);
        console.log('step2:'+this.step);
      }*/

      if (typeof this.step === 'undefined') {
        if (typeof this.properties['step'] === 'undefined') {
          return this.getProperty('step');
        }
        /*
        if (debug == 2) {
          console.log(this.scenario);
          console.log('step3:'+this.step);
        }*/

        this.step = this.properties['step'];
        if (typeof this.step === 'undefined') {
          this.step = 0;
          this.bot.setProp('step',0);
        }
      }
      /*
      if (debug == 2) {
        console.log(this.scenario);
        console.log('step4:'+this.step);
      }*/

      if (this.scenario == 'none') {
          var scenario1 = this.getScenario(this.message);
          if (scenario1 == 'none') {
            return;
          }
          this.setScenario(scenario1);
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
      /*if (debug == 2) {
        return;
      }*/
      return this.execStetement(this.message, statementJson);
    }

    startInterpret(message) {
      this.message = message;
      return this._continue();
    }

    increaseStep() {
        this.step = this.step + 1;
        this.bot.setProp('step',this.step);
        return this.step;
    }

    setStep(step) {
        this.step = step;
        this.bot.setProp('step',this.step);
    }

    setScenario(scenario) {
        this.scenario = scenario;
        this.bot.setProp('scenario',this.scenario);
    }

    textReplace(text) {
      var matches = text.match(/\$\{[a-z0-9_]+\}/gi);
      for (val of matches) {
          var prop = val.substring(2, val.length-1);
          if (typeof this.properties[prop] !== 'undefined') {
            var re = new RegExp(val, "gi");
            text.replace(re, this.properties[prop]);
          }
      }
      return text;
    }

    execStetement(message, statement) {
      //console.log(statement);
      if (typeof statement === 'undefined') { return; }
      if (typeof statement.statement === 'undefined') { return; }

      switch (statement.statement) {
        case "SAY":
            console.log('say');
            var randMess = this._getRandomArrayValue(statement.body);
            if (typeof randMess.value !== 'undefined') {
              var text = randMess.value;
              /*if (!this.preloadTextReplace(text)) {
                return;
              }*/
              text = this.textReplace(text);
              return this.say(text, true);
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
              console.log('asd1');
              var collectedValue = message.trim();
              console.log('asd2');
              console.log('asd2');
              console.log(statement.body);
              console.log(statement.body.save);

              var collectedVariable = statement.body.save.body.value.value;
              console.log('var:'+collectedVariable);
              console.log('val:'+collectedValue);
              this.properties[collectedVariable] = collectedValue;
              this.asked = 'false';
              console.log('asd4');

              this.bot.setProp(collectedVariable, collectedValue);
              this.bot.setProp('asked', 'false');
              console.log('asd5');

              console.log('asd6');
              return this._continue({scenario: this.scenario, step: this.increaseStep() } , 2);
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

    say(text, cont) {
      this.bot.say(text).then(() => {
        if (cont === true) {
          console.log('say continue');
          //return;
          this._continue({scenario: this.scenario, step: this.increaseStep() } , 2);
        }
      });
    }
}

module.exports = BslInterpreter;
