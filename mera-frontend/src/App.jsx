import { useState } from "react";
import WellParametersForm from "./components/WellParametersForm";
import TubeUploader from "./components/TubeUploader";



function App() {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({});

  const handleWellDataSubmit = (data) => {
    setProjectData((prev) => ({ ...prev, ...data }));
    setStep(2); // потом перейдём к загрузке труб
    console.log("🟢 Введены параметры:", data);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center text-blue-800 mb-6">💡 Расчёт меры спуска хвостовика</h1>

      {step === 1 && <WellParametersForm onNext={handleWellDataSubmit} />}
      {step === 2 && <TubeUploader onNext={(data) => {
  console.log("Трубы:", data);
  setStep(3); // переход к следующему этапу
}} />}
    </div>
  );
}

export default App;
