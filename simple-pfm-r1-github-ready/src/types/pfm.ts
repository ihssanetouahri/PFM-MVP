export type ScreenId =
  | 'A1_HOME'
  | 'B0_INTRO'
  | 'B1_INTENTION'
  | 'B2_PERSONALIZATION'
  | 'B3_TRANSPARENCY'
  | 'B4_LOADING'
  | 'B5_FIRST_VALUE'
  | 'C1_HUB'
  | 'D1_EXPENSES'
  | 'D2_CATEGORY_DETAIL'
  | 'D2_SHOPPING_INSIGHT'
  | 'D3_TRANSACTION_DETAIL'
  | 'D4_COACH'
  | 'D5_SUBSCRIPTIONS_DETAIL'
  | 'E1_CREATE_BUDGET'
  | 'E2_BUDGET_SUCCESS'
  | 'E4_FORECAST_RECURRING'
  | 'F2_CHALLENGE_DETAIL'
  | 'F3_ACTIVE_CHALLENGE'
  | 'F4_SHOPPING_CHALLENGE'
  | 'G2_COURSE_DETAIL'
  | 'G3_LESSON'
  | 'G4_QUIZ'
  | 'G5_COURSE_SUCCESS'
  | 'H0_CREATE_GOAL'
  | 'H1_SAVINGS_GOAL'
  | 'H2_ADD_MONEY'
  | 'H3_AUTO_SAVINGS'
  | 'H4_AUTO_SAVINGS_SUCCESS'
  | 'J1_HOUSEHOLD_SPACE'
  | 'J2_HOUSEHOLD_SPLIT'
  | 'J3_HOUSEHOLD_SETUP'
  | 'J4_FAMILY_BUDGETS'
  | 'J5_FAMILY_BUDGET_DETAIL'
  | 'I1_WIDGET_CATALOG'
  | 'I2_PERSONALIZE_LAYOUT'
  | 'I3_INVEST_DISCOVERY'
  | 'WIDGET_DETAIL'
  | 'CARDS_VIEW'
  | 'MENU_VIEW'
  | 'J_POCKET_DETAIL'
  | 'J_FAMILY_ACCOUNT';

export type HubTab = 'MON_ESPACE' | 'MES_DEFIS' | 'LEARN_EARN';

export type MonEspaceSubTab =
  | 'DEPENSES'
  | 'BUDGETS'
  | 'PROJETS'
  | 'FOYER'
  | 'COMMUNAUTE'
  | 'INVESTIR';

export type PeriodFilter = 'CE_MOIS' | '3_MOIS' | 'CETTE_ANNEE' | 'PERSONNALISEE';

export type AccountScope = 'COMPTE_PRINCIPAL' | 'TOUS_COMPTES';

export type BilanMonthKey = '2026-10' | '2026-09' | '2026-08';

export interface EligibleAccountOption {
  id: string;
  label: string;
  subtitle?: string;
}

export type SpendingCategory =
  | 'Shopping'
  | 'Sorties'
  | 'Courses'
  | 'Transport'
  | 'Factures'
  | 'Loisirs'
  | 'Autres';

export type TransactionType = 'EXPENSE' | 'INCOME' | 'INTERNAL_TRANSFER';

export interface Transaction {
  id: string;
  merchant: string;
  subtitle: string;
  date: string; // e.g. '10 oct. 2026'
  monthKey: '2026-10' | '2026-09' | '2026-08';
  amount: number; // positive number in DH
  type: TransactionType;
  category: SpendingCategory | 'Revenus' | 'Épargne';
  account: 'COMPTE_PRINCIPAL' | 'COMPTE_SECONDAIRE';
  cardLast4?: string;
  uncertainCategory?: boolean;
  verifiedByUser?: boolean;
  isRecurring?: boolean;
  status?: string;
  isSplit?: boolean;
}

export type BudgetScope = 'PERSONNEL' | 'FOYER';

export interface CategoryBudget {
  id?: string;
  category: SpendingCategory;
  limit: number;
  alertThresholdPct: number; // e.g. 80
  createdAt: string;
  scope?: BudgetScope;
  name?: string;
  status?: 'ACTIVE' | 'STOPPED';
  startPeriod?: 'CURRENT' | 'NEXT';
}

export interface ChallengeMilestone {
  id: string;
  label: string;
  targetValue: number;
  currentValue: number;
  completed: boolean;
}

export interface FinancialChallenge {
  id: string;
  title: string;
  shortTitle: string;
  purpose: string;
  duration: string;
  difficulty: 'Accessible' | 'Modéré' | 'Régulier';
  category: SpendingCategory | 'Épargne' | 'Général' | 'Foyer' | 'Investissement';
  status: 'RECOMMENDED' | 'ACTIVE' | 'COMPLETED';
  progressPct: number;
  daysRemaining: number;
  totalWeeks: number;
  currentWeek: number;
  pointsReward: number;
  badgeName: string;
  criteriaText: string;
  milestones: ChallengeMilestone[];
}

export interface LessonSlide {
  id: string;
  title: string;
  content: string;
  exampleBox: string;
  keyTakeaway: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LearningCourse {
  id: string;
  title: string;
  category:
    | 'Comprendre mes dépenses'
    | 'Construire un budget'
    | 'Épargner pour mes projets'
    | 'Gérer les dépenses de mon foyer'
    | "Découvrir l'investissement";
  duration: string;
  lessonsCount: number;
  points: number;
  badgeTitle: string;
  description: string;
  outcome: string;
  completed: boolean;
  progressPct: number;
  slides: LessonSlide[];
  quiz: QuizQuestion[];
}

export type AutoSavingsMethod = 'ROUND_UP' | 'MONTHLY_TRANSFER' | 'ON_SALARY';

export type SavingsMethodType =
  | 'ARRONDIS'
  | 'VERSEMENT_PONCTUEL'
  | 'EPARGNE_INTELLIGENTE'
  | 'VERSEMENT_PROGRAMME'
  | 'APRES_ACHATS';

export interface SavingsContributionHistory {
  id: string;
  date: string;
  label: string;
  amount: number;
  method: SavingsMethodType;
}

export interface SavingsMethodConfig {
  type: SavingsMethodType;
  sourceAccount: string;
  status: 'ACTIVE' | 'PAUSED';
  // Method 1: Arrondis
  roundingLevel?: 5 | 10;
  roundingMultiplier?: 1 | 2 | 5;
  monthlyCeiling?: number;
  // Method 2: Versement ponctuel
  oneTimeAmount?: number;
  // Method 3: Épargne intelligente
  smartIntensity?: 'DOUCE' | 'EQUILIBREE' | 'DYNAMIQUE';
  minPreservedBalance?: number;
  smartMaxWeekly?: number;
  smartPauseEnabled?: boolean;
  // Method 4: Versement programmé
  scheduledAmount?: number;
  scheduledFrequency?: 'HEBDOMADAIRE' | 'MENSUELLE' | 'PERSONNALISEE';
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  // Method 5: Après mes achats
  purchaseTriggerType?: 'CATEGORY' | 'MERCHANT';
  purchaseCategory?: SpendingCategory;
  purchaseMerchant?: string;
  purchaseRuleType?: 'FIXED' | 'PERCENTAGE';
  purchaseRuleValue?: number;
  purchasePerTxMax?: number;
  purchaseMonthlyMax?: number;
}

export interface AutoSavingsConfig {
  enabled: boolean;
  method: AutoSavingsMethod;
  roundUpMultiplier: 1 | 2 | 5;
  monthlyAmount: number;
  salaryPercentage: number;
  accumulatedThisMonth: number;
  destinationGoalId: string;
  sourceAccount: string;
}

export type GoalScope = 'PERSONNEL' | 'FOYER';

export interface SavingsGoal {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  savedAmount: number;
  targetAmount: number;
  deadline: string;
  imageUrl: string;
  isCreated: boolean;
  categoryTag?: string;
  methodConfig?: SavingsMethodConfig;
  contributionsHistory?: SavingsContributionHistory[];
  scope?: GoalScope;
  isSharedWithHousehold?: boolean;
}

export type ObjectiveCategory =
  | 'Comprendre mon comportement financier'
  | 'Maîtriser ma situation financière'
  | 'Apprendre à épargner'
  | 'Gérer les dépenses de mon foyer'
  | 'Investir mon argent';

export interface WidgetCatalogItem {
  id: string;
  title: string;
  description: string;
  objective: ObjectiveCategory;
  category: MonEspaceSubTab;
  scope?: 'PERSONNEL' | 'FOYER';
  defaultActive: boolean;
  defaultOrder: number;
  previewMetric?: string;
  targetScreen?: ScreenId;
}

export interface CoachMessage {
  id: string;
  sender: 'COACH' | 'USER';
  text: string;
  highlightBox?: {
    label: string;
    value: string;
    subtext?: string;
  };
  actionCta?: {
    label: string;
    targetScreen: ScreenId;
    category?: SpendingCategory;
  };
}

// Chapter 4: Household models
export interface HouseholdMember {
  id: string;
  name: string;
  role: 'Administratrice' | 'Conjoint' | 'Membre' | string;
  avatarInitials: string;
  joinedDate: string;
  photoUrl?: string | null;
}

export interface HouseholdDraftMember {
  id: string;
  firstName: string;
  relationship: string;
  photoUrl: string | null;
  isSelf?: boolean;
  isSuggestedSimpleOne?: boolean;
  isConfirmed: boolean;
}

export interface SharedExpense {
  id: string;
  title: string;
  category: SpendingCategory;
  date: string;
  totalAmount: number;
  paidBy: string;
  shareLamia: number;
  shareOther: number;
  status: 'SPLIT_PENDING' | 'REIMBURSED' | 'SETTLED';
  participants?: { name: string; shareAmount: number }[];
}

export interface SplitRequest {
  id: string;
  expenseId: string;
  title: string;
  recipientName: string;
  amountRequested: number;
  date: string;
  status: 'PENDING' | 'SETTLED';
}

export type AllowanceFrequency = 'Ponctuel' | 'Hebdomadaire' | 'Mensuel';

export interface YasmineAllowanceConfig {
  isActive: boolean;
  referenceAmount: number;
  frequency: AllowanceFrequency;
}

// Chapter 2: Recurring & Forecast models
export interface RecurringCharge {
  id: string;
  title: string;
  category: string;
  amount: number;
  dueDay: number;
  isSubscription: boolean;
  frequency: 'Mensuel' | 'Annuel';
}

export type SubscriptionFrequency = 'Mensuel' | 'Trimestriel' | 'Annuel';
export type SubscriptionConfirmationStatus = 'CONFIRMED' | 'PENDING' | 'DISMISSED';

export interface DetectedSubscriptionItem {
  id: string;
  merchant: string;
  subtitle: string;
  amount: number;
  monthlyEquivalent: number;
  frequency: SubscriptionFrequency;
  status: SubscriptionConfirmationStatus;
  lastPaymentDate: string;
  nextExpectedDate: string;
  isNextDateEstimated: boolean;
  detectionNote: string;
  relatedTransactions: Transaction[];
}

export type DemoChapter =
  | 'COMPRENDRE'
  | 'MAITRISER'
  | 'EPARGNER'
  | 'FOYER'
  | 'INVESTIR';

export interface HouseholdPocketTransaction {
  id: string;
  date: string;
  label: string;
  amount: number;
  type: 'debit' | 'credit';
  category?: string;
}

export interface HouseholdPocket {
  id: string;
  memberId: string;
  memberName: string;
  roleLabel: string;
  avatarUrl: string;
  balance: number;
  iban: string;
  cardNumberMasked: string;
  monthlyAllowance?: number;
  allowanceFrequency?: string;
  spendingLimit?: number;
  transactions: HouseholdPocketTransaction[];
}

export interface HouseholdFamilyAccount {
  exists: boolean;
  id: string;
  label: string;
  subtitle: string;
  balance: number;
  iban: string;
  bic: string;
  holderNames: string;
  cardCount: number;
  transactions: HouseholdPocketTransaction[];
}

// Community ("Communauté") Models
export type CommunityCategoryTag =
  | 'Voyage & Amis'
  | 'Cadeau & Événement'
  | 'Sport & Club'
  | 'Colocation'
  | 'Projet solidaire';

export interface CommunityParticipant {
  id: string;
  name: string;
  role: 'Organisatrice' | 'Organisateur' | 'Membre' | 'Trésorier';
  avatarUrl?: string;
  avatarInitials: string;
  isCurrentUser?: boolean;
  authorizedActivity: boolean;
}

export interface CommunityCagnotteContribution {
  id: string;
  participantName: string;
  avatarUrl?: string;
  avatarInitials: string;
  amount: number;
  date: string;
  note?: string;
}

export interface CommunityCagnotte {
  id: string;
  communityId: string;
  communityName: string;
  title: string;
  description: string;
  collectedAmount: number;
  targetAmount: number;
  deadline: string;
  imageUrl: string;
  contributorsCount: number;
  totalMembersCount: number;
  status: 'ACTIVE' | 'COMPLETED';
  contributions: CommunityCagnotteContribution[];
}

export interface CommunityExpenseShare {
  participantId: string;
  participantName: string;
  avatarInitials: string;
  avatarUrl?: string;
  amount: number;
  status: 'PAID' | 'PENDING';
}

export interface CommunitySharedExpense {
  id: string;
  communityId: string;
  communityName: string;
  title: string;
  category: SpendingCategory;
  date: string;
  totalAmount: number;
  paidById: string;
  paidByName: string;
  splitMode: 'EQUAL' | 'CUSTOM' | 'PERCENTAGE';
  shares: CommunityExpenseShare[];
}

export interface CommunityBalanceItem {
  id: string;
  communityId: string;
  communityName: string;
  participantId: string;
  participantName: string;
  avatarUrl?: string;
  avatarInitials: string;
  direction: 'OWES_YOU' | 'YOU_OWE';
  amount: number;
  contextLabel: string;
  status: 'PENDING' | 'SETTLED';
}

export interface CommunityActivityItem {
  id: string;
  communityId: string;
  communityName: string;
  type: 'CAGNOTTE_CONTRIBUTION' | 'SHARED_EXPENSE' | 'SETTLEMENT' | 'MEMBER_JOINED';
  actorName: string;
  avatarUrl?: string;
  avatarInitials: string;
  title: string;
  subtitle: string;
  amount?: number;
  date: string;
  isPositive?: boolean;
}

export interface CommunityGroup {
  id: string;
  name: string;
  subtitle: string;
  categoryTag: CommunityCategoryTag;
  coverUrl: string;
  members: CommunityParticipant[];
  createdAt: string;
  visibilityNote: string;
}



