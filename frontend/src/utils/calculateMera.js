// src/utils/calculateMera.js

/**
 * Функция расчёта меры спуска.
 * 
 * @param {Object} params
 * @param {number} params.depth        - Глубина скважины (максимум)
 * @param {number} params.shoeDepth    - Глубина башмака (можно учесть ± допуск)
 * @param {number} params.hangerDepth  - Глубина подвески (верхний элемент), можно учесть допуск
 * @param {Array}  tubes               - Массив труб [{ number, length, row }, ...]
 * @param {Array}  patrubki            - Массив патрубков [{ number, length, name }, ...]
 * @param {Array}  equipment           - Массив оборудования 
 *                                       [{ name, length, interval, tolerance }, ...]
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
  const shoeDepth = params.shoeDepth || 0;
  const hangerDepth = params.hangerDepth || 0;
  
  // Определяем, были ли параметры переданы отдельно или в объекте
  let tubes = tubesParam || params.tubes || [];
  let patrubki = patrubkiParam || params.patrubki || [];
  let equipment = equipmentParam || params.equipment || [];

  console.log('🔧 Начинаем расчёт меры:');
  console.log('• Глубина скважины:', depth);
  console.log('• Глубина башмака:', shoeDepth);
  console.log('• Интервал установки подвески:', hangerDepth, '±', equipment[0]?.tolerance);
  console.log('• Количество труб:', tubes?.length);
  console.log('• Количество патрубков:', patrubki?.length);

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

  // Сортируем трубы по номеру - это важно для правильного порядка от 1 до N
  availableTubes.sort((a, b) => {
    const numA = parseInt(a.number.toString().replace(/\D/g, '')) || 0;
    const numB = parseInt(b.number.toString().replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  // Выводим информацию о трубах для отладки
  let totalTubesLength = 0;
  availableTubes.forEach((tube, index) => {
    if (index < 10) { // Для экономии лога показываем только первые 10 труб
      console.log(`🧱 Труба ${tube.number}: ${tube.length} м`);
    }
    totalTubesLength += tube.length;
  });
  console.log(`🧱 Всего длина труб: ${totalTubesLength.toFixed(2)} м (${availableTubes.length} шт)`);

  // Выводим информацию о патрубках для отладки
  if (availablePatrubki.length > 0) {
    let totalPatrubkiLength = 0;
    availablePatrubki.forEach((pat, index) => {
      if (index < 10) { // Для экономии лога показываем только первые 10 патрубков
        console.log(`🔧 Патрубок ${pat.number}: ${pat.length} м`);
      }
      totalPatrubkiLength += pat.length;
    });
    console.log(`🔧 Всего длина патрубков: ${totalPatrubkiLength.toFixed(2)} м (${availablePatrubki.length} шт)`);
  }

  // -------------------------------------------------------------------------
  // НОВАЯ ЛОГИКА: Сначала сортируем оборудование по убыванию глубины
  // -------------------------------------------------------------------------
  
  // Копируем и сортируем оборудование от большей глубины (башмак) к меньшей (подвеска)
  const sortedEquipment = [...equipment].sort((a, b) => {
    const depthA = safeParseFloat(a.interval);
    const depthB = safeParseFloat(b.interval);
    return depthB - depthA;
  });
  
  // Результаты расчетов (будут хранить список опорных точек с оборудованием)
  const results = [];
  
  // Используемые трубы (для предотвращения повторного использования)
  const usedTubes = [];
  
  // Шаг 1: Начинаем с башмака и добавляем его как первый элемент
  const shoe = sortedEquipment.find(eq => eq.name.toLowerCase().includes('башмак'));
  if (!shoe) {
    console.error('❌ Не найден башмак в списке оборудования');
    return [];
  }
  
  const shoeDepthTarget = safeParseFloat(shoe.interval);
  const shoeLength = safeParseFloat(shoe.length);
  
  console.log(`📍 Башмак устанавливается на глубине ${shoeDepthTarget} м`);
  
  // Добавляем башмак как первый элемент (он самый глубокий)
  results.push({
    equipmentName: shoe.name,
    tubesUsed: [],
    patrubkiUsed: [],
    topDepth: shoeDepthTarget - shoeLength, // Верх башмака
    bottomDepth: shoeDepthTarget, // Низ башмака (собственно глубина)
    note: "Начало отсчета - башмак"
  });
  
  // Текущая глубина - верх башмака (от него будем идти вверх)
  let currentDepth = shoeDepthTarget - shoeLength;
  let tubeCounter = 1; // Счётчик труб, начиная от башмака
  
  // Добавляем остальное оборудование по убыванию глубины
  // Перебираем оборудование, исключая башмак, который уже добавили
  for (let i = 0; i < sortedEquipment.length; i++) {
    const eq = sortedEquipment[i];
    
    // Пропускаем башмак (он уже добавлен)
    if (eq.name.toLowerCase().includes('башмак')) {
      continue;
    }
    
    const eqName = eq.name;
    const eqLength = safeParseFloat(eq.length);
    const targetDepth = safeParseFloat(eq.interval);
    const tolerance = safeParseFloat(eq.tolerance) || 1;
    
    console.log(`⚙️ ${eqName}: целевая глубина ${targetDepth} м ± ${tolerance} м`);
    console.log(`📏 Текущая глубина (верх): ${currentDepth.toFixed(2)} м, цель: ${targetDepth} м`);
    
    // Нам нужно добраться до низа этого оборудования, который должен быть на целевой глубине
    // Для этого нам нужно добавить трубы между текущей глубиной и целевой глубиной
    const targetBottom = targetDepth;
    const targetTop = targetBottom - eqLength;
    
    // Расстояние, которое нужно пройти трубами от текущей глубины до верха целевого оборудования
    const distanceNeeded = currentDepth - targetTop;
    
    console.log(`👉 Нужно пройти вверх: ${distanceNeeded.toFixed(2)} м труб до верха оборудования`);
    
    // Подбираем трубы для прохождения расстояния
    let tubesForSegment = [];
    let patrubkiForSegment = [];
    let cumulativeTubeLength = 0;
    
    // Берем трубы последовательно, начиная с трубы №1
    const availableTubesForUse = availableTubes.filter(t => !usedTubes.includes(t.number));
    
    // Сначала попробуем использовать последовательно трубы с номерами tubeCounter, tubeCounter+1, ...
    for (let idx = 0; idx < availableTubesForUse.length && cumulativeTubeLength < distanceNeeded; idx++) {
      const tube = availableTubesForUse[idx];
      
      // Маркируем номером tubeCounter в результате 
      const numberedTube = {
        ...tube,
        sequentialNumber: tubeCounter++  // Используем счётчик для правильной нумерации
      };
      
      // Добавляем трубу
      tubesForSegment.push(numberedTube);
      usedTubes.push(tube.number);
      cumulativeTubeLength += tube.length;
      
      console.log(`+ Труба №${tubeCounter-1} (${tube.number}): ${tube.length} м (суммарно: ${cumulativeTubeLength.toFixed(2)} м)`);
      
      // Проверяем, не превысили ли мы целевую длину
      if (cumulativeTubeLength > distanceNeeded + tolerance) {
        // Если превысили допустимый предел, нужна компенсация патрубками
        const excess = cumulativeTubeLength - distanceNeeded;
        console.log(`⚠️ Трубы слишком длинные, превышение: ${excess.toFixed(2)} м, нужна компенсация патрубками`);
        
        // Подбираем патрубки для компенсации
        if (availablePatrubki.length > 0) {
          console.log(`🔍 Ищем подходящие патрубки для компенсации ${excess.toFixed(2)} м`);
          
          // Сортируем патрубки по убыванию длины, чтобы брать сначала длинные
          const sortedPatrubki = [...availablePatrubki].sort((a, b) => b.length - a.length);
          
          // Ищем патрубок, максимально близкий к excess но меньше его
          let bestPatrubokIndex = -1;
          let bestFit = -Infinity;
          
          for (let p = 0; p < sortedPatrubki.length; p++) {
            const patLength = sortedPatrubki[p].length;
            if (patLength <= excess && patLength > bestFit) {
              bestPatrubokIndex = p;
              bestFit = patLength;
            }
          }
          
          if (bestPatrubokIndex !== -1) {
            // Нашли подходящий патрубок
            const pat = sortedPatrubki[bestPatrubokIndex];
            patrubkiForSegment.push(pat);
            console.log(`✅ Используем патрубок ${pat.number} длиной ${pat.length} м`);
            
            // Удаляем использованный патрубок из доступных
            availablePatrubki = availablePatrubki.filter(p => p.number !== pat.number);
            
            // Если нужны дополнительные патрубки
            const remaining = excess - pat.length;
            if (remaining > 0.1) {
              console.log(`⚠️ Требуется ещё компенсация на ${remaining.toFixed(2)} м`);
              
              // Ищем дополнительные патрубки
              while (availablePatrubki.length > 0) {
                const nextBestIndex = availablePatrubki.findIndex(p => p.length <= remaining);
                if (nextBestIndex !== -1) {
                  const nextPat = availablePatrubki[nextBestIndex];
                  patrubkiForSegment.push(nextPat);
                  console.log(`+ Дополнительный патрубок ${nextPat.number}: ${nextPat.length} м`);
                  
                  // Удаляем использованный патрубок
                  availablePatrubki.splice(nextBestIndex, 1);
                  break;
                } else {
                  // Нет подходящих патрубков
                  console.log('⚠️ Нет подходящих патрубков для дополнительной компенсации');
                  break;
                }
              }
            }
          } else {
            console.log('⚠️ Нет подходящих патрубков для компенсации превышения');
          }
        } else {
          console.log('⚠️ Нет доступных патрубков для компенсации');
        }
      }
      
      // Если достигли или превысили нужную длину, прерываем цикл
      if (cumulativeTubeLength >= distanceNeeded) {
        break;
      }
    }
    
    // Вычисляем итоговую глубину с учетом труб и патрубков
    const totalPatrubkiLength = patrubkiForSegment.reduce((sum, pat) => sum + pat.length, 0);
    const adjustedTubeLength = cumulativeTubeLength - totalPatrubkiLength;
    
    // Вычисляем новую текущую глубину (верхняя точка установленного оборудования)
    const actualBottom = currentDepth - adjustedTubeLength;
    const actualTop = actualBottom - eqLength;
    
    // Сохраняем информацию о стартовой глубине для каждой трубы
    if (tubesForSegment.length > 0) {
      let tubeStartDepth = currentDepth; // Начинаем с текущей глубины (верх башмака или предыдущего элемента)
      
      for (let t = 0; t < tubesForSegment.length; t++) {
        // Для первой трубы после башмака: startDepth = верх башмака
        tubesForSegment[t].startDepth = tubeStartDepth; 
        // Для следующей трубы: startDepth = верх текущей трубы - ее длина
        tubeStartDepth -= tubesForSegment[t].length;
      }
    }
    
    // Формируем комментарий
    let note = "Интервал соблюден";
    
    // Проверяем попадание в интервал
    const minAllowedDepth = targetDepth - tolerance;
    const maxAllowedDepth = targetDepth + tolerance;
    
    if (actualBottom < minAllowedDepth) {
      note = `Не достигнута минимальная глубина (${minAllowedDepth.toFixed(2)} м)`;
      console.log(`⚠️ ${note}`);
    } else if (actualBottom > maxAllowedDepth) {
      note = `Превышена максимальная глубина (${maxAllowedDepth.toFixed(2)} м)`;
      console.log(`⚠️ ${note}`);
    } else {
      console.log(`✅ Интервал соблюден: ${actualBottom.toFixed(2)} м попадает в [${minAllowedDepth.toFixed(2)}, ${maxAllowedDepth.toFixed(2)}] м`);
    }
    
    // Добавляем результат
    results.push({
      equipmentName: eqName,
      tubesUsed: tubesForSegment,
      patrubkiUsed: patrubkiForSegment,
      topDepth: actualTop,
      bottomDepth: actualBottom,
      note: note
    });
    
    // Обновляем текущую глубину для следующего сегмента
    currentDepth = actualTop;
    
    console.log(`✓ ${eqName} установлен на глубине ${actualBottom.toFixed(2)} м (верх: ${actualTop.toFixed(2)} м)`);
    console.log('-----------------------------------');
  }
  
  // Переворачиваем результаты, чтобы они шли в порядке сверху вниз
  // (от подвески, которая ближе к поверхности, к башмаку, который глубже всех)
  return results.reverse();
}