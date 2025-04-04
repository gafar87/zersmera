import { useState } from "react";
import WellParametersForm from "./components/WellParametersForm";
import TubeUploader from "./components/TubeUploader";
import CalculateMera from "./components/CalculateMera";

function App() {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    depth: '',
  });
  const [tubes, setTubes] = useState([]);
  const [patrubki, setPatrubki] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const handleWellDataSubmit = (data) => {
    console.log("📝 Сохраняем параметры скважины:", data);
    const formattedData = {
      ...data,
      depth: data.wellDepth || data.depth || '',
    };
    setProjectData((prev) => ({ ...prev, ...formattedData }));
    setStep(2);
  };

  const handleTubeData = (data) => {
    console.log("🟡 Загружены трубы, патрубки и оборудование:", data);
    
    const tubesData = data.tubes?.data || [];
    const patrubkiData = data.patrubki?.data || [];
    const equipmentData = data.equipment || [];
    
    console.log(`📊 Обработано труб: ${tubesData.length}, патрубков: ${patrubkiData.length}, оборудования: ${equipmentData.length}`);
    
    setProjectData((prev) => ({ ...prev, ...data }));
    setTubes(tubesData);
    setPatrubki(patrubkiData);
    setEquipment(equipmentData);
    
    setStep(3);
  };

  const goToStep = (targetStep) => {
    if (targetStep >= 1 && targetStep <= 3) {
      setStep(targetStep);
    }
  };

  const handleClearStorage = () => {
    if (confirm('Вы уверены, что хотите очистить все данные из локального хранилища? Это действие нельзя отменить.')) {
      try {
        console.log('🧹 Начинаем очистку хранилища из App...');
        
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
        setProjectData({ depth: '' });
        setTubes([]);
        setPatrubki([]);
        setEquipment([]);
        setStep(1);
        
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center text-blue-800 mb-6">
        💡 Расчёт меры спуска хвостовика
      </h1>

      {/* Навигация по шагам */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button 
            onClick={() => goToStep(1)} 
            className={`px-3 py-1 rounded ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            1. Скважина
          </button>
          <button 
            onClick={() => tubes.length > 0 && goToStep(2)} 
            className={`px-3 py-1 rounded ${step === 2 ? 'bg-blue-600 text-white' : tubes.length > 0 ? 'bg-gray-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            disabled={tubes.length === 0}
          >
            2. Трубы
          </button>
          <button 
            onClick={() => equipment.length > 0 && goToStep(3)} 
            className={`px-3 py-1 rounded ${step === 3 ? 'bg-blue-600 text-white' : equipment.length > 0 ? 'bg-gray-200' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            disabled={equipment.length === 0}
          >
            3. Расчёт
          </button>
        </div>
        <button 
          onClick={handleClearStorage} 
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          🗑️ Очистить данные
        </button>
      </div>

      {/* Шаг 1: Ввод параметров скважины */}
      {step === 1 && (
        <WellParametersForm 
          onNext={handleWellDataSubmit} 
          initialData={projectData} 
        />
      )}

      {/* Шаг 2: Загрузка труб, патрубков и оборудования */}
      {step === 2 && (
        <TubeUploader
          wellParams={projectData}
          onNext={handleTubeData}
          onBack={() => goToStep(1)}
        />
      )}

      {/* Шаг 3: Расчет меры спуска */}
      {step === 3 && (
        <CalculateMera
          tubes={tubes}
          patrubki={patrubki}
          equipment={equipment}
          wellParams={projectData}
          onBack={() => goToStep(2)}
        />
      )}

      {/* Отладочная информация - можно удалить на продакшене */}
      <div className="mt-8 text-xs text-gray-500 border-t pt-4">
        <details>
          <summary>Отладочная информация</summary>
          <div className="mt-2 p-2 bg-gray-100 rounded">
            <div>Текущий шаг: {step}</div>
            <div>Глубина скважины: {projectData.depth || "Не задана"}</div>
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
