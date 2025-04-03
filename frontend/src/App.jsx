import { useState } from "react";
import WellParametersForm from "./components/WellParametersForm";
import TubeUploader from "./components/TubeUploader";
import EquipmentUploader from "./components/EquipmentUploader";
import CalculateMera from "./components/CalculateMera";

function App() {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    depth: '',
    shoeDepth: '',
    hangerDepth: '',
    shoeTolerance: 3,
    hangerTolerance: 30
  });
  const [tubes, setTubes] = useState([]);
  const [patrubki, setPatrubki] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const handleWellDataSubmit = (data) => {
    console.log("📝 Сохраняем параметры скважины:", data);
    const formattedData = {
      ...data,
      depth: data.wellDepth || data.depth || '',
      shoeDepth: data.shoeDepth || '',
      hangerDepth: data.hangerDepth || ''
    };
    setProjectData((prev) => ({ ...prev, ...formattedData }));
    setStep(2);
  };

  const handleTubeData = (data) => {
    console.log("🟡 Загружены трубы и патрубки:", data);
    
    const tubesData = data.tubes?.data || [];
    const patrubkiData = data.patrubki?.data || [];
    
    console.log(`📊 Обработано труб: ${tubesData.length}, патрубков: ${patrubkiData.length}`);
    
    setProjectData((prev) => ({ ...prev, ...data }));
    setTubes(tubesData);
    setPatrubki(patrubkiData);
    
    setStep(3);
  };

  const handleEquipmentData = (equipmentData) => {
    console.log("🔧 Загружено оборудование:", equipmentData);
    setEquipment(equipmentData);
    setStep(4);
  };

  const goToStep = (targetStep) => {
    if (targetStep >= 1 && targetStep <= 4) {
      setStep(targetStep);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center text-blue-800 mb-6">
        💡 Расчёт меры спуска хвостовика
      </h1>

      {/* Шаг 1: Ввод параметров скважины */}
      {step === 1 && (
        <WellParametersForm 
          onNext={handleWellDataSubmit} 
          initialData={projectData} 
        />
      )}

      {/* Шаг 2: Загрузка труб и патрубков */}
      {step === 2 && (
        <TubeUploader
          wellParams={projectData}
          onNext={handleTubeData}
          onBack={() => goToStep(1)}
        />
      )}

      {/* Шаг 3: Загрузка оборудования */}
      {step === 3 && (
        <EquipmentUploader
          onNext={handleEquipmentData}
          onBack={() => goToStep(2)}
          wellParams={projectData}
        />
      )}

      {/* Шаг 4: Расчет меры спуска */}
      {step === 4 && (
        <CalculateMera
          tubes={tubes}
          patrubki={patrubki}
          equipment={equipment}
          wellParams={projectData}
          onBack={() => goToStep(3)}
        />
      )}

      {/* Отладочная информация - можно удалить на продакшене */}
      <div className="mt-8 text-xs text-gray-500 border-t pt-4">
        <details>
          <summary>Отладочная информация</summary>
          <div className="mt-2 p-2 bg-gray-100 rounded">
            <div>Текущий шаг: {step}</div>
            <div>Глубина скважины: {projectData.depth || "Не задана"}</div>
            <div>Глубина башмака: {projectData.shoeDepth || "Не задана"}</div>
            <div>Глубина подвески: {projectData.hangerDepth || "Не задана"}</div>
            <div>Количество труб: {tubes?.length || 0}</div>
            <div>Количество патрубков: {patrubki?.length || 0}</div>
            <div>Количество оборудования: {equipment?.length || 0}</div>
            {equipment?.length > 0 && (
              <>
                <div>Первый элемент: {equipment[0]?.name || 'Н/Д'} (инт: {equipment[0]?.interval || 'Н/Д'})</div>
                <div>Последний элемент: {equipment[equipment.length-1]?.name || 'Н/Д'} (инт: {equipment[equipment.length-1]?.interval || 'Н/Д'})</div>
              </>
            )}
          </div>
        </details>
      </div>
    </div>
  );
}

export default App;
