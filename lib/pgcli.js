'use strict'

// Code largely copied from
// https://github.com/heroku/cli/blob/master/packages/pg-v5/lib/psql.js

const co = require('co')
const bastion = require('@heroku-cli/plugin-pg-v5/lib/bastion')

function handlePgcliError (reject, pgcli) {
  pgcli.on('error', (err) => {
    if (err.code === 'ENOENT') {
      reject(`The local pgcli command could not be located. For help installing pgcli, see http://pgcli.com/install`)
    } else {
      reject(err)
    }
  })
}

function pgcliEnv (dbEnv) {
  return Object.assign(dbEnv, {
    PGAPPNAME: 'pgcli',
    PGSSLMODE: 'require'
  })
}

function pgcliInteractive (dbEnv, prompt) {
  const {spawn} = require('child_process')
  return new Promise((resolve, reject) => {
    let pgcliArgs = ['--prompt', prompt]
    let pgcli = spawn('pgcli', pgcliArgs, { env: dbEnv, stdio: 'inherit' })

    handlePgcliError(reject, pgcli)
    pgcli.on('close', (data) => {
      resolve()
    })
  })
}

function handleSignals () {
  process.removeAllListeners('SIGINT')
  process.on('SIGINT', () => {})
}

function * exec (db) {
  let name = db.attachment.name
  let prompt = `${db.attachment.app.name}::${name}=> `

  handleSignals()
  
  let configs = bastion.getConfigs(db)
  yield bastion.sshTunnel(db, configs.dbTunnelConfig)
  return yield pgcliInteractive(configs.dbEnv, prompt)
}

module.exports = {
  exec: co.wrap(exec)
}
