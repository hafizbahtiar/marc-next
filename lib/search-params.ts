/**
 * `searchParams` memberi `string | string[]` kerana satu kunci boleh
 * muncul beberapa kali dalam URL. Mengambil yang pertama menjadikan
 * `?next=/a&next=/b` bersifat menentukan dan bukan bergantung kepada
 * bentuk yang kebetulan diterima.
 */
export function paramPertama(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
