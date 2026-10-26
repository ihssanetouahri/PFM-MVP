import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { EXPERIENCE_MODE_DEFAULT, isR1AllowedWidget, isR1AllowedCategory, isR1BlockedScreen, type ExperienceMode } from '../config/pfmRelease';
import {
  ScreenId,
  HubTab,
  MonEspaceSubTab,
  PeriodFilter,
  AccountScope,
  BilanMonthKey,
  EligibleAccountOption,
  SpendingCategory,
  Transaction,
  BudgetScope,
  CategoryBudget,
  FinancialChallenge,
  LearningCourse,
  GoalScope,
  SavingsGoal,
  AutoSavingsConfig,
  SavingsMethodConfig,
  SavingsContributionHistory,
  WidgetCatalogItem,
  CoachMessage,
  ObjectiveCategory,
  HouseholdMember,
  HouseholdDraftMember,
  SharedExpense,
  SplitRequest,
  DemoChapter,
  AllowanceFrequency,
  YasmineAllowanceConfig,
  SubscriptionFrequency,
  SubscriptionConfirmationStatus,
  DetectedSubscriptionItem,
  HouseholdPocket,
  HouseholdFamilyAccount,
  CommunityGroup,
  CommunityCagnotte,
  CommunitySharedExpense,
  CommunityBalanceItem,
  CommunityActivityItem,
  CommunityCategoryTag,
} from '../types/pfm';
import {
  INITIAL_TRANSACTIONS,
  INITIAL_SAVINGS_GOAL,
  DEMO_PREFILLED_SAVINGS_GOAL,
  DEFAULT_FAMILY_SAVINGS_GOAL,
  INITIAL_AUTO_SAVINGS,
  INITIAL_CHALLENGES,
  INITIAL_COURSES,
  ALL_40_WIDGETS,
  INITIAL_HOUSEHOLD_MEMBERS,
  INITIAL_SHARED_EXPENSES,
  INITIAL_SPLIT_REQUESTS,
  INITIAL_HOUSEHOLD_POCKETS,
  INITIAL_FAMILY_ACCOUNT,
  INITIAL_COMMUNITIES,
  INITIAL_COMMUNITY_CAGNOTTES,
  INITIAL_COMMUNITY_EXPENSES,
  INITIAL_COMMUNITY_BALANCES,
  INITIAL_COMMUNITY_ACTIVITIES,
  INTERNET_BILL_TRANSACTION,
  LAMIA_AVATAR_URL,
  formatDH,
  TRAVEL_PHOTO_URL,
} from '../data/initialData';

export interface CategorySummary {
  category: SpendingCategory;
  amount: number;
  prevMonthAmount: number;
  variationPct: number;
  sharePct: number;
  transactionsCount: number;
}

interface ToastInfo {
  id: string;
  message: string;
  subtext?: string;
}

interface MilestoneCelebration {
  title: string;
  message: string;
  pointsEarned?: number;
  badgeName?: string;
}

export interface CourseReturnContext {
  screen: ScreenId;
  category: SpendingCategory;
  periodFilter: PeriodFilter;
  accountScope: AccountScope;
  hubTab: HubTab;
  monEspaceSubTab: MonEspaceSubTab;
  scrollTop: number;
}

export interface CategoryDetailReturnContext {
  screen: ScreenId;
  hubTab: HubTab;
  monEspaceSubTab: MonEspaceSubTab;
  bilanMonth: BilanMonthKey;
  bilanAccount: string;
  periodFilter: PeriodFilter;
  accountScope: AccountScope;
  scrollTop: number;
}

interface PFMContextType {
  // Workbench version (prototype-only; no impact on production banking services)
  experienceMode: ExperienceMode;
  setExperienceMode: (mode: ExperienceMode) => void;
  isR1: boolean;
  // Navigation
  currentScreen: ScreenId;
  screenHistory: ScreenId[];
  courseReturnContext: CourseReturnContext | null;
  returnFromCourse: () => void;
  returnFromCategoryDetail: () => void;
  budgetCreationOrigin: 'LEARN_EARN' | 'STANDARD' | null;
  clearBudgetCreationOrigin: () => void;
  navigateTo: (
    screen: ScreenId,
    options?: {
      hubTab?: HubTab;
      monEspaceSubTab?: MonEspaceSubTab;
      category?: SpendingCategory;
      budgetScope?: BudgetScope;
      budgetOrigin?: 'LEARN_EARN' | 'STANDARD';
      goalScope?: GoalScope;
      transactionId?: string;
      challengeId?: string;
      courseId?: string;
      widgetId?: string;
      suggestedGoalTag?: string;
      suggestedGoalImageId?: string;
      suggestedGoalTitle?: string;
      fromSimpleOneNotification?: boolean;
      pocketId?: string;
    }
  ) => void;
  goBack: () => void;
  activeHubTab: HubTab;
  setActiveHubTab: (tab: HubTab) => void;
  monEspaceSubTab: MonEspaceSubTab;
  setMonEspaceSubTab: (tab: MonEspaceSubTab) => void;
  suggestedGoalTag: string | null;
  setSuggestedGoalTag: (tag: string | null) => void;
  suggestedGoalImageId: string | null;
  setSuggestedGoalImageId: (id: string | null) => void;
  suggestedGoalTitle: string | null;
  setSuggestedGoalTitle: (title: string | null) => void;

  // Discovery & Modals
  isDiscoverySheetOpen: boolean;
  setIsDiscoverySheetOpen: (open: boolean) => void;
  milestoneModal: MilestoneCelebration | null;
  setMilestoneModal: (m: MilestoneCelebration | null) => void;
  toast: ToastInfo | null;
  showToast: (message: string, subtext?: string) => void;
  dismissToast: () => void;

  // Onboarding selections
  selectedIntention: ObjectiveCategory;
  setSelectedIntention: (obj: ObjectiveCategory) => void;
  selectedSubQuestion: string;
  setSelectedSubQuestion: (q: string) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (v: boolean) => void;
  extendedDataConsent: boolean | null;
  setExtendedDataConsent: (v: boolean | null) => void;

  // Filters
  periodFilter: PeriodFilter;
  setPeriodFilter: (p: PeriodFilter) => void;
  accountScope: AccountScope;
  setAccountScope: (a: AccountScope) => void;
  bilanMonth: BilanMonthKey;
  setBilanMonth: (m: BilanMonthKey) => void;
  bilanAccount: string;
  setBilanAccount: (a: string) => void;
  eligibleAccounts: EligibleAccountOption[];
  bilanAnalytics: {
    monthKey: BilanMonthKey;
    monthLabel: string;
    monthShortLabel: string;
    monthDateRange: string;
    prevMonthShortLabel: string | null;
    accountLabel: string;
    expenses: number;
    prevMonthExpenses: number | null;
    hasPrevMonthComparison: boolean;
    expensesVariationPct: number | null;
    expensesDiffAmount: number | null;
    income: number;
    prevMonthIncome: number | null;
    hasPrevMonthIncomeComparison: boolean;
    incomeVariationPct: number | null;
    hasIncomeData: boolean;
    netDifference: number;
    categoryBreakdown: CategorySummary[];
    monthTransactions: Transaction[];
    monthlyEvolution: {
      monthKey: BilanMonthKey;
      label: string;
      shortLabel: string;
      income: number;
      hasIncomeData: boolean;
      expenses: number;
      netDifference: number;
    }[];
  };

  // Core Banking & Financial State
  mainAccountBalance: number;
  secondaryAccountBalance: number;
  transactions: Transaction[];
  recategorizeTransaction: (txId: string, newCategory: SpendingCategory) => void;
  bulkVerifyTransactions: (txIds: string[]) => void;
  bulkRecategorizeTransactions: (
    txIds: string[],
    newCategory: SpendingCategory
  ) => void;

  // Contextual Selections
  selectedCategory: SpendingCategory;
  setSelectedCategory: (c: SpendingCategory) => void;
  selectedTransactionId: string;
  setSelectedTransactionId: (id: string) => void;
  selectedChallengeId: string;
  setSelectedChallengeId: (id: string) => void;
  selectedCourseId: string;
  setSelectedCourseId: (id: string) => void;
  selectedWidgetId: string;
  setSelectedWidgetId: (id: string) => void;

  // Derived Financial Analytics
  currentMonthExpenses: number;
  previousMonthExpenses: number;
  expensesVariationPct: number;
  identifiedIncome: number;
  estimatedEndOfMonthBalance: number;
  dailyAllowance: number;
  remainingDisposableIncome: number;
  categoryBreakdown: CategorySummary[];
  shoppingSummary: CategorySummary;

  // Subscriptions Smart Detection (Dépenses)
  detectedSubscriptions: DetectedSubscriptionItem[];
  confirmedSubscriptions: DetectedSubscriptionItem[];
  pendingSubscriptions: DetectedSubscriptionItem[];
  confirmedSubscriptionsMonthlyTotal: number;
  confirmSubscription: (id: string) => void;
  dismissSubscription: (id: string) => void;
  updateSubscriptionFrequency: (id: string, frequency: SubscriptionFrequency) => void;
  resetSubscriptionsDetection: () => void;

  // Budgets
  budgets: Record<string, CategoryBudget>;
  selectedBudgetScope: BudgetScope;
  setSelectedBudgetScope: (scope: BudgetScope) => void;
  createOrUpdateBudget: (
    category: SpendingCategory,
    limit: number,
    alertThresholdPct?: number,
    scope?: BudgetScope,
    startPeriod?: 'CURRENT' | 'NEXT'
  ) => void;
  toggleBudgetTrackingStatus: (
    category: SpendingCategory,
    nextStatus?: 'ACTIVE' | 'STOPPED',
    scope?: BudgetScope
  ) => void;
  deleteCategoryBudget: (
    category: SpendingCategory,
    scope?: BudgetScope
  ) => void;

  // Challenges & Gamification
  challenges: FinancialChallenge[];
  startChallenge: (challengeId: string, silent?: boolean) => void;
  shoppingChallengeActivatedAt: string | null;
  shoppingChallengeJustActivated: boolean;
  clearShoppingChallengeJustActivated: () => void;
  shoppingChallengePostActivationSpent: number;
  shoppingChallengeCompletedWeeks: number;
  shoppingChallengeOrigin: 'BUDGETS' | 'MES_DEFIS' | 'D2_SHOPPING_INSIGHT';
  setShoppingChallengeOrigin: (
    origin: 'BUDGETS' | 'MES_DEFIS' | 'D2_SHOPPING_INSIGHT'
  ) => void;
  simulateShoppingChallengeWeek: () => number;
  learningPoints: number;
  earnedBadges: string[];

  // Learn & Earn
  courses: LearningCourse[];
  completeCourseStep: (courseId: string, stepIndex: number) => void;
  completeCourseQuiz: (courseId: string) => void;

  // Savings & Smart Épargne
  hasSavingsGoal: boolean;
  savingsGoal: SavingsGoal;
  savingsGoals: SavingsGoal[];
  selectedGoalScope: GoalScope;
  setSelectedGoalScope: (scope: GoalScope) => void;
  selectSavingsGoal: (goalId: string) => void;
  autoSavings: AutoSavingsConfig;
  createSavingsGoal: (title: string, targetAmount: number, deadline: string) => void;
  createFullSavingsGoal: (goalData: {
    title: string;
    targetAmount: number;
    deadline: string;
    imageUrl: string;
    categoryTag?: string;
    methodConfig: SavingsMethodConfig;
    initialDeposit?: number;
    scope?: GoalScope;
  }) => void;
  updateSavingsGoal: (updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: () => void;
  toggleSavingsMethodPause: () => void;
  changeSavingsMethod: (config: SavingsMethodConfig) => void;
  transferToSavingsGoal: (amount: number) => void;
  updateAutoSavings: (config: Partial<AutoSavingsConfig>) => void;

  // Chapter 4: Household
  hasHouseholdSetup: boolean;
  householdName: string;
  householdCoverUrl: string;
  setHouseholdCoverUrl: React.Dispatch<React.SetStateAction<string>>;
  householdBudget: number | null;
  householdSavingsGoal: string | null;
  householdPermissions: {
    sharedExpensesVisible: boolean;
    reimbursementsTracked: boolean;
    commonBudgetAccess: boolean;
    sharedProjectsEnabled: boolean;
  };
  householdMembers: HouseholdMember[];
  householdDraftMembers: HouseholdDraftMember[];
  setHouseholdDraftMembers: React.Dispatch<React.SetStateAction<HouseholdDraftMember[]>>;
  completeHouseholdPersonalization: (spaceName: string, coverUrl: string) => void;
  sharedExpenses: SharedExpense[];
  splitRequests: SplitRequest[];
  setupHousehold: (partnerName: string) => void;
  createHousehold: (data: {
    name: string;
    members: { name: string; role: 'Conjoint' | 'Membre' | 'Colocataire' }[];
    permissions?: {
      sharedExpensesVisible: boolean;
      reimbursementsTracked: boolean;
      commonBudgetAccess: boolean;
      sharedProjectsEnabled: boolean;
    };
  }) => void;
  createHouseholdBudget: (limit: number) => void;
  createHouseholdProject: (title: string, target: number) => void;
  splitExpense: (expenseId: string, memberName: string, amount: number) => void;
  saveExpenseSplit: (data: {
    expenseId: string;
    title: string;
    totalAmount: number;
    category: SpendingCategory;
    date: string;
    participants: { name: string; shareAmount: number }[];
    myShare: number;
    sendRequest: boolean;
  }) => void;
  settleSplitRequest: (requestId: string) => void;
  simulateReceiveReimbursement: (requestId: string) => void;
  householdPockets: HouseholdPocket[];
  selectedPocketId: string;
  setSelectedPocketId: (id: string) => void;
  fundHouseholdPocket: (pocketId: string, amount: number) => void;
  familyAccount: HouseholdFamilyAccount;
  setFamilyAccount: React.Dispatch<React.SetStateAction<HouseholdFamilyAccount>>;
  fundFamilyAccount: (amount: number) => void;

  // Internet bill notification, Simple One trigger & Household transition
  internetBillNotificationDismissed: boolean;
  setInternetBillNotificationDismissed: (dismissed: boolean) => void;
  isInternetBillSplit: boolean;
  setIsInternetBillSplit: (split: boolean) => void;
  isSimpleOneScenario: boolean;
  setIsSimpleOneScenario: (active: boolean) => void;
  simpleOneNotificationDismissed: boolean;
  setSimpleOneNotificationDismissed: (dismissed: boolean) => void;
  activeHomeNotification: 'SIMPLE_ONE' | 'INTERNET_BILL';
  setActiveHomeNotification: (mode: 'SIMPLE_ONE' | 'INTERNET_BILL') => void;
  arrivedFromSimpleOneNotification: boolean;
  setArrivedFromSimpleOneNotification: (arrived: boolean) => void;
  yasmineAllowanceConfig: YasmineAllowanceConfig | null;
  saveYasmineAllowanceConfig: (
    referenceAmount: number,
    frequency: AllowanceFrequency
  ) => void;
  foyerPersonalizationDismissed: boolean;
  setFoyerPersonalizationDismissed: (dismissed: boolean) => void;
  hasShownFoyerAutoInvite: boolean;
  setHasShownFoyerAutoInvite: (shown: boolean) => void;
  setMainAccountBalance: React.Dispatch<React.SetStateAction<number>>;

  // Chapter 5: Investment & Demo Scenarios
  showSimulatedPortfolio: boolean;
  setShowSimulatedPortfolio: (show: boolean) => void;

  // Community ("Communauté") Tab State & Actions
  communities: CommunityGroup[];
  selectedCommunityId: string;
  setSelectedCommunityId: (id: string) => void;
  communityCagnottes: CommunityCagnotte[];
  communityExpenses: CommunitySharedExpense[];
  communityBalances: CommunityBalanceItem[];
  communityActivities: CommunityActivityItem[];
  contributeToCagnotte: (cagnotteId: string, amount: number, note?: string) => void;
  createCommunityCagnotte: (data: {
    communityId: string;
    title: string;
    description: string;
    targetAmount: number;
    deadline: string;
    imageUrl?: string;
    initialContribution?: number;
  }) => void;
  addCommunitySharedExpense: (data: {
    communityId: string;
    title: string;
    category: SpendingCategory;
    totalAmount: number;
    paidByName: string;
    date?: string;
    splitMode: 'EQUAL' | 'CUSTOM' | 'PERCENTAGE';
    shares: {
      participantId: string;
      participantName: string;
      avatarInitials: string;
      avatarUrl?: string;
      amount: number;
    }[];
  }) => void;
  settleCommunityBalance: (balanceId: string) => void;
  remindCommunityBalance: (balanceId: string) => void;
  createCommunityGroup: (data: {
    name: string;
    subtitle: string;
    categoryTag: CommunityCategoryTag;
    coverUrl: string;
    memberNames: string[];
  }) => void;
  inviteCommunityMember: (
    communityId: string,
    memberName: string,
    role?: 'Membre' | 'Trésorier'
  ) => void;

  // Widgets
  widgets: WidgetCatalogItem[];
  activeWidgets: WidgetCatalogItem[];
  getCategoryWidgets: (category: MonEspaceSubTab) => WidgetCatalogItem[];
  getActiveCategoryWidgets: (category: MonEspaceSubTab) => WidgetCatalogItem[];
  getAvailableCategoryWidgets: (category: MonEspaceSubTab) => WidgetCatalogItem[];
  toggleWidgetActive: (widgetId: string, forceState?: boolean) => void;
  moveWidgetOrder: (widgetId: string, direction: 'UP' | 'DOWN') => void;

  // Coach
  coachMessages: CoachMessage[];
  askCoachQuestion: (questionText: string) => void;

  // Demo Presenter Controls & 5 Chapters
  currentDemoChapter: DemoChapter;
  setDemoChapter: (chapter: DemoChapter) => void;
  simulatedWeeksAdded: number;
  simulateNextWeek: () => void;
  triggerMilestoneDemo: () => void;
  resetAllDemoData: () => void;
  jumpToJourney: (
    journeyId:
      | 'J1_INSIGHT_BUDGET'
      | 'J2_CHALLENGE'
      | 'J3_LEARN'
      | 'J4_SAVINGS'
      | 'J5_INVEST'
  ) => void;
}

const PFMContext = createContext<PFMContextType | undefined>(undefined);

const INITIAL_COACH_MESSAGES: CoachMessage[] = [
  {
    id: 'cm-init-1',
    sender: 'COACH',
    text: 'Bonjour Lamia ! J’ai analysé vos opérations d’octobre. Vos dépenses globales s’élèvent à 8 420 DH (+12 % par rapport à septembre), principalement portées par le poste Shopping (1 850 DH, soit +43 %). Comment souhaitez-vous que je vous accompagne ?',
    highlightBox: {
      label: 'Éclairage Shopping Octobre',
      value: '1 850 DH (+556 DH vs sept.)',
      subtext: '4 opérations ce mois-ci, dont 68 % le week-end',
    },
    actionCta: {
      label: 'Créer un budget Shopping',
      targetScreen: 'E1_CREATE_BUDGET',
      category: 'Shopping',
    },
  },
];

export const PFMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const MON_ESPACE_SUBTAB_STORAGE_KEY = 'simple_pfm_mon_espace_subtab_v1';
  const [experienceMode, setExperienceModeState] = useState<ExperienceMode>(EXPERIENCE_MODE_DEFAULT);
  const isR1 = experienceMode === 'R1';
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('A1_HOME');
  const [screenHistory, setScreenHistory] = useState<ScreenId[]>([]);
  const [activeHubTab, setActiveHubTabState] = useState<HubTab>('MON_ESPACE');
  const setActiveHubTab = (tab: HubTab) => setActiveHubTabState(isR1 ? 'MON_ESPACE' : tab);
  const [monEspaceSubTab, setMonEspaceSubTabState] = useState<MonEspaceSubTab>(() => {
    if (typeof window === 'undefined') return 'DEPENSES';
    try {
      const saved = window.localStorage.getItem(MON_ESPACE_SUBTAB_STORAGE_KEY);
      if (
        saved === 'DEPENSES' ||
        saved === 'BUDGETS' ||
        saved === 'PROJETS' ||
        saved === 'FOYER' ||
        saved === 'COMMUNAUTE' ||
        saved === 'INVESTIR'
      ) {
        return isR1 && !isR1AllowedCategory(saved) ? 'DEPENSES' : saved;
      }
      return 'DEPENSES';
    } catch {
      return 'DEPENSES';
    }
  });

  const setMonEspaceSubTab = (tab: MonEspaceSubTab) =>
    setMonEspaceSubTabState(isR1 && !isR1AllowedCategory(tab) ? 'DEPENSES' : tab);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(MON_ESPACE_SUBTAB_STORAGE_KEY, monEspaceSubTab);
    } catch {
      // Ignore storage errors
    }
  }, [monEspaceSubTab]);

  const [isDiscoverySheetOpen, setIsDiscoverySheetOpen] = useState(false);
  const [milestoneModal, setMilestoneModal] = useState<MilestoneCelebration | null>(null);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Onboarding
  const [selectedIntention, setSelectedIntention] = useState<ObjectiveCategory>(
    'Comprendre mon comportement financier'
  );
  const [selectedSubQuestion, setSelectedSubQuestion] = useState<string>(
    'Pourquoi mes dépenses augmentent.'
  );
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [extendedDataConsent, setExtendedDataConsent] = useState<boolean | null>(true);

  const setExperienceMode = (nextMode: ExperienceMode) => {
    if (nextMode === experienceMode) return;
    setExperienceModeState(nextMode);
    setCurrentScreen('A1_HOME');
    setScreenHistory([]);
    setActiveHubTab('MON_ESPACE');
    setMonEspaceSubTab('DEPENSES');
    if (nextMode === 'R1') {
      setSelectedIntention('Comprendre mon comportement financier');
    }
  };

  // Filters
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('CE_MOIS');
  const [accountScope, setAccountScope] = useState<AccountScope>('TOUS_COMPTES');
  const [bilanMonth, setBilanMonth] = useState<BilanMonthKey>('2026-10');
  const [bilanAccount, setBilanAccount] = useState<string>('TOUS_COMPTES');
  const [savedHubScrollTop, setSavedHubScrollTop] = useState<number>(0);

  // Core Banking & Financial State
  const [mainAccountBalance, setMainAccountBalance] = useState<number>(3075.33);
  const [secondaryAccountBalance] = useState<number>(1450.0);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Contextual Selections
  const [selectedCategory, setSelectedCategory] = useState<SpendingCategory>('Shopping');
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>('tx-oct-shop-3');
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('defi-shopping-1');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('course-impulsif-1');
  const [selectedWidgetId, setSelectedWidgetId] = useState<string>('w-mois-bref');

  // Budgets
  const BUDGETS_STORAGE_KEY = 'simple_pfm_budgets_v1';
  const FAMILY_BUDGETS_SEEDED_KEY = 'simple_pfm_family_budgets_seeded_v1';
  const DEFAULT_FAMILY_BUDGETS: Record<string, CategoryBudget> = {
    Courses_FOYER: {
      id: 'Courses_FOYER',
      category: 'Courses',
      limit: 3200,
      alertThresholdPct: 80,
      createdAt: '01 oct. 2026',
      scope: 'FOYER',
      status: 'ACTIVE',
    },
    Factures_FOYER: {
      id: 'Factures_FOYER',
      category: 'Factures',
      limit: 1800,
      alertThresholdPct: 80,
      createdAt: '01 oct. 2026',
      scope: 'FOYER',
      status: 'ACTIVE',
    },
    Loisirs_FOYER: {
      id: 'Loisirs_FOYER',
      category: 'Loisirs',
      limit: 1200,
      alertThresholdPct: 80,
      createdAt: '01 oct. 2026',
      scope: 'FOYER',
      status: 'ACTIVE',
    },
  };

  const loadPersistedBudgets = (): Record<string, CategoryBudget> => {
    if (typeof window === 'undefined') return { ...DEFAULT_FAMILY_BUDGETS };
    try {
      const raw = window.localStorage.getItem(BUDGETS_STORAGE_KEY);
      const parsed: Record<string, CategoryBudget> =
        raw && JSON.parse(raw) && typeof JSON.parse(raw) === 'object'
          ? JSON.parse(raw)
          : {};
      const alreadySeeded =
        window.localStorage.getItem(FAMILY_BUDGETS_SEEDED_KEY) === 'true';
      if (!alreadySeeded) {
        window.localStorage.setItem(FAMILY_BUDGETS_SEEDED_KEY, 'true');
        return {
          ...DEFAULT_FAMILY_BUDGETS,
          ...parsed,
        };
      }
      return parsed;
    } catch {
      return { ...DEFAULT_FAMILY_BUDGETS };
    }
  };
  const [budgets, setBudgets] = useState<Record<string, CategoryBudget>>(() =>
    loadPersistedBudgets()
  );
  const [selectedBudgetScope, setSelectedBudgetScope] = useState<BudgetScope>('PERSONNEL');
  const [selectedGoalScope, setSelectedGoalScope] = useState<GoalScope>('PERSONNEL');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (Object.keys(budgets).length > 0) {
        window.localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
      } else {
        window.localStorage.removeItem(BUDGETS_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [budgets]);
  const [challenges, setChallenges] = useState<FinancialChallenge[]>(INITIAL_CHALLENGES);
  const [learningPoints, setLearningPoints] = useState<number>(90);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);

  const IMPULSIF_COURSE_STORAGE_KEY = 'simple_pfm_impulsif_course_v2';
  const [courses, setCourses] = useState<LearningCourse[]>(() => {
    if (typeof window === 'undefined') return INITIAL_COURSES;
    try {
      const raw = window.localStorage.getItem(IMPULSIF_COURSE_STORAGE_KEY);
      if (!raw) return INITIAL_COURSES;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.progressPct === 'number') {
        return INITIAL_COURSES.map((c) =>
          c.id === 'course-impulsif-1'
            ? {
                ...c,
                progressPct: parsed.progressPct,
                completed: Boolean(parsed.completed),
              }
            : c
        );
      }
      return INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const impulsif = courses.find((c) => c.id === 'course-impulsif-1');
    if (!impulsif) return;
    try {
      window.localStorage.setItem(
        IMPULSIF_COURSE_STORAGE_KEY,
        JSON.stringify({
          progressPct: impulsif.progressPct,
          completed: impulsif.completed,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }, [courses]);

  // Savings & Smart Épargne (Chapter 3)
  const SAVINGS_GOALS_STORAGE_KEY = 'simple_pfm_savings_goals_v1';

  const loadPersistedSavingsGoals = (): SavingsGoal[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(SAVINGS_GOALS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      const seenIds = new Set<string>();
      const valid: SavingsGoal[] = [];
      for (const item of parsed) {
        if (
          item &&
          typeof item.id === 'string' &&
          item.isCreated === true &&
          typeof item.targetAmount === 'number' &&
          item.targetAmount > 0 &&
          !seenIds.has(item.id)
        ) {
          seenIds.add(item.id);
          const normalizedItem: SavingsGoal =
            item.id === 'foyer-demo-vacances' ||
            (typeof item.imageUrl === 'string' &&
              item.imageUrl.includes('photo-1581579438747-1dc8d17bbce4'))
              ? { ...item, imageUrl: TRAVEL_PHOTO_URL }
              : item;
          valid.push(normalizedItem);
        }
      }
      return valid;
    } catch {
      return [];
    }
  };

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() =>
    loadPersistedSavingsGoals()
  );
  const [hasSavingsGoal, setHasSavingsGoal] = useState<boolean>(
    () => loadPersistedSavingsGoals().length > 0
  );
  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal>(() => {
    const persisted = loadPersistedSavingsGoals();
    return persisted.length > 0 ? persisted[persisted.length - 1] : INITIAL_SAVINGS_GOAL;
  });
  const [autoSavings, setAutoSavings] = useState<AutoSavingsConfig>(INITIAL_AUTO_SAVINGS);
  const [suggestedGoalTag, setSuggestedGoalTag] = useState<string | null>(null);
  const [suggestedGoalImageId, setSuggestedGoalImageId] = useState<string | null>(null);
  const [suggestedGoalTitle, setSuggestedGoalTitle] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (savingsGoals.length > 0) {
        window.localStorage.setItem(
          SAVINGS_GOALS_STORAGE_KEY,
          JSON.stringify(savingsGoals)
        );
      } else {
        window.localStorage.removeItem(SAVINGS_GOALS_STORAGE_KEY);
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [savingsGoals]);

  // Household Space (Chapter 4)
  const DEFAULT_FOYER_COVER_URL =
    '/src/assets/images/moroccan_family_foyer_1791969781489.jpg';
  const HOUSEHOLD_SETUP_STORAGE_KEY = 'simple_pfm_household_setup_v1';

  const loadPersistedHouseholdSetup = () => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(HOUSEHOLD_SETUP_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const persistedSetup = loadPersistedHouseholdSetup();

  const [hasHouseholdSetup, setHasHouseholdSetup] = useState<boolean>(
    () => persistedSetup?.hasHouseholdSetup === true
  );
  const [householdName, setHouseholdName] = useState<string>(
    () => persistedSetup?.householdName || 'Notre foyer'
  );
  const [householdCoverUrl, setHouseholdCoverUrl] = useState<string>(
    () => persistedSetup?.householdCoverUrl || DEFAULT_FOYER_COVER_URL
  );
  const [householdBudget, setHouseholdBudget] = useState<number | null>(null);
  const [householdSavingsGoal, setHouseholdSavingsGoal] = useState<string | null>(null);
  const [householdPermissions, setHouseholdPermissions] = useState<{
    sharedExpensesVisible: boolean;
    reimbursementsTracked: boolean;
    commonBudgetAccess: boolean;
    sharedProjectsEnabled: boolean;
  }>({
    sharedExpensesVisible: true,
    reimbursementsTracked: true,
    commonBudgetAccess: true,
    sharedProjectsEnabled: false,
  });
  const [householdMembers, setHouseholdMembers] = useState<HouseholdMember[]>(() =>
    Array.isArray(persistedSetup?.householdMembers) &&
    persistedSetup.householdMembers.length > 0
      ? persistedSetup.householdMembers
      : INITIAL_HOUSEHOLD_MEMBERS
  );
  const HOUSEHOLD_DRAFT_STORAGE_KEY = 'simple_pfm_household_draft_v1';
  const INITIAL_HOUSEHOLD_DRAFT_MEMBERS: HouseholdDraftMember[] = [
    {
      id: 'draft-lamia',
      firstName: 'Lamia',
      relationship: 'Vous',
      photoUrl: LAMIA_AVATAR_URL,
      isSelf: true,
      isConfirmed: true,
    },
    {
      id: 'draft-yasmine',
      firstName: 'Yasmine',
      relationship: 'Simple One',
      photoUrl: '/src/assets/images/portrait_yasmine_teen_1791972719154.jpg',
      isSuggestedSimpleOne: true,
      isConfirmed: false,
    },
  ];

  const loadPersistedHouseholdDraft = (): HouseholdDraftMember[] => {
    if (typeof window === 'undefined') return INITIAL_HOUSEHOLD_DRAFT_MEMBERS;
    try {
      const raw = window.localStorage.getItem(HOUSEHOLD_DRAFT_STORAGE_KEY);
      if (!raw) return INITIAL_HOUSEHOLD_DRAFT_MEMBERS;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return INITIAL_HOUSEHOLD_DRAFT_MEMBERS;
    } catch {
      return INITIAL_HOUSEHOLD_DRAFT_MEMBERS;
    }
  };

  const [householdDraftMembers, setHouseholdDraftMembers] = useState<
    HouseholdDraftMember[]
  >(() => loadPersistedHouseholdDraft());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        HOUSEHOLD_DRAFT_STORAGE_KEY,
        JSON.stringify(householdDraftMembers)
      );
    } catch {
      // Ignore storage errors
    }
  }, [householdDraftMembers]);

  const [sharedExpenses, setSharedExpenses] = useState<SharedExpense[]>(
    INITIAL_SHARED_EXPENSES
  );
  const [splitRequests, setSplitRequests] = useState<SplitRequest[]>(
    INITIAL_SPLIT_REQUESTS
  );
  const [householdPockets, setHouseholdPockets] = useState<HouseholdPocket[]>(
    INITIAL_HOUSEHOLD_POCKETS
  );
  const [selectedPocketId, setSelectedPocketId] = useState<string>('pocket-lamia');
  const [familyAccount, setFamilyAccount] = useState<HouseholdFamilyAccount>(
    INITIAL_FAMILY_ACCOUNT
  );

  // Internet bill notification, Simple One trigger & household split scenario
  const YASMINE_ALLOWANCE_STORAGE_KEY = 'simple_pfm_yasmine_allowance_v1';
  const SIMPLE_ONE_FOYER_ENTRY_STORAGE_KEY = 'simple_pfm_simple_one_foyer_entry_v1';
  const FOYER_AUTO_INVITE_SHOWN_STORAGE_KEY = 'simple_pfm_foyer_auto_invite_shown_v1';

  const loadPersistedYasmineAllowance = (): YasmineAllowanceConfig | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(YASMINE_ALLOWANCE_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        parsed.isActive === true &&
        typeof parsed.referenceAmount === 'number' &&
        parsed.referenceAmount > 0 &&
        (parsed.frequency === 'Ponctuel' ||
          parsed.frequency === 'Hebdomadaire' ||
          parsed.frequency === 'Mensuel')
      ) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  };

  const [internetBillNotificationDismissed, setInternetBillNotificationDismissed] =
    useState<boolean>(false);
  const [isInternetBillSplit, setIsInternetBillSplit] = useState<boolean>(false);
  const [isSimpleOneScenario, setIsSimpleOneScenario] = useState<boolean>(true);
  const [simpleOneNotificationDismissed, setSimpleOneNotificationDismissed] =
    useState<boolean>(false);
  const [activeHomeNotification, setActiveHomeNotification] = useState<
    'SIMPLE_ONE' | 'INTERNET_BILL'
  >('SIMPLE_ONE');
  const [arrivedFromSimpleOneNotification, setArrivedFromSimpleOneNotification] =
    useState<boolean>(() => {
      if (typeof window === 'undefined') return false;
      try {
        return (
          window.localStorage.getItem(SIMPLE_ONE_FOYER_ENTRY_STORAGE_KEY) === 'true'
        );
      } catch {
        return false;
      }
    });
  const [yasmineAllowanceConfig, setYasmineAllowanceConfig] =
    useState<YasmineAllowanceConfig | null>(() => loadPersistedYasmineAllowance());
  const [foyerPersonalizationDismissed, setFoyerPersonalizationDismissed] =
    useState<boolean>(false);
  const [hasShownFoyerAutoInvite, setHasShownFoyerAutoInvite] =
    useState<boolean>(() => {
      if (typeof window === 'undefined') return false;
      try {
        return (
          window.localStorage.getItem(FOYER_AUTO_INVITE_SHOWN_STORAGE_KEY) === 'true'
        );
      } catch {
        return false;
      }
    });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (hasShownFoyerAutoInvite) {
        window.localStorage.setItem(FOYER_AUTO_INVITE_SHOWN_STORAGE_KEY, 'true');
      } else {
        window.localStorage.removeItem(FOYER_AUTO_INVITE_SHOWN_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [hasShownFoyerAutoInvite]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (arrivedFromSimpleOneNotification) {
        window.localStorage.setItem(SIMPLE_ONE_FOYER_ENTRY_STORAGE_KEY, 'true');
      } else {
        window.localStorage.removeItem(SIMPLE_ONE_FOYER_ENTRY_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [arrivedFromSimpleOneNotification]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (yasmineAllowanceConfig && yasmineAllowanceConfig.isActive) {
        window.localStorage.setItem(
          YASMINE_ALLOWANCE_STORAGE_KEY,
          JSON.stringify(yasmineAllowanceConfig)
        );
      } else {
        window.localStorage.removeItem(YASMINE_ALLOWANCE_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [yasmineAllowanceConfig]);

  const saveYasmineAllowanceConfig = (
    referenceAmount: number,
    frequency: AllowanceFrequency
  ) => {
    setYasmineAllowanceConfig({
      isActive: true,
      referenceAmount,
      frequency,
    });
    setFoyerPersonalizationDismissed(false);
  };

  // Investment (Chapter 5)
  const [showSimulatedPortfolio, setShowSimulatedPortfolio] = useState<boolean>(false);

  // Widgets Catalog (Persisted independently per category)
  const WIDGETS_STORAGE_KEY = 'simple_pfm_widgets_by_category_v6';

  const loadPersistedWidgets = (): WidgetCatalogItem[] => {
    if (typeof window === 'undefined') return ALL_40_WIDGETS;
    try {
      const raw = window.localStorage.getItem(WIDGETS_STORAGE_KEY);
      if (!raw) return ALL_40_WIDGETS;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return ALL_40_WIDGETS;

      return ALL_40_WIDGETS.map((baseWidget) => {
        const catList = parsed[baseWidget.category];
        if (!Array.isArray(catList)) return baseWidget;
        const savedItem = catList.find(
          (item: { id?: string; active?: boolean; order?: number }) =>
            item && item.id === baseWidget.id
        );
        if (!savedItem) return baseWidget;
        return {
          ...baseWidget,
          defaultActive:
            typeof savedItem.active === 'boolean'
              ? savedItem.active
              : baseWidget.defaultActive,
          defaultOrder:
            typeof savedItem.order === 'number'
              ? savedItem.order
              : baseWidget.defaultOrder,
        };
      });
    } catch {
      return ALL_40_WIDGETS;
    }
  };

  const [widgets, setWidgets] = useState<WidgetCatalogItem[]>(() =>
    loadPersistedWidgets()
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const byCategory: Record<
        MonEspaceSubTab,
        { id: string; active: boolean; order: number }[]
      > = {
        DEPENSES: [],
        BUDGETS: [],
        PROJETS: [],
        FOYER: [],
        COMMUNAUTE: [],
        INVESTIR: [],
      };
      for (const w of widgets) {
        if (byCategory[w.category]) {
          byCategory[w.category].push({
            id: w.id,
            active: w.defaultActive,
            order: w.defaultOrder,
          });
        }
      }
      window.localStorage.setItem(WIDGETS_STORAGE_KEY, JSON.stringify(byCategory));
    } catch {
      // Ignore storage errors
    }
  }, [widgets]);

  // Subscriptions Smart Detection State (Persisted)
  const SUBSCRIPTIONS_STORAGE_KEY = 'simple_pfm_subscriptions_state_v2';

  interface SubscriptionDecision {
    status: SubscriptionConfirmationStatus;
    frequency: SubscriptionFrequency;
  }

  const SUBSCRIPTION_CHALLENGE_CANDIDATE_IDS = [
    'tx-oct-aut-2', // Lydec Eau & Électricité (380 DH, Mensuel)
    'tx-oct-tran-2', // Careem / Casa Tramway (160 DH, Mensuel)
    'tx-oct-netflix', // Netflix (99 DH, Mensuel)
  ];

  const DEFAULT_SUBSCRIPTION_DECISIONS: Record<string, SubscriptionDecision> = {
    'tx-oct-aut-3': { status: 'CONFIRMED', frequency: 'Mensuel' },
    'tx-oct-aut-4': { status: 'CONFIRMED', frequency: 'Mensuel' },
    'tx-oct-aut-2': { status: 'PENDING', frequency: 'Mensuel' },
    'tx-oct-tran-2': { status: 'PENDING', frequency: 'Mensuel' },
    'tx-oct-netflix': { status: 'PENDING', frequency: 'Mensuel' },
  };

  const loadPersistedSubscriptionDecisions = (): Record<string, SubscriptionDecision> => {
    if (typeof window === 'undefined') return DEFAULT_SUBSCRIPTION_DECISIONS;
    try {
      const raw = window.localStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY);
      if (!raw) return DEFAULT_SUBSCRIPTION_DECISIONS;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return DEFAULT_SUBSCRIPTION_DECISIONS;
      const merged = {
        ...DEFAULT_SUBSCRIPTION_DECISIONS,
        ...parsed,
      };
      delete merged['tx-oct-aut-1']; // Explicitly exclude Virement Loyer & Syndic
      return merged;
    } catch {
      return DEFAULT_SUBSCRIPTION_DECISIONS;
    }
  };

  const [subscriptionDecisions, setSubscriptionDecisions] = useState<
    Record<string, SubscriptionDecision>
  >(() => loadPersistedSubscriptionDecisions());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        SUBSCRIPTIONS_STORAGE_KEY,
        JSON.stringify(subscriptionDecisions)
      );
    } catch {
      // Ignore storage errors
    }
  }, [subscriptionDecisions]);

  // Synchronize "Comprendre mes abonnements" challenge (defi-abonnements-4) & Badge « Abonnements clairs »
  useEffect(() => {
    const totalCandidates = SUBSCRIPTION_CHALLENGE_CANDIDATE_IDS.length;
    const reviewedCount = SUBSCRIPTION_CHALLENGE_CANDIDATE_IDS.filter((id) => {
      const st = subscriptionDecisions[id]?.status;
      return st === 'CONFIRMED' || st === 'DISMISSED';
    }).length;
    const pct =
      totalCandidates > 0
        ? Math.round((reviewedCount / totalCandidates) * 100)
        : 0;
    const isCompleted = totalCandidates > 0 && reviewedCount >= totalCandidates;

    setChallenges((prev) =>
      prev.map((ch) => {
        if (ch.id !== 'defi-abonnements-4') return ch;
        return {
          ...ch,
          status: isCompleted
            ? 'COMPLETED'
            : reviewedCount > 0
            ? 'ACTIVE'
            : 'RECOMMENDED',
          progressPct: pct,
          milestones: ch.milestones.map((m) => {
            if (m.id === 'ma1') {
              return {
                ...m,
                currentValue: reviewedCount >= 1 ? 1 : 0,
                completed: reviewedCount >= 1,
              };
            }
            if (m.id === 'ma2') {
              return {
                ...m,
                targetValue: totalCandidates,
                currentValue: reviewedCount,
                completed: isCompleted,
              };
            }
            return m;
          }),
        };
      })
    );

    if (isCompleted) {
      setEarnedBadges((prev) =>
        prev.includes('Abonnements clairs')
          ? prev
          : [...prev, 'Abonnements clairs']
      );
    }
  }, [subscriptionDecisions]);

  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>(INITIAL_COACH_MESSAGES);
  const [simulatedWeeksAdded, setSimulatedWeeksAdded] = useState<number>(0);
  const [currentDemoChapter, setCurrentDemoChapter] = useState<DemoChapter>('COMPRENDRE');

  const showToast = (message: string, subtext?: string) => {
    const id = String(Date.now());
    setToast({ id, message, subtext });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3400);
  };

  const dismissToast = () => {
    setToast(null);
  };

  const [courseReturnContext, setCourseReturnContext] =
    useState<CourseReturnContext | null>(null);
  const [categoryDetailReturnContext, setCategoryDetailReturnContext] =
    useState<CategoryDetailReturnContext | null>(null);
  const [budgetCreationOrigin, setBudgetCreationOrigin] = useState<
    'LEARN_EARN' | 'STANDARD' | null
  >(null);

  const clearBudgetCreationOrigin = () => {
    setBudgetCreationOrigin(null);
  };

  const navigateTo = (
    screen: ScreenId,
    options?: {
      hubTab?: HubTab;
      monEspaceSubTab?: MonEspaceSubTab;
      category?: SpendingCategory;
      budgetScope?: BudgetScope;
      budgetOrigin?: 'LEARN_EARN' | 'STANDARD';
      goalScope?: GoalScope;
      transactionId?: string;
      challengeId?: string;
      courseId?: string;
      widgetId?: string;
      suggestedGoalTag?: string;
      suggestedGoalImageId?: string;
      suggestedGoalTitle?: string;
      fromSimpleOneNotification?: boolean;
      pocketId?: string;
    }
  ) => {
    // Prevent legacy journeys from being presented as Release 1 capabilities.
    if (isR1 && (isR1BlockedScreen(screen) ||
      (options?.hubTab && options.hubTab !== 'MON_ESPACE') ||
      (options?.monEspaceSubTab && !isR1AllowedCategory(options.monEspaceSubTab)))) {
      setActiveHubTab('MON_ESPACE');
      setMonEspaceSubTab('DEPENSES');
      setCurrentScreen('C1_HUB');
      setScreenHistory([]);
      return;
    }
    const courseScreens: ScreenId[] = [
      'G2_COURSE_DETAIL',
      'G3_LESSON',
      'G4_QUIZ',
      'G5_COURSE_SUCCESS',
    ];
    if (
      screen === 'G2_COURSE_DETAIL' &&
      !courseScreens.includes(currentScreen)
    ) {
      const currentScrollTop =
        typeof document !== 'undefined'
          ? document.querySelector('main')?.scrollTop ?? 0
          : 0;
      setCourseReturnContext({
        screen: currentScreen,
        category: options?.category ?? selectedCategory,
        periodFilter,
        accountScope,
        hubTab: options?.hubTab ?? activeHubTab,
        monEspaceSubTab: options?.monEspaceSubTab ?? monEspaceSubTab,
        scrollTop: currentScrollTop,
      });
    }

    const categoryDetailChildScreens: ScreenId[] = [
      'D2_CATEGORY_DETAIL',
      'D3_TRANSACTION_DETAIL',
      'E1_CREATE_BUDGET',
      'E2_BUDGET_SUCCESS',
      'G2_COURSE_DETAIL',
      'G3_LESSON',
      'G4_QUIZ',
      'G5_COURSE_SUCCESS',
      'J2_HOUSEHOLD_SPLIT',
    ];
    if (
      screen === 'D2_CATEGORY_DETAIL' &&
      !categoryDetailChildScreens.includes(currentScreen)
    ) {
      const currentScrollTop =
        typeof document !== 'undefined'
          ? document.querySelector('main')?.scrollTop ?? 0
          : 0;
      setCategoryDetailReturnContext({
        screen: currentScreen,
        hubTab: options?.hubTab ?? activeHubTab,
        monEspaceSubTab: options?.monEspaceSubTab ?? monEspaceSubTab,
        bilanMonth,
        bilanAccount,
        periodFilter,
        accountScope,
        scrollTop: currentScrollTop,
      });
    }

    if (options?.hubTab) setActiveHubTab(options.hubTab);
    if (options?.monEspaceSubTab) setMonEspaceSubTab(options.monEspaceSubTab);
    if (options?.fromSimpleOneNotification !== undefined) {
      setArrivedFromSimpleOneNotification(options.fromSimpleOneNotification);
    }
    if (options?.category) setSelectedCategory(options.category);
    if (screen === 'E1_CREATE_BUDGET') {
      const resolvedOrigin: 'LEARN_EARN' | 'STANDARD' =
        options?.budgetOrigin ??
        (courseScreens.includes(currentScreen) ? 'LEARN_EARN' : 'STANDARD');
      setBudgetCreationOrigin(resolvedOrigin);
    } else if (screen !== 'E2_BUDGET_SUCCESS') {
      setBudgetCreationOrigin(null);
    }

    if (options?.budgetScope) {
      setSelectedBudgetScope(options.budgetScope);
    } else if (screen === 'E1_CREATE_BUDGET') {
      const existingScope = options?.category
        ? budgets[options.category]?.scope
        : undefined;
      setSelectedBudgetScope(
        existingScope || (monEspaceSubTab === 'FOYER' ? 'FOYER' : 'PERSONNEL')
      );
    }
    if (options?.goalScope) {
      setSelectedGoalScope(options.goalScope);
    } else if (screen === 'H0_CREATE_GOAL') {
      setSelectedGoalScope('PERSONNEL');
    }
    if (options?.transactionId) setSelectedTransactionId(options.transactionId);
    if (options?.challengeId) setSelectedChallengeId(options.challengeId);
    if (options?.courseId) setSelectedCourseId(options.courseId);
    if (options?.widgetId) setSelectedWidgetId(options.widgetId);
    if (options?.pocketId) setSelectedPocketId(options.pocketId);
    if (options?.suggestedGoalTag !== undefined) setSuggestedGoalTag(options.suggestedGoalTag);
    if (options?.suggestedGoalImageId !== undefined) setSuggestedGoalImageId(options.suggestedGoalImageId);
    if (options?.suggestedGoalTitle !== undefined) setSuggestedGoalTitle(options.suggestedGoalTitle);

    if (
      screen === 'B0_INTRO' ||
      screen === 'B1_INTENTION' ||
      screen === 'B2_PERSONALIZATION' ||
      screen === 'B3_TRANSPARENCY' ||
      screen === 'B4_LOADING'
    ) {
      setIsSimpleOneScenario(false);
    }

    if (
      currentScreen === 'C1_HUB' &&
      (screen === 'D1_EXPENSES' ||
        screen === 'J_POCKET_DETAIL' ||
        screen === 'J_FAMILY_ACCOUNT')
    ) {
      const currentScroll =
        typeof document !== 'undefined'
          ? document.querySelector('main')?.scrollTop ?? 0
          : 0;
      setSavedHubScrollTop(currentScroll);
    }

    setScreenHistory((prev) => [...prev, currentScreen]);
    setCurrentScreen(screen);
    if (typeof document !== 'undefined') {
      const mainEl = document.querySelector('main');
      if (
        (currentScreen === 'D1_EXPENSES' ||
          currentScreen === 'J_POCKET_DETAIL' ||
          currentScreen === 'J_FAMILY_ACCOUNT') &&
        screen === 'C1_HUB'
      ) {
        window.requestAnimationFrame(() => {
          const el = document.querySelector('main');
          if (el) el.scrollTop = savedHubScrollTop;
        });
      } else if (mainEl) {
        mainEl.scrollTop = 0;
      }
    }
  };

  const returnFromCourse = () => {
    if (courseReturnContext) {
      setSelectedCategory(courseReturnContext.category);
      setPeriodFilter(courseReturnContext.periodFilter);
      setAccountScope(courseReturnContext.accountScope);
      setActiveHubTab(courseReturnContext.hubTab);
      setMonEspaceSubTab(courseReturnContext.monEspaceSubTab);
      setCurrentScreen(courseReturnContext.screen);
      setScreenHistory((prev) => {
        const courseScreens: ScreenId[] = [
          'G2_COURSE_DETAIL',
          'G3_LESSON',
          'G4_QUIZ',
          'G5_COURSE_SUCCESS',
        ];
        const trimmed = [...prev];
        while (
          trimmed.length > 0 &&
          courseScreens.includes(trimmed[trimmed.length - 1])
        ) {
          trimmed.pop();
        }
        if (
          trimmed.length > 0 &&
          trimmed[trimmed.length - 1] === courseReturnContext.screen
        ) {
          trimmed.pop();
        }
        return trimmed;
      });
      const targetScrollTop = courseReturnContext.scrollTop;
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(() => {
          const mainEl = document.querySelector('main');
          if (mainEl) {
            mainEl.scrollTop = targetScrollTop;
          }
        });
      }
    } else {
      setActiveHubTab('LEARN_EARN');
      setCurrentScreen('C1_HUB');
      if (typeof document !== 'undefined') {
        const mainEl = document.querySelector('main');
        if (mainEl) mainEl.scrollTop = 0;
      }
    }
  };

  const returnFromCategoryDetail = () => {
    if (categoryDetailReturnContext) {
      setActiveHubTab(categoryDetailReturnContext.hubTab);
      setMonEspaceSubTab(categoryDetailReturnContext.monEspaceSubTab);
      setBilanMonth(categoryDetailReturnContext.bilanMonth);
      setBilanAccount(categoryDetailReturnContext.bilanAccount);
      setPeriodFilter(categoryDetailReturnContext.periodFilter);
      setAccountScope(categoryDetailReturnContext.accountScope);
      setCurrentScreen(categoryDetailReturnContext.screen);
      setScreenHistory((prev) => {
        const trimmed = [...prev];
        while (
          trimmed.length > 0 &&
          trimmed[trimmed.length - 1] !== categoryDetailReturnContext.screen
        ) {
          trimmed.pop();
        }
        if (
          trimmed.length > 0 &&
          trimmed[trimmed.length - 1] === categoryDetailReturnContext.screen
        ) {
          trimmed.pop();
        }
        return trimmed;
      });
      const targetScrollTop = categoryDetailReturnContext.scrollTop;
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(() => {
          const mainEl = document.querySelector('main');
          if (mainEl) {
            mainEl.scrollTop = targetScrollTop;
          }
        });
      }
    } else {
      goBack();
    }
  };

  const goBack = () => {
    if (currentScreen === 'D2_CATEGORY_DETAIL' && categoryDetailReturnContext) {
      returnFromCategoryDetail();
      return;
    }

    const returningFromBilanToHub =
      (currentScreen === 'D1_EXPENSES' ||
        currentScreen === 'J_POCKET_DETAIL' ||
        currentScreen === 'J_FAMILY_ACCOUNT') &&
      (screenHistory.length === 0 ||
        screenHistory[screenHistory.length - 1] === 'C1_HUB');

    if (screenHistory.length > 0) {
      const prevScreen = screenHistory[screenHistory.length - 1];
      setScreenHistory((prev) => prev.slice(0, -1));
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen(hasCompletedOnboarding ? 'C1_HUB' : 'A1_HOME');
    }

    if (returningFromBilanToHub && typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        const mainEl = document.querySelector('main');
        if (mainEl) {
          mainEl.scrollTop = savedHubScrollTop;
        }
      });
    }
  };

  // Eligible user accounts (Only accounts actually available to Lamia — never children's accounts or invented banks)
  const eligibleAccounts = useMemo<EligibleAccountOption[]>(() => {
    const base: EligibleAccountOption[] = [
      {
        id: 'TOUS_COMPTES',
        label: 'Tous mes comptes',
        subtitle: 'Compte principal & sous-comptes éligibles',
      },
      {
        id: 'COMPTE_PRINCIPAL',
        label: 'Compte principal Simple',
        subtitle: `Solde disponible : ${formatDH(mainAccountBalance, true)}`,
      },
      {
        id: 'COMPTE_SECONDAIRE',
        label: 'Sous-compte Réserve Simple',
        subtitle: `Épargne disponible : ${formatDH(secondaryAccountBalance, true)}`,
      },
    ];

    const personalSubAccounts = savingsGoals
      .filter((g) => g.isCreated && (g.scope || 'PERSONNEL') === 'PERSONNEL')
      .map((g) => ({
        id: `SUB_GOAL_${g.id}`,
        label: `Sous-compte · ${g.title}`,
        subtitle: `Épargné : ${formatDH(g.savedAmount)}`,
      }));

    return [...base, ...personalSubAccounts];
  }, [mainAccountBalance, secondaryAccountBalance, savingsGoals]);

  // Period multiplier / transaction filtering
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (accountScope === 'COMPTE_PRINCIPAL' && tx.account !== 'COMPTE_PRINCIPAL') {
        return false;
      }
      if (periodFilter === 'CE_MOIS') {
        return tx.monthKey === '2026-10';
      }
      if (periodFilter === '3_MOIS') {
        return ['2026-10', '2026-09', '2026-08'].includes(tx.monthKey);
      }
      return true;
    });
  }, [transactions, periodFilter, accountScope]);

  const currentMonthExpenses = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const previousMonthExpenses = useMemo(() => {
    const sepExpenses = transactions
      .filter((tx) => tx.monthKey === '2026-09' && tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + tx.amount, 0);
    if (periodFilter === 'CE_MOIS') {
      return sepExpenses;
    }
    if (periodFilter === '3_MOIS') {
      return 22150;
    }
    return sepExpenses;
  }, [transactions, periodFilter]);

  const expensesVariationPct = useMemo(() => {
    if (previousMonthExpenses === 0) return 0;
    return Math.round(
      ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
    );
  }, [currentMonthExpenses, previousMonthExpenses]);

  const identifiedIncome = useMemo(() => {
    const inc = filteredTransactions
      .filter((tx) => tx.type === 'INCOME')
      .reduce((sum, tx) => sum + tx.amount, 0);
    return inc || 11500;
  }, [filteredTransactions]);

  // Chapter 2: Explanable Forecast calculations
  const estimatedEndOfMonthBalance = useMemo(() => {
    // Current balance minus remaining recurring obligations (e.g., Salle de sport 250 DH, Spotify 59 DH, Santé 180 DH, remaining living cost)
    return Math.max(980, Number((mainAccountBalance - 1450).toFixed(2)));
  }, [mainAccountBalance]);

  const dailyAllowance = useMemo(() => {
    // Reste à vivre journalier jusqu'à la date de paie (28 octobre = 17 jours restants)
    return Math.round(estimatedEndOfMonthBalance / 17);
  }, [estimatedEndOfMonthBalance]);

  const remainingDisposableIncome = useMemo(() => {
    return Math.max(1200, 11500 - currentMonthExpenses);
  }, [currentMonthExpenses]);

  const categoryBreakdown = useMemo<CategorySummary[]>(() => {
    const categories: SpendingCategory[] = [
      'Shopping',
      'Sorties',
      'Courses',
      'Transport',
      'Autres',
    ];
    const total = currentMonthExpenses || 1;

    return categories.map((cat) => {
      const catTxs = filteredTransactions.filter(
        (tx) => tx.type === 'EXPENSE' && tx.category === cat
      );
      const amount = catTxs.reduce((sum, tx) => sum + tx.amount, 0);

      const prevMonthAmount = transactions
        .filter(
          (tx) => tx.monthKey === '2026-09' && tx.type === 'EXPENSE' && tx.category === cat
        )
        .reduce((sum, tx) => sum + tx.amount, 0);

      const variationPct =
        prevMonthAmount > 0
          ? Math.round(((amount - prevMonthAmount) / prevMonthAmount) * 100)
          : 0;

      const sharePct = Math.round((amount / total) * 100);

      return {
        category: cat,
        amount,
        prevMonthAmount,
        variationPct,
        sharePct,
        transactionsCount: catTxs.length,
      };
    });
  }, [filteredTransactions, transactions, currentMonthExpenses]);

  const shoppingSummary = useMemo(() => {
    return (
      categoryBreakdown.find((c) => c.category === 'Shopping') || {
        category: 'Shopping' as SpendingCategory,
        amount: 1850,
        prevMonthAmount: 1294,
        variationPct: 43,
        sharePct: 22,
        transactionsCount: 4,
      }
    );
  }, [categoryBreakdown]);

  // Dedicated Account & Month Analytics for "Ce mois-ci" and "Mon bilan"
  const bilanAnalytics = useMemo(() => {
    const monthMeta: Record<
      BilanMonthKey,
      {
        label: string;
        shortLabel: string;
        dateRange: string;
        prevKey: BilanMonthKey | null;
        prevShortLabel: string | null;
      }
    > = {
      '2026-10': {
        label: 'Octobre 2026',
        shortLabel: 'Oct. 2026',
        dateRange: 'Du 1 au 31 octobre 2026',
        prevKey: '2026-09',
        prevShortLabel: 'septembre',
      },
      '2026-09': {
        label: 'Septembre 2026',
        shortLabel: 'Sept. 2026',
        dateRange: 'Du 1 au 30 septembre 2026',
        prevKey: '2026-08',
        prevShortLabel: 'août',
      },
      '2026-08': {
        label: 'Août 2026',
        shortLabel: 'Août 2026',
        dateRange: 'Du 1 au 31 août 2026',
        prevKey: null,
        prevShortLabel: null,
      },
    };

    const filterTxsForMonthAndAccount = (
      mKey: BilanMonthKey,
      accId: string
    ): Transaction[] => {
      return transactions.filter((tx) => {
        if (tx.monthKey !== mKey) return false;
        // Avoid double-counting internal transfers between the user's own accounts
        if (tx.type === 'INTERNAL_TRANSFER') return false;
        if (
          tx.id === INTERNET_BILL_TRANSACTION.id &&
          accId !== 'TOUS_COMPTES' &&
          accId !== 'COMPTE_PRINCIPAL'
        ) {
          return false;
        }
        if (accId === 'TOUS_COMPTES') {
          return (
            tx.account === 'COMPTE_PRINCIPAL' ||
            tx.account === 'COMPTE_SECONDAIRE'
          );
        }
        if (accId === 'COMPTE_PRINCIPAL') {
          return tx.account === 'COMPTE_PRINCIPAL';
        }
        if (accId === 'COMPTE_SECONDAIRE') {
          return tx.account === 'COMPTE_SECONDAIRE';
        }
        // Created savings goal sub-accounts have no external EXPENSE or INCOME transactions
        return false;
      });
    };

    const resolvedAccount =
      eligibleAccounts.find((a) => a.id === bilanAccount) || eligibleAccounts[0];
    const activeAccountId = resolvedAccount.id;
    const currentMeta = monthMeta[bilanMonth];

    const monthTransactions = filterTxsForMonthAndAccount(
      bilanMonth,
      activeAccountId
    );

    const expenses = monthTransactions
      .filter((tx) => tx.type === 'EXPENSE')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const incomeTxs = monthTransactions.filter((tx) => tx.type === 'INCOME');
    const income = incomeTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const hasIncomeData = incomeTxs.length > 0;
    const netDifference = income - expenses;

    const prevKey = currentMeta.prevKey;
    const prevMonthTxs = prevKey
      ? filterTxsForMonthAndAccount(prevKey, activeAccountId)
      : null;

    const prevMonthExpenses = prevMonthTxs
      ? prevMonthTxs
          .filter((tx) => tx.type === 'EXPENSE')
          .reduce((sum, tx) => sum + tx.amount, 0)
      : null;

    const hasPrevMonthComparison =
      prevMonthExpenses !== null && prevMonthExpenses > 0;

    const expensesVariationPct =
      hasPrevMonthComparison && prevMonthExpenses
        ? Math.round(((expenses - prevMonthExpenses) / prevMonthExpenses) * 100)
        : null;

    const expensesDiffAmount =
      prevMonthExpenses !== null ? expenses - prevMonthExpenses : null;

    const prevMonthIncome = prevMonthTxs
      ? prevMonthTxs
          .filter((tx) => tx.type === 'INCOME')
          .reduce((sum, tx) => sum + tx.amount, 0)
      : null;

    const hasPrevMonthIncomeComparison =
      prevMonthIncome !== null && prevMonthIncome > 0;

    const incomeVariationPct =
      hasPrevMonthIncomeComparison && prevMonthIncome
        ? Math.round(((income - prevMonthIncome) / prevMonthIncome) * 100)
        : null;

    const categories: SpendingCategory[] = [
      'Shopping',
      'Sorties',
      'Courses',
      'Transport',
      'Autres',
    ];
    const totalForShare = expenses || 1;

    const computedCategoryBreakdown: CategorySummary[] = categories.map(
      (cat) => {
        const catTxs = monthTransactions.filter(
          (tx) => tx.type === 'EXPENSE' && tx.category === cat
        );
        const amount = catTxs.reduce((sum, tx) => sum + tx.amount, 0);
        const prevCatAmount = prevMonthTxs
          ? prevMonthTxs
              .filter((tx) => tx.type === 'EXPENSE' && tx.category === cat)
              .reduce((sum, tx) => sum + tx.amount, 0)
          : 0;
        const variationPct =
          prevCatAmount > 0
            ? Math.round(((amount - prevCatAmount) / prevCatAmount) * 100)
            : 0;
        const sharePct = expenses > 0 ? Math.round((amount / totalForShare) * 100) : 0;

        return {
          category: cat,
          amount,
          prevMonthAmount: prevCatAmount,
          variationPct,
          sharePct,
          transactionsCount: catTxs.length,
        };
      }
    );

    const chronologicalMonths: BilanMonthKey[] = [
      '2026-08',
      '2026-09',
      '2026-10',
    ];
    const monthlyEvolution = chronologicalMonths.map((mKey) => {
      const mTxs = filterTxsForMonthAndAccount(mKey, activeAccountId);
      const mExpenses = mTxs
        .filter((tx) => tx.type === 'EXPENSE')
        .reduce((sum, tx) => sum + tx.amount, 0);
      const mIncTxs = mTxs.filter((tx) => tx.type === 'INCOME');
      const mIncome = mIncTxs.reduce((sum, tx) => sum + tx.amount, 0);
      return {
        monthKey: mKey,
        label: monthMeta[mKey].label,
        shortLabel:
          mKey === '2026-08'
            ? 'Août'
            : mKey === '2026-09'
            ? 'Sept.'
            : 'Oct.',
        income: mIncome,
        hasIncomeData: mIncTxs.length > 0,
        expenses: mExpenses,
        netDifference: mIncome - mExpenses,
      };
    });

    return {
      monthKey: bilanMonth,
      monthLabel: currentMeta.label,
      monthShortLabel: currentMeta.shortLabel,
      monthDateRange: currentMeta.dateRange,
      prevMonthShortLabel: currentMeta.prevShortLabel,
      accountLabel: resolvedAccount.label,
      expenses,
      prevMonthExpenses,
      hasPrevMonthComparison,
      expensesVariationPct,
      expensesDiffAmount,
      income,
      prevMonthIncome,
      hasPrevMonthIncomeComparison,
      incomeVariationPct,
      hasIncomeData,
      netDifference,
      categoryBreakdown: computedCategoryBreakdown,
      monthTransactions,
      monthlyEvolution,
    };
  }, [transactions, bilanMonth, bilanAccount, eligibleAccounts]);

  // Smart Detection of Subscriptions from real transaction history
  // Explicitly excludes rent, syndic charges ("Virement Loyer & Syndic"), and non-subscription transfers
  const detectedSubscriptions = useMemo<DetectedSubscriptionItem[]>(() => {
    const eligibleSubscriptionTxIds = [
      'tx-oct-aut-3', // Orange Maroc Fibre & Mobile (Confirmed)
      'tx-oct-aut-4', // Spotify & iCloud+ (Confirmed)
      'tx-oct-aut-2', // Lydec Eau & Électricité (Candidate 1)
      'tx-oct-tran-2', // Careem / Casa Tramway (Candidate 2)
      'tx-oct-netflix', // Netflix (Candidate 3)
    ];

    const eligibleOctTxs = eligibleSubscriptionTxIds
      .map((id) => transactions.find((tx) => tx.id === id))
      .filter((tx): tx is Transaction => Boolean(tx));

    const sepAutTx = transactions.find((tx) => tx.id === 'tx-sep-aut-1');
    const augAutTx = transactions.find((tx) => tx.id === 'tx-aug-aut-1');
    const sepTranTx = transactions.find((tx) => tx.id === 'tx-sep-tran-1');
    const augTranTx = transactions.find((tx) => tx.id === 'tx-aug-tran-1');
    const sepNetflixTx = transactions.find((tx) => tx.id === 'tx-sep-netflix');

    return eligibleOctTxs.map((tx) => {
      const decision = subscriptionDecisions[tx.id] || {
        status:
          tx.id === 'tx-oct-aut-3' || tx.id === 'tx-oct-aut-4'
            ? 'CONFIRMED'
            : 'PENDING',
        frequency: 'Mensuel' as SubscriptionFrequency,
      };

      const freq = decision.frequency;
      const monthlyEquivalent =
        freq === 'Mensuel'
          ? tx.amount
          : freq === 'Trimestriel'
          ? Math.round(tx.amount / 3)
          : Math.round(tx.amount / 12);

      const dayMatch = tx.date.match(/^(\d{2})/);
      const dayPart = dayMatch ? dayMatch[1] : '05';
      const nextExpectedDate =
        freq === 'Mensuel'
          ? `~${dayPart} nov. 2026`
          : freq === 'Trimestriel'
          ? `~${dayPart} janv. 2027`
          : `~${dayPart} oct. 2027`;

      const detectionNote =
        tx.id === 'tx-oct-netflix'
          ? 'Paiement récurrent détecté pour vos divertissements en ligne. Confirmez s’il s’agit d’un abonnement à suivre.'
          : tx.id === 'tx-oct-aut-4'
          ? 'Identifié à partir de votre paiement carte récurrent « Abonnements numériques ».'
          : tx.id === 'tx-oct-aut-3'
          ? 'Identifié à partir de votre prélèvement récurrent « Forfait télécom ».'
          : tx.id === 'tx-oct-aut-2'
          ? 'Facture mensuelle récurrente détectée dans vos opérations. Confirmez s’il s’agit d’un abonnement à suivre.'
          : 'Paiement mensuel régulier détecté pour vos déplacements urbains. Confirmez s’il s’agit d’un abonnement à suivre.';

      const relatedTransactions: Transaction[] =
        tx.id === 'tx-oct-netflix'
          ? [
              tx,
              ...(sepNetflixTx ? [sepNetflixTx] : []),
            ]
          : tx.id === 'tx-oct-tran-2'
          ? [
              tx,
              ...(sepTranTx ? [sepTranTx] : []),
              ...(augTranTx ? [augTranTx] : []),
            ]
          : [
              tx,
              ...(sepAutTx ? [sepAutTx] : []),
              ...(augAutTx ? [augAutTx] : []),
            ];

      return {
        id: tx.id,
        merchant: tx.merchant,
        subtitle: tx.subtitle,
        amount: tx.amount,
        monthlyEquivalent,
        frequency: freq,
        status: decision.status,
        lastPaymentDate: tx.date,
        nextExpectedDate,
        isNextDateEstimated: true,
        detectionNote,
        relatedTransactions,
      };
    });
  }, [transactions, subscriptionDecisions]);

  const confirmedSubscriptions = useMemo(
    () => detectedSubscriptions.filter((s) => s.status === 'CONFIRMED'),
    [detectedSubscriptions]
  );

  const pendingSubscriptions = useMemo(
    () => detectedSubscriptions.filter((s) => s.status === 'PENDING'),
    [detectedSubscriptions]
  );

  const confirmedSubscriptionsMonthlyTotal = useMemo(
    () =>
      confirmedSubscriptions.reduce(
        (sum, s) => sum + s.monthlyEquivalent,
        0
      ),
    [confirmedSubscriptions]
  );

  const confirmSubscription = (id: string) => {
    const item = detectedSubscriptions.find((s) => s.id === id);
    setSubscriptionDecisions((prev) => ({
      ...prev,
      [id]: {
        status: 'CONFIRMED',
        frequency: prev[id]?.frequency || 'Mensuel',
      },
    }));
    if (item) {
      showToast(
        'Abonnement confirmé',
        `« ${item.merchant} » (${formatDH(item.amount)}) est désormais suivi dans vos abonnements.`
      );
    }
  };

  const dismissSubscription = (id: string) => {
    const item = detectedSubscriptions.find((s) => s.id === id);
    setSubscriptionDecisions((prev) => ({
      ...prev,
      [id]: {
        status: 'DISMISSED',
        frequency: prev[id]?.frequency || 'Mensuel',
      },
    }));
    if (item) {
      showToast(
        "Ce n'est pas un abonnement",
        `« ${item.merchant} » ne sera pas comptabilisé dans vos abonnements.`
      );
    }
  };

  const updateSubscriptionFrequency = (
    id: string,
    frequency: SubscriptionFrequency
  ) => {
    setSubscriptionDecisions((prev) => ({
      ...prev,
      [id]: {
        status: prev[id]?.status || 'CONFIRMED',
        frequency,
      },
    }));
    showToast('Fréquence mise à jour', `Périodicité définie sur : ${frequency}.`);
  };

  const resetSubscriptionsDetection = () => {
    setSubscriptionDecisions(DEFAULT_SUBSCRIPTION_DECISIONS);
    showToast(
      'Détection actualisée',
      'Les paiements récurrents détectés dans vos opérations ont été restaurés.'
    );
  };

  // Helper to progress the "Vérifier mes dépenses" challenge by `incrementCount` newly verified transactions
  const advanceVerificationChallenge = (incrementCount: number) => {
    if (incrementCount <= 0) return;
    setChallenges((prev) =>
      prev.map((ch) => {
        if (ch.id === 'defi-verifier-2') {
          const updatedMilestones = ch.milestones.map((m) => {
            if (m.id === 'mv1') {
              return {
                ...m,
                currentValue: m.targetValue,
                completed: true,
              };
            }
            if (m.id === 'mv2') {
              const nextVal = Math.min(
                m.targetValue,
                m.currentValue + incrementCount
              );
              return {
                ...m,
                currentValue: nextVal,
                completed: nextVal >= m.targetValue,
              };
            }
            return m;
          });
          const m2 = updatedMilestones.find((m) => m.id === 'mv2');
          const pct = m2
            ? Math.round((m2.currentValue / m2.targetValue) * 100)
            : ch.progressPct;
          const isNowCompleted = pct >= 100;
          if (isNowCompleted && ch.status !== 'COMPLETED') {
            setLearningPoints((pts) => pts + ch.pointsReward);
            setEarnedBadges((b) =>
              b.includes(ch.badgeName) ? b : [...b, ch.badgeName]
            );
          }
          return {
            ...ch,
            status: isNowCompleted ? 'COMPLETED' : 'ACTIVE',
            progressPct: pct,
            milestones: updatedMilestones,
          };
        }
        return ch;
      })
    );
  };

  // Recategorize a transaction and update analytics + verification challenge
  const recategorizeTransaction = (txId: string, newCategory: SpendingCategory) => {
    const targetTx = transactions.find((t) => t.id === txId);
    const wasAlreadyVerified = Boolean(targetTx?.verifiedByUser);

    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === txId
          ? {
              ...tx,
              category: newCategory,
              uncertainCategory: false,
              verifiedByUser: true,
            }
          : tx
      )
    );

    if (!wasAlreadyVerified) {
      advanceVerificationChallenge(1);
    }

    if (shoppingChallengeActivatedAt && targetTx?.type === 'EXPENSE') {
      if (targetTx.category !== 'Shopping' && newCategory === 'Shopping') {
        setShoppingChallengePostActivationSpent(
          (prev) => prev + targetTx.amount
        );
      } else if (
        targetTx.category === 'Shopping' &&
        newCategory !== 'Shopping'
      ) {
        setShoppingChallengePostActivationSpent((prev) =>
          Math.max(0, prev - targetTx.amount)
        );
      }
    }

    showToast(
      'Opération mise à jour',
      `Nouvelle catégorie attribuée : ${newCategory}. Vos analyses ont été recalculées.`
    );
  };

  // Bulk confirm current categories for multiple selected transactions
  const bulkVerifyTransactions = (txIds: string[]) => {
    if (!txIds || txIds.length === 0) return;
    const idSet = new Set(txIds);
    const newlyVerifiedCount = transactions.filter(
      (tx) => idSet.has(tx.id) && !tx.verifiedByUser
    ).length;

    setTransactions((prev) =>
      prev.map((tx) =>
        idSet.has(tx.id)
          ? {
              ...tx,
              uncertainCategory: false,
              verifiedByUser: true,
            }
          : tx
      )
    );

    advanceVerificationChallenge(newlyVerifiedCount);

    const countLabel =
      txIds.length === 1
        ? '1 opération vérifiée'
        : `${txIds.length} opérations vérifiées`;
    showToast(
      countLabel,
      'Leurs catégories ont été confirmées et votre progression a été mise à jour.'
    );
  };

  // Bulk recategorize multiple selected transactions at once
  const bulkRecategorizeTransactions = (
    txIds: string[],
    newCategory: SpendingCategory
  ) => {
    if (!txIds || txIds.length === 0) return;
    const idSet = new Set(txIds);
    const newlyVerifiedCount = transactions.filter(
      (tx) => idSet.has(tx.id) && !tx.verifiedByUser
    ).length;

    setTransactions((prev) =>
      prev.map((tx) =>
        idSet.has(tx.id)
          ? {
              ...tx,
              category: newCategory,
              uncertainCategory: false,
              verifiedByUser: true,
            }
          : tx
      )
    );

    advanceVerificationChallenge(newlyVerifiedCount);

    if (shoppingChallengeActivatedAt) {
      const addedShoppingAmount = transactions
        .filter(
          (tx) =>
            idSet.has(tx.id) &&
            tx.type === 'EXPENSE' &&
            tx.category !== 'Shopping' &&
            newCategory === 'Shopping'
        )
        .reduce((sum, tx) => sum + tx.amount, 0);
      if (addedShoppingAmount > 0) {
        setShoppingChallengePostActivationSpent(
          (prev) => prev + addedShoppingAmount
        );
      }
    }

    const countLabel =
      txIds.length === 1
        ? '1 opération reclassée'
        : `${txIds.length} opérations reclassées`;
    showToast(
      `${countLabel} en ${newCategory}`,
      'Vos dépenses, budgets et défis ont été recalculés instantanément.'
    );
  };

  // Create or update a category budget
  const createOrUpdateBudget = (
    category: SpendingCategory,
    limit: number,
    alertThresholdPct = 80,
    scope?: BudgetScope,
    startPeriod: 'CURRENT' | 'NEXT' = 'CURRENT'
  ) => {
    setBudgets((prev) => {
      const resolvedScope: BudgetScope =
        scope ?? prev[category]?.scope ?? 'PERSONNEL';
      const budgetKey =
        resolvedScope === 'FOYER' ? `${category}_FOYER` : category;
      const existing = prev[budgetKey];

      return {
        ...prev,
        [budgetKey]: {
          id: existing?.id || budgetKey,
          category,
          limit,
          alertThresholdPct,
          createdAt: existing?.createdAt || '11 oct. 2026',
          scope: resolvedScope,
          status: 'ACTIVE',
          startPeriod,
        },
      };
    });
  };

  // Stop or reactivate budget tracking while preserving historical budget data
  const toggleBudgetTrackingStatus = (
    category: SpendingCategory,
    nextStatus?: 'ACTIVE' | 'STOPPED',
    scope?: BudgetScope
  ) => {
    setBudgets((prev) => {
      const budgetKey =
        scope === 'FOYER' ? `${category}_FOYER` : category;
      const existing = prev[budgetKey];
      if (!existing) return prev;
      const resolvedStatus: 'ACTIVE' | 'STOPPED' =
        nextStatus ?? (existing.status === 'STOPPED' ? 'ACTIVE' : 'STOPPED');
      return {
        ...prev,
        [budgetKey]: {
          ...existing,
          status: resolvedStatus,
        },
      };
    });
  };

  // Delete a category budget configuration without deleting any banking transactions
  const deleteCategoryBudget = (
    category: SpendingCategory,
    scope?: BudgetScope
  ) => {
    setBudgets((prev) => {
      const budgetKey =
        scope === 'FOYER' ? `${category}_FOYER` : category;
      if (!prev[budgetKey]) return prev;
      const next = { ...prev };
      delete next[budgetKey];
      return next;
    });
  };

  const [shoppingChallengeActivatedAt, setShoppingChallengeActivatedAt] =
    useState<string | null>(null);
  const [shoppingChallengeJustActivated, setShoppingChallengeJustActivated] =
    useState<boolean>(false);
  const [
    shoppingChallengePostActivationSpent,
    setShoppingChallengePostActivationSpent,
  ] = useState<number>(0);
  const [shoppingChallengeCompletedWeeks, setShoppingChallengeCompletedWeeks] =
    useState<number>(0);
  const [shoppingChallengeOrigin, setShoppingChallengeOrigin] =
    useState<'BUDGETS' | 'MES_DEFIS' | 'D2_SHOPPING_INSIGHT'>('BUDGETS');

  const clearShoppingChallengeJustActivated = () => {
    setShoppingChallengeJustActivated(false);
  };

  // Opt-in to start a challenge
  const startChallenge = (challengeId: string, silent?: boolean) => {
    if (challengeId === 'defi-shopping-1') {
      const existingShoppingChallenge = challenges.find(
        (ch) => ch.id === 'defi-shopping-1'
      );
      const isAlreadyActivated =
        Boolean(shoppingChallengeActivatedAt) ||
        existingShoppingChallenge?.status === 'ACTIVE' ||
        existingShoppingChallenge?.status === 'COMPLETED';

      if (!isAlreadyActivated) {
        const nowIso = new Date().toISOString();
        setShoppingChallengeActivatedAt(nowIso);
        setShoppingChallengeJustActivated(true);
        setShoppingChallengeCompletedWeeks(0);
        setShoppingChallengePostActivationSpent(0);

        setChallenges((prev) =>
          prev.map((ch) =>
            ch.id === 'defi-shopping-1'
              ? {
                  ...ch,
                  status: 'ACTIVE',
                  currentWeek: 1,
                  progressPct: 0,
                  daysRemaining: 28,
                  milestones: ch.milestones.map((m) => ({
                    ...m,
                    completed: false,
                    currentValue: 0,
                  })),
                }
              : ch
          )
        );
      } else {
        setShoppingChallengeJustActivated(false);
      }
    } else {
      setChallenges((prev) =>
        prev.map((ch) =>
          ch.id === challengeId
            ? {
                ...ch,
                status: 'ACTIVE',
              }
            : ch
        )
      );
    }

    if (!silent) {
      showToast(
        'Défi activé avec succès !',
        'Votre progression est désormais suivie dans l’onglet Mes défis.'
      );
    }
  };

  // Simulate completing a week in the 4-week Shopping savings challenge
  const simulateShoppingChallengeWeek = (): number => {
    setShoppingChallengeJustActivated(false);
    const nextCompleted =
      shoppingChallengeCompletedWeeks >= 4 ? 0 : shoppingChallengeCompletedWeeks + 1;
    setShoppingChallengeCompletedWeeks(nextCompleted);
    setShoppingChallengePostActivationSpent(0);

    const nextActiveWeek = Math.min(4, nextCompleted + 1);
    const nextPct = Math.min(100, Math.round((nextCompleted / 4) * 100));

    setChallenges((prev) =>
      prev.map((ch) =>
        ch.id === 'defi-shopping-1'
          ? {
              ...ch,
              status: nextCompleted >= 4 ? 'COMPLETED' : 'ACTIVE',
              currentWeek: nextActiveWeek,
              progressPct: nextPct,
              daysRemaining: Math.max(0, (4 - nextCompleted) * 7),
              milestones: ch.milestones.map((m, idx) => ({
                ...m,
                completed: idx < nextCompleted,
                currentValue: idx < nextCompleted ? m.targetValue : 0,
              })),
            }
          : ch
      )
    );

    return nextCompleted;
  };

  // Complete an individual step of a course (updates progression without awarding quiz points)
  const completeCourseStep = (courseId: string, stepIndex: number) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const totalSteps = Math.max(1, c.slides.length);
        const stepCount = Math.min(totalSteps, stepIndex + 1);
        const nextPct =
          stepCount >= totalSteps
            ? 100
            : Math.round((stepCount / totalSteps) * 100);
        return {
          ...c,
          progressPct: Math.max(c.progressPct, nextPct),
        };
      })
    );
  };

  // Complete a course & quiz (rewards symbolic points only, never badges, never twice)
  const completeCourseQuiz = (courseId: string) => {
    setCourses((prev) => {
      const target = prev.find((c) => c.id === courseId);
      if (!target || target.completed) {
        return prev;
      }

      setLearningPoints((pts) => pts + target.points);

      return prev.map((c) =>
        c.id === courseId
          ? {
              ...c,
              completed: true,
              progressPct: 100,
            }
          : c
      );
    });
  };

  const selectSavingsGoal = (goalId: string) => {
    const found = savingsGoals.find((g) => g.id === goalId);
    if (found) {
      setSavingsGoal(found);
    } else if (goalId === 'foyer-demo-vacances') {
      setSavingsGoal(DEFAULT_FAMILY_SAVINGS_GOAL);
      setSavingsGoals((prev) =>
        prev.some((g) => g.id === 'foyer-demo-vacances')
          ? prev
          : [...prev, DEFAULT_FAMILY_SAVINGS_GOAL]
      );
    }
  };

  // Create a new savings goal (Simple legacy wrapper)
  const createSavingsGoal = (title: string, targetAmount: number, deadline: string) => {
    createFullSavingsGoal({
      title,
      targetAmount,
      deadline,
      imageUrl: TRAVEL_PHOTO_URL,
      categoryTag: 'Voyage',
      methodConfig: {
        type: 'ARRONDIS',
        sourceAccount: 'Compte principal Simple •• 4821',
        status: 'ACTIVE',
        roundingLevel: 10,
        roundingMultiplier: 1,
      },
      initialDeposit: 0,
      scope: 'PERSONNEL',
    });
  };

  // Complete interactive 2-step savings goal creation
  const createFullSavingsGoal = (goalData: {
    title: string;
    targetAmount: number;
    deadline: string;
    imageUrl: string;
    categoryTag?: string;
    methodConfig: SavingsMethodConfig;
    initialDeposit?: number;
    scope?: GoalScope;
  }) => {
    const deposit =
      goalData.initialDeposit && goalData.initialDeposit > 0 ? goalData.initialDeposit : 0;
    const initialContributions: SavingsContributionHistory[] = [];
    const rawTitle = (goalData.title || '').trim();
    const finalTitle =
      rawTitle.length > 0 && rawTitle.toLowerCase() !== 'text'
        ? rawTitle
        : goalData.categoryTag
        ? `Projet ${goalData.categoryTag}`
        : "Projet d'épargne";

    const resolvedScope: GoalScope = goalData.scope || 'PERSONNEL';

    if (deposit > 0 && deposit <= mainAccountBalance) {
      setMainAccountBalance((prev) => Number((prev - deposit).toFixed(2)));
      initialContributions.push({
        id: `sc-init-${Date.now()}`,
        date: '13 oct. 2026',
        label: 'Versement ponctuel initial',
        amount: deposit,
        method: 'VERSEMENT_PONCTUEL',
      });

      const transferTx: Transaction = {
        id: `tx-init-savings-${Date.now()}`,
        merchant: `Épargne · ${finalTitle}`,
        subtitle: 'Versement initial vers votre projet',
        date: '13 oct. 2026',
        monthKey: '2026-10',
        amount: deposit,
        type: 'INTERNAL_TRANSFER',
        category: 'Épargne',
        account: 'COMPTE_PRINCIPAL',
      };
      setTransactions((prev) => [transferTx, ...prev]);
    }

    const existingGoalMatch = savingsGoals.find(
      (g) =>
        g.title.trim().toLowerCase() === finalTitle.trim().toLowerCase() &&
        (g.scope || 'PERSONNEL') === resolvedScope
    );

    const newGoal: SavingsGoal = existingGoalMatch
      ? {
          ...existingGoalMatch,
          title: finalTitle,
          targetAmount: goalData.targetAmount,
          deadline: goalData.deadline,
          imageUrl: goalData.imageUrl,
          categoryTag: goalData.categoryTag,
          isCreated: true,
          methodConfig: goalData.methodConfig,
          savedAmount: existingGoalMatch.savedAmount + deposit,
          contributionsHistory: [
            ...initialContributions,
            ...(existingGoalMatch.contributionsHistory || []),
          ],
          scope: resolvedScope,
        }
      : {
          id: `goal-${Date.now()}`,
          title: finalTitle,
          subtitle: `Projet d'épargne ${
            goalData.categoryTag ? `· ${goalData.categoryTag}` : ''
          }`,
          description: `Objectif de ${formatDH(goalData.targetAmount)} prévu pour ${
            goalData.deadline
          }.`,
          savedAmount: deposit,
          targetAmount: goalData.targetAmount,
          deadline: goalData.deadline,
          imageUrl: goalData.imageUrl,
          categoryTag: goalData.categoryTag,
          isCreated: true,
          methodConfig: goalData.methodConfig,
          contributionsHistory: initialContributions,
          scope: resolvedScope,
        };

    setSavingsGoal(newGoal);
    setSavingsGoals((prev) => {
      const idx = prev.findIndex((g) => g.id === newGoal.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = newGoal;
        return updated;
      }
      return [...prev, newGoal];
    });
    setHasSavingsGoal(true);
    setHasCompletedOnboarding(true);
    setIsSimpleOneScenario(true);
    if (resolvedScope === 'FOYER') {
      toggleWidgetActive('w-projets-familiaux', true);
    } else {
      toggleWidgetActive('w-projets-epargne', true);
      toggleWidgetActive('w-capacite-epargne', true);
    }

    showToast(
      `Projet « ${finalTitle} » créé avec succès !`,
      deposit > 0
        ? `Objectif de ${formatDH(goalData.targetAmount)} · Versement initial de ${formatDH(
            deposit
          )} effectué.`
        : `Objectif de ${formatDH(goalData.targetAmount)} fixé pour ${goalData.deadline}.`
    );
  };

  const updateSavingsGoal = (updates: Partial<SavingsGoal>) => {
    const cleanUpdates = { ...updates };
    if (cleanUpdates.title && cleanUpdates.title.trim().toLowerCase() === 'text') {
      cleanUpdates.title = savingsGoal.categoryTag
        ? `Projet ${savingsGoal.categoryTag}`
        : "Projet d'épargne";
    }
    setSavingsGoal((prev) => {
      const updated = { ...prev, ...cleanUpdates };
      setSavingsGoals((list) =>
        list.some((g) => g.id === updated.id)
          ? list.map((g) => (g.id === updated.id ? updated : g))
          : [...list, updated]
      );
      return updated;
    });
    showToast('Objectif modifié', 'Vos modifications ont bien été enregistrées.');
  };

  const deleteSavingsGoal = () => {
    const refundAmount = savingsGoal.savedAmount;
    const deletedId = savingsGoal.id;
    const deletedScope = savingsGoal.scope;
    if (refundAmount > 0) {
      setMainAccountBalance((prev) => Number((prev + refundAmount).toFixed(2)));
    }
    const remaining = savingsGoals.filter((g) => g.id !== deletedId);
    setSavingsGoals(remaining);
    if (remaining.length > 0) {
      setSavingsGoal(remaining[0]);
      setHasSavingsGoal(true);
    } else {
      setHasSavingsGoal(false);
      setSavingsGoal(INITIAL_SAVINGS_GOAL);
    }
    setCurrentScreen('C1_HUB');
    setActiveHubTab('MON_ESPACE');
    if (deletedScope === 'FOYER') {
      setMonEspaceSubTab('FOYER');
    }
    showToast(
      'Objectif supprimé',
      refundAmount > 0
        ? `Votre épargne (${formatDH(refundAmount)}) reste disponible sur votre compte principal.`
        : 'Votre espace a été actualisé.'
    );
  };

  const toggleSavingsMethodPause = () => {
    if (!savingsGoal.methodConfig) return;
    const currentStatus = savingsGoal.methodConfig.status;
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setSavingsGoal((prev) => {
      const updated: SavingsGoal = {
        ...prev,
        methodConfig: prev.methodConfig
          ? { ...prev.methodConfig, status: nextStatus }
          : undefined,
      };
      setSavingsGoals((list) =>
        list.some((g) => g.id === updated.id)
          ? list.map((g) => (g.id === updated.id ? updated : g))
          : [...list, updated]
      );
      return updated;
    });
    showToast(
      nextStatus === 'ACTIVE' ? 'Règle d’épargne reprise' : 'Règle d’épargne mise en pause',
      nextStatus === 'ACTIVE'
        ? 'Vos versements automatiques sont réactivés.'
        : 'Aucun prélèvement automatique ne sera exécuté.'
    );
  };

  const changeSavingsMethod = (config: SavingsMethodConfig) => {
    setSavingsGoal((prev) => {
      const updated = { ...prev, methodConfig: config };
      setSavingsGoals((list) =>
        list.some((g) => g.id === updated.id)
          ? list.map((g) => (g.id === updated.id ? updated : g))
          : [...list, updated]
      );
      return updated;
    });
    showToast('Méthode d’épargne mise à jour', 'Vos nouvelles préférences sont actives.');
  };

  // Internal transfer to savings goal (Does NOT count as expense!)
  const transferToSavingsGoal = (amount: number) => {
    if (amount <= 0 || amount > mainAccountBalance) return;

    setMainAccountBalance((prev) => Number((prev - amount).toFixed(2)));

    const newContribution: SavingsContributionHistory = {
      id: `sc-${Date.now()}`,
      date: '13 oct. 2026',
      label: 'Versement manuel',
      amount,
      method: 'VERSEMENT_PONCTUEL',
    };

    setSavingsGoal((prev) => {
      const updated: SavingsGoal = {
        ...prev,
        savedAmount: prev.savedAmount + amount,
        contributionsHistory: [newContribution, ...(prev.contributionsHistory || [])],
      };
      setSavingsGoals((list) =>
        list.some((g) => g.id === updated.id)
          ? list.map((g) => (g.id === updated.id ? updated : g))
          : [...list, updated]
      );
      return updated;
    });

    const newTransferTx: Transaction = {
      id: `tx-transfer-${Date.now()}`,
      merchant: `Virement vers ${savingsGoal.title || 'Projet Épargne'}`,
      subtitle: 'Épargne interne · Non comptabilisé en dépense',
      date: '13 oct. 2026',
      monthKey: '2026-10',
      amount,
      type: 'INTERNAL_TRANSFER',
      category: 'Épargne',
      account: 'COMPTE_PRINCIPAL',
    };

    setTransactions((prev) => [newTransferTx, ...prev]);

    showToast(
      `+${formatDH(amount)} ajoutés à ${savingsGoal.title || 'votre projet'}`,
      'Virement interne effectué sans impacter le total de vos dépenses.'
    );
  };

  // Update Smart Épargne configuration
  const updateAutoSavings = (config: Partial<AutoSavingsConfig>) => {
    setAutoSavings((prev) => {
      const next = { ...prev, ...config };
      return next;
    });

    if (config.enabled) {
      setChallenges((prev) =>
        prev.map((ch) =>
          ch.id === 'defi-epargne-3'
            ? {
                ...ch,
                status: 'ACTIVE',
                progressPct: 100,
                milestones: ch.milestones.map((m) => ({
                  ...m,
                  currentValue: m.targetValue,
                  completed: true,
                })),
              }
            : ch
        )
      );
    }
  };

  // Chapter 4: Household functions
  const setupHousehold = (partnerName: string) => {
    createHousehold({
      name: `Foyer Lamia & ${partnerName}`,
      members: [{ name: partnerName, role: 'Conjoint' }],
    });
  };

  const createHousehold = (data: {
    name: string;
    members: { name: string; role: 'Conjoint' | 'Membre' | 'Colocataire' }[];
    permissions?: {
      sharedExpensesVisible: boolean;
      reimbursementsTracked: boolean;
      commonBudgetAccess: boolean;
      sharedProjectsEnabled: boolean;
    };
  }) => {
    const lamiaMember: HouseholdMember = {
      id: 'hm-lamia',
      name: 'Lamia',
      role: 'Administratrice',
      avatarInitials: 'L',
      joinedDate: 'Membre fondateur',
    };

    const newMembers: HouseholdMember[] = data.members.map((m, idx) => ({
      id: `hm-${Date.now()}-${idx}`,
      name: m.name,
      role: (m.role === 'Colocataire' ? 'Membre' : m.role) as any,
      avatarInitials: m.name.charAt(0).toUpperCase(),
      joinedDate: 'Invité aujourd’hui',
    }));

    const finalName = data.name.trim() || 'Notre foyer';
    setHouseholdName(finalName);
    setHouseholdMembers([lamiaMember, ...newMembers]);
    if (data.permissions) {
      setHouseholdPermissions(data.permissions);
    }
    setHasHouseholdSetup(true);

    toggleWidgetActive('w-depenses-communes', true);

    showToast(
      `Foyer « ${finalName} » créé avec succès !`,
      `${newMembers.length + 1} membres · Vos dépenses communes et remboursements sont organisés.`
    );
  };

  const completeHouseholdPersonalization = (spaceName: string, coverUrl: string) => {
    const isInitialActivation = !hasHouseholdSetup;
    const finalName = spaceName.trim() || 'Notre foyer';
    const finalCover = coverUrl || DEFAULT_FOYER_COVER_URL;

    const configuredMembers: HouseholdMember[] = householdDraftMembers.map((m) => ({
      id: m.id,
      name: m.firstName,
      role: m.relationship,
      avatarInitials: m.firstName.charAt(0).toUpperCase(),
      joinedDate: m.isSelf ? 'Membre fondateur' : 'Membre du foyer',
      photoUrl: m.photoUrl,
    }));

    setHouseholdName(finalName);
    setHouseholdCoverUrl(finalCover);
    setHouseholdMembers(configuredMembers);
    setHasHouseholdSetup(true);

    if (isInitialActivation) {
      const approvedOrder = [
        'w-nos-pockets',
        'w-compte-famille',
        'w-depenses-communes',
        'w-budget-familial',
        'w-foyer-simple-one',
        'w-projets-familiaux',
      ];
      setWidgets((prev) =>
        prev.map((w) => {
          const idx = approvedOrder.indexOf(w.id);
          if (idx !== -1) {
            return { ...w, defaultActive: true, defaultOrder: idx + 1 };
          }
          return w;
        })
      );
      setBudgets((prev) => {
        const hasAnyFoyerBudget = Object.values(prev).some(
          (b) => b.scope === 'FOYER'
        );
        if (hasAnyFoyerBudget) return prev;
        return {
          ...DEFAULT_FAMILY_BUDGETS,
          ...prev,
        };
      });
      setSavingsGoals((prev) => {
        const hasAnyFoyerGoal = prev.some((g) => g.scope === 'FOYER');
        if (hasAnyFoyerGoal) return prev;
        return [...prev, DEFAULT_FAMILY_SAVINGS_GOAL];
      });
    }

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          HOUSEHOLD_SETUP_STORAGE_KEY,
          JSON.stringify({
            hasHouseholdSetup: true,
            householdName: finalName,
            householdCoverUrl: finalCover,
            householdMembers: configuredMembers,
          })
        );
      } catch {
        // Ignore storage errors
      }
    }
  };

  const createHouseholdBudget = (limit: number) => {
    setHouseholdBudget(limit);
    showToast(
      'Budget du foyer configuré',
      `Plafond mensuel de ${formatDH(limit)} activé.`
    );
  };

  const createHouseholdProject = (title: string, target: number) => {
    setHouseholdSavingsGoal(`${title} (${formatDH(target)})`);
    showToast(
      'Projet commun ajouté',
      `Objectif de ${formatDH(target)} fixé.`
    );
  };

  const saveExpenseSplit = (data: {
    expenseId: string;
    title: string;
    totalAmount: number;
    category: SpendingCategory;
    date: string;
    participants: { name: string; shareAmount: number }[];
    myShare: number;
    sendRequest: boolean;
  }) => {
    const totalPartnerShare = data.participants.reduce((sum, p) => sum + p.shareAmount, 0);

    const newSharedExpense: SharedExpense = {
      id: data.expenseId,
      title: data.title,
      category: data.category,
      date: data.date,
      totalAmount: data.totalAmount,
      paidBy: 'Lamia',
      shareLamia: data.myShare,
      shareOther: totalPartnerShare,
      status: data.sendRequest ? 'SPLIT_PENDING' : 'SETTLED',
      participants: data.participants,
    };

    setSharedExpenses((prev) => {
      const filtered = prev.filter((e) => e.id !== data.expenseId);
      return [newSharedExpense, ...filtered];
    });

    if (data.sendRequest) {
      const newRequests: SplitRequest[] = data.participants.map((p) => ({
        id: `sr-${data.expenseId}-${p.name}-${Date.now()}`,
        expenseId: data.expenseId,
        title: data.title,
        recipientName: p.name,
        amountRequested: p.shareAmount,
        date: data.date,
        status: 'PENDING',
      }));

      setSplitRequests((prev) => {
        const filtered = prev.filter((r) => r.expenseId !== data.expenseId);
        return [...newRequests, ...filtered];
      });
    } else {
      setSplitRequests((prev) => prev.filter((r) => r.expenseId !== data.expenseId));
    }

    if (data.expenseId === 'tx-internet-bill') {
      setIsInternetBillSplit(true);
      setInternetBillNotificationDismissed(true);
    }

    // Activate the shared expense widget in Mon espace
    toggleWidgetActive('w-depenses-communes', true);

    showToast(
      'Répartition enregistrée !',
      data.sendRequest
        ? `Demande de ${formatDH(totalPartnerShare)} en attente de remboursement.`
        : 'Partage enregistré dans votre espace Foyer.'
    );
  };

  const simulateReceiveReimbursement = (requestId: string) => {
    const req = splitRequests.find((r) => r.id === requestId);
    if (!req) return;

    const updatedRequests = splitRequests.map((r) =>
      r.id === requestId ? { ...r, status: 'SETTLED' as const } : r
    );
    setSplitRequests(updatedRequests);

    const hasRemainingPending = updatedRequests.some(
      (r) => r.expenseId === req.expenseId && r.status === 'PENDING'
    );

    if (!hasRemainingPending) {
      setSharedExpenses((prev) =>
        prev.map((e) =>
          e.id === req.expenseId ? { ...e, status: 'REIMBURSED' } : e
        )
      );
    }

    // Reconciled balance update: account receives the reimbursement
    setMainAccountBalance((prev) => Number((prev + req.amountRequested).toFixed(2)));

    showToast(
      `Remboursement de ${formatDH(req.amountRequested)} reçu de ${req.recipientName} !`,
      'Crédité directement sur votre compte principal.'
    );
  };

  const splitExpense = (expenseId: string, memberName: string, amount: number) => {
    saveExpenseSplit({
      expenseId,
      title: 'Facture Internet',
      totalAmount: 450,
      category: 'Factures',
      date: '13 oct. 2026',
      participants: [{ name: memberName, shareAmount: amount }],
      myShare: 450 - amount,
      sendRequest: true,
    });
  };

  const settleSplitRequest = (requestId: string) => {
    simulateReceiveReimbursement(requestId);
  };

  const fundHouseholdPocket = (pocketId: string, amount: number) => {
    if (amount <= 0) return;
    const targetPocket = householdPockets.find((p) => p.id === pocketId);
    if (!targetPocket) return;

    setMainAccountBalance((prev) => Math.max(0, Number((prev - amount).toFixed(2))));
    setHouseholdPockets((prev) =>
      prev.map((p) => {
        if (p.id !== pocketId) return p;
        return {
          ...p,
          balance: p.balance + amount,
          transactions: [
            {
              id: `ptx-${Date.now()}`,
              date: '15 oct. 2026',
              label:
                p.memberName === 'Lamia'
                  ? 'Rechargement depuis Compte Principal'
                  : `Virement instantané de Lamia`,
              amount,
              type: 'credit',
              category: 'Alimentation pocket',
            },
            ...p.transactions,
          ],
        };
      })
    );

    showToast(
      `+${formatDH(amount)} versés sur le pocket de ${targetPocket.memberName}`,
      'Le solde disponible a été mis à jour instantanément.'
    );
  };

  const fundFamilyAccount = (amount: number) => {
    if (amount <= 0 || !familyAccount.exists) return;
    setMainAccountBalance((prev) => Math.max(0, Number((prev - amount).toFixed(2))));
    setFamilyAccount((prev) => ({
      ...prev,
      balance: prev.balance + amount,
      transactions: [
        {
          id: `fatx-${Date.now()}`,
          date: '15 oct. 2026',
          label: 'Alimentation depuis Compte Principal (Lamia)',
          amount,
          type: 'credit',
          category: 'Alimentation foyer',
        },
        ...prev.transactions,
      ],
    }));
    showToast(
      `+${formatDH(amount)} ajoutés au Compte Famille`,
      'Nouveau solde disponible immédiatement pour le foyer.'
    );
  };

  // Widgets management (Strictly scoped per category)
  const activeWidgets = useMemo(() => {
    return [...widgets]
      .filter((w) => w.defaultActive && (!isR1 || isR1AllowedWidget(w.id)))
      .sort((a, b) => a.defaultOrder - b.defaultOrder);
  }, [widgets]);

  const getCategoryWidgets = (category: MonEspaceSubTab): WidgetCatalogItem[] => {
    if (isR1 && !isR1AllowedCategory(category)) return [];
    const seen = new Set<string>();
    return [...widgets]
      .filter((w) => {
        if (w.category !== category) return false;
        if (isR1 && !isR1AllowedWidget(w.id)) return false;
        if (category === 'BUDGETS' && w.scope && w.scope !== 'PERSONNEL') return false;
        if (category === 'PROJETS' && w.scope && w.scope !== 'PERSONNEL') return false;
        if (category === 'FOYER' && w.scope && w.scope !== 'FOYER') return false;
        if (w.id === 'w-compte-famille' && !familyAccount.exists) return false;
        if (seen.has(w.id)) return false;
        seen.add(w.id);
        return true;
      })
      .sort((a, b) => a.defaultOrder - b.defaultOrder);
  };

  const getActiveCategoryWidgets = (category: MonEspaceSubTab): WidgetCatalogItem[] => {
    return getCategoryWidgets(category).filter((w) => w.defaultActive);
  };

  const getAvailableCategoryWidgets = (category: MonEspaceSubTab): WidgetCatalogItem[] => {
    return getCategoryWidgets(category).filter((w) => !w.defaultActive);
  };

  const toggleWidgetActive = (widgetId: string, forceState?: boolean) => {
    setWidgets((prev) => {
      const target = prev.find((w) => w.id === widgetId);
      if (!target) return prev;

      return prev.map((w) => {
        if (w.id === widgetId) {
          const nextActive =
            forceState !== undefined ? forceState : !w.defaultActive;
          if (nextActive === w.defaultActive) return w;
          return {
            ...w,
            defaultActive: nextActive,
          };
        }
        return w;
      });
    });
  };

  const moveWidgetOrder = (widgetId: string, direction: 'UP' | 'DOWN') => {
    setWidgets((prev) => {
      const target = prev.find((w) => w.id === widgetId);
      if (!target) return prev;

      const categoryActive = [...prev]
        .filter((w) => w.category === target.category && w.defaultActive)
        .sort((a, b) => a.defaultOrder - b.defaultOrder);

      const idx = categoryActive.findIndex((w) => w.id === widgetId);
      if (idx === -1) return prev;
      const swapIdx = direction === 'UP' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= categoryActive.length) return prev;

      const currentItem = categoryActive[idx];
      const swapItem = categoryActive[swapIdx];

      // Normalize orders if equal
      const currentOrder = currentItem.defaultOrder;
      const swapOrder =
        swapItem.defaultOrder === currentOrder
          ? direction === 'UP'
            ? currentOrder - 1
            : currentOrder + 1
          : swapItem.defaultOrder;

      return prev.map((w) => {
        if (w.id === currentItem.id) return { ...w, defaultOrder: swapOrder };
        if (w.id === swapItem.id) return { ...w, defaultOrder: currentOrder };
        return w;
      });
    });
  };

  // Contextual Coach Chat covering all 5 chapters
  const askCoachQuestion = (questionText: string) => {
    const userMsg: CoachMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text: questionText,
    };

    const shopAmt = shoppingSummary.amount;
    const shopPrev = shoppingSummary.prevMonthAmount;
    const shopDiff = shopAmt - shopPrev;
    const shopVar = shoppingSummary.variationPct;
    const sortAmt = categoryBreakdown.find((c) => c.category === 'Sorties')?.amount || 1240;
    const combinedLeisure = shopAmt + sortAmt;
    const combinedShare = Math.round((combinedLeisure / (currentMonthExpenses || 1)) * 100);
    const currentBudgetLimit = budgets['Shopping']?.limit || 1600;
    const remainingGoal = Math.max(0, savingsGoal.targetAmount - savingsGoal.savedAmount);

    let reply: CoachMessage;
    const qLower = questionText.toLowerCase();

    // Chapter 1: Explaining spending increases
    if (qLower.includes('augmenté') || qLower.includes('pourquoi') || qLower.includes('dépensé plus')) {
      reply = {
        id: `coach-${Date.now() + 1}`,
        sender: 'COACH',
        text: `Ce mois-ci, vos dépenses totales sont de ${formatDH(currentMonthExpenses)} contre ${formatDH(previousMonthExpenses)} en septembre (+${expensesVariationPct} %). La hausse provient principalement du poste Shopping : ${formatDH(shopAmt)} en octobre contre ${formatDH(shopPrev)} le mois dernier, soit +${formatDH(shopDiff)} (+${shopVar} %). Vos achats loisirs (Shopping + Sorties) représentent ensemble ${formatDH(combinedLeisure)} (${combinedShare} % de vos dépenses).`,
        highlightBox: {
          label: 'Shopping + Sorties en Octobre',
          value: `${formatDH(combinedLeisure)} (${combinedShare} % du total)`,
          subtext: `Shopping : ${formatDH(shopAmt)} (+${shopVar} %) · Sorties : ${formatDH(sortAmt)}`,
        },
        actionCta: {
          label: 'Explorer le détail Shopping',
          targetScreen: 'D2_CATEGORY_DETAIL',
          category: 'Shopping',
        },
      };
    }
    // Chapter 2: Budgeting and recurring expenses
    else if (qLower.includes('budget') || qLower.includes('réduire') || qLower.includes('maîtriser') || qLower.includes('échéance')) {
      reply = {
        id: `coach-${Date.now() + 1}`,
        sender: 'COACH',
        text: `Pour préserver votre sérénité sans frustration, je vous conseille de poser un repère Shopping de ${formatDH(currentBudgetLimit)} / mois (contre ${formatDH(shopAmt)} actuellement). En programmant une alerte douce à 80 % (${formatDH(Math.round(currentBudgetLimit * 0.8))}), vous économisez ~250 DH chaque mois pour vos projets personnels.`,
        highlightBox: {
          label: 'Budget Shopping recommandé',
          value: `${formatDH(currentBudgetLimit)} / mois`,
          subtext: 'Économie estimée : ~250 DH / mois tout en conservant vos coups de cœur',
        },
        actionCta: {
          label: 'Ajuster mon budget Shopping',
          targetScreen: 'E1_CREATE_BUDGET',
          category: 'Shopping',
        },
      };
    }
    // Chapter 3: Savings
    else if (qLower.includes('épargner') || qLower.includes('voyage') || qLower.includes('côté') || qLower.includes('smart')) {
      reply = {
        id: `coach-${Date.now() + 1}`,
        sender: 'COACH',
        text: `Avec vos revenus réguliers de ${formatDH(identifiedIncome)} et vos charges maîtrisées, votre capacité d’épargne mensuelle confortable est de 450 à 600 DH. Votre Projet Voyage affiche ${formatDH(savingsGoal.savedAmount)} sur ${formatDH(savingsGoal.targetAmount)} (${Math.round((savingsGoal.savedAmount / savingsGoal.targetAmount) * 100)} %). Activer les arrondis automatiques vous permettrait de compléter les ${formatDH(remainingGoal)} restants sans effort.`,
        highlightBox: {
          label: 'Capacité d’épargne vers Projet Voyage',
          value: '450 à 600 DH / mois (estimé)',
          subtext: `Déjà constitué : ${formatDH(savingsGoal.savedAmount)} sur ${formatDH(savingsGoal.targetAmount)}`,
        },
        actionCta: {
          label: 'Configurer Smart Épargne',
          targetScreen: 'H3_AUTO_SAVINGS',
        },
      };
    }
    // Chapter 4: Household and shared expenses
    else if (qLower.includes('foyer') || qLower.includes('famille') || qLower.includes('partag') || qLower.includes('remboursement')) {
      reply = {
        id: `coach-${Date.now() + 1}`,
        sender: 'COACH',
        text: `Dans l’Espace Foyer, vous pouvez partager vos courses communes (ex. Carrefour Market 640 DH) à 50/50 avec Youssef en un clic. Vos transactions personnelles restent strictement confidentielles : seules les dépenses désignées sont visibles dans le foyer.`,
        highlightBox: {
          label: 'Gestion partagée du foyer',
          value: '1 360 DH de dépenses communes ce mois',
          subtext: '1 demande de remboursement en cours (320 DH)',
        },
        actionCta: {
          label: 'Ouvrir l’espace Foyer',
          targetScreen: 'J1_HOUSEHOLD_SPACE',
        },
      };
    }
    // Chapter 5: Investing
    else if (qLower.includes('invest') || qLower.includes('placement') || qLower.includes('patrimoine') || qLower.includes('risque')) {
      reply = {
        id: `coach-${Date.now() + 1}`,
        sender: 'COACH',
        text: `Avant de songer à investir, l’essentiel est d’avoir une épargne de précaution disponible (comme vos 3 075 DH sur compte principal et votre Projet Voyage). Pour des horizons de 3 à 8 ans, Simple Invest vous permet d’explorer des versements réguliers dès 300 DH/mois avec une diversification adaptée.`,
        highlightBox: {
          label: 'Découverte Investissement Simple',
          value: 'Simulation dès 300 DH / mois',
          subtext: 'Capital non garanti · Horizon conseillé 3 à 8 ans',
        },
        actionCta: {
          label: 'Explorer le simulateur d’investissement',
          targetScreen: 'I3_INVEST_DISCOVERY',
        },
      };
    } else {
      reply = {
        id: `coach-${Date.now() + 1}`,
        sender: 'COACH',
        text: `Je peux vous aider à analyser vos dépenses Shopping (${formatDH(shopAmt)}), ajuster votre budget à ${formatDH(currentBudgetLimit)} / mois ou organiser vos dépenses partagées dans l’espace Foyer.`,
        actionCta: {
          label: 'Créer un budget Shopping',
          targetScreen: 'E1_CREATE_BUDGET',
          category: 'Shopping',
        },
      };
    }

    setCoachMessages((prev) => [...prev, userMsg, reply]);
  };

  // Chapter Transition Method for Stakeholders
  const setDemoChapter = (chapter: DemoChapter) => {
    setCurrentDemoChapter(chapter);
    setHasCompletedOnboarding(true);
    setIsDiscoverySheetOpen(false);

    switch (chapter) {
      case 'COMPRENDRE':
        setBudgets({});
        setHasHouseholdSetup(false);
        setShowSimulatedPortfolio(false);
        setActiveHubTab('MON_ESPACE');
        setCurrentScreen('C1_HUB');
        showToast(
          'Chapitre 01 : Comprendre mes dépenses',
          'Analyse des hausses Shopping (+43 %), opérations à vérifier et explications du Coach.'
        );
        break;

      case 'MAITRISER':
        createOrUpdateBudget('Shopping', 1600, 80);
        setHasHouseholdSetup(false);
        setShowSimulatedPortfolio(false);
        setActiveHubTab('MON_ESPACE');
        setCurrentScreen('C1_HUB');
        showToast(
          'Chapitre 02 : Maîtriser ma situation financière',
          'Budget Shopping 1 600 DH actif, solde prévisionnel fin de mois et calendrier des charges.'
        );
        break;

      case 'EPARGNER':
        createOrUpdateBudget('Shopping', 1600, 80);
        if (savingsGoals.length === 0) {
          setSavingsGoal(DEMO_PREFILLED_SAVINGS_GOAL);
          setSavingsGoals([DEMO_PREFILLED_SAVINGS_GOAL]);
        }
        setHasSavingsGoal(true);
        setHasHouseholdSetup(false);
        setShowSimulatedPortfolio(false);
        setActiveHubTab('MON_ESPACE');
        setCurrentScreen('H1_SAVINGS_GOAL');
        showToast(
          'Chapitre 03 : Épargner pour mes projets',
          'Projet Voyage (8 000 DH), versements libres et configuration de Smart Épargne.'
        );
        break;

      case 'FOYER':
        createOrUpdateBudget('Shopping', 1600, 80);
        setMainAccountBalance(43109.0);
        setIsSimpleOneScenario(true);
        setSimpleOneNotificationDismissed(false);
        setHasHouseholdSetup(true);
        setShowSimulatedPortfolio(false);
        setActiveHubTab('MON_ESPACE');
        setCurrentScreen('J1_HOUSEHOLD_SPACE');
        showToast(
          'Chapitre 04 : Gérer les dépenses de mon foyer',
          'Espace partagé avec Youssef, budget commun et division de frais.'
        );
        break;

      case 'INVESTIR':
        createOrUpdateBudget('Shopping', 1600, 80);
        setMainAccountBalance(43109.0);
        setHasHouseholdSetup(true);
        setShowSimulatedPortfolio(true);
        toggleWidgetActive('w-mes-placements', true);
        setActiveHubTab('MON_ESPACE');
        setCurrentScreen('I3_INVEST_DISCOVERY');
        showToast(
          'Chapitre 05 : Investir mon argent',
          'Simulateur pédagogique, découverte Simple Invest et portefeuille de démonstration.'
        );
        break;
    }
  };

  // Demo Presenter Controls
  const simulateNextWeek = () => {
    setSimulatedWeeksAdded((w) => w + 1);
    setChallenges((prev) =>
      prev.map((ch) => {
        if (ch.id === 'defi-shopping-1') {
          const nextWeek = Math.min(ch.totalWeeks, ch.currentWeek + 1);
          const nextPct = Math.min(100, nextWeek * 25);
          const updatedMilestones = ch.milestones.map((m, idx) =>
            idx < nextWeek ? { ...m, currentValue: 1, completed: true } : m
          );
          setShoppingChallengeCompletedWeeks(Math.min(4, ch.currentWeek));
          return {
            ...ch,
            status: nextPct >= 100 ? 'COMPLETED' : 'ACTIVE',
            currentWeek: nextWeek,
            daysRemaining: Math.max(0, ch.daysRemaining - 7),
            progressPct: nextPct,
            milestones: updatedMilestones,
          };
        }
        return ch;
      })
    );

    if (autoSavings.enabled) {
      setAutoSavings((prev) => ({
        ...prev,
        accumulatedThisMonth: prev.accumulatedThisMonth + 45,
      }));
      setSavingsGoal((prev) => {
        const updated = {
          ...prev,
          savedAmount: prev.savedAmount + 45,
        };
        setSavingsGoals((list) =>
          list.map((g) => (g.id === updated.id ? updated : g))
        );
        return updated;
      });
    }

    setMilestoneModal({
      title: 'Bravo ! Vous avez suivi votre budget pendant une semaine.',
      message:
        'Votre rythme de dépenses Shopping est parfaitement maîtrisé cette semaine. Continuez ainsi pour valider votre prochaine étape !',
      pointsEarned: 30,
      badgeName: 'Semaine Maîtrisée',
    });
    setLearningPoints((p) => p + 30);
  };

  const triggerMilestoneDemo = () => {
    setMilestoneModal({
      title: 'Bravo ! Vous avez suivi votre budget pendant une semaine.',
      message:
        'Vous avez également vérifié vos opérations récentes. Votre espace financier gagne en précision jour après jour.',
      pointsEarned: 50,
      badgeName: 'Équilibre Shopping',
    });
    setLearningPoints((p) => p + 50);
  };

  const resetAllDemoData = () => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(SAVINGS_GOALS_STORAGE_KEY);
        window.localStorage.removeItem(BUDGETS_STORAGE_KEY);
        window.localStorage.removeItem(YASMINE_ALLOWANCE_STORAGE_KEY);
        window.localStorage.removeItem(SIMPLE_ONE_FOYER_ENTRY_STORAGE_KEY);
        window.localStorage.removeItem(FOYER_AUTO_INVITE_SHOWN_STORAGE_KEY);
        window.localStorage.removeItem(HOUSEHOLD_DRAFT_STORAGE_KEY);
        window.localStorage.removeItem(WIDGETS_STORAGE_KEY);
        window.localStorage.removeItem(MON_ESPACE_SUBTAB_STORAGE_KEY);
        window.localStorage.removeItem(SUBSCRIPTIONS_STORAGE_KEY);
        window.localStorage.removeItem(IMPULSIF_COURSE_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
    setCurrentScreen('A1_HOME');
    setScreenHistory([]);
    setCourseReturnContext(null);
    setBudgetCreationOrigin(null);
    setActiveHubTab('MON_ESPACE');
    setMonEspaceSubTab('DEPENSES');
    setSubscriptionDecisions(DEFAULT_SUBSCRIPTION_DECISIONS);
    setIsDiscoverySheetOpen(false);
    setMilestoneModal(null);
    setHasCompletedOnboarding(false);
    setSelectedIntention('Comprendre mon comportement financier');
    setSelectedSubQuestion('Pourquoi mes dépenses augmentent.');
    setPeriodFilter('CE_MOIS');
    setAccountScope('TOUS_COMPTES');
    setBilanMonth('2026-10');
    setBilanAccount('TOUS_COMPTES');
    setMainAccountBalance(3075.33);
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets({});
    setChallenges(INITIAL_CHALLENGES);
    setShoppingChallengeActivatedAt(null);
    setShoppingChallengeJustActivated(false);
    setShoppingChallengePostActivationSpent(0);
    setShoppingChallengeCompletedWeeks(0);
    setShoppingChallengeOrigin('BUDGETS');
    setLearningPoints(90);
    setEarnedBadges([]);
    setCourses(INITIAL_COURSES);
    setSavingsGoals([]);
    setHasSavingsGoal(false);
    setSavingsGoal(INITIAL_SAVINGS_GOAL);
    setSuggestedGoalTag(null);
    setSuggestedGoalImageId(null);
    setSuggestedGoalTitle(null);
    setAutoSavings(INITIAL_AUTO_SAVINGS);
    setInternetBillNotificationDismissed(false);
    setIsInternetBillSplit(false);
    setIsSimpleOneScenario(false);
    setSimpleOneNotificationDismissed(false);
    setActiveHomeNotification('SIMPLE_ONE');
    setArrivedFromSimpleOneNotification(false);
    setYasmineAllowanceConfig(null);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(HOUSEHOLD_SETUP_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
    setFoyerPersonalizationDismissed(false);
    setHasShownFoyerAutoInvite(false);
    setHasHouseholdSetup(false);
    setHouseholdName('Notre foyer');
    setHouseholdCoverUrl(DEFAULT_FOYER_COVER_URL);
    setHouseholdMembers(INITIAL_HOUSEHOLD_MEMBERS);
    setHouseholdDraftMembers(INITIAL_HOUSEHOLD_DRAFT_MEMBERS);
    setSharedExpenses(INITIAL_SHARED_EXPENSES);
    setSplitRequests(INITIAL_SPLIT_REQUESTS);
    setHouseholdPockets(INITIAL_HOUSEHOLD_POCKETS);
    setSelectedPocketId('pocket-lamia');
    setFamilyAccount(INITIAL_FAMILY_ACCOUNT);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(COMMUNITIES_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
    setCommunities(INITIAL_COMMUNITIES);
    setSelectedCommunityId(INITIAL_COMMUNITIES[0]?.id || 'comm-marrakech');
    setCommunityCagnottes(INITIAL_COMMUNITY_CAGNOTTES);
    setCommunityExpenses(INITIAL_COMMUNITY_EXPENSES);
    setCommunityBalances(INITIAL_COMMUNITY_BALANCES);
    setCommunityActivities(INITIAL_COMMUNITY_ACTIVITIES);
    setShowSimulatedPortfolio(false);
    setWidgets(ALL_40_WIDGETS);
    setCoachMessages(INITIAL_COACH_MESSAGES);
    setSimulatedWeeksAdded(0);
    setCurrentDemoChapter('COMPRENDRE');
    showToast(
      'Prototype réinitialisé',
      'Toutes les données de Lamia ont été restaurées à l’état initial (aucun projet d’épargne pré-créé).'
    );
  };

  // =========================================================================
  // COMMUNITY ("COMMUNAUTÉ") STATE & INTERACTIVE ACTIONS
  // =========================================================================
  const COMMUNITIES_STORAGE_KEY = 'simple_pfm_communities_state_v1';

  const mergeById = <T extends { id: string }>(
    persistedItems: T[],
    initialItems: T[]
  ): T[] => {
    const persistedIds = new Set(persistedItems.map((item) => item.id));
    return [
      ...persistedItems,
      ...initialItems.filter((item) => !persistedIds.has(item.id)),
    ];
  };

  const loadPersistedCommunitiesState = (): {
    communities: CommunityGroup[];
    selectedCommunityId: string;
    cagnottes: CommunityCagnotte[];
    expenses: CommunitySharedExpense[];
    balances: CommunityBalanceItem[];
    activities: CommunityActivityItem[];
  } => {
    const defaultState = {
      communities: INITIAL_COMMUNITIES,
      selectedCommunityId: INITIAL_COMMUNITIES[0]?.id || 'comm-marrakech',
      cagnottes: INITIAL_COMMUNITY_CAGNOTTES,
      expenses: INITIAL_COMMUNITY_EXPENSES,
      balances: INITIAL_COMMUNITY_BALANCES,
      activities: INITIAL_COMMUNITY_ACTIVITIES,
    };

    if (typeof window === 'undefined') {
      return defaultState;
    }
    try {
      const raw = window.localStorage.getItem(COMMUNITIES_STORAGE_KEY);
      if (!raw) {
        return defaultState;
      }
      const parsed = JSON.parse(raw);
      const persistedCommunities = Array.isArray(parsed?.communities)
        ? parsed.communities
        : [];
      const mergedCommunities = mergeById(
        persistedCommunities,
        INITIAL_COMMUNITIES
      );

      const persistedCagnottes = Array.isArray(parsed?.cagnottes)
        ? parsed.cagnottes
        : [];
      const mergedCagnottes = mergeById(
        persistedCagnottes,
        INITIAL_COMMUNITY_CAGNOTTES
      );

      const persistedExpenses = Array.isArray(parsed?.expenses)
        ? parsed.expenses
        : [];
      const mergedExpenses = mergeById(
        persistedExpenses,
        INITIAL_COMMUNITY_EXPENSES
      );

      const persistedBalances = Array.isArray(parsed?.balances)
        ? parsed.balances
        : [];
      const mergedBalances = mergeById(
        persistedBalances,
        INITIAL_COMMUNITY_BALANCES
      );

      const persistedActivities = Array.isArray(parsed?.activities)
        ? parsed.activities
        : [];
      const mergedActivities = mergeById(
        persistedActivities,
        INITIAL_COMMUNITY_ACTIVITIES
      );

      return {
        communities: mergedCommunities,
        selectedCommunityId:
          typeof parsed?.selectedCommunityId === 'string' &&
          mergedCommunities.some(
            (c: CommunityGroup) => c.id === parsed.selectedCommunityId
          )
            ? parsed.selectedCommunityId
            : mergedCommunities[0]?.id || 'comm-marrakech',
        cagnottes: mergedCagnottes,
        expenses: mergedExpenses,
        balances: mergedBalances,
        activities: mergedActivities,
      };
    } catch {
      return defaultState;
    }
  };

  const persistedCommState = loadPersistedCommunitiesState();

  const [communities, setCommunities] = useState<CommunityGroup[]>(
    () => persistedCommState.communities
  );
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(
    () => persistedCommState.selectedCommunityId
  );
  const [communityCagnottes, setCommunityCagnottes] = useState<
    CommunityCagnotte[]
  >(() => persistedCommState.cagnottes);
  const [communityExpenses, setCommunityExpenses] = useState<
    CommunitySharedExpense[]
  >(() => persistedCommState.expenses);
  const [communityBalances, setCommunityBalances] = useState<
    CommunityBalanceItem[]
  >(() => persistedCommState.balances);
  const [communityActivities, setCommunityActivities] = useState<
    CommunityActivityItem[]
  >(() => persistedCommState.activities);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (communities.length > 0) {
        window.localStorage.setItem(
          COMMUNITIES_STORAGE_KEY,
          JSON.stringify({
            communities,
            selectedCommunityId,
            cagnottes: communityCagnottes,
            expenses: communityExpenses,
            balances: communityBalances,
            activities: communityActivities,
          })
        );
      } else {
        window.localStorage.removeItem(COMMUNITIES_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [
    communities,
    selectedCommunityId,
    communityCagnottes,
    communityExpenses,
    communityBalances,
    communityActivities,
  ]);

  const contributeToCagnotte = (
    cagnotteId: string,
    amount: number,
    note?: string
  ) => {
    const cleanAmount = Math.round(amount);
    if (cleanAmount <= 0) return;

    const targetCag = communityCagnottes.find((c) => c.id === cagnotteId);
    if (!targetCag) return;

    setMainAccountBalance((prev) => Math.max(0, Number((prev - cleanAmount).toFixed(2))));

    setCommunityCagnottes((prev) =>
      prev.map((c) => {
        if (c.id !== cagnotteId) return c;
        const newCollected = c.collectedAmount + cleanAmount;
        const alreadyContributed = c.contributions.some((item) =>
          item.participantName.toLowerCase().includes('lamia')
        );
        return {
          ...c,
          collectedAmount: newCollected,
          contributorsCount: alreadyContributed
            ? c.contributorsCount
            : Math.min(c.totalMembersCount, c.contributorsCount + 1),
          status: newCollected >= c.targetAmount ? 'COMPLETED' : 'ACTIVE',
          contributions: [
            {
              id: `cc-${Date.now()}`,
              participantName: 'Lamia (Vous)',
              avatarUrl: LAMIA_AVATAR_URL,
              avatarInitials: 'L',
              amount: cleanAmount,
              date: 'Aujourd’hui',
              note: note?.trim() || undefined,
            },
            ...c.contributions,
          ],
        };
      })
    );

    setCommunityActivities((prev) => [
      {
        id: `cact-${Date.now()}`,
        communityId: targetCag.communityId,
        communityName: targetCag.communityName,
        type: 'CAGNOTTE_CONTRIBUTION',
        actorName: 'Lamia (Vous)',
        avatarUrl: LAMIA_AVATAR_URL,
        avatarInitials: 'L',
        title: `Participation à « ${targetCag.title} »`,
        subtitle: `À l’instant · ${targetCag.communityName}`,
        amount: cleanAmount,
        date: 'Aujourd’hui',
        isPositive: true,
      },
      ...prev,
    ]);

    showToast(
      `+${formatDH(cleanAmount)} versés dans la cagnotte`,
      `Votre participation à « ${targetCag.title} » a bien été enregistrée.`
    );
  };

  const createCommunityCagnotte = (data: {
    communityId: string;
    title: string;
    description: string;
    targetAmount: number;
    deadline: string;
    imageUrl?: string;
    initialContribution?: number;
  }) => {
    const comm =
      communities.find((c) => c.id === data.communityId) || communities[0];
    const initAmt = Math.max(0, Math.round(data.initialContribution || 0));

    if (initAmt > 0) {
      setMainAccountBalance((prev) =>
        Math.max(0, Number((prev - initAmt).toFixed(2)))
      );
    }

    const newCagnotte: CommunityCagnotte = {
      id: `cag-${Date.now()}`,
      communityId: comm.id,
      communityName: comm.name,
      title: data.title.trim(),
      description:
        data.description.trim() ||
        `Cagnotte collective créée pour la communauté ${comm.name}.`,
      collectedAmount: initAmt,
      targetAmount: Math.max(100, Math.round(data.targetAmount)),
      deadline: data.deadline || 'Décembre 2026',
      imageUrl: data.imageUrl || comm.coverUrl,
      contributorsCount: initAmt > 0 ? 1 : 0,
      totalMembersCount: comm.members.length,
      status: 'ACTIVE',
      contributions:
        initAmt > 0
          ? [
              {
                id: `cc-init-${Date.now()}`,
                participantName: 'Lamia (Vous)',
                avatarUrl: LAMIA_AVATAR_URL,
                avatarInitials: 'L',
                amount: initAmt,
                date: 'Aujourd’hui',
                note: 'Ouverture de la cagnotte ✨',
              },
            ]
          : [],
    };

    setCommunityCagnottes((prev) => [newCagnotte, ...prev]);

    setCommunityActivities((prev) => [
      {
        id: `cact-${Date.now()}`,
        communityId: comm.id,
        communityName: comm.name,
        type: 'CAGNOTTE_CONTRIBUTION',
        actorName: 'Lamia (Vous)',
        avatarUrl: LAMIA_AVATAR_URL,
        avatarInitials: 'L',
        title: `Nouvelle cagnotte créée : « ${newCagnotte.title} »`,
        subtitle: `Objectif ${formatDH(newCagnotte.targetAmount)} · ${comm.name}`,
        amount: initAmt > 0 ? initAmt : undefined,
        date: 'Aujourd’hui',
        isPositive: true,
      },
      ...prev,
    ]);

    showToast(
      'Cagnotte commune créée',
      `« ${newCagnotte.title} » est active dans ${comm.name}.`
    );
  };

  const addCommunitySharedExpense = (data: {
    communityId: string;
    title: string;
    category: SpendingCategory;
    totalAmount: number;
    paidByName: string;
    date?: string;
    splitMode: 'EQUAL' | 'CUSTOM' | 'PERCENTAGE';
    shares: {
      participantId: string;
      participantName: string;
      avatarInitials: string;
      avatarUrl?: string;
      amount: number;
    }[];
  }) => {
    const comm =
      communities.find((c) => c.id === data.communityId) || communities[0];
    const cleanTotal = Math.round(data.totalAmount);
    const paidByLamia = data.paidByName.toLowerCase().includes('lamia');

    const formattedShares = data.shares.map((s) => {
      const isPayer =
        (paidByLamia && s.participantName.toLowerCase().includes('lamia')) ||
        (!paidByLamia &&
          s.participantName.toLowerCase() === data.paidByName.toLowerCase());
      return {
        ...s,
        status: (isPayer ? 'PAID' : 'PENDING') as 'PAID' | 'PENDING',
      };
    });

    const newExp: CommunitySharedExpense = {
      id: `cexp-${Date.now()}`,
      communityId: comm.id,
      communityName: comm.name,
      title: data.title.trim(),
      category: data.category,
      date: data.date?.trim() || 'Aujourd’hui',
      totalAmount: cleanTotal,
      paidById: paidByLamia ? 'cm-lamia' : 'cm-other',
      paidByName: paidByLamia ? 'Lamia (Vous)' : data.paidByName,
      splitMode: data.splitMode,
      shares: formattedShares,
    };

    setCommunityExpenses((prev) => [newExp, ...prev]);

    // Update balances based on who paid
    if (paidByLamia) {
      const newBalanceItems: CommunityBalanceItem[] = formattedShares
        .filter((s) => !s.participantName.toLowerCase().includes('lamia') && s.amount > 0)
        .map((s, idx) => ({
          id: `cbal-${Date.now()}-${idx}`,
          communityId: comm.id,
          communityName: comm.name,
          participantId: s.participantId,
          participantName: s.participantName,
          avatarUrl: s.avatarUrl,
          avatarInitials: s.avatarInitials,
          direction: 'OWES_YOU',
          amount: s.amount,
          contextLabel: newExp.title,
          status: 'PENDING',
        }));
      setCommunityBalances((prev) => [...newBalanceItems, ...prev]);
    } else {
      const lamiaShare = formattedShares.find((s) =>
        s.participantName.toLowerCase().includes('lamia')
      );
      if (lamiaShare && lamiaShare.amount > 0) {
        const newBal: CommunityBalanceItem = {
          id: `cbal-${Date.now()}`,
          communityId: comm.id,
          communityName: comm.name,
          participantId: 'cm-other',
          participantName: data.paidByName,
          avatarInitials: data.paidByName.charAt(0).toUpperCase(),
          direction: 'YOU_OWE',
          amount: lamiaShare.amount,
          contextLabel: newExp.title,
          status: 'PENDING',
        };
        setCommunityBalances((prev) => [newBal, ...prev]);
      }
    }

    setCommunityActivities((prev) => [
      {
        id: `cact-${Date.now()}`,
        communityId: comm.id,
        communityName: comm.name,
        type: 'SHARED_EXPENSE',
        actorName: paidByLamia ? 'Lamia (Vous)' : data.paidByName,
        avatarUrl: paidByLamia ? LAMIA_AVATAR_URL : undefined,
        avatarInitials: paidByLamia ? 'L' : data.paidByName.charAt(0).toUpperCase(),
        title: `Dépense partagée : ${newExp.title}`,
        subtitle: `À l’instant · Divisé entre ${formattedShares.length} participants`,
        amount: cleanTotal,
        date: 'Aujourd’hui',
        isPositive: false,
      },
      ...prev,
    ]);

    showToast(
      'Dépense partagée ajoutée',
      `${formatDH(cleanTotal)} répartis entre ${formattedShares.length} membres (${comm.name}).`
    );
  };

  const settleCommunityBalance = (balanceId: string) => {
    const bal = communityBalances.find((b) => b.id === balanceId);
    if (!bal || bal.status === 'SETTLED') return;

    if (bal.direction === 'YOU_OWE') {
      setMainAccountBalance((prev) =>
        Math.max(0, Number((prev - bal.amount).toFixed(2)))
      );
    } else {
      setMainAccountBalance((prev) => Number((prev + bal.amount).toFixed(2)));
    }

    setCommunityBalances((prev) =>
      prev.map((b) => (b.id === balanceId ? { ...b, status: 'SETTLED' } : b))
    );

    // Also mark corresponding expense share as PAID if matching contextLabel
    setCommunityExpenses((prev) =>
      prev.map((exp) => {
        if (exp.title !== bal.contextLabel) return exp;
        return {
          ...exp,
          shares: exp.shares.map((sh) => {
            if (
              bal.direction === 'OWES_YOU' &&
              sh.participantName === bal.participantName
            ) {
              return { ...sh, status: 'PAID' };
            }
            if (
              bal.direction === 'YOU_OWE' &&
              sh.participantName.toLowerCase().includes('lamia')
            ) {
              return { ...sh, status: 'PAID' };
            }
            return sh;
          }),
        };
      })
    );

    setCommunityActivities((prev) => [
      {
        id: `cact-${Date.now()}`,
        communityId: bal.communityId,
        communityName: bal.communityName,
        type: 'SETTLEMENT',
        actorName:
          bal.direction === 'YOU_OWE' ? 'Lamia (Vous)' : bal.participantName,
        avatarUrl:
          bal.direction === 'YOU_OWE' ? LAMIA_AVATAR_URL : bal.avatarUrl,
        avatarInitials:
          bal.direction === 'YOU_OWE' ? 'L' : bal.avatarInitials,
        title:
          bal.direction === 'YOU_OWE'
            ? `Vous avez remboursé ${bal.participantName}`
            : `${bal.participantName} vous a réglé sa part`,
        subtitle: `À l’instant · ${bal.contextLabel}`,
        amount: bal.amount,
        date: 'Aujourd’hui',
        isPositive: bal.direction === 'OWES_YOU',
      },
      ...prev,
    ]);

    showToast(
      bal.direction === 'YOU_OWE'
        ? `Remboursement envoyé (${formatDH(bal.amount)})`
        : `Règlement reçu (${formatDH(bal.amount)})`,
      bal.direction === 'YOU_OWE'
        ? `Votre solde envers ${bal.participantName} est désormais réglé.`
        : `Le remboursement de ${bal.participantName} a été comptabilisé.`
    );
  };

  const remindCommunityBalance = (balanceId: string) => {
    const bal = communityBalances.find((b) => b.id === balanceId);
    if (!bal) return;
    showToast(
      `Rappel bienveillant envoyé à ${bal.participantName}`,
      `Notification Simple envoyée pour « ${bal.contextLabel} » (${formatDH(bal.amount)}).`
    );
  };

  const createCommunityGroup = (data: {
    name: string;
    subtitle: string;
    categoryTag: CommunityCategoryTag;
    coverUrl: string;
    memberNames: string[];
  }) => {
    const newId = `comm-${Date.now()}`;
    const membersList = [
      {
        id: 'cm-lamia',
        name: 'Lamia',
        role: 'Organisatrice' as const,
        avatarUrl: LAMIA_AVATAR_URL,
        avatarInitials: 'L',
        isCurrentUser: true,
        authorizedActivity: true,
      },
      ...data.memberNames
        .filter((n) => n.trim().length > 0)
        .map((n, idx) => ({
          id: `cm-new-${Date.now()}-${idx}`,
          name: n.trim(),
          role: 'Membre' as const,
          avatarInitials: n.trim().charAt(0).toUpperCase(),
          authorizedActivity: true,
        })),
    ];

    const newGroup: CommunityGroup = {
      id: newId,
      name: data.name.trim(),
      subtitle: data.subtitle.trim() || `${membersList.length} participants`,
      categoryTag: data.categoryTag,
      coverUrl:
        data.coverUrl ||
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&auto=format&fit=crop&q=80',
      createdAt: 'Aujourd’hui',
      visibilityNote:
        'Seules les contributions aux cagnottes et les dépenses partagées du groupe sont visibles.',
      members: membersList,
    };

    setCommunities((prev) => [newGroup, ...prev]);
    setSelectedCommunityId(newId);

    setCommunityActivities((prev) => [
      {
        id: `cact-${Date.now()}`,
        communityId: newId,
        communityName: newGroup.name,
        type: 'MEMBER_JOINED',
        actorName: 'Lamia (Vous)',
        avatarUrl: LAMIA_AVATAR_URL,
        avatarInitials: 'L',
        title: `Communauté « ${newGroup.name} » créée`,
        subtitle: `${membersList.length} membres invités · Transparence activée`,
        date: 'Aujourd’hui',
        isPositive: true,
      },
      ...prev,
    ]);

    showToast(
      'Nouvelle communauté créée !',
      `« ${newGroup.name} » compte ${membersList.length} participants.`
    );
  };

  const inviteCommunityMember = (
    communityId: string,
    memberName: string,
    role: 'Membre' | 'Trésorier' = 'Membre'
  ) => {
    const cleanName = memberName.trim();
    if (!cleanName) return;

    setCommunities((prev) =>
      prev.map((c) => {
        if (c.id !== communityId) return c;
        if (
          c.members.some(
            (m) => m.name.toLowerCase() === cleanName.toLowerCase()
          )
        ) {
          return c;
        }
        return {
          ...c,
          members: [
            ...c.members,
            {
              id: `cm-inv-${Date.now()}`,
              name: cleanName,
              role,
              avatarInitials: cleanName.charAt(0).toUpperCase(),
              authorizedActivity: true,
            },
          ],
        };
      })
    );

    const targetComm = communities.find((c) => c.id === communityId);
    if (targetComm) {
      setCommunityActivities((prev) => [
        {
          id: `cact-${Date.now()}`,
          communityId: targetComm.id,
          communityName: targetComm.name,
          type: 'MEMBER_JOINED',
          actorName: cleanName,
          avatarInitials: cleanName.charAt(0).toUpperCase(),
          title: `${cleanName} a rejoint la communauté`,
          subtitle: `À l’instant · ${targetComm.name}`,
          date: 'Aujourd’hui',
          isPositive: true,
        },
        ...prev,
      ]);
    }

    showToast(
      `${cleanName} a été ajouté(e)`,
      `Invitation envoyée pour rejoindre ${targetComm?.name || 'la communauté'}.`
    );
  };

  const jumpToJourney = (
    journeyId:
      | 'J1_INSIGHT_BUDGET'
      | 'J2_CHALLENGE'
      | 'J3_LEARN'
      | 'J4_SAVINGS'
      | 'J5_INVEST'
  ) => {
    if (isR1 && ['J2_CHALLENGE', 'J3_LEARN', 'J5_INVEST'].includes(journeyId)) {
      setActiveHubTab('MON_ESPACE');
      setMonEspaceSubTab('DEPENSES');
      setCurrentScreen('C1_HUB');
      return;
    }
    setHasCompletedOnboarding(true);
    setIsDiscoverySheetOpen(false);
    if (journeyId === 'J1_INSIGHT_BUDGET') {
      setCurrentScreen('B5_FIRST_VALUE');
    } else if (journeyId === 'J2_CHALLENGE') {
      createOrUpdateBudget('Shopping', 1600, 80);
      setActiveHubTab('MES_DEFIS');
      setSelectedChallengeId('defi-shopping-1');
      setCurrentScreen('F2_CHALLENGE_DETAIL');
    } else if (journeyId === 'J3_LEARN') {
      setCourseReturnContext({
        screen: 'C1_HUB',
        category: selectedCategory,
        periodFilter,
        accountScope,
        hubTab: 'LEARN_EARN',
        monEspaceSubTab,
        scrollTop: 0,
      });
      setActiveHubTab('LEARN_EARN');
      setSelectedCourseId('course-impulsif-1');
      setCurrentScreen('G2_COURSE_DETAIL');
    } else if (journeyId === 'J4_SAVINGS') {
      if (hasSavingsGoal && savingsGoal.isCreated) {
        setCurrentScreen('H1_SAVINGS_GOAL');
      } else {
        setCurrentScreen('H0_CREATE_GOAL');
      }
    } else if (journeyId === 'J5_INVEST') {
      toggleWidgetActive('w-mes-placements', true);
      setCurrentScreen('I3_INVEST_DISCOVERY');
    }
  };

  return (
    <PFMContext.Provider
      value={{
        experienceMode,
        setExperienceMode,
        isR1,
        currentScreen,
        screenHistory,
        courseReturnContext,
        returnFromCourse,
        returnFromCategoryDetail,
        budgetCreationOrigin,
        clearBudgetCreationOrigin,
        navigateTo,
        goBack,
        activeHubTab,
        setActiveHubTab,
        monEspaceSubTab,
        setMonEspaceSubTab,
        isDiscoverySheetOpen,
        setIsDiscoverySheetOpen,
        milestoneModal,
        setMilestoneModal,
        toast,
        showToast,
        dismissToast,
        selectedIntention,
        setSelectedIntention,
        selectedSubQuestion,
        setSelectedSubQuestion,
        hasCompletedOnboarding,
        setHasCompletedOnboarding,
        extendedDataConsent,
        setExtendedDataConsent,
        periodFilter,
        setPeriodFilter,
        accountScope,
        setAccountScope,
        bilanMonth,
        setBilanMonth,
        bilanAccount,
        setBilanAccount,
        eligibleAccounts,
        bilanAnalytics,
        mainAccountBalance,
        secondaryAccountBalance,
        transactions,
        recategorizeTransaction,
        bulkVerifyTransactions,
        bulkRecategorizeTransactions,
        selectedCategory,
        setSelectedCategory,
        selectedTransactionId,
        setSelectedTransactionId,
        selectedChallengeId,
        setSelectedChallengeId,
        selectedCourseId,
        setSelectedCourseId,
        selectedWidgetId,
        setSelectedWidgetId,
        currentMonthExpenses,
        previousMonthExpenses,
        expensesVariationPct,
        identifiedIncome,
        estimatedEndOfMonthBalance,
        dailyAllowance,
        remainingDisposableIncome,
        categoryBreakdown,
        shoppingSummary,
        detectedSubscriptions,
        confirmedSubscriptions,
        pendingSubscriptions,
        confirmedSubscriptionsMonthlyTotal,
        confirmSubscription,
        dismissSubscription,
        updateSubscriptionFrequency,
        resetSubscriptionsDetection,
        budgets,
        selectedBudgetScope,
        setSelectedBudgetScope,
        createOrUpdateBudget,
        toggleBudgetTrackingStatus,
        deleteCategoryBudget,
        challenges,
        startChallenge,
        shoppingChallengeActivatedAt,
        shoppingChallengeJustActivated,
        clearShoppingChallengeJustActivated,
        shoppingChallengePostActivationSpent,
        shoppingChallengeCompletedWeeks,
        shoppingChallengeOrigin,
        setShoppingChallengeOrigin,
        simulateShoppingChallengeWeek,
        learningPoints,
        earnedBadges,
        courses,
        completeCourseStep,
        completeCourseQuiz,
        hasSavingsGoal,
        savingsGoal,
        savingsGoals,
        selectedGoalScope,
        setSelectedGoalScope,
        selectSavingsGoal,
        autoSavings,
        createSavingsGoal,
        createFullSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        toggleSavingsMethodPause,
        changeSavingsMethod,
        transferToSavingsGoal,
        updateAutoSavings,
        hasHouseholdSetup,
        householdName,
        householdCoverUrl,
        setHouseholdCoverUrl,
        householdBudget,
        householdSavingsGoal,
        householdPermissions,
        householdMembers,
        householdDraftMembers,
        setHouseholdDraftMembers,
        completeHouseholdPersonalization,
        sharedExpenses,
        splitRequests,
        setupHousehold,
        createHousehold,
        createHouseholdBudget,
        createHouseholdProject,
        saveExpenseSplit,
        simulateReceiveReimbursement,
        splitExpense,
        settleSplitRequest,
        householdPockets,
        selectedPocketId,
        setSelectedPocketId,
        fundHouseholdPocket,
        familyAccount,
        setFamilyAccount,
        fundFamilyAccount,
        showSimulatedPortfolio,
        setShowSimulatedPortfolio,
        communities,
        selectedCommunityId,
        setSelectedCommunityId,
        communityCagnottes,
        communityExpenses,
        communityBalances,
        communityActivities,
        contributeToCagnotte,
        createCommunityCagnotte,
        addCommunitySharedExpense,
        settleCommunityBalance,
        remindCommunityBalance,
        createCommunityGroup,
        inviteCommunityMember,
        internetBillNotificationDismissed,
        setInternetBillNotificationDismissed,
        isInternetBillSplit,
        setIsInternetBillSplit,
        isSimpleOneScenario,
        setIsSimpleOneScenario,
        simpleOneNotificationDismissed,
        setSimpleOneNotificationDismissed,
        activeHomeNotification,
        setActiveHomeNotification,
        arrivedFromSimpleOneNotification,
        setArrivedFromSimpleOneNotification,
        yasmineAllowanceConfig,
        saveYasmineAllowanceConfig,
        foyerPersonalizationDismissed,
        setFoyerPersonalizationDismissed,
        hasShownFoyerAutoInvite,
        setHasShownFoyerAutoInvite,
        setMainAccountBalance,
        widgets,
        activeWidgets,
        getCategoryWidgets,
        getActiveCategoryWidgets,
        getAvailableCategoryWidgets,
        toggleWidgetActive,
        moveWidgetOrder,
        coachMessages,
        askCoachQuestion,
        currentDemoChapter,
        setDemoChapter,
        simulatedWeeksAdded,
        simulateNextWeek,
        triggerMilestoneDemo,
        resetAllDemoData,
        jumpToJourney,
        suggestedGoalTag,
        setSuggestedGoalTag,
        suggestedGoalImageId,
        setSuggestedGoalImageId,
        suggestedGoalTitle,
        setSuggestedGoalTitle,
      }}
    >
      {children}
    </PFMContext.Provider>
  );
};

export const usePFM = () => {
  const ctx = useContext(PFMContext);
  if (!ctx) throw new Error('usePFM must be used within PFMProvider');
  return ctx;
};
