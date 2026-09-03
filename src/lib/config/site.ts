/**
 * Константы бренда ARUS DOMOD.
 *
 * Здесь только подтверждённые данные — те, что клиент передал или которые
 * есть в его публичном профиле. Адрес, часы работы, услуги (примерка,
 * пошив, доставка) НЕ придумываются: чего нет в этом файле, того нет и в
 * интерфейсе.
 */
export const site = {
  name: "ARUS DOMOD",
  /** Как бренд подписан в профиле */
  handle: "arus.domod.tj",
  /** Формулировки из профиля — используются дословно */
  tagline: "Королевские наряды для невест и женихов",
  positioning: "Продажа и прокат в национальном стиле",
  role: "Деятель искусства",
  description:
    "ARUS DOMOD — свадебные наряды для невест и женихов, продажа и прокат в национальном стиле.",
  locale: "ru" as const,
  city: "Душанбе",
  url: "https://arusdomod.tj", // TODO: подтвердить домен у клиента
} as const;

/**
 * Контакты для заказов. Основной канал уведомления о заказе — WhatsApp
 * Азизы; Рустам — дополнительный. Оба номера переданы клиентом.
 */
export const contact = {
  phone: "+992949731111",
  phoneDisplay: "+992 94 973 11 11",
  phoneName: "Азиза",
  phoneSecondary: "+992907666000",
  phoneSecondaryDisplay: "+992 90 766 60 00",
  phoneSecondaryName: "Рустам",
} as const;

/**
 * Условия проката — переданы клиентом дословно. Прокат через сайт НЕ
 * оформляется: клиент смотрит цену и условия, а договор заключает в магазине.
 */
export const rental = {
  maxDays: 3,
  priceFromMinor: 10000, // от 100 сомони
  depositKinds: ["деньги", "паспорт", "золото"],
  inStoreOnly: true,
  noDelivery: true,
} as const;

/**
 * Демонстрационные данные каталога.
 *
 * Названия образов, цены, размеры и наличие сейчас синтетические. Флаг
 * существует, чтобы отключить пометку одной строкой, когда придут настоящие
 * данные, — искать её по компонентам не придётся.
 */
export const isDemoData = true;

export interface NavLink {
  href: string;
  /** Русская подпись — запасная; интерфейс берёт перевод по `key` */
  label: string;
  /** Ключ в словаре nav — по нему пункт переводится на tg/en */
  key?: NavKey;
  labelTg?: string;
  /** Внешняя ссылка открывается в новой вкладке */
  external?: boolean;
}

export type NavKey =
  | "catalog"
  | "bride"
  | "groom"
  | "jewelry"
  | "rental"
  | "about"
  | "delivery"
  | "contacts"
  | "favorites"
  | "cart";

/** В навигации стоят только существующие маршруты. */
export const primaryNav: NavLink[] = [
  { href: "/catalog", label: "Коллекции", key: "catalog" },
  { href: "/catalog/arus", label: "Невесте", key: "bride", labelTg: "Арӯс" },
  { href: "/catalog/domod", label: "Жениху", key: "groom", labelTg: "Домод" },
  { href: "/rental", label: "Прокат", key: "rental" },
  { href: "/about", label: "О нас", key: "about" },
  { href: "/contacts", label: "Контакты", key: "contacts" },
];

export const utilityNav: NavLink[] = [
  { href: "/favorites", label: "Избранное", key: "favorites" },
  { href: "/cart", label: "Корзина", key: "cart" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Коллекция",
    links: [
      { href: "/catalog", label: "Все образы" },
      { href: "/catalog/arus", label: "Наряды для невесты" },
      { href: "/catalog/domod", label: "Чапаны для жениха" },
      { href: "/catalog/zewar", label: "Украшения" },
      { href: "/favorites", label: "Избранное" },
    ],
  },
  {
    title: "Дом",
    links: [
      { href: "/about", label: "О нас", key: "about" },
      { href: "/rental", label: "Прокат", key: "rental" },
      { href: "/delivery", label: "Доставка и получение", key: "delivery" },
      { href: "/contacts", label: "Контакты", key: "contacts" },
    ],
  },
];

/** Реальные аккаунты. Telegram не указан: подтверждённого адреса нет. */
export const socialLinks: NavLink[] = [
  {
    href: "https://www.instagram.com/arus.domod.tj/",
    label: "Instagram",
    external: true,
  },
  {
    href: "https://www.youtube.com/channel/UCamxLW5LSz5BNz77w25MR5Q",
    label: "YouTube",
    external: true,
  },
];
