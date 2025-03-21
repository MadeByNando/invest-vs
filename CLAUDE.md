# CLAUDE.md - Development Guidelines

## Commands
- Open project: `cd /Users/nando/Desktop/Code/invest_vs`
- Preview: Open `index.html` in a browser (no build process needed)
- Format code: No specific formatter configured

## Code Style
- **HTML**: Standard HTML5, use semantic elements and proper indentation (2 spaces)
- **CSS**: Use CSS variables (defined in `:root`), BEM naming for classes
- **JavaScript**: 
  - Use camelCase for variables and functions
  - Prefer `const`/`let` over `var`
  - 2-space indentation
  - Use ES6+ features (template literals, arrow functions)
  - Format currencies with `Intl.NumberFormat`

## Architecture
- Simple frontend-only application (HTML/CSS/JavaScript)
- Data flow: UI inputs → calculation functions → DOM updates
- Modular functions with clear responsibilities

## Naming Conventions
- HTML IDs: camelCase (e.g., `initialCapital`, `netWithdrawalAnnual`)
- CSS classes: kebab-case (e.g., `form-group`, `year-row`)
- Variables: descriptive camelCase names