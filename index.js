'use babel'
import { CompositeDisposable } from 'atom'
import * as helpers from 'atom-linter'
import { dirname } from 'path'
import { install as installDeps } from 'atom-package-deps'
import { execSync } from 'child_process'

const regex = /^.*:(\d+):(\d+): ([WE]): (.+)$/gm

export const provideLinter = () => ({
  name: 'Dogma',
  grammarScopes: ['source.elixir'],
  scope: 'file',
  lintsOnChange: true,
  lint: async (textEditor) => {
    filePath = textEditor.getPath()
    const output = await helpers.exec(
      atom.config.get('linter-elixir-dogma.executablePath'),
      ['dogma', filePath, '--format=flycheck'],
      {
        ignoreExitCode: true,
        cwd: atom.project.rootDirectories[0].path,
      }
    )
    let results
    const messages = []
    while((results = regex.exec(output)) !== null) {
      const lineNumber = parseInt(results[1], 10) - 1
      const lineColumn = parseInt(results[2], 10) - 1
      const severity = results[3] === 'E' ? 'error' : 'warning'
      const message = results[4]

      messages.push({
        location: {
          file: filePath,
          position: [[lineNumber, lineColumn], [lineNumber, lineColumn]],
        },
        excerpt: message,
        severity,
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
