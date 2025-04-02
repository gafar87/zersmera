// utils/calculateMera.js

export default function calculateMera({ depth, shoeDepth, hangerDepth, hangerTolerance, tubes, patrubki = [], equipment = [] }) {
  console.log("🔧 Начинаем расчёт меры:");
  console.log("• Глубина скважины:", depth);
  console.log("• Глубина башмака:", shoeDepth);
  console.log("• Интервал установки подвески:", hangerDepth, "±", hangerTolerance);

  // 1. Суммируем длину всех труб
  let totalLength = 0;
  tubes.forEach((tube, index) => {
    const len = parseFloat(tube.length || 0);
    totalLength += len;
    console.log(`🧱 Труба ${index + 1}: ${len} м → суммарно: ${totalLength.toFixed(2)} м`);
  });

  // 2. Суммируем длину оборудования
  let equipmentLength = 0;
  equipment.forEach((item, i) => {
    const len = parseFloat(item.length || 0);
    equipmentLength += len;
    console.log(`⚙️ Оборудование ${i + 1}: ${item.name} — ${len} м → всего: ${equipmentLength.toFixed(2)} м`);
  });

  // 3. Общая длина без патрубков
  let finalLength = totalLength + equipmentLength;
  console.log("📏 Общая длина без патрубков:", finalLength.toFixed(2), "м");

  // 4. Целевой интервал установки
  const minTarget = hangerDepth - hangerTolerance;
  const maxTarget = hangerDepth + hangerTolerance;
  const isWithinTarget = finalLength >= minTarget && finalLength <= maxTarget;
  console.log(`🎯 Целевой интервал: [${minTarget}, ${maxTarget}] м → попадает: ${isWithinTarget ? "ДА" : "НЕТ"}`);

  // 5. Проверка на превышение глубины скважины
  const exceedsDepth = finalLength > depth;
  if (exceedsDepth) {
    console.warn("⚠️ Длина превышает глубину скважины!");
  }

  // 6. Подбор патрубков, если не попали в интервал
  let selectedPatrubki = [];
  if (!isWithinTarget) {
    const delta = hangerDepth - finalLength;
    let remaining = delta;
    console.log("🔄 Требуется подогнать длину на:", remaining.toFixed(2), "м");

    // Сортируем патрубки по убыванию длины
    const sorted = [...patrubki]
      .map((p) => ({
        ...p,
        length: parseFloat((p.length || "").toString().replace(",", ".")) || 0,
      }))
      .filter(p => p.length > 0)
      .sort((a, b) => b.length - a.length);

    for (const p of sorted) {
      if (remaining <= 0) break;
      selectedPatrubki.push(p);
      remaining -= p.length;
      finalLength += p.length;
      console.log(`➕ Добавили патрубок: ${p.name || "без названия"} — ${p.length} м → осталось: ${remaining.toFixed(2)} м`);
    }

    // Повторная проверка
    const inTargetAfter = finalLength >= minTarget && finalLength <= maxTarget;
    console.log(`📎 После патрубков: ${finalLength.toFixed(2)} м → интервал достигнут: ${inTargetAfter ? "ДА" : "НЕТ"}`);
  }

  return {
    finalLength,
    isWithinTarget: finalLength >= minTarget && finalLength <= maxTarget,
    exceedsDepth,
    selectedPatrubki,
  };
}
