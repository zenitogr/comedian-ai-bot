import type { PersonaKey } from './personas';

export type Command = {
  name: string;
  description: string;
  execute: () => void;
};

export function createCommands({ 
  clearHistory, 
  setInput,
  changePersona 
}: { 
  clearHistory: () => void;
  setInput: (input: string) => void;
  changePersona: (persona: PersonaKey) => void;
}) {
  const commands: Record<string, Command> = {
    '/clear': {
      name: 'Clear History',
      description: 'Clear chat history',
      execute: clearHistory
    },
    '/help': {
      name: 'Help',
      description: 'Show available commands',
      execute: () => {
        setInput(Object.entries(commands)
          .map(([cmd, info]) => `${cmd} - ${info.description}`)
          .join('\n'));
      }
    },
    '/persona': {
      name: 'Change Persona',
      description: 'Change AI personality (netrunner/corporate/street)',
      execute: () => {
        setInput(`Available personas:
/netrunner - Hacker with deep technical knowledge
/corporate - Professional corporate AI
/street - Street-smart AI with attitude
Choose one to continue...`);
      }
    },
    '/netrunner': {
      name: 'Netrunner Persona',
      description: 'Switch to netrunner personality',
      execute: () => changePersona('netrunner')
    },
    '/corporate': {
      name: 'Corporate Persona',
      description: 'Switch to corporate personality',
      execute: () => changePersona('corporate')
    },
    '/street': {
      name: 'Street Persona',
      description: 'Switch to street personality',
      execute: () => changePersona('street')
    }
  };

  return commands;
} 