#!/usr/bin/env node

require('dotenv').config()

const fs = require('fs')
const path = require('path')
const inquirer = require('inquirer')
const { v4: uuidv4 } = require('uuid')

const { getOpenAI, Conversation } = require('../lib/index.js')

async function main() {
  let conversationPath

  await fs.promises.mkdir('.codepal', { recursive: true })

  const conversation = new Conversation({
    openai: getOpenAI(process.env.OPENAI_API_KEY)
  })

  if (process.argv[2]) {
    let conversationContents

    for (const file of [process.argv[2], path.join('.codepal', process.argv[2]), path.join('.codepal', process.argv[2] + '.md')]) {
      try {
        conversationPath = file
        conversationContents = await fs.promises.readFile(file)

        break
      } catch (e) {}
    }

    if (!conversationContents) {
      console.error(`[x] session ${process.argv[2]} not found`)

      process.exit(1)
    }

    await conversation.loadConversation(conversationContents.toString())
  } else {
    conversationPath = path.join('.codepal', `${uuidv4()}.md`)
  }

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

    await fs.promises.writeFile(conversationPath, conversation.dumpConversation())
  }
}

main()
