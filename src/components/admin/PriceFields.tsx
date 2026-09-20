"use client";

import { useState } from "react";

import { Field, Text } from "@/components/admin/form";

/**
 * Цены товара: покупка и прокат. Хотя бы одна должна быть заполнена.
 *
 * Раньше это проверял сервер: оставил обе пустыми — форма возвращалась
 * начисто, стирая и название, и размеры, и только что загруженные кадры.
 * Владелец терял десять минут работы из-за одного незаполненного поля.
 *
 * Теперь проверяет браузер: пока обе цены пусты, каждая помечена
 * обязательной, и форма не отправляется — ничего не теряется. Заполнил
 * любую — вторая перестаёт быть обязательной. Серверная проверка
 * остаётся на месте: она последняя, а не единственная.
 */
export function PriceFields({
  purchase,
  rental,
}: {
  purchase?: string;
  rental?: string;
}) {
  const [buy, setBuy] = useState(purchase ?? "");
  const [rent, setRent] = useState(rental ?? "");
  const nothing = buy.trim() === "" && rent.trim() === "";

  return (
    <>
      <Field
        label="Цена, сомони"
        hint={
          nothing
            ? "Заполните цену покупки или проката — иначе образ не сохранить"
            : "Пусто — образ не продаётся"
        }
      >
        <Text
          name="purchase"
          type="number"
          step="0.01"
          min={0}
          required={nothing}
          value={buy}
          onChange={setBuy}
        />
      </Field>
      <Field
        label="Цена проката, сомони"
        hint="Пусто — прокат недоступен. Срок и залог обсуждаются в магазине"
      >
        <Text
          name="rental"
          type="number"
          step="0.01"
          min={0}
          required={nothing}
          value={rent}
          onChange={setRent}
        />
      </Field>
    </>
  );
}
