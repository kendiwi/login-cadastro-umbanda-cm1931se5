migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('eventos_gira')
    const field = collection.fields.getByName('lista_id')
    if (field) {
      field.required = false
      app.save(collection)
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('eventos_gira')
    const field = collection.fields.getByName('lista_id')
    if (field) {
      field.required = true
      app.save(collection)
    }
  },
)
