interface Props {
  onClose: () => void;
}

export function HelpPage({ onClose }: Props) {
  return (
    <div className="min-h-screen bg-[#f8f7f5]">
      {/* Header */}
      <div className="bg-[#082742] text-white px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <img src="/logo.svg" alt="Serenity Institut" className="h-10" />
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              ← Retour au prévisionnel
            </button>
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Guide d'utilisation
          </h1>
          <p className="text-white/70 mt-2 text-sm">
            Tout ce qu'il faut savoir pour réaliser votre prévisionnel financier
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">

        {/* Section 1 : C'est quoi */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#082742]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            C'est quoi un prévisionnel financier ?
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-sm text-gray-700 space-y-3 leading-relaxed">
            <p>
              Le prévisionnel financier est un document qui <strong>projette les finances de votre future entreprise sur 3 ans</strong>.
              Il permet de vérifier que votre projet est viable et de convaincre vos partenaires (banque, organismes de financement).
            </p>
            <p>Il se compose principalement de :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Un <strong>compte de résultat prévisionnel</strong> — votre entreprise gagne-t-elle de l'argent ?</li>
              <li>Un <strong>plan de trésorerie</strong> — avez-vous assez d'argent chaque mois pour payer vos charges ?</li>
              <li>Un <strong>plan de financement</strong> — comment financez-vous le démarrage ?</li>
            </ul>
            <p className="text-[#be9f56] font-medium">
              Cet outil vous guide pas à pas pour construire ces documents, même si vous n'avez aucune connaissance en comptabilité.
            </p>
          </div>
        </section>

        {/* Section 2 : Les 8 étapes */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#082742]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Les 8 étapes en détail
          </h2>
          <div className="space-y-3">
            {[
              {
                step: 1,
                title: 'Mon projet',
                desc: 'Renseignez votre identité, le nom de votre société, votre activité et la date de création envisagée. Ces informations apparaîtront sur vos documents exportés.',
                tip: 'La date de création est importante : elle détermine les noms des mois dans tout le prévisionnel.',
              },
              {
                step: 2,
                title: 'Mon statut juridique',
                desc: 'Choisissez votre forme juridique (micro-entreprise, SARL, SASU, etc.). Chaque statut a des règles différentes pour les cotisations sociales et les impôts.',
                tip: 'Si vous bénéficiez de l\'ACRE, activez-le ici : vos cotisations seront réduites de 50% la première année.',
              },
              {
                step: 3,
                title: 'Mes offres',
                desc: 'Décrivez vos produits ou services avec leur prix unitaire HT. Vous pouvez ajouter jusqu\'à 10 offres différentes.',
                tip: 'En micro-entreprise, la TVA est automatiquement désactivée (franchise en base).',
              },
              {
                step: 4,
                title: 'Investissements & financements',
                desc: 'Listez vos investissements (matériel, aménagements...) et vos sources de financement (apport personnel, emprunt, subventions).',
                tip: 'Vérifiez que le total de vos financements couvre bien le total de vos investissements (indicateur vert/orange en bas).',
              },
              {
                step: 5,
                title: 'Ventes prévisionnelles',
                desc: 'Estimez combien d\'unités (ou d\'heures) vous allez vendre chaque mois. Vous pouvez saisir mois par mois ou entrer un total annuel.',
                tip: 'Utilisez le bouton ÷3 pour répartir automatiquement une quantité trimestrielle sur 3 mois.',
              },
              {
                step: 6,
                title: 'Mes charges',
                desc: 'Ajoutez vos charges fixes (loyer, assurance, comptable...) et vos charges variables (liées au volume de ventes). Des suggestions sont proposées.',
                tip: 'Vous pouvez basculer entre saisie mensuelle et annuelle avec le bouton en haut du tableau.',
              },
              {
                step: 7,
                title: 'Ma rémunération',
                desc: 'Indiquez le salaire que vous souhaitez vous verser (ou votre estimation de revenus en micro). Vous pouvez aussi ajouter des salariés.',
                tip: 'Si vous ne vous versez pas de salaire au démarrage, précisez vos autres sources de revenus.',
              },
              {
                step: 8,
                title: 'Synthèse',
                desc: 'Visualisez votre compte de résultat sur 3 ans, votre trésorerie mois par mois, et vos indicateurs clés. C\'est ici que vous exportez votre PDF et votre Excel.',
                tip: 'Les alertes en haut vous signalent les points d\'attention (trésorerie négative, dépassement de plafond, etc.).',
              },
            ].map(({ step, title, desc, tip }) => (
              <div key={step} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-[#082742] text-white flex items-center justify-center font-bold text-sm">
                    {step}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-[#082742]">{title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                    <div className="flex items-start gap-2 bg-[#f5f0e4] rounded-lg px-3 py-2">
                      <span className="text-[#be9f56] font-bold text-sm shrink-0">Astuce</span>
                      <p className="text-xs text-[#082742]">{tip}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 : Sauvegarde */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#082742]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Comment sauvegarder mon travail ?
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-sm text-gray-700 space-y-4 leading-relaxed">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-lg">✓</div>
              <div>
                <h4 className="font-semibold text-[#082742]">Sauvegarde automatique</h4>
                <p className="text-gray-600">Votre travail est sauvegardé automatiquement dans votre navigateur à chaque modification. Si vous fermez la page et revenez plus tard <strong>sur le même ordinateur et le même navigateur</strong>, vous retrouverez vos données.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg">↓</div>
              <div>
                <h4 className="font-semibold text-[#082742]">Télécharger un fichier de sauvegarde</h4>
                <p className="text-gray-600">Cliquez sur <strong>« Sauvegarder »</strong> dans la barre en bas de l'écran. Un fichier <code className="bg-gray-100 px-1 rounded">.previsionnel</code> sera téléchargé sur votre ordinateur. Conservez-le précieusement !</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-lg">↑</div>
              <div>
                <h4 className="font-semibold text-[#082742]">Recharger une sauvegarde</h4>
                <p className="text-gray-600">Sur l'écran d'accueil, cliquez sur <strong>« Charger un fichier existant »</strong> et sélectionnez votre fichier <code className="bg-gray-100 px-1 rounded">.previsionnel</code>. Vous retrouverez toutes vos données là où vous les aviez laissées.</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800">
              <strong>Important :</strong> si vous changez d'ordinateur, utilisez un autre navigateur, ou si vous videz les données de votre navigateur, la sauvegarde automatique sera perdue. Pensez à télécharger votre fichier de sauvegarde régulièrement.
            </div>
          </div>
        </section>

        {/* Section 4 : Exports */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#082742]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Exporter mes documents
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 text-sm text-gray-700 space-y-4 leading-relaxed">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">PDF</div>
              <div>
                <h4 className="font-semibold text-[#082742]">Export PDF</h4>
                <p className="text-gray-600">Génère un document professionnel prêt à imprimer avec votre compte de résultat et votre plan de trésorerie. <strong>C'est ce document que vous intégrerez à votre dossier Bloc 4.</strong></p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">XLS</div>
              <div>
                <h4 className="font-semibold text-[#082742]">Export Excel</h4>
                <p className="text-gray-600">Génère un fichier Excel complet avec 8 onglets (présentation, investissements, financement, CA, charges, rémunération, résultat, trésorerie). Utile si vous souhaitez analyser les chiffres en détail ou les présenter à un banquier.</p>
              </div>
            </div>

            <p className="text-gray-500 italic">Les deux boutons d'export se trouvent à l'étape 8 (Synthèse).</p>
          </div>
        </section>

        {/* Section 5 : FAQ */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[#082742]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Questions fréquentes
          </h2>
          <div className="space-y-3">
            {[
              {
                q: 'Je me suis trompé(e) dans une étape, comment revenir en arrière ?',
                a: 'Cliquez sur le bouton « Précédent » en bas de l\'écran, ou cliquez directement sur le numéro de l\'étape dans la barre de progression en haut.',
              },
              {
                q: 'Je ne connais pas encore mon statut juridique, que faire ?',
                a: 'Choisissez le statut qui vous semble le plus probable pour l\'instant. Vous pourrez toujours revenir le modifier, et tous les calculs seront automatiquement mis à jour.',
              },
              {
                q: 'Comment estimer mes ventes si je n\'ai aucune idée des chiffres ?',
                a: 'Commencez par un scénario prudent : combien de clients minimum pensez-vous toucher par mois ? Multipliez par votre prix. Vous pourrez ajuster ensuite. Il vaut mieux sous-estimer que surestimer.',
              },
              {
                q: 'Ma trésorerie est négative, c\'est grave ?',
                a: 'Une trésorerie négative signifie que vous n\'avez pas assez d\'argent pour payer vos charges à ce moment-là. Vous pouvez corriger en augmentant vos financements, en réduisant vos charges, ou en décalant certains investissements.',
              },
              {
                q: 'Mes données sont-elles envoyées sur internet ?',
                a: 'Non. Toutes vos données restent sur votre ordinateur. Rien n\'est envoyé ni stocké sur un serveur. C\'est pour cela qu\'il est important de télécharger votre fichier de sauvegarde.',
              },
              {
                q: 'Je peux travailler à plusieurs sur le même prévisionnel ?',
                a: 'L\'outil est conçu pour un usage individuel. Si vous travaillez à plusieurs, une seule personne saisit les données et peut partager le fichier de sauvegarde (.previsionnel) avec les autres.',
              },
            ].map(({ q, a }, i) => (
              <details key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden group">
                <summary className="px-5 py-4 cursor-pointer font-medium text-[#082742] text-sm hover:bg-gray-50 transition-colors list-none flex items-center justify-between">
                  {q}
                  <svg className="w-4 h-4 text-gray-400 shrink-0 ml-3 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-6 pb-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#be9f56] text-white font-semibold rounded-xl hover:bg-[#caa253] transition-colors shadow-sm"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Retour au prévisionnel
          </button>
          <p className="mt-4 text-xs text-gray-400">
            Conçu par <a href="https://growup-consulting.fr" target="_blank" rel="noopener noreferrer" className="hover:text-[#be9f56] transition-colors underline">Grow Up Consulting</a> pour Serenity Institut
          </p>
        </div>
      </div>
    </div>
  );
}
