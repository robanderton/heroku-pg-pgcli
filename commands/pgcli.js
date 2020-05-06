'use strict'

const co = require('co')
const cli = require('heroku-cli-util')

function * run (context, heroku) {
  const fetcher = require('@heroku-cli/plugin-pg-v5/lib/fetcher')(heroku)
  const pgcli = require('../lib/pgcli')

  const {app, args, flags} = context

  let namespace = flags.credential ? `credential:${flags.credential}` : null

  let db
  try {
    db = yield fetcher.database(app, args.database, namespace)
  } catch (err) {
    if (namespace && err.message === `Couldn't find that addon.`) {
      throw new Error(`Credential doesn't match, make sure credential is attached`)
    }
    throw err
  }
  cli.console.error(`--> Connecting to ${cli.color.addon(db.attachment.addon.name)}`)
  yield pgcli.exec(db)
}

let cmd = {
  description: 'open a pgcli shell to the database',
  help: 'defaults to DATABASE_URL if no database is specified',
  needsApp: true,
  needsAuth: true,
  args: [{name: 'database', optional: true}],
  flags: [{name: 'credential', description: 'credential to use', hasValue: true}],
  run: cli.command({preauth: true}, co.wrap(run))
}

module.exports = [
  Object.assign({topic: 'pg', command: 'pgcli'}, cmd),
  Object.assign({topic: 'pgcli'}, cmd)
]
