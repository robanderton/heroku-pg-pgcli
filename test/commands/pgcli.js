'use strict'

/* global describe it beforeEach */

const cli = require('heroku-cli-util')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const expect = require('unexpected')

const db = {
  user: 'username',
  password: 'pass',
  database: 'mydb',
  port: 5432,
  host: 'localhost',
  attachment: {
    addon: {
      name: 'postgres-1'
    },
    config_vars: ['DATABASE_URL'],
    app: { name: 'myapp' }
  }
}

const fetcher = () => ({
  database: () => db
})

const cmd = proxyquire('../../commands/pgcli', {
  '@heroku-cli/plugin-pg-v5/lib/fetcher': fetcher
})[0]

describe('pgcli', () => {
  beforeEach(() => {
    cli.mockConsole()
  })

  it('should needsApp', () => {
    expect(cmd.needsApp, 'to equal', true)
  })

  it('runs pgcli', () => {
    let pgcli = require('../../lib/pgcli')
    sinon.stub(pgcli, 'exec').returns(Promise.resolve(''))
    return cmd.run({ args: {}, flags: {} })
      .then(() => expect(cli.stdout, 'to equal', ''))
      .then(() => expect(cli.stderr, 'to equal', '--> Connecting to postgres-1\n'))
      .then(() => pgcli.exec.restore())
  })
})
