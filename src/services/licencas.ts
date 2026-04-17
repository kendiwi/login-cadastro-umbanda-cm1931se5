import pb from '@/lib/pocketbase/client'

export interface LicencaMedium {
  id: string
  medium_id: string
  data_inicio: string
  data_fim: string
  justificativa: string
  created: string
  updated: string
}

export const getLicencasByGroup = async (groupId: string) => {
  return pb.collection('licencas_mediuns').getFullList<LicencaMedium>({
    filter: `medium_id.grupo_id = "${groupId}"`,
    sort: '-data_inicio',
  })
}

export const getLicencasByMedium = async (mediumId: string) => {
  return pb.collection('licencas_mediuns').getFullList<LicencaMedium>({
    filter: `medium_id = "${mediumId}"`,
    sort: '-data_inicio',
  })
}

export const createLicenca = async (data: Partial<LicencaMedium>) => {
  return pb.collection('licencas_mediuns').create<LicencaMedium>(data)
}

export const updateLicenca = async (id: string, data: Partial<LicencaMedium>) => {
  return pb.collection('licencas_mediuns').update<LicencaMedium>(id, data)
}

export const deleteLicenca = async (id: string) => {
  return pb.collection('licencas_mediuns').delete(id)
}
