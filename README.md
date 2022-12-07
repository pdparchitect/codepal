# CodePal

CodePal is a command line tool with a chat interface that helps developers write code. It is built on top of GPT-3 and ChatGPT (which is a work in progress), and provides a convenient and intuitive way for developers to write code quickly and efficiently.

## Features

- Chat-based interface that allows for natural, conversational code writing
- Built on top of GPT-3 and ChatGPT (soon), providing state-of-the-art natural language processing capabilities
- Easy to use and customize to your personal coding style

## Installation

To install CodePal, simply run the following command:

```sh
npm install codepal
```

## Usage

Before using CodePal, you will need to set up an environment variable with your OpenAI credentials. This can be done by adding the following line to a `.env` file in your project directory:

```
OPENAI_API_KEY=YOUR_API_KEY_HERE
```

Once you've set up the environment variable, you can use CodePal by navigating to the directory where you want to write your code and running the following command:

```sh
codepal
```

This will start the CodePal chat interface, where you can write your code using natural language. CodePal will save your chat history in a directory called `.codepal` in your current working folder.

## License

CodePal is licensed under the [MIT license](LICENSE).
