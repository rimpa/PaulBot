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

    startInterpret(message) {
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
            this.bot.getProp('asked').then((asked) => {
                if (typeof asked !== 'undefined' && asked === 'true') {
                  console.log(message);
                  this.say('gavau'+message);
                  // collect && validate
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
            return false;
            /*if (typeof sess.asked !== 'undefined' && sess.asked) {
              // collect && validate
              if (msg) {
                var collectedValue = validator.trim(msg);
                var collectedVariable = statement.body.collect.body.value.value;
                if (typeof statement.body.validate !== 'undefined') {
                  for (var i = 0, len = statement.body.validate.length; i < len; i++) {
                    var validate = statement.body.validate[i].body.value;
                    var funcName = validate.function.value;
                    var validateFunction = null;
                    try {
                      var validateFunction = validator[funcName];// require('./validate/'+ funcName +'.js');
                    } catch (ex) {
                      io.emit('chat message', 'Validation function "'+funcName+'" not found.');
                    }
                    if (validateFunction) {
                      //doValidate(validateFunction, )
                      if (!validateFunction.validate(getParams(validate.params))) {
                        var randError = getRandomArrayValue(validate.error);
                        var errText = getRandomArrayValue(randError.body).value;
                        io.emit('chat message', errText);
                        return false;
                      }
                    }
                    var randError = getRandomArrayValue(validate.error);
                    var errText = getRandomArrayValue(randError.body)
                  }
                  sess.asked = false;
                  return true;
                } else {
                  sess.collected_value = collectedValue;
                  sess.collected_variable = collectedVariable;
                  addVariable(collectedVariable, collectedValue, sess);
                  sess.asked = false;
                  return true;
                }
              }
            } else {
              var randMess = getRandomArrayValue(statement.body.ask);
              if (typeof randMess.value !== 'undefined') {
                io.emit('chat message', randMess.value);
              }
            }
            sess.asked = true;
            return false;*/
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
