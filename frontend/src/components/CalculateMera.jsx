import React, { useState, useEffect } from 'react';
import './CalculateMera.css';
import calculateMera from '../utils/calculateMera';

const CalculateMera = ({ tubes, patrubki, equipment, wellParams, onBack }) => {
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedResults, setExpandedResults] = useState({});

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

  // Выполняем проверку данных перед расчетом
  const validateData = () => {
    // Сбрасываем предыдущие ошибки
    setHasErrors(false);
    setErrorMessage('');
    
    // Проверяем наличие параметров скважины
    if (!wellParams?.depth) {
      setErrorMessage('Отсутствует глубина скважины. Вернитесь на шаг ввода параметров скважины.');
      setHasErrors(true);
      return false;
    }
    
    if (!wellParams?.shoeDepth) {
      setErrorMessage('Отсутствует глубина башмака. Вернитесь на шаг ввода параметров скважины.');
      setHasErrors(true);
      return false;
    }
    
    if (!wellParams?.hangerDepth) {
      setErrorMessage('Отсутствует глубина подвески. Вернитесь на шаг ввода параметров скважины.');
      setHasErrors(true);
      return false;
    }
    
    // Проверяем наличие данных о трубах
    if (!tubes || tubes.length === 0) {
      setErrorMessage('Отсутствуют данные о трубах. Вернитесь на шаг загрузки труб.');
      setHasErrors(true);
      return false;
    }
    
    // Проверяем наличие данных о патрубках
    if (!patrubki || patrubki.length === 0) {
      setErrorMessage('Отсутствуют данные о патрубках. Вернитесь на шаг загрузки патрубков.');
      setHasErrors(true);
      return false;
    }
    
    // Проверяем наличие данных об оборудовании
    if (!equipment || equipment.length === 0) {
      setErrorMessage('Отсутствуют данные об оборудовании. Вернитесь на шаг загрузки оборудования.');
      setHasErrors(true);
      return false;
    }
    
    // Проверим первый и последний элементы оборудования
    const firstEquipment = equipment[0];
    const lastEquipment = equipment[equipment.length - 1];
    
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
    const validTubes = tubes.filter(tube => {
      const length = getTubeLength(tube);
      return length > 0;
    });
    
    if (validTubes.length === 0) {
      setErrorMessage('Все трубы имеют нулевую длину. Проверьте данные труб.');
      setHasErrors(true);
      return false;
    }
    
    const validPatrubki = patrubki.filter(pat => {
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
    
    // Проверяем входные данные
    if (!validateData()) {
      setIsCalculating(false);
      return;
    }

    try {
      console.log('🔧 Начинаем расчёт меры:');
      console.log('• Параметры скважины:', wellParams);
      
      // Отображаем информацию о первых 5 трубах для отладки
      console.log('• Структура первых труб:', tubes.slice(0, 5));
      console.log('• Поля труб:', Object.keys(tubes[0] || {}));
      
      // Отображаем информацию о первых 5 патрубках для отладки
      console.log('• Структура первых патрубков:', patrubki.slice(0, 5));
      console.log('• Поля патрубков:', Object.keys(patrubki[0] || {}));
      
      console.log('• Общее количество труб:', tubes.length);
      console.log('• Общее количество патрубков:', patrubki.length);
      console.log('• Оборудование:', equipment);

      // Создаем преобразованные массивы для отображения
      const processedTubes = tubes.map((tube, index) => ({
        number: tube.number || tube['№№  п/п'] || tube.row || tube.id || `Т-${index + 1}`,
        length: getTubeLength(tube)
      }));
      
      const processedPatrubki = patrubki.map((pat, index) => ({
        number: pat.number || pat['№№  п/п'] || 'П-' + (pat.row || index + 1),
        length: getTubeLength(pat)
      }));
      
      console.log('• Трубы с длиной > 0:', processedTubes.filter(t => t.length > 0).length);
      console.log('• Патрубки с длиной > 0:', processedPatrubki.filter(p => p.length > 0).length);

      // Вызываем функцию расчета из утилит
      const calculationResults = calculateMera({
        depth: safeParseFloat(wellParams.depth),
        shoeDepth: safeParseFloat(wellParams.shoeDepth),
        hangerDepth: safeParseFloat(wellParams.hangerDepth),
        tubes: tubes,
        patrubki: patrubki,
        equipment: equipment
      });
      
      if (!calculationResults || calculationResults.length === 0) {
        setHasErrors(true);
        setErrorMessage('Не удалось выполнить расчет. Проверьте входные данные.');
      } else {
        // Убеждаемся, что результаты содержат правильные данные
        if (calculationResults[0]) {
          console.log(`✅ Первый элемент (подвеска) установлен на глубине ${calculationResults[0].topDepth}`);
        }
        
        setResults(calculationResults);
        console.log("Результаты расчёта:", calculationResults);
      }
    } catch (error) {
      console.error("Ошибка при расчёте:", error);
      setHasErrors(true);
      setErrorMessage(`Произошла ошибка при расчёте: ${error.message}`);
    } finally {
      setIsCalculating(false);
    }
  };

  // Функция для переключения развернутого состояния элемента
  const toggleExpanded = (index) => {
    setExpandedResults({
      ...expandedResults,
      [index]: !expandedResults[index]
    });
  };

  // Выполняем расчет при загрузке компонента
  useEffect(() => {
    performCalculation();
  }, []); // Пустой массив зависимостей - расчет только при монтировании

  // Функция для расчета текущей глубины установки трубы или патрубка
  const calculateItemDepth = (result, itemIndex, isPatrubka = false) => {
    // Специальная обработка для башмака - начальная точка
    const isBashmak = result.equipmentName.toLowerCase().includes('башмак');
    
    if (isBashmak) {
      // Для башмака всегда возвращаем его верх
      return result.topDepth;
    }
    
    if (isPatrubka) {
      // Для патрубков: начинаем от предыдущего, т.е. от последней установленной трубы
      // или от верха башмака, если нет труб
      
      // Если нет труб, берём верх оборудования 
      if (!result.tubesUsed || result.tubesUsed.length === 0) {
        return result.topDepth;
      }
      
      // Иначе берём стартовую глубину первой трубы
      let initialDepth = result.tubesUsed[0].startDepth || result.bottomDepth;
      
      // Вычитаем длины всех труб (идём вверх)
      for (let i = 0; i < result.tubesUsed.length; i++) {
        initialDepth -= result.tubesUsed[i].length;
      }
      
      // Теперь мы находимся в верхней точке последней трубы
      // Для каждого патрубка вычитаем его длину (идём дальше вверх)
      for (let i = 0; i < itemIndex; i++) {
        initialDepth -= result.patrubkiUsed[i].length;
      }
      
      return initialDepth;
    } else {
      // Для труб: всегда начинаем от точки, сохранённой при расчёте (startDepth)
      // Если есть - используем её, иначе используем низ оборудования
      
      if (result.tubesUsed[itemIndex].startDepth) {
        // Если указана стартовая глубина для трубы, используем её
        return result.tubesUsed[itemIndex].startDepth;
      }
      
      // Иначе вычисляем на основе предыдущих труб
      let depth = result.bottomDepth; // Начало от низа оборудования
      
      for (let i = 0; i < itemIndex; i++) {
        depth -= result.tubesUsed[i].length; // Перемещаемся вверх
      }
      
      return depth;
    }
  };

  return (
    <div className="calculate-mera">
      <div className="calculate-header">
        <h2>Расчет меры спуска</h2>
        <button onClick={onBack} className="back-button">
          ← Вернуться к оборудованию
        </button>
      </div>
      
      <div className="summary-section">
        <h3>Сводка данных:</h3>
        <div className="summary-table">
          <div className="summary-item">
            <span>Глубина скважины:</span> 
            <span>{wellParams?.depth || '—'} м</span>
          </div>
          <div className="summary-item">
            <span>Глубина башмака:</span> 
            <span>{wellParams?.shoeDepth || '—'} м</span>
          </div>
          <div className="summary-item">
            <span>Глубина подвески:</span> 
            <span>{wellParams?.hangerDepth || '—'} м</span>
          </div>
          <div className="summary-item">
            <span>Труб:</span> 
            <span>{tubes?.length || 0} шт.</span>
          </div>
          <div className="summary-item">
            <span>Патрубков:</span> 
            <span>{patrubki?.length || 0} шт.</span>
          </div>
          <div className="summary-item">
            <span>Оборудования:</span> 
            <span>{equipment?.length || 0} шт.</span>
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
                <th>Плановый интервал, м</th>
                <th>Примечание</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => {
                // Находим соответствующее оборудование для получения планового интервала
                const plannedInterval = equipment.find(eq => eq.name === result.equipmentName)?.interval || '-';
                const plannedTolerance = equipment.find(eq => eq.name === result.equipmentName)?.tolerance || 0;
                const eqLength = equipment.find(eq => eq.name === result.equipmentName)?.length || 0;
                
                // Определяем, есть ли у этого элемента трубы или патрубки для отображения
                const hasTubes = result.tubesUsed && result.tubesUsed.length > 0;
                const hasPatrubki = result.patrubkiUsed && result.patrubkiUsed.length > 0;
                const isExpandable = hasTubes || hasPatrubki;
                
                return (
                  <>
                    {/* Строка с оборудованием */}
                    <tr 
                      key={`eq-${index}`} 
                      className={`equipment-row ${result.note.includes('Ошибка') || result.note.includes('Не достигнута') || result.note.includes('Превышен') ? 'error-row' : ''}`}
                    >
                      <td>{index + 1}</td>
                      <td>
                        <div className="equipment-name">
                          {result.equipmentName}
                          {isExpandable && (
                            <button 
                              className="expand-button"
                              onClick={() => toggleExpanded(index)}
                            >
                              {expandedResults[index] ? '▼' : '▶'}
                            </button>
                          )}
                        </div>
                      </td>
                      <td>{safeParseFloat(eqLength).toFixed(2)}</td>
                      <td>{result.topDepth.toFixed(2)}</td>
                      <td>{result.bottomDepth.toFixed(2)}</td>
                      <td>{plannedInterval} ± {plannedTolerance}</td>
                      <td className={result.note.includes('Ошибка') || result.note.includes('Не достигнута') || result.note.includes('Превышен') ? 'error-note' : ''}>{result.note}</td>
                    </tr>
                    
                    {/* Отображаем трубы, если есть и если развернуто */}
                    {expandedResults[index] && hasTubes && result.tubesUsed.map((tube, tubeIndex) => {
                      // Для труб верхняя глубина - это стартовая глубина, а нижняя - верхняя + длина
                      const tubeStartDepth = tube.startDepth || calculateItemDepth(result, tubeIndex);
                      const tubeTopDepth = tubeStartDepth; // Верх трубы
                      const tubeBottomDepth = tubeTopDepth + tube.length; // Низ трубы (глубже)
                      const tubeNumber = tube.sequentialNumber || tubeIndex + 1;
                      
                      return (
                        <tr key={`tube-${index}-${tubeIndex}`} className="tube-row">
                          <td></td>
                          <td className="item-name">Труба №{tubeNumber}</td>
                          <td>{tube.length.toFixed(2)}</td>
                          <td>{tubeTopDepth.toFixed(2)}</td>
                          <td>{tubeBottomDepth.toFixed(2)}</td>
                          <td>-</td>
                          <td></td>
                        </tr>
                      );
                    })}
                    
                    {/* Отображаем патрубки, если есть и если развернуто */}
                    {expandedResults[index] && hasPatrubki && result.patrubkiUsed.map((pat, patIndex) => {
                      // Для патрубков нужно начать с верхней точки последней трубы
                      let patStartDepth;
                      
                      if (result.tubesUsed && result.tubesUsed.length > 0) {
                        // Если есть трубы, начинаем с верхней точки последней трубы
                        const lastTube = result.tubesUsed[result.tubesUsed.length - 1];
                        const lastTubeStartDepth = lastTube.startDepth || calculateItemDepth(result, result.tubesUsed.length - 1);
                        patStartDepth = lastTubeStartDepth;
                      } else {
                        // Если труб нет, начинаем с верха оборудования
                        patStartDepth = result.topDepth;
                      }
                      
                      // Теперь для каждого предыдущего патрубка вычитаем его длину (идём вверх)
                      for (let i = 0; i < patIndex; i++) {
                        patStartDepth -= result.patrubkiUsed[i].length;
                      }
                      
                      const patTopDepth = patStartDepth;
                      const patBottomDepth = patTopDepth + pat.length;
                      
                      return (
                        <tr key={`pat-${index}-${patIndex}`} className="patrubka-row">
                          <td></td>
                          <td className="item-name">Патрубок №{pat.number}</td>
                          <td>{pat.length.toFixed(2)}</td>
                          <td>{patTopDepth.toFixed(2)}</td>
                          <td>{patBottomDepth.toFixed(2)}</td>
                          <td>-</td>
                          <td></td>
                        </tr>
                      );
                    })}
                  </>
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