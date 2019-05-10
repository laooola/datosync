# DatoSync

A simple tool to pull, diff and synchronize [DatoCMS](https://www.datocms.com) models and fields.

## Usage

- run `datosync -h` to show the help information
- run `datosync pull -t <token>` to pull all models and fields and write them to a file
- run `datosync diff -s <filename-or-token> -d <filename-or-token>` to compare all models and fields and show the current diff

## Development

- run `npm install` to install all dependencies
- run `npm test` to run the tests

We hook into git using `husky` in order to format code on `pre-commit` using
`lint-staged` and `prettier` and to run all tests on `pre-push`.

## License

The package is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
