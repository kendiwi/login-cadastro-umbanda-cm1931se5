migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let adminId = ''
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'wgkendi@gmail.com')
      adminId = record.id
    } catch (_) {
      const record = new Record(users)
      record.setEmail('wgkendi@gmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Admin')
      app.save(record)
      adminId = record.id
    }

    const grupos = app.findCollectionByNameOrId('grupos')
    const membros = app.findCollectionByNameOrId('grupo_membros')

    const seedGroup = (nome, descricao) => {
      try {
        return app.findFirstRecordByData('grupos', 'nome', nome).id
      } catch (_) {
        const g = new Record(grupos)
        g.set('nome', nome)
        g.set('descricao', descricao)
        g.set('owner_id', adminId)
        app.save(g)

        const m = new Record(membros)
        m.set('grupo_id', g.id)
        m.set('user_id', adminId)
        m.set('status', 'owner')
        app.save(m)

        return g.id
      }
    }

    seedGroup('Grupo Luz Divina', 'Sessões de cura e desenvolvimento mediúnico.')
    seedGroup('Grupo Espíritos da Floresta', 'Estudos aprofundados e caridade.')
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'wgkendi@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
