export default {
  translation: {
    stylelint: {
      'property-disallowed-list': 'Файл: `{{ fileName }}`, строка: {{ line }}. Свойство `overflow` и его производные использовать нельзя',
    },
    bodyTagsMissing: 'Внутри <body> отсутствуют обязательные теги: `{{ names }}`.',
    bodyTagsExtra: 'Внутри <body> не должно быть тегов: `{{ names }}`.',
    metaTagsMissing: 'Отсутствуют метатеги: `{{ names }}`.',
    faviconsMissing: 'Отсутствуют фавиконы в форматах: `{{ names }}`.',
    mobileFaviconMissing: 'Иконка для мобильных устройств не подключена',
    videoAttributesMissing: 'Видео должно содержать атрибуты: `{{ names }}`.',
    videoAttributesExtra: 'У видео должны отсутствовать атрибуты: `{{ names }}`.',
    countPseudoElements: 'Должны быть реализованы три псевдоэлемента: вуаль, звёздочка у заголовка, всплывающий тултип.',
    elementProperties: 'У элемента `{{ name }}` должны присутствовать стили: `{{ properties }}`.',
  },
};
