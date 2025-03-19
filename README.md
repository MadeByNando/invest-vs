# README

## Explication du fonctionnement et des calculs

Cette application a pour objectif de comparer l’évolution de deux ETF (Exchange Traded Funds) à travers deux grandes étapes :

1. **La phase d’accumulation** (constitution du capital)
2. **La phase de décumulation** (utilisation du capital pour générer des retraits)

Le code principal se trouve dans [`script.js`](./script.js). Ci-dessous, un aperçu détaillé de chacun des calculs et des paramètres utilisés.

---

### 1. Phase d’accumulation

1. **Récupération des paramètres**

   - Capital initial \(\text{(initialCapital)}\)
   - Versement mensuel \(\text{(monthlyDeposit)}\)
   - Nombre d’années d’accumulation \(\text{(accumulationYears)}\)
   - Rendement annuel \(\text{(annualReturn)}\) exprimé en pourcentage
   - Frais annuels de gestion pour ETF1 et ETF2 \(\text{(feeETF1, feeETF2)}\)

2. **Calculs préliminaires**

   - Rendement mensuel brut  
     \[
     \text{monthlyGross} = (1 + \text{annualReturn})^{\frac{1}{12}}
     \]
   - Frais mensuels estimés (en divisant les frais annuels par 12)  
     \[
     \text{monthlyFeeETF1} = \frac{\text{feeETF1}}{12}, \quad
     \text{monthlyFeeETF2} = \frac{\text{feeETF2}}{12}
     \]
   - Rendement mensuel net pour chaque ETF  
     \[
     \text{monthlyNetETF1} = \text{monthlyGross} - \text{monthlyFeeETF1},\quad
     \text{monthlyNetETF2} = \text{monthlyGross} - \text{monthlyFeeETF2}
     \]

3. **Boucle de simulation**  
   On itère chaque mois pendant \(\text{accumulationYears} \times 12\) mois :  
   \[
   \text{balanceETF} = (\text{balanceETF} + \text{monthlyDeposit}) \times \text{monthlyNetETF}
   \]
   Les valeurs intermédiaires (une fois par an) sont enregistrées afin de produire un tableau d’évolution annuel.

4. **Résultat de la phase d’accumulation**  
   Au terme de ces calculs, on obtient :
   - Le capital final de chaque ETF.
   - Le total investi \(\text{(initialCapital + monthlyDeposit \* nombreDeMois)}\).
   - Un tableau affichant l’évolution du capital année par année pour chaque ETF.

---

### 2. Phase de décumulation

1. **Paramètres de décumulation**

   - Nombre d’années de retraite \(\text{(retirementYears)}\)
   - Retrait net annuel souhaité \(\text{(netWithdrawalAnnual)}\)
   - Taux d’imposition pour ETF1 et ETF2 \(\text{(taxETF1, taxETF2)}\)

2. **Calculs préliminaires**

   - Rendement net annuel (bâti sur le rendement mensuel net) :  
     \[
     \text{annualNetETF1} = \bigl(\text{monthlyNetETF1}\bigr)^{12}, \quad
     \text{annualNetETF2} = \bigl(\text{monthlyNetETF2}\bigr)^{12}
     \]
   - Pour obtenir le retrait « brut » correspondant au retrait « net » souhaité, on tient compte de la taxe associée à chaque ETF :  
     \[
     \text{withdrawalGrossETF} = \frac{\text{netWithdrawalAnnual}}{1 - \text{taxETF}}
     \]

3. **Boucle de simulation annuelle**  
   À chaque fin d’année de retraite :

   - On calcule les intérêts :  
     \[
     \text{interestETF} = \text{startingBalanceETF} \times \bigl(\text{annualNetETF} - 1\bigr)
     \]
   - Le capital en fin d’année après retrait :  
      \[
     \text{endingBalanceETF} = \text{startingBalanceETF} \times \text{annualNetETF}
     \;-\; \text{withdrawalGrossETF}
     \]
     Les résultats sont enregistrés pour chaque année de retraite.

4. **Résultat de la phase de décumulation**
   - Tableau affichant pour chaque année :
     1. Le capital de départ.
     2. Les intérêts gagnés.
     3. Le montant retiré (brut).
     4. Le capital final de l’année.

---

## Visualisation des résultats

- Un tableau récapitule l’évolution du capital pendant la phase d’accumulation.
- Un second tableau affiche, chaque année, l’évolution du capital pendant la phase de décumulation.
- Des résumés (capital final, total investi, etc.) sont également affichés pour faciliter la lecture.

## Conclusion

L’application vous permet ainsi de :

- **Simuler** la constitution d’un capital sur la durée, avec des versements mensuels et un rendement donné, en tenant compte de frais annuels.
- **Estimer** la manière dont ce capital peut financer une retraite grâce à des retraits réguliers, en intégrant l’impact de la fiscalité propre à chaque ETF.

Vous pouvez ajuster les différents champs du formulaire pour comparer des scénarios et mieux appréhender l’impact du rendement, des frais et de la fiscalité sur l’évolution de votre patrimoine au fil du temps.
