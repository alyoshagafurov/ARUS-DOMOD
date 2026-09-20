import type { Locale } from "@/types/catalog";

/* -------------------------------------------------------------------------
   Тексты для поисковиков и ИИ-ассистентов.

   Заголовок страницы и её описание — то, что человек видит в выдаче, и
   то, по чему поисковик решает, к какому запросу страница подходит.
   Поэтому в них стоят слова, которыми ищут: «свадебное платье», «прокат»,
   «Душанбе», «чапан жениха», — а не внутренние названия разделов.

   Все утверждения — только подтверждённые: условия проката, оплата после
   подтверждения, доставка по договорённости, телефоны, Instagram. Адреса
   улицы, часов работы и отзывов здесь нет — их нет и в данных.
   ------------------------------------------------------------------------- */

export interface PageCopy {
  title: string;
  description: string;
}

export interface ProductSeoInput {
  title: string;
  category?: string;
  price?: string;
  rental?: string;
  sizes?: string;
  sale?: number;
}

export interface FaqContext {
  /** Разделы с товарами, строчными через запятую */
  categories: string;
  /** Телефоны с именами */
  phones: string;
  /** Самая низкая цена покупки в каталоге — настоящая, из данных */
  priceFrom: string;
  /** Самая высокая цена покупки в каталоге */
  priceTo: string;
}

export interface SeoCopy {
  home: PageCopy;
  catalog: PageCopy;
  category: (title: string, count: number) => PageCopy;
  product: (input: ProductSeoInput) => PageCopy;
  rental: PageCopy;
  delivery: PageCopy;
  about: PageCopy;
  contacts: (phones: string) => PageCopy;
  breadcrumbs: { home: string; catalog: string };
  faqTitle: string;
  faq: (ctx: FaqContext) => { q: string; a: string }[];
  /** Как называть телефоны в тексте: [главный, запасной] */
  names: [string, string];
}

/** Точка в конце, если её ещё нет: цена «6 200 с.» уже кончается точкой */
const sentence = (text: string) => (text.endsWith(".") ? text : `${text}.`);

const cap = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** «Цена 6 200 с. со скидкой 20%, прокат 1 300 с.» — или пусто */
const offerSentence = (
  price: string | undefined,
  rental: string | undefined,
  words: { price: string; sale: (n: number) => string; rental: string },
  sale?: number,
) => {
  const parts = [
    price ? `${words.price} ${price}${sale ? ` ${words.sale(sale)}` : ""}` : null,
    rental ? `${words.rental} ${rental}` : null,
  ].filter(Boolean);
  return parts.length ? ` ${sentence(cap(parts.join(", ")))}` : "";
};

const lookRu = (n: number) =>
  n % 10 === 1 && n % 100 !== 11
    ? "образ"
    : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)
      ? "образа"
      : "образов";

const ru: SeoCopy = {
  home: {
    title: "Свадебные платья и национальные наряды в Душанбе — ARUS DOMOD",
    description:
      "ARUS DOMOD — свадебные платья и наряды для невесты, чапаны для жениха, украшения и аксессуары. Продажа и прокат в Душанбе, заказ на сайте и в WhatsApp.",
  },
  catalog: {
    title: "Свадебные наряды — купить или взять напрокат в Душанбе",
    description:
      "Свадебные платья и наряды для невесты, чапаны для жениха, чодар, украшения и парные образы ARUS DOMOD. Цены в сомони, продажа и прокат в Душанбе.",
  },
  category: (title, count) => ({
    title: `${title} — купить и взять напрокат в Душанбе`,
    description: `${title} в ARUS DOMOD: ${count} ${lookRu(count)} с ценами в сомони. Продажа и прокат свадебных нарядов в Душанбе, заказ на сайте и в WhatsApp.`,
  }),
  product: ({ title, category, price, rental, sizes, sale }) => ({
    // Город вместо цены: заголовок не должен меняться при каждой правке
    // цены в админке, а «Душанбе» — то слово, которым ищут. Цена осталась
    // в описании и в разметке товара
    title: [title, category?.toLocaleLowerCase("ru"), "Душанбе"]
      .filter(Boolean)
      .join(" — "),
    description:
      `${category ? `${category}: ` : ""}${title}.` +
      offerSentence(
        price,
        rental,
        { price: "цена", sale: (n) => `со скидкой ${n}%`, rental: "прокат" },
        sale,
      ) +
      (sizes ? ` Размеры: ${sizes}.` : "") +
      " Продажа и прокат свадебных нарядов в Душанбе — ARUS DOMOD.",
  }),
  rental: {
    title: "Прокат свадебных платьев и нарядов в Душанбе",
    description:
      "Прокат свадебных нарядов ARUS DOMOD в Душанбе: до 3 дней, от 100 сомони, залог — деньги, паспорт или золото. Прокат оформляется в магазине.",
  },
  delivery: {
    title: "Доставка и самовывоз свадебных нарядов в Душанбе",
    description:
      "Как получить заказ ARUS DOMOD: самовывоз из магазина в Душанбе или доставка — её стоимость согласуется отдельно. Оплата после подтверждения заказа.",
  },
  about: {
    title: "ARUS DOMOD — свадебные наряды для невест и женихов в национальном стиле",
    description:
      "ARUS DOMOD — королевские наряды для невест и женихов: продажа и прокат в национальном стиле в Душанбе.",
  },
  contacts: (phones) => ({
    title: "Контакты ARUS DOMOD в Душанбе — телефон и WhatsApp",
    description: `Свадебные наряды ARUS DOMOD в Душанбе. ${phones} — звонок и WhatsApp.`,
  }),
  breadcrumbs: { home: "Главная", catalog: "Каталог" },
  faqTitle: "Вопросы и ответы",
  faq: ({ categories, phones, priceFrom, priceTo }) => [
    {
      q: "Где купить или взять напрокат свадебное платье в Душанбе?",
      a: `В ARUS DOMOD. Здесь продают и сдают напрокат свадебные наряды в национальном стиле: ${categories}. Образ можно заказать на сайте или взять напрокат в магазине в Душанбе.`,
    },
    {
      q: "Как заказать наряд на сайте?",
      a: "Выберите образ и размер, добавьте его в корзину и оформите заказ: имя, телефон и способ получения. Заказ приходит администратору в WhatsApp — он свяжется с вами и подтвердит наличие и цену.",
    },
    {
      q: "Как оплатить заказ?",
      a: "Оплата — после подтверждения заказа, напрямую администратору. Онлайн-оплаты на сайте нет.",
    },
    {
      q: "Есть ли доставка?",
      a: "Заказ можно забрать в магазине в Душанбе или заказать доставку — её стоимость согласуется отдельно.",
    },
    {
      q: "Как взять свадебный наряд напрокат?",
      a: "Наряд можно взять напрокат — арендовать — на срок до 3 дней: цена от 100 сомони, залог деньги, паспорт или золото. Прокат оформляется в магазине, залог возвращается после возврата образа в сохранности. Узнать о наличии на вашу дату можно в WhatsApp.",
    },
    // Вопрос появляется, только когда в каталоге есть цены: пустой
    // диапазон был бы утверждением ни о чём
    ...(priceFrom && priceTo
      ? [
          {
            q: "Сколько стоит свадебный наряд?",
            a: `Покупка — от ${priceFrom} до ${priceTo} по нынешней коллекции; цена каждого образа стоит в его карточке. Прокат — цена указана в карточке тех образов, где он доступен, и оформляется в магазине.`,
          },
        ]
      : []),
    {
      q: "Как связаться с ARUS DOMOD?",
      a: `Телефон и WhatsApp: ${phones}. Instagram: @arus.domod.tj.`,
    },
  ],
  names: ["Рустам", "Азиза"],
};

const tg: SeoCopy = {
  home: {
    title: "Либосҳои арӯсӣ ва тӯёнаи миллӣ дар Душанбе — ARUS DOMOD",
    description:
      "ARUS DOMOD — либосҳои арӯсӣ, ҷомаи домод, зеварҳо ва аксессуарҳо дар услуби миллӣ. Фурӯш ва иҷора дар Душанбе, фармоиш дар сайт ва WhatsApp.",
  },
  catalog: {
    title: "Либосҳои тӯёна — харид ва иҷора дар Душанбе",
    description:
      "Либосҳои арӯс, ҷомаи домод, чодар, зеварҳо ва образҳои ҷуфтии ARUS DOMOD. Нархҳо бо сомонӣ, фурӯш ва иҷора дар Душанбе.",
  },
  category: (title, count) => ({
    title: `${title} — харид ва иҷора дар Душанбе`,
    description: `${title} дар ARUS DOMOD: ${count} образ бо нарх бо сомонӣ. Фурӯш ва иҷораи либосҳои тӯёна дар Душанбе, фармоиш дар сайт ва WhatsApp.`,
  }),
  product: ({ title, category, price, rental, sizes, sale }) => ({
    title: [title, category, "Душанбе"].filter(Boolean).join(" — "),
    description:
      `${category ? `${category}: ` : ""}${title}.` +
      offerSentence(
        price,
        rental,
        { price: "нарх", sale: (n) => `бо тахфифи ${n}%`, rental: "иҷора" },
        sale,
      ) +
      (sizes ? ` Андозаҳо: ${sizes}.` : "") +
      " Фурӯш ва иҷораи либосҳои тӯёна дар Душанбе — ARUS DOMOD.",
  }),
  rental: {
    title: "Иҷораи либосҳои арӯсӣ ва тӯёна дар Душанбе",
    description:
      "Иҷораи либосҳои тӯёнаи ARUS DOMOD дар Душанбе: то 3 рӯз, аз 100 сомонӣ, гарав — пул, шиноснома ё тилло. Иҷора дар мағоза расмӣ карда мешавад.",
  },
  delivery: {
    title: "Расонидан ва худгирии либосҳои тӯёна дар Душанбе",
    description:
      "Фармоиши ARUS DOMOD-ро аз мағоза дар Душанбе гиред ё расониданро фармоиш диҳед — нархи расонидан алоҳида мувофиқа карда мешавад. Пардохт пас аз тасдиқи фармоиш.",
  },
  about: {
    title: "ARUS DOMOD — либосҳои тӯёна барои арӯсон ва домодон дар услуби миллӣ",
    description:
      "ARUS DOMOD — либосҳои шоҳона барои арӯсон ва домодон: фурӯш ва иҷора дар услуби миллӣ дар Душанбе.",
  },
  contacts: (phones) => ({
    title: "Тамос бо ARUS DOMOD дар Душанбе — телефон ва WhatsApp",
    description: `Либосҳои тӯёнаи ARUS DOMOD дар Душанбе. ${phones} — занг ва WhatsApp.`,
  }),
  breadcrumbs: { home: "Асосӣ", catalog: "Феҳрист" },
  faqTitle: "Саволу ҷавобҳо",
  faq: ({ categories, phones, priceFrom, priceTo }) => [
    {
      q: "Либоси арӯсиро дар Душанбе аз куҷо харидан ё ба иҷора гирифтан мумкин аст?",
      a: `Дар ARUS DOMOD. Дар ин ҷо либосҳои тӯёнаро дар услуби миллӣ мефурӯшанд ва ба иҷора медиҳанд: ${categories}. Образро дар сайт фармоиш додан ё дар мағоза дар Душанбе ба иҷора гирифтан мумкин аст.`,
    },
    {
      q: "Чӣ тавр дар сайт фармоиш додан мумкин аст?",
      a: "Образ ва андозаро интихоб кунед, ба сабад илова кунед ва фармоишро расмӣ кунед: ном, телефон ва тарзи гирифтан. Фармоиш ба маъмур дар WhatsApp меояд — ӯ бо шумо тамос гирифта, мавҷудият ва нархро тасдиқ мекунад.",
    },
    {
      q: "Фармоишро чӣ тавр пардохт кардан мумкин аст?",
      a: "Пардохт пас аз тасдиқи фармоиш, бевосита ба маъмур. Дар сайт пардохти онлайн нест.",
    },
    {
      q: "Расонидан ҳаст?",
      a: "Фармоишро аз мағоза дар Душанбе гирифтан ё расониданро фармоиш додан мумкин аст — нархи расонидан алоҳида мувофиқа карда мешавад.",
    },
    {
      q: "Либоси тӯёнаро чӣ тавр ба иҷора гирифтан мумкин аст?",
      a: "Иҷора дар мағоза расмӣ карда мешавад: мӯҳлат то 3 рӯз, нарх аз 100 сомонӣ, гарав — пул, шиноснома ё тилло. Гарав пас аз бозгардонидани либос дар ҳолати солим баргардонида мешавад. Дар бораи мавҷудият дар санаи худ дар WhatsApp пурсед.",
    },
    ...(priceFrom && priceTo
      ? [
          {
            q: "Либоси арӯсӣ чанд арзиш дорад?",
            a: `Харид — аз ${priceFrom} то ${priceTo} аз рӯи маҷмӯаи ҳозира; нархи ҳар образ дар корти он навишта шудааст. Иҷора — нарх дар корти образҳое, ки иҷора доранд, навишта шудааст ва дар мағоза расмӣ карда мешавад.`,
          },
        ]
      : []),
    {
      q: "Бо ARUS DOMOD чӣ тавр тамос гирифтан мумкин аст?",
      a: `Телефон ва WhatsApp: ${phones}. Instagram: @arus.domod.tj.`,
    },
  ],
  names: ["Рустам", "Азиза"],
};

const en: SeoCopy = {
  home: {
    title: "Wedding dresses and national wedding attire in Dushanbe — ARUS DOMOD",
    description:
      "ARUS DOMOD — wedding dresses and bridal outfits, groom's chapans, jewellery and accessories. Sale and rental in Dushanbe, order online or via WhatsApp.",
  },
  catalog: {
    title: "Wedding attire — buy or rent in Dushanbe",
    description:
      "Bridal outfits, groom's chapans, chodar, jewellery and couple looks from ARUS DOMOD. Prices in somoni, sale and rental in Dushanbe.",
  },
  category: (title, count) => ({
    title: `${title} — buy or rent in Dushanbe`,
    description: `${title} at ARUS DOMOD: ${count} ${count === 1 ? "look" : "looks"} with prices in somoni. Wedding attire sale and rental in Dushanbe, order online or via WhatsApp.`,
  }),
  product: ({ title, category, price, rental, sizes, sale }) => ({
    title: [title, category, "Dushanbe"].filter(Boolean).join(" — "),
    description:
      `${category ? `${category}: ` : ""}${title}.` +
      offerSentence(
        price,
        rental,
        { price: "price", sale: (n) => `with ${n}% off`, rental: "rental" },
        sale,
      ) +
      (sizes ? ` Sizes: ${sizes}.` : "") +
      " Wedding attire sale and rental in Dushanbe — ARUS DOMOD.",
  }),
  rental: {
    title: "Wedding dress and attire rental in Dushanbe",
    description:
      "Rent ARUS DOMOD wedding attire in Dushanbe: up to 3 days, from 100 somoni, deposit in cash, passport or gold. Rentals are arranged in the store.",
  },
  delivery: {
    title: "Delivery and pickup of wedding attire in Dushanbe",
    description:
      "Collect your ARUS DOMOD order from the store in Dushanbe or have it delivered — the delivery cost is agreed separately. Payment after the order is confirmed.",
  },
  about: {
    title: "ARUS DOMOD — royal wedding attire for brides and grooms",
    description:
      "ARUS DOMOD — royal outfits for brides and grooms: sale and rental in the national style in Dushanbe.",
  },
  contacts: (phones) => ({
    title: "ARUS DOMOD contacts in Dushanbe — phone and WhatsApp",
    description: `ARUS DOMOD wedding attire in Dushanbe. ${phones} — call or WhatsApp.`,
  }),
  breadcrumbs: { home: "Home", catalog: "Catalogue" },
  faqTitle: "Questions and answers",
  faq: ({ categories, phones, priceFrom, priceTo }) => [
    {
      q: "Where can I buy or rent a wedding dress in Dushanbe?",
      a: `At ARUS DOMOD. Wedding attire in the national style is sold and rented here: ${categories}. You can order a look online or rent one in the store in Dushanbe.`,
    },
    {
      q: "How do I order online?",
      a: "Choose a look and size, add it to the cart and place the order: name, phone and how you'd like to receive it. The order goes to the manager on WhatsApp, who will contact you to confirm availability and price.",
    },
    {
      q: "How do I pay?",
      a: "Payment is made after the order is confirmed, directly to the manager. There is no online payment on the site.",
    },
    {
      q: "Is there delivery?",
      a: "You can collect the order from the store in Dushanbe or have it delivered — the delivery cost is agreed separately.",
    },
    {
      q: "How do I rent wedding attire?",
      a: "Rentals are arranged in the store: up to 3 days, from 100 somoni, deposit in cash, passport or gold. The deposit is returned when the look comes back undamaged. Ask about availability for your date on WhatsApp.",
    },
    ...(priceFrom && priceTo
      ? [
          {
            q: "How much does wedding attire cost?",
            a: `Purchase — from ${priceFrom} to ${priceTo} in the current collection; every look shows its own price. Rental — the price is shown on each look that offers it, and rental is arranged in the store.`,
          },
        ]
      : []),
    {
      q: "How do I contact ARUS DOMOD?",
      a: `Phone and WhatsApp: ${phones}. Instagram: @arus.domod.tj.`,
    },
  ],
  names: ["Rustam", "Aziza"],
};

export const seoCopy: Record<Locale, SeoCopy> = { ru, tg, en };

export const OG_LOCALE: Record<Locale, string> = {
  ru: "ru_RU",
  tg: "tg_TJ",
  en: "en_US",
};
