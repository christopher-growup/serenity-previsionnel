import type { Previsionnel, TypeActivite } from '../types';
import FormField from '../components/FormField';
import Card from '../components/Card';

interface Props {
  data: Previsionnel;
  updateData: (partial: Partial<Previsionnel>) => void;
}

const TYPE_ACTIVITE_OPTIONS: {
  id: TypeActivite;
  title: string;
  description: string;
}[] = [
  {
    id: 'vente_bic',
    title: 'Vente de marchandises',
    description: 'Achat-revente, fabrication de produits',
  },
  {
    id: 'services_bic',
    title: 'Prestation de services',
    description: 'Artisanat, services commerciaux',
  },
  {
    id: 'liberale_cipav',
    title: 'Activité libérale (CIPAV)',
    description: 'Architectes, ingénieurs-conseils, psychologues',
  },
  {
    id: 'liberale_bnc_ssi',
    title: 'Activité libérale (hors CIPAV)',
    description: 'Coaching, conseil, formation, consulting',
  },
];

export function Step1Project({ data, updateData }: Props) {
  const updateProjet = (field: string, value: string) => {
    updateData({ projet: { ...data.projet, [field]: value } });
  };

  const updateTypeActivite = (type: TypeActivite) => {
    updateData({ projet: { ...data.projet, typeActivite: type } });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Mon projet</h2>
      <p className="text-gray-500 mb-8">Décrivez votre projet entrepreneurial pour personnaliser votre prévisionnel.</p>

      {/* Identité */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-8">Identité du porteur de projet</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Nom du porteur de projet"
          type="text"
          value={data.projet.nomPorteur}
          onChange={(v) => updateProjet('nomPorteur', v)}
          placeholder="ex: Marie Dupont"
        />
        <FormField
          label="Nom de la société / de l'entreprise"
          type="text"
          value={data.projet.nomSociete}
          onChange={(v) => updateProjet('nomSociete', v)}
          placeholder="ex: Mon Cabinet de Coaching"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <FormField
          label="Date de création envisagée"
          type="date"
          value={data.projet.dateCreationEnvisagee}
          onChange={(v) => updateProjet('dateCreationEnvisagee', v)}
        />
        <FormField
          label="Activité principale"
          type="text"
          value={data.projet.activitePrincipale}
          onChange={(v) => updateProjet('activitePrincipale', v)}
          placeholder="ex: Coaching professionnel"
        />
      </div>

      <div className="mt-4">
        <FormField
          label="Adresse"
          type="text"
          value={data.projet.adresse}
          onChange={(v) => updateProjet('adresse', v)}
          placeholder="ex: 1 rue de la Paix, 75001 Paris"
        />
      </div>

      {/* Type d'activité */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-8">Type d'activité</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TYPE_ACTIVITE_OPTIONS.map((option) => (
          <Card
            key={option.id}
            selected={data.projet.typeActivite === option.id}
            onClick={() => updateTypeActivite(option.id)}
            title={option.title}
            description={option.description}
          />
        ))}
      </div>

      {/* Description de l'offre */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-8">Description de l'activité</h3>
      <div className="flex flex-col gap-4">
        <FormField
          label="Description de votre offre"
          type="textarea"
          value={data.projet.descriptionOffre}
          onChange={(v) => updateProjet('descriptionOffre', v)}
          tooltip="Décrivez les produits ou services que vous proposez"
        />
        <FormField
          label="Description de votre marché"
          type="textarea"
          value={data.projet.descriptionMarche}
          onChange={(v) => updateProjet('descriptionMarche', v)}
          tooltip="Décrivez votre marché cible et la concurrence"
        />
        <FormField
          label="Stratégie de développement"
          type="textarea"
          value={data.projet.strategie}
          onChange={(v) => updateProjet('strategie', v)}
          tooltip="Comment comptez-vous développer votre activité ?"
        />
      </div>

      {/* Profil du porteur */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4 mt-8">Profil du porteur de projet</h3>
      <div className="flex flex-col gap-4">
        <FormField
          label="Expérience"
          type="textarea"
          value={data.projet.experience}
          onChange={(v) => updateProjet('experience', v)}
          placeholder="Vos années d'expérience dans le domaine"
        />
        <FormField
          label="Compétences"
          type="textarea"
          value={data.projet.competences}
          onChange={(v) => updateProjet('competences', v)}
        />
        <FormField
          label="Motivations"
          type="textarea"
          value={data.projet.motivations}
          onChange={(v) => updateProjet('motivations', v)}
        />
      </div>
    </div>
  );
}
