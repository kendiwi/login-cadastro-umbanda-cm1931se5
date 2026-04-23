import pb from '@/lib/pocketbase/client'

export interface EventSummaryData {
  id: string
  name: string
  date: string
  time: string
  location: string
  description: string
  status: string
  atendimentoPreferencial: number
  atendimentoNormal: number
  atendimentoPasse: number
  ownerName: string
  presentes: number
  ausentes: number
  emLicenca: number
  convidados: number
  total: number
}

export const getEventSummary = async (eventId: string): Promise<EventSummaryData> => {
  const event = await pb.collection('eventos_gira').getOne(eventId, {
    expand: 'grupo_id.owner_id',
  })

  const presencas = await pb.collection('presenca').getFullList({
    filter: `evento_id = "${eventId}"`,
  })

  const licencas = await pb.collection('licencas_mediuns').getFullList({
    filter: `medium_id.grupo_id = "${event.grupo_id}"`,
  })

  let expectedMediumIds: string[] = []
  if (event.lista_id) {
    const lista = await pb.collection('lista_mediuns').getFullList({
      filter: `lista_id = "${event.lista_id}"`,
    })
    expectedMediumIds = lista.map((l) => l.medium_id)
  } else {
    const allMediuns = await pb.collection('mediuns').getFullList({
      filter: `grupo_id = "${event.grupo_id}"`,
    })
    expectedMediumIds = allMediuns.map((m) => m.id)
  }

  const evDateStr = event.data.split(' ')[0]

  const onLeaveMediumIds = new Set<string>()
  for (const l of licencas) {
    const startStr = l.data_inicio.split(' ')[0]
    const endStr = l.data_fim.split(' ')[0]
    if (evDateStr >= startStr && evDateStr <= endStr) {
      onLeaveMediumIds.add(l.medium_id)
    }
  }

  const presentes = presencas.filter((p) => p.presente).length
  const ausentes = presencas.filter((p) => p.presente === false).length

  let emLicenca = 0
  const allGroupMediuns = await pb.collection('mediuns').getFullList({
    filter: `grupo_id = "${event.grupo_id}"`,
  })
  for (const m of allGroupMediuns) {
    if (onLeaveMediumIds.has(m.id)) {
      emLicenca++
    }
  }

  let convidados = 0
  for (const p of presencas) {
    if (p.presente && !expectedMediumIds.includes(p.medium_id)) {
      convidados++
    }
  }

  const total = presentes + ausentes + emLicenca

  return {
    id: event.id,
    name: event.nome_evento,
    date: event.data,
    time: event.hora,
    location: event.local,
    description: event.descricao || '',
    status: event.status,
    atendimentoPreferencial: event.atendimento_preferencial || 0,
    atendimentoNormal: event.atendimento_normal || 0,
    atendimentoPasse: event.atendimento_passe || 0,
    ownerName: event.expand?.grupo_id?.expand?.owner_id?.name || 'Desconhecido',
    presentes,
    ausentes,
    emLicenca,
    convidados,
    total,
  }
}
