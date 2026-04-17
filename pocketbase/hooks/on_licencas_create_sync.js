onRecordAfterCreateSuccess((e) => {
  const mediumId = e.record.getString('medium_id')
  const startStr = e.record.getString('data_inicio').substring(0, 10) + ' 00:00:00.000Z'
  const endStr = e.record.getString('data_fim').substring(0, 10) + ' 23:59:59.999Z'

  const medium = $app.findRecordById('mediuns', mediumId)
  const grupoId = medium.getString('grupo_id')

  // Data integrity: ignore events that are 'fechado'
  const eventos = $app.findRecordsByFilter(
    'eventos_gira',
    "grupo_id = {:grupoId} && status != 'fechado' && data >= {:start} && data <= {:end}",
    '',
    0,
    0,
    { grupoId: grupoId, start: startStr, end: endStr },
  )

  eventos.forEach((ev) => {
    try {
      const p = $app.findFirstRecordByFilter(
        'presenca',
        'evento_id = {:ev} && medium_id = {:med}',
        { ev: ev.id, med: mediumId },
      )
      p.set('presente', false)
      $app.saveNoValidate(p)
    } catch (_) {
      const col = $app.findCollectionByNameOrId('presenca')
      const p = new Record(col)
      p.set('evento_id', ev.id)
      p.set('medium_id', mediumId)
      p.set('presente', false)
      $app.saveNoValidate(p)
    }
  })

  e.next()
}, 'licencas_mediuns')
