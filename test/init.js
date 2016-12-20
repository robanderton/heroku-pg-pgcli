'use strict'

let cli = require('heroku-cli-util')
cli.raiseErrors = true
process.env.TZ = 'UTC'

process.stdout.columns = 80
process.stderr.columns = 80

let nock = require('nock')
nock.disableNetConnect()
