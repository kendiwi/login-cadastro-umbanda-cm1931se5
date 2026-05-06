migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('mediuns')
    if (!col.fields.getByName('data_inicio_atividades')) {
      col.fields.add(
        new DateField({
          name: 'data_inicio_atividades',
          required: false,
        }),
      )
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('mediuns')
    if (col.fields.getByName('data_inicio_atividades')) {
      col.fields.removeByName('data_inicio_atividades')
      app.save(col)
    }
  },
)
