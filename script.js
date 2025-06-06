let argent = 1000;
let tour = 1;

const actions = {
  TechCorp: { prix: 100, possede: 0, historique: [100], bloque: false },
  HealthInc: { prix: 120, possede: 0, historique: [120], bloque: false },
};

const argentEl = document.getElementById("argent");
const tourEl = document.getElementById("tour");
const tableau = document.getElementById("tableau-actions");
const btnTourSuivant = document.getElementById("tour-suivant");
const listeEvenements = document.getElementById("liste-evenements");

function ajouterEvenement(message) {
  const li = document.createElement("li");
  li.textContent = `🔹 ${message}`;
  listeEvenements.prepend(li);
}

const ctx = document.getElementById("graphique-prix").getContext("2d");
let chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: Array(20).fill(""),
    datasets: Object.keys(actions).map((nom, i) => ({
      label: nom,
      data: actions[nom].historique,
      borderColor: i === 0 ? "blue" : "green",
      fill: false,
      tension: 0.2,
    })),
  },
  options: {
    scales: {
      y: { beginAtZero: false },
    },
  },
});

function randomAction() {
  const noms = Object.keys(actions);
  return noms[Math.floor(Math.random() * noms.length)];
}

function evenementAleatoire() {
  const evenements = [
    () => {
      const nom = randomAction();
      const perte = Math.floor(Math.random() * 30 + 10);
      actions[nom].prix -= perte;
      ajouterEvenement(`🌪️ Une catastrophe naturelle affecte ${nom}. Son prix chute de ${perte}€.`);
    },
    () => {
      const nom = randomAction();
      const gain = Math.floor(Math.random() * 30 + 10);
      actions[nom].prix += gain;
      ajouterEvenement(`📦 Hausse soudaine de la demande pour ${nom} ! Le prix grimpe de ${gain}€.`);
    },
    () => {
      const nom = randomAction();
      const impact = Math.floor(actions[nom].prix * 0.4);
      actions[nom].prix -= impact;
      actions[nom].bloque = true;
      ajouterEvenement(`💼 Un scandale de corruption secoue ${nom} ! Le cours chute de ${impact}€ et les transactions sont gelées ce tour.`);
    },
    () => {
      let totalDividende = 0;
      Object.keys(actions).forEach((nom) => {
        const dividende = Math.floor(actions[nom].prix * 0.015 * actions[nom].possede);
        argent += dividende;
        totalDividende += dividende;
      });
      if (totalDividende > 0) {
        ajouterEvenement(`🧾 Vous recevez ${totalDividende}€ de dividendes.`);
      } else {
        ajouterEvenement(`🧾 Aucune dividende reçue (vous ne possédez aucune action).`);
      }
    },
  ];

  if (Math.random() < 0.5) {
    const index = Math.floor(Math.random() * evenements.length);
    evenements[index]();
  }
}

btnTourSuivant.addEventListener("click", () => {
  tour++;
  tourEl.innerText = tour;

  evenementAleatoire();

  Object.keys(actions).forEach((nom) => {
    const action = actions[nom];
    const variation = parseFloat((Math.random() * 20 - 10).toFixed(2));
    action.prix = parseFloat((action.prix + variation).toFixed(2));

    if (action.prix < 0) {
      ajouterEvenement(`❌ ${nom} fait faillite ! Toutes vos actions sont perdues.`);
      delete actions[nom];
      const ligne = tableau.querySelector(`tr[data-action="${nom}"]`);
      if (ligne) ligne.remove();
      chart.data.datasets = chart.data.datasets.filter((ds) => ds.label !== nom);
      chart.update();
      return;
    }

    action.historique.push(action.prix);
    if (action.historique.length > 20) action.historique.shift();

    const ligne = tableau.querySelector(`tr[data-action="${nom}"]`);
    if (ligne) ligne.querySelector(".prix").innerText = action.prix.toFixed(2);
  });

  Object.values(actions).forEach((action) => (action.bloque = false));

  chart.data.datasets.forEach((dataset, i) => {
    const nom = dataset.label;
    if (actions[nom]) dataset.data = actions[nom].historique;
  });
  chart.update();

  argentEl.innerText = argent.toFixed(2);
});

// Mise à jour de la quantité via les boutons "+"
document.querySelectorAll(".modifier-quantite").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    const change = parseInt(e.target.dataset.change);
    const quantiteSpan = document.querySelector(`tr[data-action="${action}"] .quantite`);
    let quantite = parseInt(quantiteSpan.textContent);

    // Incrémentation ou décrémentation selon le bouton cliqué
    quantite += change;
    if (quantite < 0) quantite = 0; // Pas de quantité négative
    quantiteSpan.textContent = quantite;
  });
});

// Action d'achat immédiat
document.querySelectorAll(".acheter-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const action = actions[e.target.dataset.action];
    const quantite = parseInt(e.target.parentElement.querySelector(".quantite").textContent || "0");
    const prixTotal = action.prix * quantite;

    if (quantite > 0 && argent >= prixTotal) {
      argent -= prixTotal;
      action.possede += quantite;
      ajouterEvenement(`🛒 Achat de ${quantite} ${e.target.dataset.action} pour ${prixTotal.toFixed(2)}€.`);
      e.target.parentElement.querySelector(".quantite").textContent = 0;
    } else if (quantite > 0) {
      ajouterEvenement(`⚠️ Pas assez d'argent pour acheter ${quantite} ${e.target.dataset.action}.`);
    }

    argentEl.innerText = argent.toFixed(2);
  });
});

// Action de vente immédiate
document.querySelectorAll(".vendre-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const action = actions[e.target.dataset.action];
    const quantite = parseInt(e.target.parentElement.querySelector(".quantite").textContent || "0");

    if (quantite > 0 && action.possede >= quantite) {
      const prixTotal = action.prix * quantite;
      argent += prixTotal;
      action.possede -= quantite;
      ajouterEvenement(`💰 Vente de ${quantite} ${e.target.dataset.action} pour ${prixTotal.toFixed(2)}€.`);
      e.target.parentElement.querySelector(".quantite").textContent = 0;
    } else if (quantite > 0) {
      ajouterEvenement(`⚠️ Vous ne possédez pas ${quantite} ${e.target.dataset.action}.`);
    }

    argentEl.innerText = argent.toFixed(2);
  });
});
