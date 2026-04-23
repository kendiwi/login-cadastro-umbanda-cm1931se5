migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('eventos_gira')

    if (!col.fields.getByName('atendimento_preferencial')) {
      col.fields.add(new NumberField({ name: 'atendimento_preferencial', min: 0 }))
    }
    if (!col.fields.getByName('atendimento_normal')) {
      col.fields.add(new NumberField({ name: 'atendimento_normal', min: 0 }))
    }
    if (!col.fields.getByName('atendimento_passe')) {
      col.fields.add(new NumberField({ name: 'atendimento_passe', min: 0 }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('eventos_gira')

    col.fields.removeByName('atendimento_preferencial')
    col.fields.removeByName('atendimento_normal')
    col.fields.removeByName('atendimento_passe')

    app.save(col)
  },
)
