function formatEuros(number) {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(number));
}

function simulate() {
  // Récupération des paramètres depuis le formulaire
  const initialCapital = parseFloat(
    document.getElementById("initialCapital").value
  );
  const monthlyDeposit = parseFloat(
    document.getElementById("monthlyDeposit").value
  );
  const accumulationYears = parseInt(
    document.getElementById("accumulationYears").value
  );
  const annualReturn =
    parseFloat(document.getElementById("annualReturn").value) / 100;

  const feeETF1 =
    parseFloat(document.getElementById("feeETF1").value) / 100;
  const feeETF2 =
    parseFloat(document.getElementById("feeETF2").value) / 100;

  const retirementYears = parseInt(
    document.getElementById("retirementYears").value
  );
  const netWithdrawalAnnual = parseFloat(
    document.getElementById("netWithdrawalAnnual").value
  );
  const taxETF1 =
    parseFloat(document.getElementById("taxETF1").value) / 100;
  const taxETF2 =
    parseFloat(document.getElementById("taxETF2").value) / 100;

  // Obtenir l'année actuelle pour l'affichage des dates
  const currentYear = new Date().getFullYear();

  // Calcul du facteur mensuel brut issu du rendement annuel
  const monthlyGross = Math.pow(1 + annualReturn, 1 / 12);
  // Calcul des frais mensuels (appliqués de façon linéaire)
  const monthlyFeeETF1 = feeETF1 / 12;
  const monthlyFeeETF2 = feeETF2 / 12;
  // Facteurs mensuels nets pour chaque ETF (on simule un retrait linéaire des frais)
  const monthlyNetETF1 = monthlyGross - monthlyFeeETF1;
  const monthlyNetETF2 = monthlyGross - monthlyFeeETF2;

  const totalMonths = accumulationYears * 12;

  // Simulation de la phase d'accumulation
  const accumulationDataETF1 = [];
  const accumulationDataETF2 = [];
  
  // Création d'une structure pour stocker les données mensuelles
  const monthlyDataETF1 = {};
  const monthlyDataETF2 = {};

  let balanceETF1 = initialCapital;
  let balanceETF2 = initialCapital;

  for (let month = 1; month <= totalMonths; month++) {
    // Ajout du versement mensuel et application du facteur mensuel net
    balanceETF1 = (balanceETF1 + monthlyDeposit) * monthlyNetETF1;
    balanceETF2 = (balanceETF2 + monthlyDeposit) * monthlyNetETF2;

    // Calculer l'année et le mois courants
    const simulationYear = Math.ceil(month / 12);
    const calendarYear = currentYear + simulationYear - 1;
    const monthIndex = (month - 1) % 12;
    
    // Stocker les données mensuelles
    if (!monthlyDataETF1[calendarYear]) {
      monthlyDataETF1[calendarYear] = Array(12).fill(null);
      monthlyDataETF2[calendarYear] = Array(12).fill(null);
    }
    
    monthlyDataETF1[calendarYear][monthIndex] = balanceETF1;
    monthlyDataETF2[calendarYear][monthIndex] = balanceETF2;

    // Enregistrer les données à la fin de chaque année (tous les 12 mois)
    if (month % 12 === 0) {
      const simulationYear = Math.floor(month / 12);
      const calendarYear = currentYear + simulationYear - 1;
      accumulationDataETF1.push({ year: simulationYear, calendarYear: calendarYear, balance: balanceETF1 });
      accumulationDataETF2.push({ year: simulationYear, calendarYear: calendarYear, balance: balanceETF2 });
    }
  }

  // Calcul du taux annuel effectif net en décumulation à partir du taux mensuel net
  const annualNetETF1 = Math.pow(monthlyNetETF1, 12);
  const annualNetETF2 = Math.pow(monthlyNetETF2, 12);

  // Calcul des retraits bruts à effectuer pour obtenir le retrait net désiré
  const withdrawalGrossETF1 = netWithdrawalAnnual / (1 - taxETF1);
  const withdrawalGrossETF2 = netWithdrawalAnnual / (1 - taxETF2);

  // Simulation de la phase de décumulation
  const decumulationDataETF1 = [];
  const decumulationDataETF2 = [];

  // Les capitaux de départ en décumulation sont les soldes fin d'accumulation
  let decumulationBalanceETF1 = balanceETF1;
  let decumulationBalanceETF2 = balanceETF2;

  for (let year = 1; year <= retirementYears; year++) {
    const startingBalanceETF1 = decumulationBalanceETF1;
    const startingBalanceETF2 = decumulationBalanceETF2;

    const interestETF1 = startingBalanceETF1 * (annualNetETF1 - 1);
    const interestETF2 = startingBalanceETF2 * (annualNetETF2 - 1);

    // Mise à jour du capital en appliquant le rendement puis en retirant le montant brut
    decumulationBalanceETF1 =
      startingBalanceETF1 * annualNetETF1 - withdrawalGrossETF1;
    decumulationBalanceETF2 =
      startingBalanceETF2 * annualNetETF2 - withdrawalGrossETF2;

    decumulationDataETF1.push({
      year: year,
      startingBalance: startingBalanceETF1,
      interest: interestETF1,
      withdrawal: withdrawalGrossETF1,
      endingBalance: decumulationBalanceETF1,
    });
    decumulationDataETF2.push({
      year: year,
      startingBalance: startingBalanceETF2,
      interest: interestETF2,
      withdrawal: withdrawalGrossETF2,
      endingBalance: decumulationBalanceETF2,
    });
  }

  // Construction du tableau HTML pour la phase d'accumulation
  const resultsDiv = document.getElementById("results");
  let html = "";

  // Supprimer le message d'instruction initial
  const emptyResults = document.querySelector(".empty-results");
  if (emptyResults) {
    emptyResults.remove();
  }

  html += "<h2>Phase d'accumulation</h2>";
  html += "<div class='table-container'>";
  html += "<table class='main-table'><thead><tr><th>Année</th><th>Balance ETF1</th><th>Balance ETF2</th></tr></thead><tbody>";
  
  for (let i = 0; i < accumulationDataETF1.length; i++) {
    const simulationYear = accumulationDataETF1[i].year;
    const calendarYear = accumulationDataETF1[i].calendarYear;
    html += "<tr class='year-row' data-year='" + calendarYear + "'>";
    html += "<td class='clickable-year'>" + calendarYear + "</td>";
    html += "<td>" + formatEuros(accumulationDataETF1[i].balance) + "</td>";
    html += "<td>" + formatEuros(accumulationDataETF2[i].balance) + "</td>";
    html += "</tr>";
    
    // Ajouter une ligne pour les détails mensuels (initialement cachée)
    html += "<tr class='monthly-details' id='monthly-details-" + calendarYear + "' style='display: none;'>";
    html += "<td colspan='3' style='padding: 0;'>";
    
    // Table des détails mensuels avec classes spécifiques pour l'alignement
    html += "<table class='monthly-table'>";
    html += "<thead class='monthly-header'>";
    html += "<tr>";
    html += "<th class='month-column'>Mois</th>";
    html += "<th class='etf1-column'>ETF1</th>";
    html += "<th class='etf2-column'>ETF2</th>";
    html += "</tr>";
    html += "</thead>";
    html += "<tbody>";
    
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    
    for (let month = 0; month < 12; month++) {
      html += "<tr>";
      html += "<td class='month-column'>" + monthNames[month] + "</td>";
      html += "<td class='etf1-column'>" + formatEuros(monthlyDataETF1[calendarYear][month]) + "</td>";
      html += "<td class='etf2-column'>" + formatEuros(monthlyDataETF2[calendarYear][month]) + "</td>";
      html += "</tr>";
    }
    
    html += "</tbody></table>";
    html += "</td>";
    html += "</tr>";
  }
  html += "</tbody></table></div>";

  // Ajout d'un résumé de la phase d'accumulation
  html += "<div class='summary-box'>";
  html += "<h3>Résumé de la phase d'accumulation</h3>";
  html += "<div class='summary-grid'>";
  html += "<div class='summary-item'><span>Capital final ETF1:</span> " + formatEuros(balanceETF1) + "</div>";
  html += "<div class='summary-item'><span>Capital final ETF2:</span> " + formatEuros(balanceETF2) + "</div>";
  html += "<div class='summary-item'><span>Total investi:</span> " + formatEuros(initialCapital + monthlyDeposit * totalMonths) + "</div>";
  html += "</div></div>";

  html += "<h2>Phase de décumulation</h2>";
  html += "<div class='table-container'>";
  html += "<table><thead><tr><th>Année</th><th>Capital initial</th><th>Intérêts</th><th>Retrait</th><th>Capital final</th></tr></thead><tbody>";
  
  const decumulationStartYear = currentYear + accumulationYears;
  for (let i = 0; i < decumulationDataETF1.length; i++) {
    const decumulationYear = decumulationStartYear + i;
    // Ligne pour ETF1
    html += "<tr class='etf1-row'>";
    html += "<td rowspan='2'>" + decumulationYear + "</td>";
    html += "<td>" + formatEuros(decumulationDataETF1[i].startingBalance) + "</td>";
    html += "<td>" + formatEuros(decumulationDataETF1[i].interest) + "</td>";
    html += "<td>" + formatEuros(decumulationDataETF1[i].withdrawal) + "</td>";
    html += "<td>" + formatEuros(decumulationDataETF1[i].endingBalance) + "</td>";
    html += "</tr>";
    
    // Ligne pour ETF2
    html += "<tr class='etf2-row'>";
    html += "<td>" + formatEuros(decumulationDataETF2[i].startingBalance) + "</td>";
    html += "<td>" + formatEuros(decumulationDataETF2[i].interest) + "</td>";
    html += "<td>" + formatEuros(decumulationDataETF2[i].withdrawal) + "</td>";
    html += "<td>" + formatEuros(decumulationDataETF2[i].endingBalance) + "</td>";
    html += "</tr>";
  }
  html += "</tbody></table></div>";

  resultsDiv.innerHTML = html;
  
  // Ajouter des écouteurs d'événements pour les lignes d'années cliquables
  const yearRows = document.querySelectorAll('.year-row');
  yearRows.forEach(row => {
    row.addEventListener('click', function() {
      const year = this.getAttribute('data-year');
      const detailsRow = document.getElementById('monthly-details-' + year);
      
      // Toggle l'affichage des détails mensuels
      if (detailsRow.style.display === 'none') {
        // Cacher tous les autres détails mensuels d'abord
        document.querySelectorAll('.monthly-details').forEach(el => {
          el.style.display = 'none';
        });
        detailsRow.style.display = 'table-row';
      } else {
        detailsRow.style.display = 'none';
      }
    });
  });
  
  // Faire défiler jusqu'au début des résultats
  document.querySelector(".content").scrollTop = 0;
}

// Initialiser l'application
document.addEventListener("DOMContentLoaded", function() {
  // Ajuster automatiquement la hauteur sur mobile
  function adjustHeight() {
    if (window.innerWidth <= 900) {
      document.body.style.height = "auto";
      document.body.style.overflow = "auto";
    } else {
      document.body.style.height = "100vh";
      document.body.style.overflow = "hidden";
    }
  }
  
  // Exécuter une fois au chargement
  adjustHeight();
  
  // Exécuter à chaque redimensionnement
  window.addEventListener("resize", adjustHeight);
}); 