const { SiteClient } = require("datocms-client")
const fs = require("fs")

const logger = require("../logger")
const { Output } = logger

async function pull(token, filename) {
  try {
    const { models, fields } = await pullModelsAndFields(token)
    try {
      const fileContent = JSON.stringify(models, null, 2)
      fs.writeFileSync(filename, fileContent)
      printSuccess(models, fields, filename)
      return { models, fields }
    } catch (err) {
      printWriteFileError(err, filename)
    }
  } catch (err) {
    printPullError(err, token)
  }
  return null
}

async function pullModelsAndFields(token) {
  const client = new SiteClient(token)
  const models = await client.itemTypes.all()
  const fields = await Promise.all(
    models.map(model => client.fields.all(model.id))
  )
  models.forEach((model, idx) => {
    model.fields = fields[idx]
  })
  return { models, fields }
}

function printSuccess(models, fields, filename) {
  const fieldsLength = fields.reduce((length, arr) => length + arr.length, 0)

  logger.log(Output.pass(), Output.title("Pulled all models and fields"))
  logger.log(Output.title("Models:"), Output.text(`\t${models.length} total`))
  logger.log(Output.title("Fields:"), Output.text(`\t${fieldsLength} total`))
  logger.log(Output.text(`Results written to "${filename}".`))
}

function printWriteFileError(err, filename) {
  logger.log(Output.fail(), Output.title(`Cannot write to file "${filename}"`))
  logger.log(Output.text(JSON.stringify(err, null, 2)))
}

function printPullError(err, token) {
  logger.log(
    Output.fail(),
    Output.title(`Cannot pull models and fields with token "${token}"`)
  )
  logger.log(
    Output.text(
      JSON.stringify(
        {
          message: err.message,
          statusCode: err.statusCode,
          statusText: err.statusText
        },
        null,
        2
      )
    )
  )
}

module.exports = {
  pull,
  pullModelsAndFields,
  printSuccess,
  printPullError
}
