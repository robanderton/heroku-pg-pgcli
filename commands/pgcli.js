'use strict'

const co = require('co')
const cli = require('heroku-cli-util')

function * run (context, heroku) {
  const fetcher = require('heroku-pg/lib/fetcher')(heroku)
  const pgcli = require('../lib/pgcli')

  const {app, args} = context

  let db = yield fetcher.database(app, args.database)
  cli.console.error(`--> Connecting to ${cli.color.addon(db.attachment.addon.name)}`)
  yield pgcli.exec(db)
}

let cmd = {
  description: 'open a pgcli shell to the database',
  help: 'defaults to DATABASE_URL databases if no database is specified',
  needsApp: true,
  needsAuth: true,
  args: [{name: 'database', optional: true}],
  run: cli.command({preauth: true}, co.wrap(run))
}

module.exports = [
  Object.assign({topic: 'pg', command: 'pgcli'}, cmd),
  Object.assign({topic: 'pgcli'}, cmd)
]
