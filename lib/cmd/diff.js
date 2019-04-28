const JsDiff = require("diff")
const fs = require("fs")
const isEqual = require("lodash.isequal")
const omit = require("lodash.omit")

const { Output, PASS, FAIL } = require("../constants")
const { pullModelsAndFields, printPullError } = require("./pull")

async function diff(src, dest) {
  let modelsA
  try {
    modelsA = await getModels(src)
  } catch (err) {
    printPullError(err, src)
  }

  let modelsB
  try {
    modelsB = await getModels(dest)
  } catch (err) {
    printPullError(err, dest)
  }

  if (modelsA && modelsB) {
    const diffs = diffModels(modelsA, modelsB)
    printSuccess(diffs)
  }
}

async function getModels(filenameOrToken) {
  try {
    // try to get models and fields from file
    const fileContent = fs.readFileSync(filenameOrToken)
    return JSON.parse(fileContent)
  } catch (err) {
    // try to pull models and fields with token
    const { models } = await pullModelsAndFields(filenameOrToken)
    return models
  }
}

function diffModels(modelsA, modelsB) {
  const normModelsA = normalizeModels(modelsA)
  const normModelsB = normalizeModels(modelsB)

  const diffs = []
  normModelsA.forEach((modelA, apiKey) => {
    const modelB = normModelsB.get(apiKey) || null
    diffs.push(diffModel(modelA, modelB))
    // delete model to prevent duplicates
    normModelsB.delete(apiKey)
  })
  normModelsB.forEach((modelB, apiKey) => {
    // should always be null
    const modelA = normModelsA.get(apiKey) || null
    diffs.push(diffModel(modelA, modelB))
  })

  return diffs
}

function normalizeModels(models) {
  const modelIdMap = new Map()
  const modelKeyMap = new Map()
  models.forEach(model => {
    modelIdMap.set(model.id, model)
    modelKeyMap.set(model.apiKey, model)
    // ids may differ -> ignore
    delete model.id
    // singletonItem ids may differ -> ignore
    delete model.singletonItem
    if (model.titleField) {
      // ids may differ -> use apiKey instead of id
      const titleField = model.fields.find(
        field => field.id === model.titleField
      )
      model.titleField = titleField.apiKey
    }
  })

  models.forEach(model => {
    const fieldKeyMap = new Map()
    model.fields.forEach(field => {
      fieldKeyMap.set(field.apiKey, field)
      // ids may differ -> ignore
      delete field.id
      // ids may differ -> use apiKey instead of id
      field.itemType = model.apiKey
      Object.keys(field.validators).forEach(key => {
        const validator = field.validators[key]
        if (validator.itemTypes) {
          // ids may differ -> use apiKey instead of id
          validator.itemTypes = validator.itemTypes
            .map(id => modelIdMap.get(id).apiKey)
            .sort((a, b) => a.localeCompare(b))
        }
      })
    })
    model.fields = fieldKeyMap
  })

  return modelKeyMap
}

function diffModel(modelA, modelB) {
  const fieldsA = (modelA && modelA.fields) || new Map()
  const fieldsB = (modelB && modelB.fields) || new Map()

  const fieldDiffs = []
  fieldsA.forEach((fieldA, apiKey) => {
    const fieldB = fieldsB.get(apiKey) || null
    fieldDiffs.push(diffField(fieldA, fieldB))
    // delete field to prevent duplicates
    fieldsB.delete(apiKey)
  })
  fieldsB.forEach((fieldB, apiKey) => {
    // should always be null
    const fieldA = fieldsA.get(apiKey) || null
    fieldDiffs.push(diffField(fieldA, fieldB))
  })

  const modelIsEqual = isEqual(omit(modelA, "fields"), omit(modelB, "fields"))
  const fieldsAreEqual = !fieldDiffs.find(({ isEqual }) => !isEqual)

  return {
    isEqual: modelIsEqual && fieldsAreEqual,
    model: {
      apiKey: (modelA && modelA.apiKey) || (modelB && modelB.apiKey),
      label: (modelA && modelA.name) || (modelB && modelB.apiKey),
      isEqual: modelIsEqual,
      diff: JsDiff.diffJson(omit(modelA, "fields"), omit(modelB, "fields"))
    },
    fields: fieldDiffs
  }
}

function diffField(fieldA, fieldB) {
  return {
    apiKey: (fieldA && fieldA.apiKey) || (fieldB && fieldB.apiKey),
    label: (fieldA && fieldA.label) || (fieldB && fieldB.label),
    isEqual: isEqual(fieldA, fieldB),
    diff: JsDiff.diffJson(fieldA, fieldB)
  }
}

function printSuccess(diffs) {
  const fieldsLength = diffs.reduce((length, diff) => {
    return length + diff.fields.length
  }, 0)

  diffs.forEach(({ isEqual, model, fields }) => {
    if (isEqual) {
      console.log(
        PASS,
        Output.dim(`model/${model.apiKey}`),
        Output.title(model.label)
      )
    } else {
      console.log(
        FAIL,
        Output.dim(`model/${model.apiKey}`),
        Output.title(model.label)
      )
      if (!model.isEqual) {
        console.log(Output.diff(`model/${model.apiKey} > ${model.label}`))
        printDiff(model.diff)
      }
      fields.forEach(field => {
        if (!field.isEqual) {
          console.log(
            Output.diff(
              `model/${model.apiKey}/field/${field.apiKey} > ${field.label}`
            )
          )
          printDiff(field.diff)
        }
      })
    }
  })

  console.log()
  console.log(Output.title("Models:"), Output.text(`\t${diffs.length} total`))
  console.log(Output.title("Fields:"), Output.text(`\t${fieldsLength} total`))
}

function printDiff(diff) {
  diff.forEach(({ added, removed, value }) => {
    let output = Output.unchanged
    if (added || removed) {
      output = (added && Output.added) || Output.removed
    }
    console.log(output(value))
  })
}

module.exports = {
  diff
}
