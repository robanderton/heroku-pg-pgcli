# Pgcli Heroku CLI Plugin

### Installation

`$ heroku plugins:install heroku-pg-pgcli`

### Usage

Open a pgcli shell to `DATABASE_URL` on the current app:

`$ heroku pg:pgcli`

Connect to a specific database for the current app:

`$ heroku pg:pgcli HEROKU_POSTGRESQL_AQUA_URL`

Specify an app name:

`$ heroku pg:pgcli -a <app-name>`

### Requirements

[Pgcli](http://pgcli.com) **version 1.4.0** or newer must be [installed](http://pgcli.com/install) and available in the `$PATH`.
