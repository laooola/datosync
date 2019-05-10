const kleur = require('kleur')

const PASS_TEXT = 'PASS'
const FAIL_TEXT = 'FAIL'

const PASS = kleur
  .reset()
  .inverse()
  .bold()
  .green(` ${PASS_TEXT} `)

const FAIL = kleur
  .reset()
  .inverse()
  .bold()
  .red(` ${FAIL_TEXT} `)

const Output = {
  pass: () => PASS,
  fail: () => FAIL,
  title: kleur.bold().white,
  text: kleur.grey,
  dim: kleur.dim,
  diff: str => kleur.bold().red(`  \u2022 ${str}`),
  unchanged: str => kleur.grey(str.replace(/\s*$/g, '').replace(/^/gm, '      ')),
  added: str => kleur.green(str.replace(/\s*$/g, '').replace(/^/gm, '    + ')),
  removed: str => kleur.red(str.replace(/\s*$/g, '').replace(/^/gm, '    - ')),
}

function log(...data) {
  console.log(...data)
}

module.exports = {
  Output,
  log,
}
