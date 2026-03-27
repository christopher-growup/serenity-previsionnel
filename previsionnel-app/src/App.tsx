import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Previsionnel, Synthese } from './types';
import { createEmptyPrevisionnel } from './utils/defaults';
import { saveTolocalStorage, loadFromLocalStorage, exportToFile, importFromFile, clearLocalStorage } from './utils/storage';
import { saveFileWithDialog } from './utils/download';
import { calculerSynthese } from './utils/calculs';
import ProgressBar from './components/ProgressBar';
import { ActionBar } from './components/ActionBar';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import Tutorial from './components/Tutorial';
import { SaveReminder } from './components/SaveReminder';
import { HelpPage } from './components/HelpPage';
import { Step1Project } from './steps/Step1Project';
import { Step2Statut } from './steps/Step2Statut';
import { Step3Offres } from './steps/Step3Offres';
import { Step4Investissements } from './steps/Step4Investissements';
import { Step5Ventes } from './steps/Step5Ventes';
import { Step6Charges } from './steps/Step6Charges';
import { Step7Remuneration } from './steps/Step7Remuneration';
import { Step8Synthese } from './steps/Step8Synthese';

type Screen = 'welcome' | 'tutorial' | 'wizard' | 'help';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [data, setData] = useState<Previsionnel>(createEmptyPrevisionnel);
  const [showSaveReminder, setShowSaveReminder] = useState(false);

  const hasExistingData = useMemo(() => loadFromLocalStorage() !== null, []);

  useEffect(() => {
    if (screen === 'wizard') saveTolocalStorage(data);
  }, [data, screen]);

  const synthese = useMemo<Synthese | null>(() => {
    if (data.offres.length === 0) return null;
    try { return calculerSynthese(data); } catch { return null; }
  }, [data]);

  const updateData = useCallback((partial: Partial<Previsionnel>) => {
    setData(prev => ({ ...prev, ...partial }));
  }, []);

  const handleNew = () => {
    setData(createEmptyPrevisionnel());
    clearLocalStorage();
    setScreen('tutorial');
  };

  const handleResume = () => {
    const saved = loadFromLocalStorage();
    if (saved) setData(saved);
    setScreen('wizard');
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    const result = importFromFile(text);
    if (result.success) {
      setData(result.data);
      setScreen('wizard');
    } else {
      alert(result.error);
    }
  };

  const handleSave = async () => {
    const { filename, content } = exportToFile(data);
    const blob = new Blob([content], { type: 'application/json' });
    await saveFileWithDialog(blob, filename, 'Fichier Prévisionnel', { 'application/json': ['.previsionnel'] });
    setShowSaveReminder(false);
  };

  const goToStep = (step: number) => {
    setShowSaveReminder(true);
    updateData({ etapeCourante: step });
    setTimeout(() => setShowSaveReminder(false), 5000);
  };

  if (screen === 'welcome') {
    return <WelcomeScreen hasExistingData={hasExistingData} onNew={handleNew} onResume={handleResume} onImport={handleImport} onHelp={() => setScreen('help')} />;
  }

  if (screen === 'tutorial') {
    return <Tutorial onComplete={() => setScreen('wizard')} />;
  }

  if (screen === 'help') {
    return <HelpPage onClose={() => setScreen(hasExistingData ? 'wizard' : 'welcome')} />;
  }

  const stepComponents: Record<number, React.ReactNode> = {
    1: <Step1Project data={data} updateData={updateData} />,
    2: <Step2Statut data={data} updateData={updateData} />,
    3: <Step3Offres data={data} updateData={updateData} />,
    4: <Step4Investissements data={data} updateData={updateData} />,
    5: <Step5Ventes data={data} updateData={updateData} />,
    6: <Step6Charges data={data} updateData={updateData} />,
    7: <Step7Remuneration data={data} updateData={updateData} />,
    8: <Step8Synthese data={data} synthese={synthese} onSave={handleSave} />,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ProgressBar currentStep={data.etapeCourante} onStepClick={goToStep} />
      <div className="flex flex-1">
        <main className={`flex-1 mx-auto py-8 pb-24 ${data.etapeCourante === 8 ? 'max-w-7xl px-4' : 'max-w-3xl px-6'}`}>
          {showSaveReminder && <div className="mb-4"><SaveReminder onSave={handleSave} /></div>}
          {stepComponents[data.etapeCourante]}
        </main>
        <Sidebar data={data} synthese={synthese} />
      </div>
      <ActionBar
        currentStep={data.etapeCourante}
        onPrevious={() => goToStep(data.etapeCourante - 1)}
        onNext={() => goToStep(data.etapeCourante + 1)}
        onSave={handleSave}
        onHelp={() => setScreen('help')}
      />
    </div>
  );
}
