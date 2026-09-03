import { NextResponse } from "next/server";

import { createOrder, OrderError } from "@/lib/orders/store";
import { formatOrderMessage, whatsappLink } from "@/lib/orders/whatsapp";
import { contact } from "@/lib/config/site";

/**
 * Приём заказа с сайта.
 *
 * Заказ сохраняется в базу и получает номер; в ответ уходит ссылка на
 * WhatsApp администратора с готовым текстом. Денег здесь нет и не будет:
 * оплата происходит между клиентом и администратором после подтверждения.
 * Место для будущего Alif — после сохранения заказа, перед ответом.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Неверный формат запроса" },
      { status: 400 },
    );
  }

  try {
    const order = await createOrder(body);
    const message = formatOrderMessage(order);
    return NextResponse.json(
      {
        order,
        whatsapp: {
          primary: whatsappLink(contact.phone, message),
          secondary: contact.phoneSecondary
            ? whatsappLink(contact.phoneSecondary, message)
            : null,
        },
        message,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Не удалось создать заказ", error);
    return NextResponse.json(
      { error: "Не удалось сохранить заказ. Попробуйте ещё раз." },
      { status: 500 },
    );
  }
}
