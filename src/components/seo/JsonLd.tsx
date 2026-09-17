/**
 * Разметка JSON-LD в `<script>`.
 *
 * `<` экранируется: названия и описания товаров приходят из админки, и
 * строка `</script>` внутри них закрыла бы тег раньше времени — это и
 * поломка разметки, и дыра для внедрения кода.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
