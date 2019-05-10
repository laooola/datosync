const program = require('commander')

const { version } = require('../package.json')
const { pull } = require('./cmd/pull')
const { diff } = require('./cmd/diff')

const DEFAULT_FILENAME = 'dato.json'

program.version(version)

program
  .command('pull')
  .description('pulls all models and fields and writes them to a file')
  .option('-t, --token <token>', 'api token (read-only or full-access)')
  .option('-f, --filename [filename]', `filename (default: ${DEFAULT_FILENAME})`)
  .action(({ token, filename }) => {
    pull(token, filename || DEFAULT_FILENAME)
  })

program
  .command('diff')
  .description('compares all models and fields and shows the current diff')
  .option(
    '-s, --src [src]',
    `filename or api token (read-only or full-access, default: ${DEFAULT_FILENAME})`,
  )
  .option(
    '-d, --dest [dest]',
    `filename or api token (read-only or full-access, default: ${DEFAULT_FILENAME})`,
  )
  .action(({ src, dest }) => {
    diff(src || DEFAULT_FILENAME, dest || DEFAULT_FILENAME)
  })

program.command('*').action(() => program.help())

if (process.argv.length <= 2) {
  program.help()
} else {
  program.parse(process.argv)
}
