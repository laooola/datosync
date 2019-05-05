const fs = require("fs")
const nock = require("nock")

const schema = require("../__fixtures__/schema.json")
const {
  modelsResponse,
  fieldsAResponse,
  fieldsBResponse,
  modelA,
  modelB
} = require("../__fixtures__/data")
const { pull } = require("../../lib/cmd/pull")
const logger = require("../../lib/logger")
const { Output } = logger

jest.mock("fs")

const SITE_API = "https://site-api.datocms.com"
const SITE_API_TOKEN = "site-api-token"
const SITE_API_OPTIONS = {
  reqheaders: {
    authorization: `Bearer ${SITE_API_TOKEN}`
  }
}
const FILENAME = "filename.json"

describe("pull", () => {
  let schemaRequest
  let modelsRequest
  let fieldsARequest
  let fieldsBRequest
  let log

  beforeEach(() => {
    nock.disableNetConnect()

    schemaRequest = nock(SITE_API)
      .get("/docs/site-api-hyperschema.json")
      .reply(200, schema)

    modelsRequest = nock(SITE_API, SITE_API_OPTIONS)
      .get("/item-types")
      .reply(200, modelsResponse)

    fieldsARequest = nock(SITE_API, SITE_API_OPTIONS)
      .get(`/item-types/${modelA.id}/fields`)
      .reply(200, fieldsAResponse)

    fieldsBRequest = nock(SITE_API, SITE_API_OPTIONS)
      .get(`/item-types/${modelB.id}/fields`)
      .reply(200, fieldsBResponse)

    fs.writeFileSync.mockReset()

    log = jest.spyOn(logger, "log").mockImplementation(() => void 0)
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()

    log.mockRestore()
  })

  it("pulls schema", async () => {
    await pull(SITE_API_TOKEN, FILENAME)
    schemaRequest.done()
  })

  it("pulls all models", async () => {
    await pull(SITE_API_TOKEN, FILENAME)
    modelsRequest.done()
  })

  it("pulls all fields of the models", async () => {
    await pull(SITE_API_TOKEN, FILENAME)
    fieldsARequest.done()
    fieldsBRequest.done()
  })

  it("writes models and fields to a file", async () => {
    await pull(SITE_API_TOKEN, FILENAME)
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1)
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      FILENAME,
      JSON.stringify([modelA, modelB], null, 2)
    )
  })

  it("prints success message", async () => {
    await pull(SITE_API_TOKEN, FILENAME)
    expect(log).toHaveBeenCalledTimes(4)
    expect(log.mock.calls[0]).toEqual([
      Output.pass(),
      Output.title("Pulled all models and fields")
    ])
    expect(log.mock.calls[1]).toEqual([
      Output.title("Models:"),
      Output.text(`\t2 total`)
    ])
    expect(log.mock.calls[2]).toEqual([
      Output.title("Fields:"),
      Output.text(`\t4 total`)
    ])
    expect(log.mock.calls[3]).toEqual([
      Output.text('Results written to "filename.json".')
    ])
  })

  it("prints error message if pull fails (unauthorized)", async () => {
    // simulate api error
    nock.cleanAll()
    schemaRequest = nock(SITE_API)
      .get("/docs/site-api-hyperschema.json")
      .reply(200, schema)
    modelsRequest = nock(SITE_API, SITE_API_OPTIONS)
      .get("/item-types")
      .reply(401, {
        data: [
          {
            id: "02f293",
            type: "api_error",
            attributes: {
              code: "INVALID_SITE",
              details: {}
            }
          }
        ]
      })

    await pull(SITE_API_TOKEN, FILENAME)
    expect(log).toHaveBeenCalledTimes(2)
    expect(log.mock.calls[0]).toEqual([
      Output.fail(),
      Output.title('Cannot pull models and fields with token "site-api-token"')
    ])
    expect(log.mock.calls[1]).toEqual([
      Output.text(
        JSON.stringify(
          {
            message: "401 INVALID_SITE (details: {})",
            statusCode: 401,
            statusText: "Unauthorized"
          },
          null,
          2
        )
      )
    ])
  })

  it("prints error message if write file fails", async () => {
    // simulate write error
    fs.writeFileSync.mockImplementation(() => {
      throw {
        errno: -13,
        syscall: "open",
        code: "EACCES",
        path: "filename.json"
      }
    })

    await pull(SITE_API_TOKEN, FILENAME)
    expect(log).toHaveBeenCalledTimes(2)
    expect(log.mock.calls[0]).toEqual([
      Output.fail(),
      Output.title('Cannot write to file "filename.json"')
    ])
    expect(log.mock.calls[1]).toEqual([
      Output.text(
        JSON.stringify(
          {
            errno: -13,
            syscall: "open",
            code: "EACCES",
            path: "filename.json"
          },
          null,
          2
        )
      )
    ])
  })
})
