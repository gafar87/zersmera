import React, { useState, useEffect } from 'react';
import './CalculateMera.css';
import calculateMera from '../utils/calculateMera';

const CalculateMera = ({ tubes, patrubki, equipment, wellParams, onBack }) => {
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedData, setSavedData] = useState(null);
  const [showTubesBetweenElements, setShowTubesBetweenElements] = useState({});

  // Загрузка сохраненных данных при монтировании компонента
  useEffect(() => {
    const savedCalculation = localStorage.getItem('calculationData');
    if (savedCalculation) {
      try {
        const parsedData = JSON.parse(savedCalculation);
        setSavedData(parsedData);
        console.log('✅ Загружены сохраненные данные расчета:', parsedData);
      } catch (error) {
        console.error('Ошибка при загрузке сохраненных данных:', error);
      }
    }
  }, []);

  // Функция для очистки хранилища
  const handleClearStorage = () => {
    if (confirm('Вы уверены, что хотите очистить все данные из локального хранилища? Это действие нельзя отменить.')) {
      try {
        console.log('🧹 Начинаем очистку хранилища из CalculateMera...');
        
        // Явно перечисляем все ключи, которые нужно удалить
        const keysToRemove = [
          'calculationData',
          'tubeUploader',
          'wellParams',
          'tubeData',
          'patrubkiData',
          'equipmentData'
        ];
        
        // Удаляем каждый ключ и выводим в консоль 
        keysToRemove.forEach(key => {
          const value = localStorage.getItem(key);
          console.log(`Удаляем ключ ${key}, текущее значение: ${value ? 'существует' : 'отсутствует'}`);
          localStorage.removeItem(key);
          console.log(`Проверка после удаления ${key}: ${localStorage.getItem(key) ? 'осталось' : 'удалено'}`);
        });
        
        // Полная очистка всего хранилища в качестве резервного варианта
        console.log('Очищаем всё хранилище...');
        localStorage.clear();
        
        console.log('Проверка ключей после очистки:');
        keysToRemove.forEach(key => {
          console.log(`${key}: ${localStorage.getItem(key) ? 'осталось' : 'удалено'}`);
        });
        
        // Сбрасываем состояние компонента
        setResults(null);
        setSavedData(null);
        setHasErrors(false);
        setErrorMessage(null);
        setShowTubesBetweenElements(false);
        
        alert('Локальное хранилище очищено. Страница будет перезагружена.');
        
        // Используем встроенный JavaScript метод для полной перезагрузки страницы
        console.log('💥 Перезагружаем страницу...');
        
        // Сначала устанавливаем небольшую задержку
        setTimeout(() => {
          // Принудительно очищаем кэш и перезагружаем страницу
          window.location.href = window.location.href.split('?')[0] + '?nocache=' + new Date().getTime();
        }, 300);
      } catch (error) {
        console.error('❌ Ошибка при очистке хранилища:', error);
        alert('Произошла ошибка при очистке хранилища: ' + error.message);
      }
    }
  };

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

  // Функция для переключения видимости труб между элементами
  const toggleTubesBetween = (equipmentId) => {
    setShowTubesBetweenElements(prev => ({
      ...prev,
      [equipmentId]: !prev[equipmentId]
    }));
  };

  // Выполняем проверку данных перед расчетом
  const validateData = () => {
    // Используем данные из пропсов или сохраненные данные
    const actualTubes = tubes || (savedData?.tubes?.data) || [];
    const actualPatrubki = patrubki || (savedData?.patrubki?.data) || [];
    const actualEquipment = equipment || savedData?.equipment || [];
    const actualWellParams = wellParams || savedData?.wellParams || {};
    
    // Сбрасываем предыдущие ошибки
    setHasErrors(false);
    setErrorMessage('');
    
    // Проверяем наличие параметров скважины
    if (!actualWellParams?.depth) {
      setErrorMessage('Отсутствует глубина скважины. Вернитесь на шаг ввода параметров скважины.');
      setHasErrors(true);
      return false;
    }
    
    // Проверяем наличие данных о трубах
    if (!actualTubes || actualTubes.length === 0) {
      setErrorMessage('Отсутствуют данные о трубах. Вернитесь на шаг загрузки труб.');
      setHasErrors(true);
      return false;
    }
    
    // Проверяем наличие данных о патрубках
    if (!actualPatrubki || actualPatrubki.length === 0) {
      setErrorMessage('Отсутствуют данные о патрубках. Вернитесь на шаг загрузки патрубков.');
      setHasErrors(true);
      return false;
    }
    
    // Проверяем наличие данных об оборудовании
    if (!actualEquipment || actualEquipment.length === 0) {
      setErrorMessage('Отсутствуют данные об оборудовании. Вернитесь на шаг загрузки оборудования.');
      setHasErrors(true);
      return false;
    }
    
    // Проверяем первый и последний элементы оборудования
    const firstEquipment = actualEquipment[0];
    const lastEquipment = actualEquipment[actualEquipment.length - 1];
    
    if (!firstEquipment?.name?.toLowerCase().includes('подвеска')) {
      setErrorMessage('Первый элемент оборудования должен быть подвеской.');
      setHasErrors(true);
      return false;
    }
    
    if (!lastEquipment?.name?.toLowerCase().includes('башмак')) {
      setErrorMessage('Последний элемент оборудования должен быть башмаком.');
      setHasErrors(true);
      return false;
    }
    
    // Проверим, что у труб и патрубков есть ненулевые длины
    const validTubes = actualTubes.filter(tube => {
      const length = getTubeLength(tube);
      return length > 0;
    });
    
    if (validTubes.length === 0) {
      setErrorMessage('Все трубы имеют нулевую длину. Проверьте данные труб.');
      setHasErrors(true);
      return false;
    }
    
    const validPatrubki = actualPatrubki.filter(pat => {
      const length = getTubeLength(pat);
      return length > 0;
    });
    
    if (validPatrubki.length === 0) {
      setErrorMessage('Все патрубки имеют нулевую длину. Проверьте данные патрубков.');
      setHasErrors(true);
      return false;
    }
    
    return true;
  };

  // Основная функция расчёта
  const performCalculation = () => {
    setIsCalculating(true);
    
    // Определяем, какие данные использовать
    const actualTubes = tubes || (savedData?.tubes?.data) || [];
    const actualPatrubki = patrubki || (savedData?.patrubki?.data) || [];
    const actualEquipment = equipment || savedData?.equipment || [];
    const actualWellParams = wellParams || savedData?.wellParams || {};
    
    // Проверяем входные данные
    if (!validateData()) {
      setIsCalculating(false);
      return;
    }

    try {
      console.log('🔧 Начинаем расчёт меры:');
      console.log('• Параметры скважины:', actualWellParams);
      console.log('• Общее количество труб:', actualTubes.length);
      console.log('• Общее количество патрубков:', actualPatrubki.length);
      console.log('• Оборудование:', actualEquipment);

      // Копируем и сортируем трубы по длине (от длинных к коротким)
      const sortedTubes = [...actualTubes].sort((a, b) => {
        return getTubeLength(b) - getTubeLength(a);
      });

      // Копируем и сортируем патрубки по длине (от длинных к коротким)
      const sortedPatrubki = [...actualPatrubki].sort((a, b) => {
        return getTubeLength(b) - getTubeLength(a);
      });

      // Создаем массив результатов для каждого элемента оборудования
      const calculationResults = [];
      
      // Сортируем оборудование - башмак в конце (глубже всего), подвеска в начале (ближе к поверхности)
      const sortedEquipment = [...actualEquipment].sort((a, b) => {
        // Башмак всегда последний
        if (a.name.toLowerCase().includes('башмак')) return 1;
        if (b.name.toLowerCase().includes('башмак')) return -1;
        // Подвеска всегда первая
        if (a.name.toLowerCase().includes('подвеска')) return -1;
        if (b.name.toLowerCase().includes('подвеска')) return 1;
        // По глубине (от меньшей к большей)
        return safeParseFloat(a.depth) - safeParseFloat(b.depth);
      });
      
      const totalDepth = safeParseFloat(actualWellParams.depth);
      
      // Устанавливаем глубины для элементов оборудования на основе их порядка и указанных глубин
      for (let i = 0; i < sortedEquipment.length; i++) {
        const eq = sortedEquipment[i];
        const isBashmak = eq.name.toLowerCase().includes('башмак');
        const isHanger = eq.name.toLowerCase().includes('подвеска');
        
        let topDepth;
        
        if (eq.depth) {
          topDepth = safeParseFloat(eq.depth);
        } else if (isBashmak) {
          topDepth = totalDepth - safeParseFloat(eq.length);
        } else if (isHanger) {
          topDepth = 0;
        } else {
          const hangerDepth = sortedEquipment.find(e => e.name.toLowerCase().includes('подвеска'))?.depth || 0;
          const bashmakDepth = sortedEquipment.find(e => e.name.toLowerCase().includes('башмак'))?.depth || totalDepth;
          const eqIndex = sortedEquipment.indexOf(eq);
          const hangerIndex = sortedEquipment.findIndex(e => e.name.toLowerCase().includes('подвеска'));
          const bashmakIndex = sortedEquipment.findIndex(e => e.name.toLowerCase().includes('башмак'));
          
          if (hangerIndex !== -1 && bashmakIndex !== -1) {
            const totalElements = sortedEquipment.length - 2;
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
        const plannedDepth = safeParseFloat(eq.plannedDepth || eq.interval || 0);
        const tolerance = safeParseFloat(eq.tolerance || 0);
        
        // Определяем интервалы приемлемой глубины
        const minDepth = plannedDepth > 0 ? plannedDepth - tolerance : null;
        const maxDepth = plannedDepth > 0 ? plannedDepth + tolerance : null;
        
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
        
        if (bottomDepth > totalDepth) {
          note = `Ошибка: превышена глубина скважины (${bottomDepth.toFixed(2)} > ${totalDepth})`;
        }
        
        // Расчет труб между текущим и предыдущим элементом
        const tubesUsed = [];
        const patrubkiUsed = [];
        
        // Если это не первый элемент, рассчитываем трубы между текущим и предыдущим
        if (i > 0) {
          const prevEq = calculationResults[i - 1];
          const distanceBetween = topDepth - prevEq.bottomDepth;
          
          // Пытаемся заполнить расстояние трубами
          let remainingDistance = distanceBetween;
          let tubeIndex = 0;
          
          while (remainingDistance > 0 && tubeIndex < sortedTubes.length) {
            const tube = sortedTubes[tubeIndex];
            const tubeLength = getTubeLength(tube);
            
            if (tubeLength <= remainingDistance) {
              const tubeCopy = { ...tube, length: tubeLength };
              tubesUsed.push(tubeCopy);
              remainingDistance -= tubeLength;
            }
            
            tubeIndex++;
          }
          
          // Если остались промежутки, пытаемся заполнить патрубками
          tubeIndex = 0;
          while (remainingDistance > 0 && tubeIndex < sortedPatrubki.length) {
            const patrubka = sortedPatrubki[tubeIndex];
            const patrubkaLength = getTubeLength(patrubka);
            
            if (patrubkaLength <= remainingDistance) {
              const patrubkaCopy = { ...patrubka, length: patrubkaLength };
              patrubkiUsed.push(patrubkaCopy);
              remainingDistance -= patrubkaLength;
            }
            
            tubeIndex++;
          }
        }
        
        // Создаем результат для этого элемента оборудования
        calculationResults.push({
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
          equipmentId: eq.id || i + 1
        });
      }
      
      // Сохраняем результаты расчета и данные в localStorage
      const dataToSave = {
        tubes: { data: actualTubes },
        patrubki: { data: actualPatrubki },
        equipment: actualEquipment,
        wellParams: actualWellParams,
        calculationResults: calculationResults
      };
      
      localStorage.setItem('calculationData', JSON.stringify(dataToSave));
      console.log('💾 Данные расчета сохранены в localStorage');
      
      // Устанавливаем результаты для отображения
      setResults(calculationResults);
      console.log("Результаты расчёта:", calculationResults);
    } catch (error) {
      console.error("Ошибка при расчёте:", error);
      setHasErrors(true);
      setErrorMessage(`Произошла ошибка при расчёте: ${error.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  // Выполняем расчет при загрузке компонента
  useEffect(() => {
    performCalculation();
  }, []); // Пустой массив зависимостей - расчет только при монтировании

  return (
    <div className="calculate-mera">
      <div className="calculate-header">
        <h2>Расчет меры спуска</h2>
        <div className="header-buttons">
        <button onClick={onBack} className="back-button">
          ← Вернуться к оборудованию
        </button>
          <button onClick={handleClearStorage} className="clear-storage-button">
            🗑️ Очистить хранилище
          </button>
        </div>
      </div>
      
      <div className="summary-section">
        <h3>Сводка данных:</h3>
        <div className="summary-table">
          <div className="summary-item">
            <span>Глубина скважины:</span> 
            <span>{(wellParams || savedData?.wellParams)?.depth || '—'} м</span>
          </div>
          <div className="summary-item">
            <span>Труб:</span> 
            <span>{(tubes || savedData?.tubes?.data || []).length || 0} шт.</span>
          </div>
          <div className="summary-item">
            <span>Патрубков:</span> 
            <span>{(patrubki || savedData?.patrubki?.data || []).length || 0} шт.</span>
          </div>
          <div className="summary-item">
            <span>Оборудования:</span> 
            <span>{(equipment || savedData?.equipment || []).length || 0} шт.</span>
          </div>
        </div>
      </div>

      {hasErrors && (
        <div className="error-message">
          <h3>⚠️ Ошибка расчета</h3>
          <p>{errorMessage}</p>
        </div>
      )}

      <button 
        onClick={performCalculation} 
        className="calculate-button"
        disabled={isCalculating}
      >
        {isCalculating ? 'Выполняется расчет...' : 'Пересчитать'}
      </button>

      {results && (
        <div className="results">
          <h3>Результаты расчета:</h3>
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Элемент</th>
                <th>Длина, м</th>
                <th>Глубина верха, м</th>
                <th>Глубина низа, м</th>
                <th>Плановая глубина, м</th>
                <th>Допуск ±, м</th>
                <th>Интервал</th>
                <th>Примечание</th>
                <th>Трубы</th>
              </tr>
            </thead>
            <tbody>
              {/* Отображаем оборудование - от поверхности (сверху) к дну (снизу) */}
              {results.map((result, index) => {
                const actualEquipment = equipment || savedData?.equipment || [];
                const eqData = actualEquipment.find(eq => eq.name === result.equipmentName) || {};
                const eqLength = safeParseFloat(eqData.length || 0);
                const hasTubes = result.tubesUsed.length > 0 || result.patrubkiUsed.length > 0;
                
                return (
                  <React.Fragment key={`eq-${index}`}>
                    <tr className="equipment-row">
                      <td>{index + 1}</td>
                      <td>{result.equipmentName}</td>
                      <td>{eqLength.toFixed(2)}</td>
                      <td>{result.topDepth.toFixed(2)}</td>
                      <td>{result.bottomDepth.toFixed(2)}</td>
                      <td>{result.plannedDepth || '-'}</td>
                      <td>{result.tolerance || '-'}</td>
                      <td>
                        {result.minDepth && result.maxDepth 
                          ? `${result.minDepth.toFixed(2)} - ${result.maxDepth.toFixed(2)}` 
                          : '-'}
                      </td>
                      <td>{result.note}</td>
                      <td>
                        {hasTubes && (
                            <button 
                            onClick={() => toggleTubesBetween(result.equipmentId)}
                            className="show-tubes-button"
                            >
                            {showTubesBetweenElements[result.equipmentId] ? 'Скрыть' : 'Показать'}
                            </button>
                          )}
                      </td>
                    </tr>
                    {/* Показываем трубы между элементами если есть и если видимость включена */}
                    {hasTubes && showTubesBetweenElements[result.equipmentId] && (
                      <>
                        {result.tubesUsed.map((tube, tubeIdx) => (
                          <tr key={`tube-${index}-${tubeIdx}`} className="tube-row">
                            <td colSpan="2" className="pl-8">Труба {tube.number || tubeIdx + 1}</td>
                            <td>{getTubeLength(tube).toFixed(2)}</td>
                            <td colSpan="7">{tube.manufacturer || '-'}</td>
                        </tr>
                        ))}
                        {result.patrubkiUsed.map((patrubka, patIdx) => (
                          <tr key={`patrubka-${index}-${patIdx}`} className="patrubka-row">
                            <td colSpan="2" className="pl-8">Патрубок {patrubka.number || patIdx + 1}</td>
                            <td>{getTubeLength(patrubka).toFixed(2)}</td>
                            <td colSpan="7">{patrubka.name || '-'}</td>
                        </tr>
                        ))}
                  </>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CalculateMera; 