import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import EquipmentInput from "./EquipmentInput";
import TubeCanvas from "./TubeCanvas";
import calculateMera from "../utils/calculateMera";

function TubeUploader({ onNext, onBack = () => {}, wellParams }) {
  // ======== TUBES ========
  const [file, setFile] = useState(null);             // файл с трубами
  const [sheets, setSheets] = useState([]);           // вкладки
  const [selectedSheet, setSelectedSheet] = useState("");
  const [columns, setColumns] = useState([]);         // список заголовков
  const [mapping, setMapping] = useState({
    pipeNumber: "",
    length: "",
    manufacturer: "",
    wallThickness: "",
    row: "",
  });
  const [tubeData, setTubeData] = useState([]);        // вся таблица труб
  const [showTubePreview, setShowTubePreview] = useState(false);

  // ======== PATRUBKI ========
  const [patrubFile, setPatrubFile] = useState(null);
  const [patrubSheets, setPatrubSheets] = useState([]);
  const [selectedPatrubSheet, setSelectedPatrubSheet] = useState("");
  const [patrubColumns, setPatrubColumns] = useState([]);
  const [patrubMapping, setPatrubMapping] = useState({
    number: "",
    length: "",
    name: "",
  });
  const [patrubData, setPatrubData] = useState([]);
  const [showPatrubPreview, setShowPatrubPreview] = useState(false);

  // ======== EQUIPMENT ========
  const [equipmentFile, setEquipmentFile] = useState(null);
  const [equipmentSheets, setEquipmentSheets] = useState([]);
  const [selectedEquipmentSheet, setSelectedEquipmentSheet] = useState("");
  const [equipmentColumns, setEquipmentColumns] = useState([]);
  const [equipmentMapping, setEquipmentMapping] = useState({
    name: "",
    length: "",
    plannedDepth: "",
    tolerance: "",
    depth: "",
  });
  const [equipmentData, setEquipmentData] = useState([]);
  
  // ======== СОХРАНЕНИЕ ДАННЫХ В LOCALSTORAGE ========
  // Загрузка данных из localStorage при монтировании компонента
  useEffect(() => {
    const savedData = localStorage.getItem('tubeUploader');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        // Восстанавливаем данные из localStorage
        if (parsedData.tubeData) setTubeData(parsedData.tubeData);
        if (parsedData.patrubData) setPatrubData(parsedData.patrubData);
        if (parsedData.equipmentData) setEquipmentData(parsedData.equipmentData);
        
        // Восстанавливаем настройки маппинга
        if (parsedData.mapping) setMapping(parsedData.mapping);
        if (parsedData.patrubMapping) setPatrubMapping(parsedData.patrubMapping);
        if (parsedData.equipmentMapping) setEquipmentMapping(parsedData.equipmentMapping);
        
        console.log('✅ Данные успешно восстановлены из localStorage');
      } catch (error) {
        console.error('Ошибка при восстановлении данных из localStorage:', error);
      }
    }
  }, []);
  
  // Сохранение данных в localStorage при изменении
  useEffect(() => {
    if (tubeData.length > 0 || patrubData.length > 0 || equipmentData.length > 0) {
      const dataToSave = {
        tubeData,
        patrubData,
        equipmentData,
        mapping,
        patrubMapping,
        equipmentMapping
      };
      
      localStorage.setItem('tubeUploader', JSON.stringify(dataToSave));
      console.log('💾 Данные сохранены в localStorage');
    }
  }, [tubeData, patrubData, equipmentData, mapping, patrubMapping, equipmentMapping]);

  const handleClearEquipment = () => setEquipmentData([]);

  // ======================================================
  // ===============   HELPER MODAL RENDER  ===============
  // ======================================================
  const renderModal = (data, onClose) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white max-h-[80vh] overflow-y-auto p-6 rounded shadow-xl w-full max-w-5xl relative">
        <button onClick={onClose} className="absolute top-2 right-4 text-2xl">×</button>
        <table className="w-full text-sm">
          <thead>
            <tr>
              {Object.keys(data[0] || {}).map((key) => (
                <th key={key} className="px-2 py-1 border-b text-left font-medium">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className="border-t">
                {Object.values(row).map((val, i) => (
                  <td key={i} className="px-2 py-1">{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ======================================================
  // ===============   TUBES LOADING/MAPPING  =============
  // ======================================================
  const handleTubeFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile || !selectedFile.name.endsWith(".xlsx")) return;
    setFile(selectedFile);

    // Считываем Excel, вытягиваем заголовки, весь массив данных
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const allSheets = workbook.SheetNames;
      setSheets(allSheets);
      // сразу выберем первую вкладку
      const sheetName = allSheets[0];
      setSelectedSheet(sheetName);

      // получаем заголовки:
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      if (json.length > 0) {
        setColumns(Object.keys(json[0]));
        setTubeData(json);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleSheetChange = (e) => {
    const sheetName = e.target.value;
    setSelectedSheet(sheetName);

    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      if (json.length > 0) {
        setColumns(Object.keys(json[0]));
        setTubeData(json);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleTubeMappingChange = (e) => {
    setMapping((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ======================================================
  // ===============   PATRUBKI LOADING/MAPPING  ==========
  // ======================================================
  const handlePatrubFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile || !selectedFile.name.endsWith(".xlsx")) return;
    setPatrubFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const allSheets = workbook.SheetNames;
      setPatrubSheets(allSheets);

      const sheetName = allSheets[0];
      setSelectedPatrubSheet(sheetName);

      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      if (json.length > 0) {
        setPatrubColumns(Object.keys(json[0]));
        setPatrubData(json);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handlePatrubSheetChange = (e) => {
    const sheetName = e.target.value;
    setSelectedPatrubSheet(sheetName);

    if (!patrubFile) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      if (json.length > 0) {
        setPatrubColumns(Object.keys(json[0]));
        setPatrubData(json);
      }
    };
    reader.readAsArrayBuffer(patrubFile);
  };

  const handlePatrubMappingChange = (e) => {
    setPatrubMapping((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ======================================================
  // ===============   EQUIPMENT LOADING/MAPPING  =========
  // ======================================================
  const handleEquipmentFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile || !selectedFile.name.endsWith(".xlsx")) return;
    setEquipmentFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const allSheets = workbook.SheetNames;
      setEquipmentSheets(allSheets);

      const sheetName = allSheets[0];
      setSelectedEquipmentSheet(sheetName);

      // Только заголовки, дальше мапим:
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      if (json.length > 0) {
        setEquipmentColumns(Object.keys(json[0]));
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleEquipmentSheetChange = (e) => {
    const sheetName = e.target.value;
    setSelectedEquipmentSheet(sheetName);

    if (!equipmentFile) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      if (json.length > 0) {
        setEquipmentColumns(Object.keys(json[0]));
      }
    };
    reader.readAsArrayBuffer(equipmentFile);
  };

  const handleEquipmentMappingChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...equipmentMapping, [name]: value };
    setEquipmentMapping(updated);

    if (!equipmentFile) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[selectedEquipmentSheet];
      const json = XLSX.utils.sheet_to_json(worksheet);
      const mapped = json.map((row) => {
        // Получаем значения из таблицы
        const name = row[updated.name] || "";
        const length = parseFloat((row[updated.length] || "").toString().replace(",", ".")) || 0;
        const plannedDepth = parseFloat((row[updated.plannedDepth] || "").toString().replace(",", ".")) || 0;
        const tolerance = parseFloat((row[updated.tolerance] || "").toString().replace(",", ".")) || 0;
        const depth = parseFloat((row[updated.depth] || "").toString().replace(",", ".")) || 0;
        
        // Рассчитываем интервал на основе плановой глубины и погрешности
        const minDepth = plannedDepth > 0 ? plannedDepth - tolerance : '';
        const maxDepth = plannedDepth > 0 ? plannedDepth + tolerance : '';
        const interval = plannedDepth > 0 ? plannedDepth : '';
        
        return {
          name,
          length,
          plannedDepth,
          tolerance,
          interval,
          minDepth,
          maxDepth,
          depth
        };
      });
      setEquipmentData(mapped);
    };
    reader.readAsArrayBuffer(equipmentFile);
  };

  const [meraResult, setMeraResult] = useState(null);

  const handleCalculate = () => {
    const result = calculateMera({
      depth: parseFloat(wellParams.depth),
      shoeDepth: parseFloat(wellParams.shoeDepth),
      hangerDepth: parseFloat(wellParams.hangerDepth),
      hangerTolerance: parseFloat(wellParams.hangerTolerance),
      tubes: tubeData,
      patrubki: patrubData,
      equipment: equipmentData,
    });
  
    setMeraResult(result);
  };
  
  // ======================================================
  // ===============   FINAL SUBMIT  ======================
  // ======================================================
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Проверяем данные перед отправкой
    if (!validateData()) {
      return;
    }
    
    // Проверяем размер данных
    if (!validateDataSize()) {
      return;
    }
    
    // Подготавливаем данные для передачи
    const processedTubeData = tubeData.map((tube, index) => ({
      ...tube,
      number: tube[mapping.pipeNumber] || index + 1,
      length: parseFloat((tube[mapping.length] || "").toString().replace(",", ".")) || 0,
      manufacturer: tube[mapping.manufacturer] || "",
      wallThickness: tube[mapping.wallThickness] || "",
      row: tube[mapping.row] || "1",
    }));
    
    const processedPatrubData = patrubData.map((patrub, index) => ({
      ...patrub,
      number: patrub[patrubMapping.number] || index + 1,
      length: parseFloat((patrub[patrubMapping.length] || "").toString().replace(",", ".")) || 0,
      name: patrub[patrubMapping.name] || `Патрубок ${index + 1}`,
    }));
    
    // Здесь отдаём всё, что нужно
    onNext({
      tubes: {
        file,
        sheet: selectedSheet,
        mapping,
        data: processedTubeData,
      },
      patrubki: {
        file: patrubFile,
        sheet: selectedPatrubSheet,
        mapping: patrubMapping,
        data: processedPatrubData,
      },
      equipment: equipmentData,
    });

    console.log('📊 Переходим к расчету с данными:');
    console.log('• Трубы:', processedTubeData.length);
    console.log('• Патрубки:', processedPatrubData.length);
    console.log('• Оборудование:', equipmentData);
  };

  // Функция валидации данных перед переходом к расчетам
  const validateData = () => {
    // Проверка наличия необходимых данных
    if (!tubeData || tubeData.length === 0) {
      alert('Необходимо загрузить данные о трубах');
      return false;
    }
    
    if (!patrubData || patrubData.length === 0) {
      alert('Необходимо загрузить данные о патрубках');
      return false;
    }
    
    if (!equipmentData || equipmentData.length === 0) {
      alert('Необходимо добавить оборудование');
      return false;
    }
    
    // Проверка наличия подвески и башмака
    const hasHanger = equipmentData.some(eq => 
      eq.name && eq.name.toLowerCase().includes('подвеска')
    );
    
    const hasShoe = equipmentData.some(eq => 
      eq.name && eq.name.toLowerCase().includes('башмак')
    );
    
    if (!hasHanger) {
      alert('В списке оборудования должна быть подвеска (первый элемент)');
      return false;
    }
    
    if (!hasShoe) {
      alert('В списке оборудования должен быть башмак (последний элемент)');
      return false;
    }
    
    // Проверка порядка элементов
    const hangerIndex = equipmentData.findIndex(eq => 
      eq.name && eq.name.toLowerCase().includes('подвеска')
    );
    
    const shoeIndex = equipmentData.findIndex(eq => 
      eq.name && eq.name.toLowerCase().includes('башмак')
    );
    
    if (hangerIndex !== 0) {
      alert('Подвеска должна быть первым элементом в списке оборудования');
      return false;
    }
    
    if (shoeIndex !== equipmentData.length - 1) {
      alert('Башмак должен быть последним элементом в списке оборудования');
      return false;
    }
    
    return true;
  };

  // Обработчик для предпросмотра/расчета меры
  const mappedTubes = tubeData.map((row, index) => ({
    number: row[mapping.pipeNumber] || index + 1,
    length: parseFloat((row[mapping.length] || "").toString().replace(",", ".")) || 0,
    row: row[mapping.row] || "1",
  }));

  const validateDataSize = () => {
    const MAX_TUBES = 300;
    const MAX_PATRUBKI = 50;
    const MAX_EQUIPMENT = 100;
    
    let hasErrors = false;
    let errorMessage = '';
    
    if (tubeData.length > MAX_TUBES) {
      errorMessage += `Превышен лимит количества труб: ${tubeData.length}/${MAX_TUBES}. `;
      hasErrors = true;
    }
    
    if (patrubData.length > MAX_PATRUBKI) {
      errorMessage += `Превышен лимит количества патрубков: ${patrubData.length}/${MAX_PATRUBKI}. `;
      hasErrors = true;
    }
    
    if (equipmentData.length > MAX_EQUIPMENT) {
      errorMessage += `Превышен лимит количества оборудования: ${equipmentData.length}/${MAX_EQUIPMENT}. `;
      hasErrors = true;
    }
    
    if (hasErrors) {
      alert(`⚠️ ${errorMessage}\nРекомендуется уменьшить количество элементов, иначе приложение может работать медленно или зависнуть.`);
      return false;
    }
    
    return true;
  };

  const handleClearStorage = () => {
    if (confirm('Вы уверены, что хотите очистить все данные из локального хранилища? Это действие нельзя отменить.')) {
      try {
        console.log('🧹 Начинаем очистку хранилища...');
        
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
        setTubeData([]);
        setPatrubData([]);
        setEquipmentData([]);
        setFile(null);
        setPatrubFile(null);
        setEquipmentFile(null);
        setColumns([]);
        setPatrubColumns([]);
        setEquipmentColumns([]);
        setSheets([]);
        setPatrubSheets([]);
        setEquipmentSheets([]);
        setSelectedSheet("");
        setSelectedPatrubSheet("");
        setSelectedEquipmentSheet("");
        setMapping({
          pipeNumber: "",
          length: "",
          manufacturer: "",
          wallThickness: "",
          row: "",
        });
        setPatrubMapping({
          number: "",
          length: "",
          name: "",
        });
        setEquipmentMapping({
          name: "",
          length: "",
          plannedDepth: "",
          tolerance: "",
          depth: "",
        });
        setShowTubePreview(false);
        setShowPatrubPreview(false);
        
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

  // ======================================================
  // ===============   RENDER COMPONENT  ===================
  // ======================================================
  return (
    <form onSubmit={handleSubmit} className="space-y-10 bg-white p-6 rounded shadow-md max-w-4xl mx-auto mt-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-800">Загрузка данных</h1>
        <div className="flex gap-2">
          {onBack && (
            <button 
              type="button" 
              onClick={onBack} 
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            >
              ← Назад
            </button>
          )}
          <button 
            type="button" 
            onClick={handleClearStorage} 
            className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200"
          >
            🗑️ Очистить хранилище
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md">
        <p className="text-yellow-800">
          <strong>⚠️ Ограничения:</strong> Рекомендуемые лимиты данных для стабильной работы приложения:
        </p>
        <ul className="list-disc ml-5 mt-1 text-yellow-800">
          <li>Трубы: не более 300 шт.</li>
          <li>Патрубки: не более 50 шт.</li>
          <li>Оборудование: не более 100 шт.</li>
        </ul>
        <p className="text-yellow-800 mt-2">
          При превышении лимитов приложение может работать медленно или зависнуть.
        </p>
      </div>
      
      {/* ============= TUBES ============= */}
      <h2 className="text-xl font-bold text-blue-700">Загрузка труб</h2>
      <div className="flex items-center gap-2">
        <input type="file" accept=".xlsx" onChange={handleTubeFileChange} className="input w-auto" />
        {file && <span className="text-sm text-gray-600">Файл: {file.name}</span>}
        {tubeData.length > 0 && (
          <button
            type="button"
            onClick={() => setShowTubePreview(true)}
            className="bg-gray-200 text-blue-600 text-sm px-3 py-1 rounded hover:bg-gray-300"
          >
            🔍 Предпросмотр труб
          </button>
        )}
      </div>

      {/* Визуализация труб */}
      {tubeData.length > 0 && mapping.pipeNumber && mapping.length && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-blue-700 mb-2">Визуализация труб</h2>
          <TubeCanvas tubes={mappedTubes} />
        </div>
      )}

      {/* Выбор вкладки и маппинг полей для труб */}
      {sheets.length > 1 && (
        <div className="mt-2">
          <label className="text-sm font-medium">Выберите лист</label>
          <select value={selectedSheet} onChange={handleSheetChange} className="input mt-1">
            {sheets.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
      
      {columns.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-2">
          {[
            { label: "№ трубы (обяз.)", name: "pipeNumber" },
            { label: "Длина (обяз.)", name: "length" },
            { label: "Заводской №", name: "manufacturer" },
            { label: "Толщина стенки", name: "wallThickness" },
            { label: "Ряд (необяз.)", name: "row" },
          ].map(({ label, name }) => (
            <div key={name}>
              <label className="block text-sm font-medium">{label}</label>
              <select
                name={name}
                value={mapping[name]}
                onChange={handleTubeMappingChange}
                className="input"
              >
                <option value="">— Не выбрано —</option>
                {columns.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* ============= PATRUBKI ============= */}
      <h2 className="text-xl font-bold text-blue-700">Загрузка патрубков</h2>
      <div className="flex items-center gap-2">
        <input type="file" accept=".xlsx" onChange={handlePatrubFileChange} className="input w-auto" />
        {patrubFile && <span className="text-sm text-gray-600">Файл: {patrubFile.name}</span>}
        {patrubData.length > 0 && (
          <button
            type="button"
            onClick={() => setShowPatrubPreview(true)}
            className="bg-gray-200 text-blue-600 text-sm px-3 py-1 rounded hover:bg-gray-300"
          >
            🔍 Предпросмотр патрубков
          </button>
        )}
      </div>
      
      {/* Выбор вкладки и маппинг полей для патрубков */}
      {patrubSheets.length > 1 && (
        <div className="mt-2">
          <label className="text-sm font-medium">Выберите лист</label>
          <select value={selectedPatrubSheet} onChange={handlePatrubSheetChange} className="input mt-1">
            {patrubSheets.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}
      
      {patrubColumns.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-2">
          {[
            { label: "№ патрубка (обяз.)", name: "number" },
            { label: "Длина (обяз.)", name: "length" },
            { label: "Название", name: "name" },
          ].map(({ label, name }) => (
            <div key={name}>
              <label className="block text-sm font-medium">{label}</label>
              <select
                name={name}
                value={patrubMapping[name]}
                onChange={handlePatrubMappingChange}
                className="input"
              >
                <option value="">— Не выбрано —</option>
                {patrubColumns.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* ============= EQUIPMENT ============= */}
      <h2 className="text-xl font-bold text-blue-700">Оборудование</h2>
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept=".xlsx"
          onChange={handleEquipmentFileChange}
          className="input w-auto"
        />
        {equipmentFile && <span className="text-sm text-gray-600">Файл: {equipmentFile.name}</span>}
      </div>

      {/* Выбор вкладки для оборудования */}
      {equipmentSheets.length > 1 && (
        <div className="mt-2">
          <label className="text-sm font-medium">Выберите лист</label>
          <select
            value={selectedEquipmentSheet}
            onChange={handleEquipmentSheetChange}
            className="input mt-1"
          >
            {equipmentSheets.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {/* Маппинг полей для оборудования */}
      {equipmentColumns.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-2">
          {[
            { label: "Название", name: "name" },
            { label: "Длина", name: "length" },
            { label: "Плановая глубина", name: "plannedDepth" },
            { label: "Погрешность ±", name: "tolerance" },
            { label: "Глубина", name: "depth" },
          ].map(({ label, name }) => (
            <div key={name}>
              <label className="block text-sm font-medium">{label}</label>
              <select
                name={name}
                value={equipmentMapping[name]}
                onChange={handleEquipmentMappingChange}
                className="input"
              >
                <option value="">— Не выбрано —</option>
                {equipmentColumns.map((col) => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Редактирование списка оборудования */}
      <EquipmentInput onChange={setEquipmentData} initialData={equipmentData} />
      <div className="mt-4">
        <button
          type="button"
          onClick={handleClearEquipment}
          className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200"
        >
          Очистить оборудование
        </button>
      </div>

      {/* Важное сообщение о порядке оборудования */}
      <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md">
        <p className="text-yellow-800">
          <strong>⚠️ Важно:</strong> Первым элементом в списке оборудования должна быть <strong>подвеска</strong>, 
          а последним — <strong>башмак</strong>. Используйте перетаскивание для правильного порядка элементов.
        </p>
      </div>

      {/* SUBMIT */}
      <div className="flex justify-end mt-6">
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Перейти к расчету
        </button>
      </div>

      {/* MODALS */}
      {showTubePreview && renderModal(tubeData, () => setShowTubePreview(false))}
      {showPatrubPreview && renderModal(patrubData, () => setShowPatrubPreview(false))}
    </form>
  );
}

export default TubeUploader;
