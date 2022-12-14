#!/usr/bin/env node

require('dotenv').config()

const fs = require('fs')
const path = require('path')
const yargs = require('yargs/yargs')
const inquirer = require('inquirer')
const { v4: uuidv4 } = require('uuid')
const { hideBin } = require('yargs/helpers')

const { getOpenAI, Conversation } = require('../lib/index.js')

function getRoot() {
  return '.codepal' // TODO: get the root from start of git project
}

function getRootPath(...args) {
  return path.join(getRoot(), ...args)
}

async function fileExists(file) {
  try {
    await fs.promises.stat(file)

    return true
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false
    }

    throw err
  }
}

async function main() {
  let { interactive, session, template, file, model, topp, temperature } = yargs(hideBin(process.argv))
    .option('interactive', {
      alias: 'i',
      type: 'boolean',
      description: 'Start in interactive mode'
    })
    .options('session', {
      alias: 's',
      type: 'string',
      description: 'Session id/file to resume'
    })
    .options('template', {
      alias: 't',
      type: 'string',
      description: 'Template name/file to use'
    })
    .options('file', {
      alias: 'f',
      type: 'string',
      description: 'Start from a file'
    })
    .options('model', {
      alias: 'm',
      type: 'string',
      description: 'Which model to use',
      default: 'text-davinci-003',
      options: ['text-davinci-003']
    })
    .options('topp', {
      alias: 'p',
      type: 'number',
      description: 'The topP for the OpenAI API',
      default: 1
    })
    .options('temperature', {
      alias: 'e',
      type: 'number',
      description: 'The temperature for the OpenAI API',
      default: 0.7
    })
    .parse()

  let backstory

  if (!template) {
    const defaultTemplatePath = getRootPath('templates', 'default.md')

    if (await fileExists(defaultTemplatePath)) {
      template = defaultTemplatePath
    }
  }

  if (template) {
    for (const file of [template, getRootPath('templates', template), getRootPath('templates', template + '.md')]) {
      try {
        backstory = (await fs.promises.readFile(file)).toString()

        break
      } catch (e) {}
    }

    if (!backstory) {
      console.error(`x template ${template} not found`)

      process.exit(1)
    }
  }

  if (file) {
    let fileContents
    
    try {
      fileContents = (await fs.promises.readFile(file)).toString()
    } catch (e) {
      console.error(`x file ${file} not found`)

      process.exit(1)
    }

    backstory = `${backstory ? backstory + '\n\n' : ''}file: ${file}\n\`\`\`\n${fileContents}\`\`\``
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Environment variable OPENAI_API_KEY not found')
  }

  const conversation = new Conversation({
    openai: getOpenAI(process.env.OPENAI_API_KEY),

    backstory: backstory,

    model: model,
    topP: topp,
    temperature: temperature
  })

  await fs.promises.mkdir(getRootPath('sessions'), { recursive: true })

  let sessionPath

  if (session) {
    let sessionContents

    for (const file of [session, getRootPath('sessions', session), getRootPath('sessions', session + '.md')]) {
      try {
        sessionPath = file
        sessionContents = (await fs.promises.readFile(file)).toString()

        break
      } catch (e) {}
    }

    if (!sessionContents) {
      console.error(`x session ${session} not found`)

      process.exit(1)
    }

    await conversation.loadConversation(sessionContents)
  } else {
    sessionPath = path.join('.codepal', 'sessions', `${uuidv4()}.md`)
  }

  if (interactive) {
    while (true) {
      const question = await inquirer.prompt([
        {
          type: 'input',
          name: 'message',
          message: 'Q',
        }
      ]);

      if (question.message.toLowerCase() === 'exit') {
        break;
      }

      process.stdout.write('\n')

      for await (const token of conversation.interact(question.message)) {
          process.stdout.write(token)
      }

      process.stdout.write('\n')

      await fs.promises.writeFile(sessionPath, conversation.dumpConversation())
    }
  } else {
    const questionChunks = []

    for await (const chunk of process.stdin) {
      questionChunks.push(chunk)
    }

    const question = questionChunks.join('')

    for await (const token of conversation.interact(question)) {
      process.stdout.write(token)
    }

    process.stdout.write('\n')

    await fs.promises.writeFile(sessionPath, conversation.dumpConversation())
  }
}

main()
