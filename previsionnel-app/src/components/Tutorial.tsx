import { useState } from 'react';

interface TutorialProps {
  onComplete: () => void;
}

const screens = [
  {
    title: 'Bienvenue dans votre prévisionnel financier',
    body: "Cet outil va vous guider pas à pas pour construire votre prévisionnel financier sur 3 ans. Il suffit de répondre aux questions, étape par étape.",
  },
  {
    title: 'Comment ça marche ?',
    body: "Vous avancez à votre rythme dans 8 étapes simples. À chaque étape, remplissez les informations demandées. Les calculs se font automatiquement. Vous pouvez revenir en arrière à tout moment.",
  },
  {
    title: 'Sauvegardez votre travail',
    body: "Votre travail est enregistré automatiquement dans votre navigateur. Mais pour ne pas le perdre, cliquez régulièrement sur « Sauvegarder mon travail » en bas de page. Un fichier sera téléchargé sur votre ordinateur. Vous pourrez le recharger plus tard pour reprendre où vous en étiez.",
  },
];

export default function Tutorial({ onComplete }: TutorialProps) {
  const [current, setCurrent] = useState(0);

  const isLast = current === screens.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrent((prev) => prev + 1);
    }
  };

  const { title, body } = screens[current];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-8 flex flex-col gap-6">
        {/* Skip button */}
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 text-sm text-gray-400 hover:text-[#082742] transition-colors"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Passer
        </button>

        {/* Logo */}
        <div className="flex justify-center pt-2">
          <img src="/logo.svg" alt="Serenity Institut" className="h-10 mx-auto" />
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          <h2
            className="text-2xl font-bold text-[#082742] leading-snug"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {title}
          </h2>
          <p className="text-gray-600 leading-relaxed">{body}</p>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2">
          {screens.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === current ? 'bg-[#be9f56]' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Écran ${i + 1}`}
            />
          ))}
        </div>

        {/* Navigation button */}
        <button
          onClick={handleNext}
          className="w-full py-3 px-6 bg-[#be9f56] hover:bg-[#caa253] text-white font-semibold rounded-xl transition-colors uppercase tracking-widest"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {isLast ? 'Commencer' : 'Suivant'}
        </button>
      </div>
    </div>
  );
}
