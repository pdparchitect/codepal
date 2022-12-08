#!/usr/bin/env node

require('dotenv').config()

const fs = require('fs')
const path = require('path')
const yargs = require('yargs/yargs')
const inquirer = require('inquirer')
const { v4: uuidv4 } = require('uuid')
const { hideBin } = require('yargs/helpers')

const { getOpenAI, Conversation } = require('../lib/index.js')

async function main() {
  const { interactive, session, template } = yargs(hideBin(process.argv))
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
    .options('tempalte', {
      alias: 't',
      type: 'string',
      description: 'Template name/file to use'
    })
    .parse()

  let backstory

  if (template) {
    for (const file of [template, path.join('.codepal', 'templates', template), path.join('.codepal', 'templates', template + '.md')]) {
      try {
        backstory = (await fs.promises.readFile(file)).toString()

        break
      } catch (e) {}
    }

    if (!backstory) {
      console.error(`[x] template ${template} not found`)

      process.exit(1)
    }
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Environment variable OPENAI_API_KEY not found')
  }

  const conversation = new Conversation({
    openai: getOpenAI(process.env.OPENAI_API_KEY),

    backstory: backstory
  })

  await Promise.all([
    fs.promises.mkdir(path.join('.codepal', 'sessions'), { recursive: true }),
    fs.promises.mkdir(path.join('.codepal', 'templates'), { recursive: true })
  ])

  let sessionPath

  if (session) {
    let sessionContents

    for (const file of [session, path.join('.codepal', 'sessions', session), path.join('.codepal', 'sessions', session + '.md')]) {
      try {
        sessionPath = file
        sessionContents = (await fs.promises.readFile(file)).toString()

        break
      } catch (e) {}
    }

    if (!sessionContents) {
      console.error(`[x] session ${session} not found`)

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
