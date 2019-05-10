const modelsResponse = {
  data: [
    {
      id: '72969',
      type: 'item_type',
      attributes: {
        name: 'Model A',
        singleton: false,
        sortable: false,
        api_key: 'model_a',
        ordering_direction: null,
        tree: false,
        modular_block: false,
        draft_mode_active: false,
        all_locales_required: true,
        collection_appeareance: 'table',
        has_singleton_item: false,
      },
      relationships: {
        fields: {
          data: [
            {
              id: '289805',
              type: 'field',
            },
            {
              id: '289806',
              type: 'field',
            },
            {
              id: '289807',
              type: 'field',
            },
          ],
        },
        singleton_item: {
          data: null,
        },
        ordering_field: {
          data: null,
        },
        title_field: {
          data: {
            id: '289805',
            type: 'field',
          },
        },
      },
    },
    {
      id: '71444',
      type: 'item_type',
      attributes: {
        name: 'Model B',
        singleton: false,
        sortable: false,
        api_key: 'model_b',
        ordering_direction: null,
        tree: false,
        modular_block: false,
        draft_mode_active: false,
        all_locales_required: true,
        collection_appeareance: 'table',
        has_singleton_item: false,
      },
      relationships: {
        fields: {
          data: [
            {
              id: '282158',
              type: 'field',
            },
          ],
        },
        singleton_item: {
          data: null,
        },
        ordering_field: {
          data: null,
        },
        title_field: {
          data: {
            id: '282158',
            type: 'field',
          },
        },
      },
    },
  ],
}

const fieldsAResponse = {
  data: [
    {
      id: '289805',
      type: 'field',
      attributes: {
        label: 'Field One',
        field_type: 'string',
        api_key: 'field_one',
        hint: null,
        localized: false,
        validators: {
          required: {},
        },
        position: 1,
        appeareance: {
          editor: 'single_line',
          parameters: {
            heading: false,
          },
          addons: [],
        },
        default_value: null,
      },
      relationships: {
        item_type: {
          data: {
            id: '72969',
            type: 'item_type',
          },
        },
      },
    },
    {
      id: '289806',
      type: 'field',
      attributes: {
        label: 'Field Two',
        field_type: 'string',
        api_key: 'field_two',
        hint: null,
        localized: false,
        validators: {},
        position: 2,
        appeareance: {
          editor: 'single_line',
          parameters: {
            heading: false,
          },
          addons: [],
        },
        default_value: null,
      },
      relationships: {
        item_type: {
          data: {
            id: '72969',
            type: 'item_type',
          },
        },
      },
    },
    {
      id: '289807',
      type: 'field',
      attributes: {
        label: 'Field Three',
        field_type: 'string',
        api_key: 'field_three',
        hint: null,
        localized: false,
        validators: {},
        position: 3,
        appeareance: {
          editor: 'single_line',
          parameters: {
            heading: false,
          },
          addons: [],
        },
        default_value: null,
      },
      relationships: {
        item_type: {
          data: {
            id: '72969',
            type: 'item_type',
          },
        },
      },
    },
  ],
}

const fieldsBResponse = {
  data: [
    {
      id: '282158',
      type: 'field',
      attributes: {
        label: 'Field One',
        field_type: 'string',
        api_key: 'field_one',
        hint: null,
        localized: true,
        validators: {
          required: {},
        },
        position: 1,
        appeareance: {
          editor: 'single_line',
          parameters: {
            heading: false,
          },
          addons: [],
        },
        default_value: null,
      },
      relationships: {
        item_type: {
          data: {
            id: '71444',
            type: 'item_type',
          },
        },
      },
    },
  ],
}

const fieldsA = [
  {
    id: '289805',
    label: 'Field One',
    fieldType: 'string',
    apiKey: 'field_one',
    hint: null,
    localized: false,
    validators: {
      required: {},
    },
    position: 1,
    appeareance: {
      editor: 'single_line',
      parameters: {
        heading: false,
      },
      addons: [],
    },
    defaultValue: null,
    itemType: '72969',
  },
  {
    id: '289806',
    label: 'Field Two',
    fieldType: 'string',
    apiKey: 'field_two',
    hint: null,
    localized: false,
    validators: {},
    position: 2,
    appeareance: {
      editor: 'single_line',
      parameters: {
        heading: false,
      },
      addons: [],
    },
    defaultValue: null,
    itemType: '72969',
  },
  {
    id: '289807',
    label: 'Field Three',
    fieldType: 'string',
    apiKey: 'field_three',
    hint: null,
    localized: false,
    validators: {},
    position: 3,
    appeareance: {
      editor: 'single_line',
      parameters: {
        heading: false,
      },
      addons: [],
    },
    defaultValue: null,
    itemType: '72969',
  },
]

const modelA = {
  id: '72969',
  name: 'Model A',
  singleton: false,
  sortable: false,
  apiKey: 'model_a',
  orderingDirection: null,
  tree: false,
  modularBlock: false,
  draftModeActive: false,
  allLocalesRequired: true,
  collectionAppeareance: 'table',
  hasSingletonItem: false,
  singletonItem: null,
  fields: fieldsA,
  titleField: '289805',
  orderingField: null,
}

const fieldsB = [
  {
    id: '282158',
    label: 'Field One',
    fieldType: 'string',
    apiKey: 'field_one',
    hint: null,
    localized: true,
    validators: {
      required: {},
    },
    position: 1,
    appeareance: {
      editor: 'single_line',
      parameters: {
        heading: false,
      },
      addons: [],
    },
    defaultValue: null,
    itemType: '71444',
  },
]

const modelB = {
  id: '71444',
  name: 'Model B',
  singleton: false,
  sortable: false,
  apiKey: 'model_b',
  orderingDirection: null,
  tree: false,
  modularBlock: false,
  draftModeActive: false,
  allLocalesRequired: true,
  collectionAppeareance: 'table',
  hasSingletonItem: false,
  singletonItem: null,
  fields: fieldsB,
  titleField: '282158',
  orderingField: null,
}

module.exports = {
  modelsResponse,
  fieldsAResponse,
  fieldsBResponse,
  modelA,
  modelB,
  fieldsA,
  fieldsB,
}
