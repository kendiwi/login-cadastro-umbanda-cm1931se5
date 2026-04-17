migrate(
  (app) => {
    const mediunsCol = app.findCollectionByNameOrId('mediuns')

    const collection = new Collection({
      name: 'licencas_mediuns',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (medium_id.grupo_id.owner_id = @request.auth.id || medium_id.grupo_id.grupo_membros_via_grupo_id.user_id ?= @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (medium_id.grupo_id.owner_id = @request.auth.id || medium_id.grupo_id.grupo_membros_via_grupo_id.user_id ?= @request.auth.id)",
      createRule:
        "@request.auth.id != '' && (medium_id.grupo_id.owner_id = @request.auth.id || medium_id.grupo_id.grupo_membros_via_grupo_id.user_id ?= @request.auth.id)",
      updateRule:
        "@request.auth.id != '' && (medium_id.grupo_id.owner_id = @request.auth.id || medium_id.grupo_id.grupo_membros_via_grupo_id.user_id ?= @request.auth.id)",
      deleteRule:
        "@request.auth.id != '' && (medium_id.grupo_id.owner_id = @request.auth.id || medium_id.grupo_id.grupo_membros_via_grupo_id.user_id ?= @request.auth.id)",
      fields: [
        {
          name: 'medium_id',
          type: 'relation',
          required: true,
          collectionId: mediunsCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'data_inicio', type: 'date', required: true },
        { name: 'data_fim', type: 'date', required: true },
        { name: 'justificativa', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('licencas_mediuns')
    app.delete(collection)
  },
)
