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

/** Телефон: одна строка для набора, одна для показа */
export const contact = {
  phone: "+992949731111",
  phoneDisplay: "+992 94 973 11 11",
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
  label: string;
  labelTg?: string;
  /** Внешняя ссылка открывается в новой вкладке */
  external?: boolean;
}

export const primaryNav: NavLink[] = [
  { href: "/catalog", label: "Коллекции" },
  { href: "/catalog/libos", label: "Платья", labelTg: "Либос" },
  { href: "/catalog/zewar", label: "Украшения", labelTg: "Зевар" },
  { href: "/catalog/lavozimot", label: "Аксессуары", labelTg: "Лавозимот" },
  { href: "/about", label: "О бренде" },
];

export const utilityNav: NavLink[] = [
  { href: "/favorites", label: "Избранное" },
  { href: "/cart", label: "Корзина" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Коллекция",
    links: [
      { href: "/catalog", label: "Все образы" },
      { href: "/catalog/libos", label: "Платья" },
      { href: "/catalog/zewar", label: "Украшения" },
      { href: "/catalog/lavozimot", label: "Аксессуары" },
    ],
  },
  {
    title: "Дом",
    links: [
      { href: "/about", label: "О бренде" },
      { href: "/contacts", label: "Контакты" },
      { href: "/favorites", label: "Избранное" },
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
