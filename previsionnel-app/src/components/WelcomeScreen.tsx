import { useRef } from 'react';

interface WelcomeScreenProps {
  hasExistingData: boolean;
  onNew: () => void;
  onResume: () => void;
  onImport: (file: File) => void;
}

export default function WelcomeScreen({
  hasExistingData,
  onNew,
  onResume,
  onImport,
}: WelcomeScreenProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input so the same file can be reloaded if needed
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Prévisionnel Financier
          </h1>
          <p className="text-lg text-blue-600 font-medium">Serenity Institut</p>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          {/* New */}
          <button
            onClick={onNew}
            className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors text-base"
          >
            Commencer un nouveau prévisionnel
          </button>

          {/* Resume — only shown when existing data */}
          {hasExistingData && (
            <button
              onClick={onResume}
              className="w-full py-4 px-6 bg-white hover:bg-blue-50 text-blue-600 font-semibold rounded-xl border-2 border-blue-600 transition-colors text-base"
            >
              Reprendre mon travail
            </button>
          )}

          {/* Import — label wrapping hidden file input */}
          <label className="w-full py-4 px-6 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-colors text-base text-center cursor-pointer">
            Charger un fichier sauvegardé
            <input
              ref={fileInputRef}
              type="file"
              accept=".previsionnel"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
