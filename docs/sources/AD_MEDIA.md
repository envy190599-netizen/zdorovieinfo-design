# Демонстрационные рекламные ресурсы

Размещения — демонстрационные. Каталог источников находится в site-components.js (adCreatives), управление слотами — ad-rail.js.

| Креатив | Поставка и источник |
| --- | --- |
| ZEEKR 001 | Локальные desktop/mobile MP4 и JPG в assets/ads/; страница https://www.zeekr.eu/models/001 |
| ARAVIA | Локальные aravia-desktop.webp 1920×750 и aravia-mobile.webp 694×1000; https://aravia.ru/ |
| Энтеросгель | Внешний MP4: https://www.enterosgel.ru/upload/iblock/ae7/422mvzvdehhk8zsx5uoka0uvoj0vcr4k.mp4 |
| Билайн | Внешний MP4: https://st.fl.ru/users/mi/mikhailbektyash/portfolio/f_735695240f42a561.mp4 ; источник https://www.fl.ru/user/mikhailbektyash/portfolio/8000479/ |
| Агуша | Внешний MP4: https://st.fl.ru/users/mi/mikhailbektyash/portfolio/f_780695241eb6b21d.mp4 ; источник https://www.fl.ru/user/mikhailbektyash/portfolio/8000482/ |

Исходные ARAVIA: https://aravia.ru/upload/dev2fun.imagecompress/webp/iblock/48f/azyd4aptjs1jjzmjb10rp3kznw1hhdeh.webp и https://aravia.ru/upload/dev2fun.imagecompress/webp/resize_cache/iblock/b1f/1000_1000_1/y14j70fh7y0g6o1cupo1g2i8xu3rtad4.webp .

Сохранять пропорции и полностью заполнять выделенный фрейм с допустимым кропом; не растягивать изображение. Служебные поля исходного видео отсекаются по crop в каталоге. На малых экранах текущие рекламные размещения скрыты стилями. Доступность внешних роликов зависит от провайдера и блокировщиков, локальных копий этих трёх роликов в поставке нет.

Открывающая реклама закрывается кнопкой и Escape, управляет фокусом и воспроизведением. Боковые ролики ротируются, неактивные приостанавливаются. Точные интервалы и размеры — в ad-rail.js и CSS.
