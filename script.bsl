DNUND     "This is not defined in my script. type 'HELP' or 'h' for help."

START     PERSONAL_BOT_OF_PAULIUS
SAY       "HI, my name is PAUL BOT. I am a personal bot of Paulius Rimavičius, a passionate bot developer."
SAY       "This is the 2 SAY statement."
SAY       "This is the 3 SAY statement."
SAY       "This is the 4 SAY statement."
SAY       "This is the 5 SAY statement."
END

SCENARIO  HELP "help" "?" "h"
SAY       "How can I help you?"
SAY       "You can learn more about my creator!"
SAY       "This is the 3 SAY statement."
SAY       "This is the 4 SAY statement."
SAY       "This is the 5 SAY statement."
END

SCENARIO  CREATOR "creator" "learn more"
SAY       "My creator Paulius Rimavičius is an entrepreneur and a developer with 13 years professional experience!"
SAY       "test 1"
END

SCENARIO  NAME "name"
ASK       "What\'s your name?"
SAVE      name
SAY       "Great! I'll call you ${name}"
SAY       "Is that OK? %[Yes](postback:yes) %[No](postback:no)"
END
