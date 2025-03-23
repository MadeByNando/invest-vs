function formatEuros(number) {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(number));
}

// Fonction pour créer un filtre d'ETF
function createETFFilter(etfs, tableId, updateFunction) {
  const filterContainer = document.createElement('div');
  filterContainer.className = 'etf-filter';
  
  const label = document.createElement('label');
  label.textContent = 'Filtrer par ETF:';
  filterContainer.appendChild(label);
  
  const checkboxContainer = document.createElement('div');
  checkboxContainer.className = 'checkbox-container';
  
  etfs.forEach(etf => {
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.className = 'checkbox-wrapper';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `${tableId}-${etf}`;
    checkbox.value = etf;
    checkbox.checked = true;
    checkbox.addEventListener('change', updateFunction);
    
    const checkboxLabel = document.createElement('label');
    checkboxLabel.htmlFor = `${tableId}-${etf}`;
    checkboxLabel.textContent = etf;
    
    checkboxWrapper.appendChild(checkbox);
    checkboxWrapper.appendChild(checkboxLabel);
    checkboxContainer.appendChild(checkboxWrapper);
  });
  
  filterContainer.appendChild(checkboxContainer);
  return filterContainer;
}

function simulate() {
  // Vérifier si ETF2 est actif
  const isETF2Active = document.getElementById('etf2-container').style.display !== 'none';
  
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
  
  // Récupérer les valeurs d'ETF2 seulement s'il est actif
  const feeETF2 = isETF2Active ? 
    parseFloat(document.getElementById("feeETF2").value) / 100 : 0;

  const retirementYears = parseInt(
    document.getElementById("retirementYears").value
  );
  const netWithdrawalAnnual = parseFloat(
    document.getElementById("netWithdrawalAnnual").value
  );
  const taxETF1 =
    parseFloat(document.getElementById("taxETF1").value) / 100;
  
  // Récupérer les valeurs d'ETF2 seulement s'il est actif
  const taxETF2 = isETF2Active ? 
    parseFloat(document.getElementById("taxETF2").value) / 100 : 0;

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
  let balanceETF2 = isETF2Active ? initialCapital : 0;

  for (let month = 1; month <= totalMonths; month++) {
    // Ajout du versement mensuel et application du facteur mensuel net
    balanceETF1 = (balanceETF1 + monthlyDeposit) * monthlyNetETF1;
    
    // Calculer ETF2 seulement s'il est actif
    if (isETF2Active) {
      balanceETF2 = (balanceETF2 + monthlyDeposit) * monthlyNetETF2;
    }

    // Calculer l'année et le mois courants
    const simulationYear = Math.ceil(month / 12);
    const calendarYear = currentYear + simulationYear - 1;
    const monthIndex = (month - 1) % 12;
    
    // Stocker les données mensuelles
    if (!monthlyDataETF1[calendarYear]) {
      monthlyDataETF1[calendarYear] = Array(12).fill(null);
      if (isETF2Active) {
        monthlyDataETF2[calendarYear] = Array(12).fill(null);
      }
    }
    
    monthlyDataETF1[calendarYear][monthIndex] = balanceETF1;
    if (isETF2Active) {
      monthlyDataETF2[calendarYear][monthIndex] = balanceETF2;
    }

    // Enregistrer les données à la fin de chaque année (tous les 12 mois)
    if (month % 12 === 0) {
      const simulationYear = Math.floor(month / 12);
      const calendarYear = currentYear + simulationYear - 1;
      accumulationDataETF1.push({ year: simulationYear, calendarYear: calendarYear, balance: balanceETF1 });
      if (isETF2Active) {
        accumulationDataETF2.push({ year: simulationYear, calendarYear: calendarYear, balance: balanceETF2 });
      }
    }
  }

  // Calcul du taux annuel effectif net en décumulation à partir du taux mensuel net
  const annualNetETF1 = Math.pow(monthlyNetETF1, 12);
  const annualNetETF2 = isETF2Active ? Math.pow(monthlyNetETF2, 12) : 0;

  // Calcul des retraits bruts à effectuer pour obtenir le retrait net désiré
  const withdrawalGrossETF1 = netWithdrawalAnnual / (1 - taxETF1);
  const withdrawalGrossETF2 = isETF2Active ? netWithdrawalAnnual / (1 - taxETF2) : 0;

  // Simulation de la phase de décumulation
  const decumulationDataETF1 = [];
  const decumulationDataETF2 = [];

  // Les capitaux de départ en décumulation sont les soldes fin d'accumulation
  let decumulationBalanceETF1 = balanceETF1;
  let decumulationBalanceETF2 = isETF2Active ? balanceETF2 : 0;

  for (let year = 1; year <= retirementYears; year++) {
    const startingBalanceETF1 = decumulationBalanceETF1;
    const startingBalanceETF2 = isETF2Active ? decumulationBalanceETF2 : 0;

    const interestETF1 = startingBalanceETF1 * (annualNetETF1 - 1);
    const interestETF2 = isETF2Active ? startingBalanceETF2 * (annualNetETF2 - 1) : 0;

    // Mise à jour du capital en appliquant le rendement puis en retirant le montant brut
    decumulationBalanceETF1 =
      startingBalanceETF1 * annualNetETF1 - withdrawalGrossETF1;
    
    if (isETF2Active) {
      decumulationBalanceETF2 =
        startingBalanceETF2 * annualNetETF2 - withdrawalGrossETF2;
    }

    decumulationDataETF1.push({
      year: year,
      startingBalance: startingBalanceETF1,
      interest: interestETF1,
      withdrawal: withdrawalGrossETF1,
      endingBalance: decumulationBalanceETF1,
    });
    
    if (isETF2Active) {
      decumulationDataETF2.push({
        year: year,
        startingBalance: startingBalanceETF2,
        interest: interestETF2,
        withdrawal: withdrawalGrossETF2,
        endingBalance: decumulationBalanceETF2,
      });
    }
  }

  // Construction du tableau HTML pour la phase d'accumulation
  const resultsDiv = document.getElementById("results");
  let html = "";

  // Supprimer le message d'instruction initial
  const emptyResults = document.querySelector(".empty-results");
  if (emptyResults) {
    emptyResults.remove();
  }

  // Les ETFs à afficher dépendent de si ETF2 est actif
  const etfsToDisplay = isETF2Active ? ['ETF1', 'ETF2'] : ['ETF1'];

  html += "<h2>Phase d'accumulation</h2>";
  html += "<div class='table-container' id='accumulation-table-container'>";
  html += "<div id='accumulation-filter'></div>";
  
  // Ajuster les en-têtes du tableau en fonction des ETFs actifs
  html += "<table class='main-table' id='accumulation-table'><thead><tr><th>Année</th><th class='etf-col etf1-col'>Balance ETF1</th>";
  if (isETF2Active) {
    html += "<th class='etf-col etf2-col'>Balance ETF2</th>";
  }
  html += "</tr></thead><tbody>";
  
  for (let i = 0; i < accumulationDataETF1.length; i++) {
    const simulationYear = accumulationDataETF1[i].year;
    const calendarYear = accumulationDataETF1[i].calendarYear;
    html += "<tr class='year-row' data-year='" + calendarYear + "'>";
    html += "<td class='clickable-year'>" + calendarYear + "</td>";
    html += "<td class='etf-col etf1-col'>" + formatEuros(accumulationDataETF1[i].balance) + "</td>";
    if (isETF2Active) {
      html += "<td class='etf-col etf2-col'>" + formatEuros(accumulationDataETF2[i].balance) + "</td>";
    }
    html += "</tr>";
    
    // Ajouter une ligne pour les détails mensuels (initialement cachée)
    html += "<tr class='monthly-details' id='monthly-details-" + calendarYear + "' style='display: none;'>";
    html += "<td colspan='" + (isETF2Active ? 3 : 2) + "' style='padding: 0;'>";
    
    // Table des détails mensuels avec classes spécifiques pour l'alignement
    html += "<table class='monthly-table'>";
    html += "<thead class='monthly-header'>";
    html += "<tr>";
    html += "<th class='month-column'>Mois</th>";
    html += "<th class='etf-col etf1-col'>ETF1</th>";
    if (isETF2Active) {
      html += "<th class='etf-col etf2-col'>ETF2</th>";
    }
    html += "</tr>";
    html += "</thead>";
    html += "<tbody>";
    
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    
    for (let month = 0; month < 12; month++) {
      html += "<tr>";
      html += "<td class='month-column'>" + monthNames[month] + "</td>";
      html += "<td class='etf-col etf1-col'>" + formatEuros(monthlyDataETF1[calendarYear][month]) + "</td>";
      if (isETF2Active) {
        html += "<td class='etf-col etf2-col'>" + formatEuros(monthlyDataETF2[calendarYear][month]) + "</td>";
      }
      html += "</tr>";
    }
    
    html += "</tbody></table>";
    html += "</td>";
    html += "</tr>";
  }
  html += "</tbody></table></div>";

  // Ajout d'un résumé de la phase d'accumulation avec des classes pour le filtrage
  html += "<div class='summary-box'>";
  html += "<h3>Résumé de la phase d'accumulation</h3>";
  html += "<div class='summary-grid'>";
  html += "<div class='summary-item etf-col etf1-col'><span>Capital final ETF1:</span> " + formatEuros(balanceETF1) + "</div>";
  if (isETF2Active) {
    html += "<div class='summary-item etf-col etf2-col'><span>Capital final ETF2:</span> " + formatEuros(balanceETF2) + "</div>";
  }
  html += "<div class='summary-item'><span>Total investi:</span> " + formatEuros(initialCapital + monthlyDeposit * totalMonths) + "</div>";
  html += "</div></div>";

  html += "<h2>Phase de décumulation</h2>";
  html += "<div class='table-container' id='decumulation-table-container'>";
  html += "<div id='decumulation-filter'></div>";
  html += "<table id='decumulation-table'><thead><tr><th>Année</th><th>ETF</th><th>Capital initial</th><th>Intérêts</th><th>Retrait</th><th>Capital final</th></tr></thead><tbody>";
  
  const decumulationStartYear = currentYear + accumulationYears;
  for (let i = 0; i < decumulationDataETF1.length; i++) {
    const decumulationYear = decumulationStartYear + i;
    const yearId = `year-${decumulationYear}`;
    
    // Ligne pour ETF1
    html += `<tr class='etf1-row' data-etf='ETF1' data-year-id='${yearId}'>`;
    
    // Si ETF2 est actif, on utilise rowspan pour l'année
    if (isETF2Active) {
      html += `<td class='year-cell' rowspan='2'>${decumulationYear}</td>`;
    } else {
      html += `<td class='year-cell'>${decumulationYear}</td>`;
    }
    
    html += "<td>ETF1</td>";
    html += "<td>" + formatEuros(decumulationDataETF1[i].startingBalance) + "</td>";
    html += "<td>" + formatEuros(decumulationDataETF1[i].interest) + "</td>";
    html += "<td>" + formatEuros(decumulationDataETF1[i].withdrawal) + "</td>";
    html += "<td>" + formatEuros(decumulationDataETF1[i].endingBalance) + "</td>";
    html += "</tr>";
    
    // Ligne pour ETF2 seulement s'il est actif
    if (isETF2Active) {
      html += `<tr class='etf2-row' data-etf='ETF2' data-year-id='${yearId}'>`;
      html += "<td>ETF2</td>";
      html += "<td>" + formatEuros(decumulationDataETF2[i].startingBalance) + "</td>";
      html += "<td>" + formatEuros(decumulationDataETF2[i].interest) + "</td>";
      html += "<td>" + formatEuros(decumulationDataETF2[i].withdrawal) + "</td>";
      html += "<td>" + formatEuros(decumulationDataETF2[i].endingBalance) + "</td>";
      html += "</tr>";
    }
  }
  html += "</tbody></table></div>";

  resultsDiv.innerHTML = html;
  
  // Ajouter le filtre pour le tableau d'accumulation, seulement si ETF2 est actif
  if (isETF2Active) {
    const accumulationFilter = createETFFilter(etfsToDisplay, 'accumulation', updateAccumulationTableDisplay);
    document.getElementById('accumulation-filter').appendChild(accumulationFilter);
    
    // Ajouter le filtre pour le tableau de décumulation
    const decumulationFilter = createETFFilter(etfsToDisplay, 'decumulation', updateDecumulationTableDisplay);
    document.getElementById('decumulation-filter').appendChild(decumulationFilter);
  }
  
  // Fonction pour mettre à jour l'affichage du tableau d'accumulation
  function updateAccumulationTableDisplay() {
    const showETF1 = document.getElementById('accumulation-ETF1').checked;
    const showETF2 = document.getElementById('accumulation-ETF2').checked;
    
    // Mise à jour des colonnes dans le tableau principal
    document.querySelectorAll('#accumulation-table .etf1-col').forEach(col => {
      col.style.display = showETF1 ? '' : 'none';
    });
    
    document.querySelectorAll('#accumulation-table .etf2-col').forEach(col => {
      col.style.display = showETF2 ? '' : 'none';
    });
    
    // Mise à jour des colonnes dans les détails mensuels
    document.querySelectorAll('.monthly-table .etf1-col').forEach(col => {
      col.style.display = showETF1 ? '' : 'none';
    });
    
    document.querySelectorAll('.monthly-table .etf2-col').forEach(col => {
      col.style.display = showETF2 ? '' : 'none';
    });
    
    // Mise à jour des éléments du résumé
    document.querySelectorAll('.summary-box .etf1-col').forEach(item => {
      item.style.display = showETF1 ? '' : 'none';
    });
    
    document.querySelectorAll('.summary-box .etf2-col').forEach(item => {
      item.style.display = showETF2 ? '' : 'none';
    });
  }
  
  // Fonction pour mettre à jour l'affichage du tableau de décumulation
  function updateDecumulationTableDisplay() {
    const showETF1 = document.getElementById('decumulation-ETF1').checked;
    const showETF2 = document.getElementById('decumulation-ETF2').checked;
    
    // Obtenir tous les IDs d'années uniques
    const yearIds = new Set();
    document.querySelectorAll('#decumulation-table [data-year-id]').forEach(row => {
      yearIds.add(row.getAttribute('data-year-id'));
    });
    
    // Traiter chaque année séparément
    yearIds.forEach(yearId => {
      const etf1Row = document.querySelector(`#decumulation-table .etf1-row[data-year-id="${yearId}"]`);
      const etf2Row = document.querySelector(`#decumulation-table .etf2-row[data-year-id="${yearId}"]`);
      
      if (!etf1Row || !etf2Row) return;
      
      // Afficher ou masquer selon les filtres
      etf1Row.style.display = showETF1 ? '' : 'none';
      etf2Row.style.display = showETF2 ? '' : 'none';
      
      // Gérer la cellule d'année
      const yearCell = etf1Row.querySelector('.year-cell');
      if (!yearCell) return;
      
      // Si les deux ETFs sont visibles
      if (showETF1 && showETF2) {
        yearCell.rowSpan = 2;
        
        // S'assurer que ETF2 n'a pas de cellule d'année
        if (etf2Row.cells[0].classList.contains('year-cell')) {
          etf2Row.removeChild(etf2Row.cells[0]);
        }
      } 
      // Si seulement ETF1 est visible
      else if (showETF1 && !showETF2) {
        yearCell.rowSpan = 1;
      } 
      // Si seulement ETF2 est visible
      else if (!showETF1 && showETF2) {
        // Copier l'année de ETF1 vers ETF2 si elle n'existe pas déjà
        if (!etf2Row.querySelector('.year-cell')) {
          const newYearCell = yearCell.cloneNode(true);
          newYearCell.rowSpan = 1;
          etf2Row.insertBefore(newYearCell, etf2Row.firstChild);
        }
      }
      // Si aucun ETF n'est visible, on ne fait rien car les lignes sont déjà masquées
    });
  }
  
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
        
        // Retirer la classe active de toutes les lignes d'années
        document.querySelectorAll('.year-row').forEach(row => {
          row.classList.remove('active');
        });
        
        // Ajouter la classe active à la ligne actuelle
        this.classList.add('active');
        
        detailsRow.style.display = 'table-row';
      } else {
        detailsRow.style.display = 'none';
        // Retirer la classe active de la ligne actuelle quand on ferme les détails
        this.classList.remove('active');
      }
    });
  });
  
  // Faire défiler jusqu'au début des résultats
  document.querySelector(".content").scrollTop = 0;
}

// Ajouter des gestionnaires d'événements pour les boutons d'ajout/suppression d'ETF
document.addEventListener("DOMContentLoaded", function() {
  // Initialiser l'application
  const addETFButton = document.getElementById('addETFButton');
  const removeETFButton = document.getElementById('removeETFButton');
  
  if (addETFButton && removeETFButton) {
    // Variables pour suivre l'état
    let etf2Active = false;
    
    // Fonction pour activer ETF2
    function enableETF2() {
      document.getElementById('etf2-container').style.display = 'block';
      document.getElementById('taxETF2-container').style.display = 'block';
      addETFButton.style.display = 'none';
      removeETFButton.style.display = 'inline-block';
      etf2Active = true;
      
      // Lancer la simulation automatiquement après l'ajout de l'ETF2
      simulate();
    }
    
    // Fonction pour désactiver ETF2
    function disableETF2() {
      document.getElementById('etf2-container').style.display = 'none';
      document.getElementById('taxETF2-container').style.display = 'none';
      addETFButton.style.display = 'inline-block';
      removeETFButton.style.display = 'none';
      etf2Active = false;
      
      // Lancer la simulation automatiquement après la suppression de l'ETF2
      simulate();
    }
    
    // Ajouter les écouteurs d'événements
    addETFButton.addEventListener('click', enableETF2);
    removeETFButton.addEventListener('click', disableETF2);
  }
  
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