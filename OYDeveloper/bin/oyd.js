#!/usr/bin/env node

const { execPrompt } = require('../lib/ai-chat');

const [,, command, ...args] = process.argv;

switch (command) {
  case 'prompt':
    const prompt = args.join(' ') || 'Write a React Native login screen';
    execPrompt(prompt);
    break;
  default:
    console.log('\n🚀 OYDeveloper – AI App Assistant');
    console.log('Usage:\n');
    console.log('  oyd prompt "your task here"   Run an AI prompt');
    console.log('  oyd help                      Show available commands\n');
}
