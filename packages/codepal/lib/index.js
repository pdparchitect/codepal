const split = require('split2')
const through = require('through2')
const splicer = require('stream-splicer')
const { PassThrough } = require('stream')
const { Configuration, OpenAIApi } = require('openai')
const { default: GPT3Tokenizer } = require('gpt3-tokenizer')

function getOpenAI(apiKey) {
    return new OpenAIApi(new Configuration({
        apiKey
    }))
}

class Conversation {
    constructor(options = {}) {
        const {
            backstory = 'You are a briliant coding assistent.',

            model = 'text-davinci-003',
            topP = 1,
            temperature = 0.9,

            maxTokens = {'text-davinci-003': 4097}[model],
            promptMaxTokens = maxTokens / 2,

            openai = getOpenAI()
        } = options

        this.backstory = backstory

        this.maxTokens = maxTokens
        this.promptMaxTokens = promptMaxTokens

        this.model = model
        this.topP = topP
        this.temperature = temperature

        this.openai = openai

        this.conversation = []

        if (backstory) {
            this.conversation.push(this.backstory)
        }

        this.tokenizer = new GPT3Tokenizer({ type: 'gpt3' })
    }

    loadConversation(conversation) {
        this.conversation = []

        for (const line of conversation.split('\n')) {
            if (line.startsWith('[User]')) {
                this.conversation.push(line + '\n')
            }
            else {
                this.conversation[this.conversation.length - 1] += line + '\n'
            }
        }
    }

    dumpConversation(conversation = this.conversation) {
        return conversation.join('\n\n')
    }

    estimateTokens(input) {
        return this.tokenizer.encode(input).bpe.length
    }

    getPrompt(input) {
        this.conversation.push(`[User]\n\n${input.trim()}\n\n[Assistent]`) // NOTE: vulnerable to prompt injection

        let totalTokensUsed = 0

        const conversation = []

        for (let i = this.conversation.length - 1; i >= 0; i--) {
            totalTokensUsed += this.estimateTokens(this.conversation[i])

            if (totalTokensUsed > this.promptMaxTokens) {
                break
            }

            conversation.push(this.conversation[i])
        }

        return this.dumpConversation(conversation.reverse())
    }

    getMaxTokens(input) {
        return Math.max(256, this.maxTokens - this.estimateTokens(input))
    }

    async * interact(question) {
        const prompt = this.getPrompt(question)

        if (process.env.DEBUG) {
            console.debug(`* using prompt ${JSON.stringify(prompt)}`)
        }

        const maxTokens = this.getMaxTokens(prompt)

        if (process.env.DEBUG) {
            console.debug(`* using maxTokens ${JSON.stringify(maxTokens)}`)
        }

        let response

        try {
            response = await this.openai.createCompletion({
                model: this.model,
                prompt: prompt,
                max_tokens: maxTokens,
                top_p: this.topP,
                temperature: this.temperature,
                stop: '\n[User]',
                stream: true
            }, { responseType: 'stream' })
        } catch (e) {
            if (process.env.DEBUG) {
                console.error(e)
            }

            const { message } = e.toJSON()

            throw new Error(message)
        }

        const tokens = new PassThrough({ objectMode: true })

        tokens.pause()

        response.data
            .pipe(splicer.obj([
                split('\n\n'),
                through.obj(function (line, enc, cb) {
                    if (/^data:\s+\[done\]/i.test(line)) {
                        cb(null)
                    } else {
                        cb(null, JSON.parse(line.slice(5)))
                    }
                })
            ]))
            .pipe(tokens)

        tokens.resume()

        for await (const token of tokens) {
            const { choices, usage } = token

            if (choices) {
                const [{ text }] = choices

                this.conversation[this.conversation.length - 1] += text

                yield text
            }
        }

        if (process.env.DEBUG) {
            console.log(`\n* tokens consumed ${this.getMaxTokens(this.dumpConversation(this.conversation))}`)
        }
    }
}

module.exports = {
    getOpenAI,

    Conversation
}
