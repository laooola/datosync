const kleur = require("kleur")

const Output = {
  title: kleur.bold().white,
  text: kleur.grey
}

const PASS_TEXT = "PASS"
const FAIL_TEXT = "FAIL"

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

module.exports = {
  Output,
  PASS,
  FAIL
}
