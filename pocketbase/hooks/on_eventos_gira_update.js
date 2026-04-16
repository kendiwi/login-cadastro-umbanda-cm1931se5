onRecordUpdateRequest((e) => {
  const original = e.record.original()
  const current = e.record

  if (original.getString('status') === 'fechado' && current.getString('status') !== 'fechado') {
    const grupoId = current.getString('grupo_id')
    const grupo = $app.findRecordById('grupos', grupoId)
    if (grupo.getString('owner_id') !== e.auth?.id) {
      throw new ForbiddenError('Apenas o proprietário do grupo pode reabrir um evento fechado.')
    }
  }

  e.next()
}, 'eventos_gira')
