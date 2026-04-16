migrate(
  (app) => {
    const rule =
      "@request.auth.id != '' && (grupo_id.owner_id = @request.auth.id || grupo_id.grupo_membros_via_grupo_id.user_id ?= @request.auth.id)"
    const ruleLista =
      "@request.auth.id != '' && (lista_id.grupo_id.owner_id = @request.auth.id || lista_id.grupo_id.grupo_membros_via_grupo_id.user_id ?= @request.auth.id)"
    const ruleEvento =
      "@request.auth.id != '' && (evento_id.grupo_id.owner_id = @request.auth.id || evento_id.grupo_id.grupo_membros_via_grupo_id.user_id ?= @request.auth.id)"

    const collections = ['mediuns', 'listas_agrupamento', 'eventos_gira']
    for (const name of collections) {
      const col = app.findCollectionByNameOrId(name)
      col.createRule = rule
      col.updateRule = rule
      col.deleteRule = rule
      app.saveNoValidate(col)
    }

    const lista_mediuns = app.findCollectionByNameOrId('lista_mediuns')
    lista_mediuns.createRule = ruleLista
    lista_mediuns.updateRule = ruleLista
    lista_mediuns.deleteRule = ruleLista
    app.saveNoValidate(lista_mediuns)

    const presenca = app.findCollectionByNameOrId('presenca')
    presenca.createRule = ruleEvento
    presenca.updateRule = ruleEvento
    presenca.deleteRule = ruleEvento
    app.saveNoValidate(presenca)
  },
  (app) => {
    const ruleOwner = "@request.auth.id != '' && grupo_id.owner_id = @request.auth.id"
    const ruleOwnerLista = "@request.auth.id != '' && lista_id.grupo_id.owner_id = @request.auth.id"
    const ruleOwnerEvento =
      "@request.auth.id != '' && evento_id.grupo_id.owner_id = @request.auth.id"

    const collections = ['mediuns', 'listas_agrupamento', 'eventos_gira']
    for (const name of collections) {
      const col = app.findCollectionByNameOrId(name)
      col.createRule = "@request.auth.id != ''"
      col.updateRule = ruleOwner
      col.deleteRule = ruleOwner
      app.saveNoValidate(col)
    }

    const lista_mediuns = app.findCollectionByNameOrId('lista_mediuns')
    lista_mediuns.createRule = "@request.auth.id != ''"
    lista_mediuns.updateRule = ruleOwnerLista
    lista_mediuns.deleteRule = ruleOwnerLista
    app.saveNoValidate(lista_mediuns)

    const presenca = app.findCollectionByNameOrId('presenca')
    presenca.createRule = "@request.auth.id != ''"
    presenca.updateRule = ruleOwnerEvento
    presenca.deleteRule = ruleOwnerEvento
    app.saveNoValidate(presenca)
  },
)
