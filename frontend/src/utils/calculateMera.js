// src/utils/calculateMera.js

/**
 * Функция расчёта меры спуска.
 * 
 * @param {Object} params
 * @param {number} params.depth        - Глубина скважины (максимум)
 * @param {Array}  tubes               - Массив труб [{ number, length, row }, ...]
 * @param {Array}  patrubki            - Массив патрубков [{ number, length, name }, ...]
 * @param {Array}  equipment           - Массив оборудования 
 *                                       [{ name, length, plannedDepth, tolerance, depth }, ...]
 * 
 * Возвращает массив результатов, каждый элемент описывает:
 *   - equipmentName       (string)
 *   - tubesUsed           (Array<{ number, length }>)
 *   - patrubkiUsed        (Array<{ number, length }>)
 *   - topDepth            (число)  - отметка верхней части элемента
 *   - bottomDepth         (число)  - отметка нижней части элемента (topDepth + length оборудования)
 *   - note                (string) - комментарий: попали / не попали в интервал, превышен забой и т.д.
 */
export default function calculateMera(
  params = {}, 
  tubesParam, 
  patrubkiParam, 
  equipmentParam
) {
  // Проверяем, как были переданы параметры
  const depth = params.depth || 0;
  
  // Определяем, были ли параметры переданы отдельно или в объекте
  let tubes = tubesParam || params.tubes || [];
  let patrubki = patrubkiParam || params.patrubki || [];
  let equipment = equipmentParam || params.equipment || [];

  console.log('🔧 Начинаем расчёт меры:');
  console.log('• Глубина скважины:', depth);
  console.log('• Количество труб:', tubes?.length);
  console.log('• Количество патрубков:', patrubki?.length);
  console.log('• Количество элементов оборудования:', equipment?.length);

  // Проверяем входные данные
  if (!tubes || !tubes.length || !equipment || !equipment.length) {
    console.error('❌ Отсутствуют необходимые данные');
    return [];
  }

  // Функция для безопасного преобразования строки в число
  const safeParseFloat = (value) => {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    // Заменяем запятую на точку для правильного парсинга
    const normalized = String(value).replace(',', '.');
    return parseFloat(normalized) || 0;
  };

  // Функция для получения длины из трубы с поддержкой разных полей
  const getTubeLength = (tube) => {
    // Проверяем различные варианты поля с длиной трубы
    const length = tube.length || tube['Длинна трубы, м'] || tube['Длина трубы, м'] || tube['длина'] || tube['Длина (m)'] || 0;
    return safeParseFloat(length);
  };

  // Функция для получения номера трубы с поддержкой разных полей
  const getTubeNumber = (tube, index) => {
    return tube.number || tube['№№  п/п'] || tube['Номер трубы'] || tube.row || tube.id || `Т-${index + 1}`;
  };
  
  // Копируем массивы и убеждаемся, что длины корректно преобразованы
  let availableTubes = tubes.map((tube, index) => ({
    ...tube,
    number: getTubeNumber(tube, index),
    length: getTubeLength(tube)
  })).filter(tube => tube.length > 0); // Отфильтровываем трубы с нулевой длиной
  
  let availablePatrubki = [];
  if (patrubki && patrubki.length) {
    availablePatrubki = patrubki.map((pat, index) => ({
    ...pat,
    number: pat.number || pat['№№  п/п'] || 'П-' + (pat.row || index + 1),
    length: getTubeLength(pat)
  })).filter(pat => pat.length > 0); // Отфильтровываем патрубки с нулевой длиной
  }

  // Сортируем трубы по длине для оптимального заполнения (от длинных к коротким)
  availableTubes.sort((a, b) => b.length - a.length);

  // Выводим информацию о трубах для отладки
  let totalTubesLength = 0;
  availableTubes.forEach(tube => {
    totalTubesLength += tube.length;
  });
  console.log(`🧱 Всего длина труб: ${totalTubesLength.toFixed(2)} м (${availableTubes.length} шт)`);

  // Выводим информацию о патрубках для отладки
  if (availablePatrubki.length > 0) {
    let totalPatrubkiLength = 0;
    availablePatrubki.forEach(pat => {
      totalPatrubkiLength += pat.length;
    });
    console.log(`🔧 Всего длина патрубков: ${totalPatrubkiLength.toFixed(2)} м (${availablePatrubki.length} шт)`);
  }

  // -------------------------------------------------------------------------
  // НОВАЯ ЛОГИКА: Расчет глубин установки оборудования
  // -------------------------------------------------------------------------
  
  // Сортируем оборудование - подвеска должна быть первой, башмак последним
  const sortedEquipment = [...equipment].sort((a, b) => {
    // Башмак всегда последний
    if (a.name.toLowerCase().includes('башмак')) return 1;
    if (b.name.toLowerCase().includes('башмак')) return -1;
    // Подвеска всегда первая
    if (a.name.toLowerCase().includes('подвеска')) return -1;
    if (b.name.toLowerCase().includes('подвеска')) return 1;
    // По глубине (от меньшей к большей)
    return safeParseFloat(a.depth) - safeParseFloat(b.depth);
  });
  
  // Результаты для каждого элемента оборудования
  const results = [];
  
  // Копируем массивы труб и патрубков для распределения
  let remainingTubes = [...availableTubes];
  let remainingPatrubki = [...availablePatrubki];
  
  // Устанавливаем глубины для каждого элемента оборудования
  for (let i = 0; i < sortedEquipment.length; i++) {
    const eq = sortedEquipment[i];
    const isBashmak = eq.name.toLowerCase().includes('башмак');
    const isHanger = eq.name.toLowerCase().includes('подвеска');
    
    // Определяем глубину на основе типа оборудования или указанной глубины
    let topDepth;
    
    if (eq.depth) {
      // Используем указанную глубину, если она есть
      topDepth = safeParseFloat(eq.depth);
    } else if (isBashmak) {
      // Для башмака: глубина скважины минус длина башмака
      topDepth = safeParseFloat(depth) - safeParseFloat(eq.length);
    } else if (isHanger) {
      // Для подвески: начало скважины
      topDepth = 0;
    } else {
      // Если глубина не указана, интерполируем между соседними элементами
      const hangerDepth = sortedEquipment.find(e => e.name.toLowerCase().includes('подвеска'))?.depth || 0;
      const bashmakDepth = sortedEquipment.find(e => e.name.toLowerCase().includes('башмак'))?.depth || depth;
      const eqIndex = sortedEquipment.indexOf(eq);
      const hangerIndex = sortedEquipment.findIndex(e => e.name.toLowerCase().includes('подвеска'));
      const bashmakIndex = sortedEquipment.findIndex(e => e.name.toLowerCase().includes('башмак'));
      
      if (hangerIndex !== -1 && bashmakIndex !== -1) {
        const totalElements = sortedEquipment.length - 2; // без башмака и подвески
        const depthRange = bashmakDepth - hangerDepth;
        const step = depthRange / (totalElements + 1);
        const positionFromTop = eqIndex - hangerIndex - 1;
        topDepth = hangerDepth + step * positionFromTop;
      } else {
        topDepth = 0;
      }
    }
    
    // Расчет нижней глубины (топ + длина оборудования)
    const length = safeParseFloat(eq.length);
    const bottomDepth = topDepth + length;
    
    // Определяем плановую глубину и допуск
    // Сначала проверяем plannedDepth, затем fallback на interval для обратной совместимости
    const plannedDepth = safeParseFloat(eq.plannedDepth || eq.interval || 0);
    const tolerance = safeParseFloat(eq.tolerance || 0);
    
    // Рассчитываем минимальную и максимальную глубину на основе плановой глубины и допуска
    const minDepth = plannedDepth > 0 ? plannedDepth - tolerance : null;
    const maxDepth = plannedDepth > 0 ? plannedDepth + tolerance : null;
    
    // Проверяем, находится ли оборудование в пределах допустимого интервала
    let note = "";
    if (plannedDepth > 0 && tolerance > 0) {
      if (bottomDepth < minDepth) {
        note = `Не достигнута целевая глубина (${bottomDepth.toFixed(2)} < ${minDepth.toFixed(2)})`;
      } else if (bottomDepth > maxDepth) {
        note = `Превышена целевая глубина (${bottomDepth.toFixed(2)} > ${maxDepth.toFixed(2)})`;
      } else {
        note = `В пределах допуска (${minDepth.toFixed(2)} - ${maxDepth.toFixed(2)})`;
      }
    }
    
    // Проверяем, не превышает ли низ оборудования глубину скважины
    if (bottomDepth > depth) {
      note = `Ошибка: превышена глубина скважины (${bottomDepth.toFixed(2)} > ${depth.toFixed(2)})`;
    }
    
    // Заполняем трубы между текущим элементом и предыдущим
    const tubesUsed = [];
    const patrubkiUsed = [];
    
    // Если это не первый элемент, заполняем промежуток трубами
    if (i > 0) {
      const prevElement = results[i - 1];
      const distanceBetween = topDepth - prevElement.bottomDepth;
      
      if (distanceBetween > 0) {
        // Сначала используем трубы
        let remainingDistance = distanceBetween;
        let usedTubeIndices = [];
        
        // Проходим по всем доступным трубам и пытаемся заполнить пространство
        for (let j = 0; j < remainingTubes.length && remainingDistance > 0; j++) {
          const tube = remainingTubes[j];
          if (tube.length <= remainingDistance) {
            tubesUsed.push({ ...tube });
            usedTubeIndices.push(j);
            remainingDistance -= tube.length;
          }
        }
        
        // Удаляем использованные трубы из списка доступных (в обратном порядке)
        for (let j = usedTubeIndices.length - 1; j >= 0; j--) {
          remainingTubes.splice(usedTubeIndices[j], 1);
        }
        
        // Если остался промежуток, заполняем патрубками
        if (remainingDistance > 0) {
          let usedPatrubkiIndices = [];
          
          for (let j = 0; j < remainingPatrubki.length && remainingDistance > 0; j++) {
            const patrubka = remainingPatrubki[j];
            if (patrubka.length <= remainingDistance) {
              patrubkiUsed.push({ ...patrubka });
              usedPatrubkiIndices.push(j);
              remainingDistance -= patrubka.length;
            }
          }
          
          // Удаляем использованные патрубки
          for (let j = usedPatrubkiIndices.length - 1; j >= 0; j--) {
            remainingPatrubki.splice(usedPatrubkiIndices[j], 1);
          }
        }
      }
    }
    
    // Создаем результат для этого элемента оборудования
    results.push({
      equipmentName: eq.name,
      topDepth: topDepth,
      bottomDepth: bottomDepth,
      tubesUsed: tubesUsed,
      patrubkiUsed: patrubkiUsed,
      note: note,
      plannedDepth: plannedDepth,
      tolerance: tolerance,
      minDepth: minDepth,
      maxDepth: maxDepth,
      equipmentId: eq.id || i + 1 // Добавляем id для однозначной идентификации
    });
  }
  
  // Сортируем результаты от меньшей глубины (подвеска) к большей (башмак)
  results.sort((a, b) => a.topDepth - b.topDepth);
  
  // Возвращаем результаты
  return results;
}