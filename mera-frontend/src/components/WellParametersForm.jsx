import { useState } from "react";

function WellParametersForm({ onNext }) {
  const [wellParams, setWellParams] = useState({
    wellNumber: "6334",
    wellPad: "46",
    field: "Ем-Еговский + Пальяновский ЛУ",
    runDate: "2025-03-12",
    depth: "3348",
    shoeDepth: "3294",
    shoeTolerance: "2",
    hangerDepth: "3200",
    hangerTolerance: "12",
    casingOD: "114.3",
    casingWeight: "23.8",
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

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setWellParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleCentralizerChange = (e) => {
    const { name, value } = e.target;
    setCentralizer((prev) => ({ ...prev, [name]: value }));
  };

  const handleStepper = (name, delta) => {
    setWellParams((prev) => ({
      ...prev,
      [name]: String(+prev[name] + delta),
    }));
  };

  const handleClear = () => {
    setWellParams({
      wellNumber: "",
      wellPad: "",
      field: "",
      runDate: "",
      depth: "",
      shoeDepth: "",
      shoeTolerance: "0",
      hangerDepth: "",
      hangerTolerance: "0",
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

    const { depth, shoeDepth, hangerDepth } = wellParams;

    const depthNum = parseFloat(depth);
    const shoeNum = parseFloat(shoeDepth);
    const hangerNum = parseFloat(hangerDepth);

    if (isNaN(depthNum) || isNaN(shoeNum) || isNaN(hangerNum)) {
      alert("❌ Все значения глубин должны быть числовыми.");
      return;
    }

    if (shoeNum > depthNum) {
      alert("❌ Глубина башмака не может быть больше глубины скважины.");
      return;
    }

    if (hangerNum > shoeNum) {
      alert("❌ Глубина подвески не может быть ниже глубины башмака.");
      return;
    }

    onNext({ wellParams, centralizer });
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
          <label className="block text-sm font-medium mb-1">Вес (kg/m)</label>
          <input
            name="casingWeight"
            placeholder="Вес (kg/m)"
            value={wellParams.casingWeight}
            onChange={handleParamChange}
            className="input"
          />
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
          <label className="block text-sm font-medium mb-1">ID Колонны (mm)</label>
          <input
            name="casingID"
            placeholder="ID Колонны (mm)"
            value={wellParams.casingID}
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

      <h2 className="text-xl font-bold text-blue-700 mt-6">Глубины установки</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Глубина башмака ± допуск (м)</label>
          <div className="flex gap-2 items-center">
            <input
              name="shoeDepth"
              type="number"
              value={wellParams.shoeDepth}
              onChange={handleParamChange}
              className="input w-full"
            />
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => handleStepper("shoeTolerance", -1)} className="px-2 bg-gray-200 rounded">
                −
              </button>
              <input
                name="shoeTolerance"
                type="number"
                value={wellParams.shoeTolerance}
                onChange={handleParamChange}
                className="input w-[80px] text-center"
              />
              <button type="button" onClick={() => handleStepper("shoeTolerance", 1)} className="px-2 bg-gray-200 rounded">
                +
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Глубина подвески ± допуск (м)</label>
          <div className="flex gap-2 items-center">
            <input
              name="hangerDepth"
              type="number"
              value={wellParams.hangerDepth}
              onChange={handleParamChange}
              className="input w-full"
            />
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => handleStepper("hangerTolerance", -1)} className="px-2 bg-gray-200 rounded">
                −
              </button>
              <input
                name="hangerTolerance"
                type="number"
                value={wellParams.hangerTolerance}
                onChange={handleParamChange}
                className="input w-[80px] text-center"
              />
              <button type="button" onClick={() => handleStepper("hangerTolerance", 1)} className="px-2 bg-gray-200 rounded">
                +
              </button>
            </div>
          </div>
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
