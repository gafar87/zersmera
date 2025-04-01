import { useState } from "react";

function FileUploader({ onFileSelect }) {
  const [fileName, setFileName] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".xlsx")) {
      setFileName(file.name);
      onFileSelect(file);
    } else {
      alert("Пожалуйста, выберите Excel-файл (.xlsx)");
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md w-full max-w-md mx-auto mt-10">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Загрузите файл Excel (.xlsx)
      </label>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleChange}
        className="block w-full text-sm text-gray-600
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
      />
      {fileName && (
        <p className="mt-2 text-green-600 text-sm">Загружен: {fileName}</p>
      )}
    </div>
  );
}

export default FileUploader;
