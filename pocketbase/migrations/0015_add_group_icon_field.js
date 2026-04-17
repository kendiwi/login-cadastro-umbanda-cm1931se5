migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('grupos')

    if (!col.fields.getByName('icone')) {
      col.fields.add(
        new FileField({
          name: 'icone',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('grupos')
    col.fields.removeByName('icone')
    app.save(col)
  },
)
