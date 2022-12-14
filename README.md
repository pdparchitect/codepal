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

To install it globally use:

```sh
npm install -g codepal
```

## Usage

Before using CodePal, you will need to set up an environment variable with your OpenAI credentials. This can be done by adding the following line to a `.env` file in your project directory:

```
OPENAI_API_KEY=YOUR_API_KEY_HERE
```

Once you've set up the environment variable, you can use CodePal by navigating to the directory where you want to write your code and running the following command:

```sh
npx codepal
```

This will start the CodePal chat interface, where you can write your code using natural language. CodePal will save your chat history in a directory called `.codepal` in your current working folder. To continue a previous chat session, you can provide the path to the chat history file, like this:

```sh
npx codepal -s .codepal/b1a7e548-da06-48be-9844-50f9b9c9436b.md
```

Alternatively, you can just provide the filename (without the path), like this:

```sh
npx codepal -s b1a7e548-da06-48be-9844-50f9b9c9436b
```

In this case, CodePal will automatically search for the chat history file in the `.codepal` directory of your current working folder.

The command line tool can also be executed directly with npx, which is a package runner for npm packages.

Additionally, there are several flags available that can be used to customize your experience when using CodePal.

| Flag | Description |
| --- | --- |
| -i | Starts CodePal in interactive mode |
| -s | Resumes a previous chat session |
| -t | Starts with a pre-defined template |
| -f | Pre prompt with the contents of a file |

## Examples

Examples of using CodePal can be found in the `.codepal` directory of your project. These examples show different ways to use CodePal to write code, and can serve as a useful reference for getting started with the tool.

## License

CodePal is licensed under the [MIT license](LICENSE).
