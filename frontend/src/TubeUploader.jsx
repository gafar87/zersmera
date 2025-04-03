import React, { useState } from "react";
import * as XLSX from "xlsx";



function TubeUploader({ onNext }) {
  const [fileName, setFileName] = useState(null);
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState({
    number: "",
    length: "",
    serial: "",
    thickness: "",
    row: "",
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const headers = json[0] || [];

      setColumns(headers);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSelectChange = (e) => {
    setMapping((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mapping.number || !mapping.length || !mapping.row) {
      alert("Выберите обязательные поля: № трубы, длина и ряд.");
      return;
    }
    onNext({ mapping, fileName });
  };

  return (
    <div className="bg-white shadow-md rounded p-6 w-full max-w-3xl mx-auto mt-10 space-y-4">
      <h2 className="text-xl font-bold text-blue-700 mb-4">📦 Загрузка труб</h2>

      <input type="file" accept=".xlsx" onChange={handleFileChange} className="input" />

      {columns.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">Выберите соответствие столбцов:</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm">№ трубы *</label>
              <select name="number" className="input" value={mapping.number} onChange={handleSelectChange}>
                <option value="">—</option>
                {columns.map((col, i) => (
                  <option key={i} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm">Длина *</label>
              <select name="length" className="input" value={mapping.length} onChange={handleSelectChange}>
                <option value="">—</option>
                {columns.map((col, i) => (
                  <option key={i} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm">Заводской номер</label>
              <select name="serial" className="input" value={mapping.serial} onChange={handleSelectChange}>
                <option value="">—</option>
                {columns.map((col, i) => (
                  <option key={i} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm">Толщина стенки</label>
              <select name="thickness" className="input" value={mapping.thickness} onChange={handleSelectChange}>
                <option value="">—</option>
                {columns.map((col, i) => (
                  <option key={i} value={col}>{col}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm">Ряд *</label>
              <select name="row" className="input" value={mapping.row} onChange={handleSelectChange}>
                <option value="">—</option>
                {columns.map((col, i) => (
                  <option key={i} value={col}>{col}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">* Обязательные поля</span>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Продолжить
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default TubeUploader;
