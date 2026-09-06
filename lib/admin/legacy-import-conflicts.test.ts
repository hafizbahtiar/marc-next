import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ringkasanKonflik, teksRingkasanKonflik } from "./legacy-import-conflicts";

const baris = (...messages: string[]) => ({
  conflicts: messages.map((message) => ({ code: "x", message })),
});

describe("ringkasanKonflik", () => {
  it("mengumpul mesej yang sama dan mengira baris terjejas", () => {
    assert.deepStrictEqual(
      ringkasanKonflik([
        baris("Kod bahagian tidak wujud: UU."),
        baris("Kod bahagian tidak wujud: UU."),
        baris("No. ID. ialah placeholder dan perlu disahkan."),
      ]),
      [
        { message: "Kod bahagian tidak wujud: UU.", count: 2 },
        { message: "No. ID. ialah placeholder dan perlu disahkan.", count: 1 },
      ],
    );
  });

  // Mengumpul ikut `code` akan meruntuhkan semua konflik bahagian jadi
  // satu baris, dan client takkan tahu bahagian MANA yang perlu dibuka.
  it("mengasingkan bahagian berbeza walaupun kodnya sama", () => {
    const hasil = ringkasanKonflik([
      baris("Kod bahagian tidak wujud: UU."),
      baris("Kod bahagian tidak wujud: PEJ. SUM/KPE."),
    ]);
    assert.equal(hasil.length, 2);
  });

  it("satu baris dengan mesej berulang dikira sekali sahaja", () => {
    assert.deepStrictEqual(ringkasanKonflik([baris("Sama.", "Sama.")]), [
      { message: "Sama.", count: 1 },
    ]);
  });

  it("baris tanpa konflik tidak menghasilkan entri", () => {
    assert.deepStrictEqual(ringkasanKonflik([baris(), baris()]), []);
  });

  it("disusun menurun ikut kiraan, kemudian ikut abjad", () => {
    const hasil = ringkasanKonflik([baris("B"), baris("A"), baris("A"), baris("C")]);
    assert.deepStrictEqual(
      hasil.map((item) => item.message),
      ["A", "B", "C"],
    );
  });
});

describe("teksRingkasanKonflik", () => {
  it("menghasilkan teks boleh salin dengan kiraan", () => {
    assert.equal(
      teksRingkasanKonflik([
        { message: "Kod bahagian tidak wujud: UU.", count: 2 },
        { message: "No. ID. ialah placeholder dan perlu disahkan.", count: 1 },
      ]),
      "- Kod bahagian tidak wujud: UU. (2 baris)\n" +
        "- No. ID. ialah placeholder dan perlu disahkan. (1 baris)",
    );
  });

  it("kosong bila tiada konflik", () => {
    assert.equal(teksRingkasanKonflik([]), "");
  });
});
