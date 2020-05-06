'use strict'

/* global describe it beforeEach afterEach */

const sinon = require('sinon')
const expect = require('unexpected')
const db = {
  user: 'username',
  password: 'pass',
  database: 'mydb',
  port: 5432,
  host: 'localhost',
  hostname: 'localhost',
  attachment: {
    addon: {
      name: 'postgres-1'
    },
    name: 'DATABASE',
    //config_vars: ['DATABASE_URL'],
    app: {name: 'myapp'}
  }
}

const bastionDb = {
  user: 'username',
  password: 'pass',
  database: 'mydb',
  port: 5432,
  bastionHost: 'bastion-host',
  bastionKey: 'super-private-key',
  host: 'localhost',
  hostname: 'localhost',
  attachment: {
    addon: {
      name: 'postgres-1'
    },
    name: 'DATABASE',
    config_vars: ['DATABASE_URL'],
    app: {name: 'myapp'}
  }
}

const proxyquire = require('proxyquire')
var tunnelStub = sinon.stub().callsArg(1)

const bastion = proxyquire('@heroku-cli/plugin-pg-v5/lib/bastion', {
  'tunnel-ssh': tunnelStub
})
const pgcli = proxyquire('../../lib/pgcli', {
  '@heroku-cli/plugin-pg-v5/lib/bastion': bastion
})

describe('pgcli', () => {
  let cp
  beforeEach(() => {
    cp = sinon.mock(require('child_process'))
  })

  afterEach(() => {
    cp.verify()
    cp.restore()
  })

  describe('exec', () => {
    it('runs pgcli', () => {
      let env = Object.assign({}, process.env, {
        PGAPPNAME: 'pgcli',
        PGSSLMODE: 'require',
        PGUSER: 'username',
        PGPASSWORD: 'pass',
        PGDATABASE: 'mydb',
        PGPORT: 5432,
        PGHOST: 'localhost'
      })
      let opts = {env: env, stdio: 'inherit'}
      let onHandler = function (key, data) {
        return Promise.resolve('result')
      }
      cp.expects('spawn').withExactArgs('pgcli', ['--prompt', 'myapp::DATABASE=> '], opts).once().returns(
        {
          stdout: {
            on: onHandler
          },
          on: onHandler
        }
      )
      pgcli.exec(db)
    })
    it('opens an SSH tunnel and runs pgcli for bastion databases', () => {
      let tunnelConf = {
        username: 'bastion',
        host: 'bastion-host',
        privateKey: 'super-private-key',
        dstHost: 'localhost',
        dstPort: 5432,
        localHost: '127.0.0.1',
        localPort: 49152
      }
      let onHandler = function (key, data) {
        return Promise.resolve('result')
      }
      cp.expects('spawn').withArgs('pgcli', ['--prompt', 'myapp::DATABASE=> ']).once().returns(
        {
          stdout: {
            on: onHandler
          },
          on: onHandler
        }
      )
      pgcli.exec(bastionDb)
      .then(() => expect(
        tunnelStub.withArgs(tunnelConf).calledOnce, 'to equal', true))
    })
  })
})
