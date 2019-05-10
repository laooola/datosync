const fs = require("fs")

const { modelA, modelB } = require("../__fixtures__/data")
const { diff } = require("../../lib/cmd/diff")
const logger = require("../../lib/logger")

jest.mock("fs")

const SRC = "src.json"
const DEST = "dest.json"

describe("diff", () => {
  let log

  beforeEach(() => {
    fs.readFileSync.mockReset()

    log = jest.spyOn(logger, "log").mockImplementation(() => void 0)
  })

  afterEach(() => {
    fs.readFileSync.mockRestore()

    log.mockRestore()
  })

  it("recognizes missing model (src)", async () => {
    fs.readFileSync.mockImplementation(filename => {
      switch (filename) {
        case SRC:
          return JSON.stringify([modelA])
        case DEST:
          return JSON.stringify([modelA, modelB])
        default:
          throw new Error("invalid filename")
      }
    })
    const diffs = await diff(SRC, DEST)
    expect(diffs).toEqual([
      expect.objectContaining({ isEqual: true }),
      expect.objectContaining({
        isEqual: false,
        model: expect.objectContaining({
          apiKey: "model_b",
          label: "Model B",
          isEqual: false
        }),
        fields: [
          expect.objectContaining({
            apiKey: "field_one",
            label: "Field One",
            isEqual: false
          })
        ]
      })
    ])
  })

  it("recognizes missing model (dest)", async () => {
    fs.readFileSync.mockImplementation(filename => {
      switch (filename) {
        case SRC:
          return JSON.stringify([modelA, modelB])
        case DEST:
          return JSON.stringify([modelA])
        default:
          throw new Error("invalid filename")
      }
    })
    const diffs = await diff(SRC, DEST)
    expect(diffs).toEqual([
      expect.objectContaining({ isEqual: true }),
      expect.objectContaining({
        isEqual: false,
        model: expect.objectContaining({
          apiKey: "model_b",
          label: "Model B",
          isEqual: false
        }),
        fields: [
          expect.objectContaining({
            apiKey: "field_one",
            label: "Field One",
            isEqual: false
          })
        ]
      })
    ])
  })

  it("recognizes missing field (src)", async () => {
    fs.readFileSync.mockImplementation(filename => {
      switch (filename) {
        case SRC:
          return JSON.stringify([
            {
              ...modelA,
              fields: modelA.fields.filter(
                field => field.apiKey !== "field_three"
              )
            },
            modelB
          ])
        case DEST:
          return JSON.stringify([modelA, modelB])
        default:
          throw new Error("invalid filename")
      }
    })
    const diffs = await diff(SRC, DEST)
    expect(diffs).toEqual([
      expect.objectContaining({
        isEqual: false,
        model: expect.objectContaining({
          apiKey: "model_a",
          label: "Model A",
          isEqual: true
        }),
        fields: [
          expect.objectContaining({ isEqual: true }),
          expect.objectContaining({ isEqual: true }),
          expect.objectContaining({
            apiKey: "field_three",
            label: "Field Three",
            isEqual: false
          })
        ]
      }),
      expect.objectContaining({ isEqual: true })
    ])
  })

  it("recognizes missing field (dest)", async () => {
    fs.readFileSync.mockImplementation(filename => {
      switch (filename) {
        case SRC:
          return JSON.stringify([modelA, modelB])
        case DEST:
          return JSON.stringify([
            {
              ...modelA,
              fields: modelA.fields.filter(
                field => field.apiKey !== "field_three"
              )
            },
            modelB
          ])
        default:
          throw new Error("invalid filename")
      }
    })
    const diffs = await diff(SRC, DEST)
    expect(diffs).toEqual([
      expect.objectContaining({
        isEqual: false,
        model: expect.objectContaining({
          apiKey: "model_a",
          label: "Model A",
          isEqual: true
        }),
        fields: [
          expect.objectContaining({ isEqual: true }),
          expect.objectContaining({ isEqual: true }),
          expect.objectContaining({
            apiKey: "field_three",
            label: "Field Three",
            isEqual: false
          })
        ]
      }),
      expect.objectContaining({ isEqual: true })
    ])
  })

  describe("recognizes model differences", () => {
    const patches = [
      { key: "name", value: "Model X" },
      { key: "singleton", value: true },
      { key: "sortable", value: true },
      { key: "orderingDirection", value: "asc" },
      { key: "tree", value: true },
      { key: "modularBlock", value: true },
      { key: "draftModeActive", value: true },
      { key: "allLocalesRequired", value: false },
      { key: "collectionAppeareance", value: "compact" },
      { key: "hasSingletonItem", value: true },
      { key: "titleField", value: "289806" },
      { key: "orderingField", value: "289805" }
    ]

    patches.forEach(({ key, value }) => {
      it(`${key}: ${modelA[key]} => ${value} (src)`, async () => {
        const patchedModelA = { ...modelA, [key]: value }
        fs.readFileSync.mockImplementation(filename => {
          switch (filename) {
            case SRC:
              return JSON.stringify([patchedModelA, modelB])
            case DEST:
              return JSON.stringify([modelA, modelB])
            default:
              throw new Error("invalid filename")
          }
        })
        const diffs = await diff(SRC, DEST)
        expect(diffs).toEqual([
          expect.objectContaining({
            isEqual: false,
            model: expect.objectContaining({
              apiKey: patchedModelA.apiKey,
              label: patchedModelA.name,
              isEqual: false
            }),
            fields: [
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({ isEqual: true })
            ]
          }),
          expect.objectContaining({ isEqual: true })
        ])
      })
    })

    patches.forEach(({ key, value }) => {
      it(`${key}: ${modelA[key]} => ${value} (dest)`, async () => {
        const patchedModelA = { ...modelA, [key]: value }
        fs.readFileSync.mockImplementation(filename => {
          switch (filename) {
            case SRC:
              return JSON.stringify([modelA, modelB])
            case DEST:
              return JSON.stringify([patchedModelA, modelB])
            default:
              throw new Error("invalid filename")
          }
        })
        const diffs = await diff(SRC, DEST)
        expect(diffs).toEqual([
          expect.objectContaining({
            isEqual: false,
            model: expect.objectContaining({
              apiKey: modelA.apiKey,
              label: modelA.name,
              isEqual: false
            }),
            fields: [
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({ isEqual: true })
            ]
          }),
          expect.objectContaining({ isEqual: true })
        ])
      })
    })
  })

  describe("ignores some model properties", () => {
    const patches = [
      { key: "id", value: "72969" },
      { key: "singletonItem", value: "953556" }
    ]

    patches.forEach(({ key, value }) => {
      it(`${key}: ${modelA[key]} => ${value} (src)`, async () => {
        const patchedModelA = { ...modelA, [key]: value }
        fs.readFileSync.mockImplementation(filename => {
          switch (filename) {
            case SRC:
              return JSON.stringify([patchedModelA, modelB])
            case DEST:
              return JSON.stringify([modelA, modelB])
            default:
              throw new Error("invalid filename")
          }
        })
        const diffs = await diff(SRC, DEST)
        expect(diffs).toEqual([
          expect.objectContaining({
            isEqual: true,
            model: expect.objectContaining({ isEqual: true }),
            fields: [
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({ isEqual: true })
            ]
          }),
          expect.objectContaining({ isEqual: true })
        ])
      })
    })

    patches.forEach(({ key, value }) => {
      it(`${key}: ${modelA[key]} => ${value} (dest)`, async () => {
        const patchedModelA = { ...modelA, [key]: value }
        fs.readFileSync.mockImplementation(filename => {
          switch (filename) {
            case SRC:
              return JSON.stringify([modelA, modelB])
            case DEST:
              return JSON.stringify([patchedModelA, modelB])
            default:
              throw new Error("invalid filename")
          }
        })
        const diffs = await diff(SRC, DEST)
        expect(diffs).toEqual([
          expect.objectContaining({
            isEqual: true,
            model: expect.objectContaining({ isEqual: true }),
            fields: [
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({ isEqual: true })
            ]
          }),
          expect.objectContaining({ isEqual: true })
        ])
      })
    })
  })

  describe("cannot match models if api key is changed", () => {
    const patches = [{ key: "apiKey", value: "model_x" }]

    patches.forEach(({ key, value }) => {
      it(`${key}: ${modelA[key]} => ${value} (src)`, async () => {
        const patchedModelA = { ...modelA, [key]: value }
        fs.readFileSync.mockImplementation(filename => {
          switch (filename) {
            case SRC:
              return JSON.stringify([patchedModelA, modelB])
            case DEST:
              return JSON.stringify([modelA, modelB])
            default:
              throw new Error("invalid filename")
          }
        })
        const diffs = await diff(SRC, DEST)
        expect(diffs).toEqual([
          expect.objectContaining({
            isEqual: false,
            model: expect.objectContaining({
              apiKey: patchedModelA.apiKey,
              label: patchedModelA.name,
              isEqual: false
            }),
            fields: [
              expect.objectContaining({ isEqual: false }),
              expect.objectContaining({ isEqual: false }),
              expect.objectContaining({ isEqual: false })
            ]
          }),
          expect.objectContaining({ isEqual: true }),
          expect.objectContaining({
            isEqual: false,
            model: expect.objectContaining({
              apiKey: modelA.apiKey,
              label: modelA.name,
              isEqual: false
            }),
            fields: [
              expect.objectContaining({ isEqual: false }),
              expect.objectContaining({ isEqual: false }),
              expect.objectContaining({ isEqual: false })
            ]
          })
        ])
      })
    })

    patches.forEach(({ key, value }) => {
      it(`${key}: ${modelA[key]} => ${value} (dest)`, async () => {
        const patchedModelA = { ...modelA, [key]: value }
        fs.readFileSync.mockImplementation(filename => {
          switch (filename) {
            case SRC:
              return JSON.stringify([modelA, modelB])
            case DEST:
              return JSON.stringify([patchedModelA, modelB])
            default:
              throw new Error("invalid filename")
          }
        })
        const diffs = await diff(SRC, DEST)
        expect(diffs).toEqual([
          expect.objectContaining({
            isEqual: false,
            model: expect.objectContaining({
              apiKey: modelA.apiKey,
              label: modelA.name,
              isEqual: false
            }),
            fields: [
              expect.objectContaining({ isEqual: false }),
              expect.objectContaining({ isEqual: false }),
              expect.objectContaining({ isEqual: false })
            ]
          }),
          expect.objectContaining({ isEqual: true }),
          expect.objectContaining({
            isEqual: false,
            model: expect.objectContaining({
              apiKey: patchedModelA.apiKey,
              label: patchedModelA.name,
              isEqual: false
            }),
            fields: [
              expect.objectContaining({ isEqual: false }),
              expect.objectContaining({ isEqual: false }),
              expect.objectContaining({ isEqual: false })
            ]
          })
        ])
      })
    })
  })

  describe("recognizes field differences", () => {
    const field = modelA.fields.find(field => field.apiKey === "field_three")
    const patches = [
      { key: "label", value: "Field X" },
      { key: "fieldType", value: "text" },
      { key: "hint", value: "x" },
      { key: "localized", value: true },
      {
        key: "validators",
        value: {
          required: {}
        }
      },
      { key: "position", value: 4 },
      {
        key: "appeareance",
        value: {
          type: "textarea",
          editor: "textarea",
          parameters: {},
          addons: []
        }
      },
      { key: "defaultValue", value: "x" }
    ]

    patches.forEach(({ key, value }) => {
      it(`${key}: ${field[key]} => ${value} (src)`, async () => {
        const patchedField = { ...field, [key]: value }
        fs.readFileSync.mockImplementation(filename => {
          switch (filename) {
            case SRC:
              return JSON.stringify([
                {
                  ...modelA,
                  fields: [
                    ...modelA.fields.filter(
                      field => field.apiKey !== "field_three"
                    ),
                    patchedField
                  ]
                },
                modelB
              ])
            case DEST:
              return JSON.stringify([modelA, modelB])
            default:
              throw new Error("invalid filename")
          }
        })
        const diffs = await diff(SRC, DEST)
        expect(diffs).toEqual([
          expect.objectContaining({
            isEqual: false,
            model: expect.objectContaining({ isEqual: true }),
            fields: [
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({
                apiKey: patchedField.apiKey,
                label: patchedField.label,
                isEqual: false
              })
            ]
          }),
          expect.objectContaining({ isEqual: true })
        ])
      })
    })

    patches.forEach(({ key, value }) => {
      it(`${key}: ${field[key]} => ${value} (dest)`, async () => {
        const patchedField = { ...field, [key]: value }
        fs.readFileSync.mockImplementation(filename => {
          switch (filename) {
            case SRC:
              return JSON.stringify([modelA, modelB])
            case DEST:
              return JSON.stringify([
                {
                  ...modelA,
                  fields: [
                    ...modelA.fields.filter(
                      field => field.apiKey !== "field_three"
                    ),
                    patchedField
                  ]
                },
                modelB
              ])
            default:
              throw new Error("invalid filename")
          }
        })
        const diffs = await diff(SRC, DEST)
        expect(diffs).toEqual([
          expect.objectContaining({
            isEqual: false,
            model: expect.objectContaining({ isEqual: true }),
            fields: [
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({
                apiKey: field.apiKey,
                label: field.label,
                isEqual: false
              })
            ]
          }),
          expect.objectContaining({ isEqual: true })
        ])
      })
    })
  })

  describe("ignores some field properties", () => {
    const field = modelA.fields.find(field => field.apiKey === "field_three")
    const patches = [
      { key: "id", value: "876124" },
      { key: "itemType", value: "72134" }
    ]

    patches.forEach(({ key, value }) => {
      it(`${key}: ${field[key]} => ${value} (src)`, async () => {
        const patchedField = { ...field, [key]: value }
        fs.readFileSync.mockImplementation(filename => {
          switch (filename) {
            case SRC:
              return JSON.stringify([
                {
                  ...modelA,
                  fields: [
                    ...modelA.fields.filter(
                      field => field.apiKey !== "field_three"
                    ),
                    patchedField
                  ]
                },
                modelB
              ])
            case DEST:
              return JSON.stringify([modelA, modelB])
            default:
              throw new Error("invalid filename")
          }
        })
        const diffs = await diff(SRC, DEST)
        expect(diffs).toEqual([
          expect.objectContaining({
            isEqual: true,
            model: expect.objectContaining({ isEqual: true }),
            fields: [
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({ isEqual: true })
            ]
          }),
          expect.objectContaining({ isEqual: true })
        ])
      })
    })

    patches.forEach(({ key, value }) => {
      it(`${key}: ${field[key]} => ${value} (dest)`, async () => {
        const patchedField = { ...field, [key]: value }
        fs.readFileSync.mockImplementation(filename => {
          switch (filename) {
            case SRC:
              return JSON.stringify([modelA, modelB])
            case DEST:
              return JSON.stringify([
                {
                  ...modelA,
                  fields: [
                    ...modelA.fields.filter(
                      field => field.apiKey !== "field_three"
                    ),
                    patchedField
                  ]
                },
                modelB
              ])
            default:
              throw new Error("invalid filename")
          }
        })
        const diffs = await diff(SRC, DEST)
        expect(diffs).toEqual([
          expect.objectContaining({
            isEqual: true,
            model: expect.objectContaining({ isEqual: true }),
            fields: [
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({ isEqual: true })
            ]
          }),
          expect.objectContaining({ isEqual: true })
        ])
      })
    })
  })

  describe("cannot match fields if api key is changed", () => {
    const field = modelA.fields.find(field => field.apiKey === "field_three")
    const patches = [{ key: "apiKey", value: "field_x" }]

    patches.forEach(({ key, value }) => {
      it(`${key}: ${field[key]} => ${value} (src)`, async () => {
        const patchedField = { ...field, [key]: value }
        fs.readFileSync.mockImplementation(filename => {
          switch (filename) {
            case SRC:
              return JSON.stringify([
                {
                  ...modelA,
                  fields: [
                    ...modelA.fields.filter(
                      field => field.apiKey !== "field_three"
                    ),
                    patchedField
                  ]
                },
                modelB
              ])
            case DEST:
              return JSON.stringify([modelA, modelB])
            default:
              throw new Error("invalid filename")
          }
        })
        const diffs = await diff(SRC, DEST)
        expect(diffs).toEqual([
          expect.objectContaining({
            isEqual: false,
            model: expect.objectContaining({ isEqual: true }),
            fields: [
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({
                apiKey: patchedField.apiKey,
                label: patchedField.label,
                isEqual: false
              }),
              expect.objectContaining({
                apiKey: field.apiKey,
                label: field.label,
                isEqual: false
              })
            ]
          }),
          expect.objectContaining({ isEqual: true })
        ])
      })
    })

    patches.forEach(({ key, value }) => {
      it(`${key}: ${field[key]} => ${value} (dest)`, async () => {
        const patchedField = { ...field, [key]: value }
        fs.readFileSync.mockImplementation(filename => {
          switch (filename) {
            case SRC:
              return JSON.stringify([modelA, modelB])
            case DEST:
              return JSON.stringify([
                {
                  ...modelA,
                  fields: [
                    ...modelA.fields.filter(
                      field => field.apiKey !== "field_three"
                    ),
                    patchedField
                  ]
                },
                modelB
              ])
            default:
              throw new Error("invalid filename")
          }
        })
        const diffs = await diff(SRC, DEST)
        expect(diffs).toEqual([
          expect.objectContaining({
            isEqual: false,
            model: expect.objectContaining({ isEqual: true }),
            fields: [
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({ isEqual: true }),
              expect.objectContaining({
                apiKey: field.apiKey,
                label: field.label,
                isEqual: false
              }),
              expect.objectContaining({
                apiKey: patchedField.apiKey,
                label: patchedField.label,
                isEqual: false
              })
            ]
          }),
          expect.objectContaining({ isEqual: true })
        ])
      })
    })
  })
})
