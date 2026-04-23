import pb from '@/lib/pocketbase/client'

export interface EventSummaryData {
  date: string
  time: string
  location: string
  ownerName: string
  presentes: number
  ausentes: number
  emLicenca: number
  convidados: number
  total: number
  status: string
  atendimentoPreferencial: number
  atendimentoNormal: number
  atendimentoPasse: number
  description: string
}

export async function getEventSummary(eventId: string): Promise<EventSummaryData> {
  const event = await pb.collection('eventos_gira').getOne(eventId, {
    expand: 'grupo_id.owner_id',
  })

  const presencas = await pb.collection('presenca').getFullList({
    filter: `evento_id = "${eventId}"`,
  })

  let expectedMediumIds: string[] = []
  if (event.lista_id) {
    const listaMediuns = await pb.collection('lista_mediuns').getFullList({
      filter: `lista_id = "${event.lista_id}"`,
    })
    expectedMediumIds = listaMediuns.map((lm) => lm.medium_id)
  } else {
    const mediuns = await pb.collection('mediuns').getFullList({
      filter: `grupo_id = "${event.grupo_id}" && ativo = true`,
    })
    expectedMediumIds = mediuns.map((m) => m.id)
  }

  const eventDateStr = event.data.split(' ')[0]
  const licencas = await pb.collection('licencas_mediuns').getFullList({
    filter: `data_inicio <= "${eventDateStr} 23:59:59" && data_fim >= "${eventDateStr} 00:00:00"`,
  })

  let presentes = 0
  let ausentes = 0
  let emLicenca = 0

  const presencaMap = new Map<string, boolean>()
  presencas.forEach((p) => {
    presencaMap.set(p.medium_id, p.presente)
  })

  const licencasMap = new Set<string>()
  licencas.forEach((l) => {
    licencasMap.add(l.medium_id)
  })

  expectedMediumIds.forEach((mId) => {
    const isPresent = presencaMap.get(mId)
    const isOnLeave = licencasMap.has(mId)

    if (isPresent) {
      presentes++
    } else if (isOnLeave) {
      emLicenca++
    } else {
      ausentes++
    }
  })

  let convidados = 0
  const expectedSet = new Set(expectedMediumIds)
  presencas.forEach((p) => {
    if (!expectedSet.has(p.medium_id) && p.presente) {
      convidados++
    }
  })

  return {
    date: event.data,
    time: event.hora,
    location: event.local,
    ownerName: event.expand?.grupo_id?.expand?.owner_id?.name || 'Coordenador',
    presentes,
    ausentes,
    emLicenca,
    convidados,
    total: presentes + ausentes + emLicenca,
    status: event.status,
    atendimentoPreferencial: event.atendimento_preferencial || 0,
    atendimentoNormal: event.atendimento_normal || 0,
    atendimentoPasse: event.atendimento_passe || 0,
    description: event.descricao || '',
  }
}
