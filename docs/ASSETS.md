# Исходники

| Ресурс | Расположение |
| --- | --- |
| Макеты, компоненты и состояния | [Figma ZI-DEV](https://www.figma.com/design/vMQvJr6wdwZi8tHPxZBa4q/ZI-DEV) |
| Логотип и интерфейсные SVG | `prototype-mobile/assets/figma/`, `prototype-mobile/assets/icons/`; встроенные SVG — в `site-components.js` и HTML |
| Социальные SVG | `prototype-mobile/assets/local/{max,telegram,dzen,youtube,vk,ok}.svg`; оригиналы — `design-assets/brand/social-monochrome/` |
| 3D-иконки тем | `prototype-mobile/assets/local/navigation-3d-v2/`; исходные листы и координаты — `design-assets/icons/navigation-3d-v2/` |
| Montserrat | `prototype-mobile/assets/figma/Montserrat-Variable.woff2`; TTF для редактора — `design-assets/fonts/` |
| Фотографии, обложки, инфографики, видео | `prototype-mobile/assets/`; дополнительные исходники — `design-assets/content/`, `design-assets/generated/`, `design-assets/stock/`, `design-assets/patterns/` |
| Фавиконка | `prototype-mobile/favicon.svg`, `favicon.ico` (16/32/48px), `favicon-32.png`, `apple-touch-icon.png` (180px); [компонент favicon](https://www.figma.com/design/vMQvJr6wdwZi8tHPxZBa4q/ZI-DEV?node-id=156-6709) |

Имена компонентов иконок в Figma совпадают с именами соответствующих файлов без расширения. SVG сохранять векторными; в Figma использовать связанные экземпляры. 3D-иконки — растровые иллюстрации с прозрачностью, векторных оригиналов у них нет. Фотографии передаются в доступном рабочем формате; для части обложек это WebP.

Авторство и оригиналы: [стоковые изображения](../design-assets/stock/ATTRIBUTION.md), [обложки инфографик](../design-assets/stock/infographic-covers/sources.json), [социальные иконки](sources/SOCIAL_ICONS.md), [рекламные материалы](sources/AD_MEDIA.md). Соседние с ресурсами `SOURCE.md` и `sources.json` содержат сведения об их происхождении. Источник обложки и источник самой инфографики указаны отдельно.

Иконки шапки из исходного ZI-2.0, Icons / 24: [Menu](https://www.figma.com/design/7oW76tGV51F5g4XOMvQFHd/ZI-2.0?node-id=4039-12035), [X](https://www.figma.com/design/7oW76tGV51F5g4XOMvQFHd/ZI-2.0?node-id=4039-12622), [Search](https://www.figma.com/design/7oW76tGV51F5g4XOMvQFHd/ZI-2.0?node-id=4039-12553). Точные SVG-экспорты — prototype-mobile/assets/icons/{menu,close,search}.svg. Цвет на сайте задаётся маской из общего токена #137DB8.
