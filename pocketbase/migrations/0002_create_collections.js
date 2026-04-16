migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    const grupos = new Collection({
      name: 'grupos',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && owner_id = @request.auth.id",
      deleteRule: "@request.auth.id != '' && owner_id = @request.auth.id",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'descricao', type: 'text' },
        { name: 'data_fundacao', type: 'date' },
        {
          name: 'owner_id',
          type: 'relation',
          required: true,
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(grupos)

    const grupoMembros = new Collection({
      name: 'grupo_membros',
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
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['owner', 'membro'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_membro_unico ON grupo_membros (grupo_id, user_id)'],
    })
    app.save(grupoMembros)

    const solicitacoes = new Collection({
      name: 'solicitacoes_acesso',
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
          name: 'user_id',
          type: 'relation',
          required: true,
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pendente', 'aprovado', 'negado'],
          maxSelect: 1,
        },
        { name: 'data_solicitacao', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_solicitacao_unica ON solicitacoes_acesso (grupo_id, user_id) WHERE status = 'pendente'",
      ],
    })
    app.save(solicitacoes)
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('solicitacoes_acesso'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('grupo_membros'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('grupos'))
    } catch (_) {}
  },
)
