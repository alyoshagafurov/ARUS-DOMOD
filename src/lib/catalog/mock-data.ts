import { photo, type PhotoSlug } from "@/lib/photos";
import type {
  Availability,
  Category,
  Collection,
  Product,
  ProductOffer,
} from "@/types/catalog";

/* =========================================================================
   ДЕМОНСТРАЦИОННЫЕ ДАННЫЕ КАТАЛОГА.

   Здесь НЕТ настоящих сведений о товарах. Фотографии настоящие — это съёмка
   ARUS DOMOD; всё остальное синтетическое:

     • названия — нумерация образов, а не имена изделий;
     • цены, сроки проката и залоги — вымышленные;
     • размеры и наличие — вымышленные;
     • состав ткани, техника вышивки и происхождение НЕ указаны вовсе.

   Так сделано намеренно. Определять по фотографии, что перед нами чакан,
   атлас или адрас, и записывать это в карточку товара — значит выдавать
   догадку за факт о чужом изделии. Пока ателье не передаст настоящие
   описания, каталог показывает образ и его номер.

   Заменяется одним файлом: структура ниже уже совпадает с контрактом
   Product, менять UI при подключении реальных данных не потребуется.
   ========================================================================= */

export const collections: Collection[] = [
  {
    id: "col-01",
    slug: "collection-01",
    title: "Коллекция 01",
    subtitle: "Съёмка сезона",
  },
];

/**
 * Категории — по списку, переданному клиентом. Две из них («Тюбетейки»,
 * «Свадебные туры») пока без товаров и без съёмки: на витрине раздел без
 * товаров не показывается, а плитка без кадра получает тканую плиту.
 */
export const categories: Category[] = [
  {
    id: "cat-arus",
    slug: "arus",
    title: "Наряды для невесты",
    titleTg: "Либоси арӯс",
    description: "Свадебные платья и полные образы невесты.",
    image: photo("cat-arus", "Образ невесты из коллекции ARUS DOMOD"),
    order: 1,
  },
  {
    id: "cat-domod",
    slug: "domod",
    title: "Чапаны для жениха",
    titleTg: "Ҷомаи домод",
    description: "Образы жениха.",
    image: photo("cat-domod", "Образ жениха из коллекции ARUS DOMOD"),
    order: 2,
  },
  {
    id: "cat-zewar",
    slug: "zewar",
    title: "Украшения",
    titleTg: "Зевар",
    description: "Комплекты украшений к образу.",
    image: photo("cat-zewar", "Украшения из коллекции ARUS DOMOD"),
    order: 3,
  },
  {
    id: "cat-toqi",
    slug: "toqi",
    title: "Тюбетейки",
    titleTg: "Тоқӣ",
    description: "Головные уборы.",
    order: 4,
  },
  {
    id: "cat-tur",
    slug: "tur",
    title: "Свадебные туры",
    titleTg: "Сафари тӯёна",
    description: "Свадебные туры и программы.",
    order: 5,
  },
  {
    id: "cat-tuy",
    slug: "tuy",
    title: "Парные образы",
    titleTg: "Ҷуфти тӯй",
    description: "Согласованные образы невесты и жениха.",
    image: photo("cat-tuy", "Парный образ из коллекции ARUS DOMOD"),
    order: 6,
  },
  {
    id: "cat-lavozimot",
    slug: "lavozimot",
    title: "Другие аксессуары",
    titleTg: "Лавозимот",
    description: "Дополнения к образу и свадебные товары.",
    image: photo("cat-lavozimot", "Аксессуар из коллекции ARUS DOMOD"),
    order: 7,
  },
];

/**
 * Компактная таблица вместо двадцати развёрнутых объектов: так сразу видно,
 * что данные синтетические, и так их проще выкинуть целиком.
 *
 * Цены — в дирамах (1 сомонӣ = 100 дирамов).
 */
interface LookSeed {
  n: number;
  category: string;
  /** Сколько кадров этого образа есть в съёмке: 1 или 2 */
  frames: 1 | 2;
  purchase?: number;
  compareAt?: number;
  /** [цена проката, срок в днях] */
  rental?: [number, number];
  sizes?: string[];
  availability: Availability;
}

const seeds: LookSeed[] = [
  {
    n: 1,
    category: "arus",
    frames: 2,
    purchase: 890000,
    rental: [180000, 3],
    sizes: ["38", "40", "42"],
    availability: "in_stock",
  },
  {
    n: 2,
    category: "arus",
    frames: 2,
    purchase: 620000,
    rental: [130000, 3],
    sizes: ["38", "40", "42", "44"],
    availability: "in_stock",
  },
  {
    n: 3,
    category: "arus",
    frames: 2,
    purchase: 740000,
    compareAt: 920000,
    sizes: ["40", "42"],
    availability: "in_stock",
  },
  {
    n: 4,
    category: "arus",
    frames: 2,
    purchase: 960000,
    rental: [210000, 3],
    sizes: ["38", "40", "42"],
    availability: "made_to_order",
  },
  {
    n: 5,
    category: "arus",
    frames: 2,
    purchase: 540000,
    rental: [115000, 3],
    sizes: ["36", "38", "40"],
    availability: "in_stock",
  },
  {
    n: 6,
    category: "arus",
    frames: 2,
    purchase: 680000,
    sizes: ["38", "40", "42", "44"],
    availability: "in_stock",
  },
  {
    n: 7,
    category: "domod",
    frames: 2,
    purchase: 470000,
    rental: [95000, 3],
    sizes: ["48", "50", "52"],
    availability: "in_stock",
  },
  {
    n: 8,
    category: "domod",
    frames: 2,
    purchase: 520000,
    rental: [110000, 3],
    sizes: ["48", "50", "52", "54"],
    availability: "in_stock",
  },
  {
    n: 9,
    category: "tuy",
    frames: 2,
    rental: [240000, 3],
    availability: "rental_only",
  },
  {
    n: 10,
    category: "tuy",
    frames: 2,
    rental: [225000, 3],
    availability: "rental_only",
  },
  {
    n: 11,
    category: "arus",
    frames: 2,
    purchase: 830000,
    rental: [170000, 3],
    sizes: ["38", "40", "42"],
    availability: "in_stock",
  },
  {
    n: 12,
    category: "arus",
    frames: 2,
    purchase: 910000,
    compareAt: 1120000,
    sizes: ["38", "40"],
    availability: "in_stock",
  },
  {
    n: 13,
    category: "tuy",
    frames: 2,
    purchase: 390000,
    rental: [85000, 3],
    sizes: ["40", "42", "44"],
    availability: "in_stock",
  },
  {
    n: 14,
    category: "arus",
    frames: 2,
    purchase: 720000,
    rental: [150000, 3],
    sizes: ["38", "40", "42"],
    availability: "in_stock",
  },
  {
    n: 15,
    category: "arus",
    frames: 2,
    purchase: 660000,
    sizes: ["38", "40", "42", "44"],
    availability: "in_stock",
  },
  {
    n: 16,
    category: "arus",
    frames: 2,
    purchase: 780000,
    rental: [165000, 3],
    sizes: ["38", "40", "42"],
    availability: "made_to_order",
  },
  {
    n: 17,
    category: "lavozimot",
    frames: 2,
    purchase: 165000,
    rental: [40000, 2],
    availability: "in_stock",
  },
  {
    n: 18,
    category: "zewar",
    frames: 1,
    purchase: 340000,
    rental: [70000, 2],
    availability: "in_stock",
  },
  {
    n: 19,
    category: "arus",
    frames: 2,
    purchase: 880000,
    rental: [185000, 3],
    sizes: ["38", "40", "42"],
    availability: "in_stock",
  },
  {
    n: 20,
    category: "arus",
    frames: 2,
    purchase: 850000,
    compareAt: 990000,
    sizes: ["40", "42"],
    availability: "sold_out",
  },
  {
    n: 21,
    category: "lavozimot",
    frames: 1,
    purchase: 145000,
    availability: "in_stock",
  },
];

const money = (amount: number) => ({ amount, currency: "TJS" as const });
const pad = (n: number) => String(n).padStart(2, "0");

function offersFor(seed: LookSeed): ProductOffer[] {
  const offers: ProductOffer[] = [];
  if (seed.purchase) {
    offers.push({
      kind: "purchase",
      price: money(seed.purchase),
      ...(seed.compareAt ? { compareAtPrice: money(seed.compareAt) } : null),
    });
  }
  if (seed.rental) {
    const [price, days] = seed.rental;
    offers.push({
      kind: "rental",
      price: money(price),
      rentalPeriodDays: days,
      deposit: money(Math.round(price * 1.5)),
    });
  }
  return offers;
}

function buildProduct(seed: LookSeed): Product {
  const num = pad(seed.n);
  const alt = `Образ ${num} из коллекции ARUS DOMOD`;
  const images = [photo(`look-${num}-a` as PhotoSlug, alt)];
  if (seed.frames === 2) {
    images.push(photo(`look-${num}-b` as PhotoSlug, `${alt}, другой ракурс`));
  }

  const variants = (seed.sizes ?? [undefined]).map((size, index) => ({
    id: `${seed.n}-${index}`,
    sku: `AD-${num}-${size ?? "OS"}`,
    ...(size ? { size } : null),
    availability: seed.availability,
  }));

  return {
    id: `look-${num}`,
    slug: `look-${num}`,
    title: `Образ ${num}`,
    article: `AD-${num}`,
    categorySlug: seed.category,
    collectionSlug: "collection-01",
    images,
    offers: offersFor(seed),
    variants,
    description:
      "Демонстрационная карточка. Описание образа, состав и происхождение " +
      "заполняются вместе с данными бренда.",
  };
}

export const products: Product[] = seeds.map(buildProduct);

/** Порядок витрины на главной — задан вручную, а не сортировкой */
export const featuredSlugs = ["look-19", "look-15", "look-04", "look-12"];
