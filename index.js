'use babel'
import { CompositeDisposable } from 'atom'
import * as helpers from 'atom-linter'
import { dirname } from 'path'
import { install as installDeps } from 'atom-package-deps'

const regex = /(\d+): (.+)/gm

export const provideLinter = () => ({
  name: 'Dogma',
  grammarScopes: ['source.elixir'],
  scope: 'file',
  lintsOnChange: true,
  lint: async (textEditor) => {
    filePath = textEditor.getPath()
    const output = await helpers.exec(
      atom.config.get('linter-elixir-dogma.executablePath'),
      ['dogma', filePath],
      { ignoreExitCode: true }
    )
    let results;
    const messages = [];
    while((results = regex.exec(output)) !== null) {
      const lineNumber = parseInt(results[1])
      const message = results[2]

      messages.push({
        location: {
          file: filePath,
          position: [[lineNumber, 0], [lineNumber, 0]],
        },
        excerpt: message,
        severity: 'error',
      })
    }
    return messages
  },
})

export const activate = () =>
  installDeps('linter')

export const config = {
  executablePath: {
    type: 'string',
    default: 'mix',
    description: 'Absolute path to the mix executable on your system.' +
      'Example: /usr/local/bin/mix , by default it checks for mix in your path'
  }
}
