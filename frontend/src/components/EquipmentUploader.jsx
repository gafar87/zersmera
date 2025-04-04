import React, { useState } from 'react';
import './EquipmentUploader.css';

const defaultEquipment = [
  { name: 'Пакер подвеска', length: 2.6, interval: '', tolerance: 30 },
  { name: 'Башмак', length: 0.25, interval: '', tolerance: 3 }
];

const EquipmentUploader = ({ onNext, onBack, wellParams }) => {
  const [equipment, setEquipment] = useState(defaultEquipment);
  const [equipmentFile, setEquipmentFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Функция для обработки загрузки файла с оборудованием
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setEquipmentFile(file);
    setIsLoading(true);
    
    // Здесь должна быть логика чтения и обработки файла
    // Например, используя библиотеку xlsx
    
    // Для демонстрации просто создаем примерные данные
    setTimeout(() => {
      const totalDepth = wellParams?.depth || 3300;
      const newEquipment = [
        { name: 'Пакер подвеска', length: 2.6, interval: 0, tolerance: 30 },
        { name: 'Пакер обсаженного ствола', length: 0.72, interval: 2620.92, tolerance: 3 },
        { name: 'Пакер открытого ствола', length: 0.72, interval: 2690.19, tolerance: 3 },
        { name: 'Пакер открытого ствола', length: 0.72, interval: 2758.88, tolerance: 3 },
        { name: 'Муфта ГРП.84', length: 0.85, interval: 2782.56, tolerance: 3 },
        { name: 'Пакер открытого ствола', length: 0.72, interval: 2829.12, tolerance: 3 },
        { name: 'Муфта ГРП.80', length: 0.85, interval: 2875.21, tolerance: 3 },
        { name: 'Пакер открытого ствола', length: 0.72, interval: 2921.91, tolerance: 3 },
        { name: 'Муфта ГРП.77', length: 0.85, interval: 3002.98, tolerance: 3 },
        { name: 'Пакер открытого ствола', length: 0.72, interval: 3085.41, tolerance: 3 },
        { name: 'Муфта ГРП.74', length: 0.85, interval: 3144.21, tolerance: 3 },
        { name: 'Пакер открытого ствола', length: 0.72, interval: 3222.96, tolerance: 3 },
        { name: 'Муфта ГРП ФПР.114', length: 0.85, interval: 3268.46, tolerance: 3 },
        { name: 'Гидравлически фрак порт', length: 1.3, interval: 3269.31, tolerance: 3 },
        { name: 'Башмак', length: 0.25, interval: totalDepth, tolerance: 3 }
      ];
      
      setEquipment(newEquipment);
      setIsLoading(false);
    }, 1000);
  };
  
  // Обработка ручного добавления оборудования
  const handleAddEquipment = () => {
    setEquipment([...equipment, { name: '', length: 0, interval: '', tolerance: 3 }]);
  };
  
  // Обработка изменения полей оборудования
  const handleEquipmentChange = (index, field, value) => {
    const updatedEquipment = [...equipment];
    updatedEquipment[index][field] = value;
    setEquipment(updatedEquipment);
  };
  
  // Обработка удаления оборудования
  const handleRemoveEquipment = (index) => {
    const updatedEquipment = [...equipment];
    updatedEquipment.splice(index, 1);
    setEquipment(updatedEquipment);
  };
  
  // Обработка перемещения оборудования вверх/вниз
  const handleMoveEquipment = (index, direction) => {
    if ((direction === -1 && index === 0) || 
        (direction === 1 && index === equipment.length - 1)) {
      return;
    }
    
    const updatedEquipment = [...equipment];
    const temp = updatedEquipment[index];
    updatedEquipment[index] = updatedEquipment[index + direction];
    updatedEquipment[index + direction] = temp;
    setEquipment(updatedEquipment);
  };
  
  // Проверка данных перед отправкой
  const handleSubmit = () => {
    // Проверка на пустые поля
    const hasEmptyFields = equipment.some(item => 
      !item.name || !item.length
    );
    
    if (hasEmptyFields) {
      alert('Заполните название и длину для всего оборудования');
      return;
    }
    
    // Проверка корректности интервалов
    const firstItem = equipment[0];
    const lastItem = equipment[equipment.length - 1];
    
    if (firstItem.name.toLowerCase().includes('подвеска') === false) {
      alert('Первый элемент должен быть подвеской');
      return;
    }
    
    if (lastItem.name.toLowerCase().includes('башмак') === false) {
      alert('Последний элемент должен быть башмаком');
      return;
    }
    
    // Сортируем оборудование по интервалу
    const sortedEquipment = [...equipment].sort((a, b) => {
      return parseFloat(a.interval) - parseFloat(b.interval);
    });
    
    // Переходим к следующему шагу
    onNext(sortedEquipment);
  };
  
  // Функция для преобразования строки с запятой в число
  const safeParseFloat = (value) => {
    if (typeof value === 'number') return value;
    const normalized = String(value).replace(',', '.');
    return parseFloat(normalized) || 0;
  };
  
  return (
    <div className="equipment-uploader">
      <div className="equipment-header">
        <h2>Загрузка оборудования</h2>
        <button onClick={onBack} className="back-button">
          ← Назад
        </button>
      </div>
      
      <div className="equipment-params">
        <div className="well-params-summary">
          <h3>Параметры скважины:</h3>
          <div className="params-grid">
            <div>Глубина скважины:</div>
            <div>{wellParams?.depth || 'Не указана'} м</div>
          </div>
        </div>
      </div>
      
      <div className="upload-section">
        <div className="file-upload">
          <h3>Загрузить из файла:</h3>
          <input 
            type="file" 
            accept=".xlsx,.xls,.csv" 
            onChange={handleFileUpload}
            disabled={isLoading}
          />
          {isLoading && <div className="loading">Загрузка данных...</div>}
        </div>
      </div>
      
      <div className="equipment-table-container">
        <h3>Список оборудования:</h3>
        <div className="table-controls">
          <button onClick={handleAddEquipment} className="add-button">
            + Добавить оборудование
          </button>
        </div>
        
        <table className="equipment-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Название</th>
              <th>Длина, м</th>
              <th>Интервал установки, м</th>
              <th>Допуск ±, м</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleEquipmentChange(index, 'name', e.target.value)}
                    placeholder="Название"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.length}
                    onChange={(e) => handleEquipmentChange(index, 'length', safeParseFloat(e.target.value))}
                    placeholder="Длина"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.interval}
                    onChange={(e) => handleEquipmentChange(index, 'interval', safeParseFloat(e.target.value))}
                    placeholder="Интервал"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.tolerance}
                    onChange={(e) => handleEquipmentChange(index, 'tolerance', safeParseFloat(e.target.value))}
                    placeholder="Допуск"
                  />
                </td>
                <td className="equipment-actions">
                  <button onClick={() => handleMoveEquipment(index, -1)} disabled={index === 0}>
                    ▲
                  </button>
                  <button onClick={() => handleMoveEquipment(index, 1)} disabled={index === equipment.length - 1}>
                    ▼
                  </button>
                  <button onClick={() => handleRemoveEquipment(index)}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="navigation-buttons">
        <button onClick={handleSubmit} className="next-button">
          Перейти к расчету
        </button>
      </div>
    </div>
  );
};

export default EquipmentUploader; 