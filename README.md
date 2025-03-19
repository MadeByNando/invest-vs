# README

## Explication des calculs effectués dans l'application

Cette application permet de simuler l'évolution de deux ETF (Exchange Traded Funds) à travers deux phases principales : l'accumulation et la décumulation.

### Phase d'accumulation

1. **Paramètres de départ :**
   - **Capital initial :** 20 000 €
   - **Versement mensuel :** 350 €
   - **Performance annuelle :** 7 %

2. **Calcul du facteur mensuel :**
   - Pour convertir une performance annuelle de 7 % en un facteur mensuel, on utilise la formule :
     \[
     \text{Facteur mensuel} = (1 + 0{,}07)^{\frac{1}{12}} \approx 1{,}005654
     \]
   - Cela signifie que chaque mois, le capital est multiplié par environ 1,005654, soit une croissance mensuelle d'environ 0,565 %.

3. **Calcul mensuel :**
   - Chaque mois, le calcul est le suivant :
     \[
     \text{Nouveau capital} = (\text{Ancien capital} + \text{Versement mensuel}) \times \text{Facteur mensuel}
     \]
   - Par exemple, pour le premier mois :
     \[
     \text{Nouveau capital} = (20\,000 + 350) \times 1,005654 \approx 20\,465{,}01\,\text{€}
     \]

4. **Suivi annuel :**
   - Ce calcul est répété chaque mois, et à la fin de chaque année, le capital est enregistré pour suivre l'évolution de l'investissement.

### Phase de décumulation

1. **Paramètres de décumulation :**
   - **Nombre d'années de retraite :** Variable
   - **Retrait net annuel souhaité :** Variable
   - **Taux d'imposition :** Variable pour chaque ETF

2. **Calculs préliminaires :**
   - Rendement net annuel basé sur le rendement mensuel net :
     \[
     \text{Rendement net annuel} = \bigl(\text{Facteur mensuel net}\bigr)^{12}
     \]
   - Calcul du retrait brut en tenant compte de la taxe :
     \[
     \text{Retrait brut} = \frac{\text{Retrait net souhaité}}{1 - \text{Taux d'imposition}}
     \]

3. **Simulation annuelle :**
   - À chaque fin d'année de retraite, on calcule :
     - Les intérêts gagnés
     - Le capital après retrait

4. **Résultats :**
   - Un tableau affiche l'évolution du capital chaque année, avec les intérêts gagnés et les retraits effectués.

## Conclusion

L'application vous permet de simuler la constitution et l'utilisation d'un capital sur la durée, en tenant compte des performances annuelles, des versements mensuels, des frais et de la fiscalité. Vous pouvez ajuster les paramètres pour explorer différents scénarios et mieux comprendre l'impact de ces facteurs sur votre patrimoine.
