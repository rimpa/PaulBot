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

    *getProp(prop) {
      var value = yield this.bot.getProp(prop).then((prop1) => {
        console.log('scenario1:'+prop1);
        this.getProp().next( prop1 );
        //return prop1;
      });
      return value;
        /*this.bot.getProp(prop).then(
          function*(val) {
            'use strict';
            console.log('pries yield');
            return yield 10;
          }
          */
          /*(prop1) => {
          console.log('pries return');
          return yield prop1;
      }*/
      //);
    }

    startInterpret(message) {
      var scenario = this.getProp('scenario').next();
      
      console.log('scenario2:'+scenario);
      //console.log('scenario:'+scenario.value);
      //console.log('scenario:'+scenario.next().value);
      return;
      this.bot.getProp('scenario').then((scenario) => {
        if (typeof scenario === 'undefined') {
          this.scenario = 'main_scenario';
          this.bot.setProp('scenario','main_scenario');
        } else {
          this.scenario = scenario;
        }
      }).then(() => {
        this.bot.getProp('step').then((step) => {
          if (typeof step === 'undefined') {
            this.step = 0;
            this.bot.setProp('step',0);
          } else {
            this.step = step;
          }
        }).then(() => {
          this.interpret(message);
        });
      });
    }

    interpret(message) {
        if (this.scenario == 'none') {
            this.scenario = this.getScenario(message);
            this.bot.setProp('scenario',this.scenario);
            this.step = 0;
            this.bot.setProp('step',this.step);
        }
        /*
        var statementJson = this.getStatement();
        if (typeof statementJson === 'undefined') {
            this.setScenario('none');
            this.setStep(0);
            return false;
        }
        var next = this.execStetement(message, statementJson);
        if (next) {
          this.increaseStep();
          return true;
        }
        return false;
        */
        var next = true;
        while (next) {
            var statementJson = this.getStatement();
            if (typeof statementJson === 'undefined') {
                this.setScenario('none');
                this.setStep(0);
                break;
            }
            next = this.execStetement(message, statementJson);
            message = '';
            if (next) {
                this.increaseStep();
            }
        }
        this.sayArrayDelayed();
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
      if (typeof statement === 'undefined') { return false; }
      if (typeof statement.statement === 'undefined') { return false; }

      switch (statement.statement) {
        case "SAY":
            var randMess = this._getRandomArrayValue(statement.body);
            if (typeof randMess.value !== 'undefined') {
                this.sayLater(randMess.value);
            }
            return true;
            break;
        case "ASK":
            console.log('ask1');
            this.bot.getProp('asked').then((asked) => {
                if (typeof asked !== 'undefined' && asked === 'true') {
                  console.log(message);
                  this.say('gavau'+message);
                  // collect && validate
                  return true;
                  if (message) {
                    var collectedValue = validator.trim(message);
                    var collectedVariable = statement.body.collect.body.value.value;
                    /*if (typeof statement.body.validate !== 'undefined') {
                      for (var i = 0, len = statement.body.validate.length; i < len; i++) {
                        var validate = statement.body.validate[i].body.value;
                        var funcName = validate.function.value;
                        var validateFunction = null;
                        try {
                          var validateFunction = validator[funcName];// require('./validate/'+ funcName +'.js');
                        } catch (ex) {
                          this.say('Validation function "'+funcName+'" not found.');
                        }
                        if (validateFunction) {
                          if (!validateFunction.validate(getParams(validate.params))) {
                            var randError = this._getRandomArrayValue(validate.error);
                            var errText = this._getRandomArrayValue(randError.body).value;
                            this.say(errText);
                            return false;
                          }
                        }
                        var randError = this._getRandomArrayValue(validate.error);
                        var errText = this._getRandomArrayValue(randError.body)
                      }
                      this.bot.setProp('asked', 'false');
                      return true;
                    }
                    */
                    this.bot.setProp(collectedVariable, collectedValue);
                    this.bot.setProp('asked', 'false');
                    console.log('ask_return_true');
                    return true;
                  }
                } else {
                  var randMess = this._getRandomArrayValue(statement.body.ask);
                  if (typeof randMess.value !== 'undefined') {
                      this.say(randMess.value);
                  }
                  this.bot.setProp('asked', 'true');
                }
            });
            //console.log('ask_return_false');
            //return false;
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

    say(text) {
      this.bot.say(text);
    }
}

module.exports = BslInterpreter;
