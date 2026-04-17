migrate(
  (app) => {
    app.db().newQuery('UPDATE mediuns SET ativo = 1 WHERE ativo IS NULL OR ativo = 0').execute()
  },
  (app) => {
    // no-op
  },
)
