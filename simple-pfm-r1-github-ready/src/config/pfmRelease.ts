/** Prototype workbench: R1 navigation and widgets are deliberately conservative.
 * This file is a scope filter, not a claim that banking integrations are available.
 * The full exploratory vision is retained alongside R1.
 */
import type { ScreenId, MonEspaceSubTab } from '../types/pfm';

export type ExperienceMode = 'R1' | 'VISION';
export const EXPERIENCE_MODE_DEFAULT: ExperienceMode = 'R1';

const R1_TABS = new Set<MonEspaceSubTab>(['DEPENSES', 'BUDGETS', 'PROJETS']);
export const isR1AllowedCategory = (category: MonEspaceSubTab): boolean => R1_TABS.has(category);

// Only cards supporting an explicitly R1-scoped functionality from the feature workbook.
// The comparison F06 needs a new dedicated widget in the next implementation phase.
const R1_WIDGETS = new Set([
  'w-mois-bref', 'w-insights-personnalises', 'w-repartition-depenses',
  'w-abonnements', 'w-coach-depenses', 'w-evolution-depenses',
  'w-principaux-marchands', 'w-habitudes-depenses', 'w-revenus-vs-depenses',
  'w-budgets-categorie', 'w-budget-global', 'w-alertes-budgetaires',
  'w-projets-epargne', 'w-progression-epargne', 'w-versements-programmes',
]);
export const isR1AllowedWidget = (id: string): boolean => R1_WIDGETS.has(id);

const BLOCKED_R1_SCREENS = new Set<ScreenId>([
  'F2_CHALLENGE_DETAIL', 'F3_ACTIVE_CHALLENGE', 'F4_SHOPPING_CHALLENGE',
  'G2_COURSE_DETAIL', 'G3_LESSON', 'G4_QUIZ', 'G5_COURSE_SUCCESS',
  'J1_HOUSEHOLD_SPACE', 'J2_HOUSEHOLD_SPLIT', 'J3_HOUSEHOLD_SETUP',
  'J4_FAMILY_BUDGETS', 'J5_FAMILY_BUDGET_DETAIL', 'J_POCKET_DETAIL',
  'J_FAMILY_ACCOUNT', 'I3_INVEST_DISCOVERY', 'E4_FORECAST_RECURRING',
]);
export const isR1BlockedScreen = (screen: ScreenId): boolean => BLOCKED_R1_SCREENS.has(screen);
