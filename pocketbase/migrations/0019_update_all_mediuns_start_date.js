migrate(
  (app) => {
    app
      .db()
      .newQuery("UPDATE mediuns SET data_inicio_atividades = '2026-01-01 00:00:00.000Z'")
      .execute()
  },
  (app) => {
    // Cannot reliably revert a mass update without previous state
  },
)
