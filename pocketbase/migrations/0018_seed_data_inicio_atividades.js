migrate(
  (app) => {
    const records = app.findRecordsByFilter('mediuns', "data_inicio_atividades = ''", '', 10000, 0)
    for (const record of records) {
      record.set('data_inicio_atividades', record.get('created'))
      app.saveNoValidate(record)
    }
  },
  (app) => {
    // Revert is not practical for this seed migration without losing accurate date tracking
  },
)
