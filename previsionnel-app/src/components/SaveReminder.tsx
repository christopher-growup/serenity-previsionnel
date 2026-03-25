interface Props {
  onSave: () => void;
}

export function SaveReminder({ onSave }: Props) {
  return (
    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
      <p className="text-sm text-amber-800">
        Pensez à sauvegarder votre progression régulièrement.
      </p>
      <button
        onClick={onSave}
        className="ml-4 px-3 py-1.5 text-xs font-medium text-white bg-amber-600 rounded hover:bg-amber-700"
      >
        Sauvegarder maintenant
      </button>
    </div>
  );
}
