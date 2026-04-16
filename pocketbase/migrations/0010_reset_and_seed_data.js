migrate(
  (app) => {
    // Purge existing data in reverse dependency order
    const tables = [
      'presenca',
      'lista_mediuns',
      'eventos_gira',
      'listas_agrupamento',
      'mediuns',
      'solicitacoes_acesso',
      'grupo_membros',
      'grupos',
      'users',
    ]

    for (const table of tables) {
      try {
        app.db().newQuery(`DELETE FROM ${table}`).execute()
      } catch (e) {
        console.log(`Failed to purge ${table}`, e)
      }
    }

    // Create mandatory admin user
    const usersCol = app.findCollectionByNameOrId('users')
    let admin
    try {
      admin = app.findAuthRecordByEmail('users', 'wgkendi@gmail.com')
    } catch (_) {
      admin = new Record(usersCol)
      admin.setEmail('wgkendi@gmail.com')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('name', 'Admin User')
      app.save(admin)
    }

    // Create sample group
    const gruposCol = app.findCollectionByNameOrId('grupos')
    let grupo
    try {
      grupo = app.findFirstRecordByData('grupos', 'nome', 'Terreiro Caminhos de Aruanda')
    } catch (_) {
      grupo = new Record(gruposCol)
      grupo.set('nome', 'Terreiro Caminhos de Aruanda')
      grupo.set('descricao', 'Casa de caridade e estudos umbandistas.')
      grupo.set('data_fundacao', '2020-01-20 12:00:00.000Z')
      grupo.set('owner_id', admin.id)
      app.save(grupo)
    }

    // Link admin as owner to group_membros
    const grupoMembrosCol = app.findCollectionByNameOrId('grupo_membros')
    const existingMembro = app.findRecordsByFilter(
      'grupo_membros',
      `user_id = '${admin.id}'`,
      '',
      1,
      0,
    )
    if (existingMembro.length === 0) {
      const membroOwner = new Record(grupoMembrosCol)
      membroOwner.set('grupo_id', grupo.id)
      membroOwner.set('user_id', admin.id)
      membroOwner.set('status', 'owner')
      app.save(membroOwner)
    }

    // Create sample mediums
    const mediunsCol = app.findCollectionByNameOrId('mediuns')
    const createMedium = (nome, email, telefone) => {
      try {
        return app.findFirstRecordByData('mediuns', 'email', email)
      } catch (_) {
        const m = new Record(mediunsCol)
        m.set('grupo_id', grupo.id)
        m.set('nome', nome)
        m.set('email', email)
        m.set('telefone', telefone)
        app.save(m)
        return m
      }
    }

    const m1 = createMedium('Carlos Eduardo', 'carlos.eduardo@example.com', '(11) 98888-7777')
    const m2 = createMedium('Luciana Santos', 'luciana.santos@example.com', '(11) 97777-6666')
    const m3 = createMedium('Ricardo Alves', 'ricardo.alves@example.com', '(11) 96666-5555')

    // Create sample list
    const listasCol = app.findCollectionByNameOrId('listas_agrupamento')
    let lista
    try {
      lista = app.findFirstRecordByData('listas_agrupamento', 'nome', 'Corrente de Quinta-feira')
    } catch (_) {
      lista = new Record(listasCol)
      lista.set('grupo_id', grupo.id)
      lista.set('nome', 'Corrente de Quinta-feira')
      lista.set('descricao', 'Médiuns participantes do trabalho semanal de quinta.')
      app.save(lista)
    }

    // Link mediums to list
    const listaMediunsCol = app.findCollectionByNameOrId('lista_mediuns')
    const linkMedium = (medium) => {
      const existing = app.findRecordsByFilter(
        'lista_mediuns',
        `lista_id = '${lista.id}' && medium_id = '${medium.id}'`,
        '',
        1,
        0,
      )
      if (existing.length === 0) {
        const lm = new Record(listaMediunsCol)
        lm.set('lista_id', lista.id)
        lm.set('medium_id', medium.id)
        app.save(lm)
      }
    }
    linkMedium(m1)
    linkMedium(m2)
    linkMedium(m3)

    // Create sample events
    const eventosCol = app.findCollectionByNameOrId('eventos_gira')

    const now = new Date()
    const datePlus2 = new Date(now)
    datePlus2.setDate(datePlus2.getDate() + 2)

    const dateMinus5 = new Date(now)
    dateMinus5.setDate(dateMinus5.getDate() - 5)

    try {
      app.findFirstRecordByData('eventos_gira', 'nome_evento', 'Gira de Caboclos')
    } catch (_) {
      const e1 = new Record(eventosCol)
      e1.set('grupo_id', grupo.id)
      e1.set('lista_id', lista.id)
      e1.set('nome_evento', 'Gira de Caboclos')
      e1.set('data', datePlus2.toISOString().split('T')[0] + ' 12:00:00.000Z')
      e1.set('hora', '19:30')
      e1.set('local', 'Salão Principal')
      e1.set('status', 'planejado')
      app.save(e1)
    }

    try {
      app.findFirstRecordByData('eventos_gira', 'nome_evento', 'Festa de Cosme e Damião')
    } catch (_) {
      const e2 = new Record(eventosCol)
      e2.set('grupo_id', grupo.id)
      e2.set('lista_id', lista.id)
      e2.set('nome_evento', 'Festa de Cosme e Damião')
      e2.set('data', dateMinus5.toISOString().split('T')[0] + ' 12:00:00.000Z')
      e2.set('hora', '15:00')
      e2.set('local', 'Área Externa')
      e2.set('status', 'fechado')
      app.save(e2)
    }
  },
  (app) => {
    // Cannot revert a destructive migration automatically
  },
)
