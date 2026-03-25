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
          className="absolute top-4 right-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Passer
        </button>

        {/* Content */}
        <div className="flex flex-col gap-4 pt-2">
          <h2 className="text-2xl font-bold text-gray-900 leading-snug">{title}</h2>
          <p className="text-gray-600 leading-relaxed">{body}</p>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2">
          {screens.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === current ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Écran ${i + 1}`}
            />
          ))}
        </div>

        {/* Navigation button */}
        <button
          onClick={handleNext}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
        >
          {isLast ? 'Commencer' : 'Suivant'}
        </button>
      </div>
    </div>
  );
}
