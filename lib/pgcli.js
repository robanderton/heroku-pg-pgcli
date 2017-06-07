'use strict'

// Code largely copied from
// https://github.com/heroku/heroku-pg/blob/master/lib/psql.js

const co = require('co')
const bastion = require('heroku-pg/lib/bastion')

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
    PGAPPNAME: 'pgcli'
  })
}

function pgcliInteractive (dbEnv, prompt) {
  const {spawn} = require('child_process')
  return new Promise((resolve, reject) => {
    let pgcli = spawn('pgcli', ['--prompt', prompt], {env: pgcliEnv(dbEnv), stdio: 'inherit'})
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
  const pgUtil = require('heroku-pg/lib/util')

  let name = pgUtil.getUrl(db.attachment.config_vars).replace(/^HEROKU_POSTGRESQL_/, '').replace(/_URL$/, '')
  let prompt = `${db.attachment.app.name}::${name}=> `
  handleSignals()
  let configs = bastion.getConfigs(db)

  yield bastion.sshTunnel(db, configs.dbTunnelConfig)
  return yield pgcliInteractive(configs.dbEnv, prompt)
}

module.exports = {
  exec: co.wrap(exec)
}
