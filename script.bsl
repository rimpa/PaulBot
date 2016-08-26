DNUND     "This is not defined in my script. type 'HELP' or 'h' for help."

START     PERSONAL_BOT_OF_PAULIUS
SAY       "HI, my name is PAUL BOT. I am a personal bot of Paulius Rimavičius, a passionate bot developer."
SAY       "This is the second SAY statement."
END

SCENARIO  HELP "help" "?" "h"
SAY       "How can I help you?"
SAY       "You can learn more about my creator!"
END

SCENARIO  CREATOR "creator" "learn more"
SAY       "My creator Paulius Rimavičius is an entrepreneur and a developer with 13 years professional experience!"
SAY       "test 1"
END
