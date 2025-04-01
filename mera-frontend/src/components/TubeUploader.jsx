import React, { useState } from "react";
import * as XLSX from "xlsx";
import EquipmentInput from "./EquipmentInput";

function TubeUploader({ onNext }) {
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
    interval: "",
    tolerance: "",
  });
  const [equipmentData, setEquipmentData] = useState([]);
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
      const mapped = json.map((row) => ({
        name: row[updated.name] || "",
        length: parseFloat((row[updated.length] || "").toString().replace(",", ".")) || "",
        interval: row[updated.interval] || "",
        tolerance: parseFloat((row[updated.tolerance] || "").toString().replace(",", ".")) || "",
      }));
      setEquipmentData(mapped);
    };
    reader.readAsArrayBuffer(equipmentFile);
  };

  // ======================================================
  // ===============   FINAL SUBMIT  ======================
  // ======================================================
  const handleSubmit = (e) => {
    e.preventDefault();
    // Здесь отдаём всё, что нужно
    onNext({
      tubes: {
        file,
        sheet: selectedSheet,
        mapping,
        data: tubeData,
      },
      patrubki: {
        file: patrubFile,
        sheet: selectedPatrubSheet,
        mapping: patrubMapping,
        data: patrubData,
      },
      equipment: equipmentData,
    });
  };

  // ======================================================
  // ===============   RENDER COMPONENT  ===================
  // ======================================================
  return (
    <form onSubmit={handleSubmit} className="space-y-10 bg-white p-6 rounded shadow-md max-w-4xl mx-auto mt-10">
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
      {/* Если есть несколько вкладок */}
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
      {/* Выбор столбцов */}
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

      {/* Если несколько вкладок */}
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

      {/* Выбор столбцов */}
      {equipmentColumns.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mt-2">
          {[
            { label: "Название", name: "name" },
            { label: "Длина", name: "length" },
            { label: "Интервал", name: "interval" },
            { label: "Допуск ±", name: "tolerance" },
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

      {/* Само редактирование перетаскиваемого списка */}
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

      {/* SUBMIT */}
      <div className="flex justify-end mt-6">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Далее
        </button>
      </div>

      {/* MODALS */}
      {showTubePreview && renderModal(tubeData, () => setShowTubePreview(false))}
      {showPatrubPreview && renderModal(patrubData, () => setShowPatrubPreview(false))}
    </form>
  );
}

export default TubeUploader;
