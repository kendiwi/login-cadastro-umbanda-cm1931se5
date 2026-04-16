migrate(
  (app) => {
    const grupos = app.findCollectionByNameOrId('grupos')

    const mediuns = new Collection({
      name: 'mediuns',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && grupo_id.owner_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && grupo_id.owner_id = @request.auth.id",
      fields: [
        {
          name: 'grupo_id',
          type: 'relation',
          required: true,
          collectionId: grupos.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'nome', type: 'text', required: true },
        { name: 'data_nascimento', type: 'date' },
        { name: 'contato', type: 'text' },
        { name: 'telefone', type: 'text' },
        { name: 'email', type: 'email' },
        {
          name: 'foto',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(mediuns)

    const listas_agrupamento = new Collection({
      name: 'listas_agrupamento',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && grupo_id.owner_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && grupo_id.owner_id = @request.auth.id",
      fields: [
        {
          name: 'grupo_id',
          type: 'relation',
          required: true,
          collectionId: grupos.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'nome', type: 'text', required: true },
        { name: 'descricao', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(listas_agrupamento)

    const lista_mediuns = new Collection({
      name: 'lista_mediuns',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && lista_id.grupo_id.owner_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && lista_id.grupo_id.owner_id = @request.auth.id",
      fields: [
        {
          name: 'lista_id',
          type: 'relation',
          required: true,
          collectionId: listas_agrupamento.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'medium_id',
          type: 'relation',
          required: true,
          collectionId: mediuns.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_lista_medium ON lista_mediuns (lista_id, medium_id)'],
    })
    app.save(lista_mediuns)

    const eventos_gira = new Collection({
      name: 'eventos_gira',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && grupo_id.owner_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && grupo_id.owner_id = @request.auth.id",
      fields: [
        {
          name: 'grupo_id',
          type: 'relation',
          required: true,
          collectionId: grupos.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'lista_id',
          type: 'relation',
          required: true,
          collectionId: listas_agrupamento.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'data', type: 'date', required: true },
        { name: 'hora', type: 'text', required: true },
        { name: 'local', type: 'text', required: true },
        { name: 'descricao', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['planejado', 'em andamento', 'fechado'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(eventos_gira)

    const presenca = new Collection({
      name: 'presenca',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && evento_id.grupo_id.owner_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && evento_id.grupo_id.owner_id = @request.auth.id",
      fields: [
        {
          name: 'evento_id',
          type: 'relation',
          required: true,
          collectionId: eventos_gira.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'medium_id',
          type: 'relation',
          required: true,
          collectionId: mediuns.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'presente', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_evento_medium ON presenca (evento_id, medium_id)'],
    })
    app.save(presenca)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('presenca'))
    app.delete(app.findCollectionByNameOrId('eventos_gira'))
    app.delete(app.findCollectionByNameOrId('lista_mediuns'))
    app.delete(app.findCollectionByNameOrId('listas_agrupamento'))
    app.delete(app.findCollectionByNameOrId('mediuns'))
  },
)
