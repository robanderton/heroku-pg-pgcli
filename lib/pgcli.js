'use strict'

const co = require('co')

function * exec (db) {
  const {spawnSync} = require('child_process')
  const cli = require('heroku-cli-util')

  let env = Object.assign({}, process.env, {
    PGAPPNAME: 'pgcli',
    PGSSLMODE: 'require',
    PGUSER: db.user,
    PGPASSWORD: db.password,
    PGDATABASE: db.database,
    PGPORT: db.port,
    PGHOST: db.host
  })

  let child = spawnSync('pgcli', [], {env, encoding: 'utf8', stdio: 'inherit'})

  if (child.error) {
    if (child.error.code !== 'ENOENT') throw child.error
    cli.error(`The local pgcli command could not be located.
For help installing pgcli, see http://pgcli.com/install`)
    process.exit(1)
  }
  if (child.status !== 0) process.exit(child.status)
}

module.exports = {
  exec: co.wrap(exec)
}
