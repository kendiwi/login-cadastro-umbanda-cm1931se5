migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('eventos_gira')
    col.fields.add(
      new TextField({
        name: 'nome_evento',
        required: true,
      }),
    )
    app.save(col)

    // Update existing records to have a default name, since the new field is required.
    app
      .db()
      .newQuery(
        "UPDATE eventos_gira SET nome_evento = 'Evento de Gira' WHERE nome_evento = '' OR nome_evento IS NULL",
      )
      .execute()
  },
  (app) => {
    const col = app.findCollectionByNameOrId('eventos_gira')
    col.fields.removeByName('nome_evento')
    app.save(col)
  },
)
