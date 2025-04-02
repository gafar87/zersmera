import { useState } from "react";
import WellParametersForm from "./components/WellParametersForm";
import TubeUploader from "./components/TubeUploader";
import TubeEditor from "./components/TubeEditor";

function App() {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({});
  const [tubes, setTubes] = useState([]);

  const handleWellDataSubmit = (data) => {
    setProjectData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleTubeData = (data) => {
    setProjectData((prev) => ({ ...prev, ...data }));
    setTubes(data.tubes.data || []);
    setStep(3);
    console.log("🟡 Загружены трубы и патрубки:", data);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center text-blue-800 mb-6">
        💡 Расчёт меры спуска хвостовика
      </h1>

      {step === 1 && <WellParametersForm onNext={handleWellDataSubmit} />}

      {step === 2 && (
        <TubeUploader
          wellParams={projectData}  // ⬅️ передаём параметры из формы
          onNext={handleTubeData}
        />
      )}

      {step >= 3 && (
        <>
          <TubeEditor
            tubes={tubes}
            onChange={(updatedList) => {
              setTubes(updatedList);
              console.log("🔄 Обновлён список труб:", updatedList);
            }}
          />
          <div className="flex justify-end mt-6">
            <button
              onClick={() => setStep(4)}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Перейти к расчёту
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
