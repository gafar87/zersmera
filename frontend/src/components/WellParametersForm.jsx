import { useState, useEffect } from "react";

function WellParametersForm({ onNext, initialData }) {
  const [wellParams, setWellParams] = useState({
    wellNumber: "6334",
    wellPad: "46",
    field: "Ем-Еговский + Пальяновский ЛУ",
    runDate: "2025-03-12",
    depth: "3348",
    casingOD: "114.3",
    casingWeight: "",
    casingSteel: "P-110",
    casingID: "97.1",
    openHole: "155.6",
    volumePerMeter: "",
  });

  const [centralizer, setCentralizer] = useState({
    name: "",
    quantity: "",
    interval: "1/2",
  });

  useEffect(() => {
    if (initialData) {
      console.log("📋 Загружаем сохраненные данные в форму:", initialData);
      if (initialData.wellParams) {
        setWellParams(prev => ({
          ...prev,
          ...initialData.wellParams
        }));
      } else {
        setWellParams(prev => ({
          ...prev,
          depth: initialData.depth || prev.depth,
        }));
      }
      
      if (initialData.centralizer) {
        setCentralizer(initialData.centralizer);
      }
    }
  }, [initialData]);

  useEffect(() => {
    calculatePipeWeight();
  }, [wellParams.casingOD, wellParams.casingID]);

  const calculatePipeWeight = () => {
    const outerDiameter = parseFloat(wellParams.casingOD);
    const innerDiameter = parseFloat(wellParams.casingID);
    
    if (!isNaN(outerDiameter) && !isNaN(innerDiameter) && outerDiameter > innerDiameter) {
      const steelDensity = 7850; // кг/м³ - средняя плотность стали
      const outerRadius = outerDiameter / 2000; // перевод в м
      const innerRadius = innerDiameter / 2000; // перевод в м
      
      // Площадь сечения трубы (м²)
      const area = Math.PI * (outerRadius * outerRadius - innerRadius * innerRadius);
      
      // Вес трубы (кг/м)
      const weight = area * steelDensity;
      
      setWellParams(prev => ({
        ...prev,
        casingWeight: weight.toFixed(2)
      }));
    }
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setWellParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleCentralizerChange = (e) => {
    const { name, value } = e.target;
    setCentralizer((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setWellParams({
      wellNumber: "",
      wellPad: "",
      field: "",
      runDate: "",
      depth: "",
      casingOD: "",
      casingWeight: "",
      casingSteel: "",
      casingID: "",
      openHole: "",
      volumePerMeter: "",
    });
    setCentralizer({ name: "", quantity: "", interval: "1/2" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { depth } = wellParams;
    const depthNum = parseFloat(depth);

    if (isNaN(depthNum)) {
      alert("❌ Значение глубины скважины должно быть числовым.");
      return;
    }

    onNext({ 
      wellParams, 
      centralizer,
      depth: depthNum,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-6 w-full max-w-4xl mx-auto mt-10 space-y-6">
      <h2 className="text-xl font-bold text-blue-700">Основные параметры скважины</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Скважина</label>
          <input
            name="wellNumber"
            placeholder="Скважина"
            value={wellParams.wellNumber}
            onChange={handleParamChange}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Куст</label>
          <input
            name="wellPad"
            placeholder="Куст"
            value={wellParams.wellPad}
            onChange={handleParamChange}
            className="input"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Месторождение</label>
          <input
            name="field"
            placeholder="Месторождение"
            value={wellParams.field}
            onChange={handleParamChange}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Дата спуска</label>
          <input
            name="runDate"
            type="date"
            placeholder="Дата спуска"
            value={wellParams.runDate}
            onChange={handleParamChange}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Глубина скважины, м</label>
          <input
            name="depth"
            placeholder="Глубина скважины, м"
            value={wellParams.depth}
            onChange={handleParamChange}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Открытый ствол (mm)</label>
          <input
            name="openHole"
            placeholder="Открытый ствол (mm)"
            value={wellParams.openHole}
            onChange={handleParamChange}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Колонна (mm)</label>
          <input
            name="casingOD"
            placeholder="Колонна (mm)"
            value={wellParams.casingOD}
            onChange={handleParamChange}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Внутренний диаметр колонны (mm)</label>
          <input
            name="casingID"
            placeholder="Внутренний диаметр колонны"
            value={wellParams.casingID}
            onChange={handleParamChange}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Вес (kg/m)</label>
          <input
            name="casingWeight"
            placeholder="Вес (kg/m)"
            value={wellParams.casingWeight}
            onChange={handleParamChange}
            className="input bg-gray-100"
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">Рассчитывается автоматически</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Сталь</label>
          <input
            name="casingSteel"
            placeholder="Сталь"
            value={wellParams.casingSteel}
            onChange={handleParamChange}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Удельный объем (м³/м)</label>
          <input
            name="volumePerMeter"
            placeholder="Удельный объем (м³/м)"
            value={wellParams.volumePerMeter}
            onChange={handleParamChange}
            className="input"
          />
        </div>
      </div>

      <h2 className="text-xl font-bold text-blue-700 mt-6">Параметры центраторов</h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Название</label>
          <input
            name="name"
            placeholder="Название"
            value={centralizer.name}
            onChange={handleCentralizerChange}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Общее количество</label>
          <input
            name="quantity"
            placeholder="Общее количество"
            value={centralizer.quantity}
            onChange={handleCentralizerChange}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Интервал установки</label>
          <select
            name="interval"
            value={centralizer.interval}
            onChange={handleCentralizerChange}
            className="input"
          >
            <option value="1/1">1/1</option>
            <option value="1/2">1/2</option>
            <option value="1/3">1/3</option>
            <option value="2/1">2/1</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={handleClear}
          className="bg-gray-200 px-6 py-2 rounded hover:bg-gray-300"
        >
          Очистить
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Далее
        </button>
      </div>
    </form>
  );
}

export default WellParametersForm;
