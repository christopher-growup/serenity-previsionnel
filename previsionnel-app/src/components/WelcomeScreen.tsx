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
    <div className="min-h-screen bg-[#082742] flex items-center justify-center px-4">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Logo */}
        <img src="/logo.svg" alt="Serenity Institut" className="h-16 mx-auto mb-6" />

        {/* Header */}
        <div className="text-center">
          <h1
            className="text-4xl font-bold text-[#be9f56] mb-2"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Prévisionnel Financier
          </h1>
          <p
            className="text-lg text-white font-medium"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Serenity Institut
          </p>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-3">
          {/* New */}
          <button
            onClick={onNew}
            className="w-full py-4 px-6 bg-[#be9f56] hover:bg-[#caa253] text-white font-semibold rounded-2xl shadow-md transition-colors text-base uppercase tracking-widest"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Commencer un nouveau prévisionnel
          </button>

          {/* Resume — only shown when existing data */}
          {hasExistingData && (
            <button
              onClick={onResume}
              className="w-full py-4 px-6 bg-transparent hover:bg-[#be9f56]/10 text-[#be9f56] font-semibold rounded-2xl border-2 border-[#be9f56] transition-colors text-base"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Reprendre mon travail
            </button>
          )}

          {/* Import — label wrapping hidden file input */}
          <label
            className="w-full py-4 px-6 bg-[#e8e6e1] hover:bg-[#f8f7f5] text-[#082742] font-semibold rounded-2xl border-2 border-transparent hover:border-[#e8e6e1] transition-colors text-base text-center cursor-pointer"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
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
