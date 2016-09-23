'use strict'

const co = require('co')
const cli = require('heroku-cli-util')

function * run (context, heroku) {
  const pgcli = require('../lib/pgcli')
  const pg = require('heroku-pg')

  let dbName = context.args.database || 'DATABASE_URL'
  let db = yield pg.fetcher(heroku).database(context.app, context.args.database)

  cli.log(`Connecting to database ${cli.color.configVar(dbName)}...`)
  yield pgcli.exec(db)
}

const cmd = {
  topic: 'pg',
  description: 'open a pgcli shell to the database',
  help: 'defaults to DATABASE_URL databases if no database is specified',
  needsApp: true,
  needsAuth: true,
  args: [{name: 'database', optional: true}],
  run: cli.command({preauth: true}, co.wrap(run))
}

exports.pgcli = Object.assign({command: 'pgcli'}, cmd)
