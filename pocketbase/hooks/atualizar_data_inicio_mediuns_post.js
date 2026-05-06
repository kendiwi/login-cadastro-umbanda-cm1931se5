routerAdd('POST', '/backend/v1/atualizar-data-inicio-mediuns', (e) => {
  try {
    let isAuthorized = e.hasSuperuserAuth()

    if (!isAuthorized && e.auth) {
      try {
        const group = $app.findFirstRecordByFilter('grupos', 'owner_id = {:userId}', {
          userId: e.auth.id,
        })
        if (group) {
          isAuthorized = true
        }
      } catch (_) {
        // user is not a group owner
      }
    }

    if (!isAuthorized) {
      return e.json(403, { error: 'Acesso negado' })
    }

    const records = $app.findRecordsByFilter('mediuns', "id != ''", '', 100000, 0)
    let updatedCount = 0

    $app.runInTransaction((txApp) => {
      for (const record of records) {
        record.set('data_inicio_atividades', '2026-01-01 12:00:00.000Z')
        txApp.saveNoValidate(record)
        updatedCount++
      }
    })

    return e.json(200, {
      data: {
        quantidade_atualizada: updatedCount,
      },
    })
  } catch (err) {
    $app
      .logger()
      .error(
        'Erro na atualização em massa de data_inicio_atividades',
        'error',
        err.message || String(err),
      )
    return e.json(500, { error: 'Erro interno ao atualizar os registros de mediuns' })
  }
})
