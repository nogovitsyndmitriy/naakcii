#language: ru
Функция: Плавная подгрузка карточек товаров на странице формирования списка покупок
  Как покупатель ищущий экономию
  Я хочу просматривать список акционных товаров на одной странице без листания а с плавной подгрузкой
  Чтобы иметь возможность удобно сравнивать товары между собой

  Предыстория:
    Допустим я на странице "Формирование списка покупок – naakcii.by"
    И на фильтре "Торговые сети" отображается текст "Выбраны торговые сети: 3"
    И на панели "Список акционных товаров" отображаются следующие карточки товаров:
      | акционный_товар                                                                         | торговая_сеть |
      | Йогурт "Оптималь" Персик, Чернослив-злаки, Черника-Малина 2% жирность 350гр             | Белмаркет     |
      | Йогурт Савушкин 2%, 120г                                                                | Виталюр       |
      | Йогурт питьевой "Теос" 300г                                                             | Соседи        |
      | Кефир "Берёзка" 1,5% 950г                                                               | Соседи        |
      | Кефир "Минская Марка" 1.5% 900гр.                                                       | Белмаркет     |
      | Коктейль йогуртный "Даниссимо" 260г                                                     | Соседи        |
      | Продукт йогуртный "Нежный" 95г                                                          | Соседи        |
      | Продукт йогуртный Нежный с пюре 0,1%, 100г клубника/яблоко/абрикос                      | Виталюр       |
      | Продукт кисломолочный "Экспонента" 100г                                                 | Соседи        |
      | Масло сливочное "Nadivo" 72.5% 180г                                                     | Белмаркет     |
      | Масло сливочное "Крестьянское" 72,5% 180г                                               | Соседи        |
      | Молоко "Берёзка" 1,5% 950мл                                                             | Соседи        |

  Сценарий: Прокрутка страницы на один экран вниз
    Если я нажимаю клавишу "End"
    То на панели "Список акционных товаров" должны плавно подгрузиться следующие карточки товаров:
      | акционный_товар                                                                         | торговая_сеть |
      | Молоко питьевое "Бабушкина Крынка" стерилиз. 1.5% 1л                                    | Белмаркет     |
      | Мороженное пломбир "Семейное" 230г                                                      | Соседи        |
      | Био сметана "Простоквашино" 15% 350гр                                                   | Белмаркет     |
      | Сыр "Великокняжеский" 46% 1кг                                                           | Белмаркет     |
      | Сыр "Йогуртовый" 50% 200г "Берёзовский СК"                                              | Соседи        |
      | Сыр "Лазур Голубой" с плесенью 50% 100г                                                 | Соседи        |

  Сценарий: Прокрутка страницы до конца
    Если я прокручиваю страницу до конца
    То на панели "Список акционных товаров" должны отобразиться следующие карточки товаров:
      | акционный_товар                                                                         | торговая_сеть |
      | Йогурт "Оптималь" Персик, Чернослив-злаки, Черника-Малина 2% жирность 350гр             | Белмаркет     |
      | Йогурт Савушкин 2%, 120г                                                                | Виталюр       |
      | Йогурт питьевой "Теос" 300г                                                             | Соседи        |
      | Кефир "Берёзка" 1,5% 950г                                                               | Соседи        |
      | Кефир "Минская Марка" 1.5% 900гр.                                                       | Белмаркет     |
      | Коктейль йогуртный "Даниссимо" 260г                                                     | Соседи        |
      | Продукт йогуртный "Нежный" 95г                                                          | Соседи        |
      | Продукт йогуртный Нежный с пюре 0,1%, 100г клубника/яблоко/абрикос                      | Виталюр       |
      | Продукт кисломолочный "Экспонента" 100г                                                 | Соседи        |
      | Масло сливочное "Nadivo" 72.5% 180г                                                     | Белмаркет     |
      | Масло сливочное "Крестьянское" 72,5% 180г                                               | Соседи        |
      | Молоко "Берёзка" 1,5% 950мл                                                             | Соседи        |
      | Молоко питьевое "Бабушкина Крынка" стерилиз. 1.5% 1л                                    | Белмаркет     |
      | Мороженное пломбир "Семейное" 230г                                                      | Соседи        |
      | Био сметана "Простоквашино" 15% 350гр                                                   | Белмаркет     |
      | Сыр "Великокняжеский" 46% 1кг                                                           | Белмаркет     |
      | Сыр "Йогуртовый" 50% 200г "Берёзовский СК"                                              | Соседи        |
      | Сыр "Лазур Голубой" с плесенью 50% 100г                                                 | Соседи        |
      | Сыр "Российский Особый" 1кг                                                             | Белмаркет     |
      | Сыр "Сливочный" 50% 1кг                                                                 | Белмаркет     |
      | Сыр "Сметанковый" 50% 1кг "Берёзовский СК"                                              | Соседи        |
      | Сыр плавленный "Президетн" 40% 150г                                                     | Соседи        |
      | Сыр полутвердый Брест-Литовск сливочный 50%, 150г                                       | Виталюр       |
      | Сыр рассольный Аристель "Брынза" 45% 250гр                                              | Белмаркет     |
      | Сырок глазированный "Белая Хатка" мол.сг.варен.\аромат ванили 20% 40гр.                 | Белмаркет     |
      | Сырок глазированный "Белорусский" 50г                                                   | Соседи        |
      | Сырок глазированный Молочная страна ванилин 5%, 45г                                     | Виталюр       |
      | Творог "Простоквашино" 9% 355гр.                                                        | Белмаркет     |
      | Творог Славянские традиции 5%, 355г                                                     | Виталюр       |
      | Яйцо куриное "С-1" 10шт                                                                 | Соседи        |
