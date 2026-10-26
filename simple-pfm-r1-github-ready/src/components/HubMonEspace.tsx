import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  Search,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  EyeOff,
  Check,
  Landmark,
  BookOpen,
  Plane,
  Award,
  Layers,
  PieChart,
  Target,
  Info,
  ArrowRight,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  Wallet,
  PiggyBank,
  Lock,
  ShieldCheck,
  Home,
  RefreshCw,
  Clock,
  Zap,
  Repeat,
  Calendar,
  HelpCircle,
  Pencil,
  Edit3,
  Bell,
  ArrowUpDown,
  PauseCircle,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
} from 'lucide-react';
import { usePFM } from '../context/PFMContext';
import {
  CATEGORY_META,
  DEFAULT_FAMILY_SAVINGS_GOAL,
  formatDH,
  INITIAL_RECURRING_CHARGES,
  SAVINGS_PROJECT_IMAGES,
  TRAVEL_PHOTO_URL,
} from '../data/initialData';
import {
  AllowanceFrequency,
  BilanMonthKey,
  HubTab,
  MonEspaceSubTab,
  ObjectiveCategory,
  PeriodFilter,
  SavingsGoal,
  SpendingCategory,
} from '../types/pfm';
import {
  BottomBankingNav,
  CategoryIcon,
  CircularProjectsWidget,
  DreamzCircularProject,
  InteractiveDonutChart,
  MobileHeader,
  SimpleBarsIcon,
} from './SharedUI';
import {
  LearnAndEarnTabContent,
  MesDefisTabContent,
} from './ChallengesAndLearn';
import { CommunityTabContent } from './CommunityTabContent';

const DEMO_VERIFICATION_TX_IDS = [
  'tx-oct-shop-3', // Massimo Dutti Maarif — Shopping — −450 DH
  'tx-oct-shop-4', // Fnac Maroc — Shopping — −190 DH
  'tx-oct-sort-2', // Paul Bakery & Co — Sorties — −310 DH
  'tx-oct-sort-carrefour', // Carrefour Market Casablanca — Sorties — −185 DH
];

export const FinancialHubScreen: React.FC = () => {
  const {
    isR1,
    activeHubTab,
    setActiveHubTab,
    monEspaceSubTab,
    setMonEspaceSubTab,
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
    currentMonthExpenses,
    expensesVariationPct,
    identifiedIncome,
    categoryBreakdown,
    shoppingSummary,
    confirmedSubscriptions,
    pendingSubscriptions,
    confirmedSubscriptionsMonthlyTotal,
    budgets,
    toggleBudgetTrackingStatus,
    deleteCategoryBudget,
    savingsGoal,
    savingsGoals,
    selectSavingsGoal,
    hasSavingsGoal,
    hasHouseholdSetup,
    householdName,
    householdCoverUrl,
    householdBudget,
    householdMembers,
    sharedExpenses,
    splitRequests,
    simulateReceiveReimbursement,
    householdPockets,
    familyAccount,
    estimatedEndOfMonthBalance,
    dailyAllowance,
    showSimulatedPortfolio,
    setShowSimulatedPortfolio,
    widgets,
    activeWidgets,
    getActiveCategoryWidgets,
    challenges,
    startChallenge,
    shoppingChallengeActivatedAt,
    setShoppingChallengeOrigin,
    clearShoppingChallengeJustActivated,
    transactions,
    bulkVerifyTransactions,
    bulkRecategorizeTransactions,
    recategorizeTransaction,
    askCoachQuestion,
    navigateTo,
    showToast,
    dismissToast,
    isSimpleOneScenario,
    arrivedFromSimpleOneNotification,
    yasmineAllowanceConfig,
    saveYasmineAllowanceConfig,
    foyerPersonalizationDismissed,
    setFoyerPersonalizationDismissed,
    hasShownFoyerAutoInvite,
    setHasShownFoyerAutoInvite,
  } = usePFM();

  const [photoError, setPhotoError] = useState(false);
  const [selectedDonutCat, setSelectedDonutCat] =
    useState<SpendingCategory | null>(null);
  const [selectedFamilyDonutCat, setSelectedFamilyDonutCat] =
    useState<SpendingCategory | null>(null);
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [showHouseholdHowItWorks, setShowHouseholdHowItWorks] = useState(false);
  const [showSimpleOneInfo, setShowSimpleOneInfo] = useState(false);
  const [isAllowanceSheetOpen, setIsAllowanceSheetOpen] = useState(false);
  const [isFamilyBudgetsSheetOpen, setIsFamilyBudgetsSheetOpen] =
    useState(false);
  const [isYasmineDetailSheetOpen, setIsYasmineDetailSheetOpen] =
    useState(false);
  const [selectedSimpleOneChildId, setSelectedSimpleOneChildId] =
    useState<string>('draft-yasmine');
  const [isPersonalizationInviteSheetOpen, setIsPersonalizationInviteSheetOpen] =
    useState(false);
  const [allowanceAmountInput, setAllowanceAmountInput] = useState<string>('');
  const [allowanceFrequencyInput, setAllowanceFrequencyInput] =
    useState<AllowanceFrequency>('Ponctuel');
  const [allowanceValidationError, setAllowanceValidationError] =
    useState<string>('');
  const autoInviteTimerRef = useRef<number | null>(null);
  const [communityEntryCount, setCommunityEntryCount] = useState<number>(0);

  // Personal Budget Card 3-dot Menu & Confirmation Bottom Sheets
  const [openBudgetMenuCategory, setOpenBudgetMenuCategory] =
    useState<SpendingCategory | null>(null);
  const [stopConfirmCategory, setStopConfirmCategory] =
    useState<SpendingCategory | null>(null);
  const [deleteConfirmCategory, setDeleteConfirmCategory] =
    useState<SpendingCategory | null>(null);
  const [discoveryBudgetCategory, setDiscoveryBudgetCategory] =
    useState<SpendingCategory>('Shopping');
  const [isDiscoveryBudgetCatSheetOpen, setIsDiscoveryBudgetCatSheetOpen] =
    useState<boolean>(false);

  // Gamified Transaction Verification Challenge (0/3 live demo state & 3-step flow)
  const [isVerifyFlowOpen, setIsVerifyFlowOpen] = useState(false);
  const [verifyStepIndex, setVerifyStepIndex] = useState<number>(0);
  const [isCategoryPickerOpenInFlow, setIsCategoryPickerOpenInFlow] =
    useState(false);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);

  // Eligible challenge transactions (preserve order from DEMO_VERIFICATION_TX_IDS)
  const challengeTransactions = useMemo(() => {
    const byId = DEMO_VERIFICATION_TX_IDS.map((id) =>
      transactions.find((t) => t.id === id)
    ).filter((t): t is NonNullable<typeof t> => Boolean(t));

    if (byId.length >= DEMO_VERIFICATION_TX_IDS.length) {
      return byId.slice(0, DEMO_VERIFICATION_TX_IDS.length);
    }

    const extraUncertain = transactions.filter(
      (t) =>
        t.monthKey === '2026-10' &&
        t.type === 'EXPENSE' &&
        !byId.some((existing) => existing.id === t.id)
    );
    return [...byId, ...extraUncertain].slice(0, DEMO_VERIFICATION_TX_IDS.length);
  }, [transactions]);

  const verifyChallenge = useMemo(
    () => challenges.find((c) => c.id === 'defi-verifier-2'),
    [challenges]
  );

  const totalVerifyCount = challengeTransactions.length || 4;

  const verifiedCount = useMemo(() => {
    const verifiedFromList = challengeTransactions.filter(
      (tx) => tx.verifiedByUser || !tx.uncertainCategory
    ).length;
    const milestoneVal =
      verifyChallenge?.milestones.find((m) => m.id === 'mv2')?.currentValue ?? 0;
    return Math.min(totalVerifyCount, Math.max(verifiedFromList, milestoneVal));
  }, [challengeTransactions, verifyChallenge, totalVerifyCount]);

  const remainingPendingCount = Math.max(0, totalVerifyCount - verifiedCount);
  const challengeProgressPct = Math.min(
    100,
    Math.round((verifiedCount / totalVerifyCount) * 100)
  );

  const challengeEncouragementText = useMemo(() => {
    if (verifiedCount === 0) {
      return 'Votre première récompense vous attend !';
    }
    if (verifiedCount < totalVerifyCount) {
      const remaining = totalVerifyCount - verifiedCount;
      if (remaining === 1) {
        return "Vous y êtes presque ! Plus qu'un achat.";
      }
      return `Bien joué ! Plus que ${remaining} achats à vérifier.`;
    }
    return "Vous avez l'œil !";
  }, [verifiedCount, totalVerifyCount]);

  const openVerificationChallengeFlow = () => {
    const firstPendingIdx = challengeTransactions.findIndex(
      (tx) => tx.uncertainCategory && !tx.verifiedByUser
    );
    setVerifyStepIndex(firstPendingIdx >= 0 ? firstPendingIdx : 0);
    setIsCategoryPickerOpenInFlow(false);
    setShowCompletionScreen(verifiedCount >= totalVerifyCount);
    setIsVerifyFlowOpen(true);
  };

  const advanceOrFinishVerifyFlow = (justVerifiedTxId: string) => {
    // Check if any other challenge transaction remains unverified
    const nextPendingIdx = challengeTransactions.findIndex(
      (tx, idx) =>
        tx.id !== justVerifiedTxId &&
        tx.uncertainCategory &&
        !tx.verifiedByUser &&
        idx > verifyStepIndex
    );

    if (nextPendingIdx !== -1) {
      setVerifyStepIndex(nextPendingIdx);
      return;
    }

    const anyRemainingIdx = challengeTransactions.findIndex(
      (tx) =>
        tx.id !== justVerifiedTxId &&
        tx.uncertainCategory &&
        !tx.verifiedByUser
    );

    if (anyRemainingIdx !== -1) {
      setVerifyStepIndex(anyRemainingIdx);
    } else {
      setShowCompletionScreen(true);
    }
  };

  const selectableCategories: SpendingCategory[] = [
    'Shopping',
    'Sorties',
    'Courses',
    'Transport',
    'Factures',
    'Autres',
  ];

  const clearAutoInviteTimer = () => {
    if (autoInviteTimerRef.current !== null) {
      window.clearTimeout(autoInviteTimerRef.current);
      autoInviteTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (
      activeHubTab !== 'MON_ESPACE' ||
      monEspaceSubTab !== 'FOYER' ||
      hasHouseholdSetup
    ) {
      clearAutoInviteTimer();
    }
    return () => {
      clearAutoInviteTimer();
    };
  }, [activeHubTab, monEspaceSubTab, hasHouseholdSetup]);

  const openAllowanceSheet = () => {
    clearAutoInviteTimer();
    setIsPersonalizationInviteSheetOpen(false);
    setAllowanceValidationError('');
    if (yasmineAllowanceConfig && yasmineAllowanceConfig.isActive) {
      setAllowanceAmountInput(String(yasmineAllowanceConfig.referenceAmount));
      setAllowanceFrequencyInput(yasmineAllowanceConfig.frequency);
    } else {
      setAllowanceAmountInput('');
      setAllowanceFrequencyInput('Ponctuel');
    }
    setIsAllowanceSheetOpen(true);
  };

  const handleActivateAllowanceTracking = () => {
    const parsedAmount = Number(allowanceAmountInput.replace(/\s+/g, '').replace(',', '.'));
    if (!allowanceAmountInput.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setAllowanceValidationError('Veuillez saisir un montant de référence valide en DH.');
      return;
    }
    const isFirstActivation = !(yasmineAllowanceConfig && yasmineAllowanceConfig.isActive);
    saveYasmineAllowanceConfig(Math.round(parsedAmount), allowanceFrequencyInput);
    setIsAllowanceSheetOpen(false);
    setAllowanceValidationError('');
    showToast(
      'Suivi activé pour Yasmine',
      `Repère défini : ${formatDH(Math.round(parsedAmount))} (${allowanceFrequencyInput.toLowerCase()}).`
    );

    if (isFirstActivation && !hasShownFoyerAutoInvite && !hasHouseholdSetup) {
      setHasShownFoyerAutoInvite(true);
      clearAutoInviteTimer();
      autoInviteTimerRef.current = window.setTimeout(() => {
        autoInviteTimerRef.current = null;
        dismissToast();
        setIsAllowanceSheetOpen(false);
        setIsPersonalizationInviteSheetOpen(true);
      }, 1500);
    }
  };

  const tabs: { id: HubTab; label: string }[] = [
    { id: 'MON_ESPACE', label: 'Mon espace' },
    { id: 'MES_DEFIS', label: 'Mes défis' },
    { id: 'LEARN_EARN', label: 'Simple Learn' },
  ].filter((tab) => !isR1 || tab.id === 'MON_ESPACE');

  const subTabs: {
    id: MonEspaceSubTab;
    label: string;
    subtitle: string;
    imageUrl: string;
  }[] = [
    {
      id: 'DEPENSES',
      label: 'Dépenses',
      subtitle: 'Suivi & achats',
      imageUrl:
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'BUDGETS',
      label: 'Budgets',
      subtitle: 'Repères & limites',
      imageUrl:
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'PROJETS',
      label: 'Projets',
      subtitle: 'Objectifs & rêves',
      imageUrl: '/src/assets/images/travel_project_photo_1791764239686.jpg',
    },
    {
      id: 'FOYER',
      label: 'Foyer',
      subtitle: 'Vie commune',
      imageUrl: '/src/assets/images/moroccan_family_foyer_1791969781489.jpg',
    },
    {
      id: 'COMMUNAUTE',
      label: 'Communauté',
      subtitle: 'Cagnottes & frais',
      imageUrl:
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&auto=format&fit=crop&q=80',
    },
    {
      id: 'INVESTIR',
      label: 'Investir',
      subtitle: 'Long terme',
      imageUrl: '/src/assets/images/invest_lifestyle_photo_1791991053447.jpg',
    },
  ].filter((tab) => !isR1 || ['DEPENSES', 'BUDGETS', 'PROJETS'].includes(tab.id));

  const periods: { id: PeriodFilter; label: string }[] = [
    { id: 'CE_MOIS', label: 'Ce mois' },
    { id: '3_MOIS', label: '3 derniers mois' },
    { id: 'CETTE_ANNEE', label: 'Cette année' },
    { id: 'PERSONNALISEE', label: 'Personnalisée' },
  ];

  const shoppingBudget = budgets['Shopping'];
  const shoppingChallenge = challenges.find((c) => c.id === 'defi-shopping-1');
  const isShoppingChallengeActivated =
    Boolean(shoppingChallengeActivatedAt) ||
    shoppingChallenge?.status === 'ACTIVE' ||
    shoppingChallenge?.status === 'COMPLETED';
  const goalProgressPct = Math.min(
    100,
    Math.round((savingsGoal.savedAmount / savingsGoal.targetAmount) * 100)
  );

  // Render an individual widget card in Mon espace matching Reference Screen 4
  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      // WIDGET 1 — Ce mois-ci / Mon mois en bref
      case 'w-mois-bref': {
        const availableMonths: { id: BilanMonthKey; label: string }[] = [
          { id: '2026-10', label: 'Octobre 2026' },
          { id: '2026-09', label: 'Septembre 2026' },
          { id: '2026-08', label: 'Août 2026' },
        ];

        const varPct = bilanAnalytics.expensesVariationPct;
        const isIncrease = varPct !== null && varPct > 0;
        const isDecrease = varPct !== null && varPct < 0;

        const incVarPct = bilanAnalytics.incomeVariationPct;
        const isIncomeIncrease = incVarPct !== null && incVarPct > 0;
        const isIncomeDecrease = incVarPct !== null && incVarPct < 0;

        const computeMonthTotals = (mKey: BilanMonthKey) => {
          const monthTxs = transactions.filter((tx) => {
            if (tx.monthKey !== mKey) return false;
            if (tx.type === 'INTERNAL_TRANSFER') return false;
            if (bilanAccount === 'COMPTE_PRINCIPAL') {
              return tx.account === 'COMPTE_PRINCIPAL';
            }
            if (bilanAccount === 'COMPTE_SECONDAIRE') {
              return tx.account === 'COMPTE_SECONDAIRE';
            }
            if (bilanAccount === 'TOUS_COMPTES') {
              return (
                tx.account === 'COMPTE_PRINCIPAL' ||
                tx.account === 'COMPTE_SECONDAIRE'
              );
            }
            return false;
          });
          const exp = monthTxs
            .filter((t) => t.type === 'EXPENSE')
            .reduce((s, t) => s + t.amount, 0);
          const inc = monthTxs
            .filter((t) => t.type === 'INCOME')
            .reduce((s, t) => s + t.amount, 0);
          return { expenses: exp, income: inc };
        };

        const trendMonths: {
          key: BilanMonthKey;
          shortLabel: string;
          expenses: number;
          income: number;
        }[] = [
          {
            key: '2026-08',
            shortLabel: 'Août',
            ...computeMonthTotals('2026-08'),
          },
          {
            key: '2026-09',
            shortLabel: 'Sept.',
            ...computeMonthTotals('2026-09'),
          },
          {
            key: '2026-10',
            shortLabel: 'Oct.',
            ...computeMonthTotals('2026-10'),
          },
        ];

        const maxChartVal = Math.max(
          ...trendMonths.map((m) => Math.max(m.expenses, m.income)),
          12000
        );

        // Coordinates for minimalist SVG trend line (width 280, height 76)
        const chartPoints = trendMonths.map((m, idx) => {
          const x = idx === 0 ? 34 : idx === 1 ? 140 : 246;
          const ratio = Math.min(1, Math.max(0.12, m.expenses / maxChartVal));
          const y = Math.round(62 - ratio * 42);
          const incRatio = Math.min(1, Math.max(0.15, m.income / maxChartVal));
          const incY = Math.round(62 - incRatio * 42);
          return { ...m, x, y, incY };
        });

        const expenseLinePath = `M ${chartPoints[0].x} ${chartPoints[0].y} C ${
          chartPoints[0].x + 42
        } ${chartPoints[0].y}, ${chartPoints[1].x - 42} ${
          chartPoints[1].y
        }, ${chartPoints[1].x} ${chartPoints[1].y} C ${
          chartPoints[1].x + 42
        } ${chartPoints[1].y}, ${chartPoints[2].x - 42} ${
          chartPoints[2].y
        }, ${chartPoints[2].x} ${chartPoints[2].y}`;

        const expenseAreaPath = `${expenseLinePath} L ${chartPoints[2].x} 70 L ${chartPoints[0].x} 70 Z`;

        const incomeLinePath = `M ${chartPoints[0].x} ${chartPoints[0].incY} C ${
          chartPoints[0].x + 42
        } ${chartPoints[0].incY}, ${chartPoints[1].x - 42} ${
          chartPoints[1].incY
        }, ${chartPoints[1].x} ${chartPoints[1].incY} C ${
          chartPoints[1].x + 42
        } ${chartPoints[1].incY}, ${chartPoints[2].x - 42} ${
          chartPoints[2].incY
        }, ${chartPoints[2].x} ${chartPoints[2].incY}`;

        return (
          <section key={widgetId} className="card-simple p-5 space-y-4 relative">
            {/* SECTION A & B — Header + Dedicated Side-by-Side Filters Row (12px vertical gap) */}
            <div className="space-y-3">
              {/* ROW 1: Analytics icon + "Ce mois-ci" + dynamic date range subtitle */}
              <div className="flex items-center gap-3 w-full">
                <div className="w-11 h-11 rounded-2xl bg-[#F2EDFF] flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <SimpleBarsIcon size={20} />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <h3 className="text-[18px] font-extrabold text-[#14111F] leading-tight tracking-tight">
                    Ce mois-ci
                  </h3>
                  <p className="text-[12px] font-medium text-[#7D7693] mt-0.5 leading-snug">
                    {bilanAnalytics.monthDateRange}
                  </p>
                </div>
              </div>

              {/* ROW 2: [Octobre 2026 ▼] [Tous mes comptes ▼] — Strictly horizontal row (45% / 55%, 8px gap, no wrap) */}
              <div className="relative">
                <div className="flex flex-row flex-nowrap items-stretch gap-2 w-full">
                  {/* Left filter (~45%) — Period */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMonthMenuOpen((prev) => !prev);
                      setIsAccountMenuOpen(false);
                    }}
                    className="w-[45%] min-h-[36px] px-2.5 py-1.5 rounded-[12px] bg-[#F7F3FF] hover:bg-[#EFE8FF] border border-[#E9E1FA] flex items-center justify-between gap-1.5 text-left transition-colors"
                  >
                    <span className="text-[11.5px] font-bold text-[#14111F] leading-tight whitespace-nowrap">
                      {bilanAnalytics.monthLabel}
                    </span>
                    <ChevronDown
                      size={13.5}
                      className={`text-[#5E1DF0] shrink-0 transition-transform ${
                        isMonthMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Right filter (~55%) — Accounts */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsAccountMenuOpen((prev) => !prev);
                      setIsMonthMenuOpen(false);
                    }}
                    className="w-[55%] min-h-[36px] px-2.5 py-1.5 rounded-[12px] bg-[#F7F3FF] hover:bg-[#EFE8FF] border border-[#E9E1FA] flex items-center justify-between gap-1.5 text-left transition-colors"
                  >
                    <span className="text-[11.5px] font-bold text-[#14111F] leading-tight whitespace-nowrap">
                      {bilanAnalytics.accountLabel}
                    </span>
                    <ChevronDown
                      size={13.5}
                      className={`text-[#5E1DF0] shrink-0 transition-transform ${
                        isAccountMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Period Dropdown Menu */}
                {isMonthMenuOpen && (
                  <div className="mt-1.5 w-full rounded-[18px] bg-white border border-[#EFEBF8] shadow-[0_12px_28px_rgba(20,17,31,0.12)] py-1.5 z-30 divide-y divide-[#F6F3FC]">
                    {availableMonths.map((m) => {
                      const active = bilanMonth === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setBilanMonth(m.id);
                            setIsMonthMenuOpen(false);
                          }}
                          className={`w-full px-3.5 py-2 text-left text-[12px] flex items-center justify-between gap-2 transition-colors ${
                            active
                              ? 'bg-[#F5F1FF] text-[#5E1DF0] font-bold'
                              : 'text-[#14111F] font-medium hover:bg-[#FAF8FE]'
                          }`}
                        >
                          <span>{m.label}</span>
                          {active && <Check size={13} strokeWidth={2.5} />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Accounts Dropdown Menu */}
                {isAccountMenuOpen && (
                  <div className="mt-1.5 w-full rounded-[18px] bg-white border border-[#EFEBF8] shadow-[0_12px_28px_rgba(20,17,31,0.1)] py-1.5 z-30 divide-y divide-[#F6F3FC]">
                    {eligibleAccounts.map((acc) => {
                      const active = bilanAccount === acc.id;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => {
                            setBilanAccount(acc.id);
                            setIsAccountMenuOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 transition-colors ${
                            active ? 'bg-[#F5F1FF]' : 'hover:bg-[#FAF8FE]'
                          }`}
                        >
                          <div className="min-w-0">
                            <p
                              className={`text-[12px] ${
                                active
                                  ? 'font-bold text-[#5E1DF0]'
                                  : 'font-semibold text-[#14111F]'
                              }`}
                            >
                              {acc.label}
                            </p>
                            {acc.subtitle && (
                              <p className="text-[10.5px] text-[#7D7693] mt-0.5">
                                {acc.subtitle}
                              </p>
                            )}
                          </div>
                          {active && (
                            <Check
                              size={14}
                              strokeWidth={2.5}
                              className="text-[#5E1DF0] shrink-0"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION C — Main visual insight area (Minimalist Monthly Evolution Chart) */}
            <div className="rounded-[20px] bg-gradient-to-b from-[#FAF8FE] via-[#FCFBFF] to-[#FFFFFF] border border-[#EFEBF8] px-4 pt-3.5 pb-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6488]">
                  Évolution mensuelle
                </span>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-[#14111F]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E38B47]" />
                    <span>Dépenses</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#49A36D]" />
                    <span>Revenus</span>
                  </span>
                </div>
              </div>

              <div className="relative pt-1">
                <svg
                  viewBox="0 0 280 76"
                  className="w-full h-[76px] overflow-visible"
                  aria-label="Graphique d'évolution mensuelle des dépenses et revenus"
                >
                  <defs>
                    <linearGradient
                      id="simpleMonthlyExpenseGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#F3C9A5" stopOpacity="0.42" />
                      <stop offset="100%" stopColor="#F3C9A5" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Subtle horizontal baseline */}
                  <line
                    x1="14"
                    y1="70"
                    x2="266"
                    y2="70"
                    stroke="#ECE7F6"
                    strokeWidth="1"
                  />

                  {/* Subtle vertical guides per month */}
                  {chartPoints.map((pt) => (
                    <line
                      key={`guide-${pt.key}`}
                      x1={pt.x}
                      y1="14"
                      x2={pt.x}
                      y2="70"
                      stroke="#F1EDF9"
                      strokeDasharray="2 3"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Revenus reference curve */}
                  <path
                    d={incomeLinePath}
                    fill="none"
                    stroke="#49A36D"
                    strokeWidth="2.2"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                  />

                  {/* Dépenses soft area fill + smooth curve */}
                  <path
                    d={expenseAreaPath}
                    fill="url(#simpleMonthlyExpenseGrad)"
                  />
                  <path
                    d={expenseLinePath}
                    fill="none"
                    stroke="#E38B47"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                  />

                  {/* Data nodes */}
                  {chartPoints.map((pt) => {
                    const isSelectedMonth = pt.key === bilanMonth;
                    return (
                      <g key={pt.key}>
                        {isSelectedMonth && (
                          <circle
                            cx={pt.x}
                            cy={pt.incY}
                            r={6.5}
                            fill="#BFE3CB"
                            fillOpacity="0.55"
                          />
                        )}
                        <circle
                          cx={pt.x}
                          cy={pt.incY}
                          r={isSelectedMonth ? 3.8 : 3}
                          fill={isSelectedMonth ? '#49A36D' : '#FFFFFF'}
                          stroke="#49A36D"
                          strokeWidth="2"
                        />
                        {isSelectedMonth && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={8}
                            fill="#F3C9A5"
                            fillOpacity="0.5"
                          />
                        )}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isSelectedMonth ? 4.5 : 3.2}
                          fill={isSelectedMonth ? '#E38B47' : '#FFFFFF'}
                          stroke="#E38B47"
                          strokeWidth={isSelectedMonth ? 2.5 : 2}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Month labels row */}
                <div className="grid grid-cols-3 pt-1 text-center">
                  {chartPoints.map((pt) => {
                    const isSelectedMonth = pt.key === bilanMonth;
                    return (
                      <button
                        key={pt.key}
                        type="button"
                        onClick={() => setBilanMonth(pt.key)}
                        className={`text-[11px] transition-colors ${
                          isSelectedMonth
                            ? 'font-extrabold text-[#14111F]'
                            : 'font-semibold text-[#8E87A6] hover:text-[#14111F]'
                        }`}
                      >
                        {pt.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION D — Summary metrics (Two structured mini-cards) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Mini-card 1: Dépenses */}
              <div className="rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] p-3.5 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E38B47] shrink-0" />
                    <span className="text-[12.5px] font-semibold text-[#6E6488] block">
                      Dépenses
                    </span>
                  </div>
                  <p className="text-[21px] sm:text-[22px] font-extrabold text-[#14111F] tabular-nums tracking-tight mt-1.5 whitespace-nowrap truncate">
                    {formatDH(bilanAnalytics.expenses)}
                  </p>
                </div>

                {bilanAnalytics.hasPrevMonthComparison && varPct !== null ? (
                  <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-[#F1ECFA]">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isIncrease
                          ? 'bg-[#FDF1E6] text-[#E38B47]'
                          : isDecrease
                          ? 'bg-[#EAF6EE] text-[#49A36D]'
                          : 'bg-[#FDF1E6] text-[#E38B47]'
                      }`}
                    >
                      {isDecrease ? (
                        <ArrowDown size={11.5} strokeWidth={2.5} />
                      ) : isIncrease ? (
                        <ArrowUp size={11.5} strokeWidth={2.5} />
                      ) : (
                        <Minus size={11.5} strokeWidth={2.5} />
                      )}
                    </div>
                    <div className="leading-tight min-w-0">
                      <span
                        className={`text-[11.5px] font-extrabold tabular-nums block ${
                          isIncrease
                            ? 'text-[#E38B47]'
                            : isDecrease
                            ? 'text-[#49A36D]'
                            : 'text-[#E38B47]'
                        }`}
                      >
                        {varPct > 0
                          ? `+${varPct} %`
                          : varPct < 0
                          ? `${varPct} %`
                          : 'Stable'}
                      </span>
                      <span className="text-[10.5px] text-[#7D7693] truncate block">
                        vs {bilanAnalytics.prevMonthShortLabel || 'mois précédent'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#8E87A6] mt-2.5 pt-2 border-t border-[#F1ECFA] block">
                    Comparaison indisponible
                  </span>
                )}
              </div>

              {/* Mini-card 2: Revenus */}
              <div className="rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] p-3.5 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#49A36D] shrink-0" />
                    <span className="text-[12.5px] font-semibold text-[#6E6488] block">
                      Revenus
                    </span>
                  </div>
                  <p className="text-[21px] sm:text-[22px] font-extrabold text-[#14111F] tabular-nums tracking-tight mt-1.5 whitespace-nowrap truncate">
                    {formatDH(bilanAnalytics.income)}
                  </p>
                </div>

                {bilanAnalytics.hasPrevMonthIncomeComparison &&
                incVarPct !== null ? (
                  <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-[#F1ECFA]">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isIncomeDecrease
                          ? 'bg-[#FDF1E6] text-[#E38B47]'
                          : 'bg-[#EAF6EE] text-[#49A36D]'
                      }`}
                    >
                      {isIncomeIncrease ? (
                        <ArrowUp size={11.5} strokeWidth={2.5} />
                      ) : isIncomeDecrease ? (
                        <ArrowDown size={11.5} strokeWidth={2.5} />
                      ) : (
                        <Minus size={11.5} strokeWidth={2.5} />
                      )}
                    </div>
                    <div className="leading-tight min-w-0">
                      <span
                        className={`text-[11.5px] font-extrabold tabular-nums block ${
                          isIncomeDecrease
                            ? 'text-[#E38B47]'
                            : 'text-[#49A36D]'
                        }`}
                      >
                        {incVarPct > 0
                          ? `+${incVarPct} %`
                          : incVarPct < 0
                          ? `${incVarPct} %`
                          : 'Stable'}
                      </span>
                      <span className="text-[10.5px] text-[#7D7693] truncate block">
                        vs {bilanAnalytics.prevMonthShortLabel || 'mois précédent'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#8E87A6] mt-2.5 pt-2 border-t border-[#F1ECFA] block">
                    Comparaison indisponible
                  </span>
                )}
              </div>
            </div>

            {/* FOOTER CTA: Voir mon bilan */}
            <div className="pt-1 border-t border-[#F4F1FA] flex items-center justify-end">
              <button
                type="button"
                onClick={() => navigateTo('D1_EXPENSES')}
                className="text-[13px] font-bold text-[#5E1DF0] inline-flex items-center gap-1 hover:underline"
              >
                <span>Voir mon bilan</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </section>
        );
      }

      // WIDGET 2 — Mon éclairage du moment
      case 'w-insights-personnalises': {
        const diffAmount = Math.max(
          0,
          shoppingSummary.amount - shoppingSummary.prevMonthAmount
        );
        const maxCompAmount = Math.max(
          shoppingSummary.amount,
          shoppingSummary.prevMonthAmount,
          1
        );
        const currentBarPct = Math.round(
          (shoppingSummary.amount / maxCompAmount) * 100
        );
        const prevBarPct = Math.round(
          (shoppingSummary.prevMonthAmount / maxCompAmount) * 100
        );

        return (
          <section
            key={widgetId}
            className="rounded-[24px] p-4 bg-[#FFF6E8] border border-[#F3D9B1] text-[#14111F] space-y-3.5"
          >
            {/* 1. HEADER */}
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 min-w-0">
                <Sparkles
                  size={15}
                  strokeWidth={2.2}
                  className="text-[#D97928] shrink-0"
                />
                <span className="text-[12.5px] font-bold text-[#D97928] tracking-tight">
                  Éclairage du moment
                </span>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FCE7C8] text-[#C96A1B] text-[12px] font-extrabold tabular-nums shrink-0">
                <TrendingUp size={13} strokeWidth={2.4} />
                <span>+{shoppingSummary.variationPct} %</span>
              </span>
            </div>

            {/* 2. MAIN MESSAGE */}
            <h3 className="text-[17px] font-extrabold text-[#14111F] leading-snug tracking-tight">
              Vos dépenses shopping ont augmenté de {formatDH(diffAmount)}
            </h3>

            {/* 3. MINIMALIST HORIZONTAL BAR COMPARISON */}
            <div className="space-y-2 pt-0.5">
              {/* Current month */}
              <div className="grid grid-cols-[76px_1fr_auto] items-center gap-2.5">
                <span className="text-[12px] font-bold text-[#14111F] truncate">
                  Ce mois-ci
                </span>
                <div className="w-full h-2.5 rounded-full bg-[#F2E4D1] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#D97928] transition-all duration-300"
                    style={{ width: `${currentBarPct}%` }}
                  />
                </div>
                <span className="text-[12.5px] font-extrabold text-[#14111F] tabular-nums text-right min-w-[66px]">
                  {shoppingSummary.amount} DH
                </span>
              </div>

              {/* Previous month */}
              <div className="grid grid-cols-[76px_1fr_auto] items-center gap-2.5">
                <span className="text-[12px] font-medium text-[#6B5E50] truncate">
                  Septembre
                </span>
                <div className="w-full h-2.5 rounded-full bg-[#F2E4D1] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#E9C8A2] transition-all duration-300"
                    style={{ width: `${prevBarPct}%` }}
                  />
                </div>
                <span className="text-[12.5px] font-semibold text-[#6B5E50] tabular-nums text-right min-w-[66px]">
                  {shoppingSummary.prevMonthAmount} DH
                </span>
              </div>
            </div>

            {/* 4. BOTTOM ACTIONS */}
            <div className="flex flex-col items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={() =>
                  navigateTo('D2_SHOPPING_INSIGHT', { category: 'Shopping' })
                }
                className="w-full h-[42px] px-4 rounded-full bg-white hover:bg-[#FFFDF9] border border-[#F3D9B1] text-[#14111F] text-[13px] font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] whitespace-nowrap"
              >
                <span>Comprendre cette hausse</span>
                <ArrowRight
                  size={15}
                  strokeWidth={2.3}
                  className="text-[#D97928]"
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  askCoachQuestion('Pourquoi ai-je dépensé plus ?');
                  navigateTo('D4_COACH');
                }}
                className="inline-flex items-center justify-center gap-1.5 py-0.5 text-[12px] font-bold text-[#6B5E50] hover:text-[#14111F] transition-colors whitespace-nowrap"
              >
                <Sparkles size={13} className="text-[#D97928]" />
                <span>En parler au Coach</span>
              </button>
            </div>
          </section>
        );
      }

      // WIDGET 3 — Comprendre vos dépenses / Répartition
      case 'w-repartition-depenses':
        return (
          <section key={widgetId} className="card-simple p-5 space-y-4">
            <div className="flex items-center gap-3 w-full">
              <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                <PieChart size={20} strokeWidth={2.2} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="text-[17px] font-extrabold text-[#14111F] leading-tight">
                  Comprendre vos dépenses
                </h3>
                <p className="text-[12px] text-[#7D7693] mt-0.5">
                  Vos principales catégories ce mois-ci
                </p>
              </div>
            </div>

            {/* Breathable Side-by-Side Donut Chart + Full Category Name & Percentage List */}
            <div className="flex items-center gap-5 pt-1">
              <InteractiveDonutChart
                data={bilanAnalytics.categoryBreakdown}
                totalAmount={bilanAnalytics.expenses}
                selectedCategory={selectedDonutCat}
                onSelectCategory={(cat) =>
                  setSelectedDonutCat((prev) => (prev === cat ? null : cat))
                }
                size={140}
              />

              <div className="flex-1 min-w-0 space-y-2">
                {bilanAnalytics.categoryBreakdown.map((item) => {
                  const isRowSelected = selectedDonutCat === item.category;
                  const isRowDimmed =
                    Boolean(selectedDonutCat) && !isRowSelected;
                  return (
                    <button
                      key={item.category}
                      type="button"
                      onClick={() =>
                        navigateTo('D2_CATEGORY_DETAIL', {
                          category: item.category,
                        })
                      }
                      className={`w-full flex items-center justify-between gap-3 text-left px-1.5 py-0.5 rounded-xl transition-all duration-200 ${
                        isRowSelected
                          ? 'bg-[#F5F1FF] ring-1 ring-[#5E1DF0]/20'
                          : isRowDimmed
                          ? 'opacity-50 hover:opacity-90'
                          : 'hover:opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CategoryIcon category={item.category} size="sm" />
                        <span
                          className={`text-[13.5px] whitespace-nowrap ${
                            isRowSelected
                              ? 'font-extrabold text-[#5E1DF0]'
                              : 'font-semibold text-[#14111F]'
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <span
                        className={`text-[13.5px] font-extrabold tabular-nums shrink-0 text-right ${
                          isRowSelected ? 'text-[#5E1DF0]' : 'text-[#14111F]'
                        }`}
                      >
                        {item.sharePct} %
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visually Lighter & Compact Coach Insight Box */}
            <button
              type="button"
              onClick={() => navigateTo('D1_EXPENSES')}
              className="w-full rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8] px-3.5 py-2.5 flex items-center gap-2.5 text-left hover:bg-[#F3EEFF] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                <Sparkles size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-[#14111F] leading-tight">
                  Constat de votre coach
                </p>
                <p className="text-[11.5px] text-[#7D7693] mt-0.5 leading-snug">
                  Shopping et Sorties représentent la plus grande part de vos dépenses variables.
                </p>
              </div>
            </button>
          </section>
        );

      // WIDGET 4 — Mes budgets
      case 'w-budgets-categorie':
      case 'w-budget-shopping': {
        const budgetEntries = Object.entries(budgets).filter(
          ([, b]) => (b.scope || 'PERSONNEL') === 'PERSONNEL'
        );
        if (budgetEntries.length === 0) {
          return (
            <section key={widgetId} className="card-simple p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center">
                    <SlidersHorizontal size={19} />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-extrabold text-[#14111F]">
                      Mes budgets
                    </h3>
                    <p className="text-[12px] text-[#7D7693]">
                      Aucun budget configuré ce mois-ci
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-[13px] text-[#7D7693] leading-relaxed">
                Fixez une limite adaptée à vos habitudes pour mieux suivre vos dépenses.
              </p>
              <button
                type="button"
                onClick={() =>
                  navigateTo('E1_CREATE_BUDGET', {
                    category: 'Shopping',
                    budgetScope: 'PERSONNEL',
                  })
                }
                className="w-full h-[48px] rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-[14px] font-bold hover:bg-[#E6DCFF] transition-colors flex items-center justify-center gap-2"
              >
                <span>Créer mon premier budget</span>
                <ArrowRight size={16} />
              </button>
            </section>
          );
        }

        const activeCount = budgetEntries.filter(
          ([, b]) => b.status !== 'STOPPED'
        ).length;
        const stoppedCount = budgetEntries.length - activeCount;

        const allPersonalCategories: SpendingCategory[] = [
          'Shopping',
          'Sorties',
          'Courses',
          'Transport',
          'Factures',
          'Autres',
        ];
        const nextUnbudgetedCategory =
          allPersonalCategories.find((cat) => !budgets[cat]) || 'Shopping';

        return (
          <section key={widgetId} className="card-simple p-5 space-y-3.5">
            {/* 1. GLOBAL WIDGET HEADER INSIDE THE WHITE CARD */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-[17px] font-extrabold text-[#14111F] leading-tight tracking-tight">
                  Mes budgets
                </h3>
                <p className="text-[12px] font-medium text-[#7D7693] mt-0.5">
                  {activeCount} budget{activeCount > 1 ? 's' : ''} actif
                  {activeCount > 1 ? 's' : ''}
                  {stoppedCount > 0
                    ? ` · ${stoppedCount} en pause`
                    : ''}{' '}
                  · Octobre
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigateTo('E1_CREATE_BUDGET', {
                    category: nextUnbudgetedCategory,
                    budgetScope: 'PERSONNEL',
                    budgetOrigin: 'STANDARD',
                  })
                }
                className="inline-flex items-center gap-1 text-[#8000EB] hover:text-[#6E00CA] text-[12.5px] font-extrabold transition-colors active:scale-[0.98] shrink-0"
              >
                <Plus size={13} strokeWidth={2.6} />
                <span>Nouveau</span>
              </button>
            </div>

            {/* 2. COMPACT CLICKABLE BUDGET ITEMS */}
            <div className="space-y-2.5">
              {budgetEntries.map(([bKey, budgetItem]) => {
                const catData = categoryBreakdown.find(
                  (c) => c.category === budgetItem.category
                );
                const rawSpent = catData
                  ? catData.amount
                  : shoppingSummary.amount;
                const isStartingNextMonth = budgetItem.startPeriod === 'NEXT';
                const spent = isStartingNextMonth ? 0 : rawSpent;
                const limit = budgetItem.limit;
                const pct = Math.min(100, Math.round((spent / limit) * 100));

                const isStopped = budgetItem.status === 'STOPPED';
                const isOverBudget = spent > limit;
                const overrunAmount = Math.max(0, spent - limit);
                const remainingAmount = Math.max(0, limit - spent);

                return (
                  <button
                    key={bKey}
                    type="button"
                    onClick={() =>
                      navigateTo('D2_CATEGORY_DETAIL', {
                        category: budgetItem.category,
                      })
                    }
                    className="w-full rounded-[18px] bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] px-3.5 py-3 space-y-2 text-left transition-all active:scale-[0.99] group"
                  >
                    {/* 1. Single header row: small icon + full title + badge + chevron */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <CategoryIcon
                          category={budgetItem.category}
                          size="sm"
                        />
                        <span className="text-[14.5px] font-extrabold text-[#290764] group-hover:text-[#8000EB] transition-colors leading-tight whitespace-nowrap">
                          Budget {budgetItem.category}
                        </span>
                        {isStopped ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#F2EFF9] text-[#6E6785] text-[10.5px] font-bold shrink-0">
                            En pause
                          </span>
                        ) : isOverBudget ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FFF7ED] border border-[#FED7AA] text-[#B45309] text-[10.5px] font-bold shrink-0">
                            Dépassé
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E7F7F0] text-[#0F7B52] text-[10.5px] font-bold shrink-0">
                            Suivi actif
                          </span>
                        )}
                      </div>

                      <ChevronRight
                        size={15}
                        strokeWidth={2.3}
                        className="text-[#8E87A6] group-hover:text-[#8000EB] transition-colors shrink-0"
                      />
                    </div>

                    {/* 2. Single financial row: "1 850 DH" prominently on the left, "sur 1 600 DH" on the right */}
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[19px] font-extrabold text-[#14111F] tabular-nums leading-none">
                        {formatDH(spent)}
                      </span>
                      <span className="text-[12.5px] font-semibold text-[#6E6785] tabular-nums leading-none">
                        sur {formatDH(limit)}
                      </span>
                    </div>

                    {/* 3. One thin orange progress bar */}
                    <div className="w-full h-1.5 bg-[#ECE6F8] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isStopped
                            ? 'bg-[#B8B0CC]'
                            : isOverBudget
                            ? 'bg-[#F59E0B]'
                            : 'bg-[#8000EB]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* 4. One short warning / status line */}
                    <div
                      className={`flex items-center gap-1.5 text-[11.5px] font-bold tabular-nums leading-snug ${
                        isStopped
                          ? 'text-[#6E6785]'
                          : isOverBudget
                          ? 'text-[#D97706]'
                          : 'text-[#0F7B52]'
                      }`}
                    >
                      {isOverBudget && !isStopped && (
                        <AlertTriangle
                          size={12.5}
                          strokeWidth={2.4}
                          className="text-[#F59E0B] shrink-0"
                        />
                      )}
                      <span>
                        {isStartingNextMonth
                          ? `Début en novembre · ${formatDH(limit)}`
                          : isOverBudget
                          ? `+${formatDH(overrunAmount)} au-dessus du budget`
                          : remainingAmount > 0
                          ? `${formatDH(remainingAmount)} disponibles`
                          : 'Budget mensuel atteint'}
                        {isStopped ? ' · En pause' : ''}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      }

      // WIDGET — Défi recommandé (2nd widget in Budgets — hidden once activated)
      case 'w-defi-budget-recommande': {
        const activePersonalBudgets = Object.values(budgets).filter(
          (b) => (b.scope || 'PERSONNEL') === 'PERSONNEL' && b.status !== 'STOPPED'
        );
        if (activePersonalBudgets.length === 0 || isShoppingChallengeActivated) {
          return null;
        }

        const shoppingBudgetItem =
          activePersonalBudgets.find((b) => b.category === 'Shopping') ||
          activePersonalBudgets[0];
        const catData = categoryBreakdown.find(
          (c) => c.category === shoppingBudgetItem.category
        );
        const spent = catData ? catData.amount : shoppingSummary.amount;
        const limit = shoppingBudgetItem.limit;
        const potentialSavings = spent > limit ? spent - limit : 250;

        return (
          <section
            key={widgetId}
            className="rounded-[24px] p-4 bg-[#F2F8FF] border border-[#BFE0FF] shadow-[0_8px_24px_-6px_rgba(79,169,255,0.12)] space-y-3.5"
          >
            {/* 1. Small eyebrow label on top left + 2. Small chip on top right */}
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 min-w-0">
                <Target
                  size={14}
                  strokeWidth={2.3}
                  className="text-[#4FA9FF] shrink-0"
                />
                <span className="text-[11px] font-bold tracking-wide uppercase text-[#2F80ED]">
                  DÉFI RECOMMANDÉ
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#DFF0FF] border border-[#BFE0FF]/60 text-[#2F80ED] text-[11px] font-bold shrink-0 tabular-nums">
                4 semaines
              </span>
            </div>

            {/* 3. Main title & 4. Short supporting text */}
            <div className="space-y-1">
              <h3 className="text-[16px] font-extrabold text-[#14111F] leading-snug tracking-tight">
                Et si vous dépensiez {formatDH(potentialSavings)} de moins ?
              </h3>
              <p className="text-[12.5px] text-[#6E6785] leading-relaxed">
                Un petit défi pour mieux maîtriser vos achats Shopping.
              </p>
            </div>

            {/* 5. One single primary CTA at the bottom */}
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setShoppingChallengeOrigin('BUDGETS');
                  navigateTo('F4_SHOPPING_CHALLENGE');
                }}
                className="w-full h-11 px-4 rounded-full bg-white hover:bg-[#F5FAFF] text-[#2F80ED] border border-[#4FA9FF] shadow-[0_2px_8px_rgba(79,169,255,0.1)] text-[13px] font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] whitespace-nowrap"
              >
                <span>Découvrir le défi</span>
                <ArrowRight size={15} strokeWidth={2.3} />
              </button>
            </div>
          </section>
        );
      }

      // WIDGET 5 — Mes projets d'épargne (Personal circular project widget identical to Family "Nos projets")
      case 'w-projets-epargne': {
        const activeGoals = (
          savingsGoals.length > 0
            ? savingsGoals
            : hasSavingsGoal && savingsGoal.isCreated
            ? [savingsGoal]
            : []
        ).filter((g) => g.isCreated && (g.scope || 'PERSONNEL') === 'PERSONNEL');

        if (activeGoals.length === 0) {
          return (
            <section key={widgetId} className="card-simple p-5 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                  <PiggyBank size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-[16px] font-extrabold text-[#14111F]">
                    Mes projets
                  </h3>
                  <p className="text-[12px] text-[#7D7693]">
                    Aucun objectif configuré
                  </p>
                </div>
              </div>

              <p className="text-[13px] text-[#7D7693] leading-relaxed">
                Un projet en tête ? Fixez votre objectif et choisissez comment épargner pour le réaliser.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigateTo('H0_CREATE_GOAL', { goalScope: 'PERSONNEL' })
                }
                className="w-full h-[48px] rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-[14px] font-bold hover:bg-[#E6DCFF] transition-colors flex items-center justify-center gap-2"
              >
                <span>Créer votre objectif</span>
                <ArrowRight size={16} />
              </button>
            </section>
          );
        }

        return (
          <div key={widgetId} className="space-y-4">
            <CircularProjectsWidget
              title="Mes projets"
              subtitle="Épargne personnelle"
              ctaLabel="Voir mes projets →"
              goals={activeGoals}
              onCreateNew={() =>
                navigateTo('H0_CREATE_GOAL', {
                  goalScope: 'PERSONNEL',
                })
              }
              onSelectGoal={(goalId) => {
                selectSavingsGoal(goalId);
                navigateTo('H1_SAVINGS_GOAL');
              }}
            />
          </div>
        );
      }

      // WIDGET — Capacité d'épargne (PROJETS)
      case 'w-capacite-epargne': {
        return (
          <section key={widgetId} className="card-simple p-5 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                <TrendingUp size={20} strokeWidth={2.2} />
              </div>
              <div>
                <h3 className="text-[16px] font-extrabold text-[#14111F]">
                  Capacité d’épargne estimée
                </h3>
              </div>
            </div>
            <div className="p-3.5 rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#7D7693] block text-[11px]">Capacité mensuelle confortable</span>
                <span className="text-[15px] font-extrabold text-[#14111F]">
                  450 à 600 DH / mois
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#E7F7F0] text-[#0F7B52] text-[11px] font-bold">
                Indolore
              </span>
            </div>
          </section>
        );
      }

      // WIDGET — Coach financier (DÉPENSES)
      case 'w-coach-depenses':
        return (
          <section key={widgetId} className="card-simple p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                  <Sparkles size={19} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#5E1DF0] block uppercase tracking-wide">
                    Accompagnement
                  </span>
                  <h3 className="text-[16px] font-extrabold text-[#14111F]">
                    Coach financier · Dépenses
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('D4_COACH')}
                className="text-[13px] font-semibold text-[#5E1DF0] hover:underline flex items-center gap-0.5 shrink-0"
              >
                <span>Ouvrir</span>
                <ChevronRight size={14} />
              </button>
            </div>
            <p className="text-[13px] text-[#7D7693] leading-relaxed">
              Posez vos questions rapides sur l’évolution de vos dépenses du mois et obtenez des repères personnalisés.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('D4_COACH')}
              className="w-full h-11 rounded-full bg-[#F3EDFF] hover:bg-[#E7DCFF] text-[#5E1DF0] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles size={14} />
              <span>Échanger avec le Coach</span>
            </button>
          </section>
        );

      // WIDGET — Recommandations budgétaires (BUDGETS)
      case 'w-ajustements-suggeres':
        return (
          <section
            key={widgetId}
            className="card-simple p-4 space-y-3 bg-[#FAF8FE] border border-[#E8DEF8]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-[#5E1DF0] uppercase tracking-wide">
                  Conseil du Coach
                </span>
                <h4 className="text-[13px] font-extrabold text-[#14111F] leading-snug">
                  Ajustement recommandé sur Shopping
                </h4>
              </div>
            </div>
            <p className="text-[12px] text-[#7D7693] leading-relaxed">
              Vos achats Shopping atteignent 1 850 DH (+43 % vs sept.). Poser une limite à 1 600 DH vous permet de stabiliser votre fin de mois et de libérer ~250 DH pour vos projets d'épargne.
            </p>
            <button
              type="button"
              onClick={() =>
                navigateTo('E1_CREATE_BUDGET', {
                  category: 'Shopping',
                  budgetScope: 'PERSONNEL',
                })
              }
              className="text-xs font-bold text-[#5E1DF0] hover:underline flex items-center gap-1"
            >
              <span>Ajuster mon repère Shopping</span>
              <ChevronRight size={13} />
            </button>
          </section>
        );

      // WIDGET — Progression budgétaire globale (BUDGETS)
      case 'w-budget-global': {
        const personalBudgetList = Object.values(budgets).filter(
          (b) => (b.scope || 'PERSONNEL') === 'PERSONNEL'
        );
        const totalPersonalLimit = personalBudgetList.reduce(
          (sum, b) => sum + b.limit,
          0
        );
        const totalPersonalSpent = personalBudgetList.reduce((sum, b) => {
          const catData = categoryBreakdown.find((c) => c.category === b.category);
          return sum + (catData ? catData.amount : 0);
        }, 0);
        const globalPct =
          totalPersonalLimit > 0
            ? Math.min(100, Math.round((totalPersonalSpent / totalPersonalLimit) * 100))
            : 0;

        return (
          <section key={widgetId} className="card-simple p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                  <PieChart size={19} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#5E1DF0] block uppercase tracking-wide">
                    Vue globale
                  </span>
                  <h3 className="text-[16px] font-extrabold text-[#14111F]">
                    Progression budgétaire globale
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  navigateTo('E1_CREATE_BUDGET', { budgetScope: 'PERSONNEL' })
                }
                className="text-[13px] font-semibold text-[#5E1DF0] hover:underline flex items-center gap-0.5"
              >
                <span>{personalBudgetList.length > 0 ? 'Gérer' : 'Créer'}</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {personalBudgetList.length > 0 ? (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[#7D7693]">
                    Cumul sur {personalBudgetList.length} budget{personalBudgetList.length > 1 ? 's' : ''} personnel{personalBudgetList.length > 1 ? 's' : ''}
                  </span>
                  <span className="text-[15px] font-extrabold text-[#14111F] tabular-nums">
                    {formatDH(totalPersonalSpent)} / {formatDH(totalPersonalLimit)}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#EFEAFF] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5E1DF0] rounded-full transition-all"
                    style={{ width: `${globalPct}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#7D7693] leading-relaxed">
                Aucun budget personnel actif pour le moment. Créez votre premier budget pour suivre votre progression globale ici.
              </p>
            )}
          </section>
        );
      }

      // WIDGET — Alertes budgétaires (BUDGETS)
      case 'w-alertes-budgetaires': {
        const personalBudgetList = Object.values(budgets).filter(
          (b) => (b.scope || 'PERSONNEL') === 'PERSONNEL'
        );
        return (
          <section key={widgetId} className="card-simple p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                  <ShieldCheck size={19} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#5E1DF0] block uppercase tracking-wide">
                    Suivi préventif
                  </span>
                  <h3 className="text-[16px] font-extrabold text-[#14111F]">
                    Mes alertes budgétaires
                  </h3>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#F5F1FF] text-[#5E1DF0] text-[11px] font-bold">
                Seuil 80 %
              </span>
            </div>
            <p className="text-xs text-[#7D7693] leading-relaxed">
              {personalBudgetList.length > 0
                ? `Alertes actives à 80 % sur ${personalBudgetList.length} enveloppe${
                    personalBudgetList.length > 1 ? 's' : ''
                  } personnelle${personalBudgetList.length > 1 ? 's' : ''}.`
                : 'Activez un budget personnel pour recevoir une notification douce dès que 80 % de votre limite est atteinte.'}
            </p>
          </section>
        );
      }

      // WIDGETS — Personal Savings Progress & Simulations (PROJETS)
      case 'w-progression-epargne': {
        const personalGoals = savingsGoals.filter(
          (g) => g.isCreated && (g.scope || 'PERSONNEL') === 'PERSONNEL'
        );

        const DEFAULT_PERSONAL_SAVINGS_GOAL: SavingsGoal = {
          id: 'personal-demo-voyager',
          title: 'Voyager',
          subtitle: 'Projet personnel',
          description: 'Votre projet personnel d’épargne.',
          savedAmount: 0,
          targetAmount: 1555,
          deadline: 'Décembre 2026',
          imageUrl: TRAVEL_PHOTO_URL,
          isCreated: true,
          categoryTag: 'Voyage',
          scope: 'PERSONNEL',
          methodConfig: {
            type: 'ARRONDIS',
            sourceAccount: 'Compte principal Simple •• 4821',
            status: 'ACTIVE',
          },
          contributionsHistory: [],
        };

        const displayGoals =
          personalGoals.length > 0
            ? personalGoals
            : [DEFAULT_PERSONAL_SAVINGS_GOAL];

        const primaryGoal = displayGoals[0];

        return (
          <section key={widgetId} className="card-simple p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
                  <PiggyBank size={19} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-[16px] font-extrabold text-[#290764] leading-snug">
                    Mes projets
                  </h3>
                  <p className="text-[12px] text-[#7D7693] mt-0.5">
                    Épargne personnelle
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  navigateTo('H0_CREATE_GOAL', {
                    goalScope: 'PERSONNEL',
                    suggestedGoalTag: 'Voyage',
                    suggestedGoalImageId: 'travel',
                    suggestedGoalTitle: 'Voyager',
                  })
                }
                className="text-[12px] font-semibold text-[#5E1DF0] hover:underline inline-flex items-center gap-0.5 shrink-0 mt-0.5"
              >
                <span>+ Nouveau</span>
              </button>
            </div>

            {/* Dreamz-Inspired Circular Progress Project Spotlight */}
            <div className="space-y-3">
              {displayGoals.map((goal) => {
                const itemProgressPct =
                  goal.targetAmount > 0
                    ? Math.min(
                        100,
                        Math.round((goal.savedAmount / goal.targetAmount) * 100)
                      )
                    : 0;
                const itemRemaining = Math.max(
                  0,
                  goal.targetAmount - goal.savedAmount
                );

                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => {
                      selectSavingsGoal(goal.id);
                      navigateTo('H1_SAVINGS_GOAL');
                    }}
                    className="w-full p-4 rounded-[22px] bg-[#FAF8FE] hover:bg-[#F5F0FE] border border-[#EFEBF8] transition-all flex flex-col items-center text-center group active:scale-[0.99]"
                  >
                    {/* Main Visual Focus: Circular Progress Ring + Photo Inside */}
                    <div className="pt-0.5 pb-3">
                      <DreamzCircularProject
                        imageUrl={
                          goal.id === 'personal-demo-voyager' ||
                          goal.imageUrl?.includes('photo-1511671782779-c97d3d27a1d4') ||
                          goal.imageUrl?.includes('photo-1483985988355-763728e1935b')
                            ? TRAVEL_PHOTO_URL
                            : goal.imageUrl || TRAVEL_PHOTO_URL
                        }
                        title={goal.title}
                        progressPct={itemProgressPct}
                        size="widget"
                      />
                    </div>

                    {/* Project Title & Deadline */}
                    <div className="space-y-1 mt-1">
                      <h4 className="text-[16.5px] font-extrabold text-[#14111F] group-hover:text-[#8000EB] transition-colors leading-snug">
                        {goal.title}
                      </h4>
                      <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#7D7693]">
                        <Calendar size={12.5} className="text-[#8000EB]" />
                        <span>Échéance : {goal.deadline}</span>
                      </span>
                    </div>

                    {/* Financial Amounts: Saved / Target & Remaining */}
                    <div className="w-full mt-3.5 pt-3 border-t border-[#EFEBF8] flex items-center justify-between gap-2 text-left">
                      <div>
                        <span className="text-[10.5px] font-semibold text-[#7D7693] block">
                          Épargné
                        </span>
                        <p className="text-[14px] font-extrabold text-[#290764] tabular-nums mt-0.5">
                          {formatDH(goal.savedAmount)}{' '}
                          <span className="text-[12px] font-semibold text-[#7D7693]">
                            / {formatDH(goal.targetAmount)}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10.5px] font-semibold text-[#7D7693] block">
                          Reste à épargner
                        </span>
                        <p className="text-[13.5px] font-extrabold text-[#8000EB] tabular-nums mt-0.5">
                          {formatDH(itemRemaining)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom CTA */}
            <button
              type="button"
              onClick={() => {
                selectSavingsGoal(primaryGoal.id);
                navigateTo('H1_SAVINGS_GOAL');
              }}
              className="w-full h-11 rounded-full bg-[#F3EDFF] hover:bg-[#E7DCFF] text-[#5E1DF0] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
            >
              <span>Voir mes projets →</span>
            </button>
          </section>
        );
      }

      case 'w-simulateur-projet':
      case 'w-versements-programmes':
      case 'w-reserve-imprevus': {
        const wItem = widgets.find((w) => w.id === widgetId);
        return (
          <section key={widgetId} className="card-simple p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                  <Target size={19} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#5E1DF0] block uppercase tracking-wide">
                    Épargne personnelle
                  </span>
                  <h3 className="text-[16px] font-extrabold text-[#14111F]">
                    {wItem?.title || 'Simulation d’épargne'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  navigateTo('H0_CREATE_GOAL', { goalScope: 'PERSONNEL' })
                }
                className="text-[13px] font-semibold text-[#5E1DF0] hover:underline flex items-center gap-0.5"
              >
                <span>Simuler</span>
                <ChevronRight size={14} />
              </button>
            </div>
            <p className="text-xs text-[#7D7693] leading-relaxed">
              {wItem?.description}
            </p>
            {wItem?.previewMetric && (
              <div className="p-3 rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-center justify-between text-xs">
                <span className="text-[#7D7693]">Repère indicatif</span>
                <span className="font-extrabold text-[#5E1DF0] tabular-nums">
                  {wItem.previewMetric}
                </span>
              </div>
            )}
          </section>
        );
      }

      // FOYER WIDGET — Nos pockets
      case 'w-nos-pockets': {
        const pocketCardThemes = [
          {
            bg: 'linear-gradient(145deg, #F6F0FF 0%, #ECE0FF 100%)',
            border: '#DFC9FF',
            avatarBorder: '#C9A4FF',
            badgeBg: 'rgba(128, 0, 235, 0.08)',
            badgeText: '#6E11C9',
            chevronBg: 'rgba(128, 0, 235, 0.09)',
            chevronColor: '#6E11C9',
            accentDot: '#8000EB',
          },
          {
            bg: 'linear-gradient(145deg, #EEF6FF 0%, #E1EEFF 100%)',
            border: '#C8DFFF',
            avatarBorder: '#9EC5FF',
            badgeBg: 'rgba(37, 99, 235, 0.08)',
            badgeText: '#1D4ED8',
            chevronBg: 'rgba(37, 99, 235, 0.09)',
            chevronColor: '#1D4ED8',
            accentDot: '#2563EB',
          },
          {
            bg: 'linear-gradient(145deg, #FFF1F7 0%, #FFE4F0 100%)',
            border: '#F9C6DF',
            avatarBorder: '#F49AC4',
            badgeBg: 'rgba(219, 39, 119, 0.08)',
            badgeText: '#BE185D',
            chevronBg: 'rgba(219, 39, 119, 0.09)',
            chevronColor: '#BE185D',
            accentDot: '#DB2777',
          },
          {
            bg: 'linear-gradient(145deg, #EDFCF6 0%, #DCF7EC 100%)',
            border: '#B8EBD6',
            avatarBorder: '#86DFB9',
            badgeBg: 'rgba(15, 123, 82, 0.08)',
            badgeText: '#0F7B52',
            chevronBg: 'rgba(15, 123, 82, 0.09)',
            chevronColor: '#0F7B52',
            accentDot: '#0F7B52',
          },
        ];

        return (
          <section key={widgetId} className="card-simple py-4 space-y-3 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
                  <Wallet size={19} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[17px] font-extrabold text-[#14111F] leading-tight">
                    Nos pockets
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('J3_HOUSEHOLD_SETUP')}
                className="text-[12.5px] font-bold text-[#8000EB] hover:text-[#6800BF] px-2.5 py-1 rounded-full bg-[#F5F0FF] hover:bg-[#EBE0FF] transition-colors shrink-0"
              >
                + Ajouter
              </button>
            </div>

            {/* Horizontal Monzo-style pocket cards carousel */}
            <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar px-4 py-1">
              {householdPockets.map((pocket, idx) => {
                const theme = pocketCardThemes[idx % pocketCardThemes.length];
                return (
                  <button
                    key={pocket.id}
                    type="button"
                    onClick={() =>
                      navigateTo('J_POCKET_DETAIL', { pocketId: pocket.id })
                    }
                    style={{
                      background: theme.bg,
                      borderColor: theme.border,
                    }}
                    className="min-w-[144px] w-[144px] shrink-0 rounded-[20px] border p-3.5 flex flex-col justify-between text-left active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(20,17,31,0.04)] hover:shadow-[0_6px_16px_rgba(94,29,240,0.08)] group"
                  >
                    {/* Top row: Avatar + subtle tappable chevron */}
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden bg-white shrink-0 shadow-2xs"
                        style={{
                          border: `2px solid ${theme.avatarBorder}`,
                        }}
                      >
                        <img
                          src={pocket.avatarUrl}
                          alt={pocket.memberName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-0.5"
                        style={{
                          backgroundColor: theme.chevronBg,
                          color: theme.chevronColor,
                        }}
                      >
                        <ChevronRight size={14} strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* Middle: Member first name + secondary role label */}
                    <div className="mt-3 min-w-0">
                      <p className="text-[15px] font-extrabold text-[#14111F] leading-tight truncate">
                        {pocket.memberName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: theme.accentDot }}
                        />
                        <span
                          className="text-[11px] font-bold leading-tight truncate"
                          style={{ color: theme.badgeText }}
                        >
                          {pocket.roleLabel}
                        </span>
                      </div>
                    </div>

                    {/* Bottom: Available balance in DH */}
                    <div className="mt-3.5 pt-2.5 border-t border-black/[0.06]">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#62586F] block leading-none">
                        Disponible
                      </span>
                      <span className="text-[16px] font-extrabold text-[#14111F] tabular-nums tracking-tight block mt-1 leading-tight">
                        {formatDH(pocket.balance)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        );
      }

      // FOYER WIDGET — Compte Famille
      case 'w-compte-famille': {
        if (!familyAccount.exists) return null;

        return (
          <section key={widgetId} className="card-simple p-5 space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
                  <Landmark size={19} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[17px] font-extrabold text-[#14111F] leading-tight">
                    Compte Famille
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('I2_PERSONALIZE_LAYOUT')}
                className="w-8 h-8 rounded-full hover:bg-[#F5F1FF] text-[#7D7693] hover:text-[#5E1DF0] flex items-center justify-center transition-colors shrink-0"
                aria-label="Options du widget"
              >
                <MoreHorizontal size={17} />
              </button>
            </div>

            {/* Compact shared account row */}
            <button
              type="button"
              onClick={() => navigateTo('J_FAMILY_ACCOUNT')}
              className="w-full rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8] px-3.5 py-3 flex items-center justify-between gap-3 hover:bg-[#F3EEFF] active:scale-[0.99] transition-all text-left group"
            >
              <div className="min-w-0">
                <p className="text-[14.5px] font-extrabold text-[#14111F] leading-tight">
                  {familyAccount.label}
                </p>
                <span className="text-[11.5px] font-medium text-[#7D7693] block mt-0.5">
                  {familyAccount.subtitle}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <span className="text-[10.5px] font-semibold text-[#7D7693] block leading-tight">
                    Solde disponible
                  </span>
                  <span className="text-[15.5px] font-extrabold text-[#0F7B52] tabular-nums block leading-tight mt-0.5">
                    {formatDH(familyAccount.balance)}
                  </span>
                </div>
                <ChevronRight
                  size={17}
                  className="text-[#9E97B4] group-hover:text-[#5E1DF0] transition-colors"
                />
              </div>
            </button>
          </section>
        );
      }

      // FOYER WIDGET 1 — Nos dépenses (Family version of personal spending widget)
      case 'w-depenses-communes': {
        const familyCategoryBreakdown = [
          {
            category: 'Courses' as SpendingCategory,
            amount: 2600,
            prevMonthAmount: 2450,
            sharePct: 55,
            variationPct: 6,
            transactionsCount: 3,
          },
          {
            category: 'Factures' as SpendingCategory,
            amount: 1350,
            prevMonthAmount: 1350,
            sharePct: 29,
            variationPct: 0,
            transactionsCount: 2,
          },
          {
            category: 'Loisirs' as unknown as SpendingCategory,
            amount: 780,
            prevMonthAmount: 720,
            sharePct: 16,
            variationPct: 8,
            transactionsCount: 2,
          },
        ];

        return (
          <section key={widgetId} className="card-simple p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                  <PieChart size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-[17px] font-extrabold text-[#14111F] leading-tight">
                    Nos dépenses
                  </h3>
                  <p className="text-[12px] text-[#7D7693] mt-0.5">
                    Vos principales catégories du foyer ce mois-ci
                  </p>
                </div>
              </div>
            </div>

            {/* Breathable Side-by-Side Donut Chart + Full Category Name & Percentage List */}
            <div className="flex items-center gap-5 pt-1">
              <InteractiveDonutChart
                data={familyCategoryBreakdown}
                totalAmount={4730}
                selectedCategory={selectedFamilyDonutCat}
                onSelectCategory={(cat) =>
                  setSelectedFamilyDonutCat((prev) =>
                    prev === cat ? null : cat
                  )
                }
                size={140}
              />

              <div className="flex-1 min-w-0 space-y-2">
                {familyCategoryBreakdown.map((item) => {
                  const isRowSelected =
                    selectedFamilyDonutCat === item.category;
                  const isRowDimmed =
                    Boolean(selectedFamilyDonutCat) && !isRowSelected;
                  return (
                    <button
                      key={item.category}
                      type="button"
                      onClick={() => navigateTo('J1_HOUSEHOLD_SPACE')}
                      className={`w-full flex items-center justify-between gap-3 text-left px-1.5 py-0.5 rounded-xl transition-all duration-200 ${
                        isRowSelected
                          ? 'bg-[#F5F1FF] ring-1 ring-[#5E1DF0]/20'
                          : isRowDimmed
                          ? 'opacity-50 hover:opacity-90'
                          : 'hover:opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CategoryIcon category={item.category} size="sm" />
                        <span
                          className={`text-[13.5px] whitespace-nowrap ${
                            isRowSelected
                              ? 'font-extrabold text-[#5E1DF0]'
                              : 'font-semibold text-[#14111F]'
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <span
                        className={`text-[13.5px] font-extrabold tabular-nums shrink-0 text-right ${
                          isRowSelected ? 'text-[#5E1DF0]' : 'text-[#14111F]'
                        }`}
                      >
                        {item.sharePct} %
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visually Lighter & Compact Coach Insight Box */}
            <button
              type="button"
              onClick={() => navigateTo('J1_HOUSEHOLD_SPACE')}
              className="w-full rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8] px-3.5 py-2.5 flex items-center gap-2.5 text-left hover:bg-[#F3EEFF] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                <Sparkles size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-[#14111F] leading-tight">
                  Constat de votre coach
                </p>
                <p className="text-[11.5px] text-[#7D7693] mt-0.5 leading-snug">
                  Les courses représentent 55 % de vos dépenses familiales.
                </p>
              </div>
            </button>

            {/* CTA */}
            <button
              type="button"
              onClick={() => navigateTo('J1_HOUSEHOLD_SPACE')}
              className="w-full h-11 rounded-full bg-[#F3EDFF] hover:bg-[#E7DCFF] text-[#5E1DF0] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
            >
              <span>Comprendre nos dépenses →</span>
            </button>
          </section>
        );
      }

      // FOYER WIDGET 2 — Nos budgets
      case 'w-budget-familial': {
        const familyBudgetsList = [
          {
            category: 'Courses' as SpendingCategory,
            spent: 2600,
            limit: budgets['Courses_FOYER']?.limit || 3200,
            barColor: '#F59E0B',
            trackColor: '#FEF3C7',
            rowBg: 'bg-[#FFFDF9] border-[#FDEBD0]',
            pctTextColor: 'text-[#B45309]',
          },
          {
            category: 'Factures' as SpendingCategory,
            spent: 1350,
            limit: budgets['Factures_FOYER']?.limit || 1800,
            barColor: '#3B82F6',
            trackColor: '#DBEAFE',
            rowBg: 'bg-[#F8FBFF] border-[#E1EDFF]',
            pctTextColor: 'text-[#1D4ED8]',
          },
          {
            category: 'Loisirs' as SpendingCategory,
            spent: 780,
            limit:
              budgets['Loisirs_FOYER']?.limit ||
              budgets['Sorties_FOYER']?.limit ||
              1200,
            barColor: '#D946EF',
            trackColor: '#F5E8FF',
            rowBg: 'bg-[#FDF9FF] border-[#F2E4FA]',
            pctTextColor: 'text-[#A21CAF]',
          },
        ].map((item) => {
          const remaining = Math.max(0, item.limit - item.spent);
          const usedPct =
            item.limit > 0
              ? Math.min(100, Math.round((item.spent / item.limit) * 100))
              : 0;
          return {
            ...item,
            remaining,
            usedPct,
            needsWatch: usedPct >= 80,
          };
        });

        const totalFamilySpent = familyBudgetsList.reduce(
          (sum, b) => sum + b.spent,
          0
        );
        const totalFamilyLimit = familyBudgetsList.reduce(
          (sum, b) => sum + b.limit,
          0
        );
        const remainingFamilyBudget = Math.max(
          0,
          totalFamilyLimit - totalFamilySpent
        );
        const familyBudgetPct =
          totalFamilyLimit > 0
            ? Math.min(
                100,
                Math.round((totalFamilySpent / totalFamilyLimit) * 100)
              )
            : 0;

        return (
          <section key={widgetId} className="card-simple p-5 space-y-4">
            {/* 1. Header */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
                  <SlidersHorizontal size={18} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[17px] font-extrabold text-[#14111F] leading-tight">
                    Nos budgets
                  </h3>
                  <p className="text-[12px] text-[#7D7693] mt-0.5">
                    3 enveloppes · Octobre
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#F3EDFF] text-[#5E1DF0] text-[11.5px] font-extrabold tabular-nums shrink-0">
                {familyBudgetPct} % utilisés
              </span>
            </div>

            {/* 2. Global Summary */}
            <div className="rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] px-4 py-3 space-y-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <span className="text-[28px] font-extrabold text-[#0F7B52] tabular-nums leading-none tracking-tight block">
                    {formatDH(remainingFamilyBudget)}
                  </span>
                  <span className="text-[12px] font-bold text-[#14111F] mt-1 block">
                    Reste disponible
                  </span>
                </div>
                <span className="text-[11.5px] font-medium text-[#7D7693] tabular-nums text-right">
                  {formatDH(totalFamilySpent)} utilisés sur{' '}
                  {formatDH(totalFamilyLimit)}
                </span>
              </div>

              <div className="w-full h-2 bg-[#EFEAFF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8000EB] rounded-full transition-all duration-300"
                  style={{ width: `${familyBudgetPct}%` }}
                />
              </div>
            </div>

            {/* 3. Three visually distinct, compact budget rows */}
            <div className="space-y-2">
              {familyBudgetsList.map((bItem) => (
                <div
                  key={bItem.category}
                  className={`rounded-[15px] border px-3 py-2.5 space-y-1.5 ${bItem.rowBg}`}
                >
                  {/* Row top: Icon + Name (+ Amber badge) vs Remaining amount */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                      <CategoryIcon category={bItem.category} size="sm" />
                      <span className="text-[13.5px] font-extrabold text-[#14111F] leading-snug">
                        {bItem.category}
                      </span>
                      {bItem.needsWatch && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-[10px] font-bold leading-tight shrink-0">
                          À surveiller
                        </span>
                      )}
                    </div>

                    <span className="text-[13.5px] font-extrabold text-[#0F7B52] tabular-nums shrink-0">
                      {formatDH(bItem.remaining)} restants
                    </span>
                  </div>

                  {/* Thin colored progress bar */}
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden"
                    style={{ backgroundColor: bItem.trackColor }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${bItem.usedPct}%`,
                        backgroundColor: bItem.barColor,
                      }}
                    />
                  </div>

                  {/* Row bottom: Spent / limit & percentage used */}
                  <div className="flex items-center justify-between gap-2 text-[11px] tabular-nums">
                    <span className="font-medium text-[#7D7693]">
                      {bItem.spent.toLocaleString('fr-FR')} /{' '}
                      {formatDH(bItem.limit)}
                    </span>
                    <span className={`font-bold ${bItem.pctTextColor}`}>
                      {bItem.usedPct} %
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 4. CTA */}
            <button
              type="button"
              onClick={() => navigateTo('J4_FAMILY_BUDGETS')}
              className="w-full h-11 rounded-full bg-[#F3EDFF] hover:bg-[#E7DCFF] text-[#5E1DF0] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
            >
              <span>Voir nos budgets →</span>
            </button>
          </section>
        );
      }

      // FOYER WIDGET 3 — Yasmine · Simple One
      case 'w-foyer-simple-one': {
        if (!hasHouseholdSetup) {
          if (yasmineAllowanceConfig && yasmineAllowanceConfig.isActive) {
            return (
              <section
                key={widgetId}
                className="card-simple p-5 space-y-3.5 border border-[#E4D8FC]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#5E1DF0] block">
                      SIMPLE ONE
                    </span>
                    <h3 className="text-[16px] font-extrabold text-[#14111F] leading-snug mt-0.5">
                      Argent de poche · Yasmine
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#E7F7F0] text-[#0F7B52] text-[11px] font-bold shrink-0">
                    Suivi activé
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8]">
                    <span className="text-[11px] text-[#7D7693] block">
                      Montant de référence
                    </span>
                    <span className="text-[16px] font-extrabold text-[#14111F] tabular-nums mt-0.5 block">
                      {formatDH(yasmineAllowanceConfig.referenceAmount)}
                    </span>
                  </div>
                  <div className="p-3 rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8]">
                    <span className="text-[11px] text-[#7D7693] block">
                      Fréquence
                    </span>
                    <span className="text-[15px] font-extrabold text-[#5E1DF0] mt-0.5 block">
                      {yasmineAllowanceConfig.frequency}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F2EFFA] flex items-center justify-between gap-2">
                  <span className="text-[12px] font-medium text-[#7D7693]">
                    Dernier virement Simple One :{' '}
                    <strong className="text-[#14111F] font-bold">300 DH</strong>
                  </span>
                  <button
                    type="button"
                    onClick={openAllowanceSheet}
                    className="text-[12px] font-semibold text-[#5E1DF0] hover:text-[#290764] transition-colors shrink-0"
                  >
                    Modifier mes repères
                  </button>
                </div>
              </section>
            );
          }

          return (
            <section
              key={widgetId}
              className="card-simple p-5 space-y-3.5 border border-[#E4D8FC]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold tracking-widest uppercase text-[#5E1DF0]">
                  SIMPLE ONE
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#F5F1FF] text-[#5E1DF0] text-[11px] font-bold">
                  Dernier virement : 300 DH
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-[16px] font-extrabold text-[#14111F] leading-snug">
                  L&apos;argent de poche de Yasmine
                </h3>
                <p className="text-[13px] text-[#7D7693] leading-relaxed">
                  Définissez quelques repères pour l&apos;accompagner au quotidien.
                </p>
              </div>

              <button
                type="button"
                onClick={openAllowanceSheet}
                className="w-full h-11 rounded-full btn-simple-primary text-[13px] font-bold flex items-center justify-center gap-2 shadow-2xs"
              >
                <span>Définir mes repères</span>
                <ArrowRight size={15} strokeWidth={2.3} />
              </button>
            </section>
          );
        }

        const childMembers = householdMembers.filter(
          (m) =>
            m.id === 'draft-yasmine' ||
            m.name.toLowerCase().includes('yasmine') ||
            ['Simple One', 'Fille', 'Fils', 'Enfant'].includes(m.role)
        );

        const effectiveChildren =
          childMembers.length > 0
            ? childMembers
            : [
                {
                  id: 'draft-yasmine',
                  name: 'Yasmine',
                  role: 'Simple One',
                  avatarInitials: 'Y',
                  joinedDate: 'Membre du foyer',
                  photoUrl:
                    '/src/assets/images/portrait_yasmine_teen_1791972719154.jpg',
                },
              ];

        const activeChild =
          effectiveChildren.find((c) => c.id === selectedSimpleOneChildId) ||
          effectiveChildren[0];

        const isYasmineSelected =
          activeChild.id === 'draft-yasmine' ||
          activeChild.name.toLowerCase().includes('yasmine');

        const monthlyAllowance = isYasmineSelected
          ? yasmineAllowanceConfig?.isActive &&
            yasmineAllowanceConfig.referenceAmount > 0
            ? yasmineAllowanceConfig.referenceAmount
            : 300
          : 250;
        const childSpent = isYasmineSelected ? 120 : 80;
        const childAvailable = Math.max(0, monthlyAllowance - childSpent);
        const childSpentPct = Math.min(
          100,
          Math.round((childSpent / (monthlyAllowance || 1)) * 100)
        );
        const childPortraitUrl =
          activeChild.photoUrl ||
          (isYasmineSelected
            ? '/src/assets/images/portrait_yasmine_teen_1791972719154.jpg'
            : '/src/assets/images/portrait_amine_son_1791972720121.jpg');

        return (
          <section key={widgetId} className="card-simple p-5 space-y-4">
            {/* 1. Header — One clean, aligned row */}
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[17px] font-extrabold text-[#14111F] leading-tight">
                Suivi Simple One
              </h3>
              <button
                type="button"
                onClick={() => navigateTo('J3_HOUSEHOLD_SETUP')}
                className="text-[12.5px] font-bold text-[#8000EB] hover:text-[#6800BF] transition-colors shrink-0"
              >
                + Ajouter un enfant
              </button>
            </div>

            {/* Optional child selector when multiple children have been added */}
            {effectiveChildren.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
                {effectiveChildren.map((child) => {
                  const isSelected = child.id === activeChild.id;
                  return (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => setSelectedSimpleOneChildId(child.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all shrink-0 border ${
                        isSelected
                          ? 'bg-[#F3EDFF] border-[#8000EB] text-[#290764]'
                          : 'bg-white border-[#EFEBF8] text-[#7D7693] hover:text-[#14111F]'
                      }`}
                    >
                      <span>{child.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* 2. Child Profile + Spending Metrics + Compact Progress Bar */}
            <div className="p-3.5 rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] space-y-3">
              {/* Child Portrait & Name */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-[#F3EBFF] border border-[#E4D8FC] shrink-0">
                  <img
                    src={childPortraitUrl}
                    alt={activeChild.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[15.5px] font-extrabold text-[#290764] leading-snug">
                    {activeChild.name}
                  </p>
                  <span className="text-[11.5px] font-semibold text-[#7D7693] block">
                    Carte Simple One · Octobre
                  </span>
                </div>
              </div>

              {/* Three clear metrics: Reçu, Dépensé, Disponible */}
              <div className="grid grid-cols-3 gap-2 pt-0.5 border-t border-[#EFEBF8]">
                <div className="pt-2">
                  <span className="text-[11px] font-medium text-[#7D7693] block">
                    Reçu
                  </span>
                  <span className="text-[14px] font-extrabold text-[#290764] tabular-nums mt-0.5 block">
                    {formatDH(monthlyAllowance)}
                  </span>
                </div>
                <div className="pt-2 pl-2.5 border-l border-[#EFEBF8]">
                  <span className="text-[11px] font-medium text-[#7D7693] block">
                    Dépensé
                  </span>
                  <span className="text-[14px] font-extrabold text-[#14111F] tabular-nums mt-0.5 block">
                    {formatDH(childSpent)}
                  </span>
                </div>
                <div className="pt-2 pl-2.5 border-l border-[#EFEBF8]">
                  <span className="text-[11px] font-medium text-[#7D7693] block">
                    Disponible
                  </span>
                  <span className="text-[14px] font-extrabold text-[#0F7B52] tabular-nums mt-0.5 block">
                    {formatDH(childAvailable)}
                  </span>
                </div>
              </div>

              {/* One compact spending progress bar */}
              <div className="w-full h-2 bg-[#EFEAFF] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8000EB] rounded-full transition-all duration-300"
                  style={{ width: `${childSpentPct}%` }}
                />
              </div>
            </div>

            {/* 3. Bottom CTA */}
            <button
              type="button"
              onClick={() => setIsYasmineDetailSheetOpen(true)}
              className="w-full h-11 rounded-full bg-[#F3EDFF] hover:bg-[#E7DCFF] text-[#5E1DF0] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
            >
              <span>Voir le détail →</span>
            </button>
          </section>
        );
      }

      // FOYER WIDGET 4 — Nos projets
      case 'w-projets-familiaux': {
        const householdGoals = savingsGoals.filter(
          (g) => g.isCreated && g.scope === 'FOYER'
        );

        const displayGoals =
          householdGoals.length > 0
            ? householdGoals
            : [DEFAULT_FAMILY_SAVINGS_GOAL];

        return (
          <CircularProjectsWidget
            key={widgetId}
            title="Nos projets"
            subtitle="Épargne commune de la famille"
            ctaLabel="Voir nos projets →"
            goals={displayGoals}
            onCreateNew={() =>
              navigateTo('H0_CREATE_GOAL', {
                goalScope: 'FOYER',
                suggestedGoalTag: 'Projet familial',
                suggestedGoalImageId: 'family',
                suggestedGoalTitle: 'Vacances en famille',
              })
            }
            onSelectGoal={(goalId) => {
              selectSavingsGoal(goalId);
              navigateTo('H1_SAVINGS_GOAL');
            }}
          />
        );
      }

      // FOYER ADDITIONAL WIDGETS (Contributions, Échéances, Partage)
      case 'w-partager-depense':
      case 'w-remboursements-partages':
      case 'w-repartition-contributions':
      case 'w-echeances-familiales': {
        const totalShared = sharedExpenses.reduce((sum, e) => sum + e.totalAmount, 0);
        const wItem = widgets.find((w) => w.id === widgetId);
        const pendingReqs = splitRequests.filter((r) => r.status === 'PENDING');

        return (
          <section key={widgetId} className="card-simple p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                  <Users size={19} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#5E1DF0] block">
                    Espace Foyer
                  </span>
                  <h3 className="text-[16px] font-extrabold text-[#14111F]">
                    {wItem?.title || 'Dépenses du foyer'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  navigateTo(wItem?.targetScreen || 'J1_HOUSEHOLD_SPACE')
                }
                className="text-[13px] font-semibold text-[#5E1DF0] hover:underline flex items-center gap-0.5"
              >
                <span>Ouvrir</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <p className="text-[13px] text-[#7D7693] leading-relaxed">
              {sharedExpenses.length > 0
                ? `${formatDH(totalShared)} de dépenses partagées ce mois${
                    pendingReqs.length > 0
                      ? ` · ${pendingReqs.length} remboursement(s) en attente`
                      : ''
                  }.`
                : wItem?.description ||
                  'Suivez vos frais partagés et organisez les dépenses communes du foyer.'}
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => navigateTo('J1_HOUSEHOLD_SPACE')}
                className="flex-1 h-10 rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-xs font-bold hover:bg-[#E5DCFF] transition-colors"
              >
                Voir le suivi foyer
              </button>
              <button
                type="button"
                onClick={() =>
                  navigateTo('J2_HOUSEHOLD_SPLIT', { transactionId: 'NEW_SPLIT' })
                }
                className="flex-1 h-10 rounded-full bg-[#5E1DF0] text-white text-xs font-bold hover:brightness-105 transition-all"
              >
                + Partager un frais
              </button>
            </div>
          </section>
        );
      }

      // Forecast & Recurring charges Widgets (Chapter 2)
      case 'w-reste-a-vivre': {
        return (
          <section key={widgetId} className="card-simple p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                  <TrendingUp size={20} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#5E1DF0] block uppercase tracking-wide">
                    Prévisions & Repères
                  </span>
                  <h3 className="text-[16px] font-extrabold text-[#14111F]">
                    Prévisions & Reste à vivre
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('E4_FORECAST_RECURRING')}
                className="text-[13px] font-semibold text-[#5E1DF0] hover:underline flex items-center gap-0.5"
              >
                <span>Détails</span>
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs text-[#7D7693]">Solde prévisionnel fin de mois :</span>
              <span className="text-[16px] font-extrabold text-[#14111F] tabular-nums">
                ~{formatDH(estimatedEndOfMonthBalance)}
              </span>
            </div>
            <div className="p-3 rounded-[18px] bg-[#F7F4FE] flex justify-between text-xs text-[#6B5E94]">
              <span>Reste à vivre journalier</span>
              <strong className="text-[#5E1DF0]">{formatDH(dailyAllowance)} / jour</strong>
            </div>
          </section>
        );
      }

      case 'w-abonnements': {
        const nextExpectedSub = confirmedSubscriptions[0] || null;
        const hasAnySubs =
          confirmedSubscriptions.length > 0 || pendingSubscriptions.length > 0;
        const cleanNextDate = nextExpectedSub
          ? nextExpectedSub.nextExpectedDate.replace(/^~\s*/, '')
          : '';

        return (
          <section key={widgetId} className="card-simple p-5 space-y-4">
            {/* 1. HEADER */}
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                <Repeat size={19} strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <h3 className="text-[16px] font-extrabold text-[#14111F] leading-tight">
                  Mes abonnements
                </h3>
                <p className="text-[12px] text-[#7D7693] mt-0.5 leading-snug">
                  Vos paiements réguliers, en un coup d'œil.
                </p>
              </div>
            </div>

            {/* 2. FINANCIAL SUMMARY & 3. NEXT PAYMENT */}
            {!hasAnySubs ? (
              <div className="pt-0.5 space-y-1">
                <p className="text-[13px] font-bold text-[#14111F]">
                  Aucun abonnement identifié pour le moment
                </p>
                <p className="text-[12px] text-[#7D7693] leading-relaxed">
                  Retrouvez ici vos abonnements dès qu'ils auront été identifiés.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-0.5">
                {/* MAIN SUMMARY BLOCK — Two-column container (55% / 45%) with vertical divider */}
                <div className="rounded-[20px] bg-gradient-to-br from-[#F7F4FF] via-[#FAF8FF] to-[#F3EEFF] border border-[#EAE2FA] px-4 py-3.5 flex items-stretch">
                  {/* LEFT COLUMN (55%) — Monthly cost */}
                  <div className="w-[55%] pr-3.5 flex flex-col justify-between">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#6E6488] leading-tight block text-left">
                      COÛT MENSUEL ESTIMÉ
                    </span>
                    <div className="flex-1 flex items-center justify-center py-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[30px] font-extrabold text-[#14111F] tabular-nums leading-none tracking-tight whitespace-nowrap">
                          {formatDH(confirmedSubscriptionsMonthlyTotal)}
                        </span>
                        <span className="text-[13px] font-semibold text-[#6E6488] whitespace-nowrap">
                          / mois
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN (45%) — Subscription statuses */}
                  <div className="w-[45%] pl-3.5 border-l border-[#E5DCF8] flex flex-col justify-between text-left">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#6E6488] leading-tight block">
                      ABONNEMENTS
                    </span>
                    <div className="flex-1 flex flex-col justify-center space-y-2 pt-2">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2
                          size={14}
                          strokeWidth={2.4}
                          className="text-[#169C67] shrink-0"
                        />
                        <span className="text-[12.5px] font-bold text-[#0F7B52] leading-tight">
                          {confirmedSubscriptions.length} confirmé
                          {confirmedSubscriptions.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock
                          size={14}
                          strokeWidth={2.4}
                          className="text-[#D97706] shrink-0"
                        />
                        <span className="text-[12.5px] font-bold text-[#B45309] leading-tight">
                          {pendingSubscriptions.length} à confirmer
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LEVEL 3 — Next Payment Secondary Sub-Card */}
                {nextExpectedSub && (
                  <div className="rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] p-3.5 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-[12px] bg-white border border-[#ECE6F8] text-[#5E1DF0] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Calendar size={16} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <span className="text-[11px] font-semibold text-[#7D7693] block">
                        Votre prochain paiement estimé
                      </span>
                      <p className="text-[13.5px] font-extrabold text-[#14111F] leading-snug break-words">
                        {nextExpectedSub.merchant}
                      </p>
                      <p className="text-[12px] font-bold text-[#5E1DF0] tabular-nums pt-0.5">
                        {cleanNextDate} · {formatDH(nextExpectedSub.amount)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. SOFT LAVENDER PILL CTA */}
            <button
              type="button"
              onClick={() => navigateTo('D5_SUBSCRIPTIONS_DETAIL')}
              className="w-full h-[44px] rounded-full bg-[#F3EDFF] hover:bg-[#E7DCFF] text-[#5E1DF0] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
            >
              <span>Voir mes abonnements</span>
              <ArrowRight size={15} strokeWidth={2.3} />
            </button>
          </section>
        );
      }

      // WIDGET — Mes dépenses à venir (5th widget in Budgets)
      case 'w-echeances-venir': {
        const upcomingCharges = INITIAL_RECURRING_CHARGES.filter(
          (charge) => charge.dueDay > 10
        );
        const upcomingTotal = upcomingCharges.reduce(
          (sum, c) => sum + c.amount,
          0
        );

        return (
          <section key={widgetId} className="card-simple p-5 space-y-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
                  <Calendar size={18} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-[#8000EB] block uppercase tracking-wide">
                    Échéances du mois
                  </span>
                  <h3 className="text-[16px] font-extrabold text-[#14111F] leading-tight">
                    Mes dépenses à venir
                  </h3>
                </div>
              </div>

              {upcomingCharges.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FFF7ED] text-[#B45309] text-[11px] font-bold tabular-nums shrink-0">
                  {formatDH(upcomingTotal)}
                </span>
              )}
            </div>

            {upcomingCharges.length > 0 ? (
              <div className="divide-y divide-[#F3EFFA]">
                {upcomingCharges.map((charge) => (
                  <div
                    key={charge.id}
                    className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#14111F] truncate">
                        {charge.title}
                      </p>
                      <p className="text-[11px] text-[#7D7693] mt-0.5">
                        Le {charge.dueDay} oct. · {charge.category}
                      </p>
                    </div>
                    <span className="text-[13.5px] font-extrabold text-[#14111F] tabular-nums shrink-0">
                      {formatDH(charge.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8] p-3.5 text-left">
                <p className="text-[12.5px] font-bold text-[#14111F]">
                  Aucune échéance à venir identifiée
                </p>
                <p className="text-[11.5px] text-[#7D7693] mt-0.5 leading-relaxed">
                  Vos prélèvements récurrents connus pour ce mois ont déjà été réglés.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigateTo('E4_FORECAST_RECURRING')}
              className="w-full h-11 rounded-full bg-[#F3EDFF] hover:bg-[#E7DCFF] text-[#8000EB] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
            >
              <span>Voir mes échéances →</span>
            </button>
          </section>
        );
      }

      // OPTIONAL BUDGET WIDGET 1 — Évolution de mes budgets
      case 'w-budget-global': {
        const activePersonalBudgets = Object.values(budgets).filter(
          (b) => (b.scope || 'PERSONNEL') === 'PERSONNEL' && b.status !== 'STOPPED'
        );
        const primaryBudget =
          activePersonalBudgets.find((b) => b.category === 'Shopping') ||
          activePersonalBudgets[0];
        const targetCategory: SpendingCategory =
          primaryBudget?.category || 'Shopping';
        const limit = primaryBudget?.limit || 1600;

        const computeCatMonthSpent = (mKey: BilanMonthKey) =>
          transactions
            .filter(
              (tx) =>
                tx.monthKey === mKey &&
                tx.type === 'EXPENSE' &&
                tx.category === targetCategory
            )
            .reduce((s, t) => s + t.amount, 0);

        const augVal = computeCatMonthSpent('2026-08') || 1350;
        const sepVal = computeCatMonthSpent('2026-09') || 1400;
        const octVal = computeCatMonthSpent('2026-10');
        const maxVal = Math.max(augVal, sepVal, octVal, limit, 1);

        const monthsData = [
          { label: 'Août', spent: augVal },
          { label: 'Sept.', spent: sepVal },
          { label: 'Oct.', spent: octVal },
        ];

        return (
          <section key={widgetId} className="card-simple p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
                  <TrendingUp size={18} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-[#8000EB] block uppercase tracking-wide">
                    Suivi sur 3 mois · {targetCategory}
                  </span>
                  <h3 className="text-[16px] font-extrabold text-[#14111F] leading-tight">
                    Évolution de mes budgets
                  </h3>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-[#F5F1FF] text-[#8000EB] text-[11px] font-bold tabular-nums shrink-0">
                Plafond : {formatDH(limit)}
              </span>
            </div>

            {/* Visual Bar Chart vs Budget Limit */}
            <div className="rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] px-4 pt-4 pb-3 space-y-2.5">
              <div className="grid grid-cols-3 gap-4 items-end h-[96px] pt-2">
                {monthsData.map((m) => {
                  const isOver = m.spent > limit;
                  const barHeight = Math.max(
                    16,
                    Math.round((m.spent / maxVal) * 70)
                  );
                  return (
                    <div
                      key={m.label}
                      className="flex flex-col items-center justify-end h-full"
                    >
                      <span
                        className={`text-[11px] font-extrabold tabular-nums mb-1.5 ${
                          isOver ? 'text-[#B45309]' : 'text-[#14111F]'
                        }`}
                      >
                        {formatDH(m.spent)}
                      </span>
                      <div
                        className={`w-7 rounded-t-[8px] transition-all ${
                          isOver ? 'bg-[#F59E0B]' : 'bg-[#8000EB]'
                        }`}
                        style={{ height: `${barHeight}px` }}
                      />
                      <span className="text-[11px] font-bold text-[#7D7693] mt-1.5">
                        {m.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-[#ECE6F8] flex items-center justify-between text-[11px] text-[#7D7693]">
                <span>Repère mensuel fixé</span>
                <strong className="text-[#14111F] tabular-nums">
                  {formatDH(limit)} / mois
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigateTo('D2_CATEGORY_DETAIL', { category: targetCategory })
              }
              className="w-full h-11 rounded-full bg-[#F3EDFF] hover:bg-[#E7DCFF] text-[#8000EB] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
            >
              <span>Voir mon évolution →</span>
            </button>
          </section>
        );
      }

      // OPTIONAL BUDGET WIDGET 2 — Mes alertes budget
      case 'w-alertes-budgetaires': {
        const activePersonalBudgets = Object.values(budgets).filter(
          (b) => (b.scope || 'PERSONNEL') === 'PERSONNEL' && b.status !== 'STOPPED'
        );
        const primaryBudget =
          activePersonalBudgets.find((b) => b.category === 'Shopping') ||
          activePersonalBudgets[0];

        return (
          <section key={widgetId} className="card-simple p-5 space-y-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#FFF7ED] text-[#D97706] flex items-center justify-center shrink-0">
                  <Bell size={18} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-[#B45309] block uppercase tracking-wide">
                    Seuils & Notifications
                  </span>
                  <h3 className="text-[16px] font-extrabold text-[#14111F] leading-tight">
                    Mes alertes budget
                  </h3>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full bg-[#E7F7F0] text-[#0F7B52] text-[11px] font-bold shrink-0">
                Actives
              </span>
            </div>

            <div className="divide-y divide-[#F3EFFA]">
              {activePersonalBudgets.map((bItem) => {
                const catData = categoryBreakdown.find(
                  (c) => c.category === bItem.category
                );
                const rawSpent = catData ? catData.amount : shoppingSummary.amount;
                const spent = bItem.startPeriod === 'NEXT' ? 0 : rawSpent;
                const threshold80 = Math.round(bItem.limit * 0.8);
                const isOverLimit = spent > bItem.limit;
                const isOver80 = spent >= threshold80;

                return (
                  <div
                    key={bItem.category}
                    className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#14111F] truncate">
                        Budget {bItem.category}
                      </p>
                      <p className="text-[11.5px] text-[#7D7693] tabular-nums mt-0.5">
                        Alerte 80 % dès {formatDH(threshold80)} · Plafond{' '}
                        {formatDH(bItem.limit)}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 tabular-nums ${
                        isOverLimit
                          ? 'bg-[#FFF7ED] text-[#B45309]'
                          : isOver80
                          ? 'bg-[#FEF3C7] text-[#B45309]'
                          : 'bg-[#E7F7F0] text-[#0F7B52]'
                      }`}
                    >
                      {isOverLimit
                        ? `Dépassé (+${formatDH(spent - bItem.limit)})`
                        : isOver80
                        ? 'Seuil 80 % atteint'
                        : 'Sous le seuil'}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() =>
                navigateTo('E1_CREATE_BUDGET', {
                  category: primaryBudget?.category || 'Shopping',
                  budgetScope: 'PERSONNEL',
                  budgetOrigin: 'STANDARD',
                })
              }
              className="w-full h-11 rounded-full bg-[#F3EDFF] hover:bg-[#E7DCFF] text-[#8000EB] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
            >
              <span>Gérer mes alertes →</span>
            </button>
          </section>
        );
      }

      case 'w-calendrier-financier': {
        return (
          <section key={widgetId} className="card-simple p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                  <Calendar size={19} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#5E1DF0] block uppercase tracking-wide">
                    Flux programmés
                  </span>
                  <h3 className="text-[16px] font-extrabold text-[#14111F]">
                    Mon calendrier financier
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('E4_FORECAST_RECURRING')}
                className="text-[13px] font-semibold text-[#5E1DF0] hover:underline flex items-center gap-0.5"
              >
                <span>Ouvrir</span>
                <ChevronRight size={14} />
              </button>
            </div>
            <p className="text-xs text-[#7D7693]">
              Prochain versement attendu : Salaire le 28 octobre.
            </p>
          </section>
        );
      }

      // Investment Discovery Widgets (INVESTIR)
      case 'w-mes-placements': {
        if (showSimulatedPortfolio) {
          return (
            <section key={widgetId} className="card-simple p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#5E1DF0] block uppercase">
                    Portefeuille de démonstration
                  </span>
                  <h3 className="text-[17px] font-extrabold text-[#14111F]">
                    Simple Invest Découverte
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#E7F7F0] text-[#0F7B52] text-xs font-bold">
                  +4,8 %
                </span>
              </div>

              <div className="p-4 rounded-[20px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-[#7D7693]">Valorisation simulée :</span>
                  <p className="text-[24px] font-extrabold text-[#14111F] tabular-nums mt-0.5">
                    14 500 DH
                  </p>
                </div>
                <span className="text-xs font-bold text-[#0F7B52]">+660 DH de plus-value</span>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('I3_INVEST_DISCOVERY')}
                className="w-full h-11 rounded-full btn-simple-primary text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span>Voir mon portefeuille d'investissement</span>
                <ChevronRight size={15} />
              </button>
            </section>
          );
        }

        return (
          <section key={widgetId} className="card-simple p-5 space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#5E1DF0] uppercase tracking-wide block">
                Découverte & Éducation
              </span>
              <h3 className="text-[17px] font-extrabold text-[#14111F] leading-tight">
                Faites fructifier votre épargne à votre rythme
              </h3>
            </div>

            <div className="w-full h-[152px] rounded-[18px] overflow-hidden bg-[#F5F2FA] border border-[#EFEBF8]">
              <img
                src="/src/assets/images/invest_purple_growth_illustration_1791991676392.jpg"
                alt="Faites fructifier votre épargne à votre rythme"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>

            <p className="text-[13px] text-[#7D7693] leading-relaxed">
              Découvrez comment dynamiser votre épargne grâce à une stratégie d'investissement diversifiée, accessible et orientée long terme.
            </p>

            <div className="p-3 rounded-[16px] bg-[#FFF8ED] border border-[#FED7AA] text-[11px] text-[#9A3412] leading-snug">
              Les investissements comportent des risques de perte en capital. Aucune holding active n'est détenue sur votre compte pour le moment.
            </div>

            <button
              type="button"
              onClick={() =>
                navigateTo('G2_COURSE_DETAIL', { courseId: 'course-invest-5' })
              }
              className="w-full h-12 rounded-full btn-simple-primary text-[13px] font-bold flex items-center justify-center gap-2 shadow-xs"
            >
              <BookOpen size={15} />
              <span>Commencer à apprendre</span>
            </button>
          </section>
        );
      }

      case 'w-simulateur-investissement': {
        return (
          <section key={widgetId} className="card-simple p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#5E1DF0] uppercase">
                Simulateur de projection
              </span>
              <span className="text-xs font-extrabold text-[#14111F] tabular-nums">
                Dès 300 DH / mois
              </span>
            </div>
            <h4 className="text-[15px] font-extrabold text-[#14111F]">
              Visualisez votre potentiel sur 5 ans
            </h4>
            <p className="text-[12px] text-[#7D7693] leading-relaxed">
              Découvrez comment des versements mensuels réguliers peuvent construire votre capital dans le temps.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('I3_INVEST_DISCOVERY')}
              className="w-full h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-xs font-bold hover:bg-[#E5DCFF] transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Lancer le simulateur</span>
              <ArrowRight size={14} />
            </button>
          </section>
        );
      }

      case 'w-vue-patrimoine':
      case 'w-repartition-actifs':
      case 'w-diversification-risques':
      case 'w-objectifs-investissement':
      case 'w-performance-portefeuille': {
        const wItem = widgets.find((w) => w.id === widgetId);
        return (
          <section key={widgetId} className="card-simple p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                  <Landmark size={19} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#5E1DF0] block">
                    Investir · Éducation & Repères
                  </span>
                  <h3 className="text-[16px] font-extrabold text-[#14111F]">
                    {wItem?.title || 'Découvrir l’investissement'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  wItem?.targetScreen === 'G2_COURSE_DETAIL'
                    ? navigateTo('G2_COURSE_DETAIL', { courseId: 'course-invest-5' })
                    : navigateTo('I3_INVEST_DISCOVERY')
                }
                className="text-[13px] font-semibold text-[#5E1DF0] hover:underline flex items-center gap-0.5"
              >
                <span>Explorer</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <p className="text-[13px] text-[#7D7693] leading-relaxed">
              {wItem?.description}
            </p>

            {wItem?.previewMetric && (
              <div className="p-3 rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-center justify-between text-xs">
                <span className="text-[#7D7693]">Aperçu</span>
                <span className="font-bold text-[#5E1DF0]">{wItem.previewMetric}</span>
              </div>
            )}
          </section>
        );
      }

      // Any other catalog widget added by Lamia
      default: {
        const wItem = widgets.find((w) => w.id === widgetId);
        if (!wItem) return null;
        return (
          <section key={widgetId} className="card-simple p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#5E1DF0]">
                {wItem.objective}
              </span>
              <button
                type="button"
                onClick={() =>
                  wItem.targetScreen
                    ? navigateTo(wItem.targetScreen)
                    : navigateTo('WIDGET_DETAIL', { widgetId: wItem.id })
                }
                className="text-[13px] font-semibold text-[#5E1DF0] hover:underline flex items-center gap-0.5"
              >
                <span>Ouvrir</span>
                <ChevronRight size={14} />
              </button>
            </div>
            <h3 className="text-[16px] font-extrabold text-[#14111F]">
              {wItem.title}
            </h3>
            <p className="text-[13px] text-[#7D7693] leading-relaxed">
              {wItem.description}
            </p>
            {wItem.previewMetric && (
              <div className="p-3 rounded-[18px] bg-[#F5F1FF] text-[13px] font-bold text-[#5E1DF0] tabular-nums">
                {wItem.previewMetric}
              </div>
            )}
          </section>
        );
      }
    }
  };

  // Reusable single-button footer for all 5 categories (+ Widgets [Catégorie])
  const renderCategoryPersonalizeFooter = (
    category: MonEspaceSubTab,
    categoryLabel: string
  ) => (
    <div className="pt-2">
      <button
        type="button"
        onClick={() =>
          navigateTo('I1_WIDGET_CATALOG', { monEspaceSubTab: category })
        }
        className="w-full h-11 rounded-full bg-white border border-[#DED4F8] text-[#5E1DF0] text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-[#FAF8FF] transition-colors active:scale-[0.99]"
      >
        <span>+ Widgets {categoryLabel}</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas">
      <MobileHeader
        title="Mes finances"
        onBack={() => navigateTo('A1_HOME')}
        showBell
      />

      {/* Segmented Tabs: Mon espace | Mes défis | Learn & Earn */}
      <div className="px-5 pt-2 pb-3 sticky top-14 z-20 bg-[#F6F3FE]/90 backdrop-blur-md">
        {!isR1 && <div className="grid grid-cols-3 gap-1 bg-white p-1.5 rounded-full shadow-[0_4px_16px_rgba(20,17,31,0.04)] border border-[#EFEBF8]">
          {tabs.map((tab) => {
            const active = activeHubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveHubTab(tab.id)}
                className={`py-2 px-2 rounded-full text-[12px] font-bold transition-all whitespace-nowrap truncate ${
                  active
                    ? 'bg-[#5E1DF0] text-white shadow-xs'
                    : 'text-[#7D7693] hover:text-[#14111F]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>}

        {/* Thematic Category Selector inside Mon Espace */}
        {activeHubTab === 'MON_ESPACE' && (
          <div className="pt-2.5 pb-0.5">
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
              {subTabs.map((subTab) => {
                const active = monEspaceSubTab === subTab.id;
                return (
                  <button
                    key={subTab.id}
                    type="button"
                    onClick={() => {
                      setMonEspaceSubTab(subTab.id);
                      if (subTab.id === 'COMMUNAUTE') {
                        setCommunityEntryCount((c) => c + 1);
                      }
                    }}
                    aria-pressed={active}
                    className={`group relative w-[108px] h-[72px] rounded-[18px] overflow-hidden shrink-0 text-left transition-all duration-200 ${
                      active
                        ? 'ring-2 ring-[#5E1DF0] ring-offset-2 ring-offset-[#F6F3FE] shadow-[0_8px_20px_-4px_rgba(94,29,240,0.4)] scale-[1.02]'
                        : 'border border-white/60 shadow-[0_4px_12px_rgba(20,17,31,0.08)] opacity-90 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={subTab.imageUrl}
                      alt={subTab.label}
                      referrerPolicy="no-referrer"
                      className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ${
                        active ? 'scale-105' : 'group-hover:scale-105'
                      }`}
                    />

                    {/* Subtle gradient overlay for readability */}
                    <div
                      className={`absolute inset-0 transition-opacity ${
                        active
                          ? 'bg-gradient-to-t from-[#290764]/90 via-[#4C1D95]/45 to-black/10'
                          : 'bg-gradient-to-t from-[#14111F]/85 via-[#14111F]/35 to-black/10'
                      }`}
                    />

                    {/* Active indicator badge */}
                    {active && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#5E1DF0] border border-white/80 text-white flex items-center justify-center shadow-2xs">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}

                    {/* Category Title & Subtitle */}
                    <div className="relative z-10 h-full flex flex-col justify-end p-2.5">
                      <span className="text-[13px] font-extrabold text-white leading-none tracking-tight drop-shadow-2xs">
                        {subTab.label}
                      </span>
                      <span className="text-[9.5px] font-medium text-white/85 leading-none mt-1 truncate">
                        {subTab.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Active Tab Content */}
      <div className="px-5 pt-1 pb-6 flex-1">
        {activeHubTab === 'MON_ESPACE' && (
          <div className="space-y-4">
            {/* ============================================================= */}
            {/* SUB-TAB 1: DÉPENSES */}
            {/* ============================================================= */}
            {monEspaceSubTab === 'DEPENSES' && (
              <div className="space-y-4">
                {getActiveCategoryWidgets('DEPENSES').map((w) =>
                  renderWidget(w.id)
                )}

                {/* Legacy gamified verification: kept for vision cible, not an R1 feature. */}
                {!isR1 && <section className="rounded-[24px] p-4 bg-gradient-to-br from-[#F2F8FF] via-white to-[#EDF6FF] border border-[#BFE0FF] shadow-[0_8px_24px_-6px_rgba(62,151,244,0.1)] space-y-3.5">
                  {/* 1. TOP EYEBROW & STATUS PILL */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 min-w-0">
                      <Target
                        size={14}
                        strokeWidth={2.3}
                        className="text-[#4FA9FF] shrink-0"
                      />
                      <span className="text-[11px] font-bold tracking-wide uppercase text-[#3E97F4]">
                        DÉFI PERSONNEL
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#DFF0FF] text-[#3E97F4] text-[11px] font-bold shrink-0 tabular-nums">
                      {verifiedCount}/{totalVerifyCount} vérifiés
                    </span>
                  </div>

                  {/* 2. MAIN TITLE & SUPPORTING TEXT */}
                  <div className="space-y-1">
                    <h2 className="text-[16px] font-extrabold text-[#14111F] leading-snug tracking-tight">
                      Et si on clarifiait vos achats ?
                    </h2>
                    <p className="text-[12.5px] text-[#6E6785] leading-relaxed">
                      {remainingPendingCount > 0
                        ? `${remainingPendingCount} achat${remainingPendingCount > 1 ? 's' : ''} à confirmer pour mieux comprendre vos dépenses.`
                        : `Vos ${totalVerifyCount} achats sont vérifiés. Vos analyses gagnent en précision !`}
                    </p>
                  </div>

                  {/* 3. TRANSACTION SECTION */}
                  <div className="space-y-1.5">
                    <h3 className="text-[12px] font-bold text-[#5C6F84] px-0.5">
                      Les achats à clarifier
                    </h3>

                    <div className="rounded-[18px] bg-white/90 border border-[#D6EBFF] divide-y divide-[#EAF4FF] px-3.5 py-1">
                      {challengeTransactions.map((tx) => {
                        const isVerified =
                          Boolean(tx.verifiedByUser) || !tx.uncertainCategory;

                        return (
                          <div
                            key={tx.id}
                            className="py-2.5 first:pt-2 last:pb-2 flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <CategoryIcon category={tx.category} size="sm" />
                              <div className="min-w-0 flex-1">
                                <p className="text-[13.5px] font-bold text-[#14111F] leading-snug">
                                  {tx.merchant}
                                </p>
                                <p className="text-[11.5px] font-medium text-[#7D7693] mt-0.5">
                                  {tx.category}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isVerified && (
                                <span
                                  className="w-4 h-4 rounded-full bg-[#DFF0FF] text-[#3E97F4] flex items-center justify-center"
                                  aria-label="Vérifié"
                                >
                                  <Check size={10} strokeWidth={3} />
                                </span>
                              )}
                              <span className="text-[13.5px] font-extrabold text-[#14111F] tabular-nums">
                                −{formatDH(tx.amount)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. PRIMARY CTA */}
                  <div className="pt-0.5">
                    {remainingPendingCount > 0 ? (
                      <button
                        type="button"
                        onClick={openVerificationChallengeFlow}
                        className="w-full h-11 px-4 rounded-full bg-white hover:bg-[#F5FAFF] text-[#3E97F4] border border-[#3E97F4] shadow-[0_2px_8px_rgba(62,151,244,0.08)] text-[13px] font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] whitespace-nowrap"
                      >
                        <span>Commencer le défi</span>
                        <ArrowRight size={15} strokeWidth={2.3} />
                      </button>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="rounded-[16px] bg-[#DFF0FF] px-3.5 py-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2
                              size={16}
                              className="text-[#3E97F4] shrink-0"
                            />
                            <span className="text-[12px] font-bold text-[#2476CE] truncate">
                              Défi complété · {totalVerifyCount}/{totalVerifyCount} achats vérifiés
                            </span>
                          </div>
                          <span className="text-[11px] font-extrabold text-[#2476CE] shrink-0">
                            Badge « Œil attentif »
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveHubTab('MES_DEFIS')}
                          className="w-full h-11 px-4 rounded-full bg-white hover:bg-[#F5FAFF] text-[#3E97F4] border border-[#3E97F4] shadow-[0_2px_8px_rgba(62,151,244,0.08)] text-[13px] font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                        >
                          <span>Voir ma progression dans Mes défis</span>
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </section>}

                {/* Customization footer */}
                {renderCategoryPersonalizeFooter('DEPENSES', 'Dépenses')}
              </div>
            )}

            {/* ============================================================= */}
            {/* SUB-TAB 2: BUDGETS */}
            {/* ============================================================= */}
            {monEspaceSubTab === 'BUDGETS' && (() => {
              const personalBudgets = Object.values(budgets).filter(
                (b) => (b.scope || 'PERSONNEL') === 'PERSONNEL'
              );
              const activePersonalBudgets = personalBudgets.filter(
                (b) => b.status !== 'STOPPED'
              );
              const activePersonalBudgetsCount = activePersonalBudgets.length;
              const stoppedPersonalBudgetsCount =
                personalBudgets.length - activePersonalBudgetsCount;
              const activeBudgetWidgets = getActiveCategoryWidgets('BUDGETS');

              const proposedLimitsByCategory: Record<SpendingCategory, number> = {
                Shopping: 1600,
                Sorties: 750,
                Courses: 1850,
                Transport: 500,
                Factures: 1500,
                Autres: 400,
                Loisirs: 750,
              };
              const discCatSummary =
                categoryBreakdown.find(
                  (c) => c.category === discoveryBudgetCategory
                ) || shoppingSummary;
              const discSpent = discCatSummary.amount;
              const discProposedLimit =
                proposedLimitsByCategory[discoveryBudgetCategory] ||
                Math.max(400, Math.round((discSpent * 0.85) / 50) * 50);
              const discObjectiveReduction = Math.max(
                50,
                discSpent - discProposedLimit
              );
              const discVarPct = discCatSummary.variationPct;

              return (
                <div className="space-y-4">
                  {activePersonalBudgetsCount > 0 ? (
                    /* Active Budgets View (Only when at least one ACTIVE personal budget exists) */
                    <>
                      {/* Ordered & customizable personal budget widgets */}
                      {activeBudgetWidgets.map((w) => renderWidget(w.id))}

                      {/* Customization footer (+ Widgets Budgets) */}
                      {renderCategoryPersonalizeFooter('BUDGETS', 'Budgets')}
                    </>
                  ) : (
                    /* Discovery / Empty State BEFORE creating an active budget (or when all personal budgets are stopped/deleted) */
                    <div className="space-y-4 pt-1 pb-2">
                      {/* 1. EDITORIAL INTRODUCTION (Directly on the lavender page background, matching Projets) */}
                      <header className="px-0.5 space-y-1.5">
                        <h2 className="text-[22px] font-extrabold text-[#290764] leading-[1.2] tracking-tight">
                          Et si vous dépensiez plus sereinement ?
                        </h2>
                        <p className="text-[13.5px] text-[#6B6380] leading-relaxed">
                          Simple vous aide à fixer des limites adaptées à vos habitudes.
                        </p>
                      </header>

                      {/* 2. SHOPPING RECOMMENDATION CARD */}
                      <section className="rounded-[24px] bg-white p-4.5 border border-[#EFEBF8] shadow-[0_10px_28px_-6px_rgba(41,7,100,0.07)] space-y-3.5">
                        {/* Header + Contextual insight */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-3 min-w-0">
                              <CategoryIcon
                                category={discoveryBudgetCategory}
                                size="md"
                              />
                              <h3 className="text-[17px] font-extrabold text-[#290764] leading-tight">
                                {discoveryBudgetCategory}
                              </h3>
                            </div>
                            {discVarPct > 0 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#FFF7ED] border border-[#FED7AA] text-[#B45309] text-[11.5px] font-extrabold tabular-nums shrink-0">
                                +{discVarPct} %
                              </span>
                            )}
                          </div>

                          <p className="text-[12.5px] text-[#6E6785] leading-relaxed">
                            {discVarPct > 0
                              ? `Vos dépenses ${discoveryBudgetCategory} ont augmenté de ${discVarPct} % par rapport à septembre. Voici une limite suggérée pour le mois prochain.`
                              : `Voici une limite suggérée pour le mois prochain adaptée à vos dépenses ${discoveryBudgetCategory}.`}
                          </p>
                        </div>

                        {/* VERTICAL COMPARISON CHART (Compact ~140px height, subtle lavender background) */}
                        <div className="rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] px-4 py-3.5 h-[142px] flex items-end justify-around">
                          {(() => {
                            const maxVal = Math.max(discSpent, discProposedLimit, 1);
                            const spentBarHeight = Math.max(
                              28,
                              Math.round((discSpent / maxVal) * 72)
                            );
                            const limitBarHeight = Math.max(
                              24,
                              Math.round(
                                (discProposedLimit / maxVal) *
                                  (discSpent > discProposedLimit ? 56 : 72)
                              )
                            );

                            return (
                              <>
                                {/* Bar 1 — Purple */}
                                <div className="flex flex-col items-center flex-1">
                                  <span className="text-[13.5px] font-extrabold text-[#8000EB] tabular-nums leading-none mb-1.5">
                                    {formatDH(discSpent)}
                                  </span>
                                  <div className="h-[74px] flex items-end justify-center">
                                    <div
                                      className="w-14 rounded-t-[12px] rounded-b-[5px] bg-[#8000EB] shadow-[0_6px_14px_-4px_rgba(128,0,235,0.3)] transition-all duration-300"
                                      style={{ height: `${spentBarHeight}px` }}
                                    />
                                  </div>
                                  <span className="text-[11.5px] font-semibold text-[#5E5675] mt-2 leading-none whitespace-nowrap">
                                    Octobre
                                  </span>
                                </div>

                                {/* Bar 2 — Mint green */}
                                <div className="flex flex-col items-center flex-1">
                                  <span className="text-[13.5px] font-extrabold text-[#0F7B52] tabular-nums leading-none mb-1.5">
                                    {formatDH(discProposedLimit)}
                                  </span>
                                  <div className="h-[74px] flex items-end justify-center">
                                    <div
                                      className="w-14 rounded-t-[12px] rounded-b-[5px] bg-[#34D399] border border-[#10B981]/30 shadow-[0_6px_14px_-4px_rgba(16,185,129,0.22)] transition-all duration-300"
                                      style={{ height: `${limitBarHeight}px` }}
                                    />
                                  </div>
                                  <span className="text-[11.5px] font-semibold text-[#0F7B52] mt-2 leading-none whitespace-nowrap">
                                    Limite suggérée
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {/* BENEFIT BELOW THE CHART */}
                        <div className="flex items-center justify-center gap-1.5 text-[#0F7B52] pt-0.5">
                          <TrendingDown
                            size={15}
                            strokeWidth={2.4}
                            className="text-[#10B981] shrink-0"
                          />
                          <span className="text-[13px] font-extrabold tabular-nums leading-snug">
                            {formatDH(discObjectiveReduction)} de dépenses en moins à viser
                          </span>
                        </div>

                        {/* 3. ACTIONS */}
                        <div className="space-y-1.5 pt-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              navigateTo('E1_CREATE_BUDGET', {
                                category: discoveryBudgetCategory,
                                budgetScope: 'PERSONNEL',
                                budgetOrigin: 'STANDARD',
                              })
                            }
                            className="w-full h-11 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-bold flex items-center justify-center gap-1.5 shadow-[0_8px_18px_-6px_rgba(128,0,235,0.3)] transition-all active:scale-[0.99]"
                          >
                            <span>Définir ma limite →</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setIsDiscoveryBudgetCatSheetOpen(true)}
                            className="w-full py-1 text-center text-[13px] font-bold text-[#8000EB] hover:text-[#6800BF] transition-colors"
                          >
                            Choisir une autre catégorie
                          </button>
                        </div>
                      </section>

                      {/* If user has stopped budgets, allow viewing/reactivating them without showing budget-dependent widgets */}
                      {stoppedPersonalBudgetsCount > 0 &&
                        renderWidget('w-budgets-categorie')}

                      {/* Category Selection Bottom Sheet for Discovery Recommendation */}
                      {isDiscoveryBudgetCatSheetOpen && (
                        <div
                          className="fixed sm:absolute inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-end justify-center"
                          onClick={() => setIsDiscoveryBudgetCatSheetOpen(false)}
                        >
                          <div
                            className="w-full bg-white rounded-t-[30px] p-5 shadow-2xl border-t border-[#ECE7F6] space-y-3.5 max-h-[82%] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto shrink-0" />
                            <div>
                              <span className="text-[11px] font-bold text-[#8000EB] uppercase tracking-wide block">
                                Limite de dépenses
                              </span>
                              <h3 className="text-[17px] font-extrabold text-[#290764] leading-snug mt-0.5">
                                Choisir une catégorie
                              </h3>
                              <p className="text-[12px] text-[#7D7693] mt-0.5">
                                Sélectionnez la catégorie pour laquelle vous souhaitez fixer une limite de dépense.
                              </p>
                            </div>

                            <div className="space-y-2 overflow-y-auto pr-0.5 py-1">
                              {selectableCategories.map((cat) => {
                                const catItem = categoryBreakdown.find(
                                  (c) => c.category === cat
                                );
                                const catSpentVal = catItem
                                  ? catItem.amount
                                  : 0;
                                const catPropVal =
                                  proposedLimitsByCategory[cat] || 1000;
                                const isSelected =
                                  discoveryBudgetCategory === cat;

                                return (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                      setDiscoveryBudgetCategory(cat);
                                      setIsDiscoveryBudgetCatSheetOpen(false);
                                    }}
                                    className={`w-full p-3 rounded-[18px] border flex items-center justify-between gap-3 text-left transition-all ${
                                      isSelected
                                        ? 'bg-[#F5F1FF] border-[#8000EB]/40 ring-1 ring-[#8000EB]/20'
                                        : 'bg-[#FAF8FE] border-[#EFEBF8] hover:bg-[#F3EEFF]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 min-w-0">
                                      <CategoryIcon category={cat} size="sm" />
                                      <div className="min-w-0">
                                        <p className="text-[14px] font-extrabold text-[#290764] leading-tight">
                                          {cat}
                                        </p>
                                        <p className="text-[11.5px] text-[#7D7693] mt-0.5 tabular-nums">
                                          {formatDH(catSpentVal)} dépensés · Limite proposée {formatDH(catPropVal)}
                                        </p>
                                      </div>
                                    </div>

                                    {isSelected ? (
                                      <div className="w-6 h-6 rounded-full bg-[#8000EB] text-white flex items-center justify-center shrink-0">
                                        <Check size={13} strokeWidth={2.6} />
                                      </div>
                                    ) : (
                                      <ChevronRight
                                        size={15}
                                        className="text-[#8E87A6] shrink-0"
                                      />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Confirmation Bottom Sheet: Arrêter le suivi */}
                  {stopConfirmCategory && (
                    <div
                      className="fixed sm:absolute inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-end justify-center"
                      onClick={() => setStopConfirmCategory(null)}
                    >
                      <div
                        className="w-full bg-white rounded-t-[30px] p-6 shadow-2xl border-t border-[#ECE7F6] space-y-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />
                        <div className="flex items-start gap-3.5">
                          <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
                            <PauseCircle size={22} />
                          </div>
                          <div>
                            <h3 className="text-[17px] font-extrabold text-[#290764] leading-snug">
                              Arrêter le suivi du budget {stopConfirmCategory} ?
                            </h3>
                            <p className="text-[13px] text-[#6E6785] mt-1 leading-relaxed">
                              Le suivi mensuel et les alertes préventives seront interrompus. Votre historique et votre repère ({formatDH(budgets[stopConfirmCategory]?.limit || 1600)}) restent conservés et vous pourrez réactiver ce suivi à tout moment.
                            </p>
                          </div>
                        </div>

                        <div className="pt-1 space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              const targetCat = stopConfirmCategory;
                              setStopConfirmCategory(null);
                              toggleBudgetTrackingStatus(targetCat, 'STOPPED');
                              showToast(
                                `Suivi Budget ${targetCat} arrêté`,
                                'Les alertes sont désactivées. Vous pouvez réactiver le suivi depuis le menu ⋯.'
                              );
                            }}
                            className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-bold transition-colors"
                          >
                            Arrêter le suivi
                          </button>
                          <button
                            type="button"
                            onClick={() => setStopConfirmCategory(null)}
                            className="w-full h-11 rounded-full bg-[#F5F2FA] text-[#290764] text-[13px] font-bold hover:bg-[#ECE6F8] transition-colors"
                          >
                            Continuer le suivi
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Destructive Confirmation Bottom Sheet: Supprimer le budget */}
                  {deleteConfirmCategory && (
                    <div
                      className="fixed sm:absolute inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-end justify-center"
                      onClick={() => setDeleteConfirmCategory(null)}
                    >
                      <div
                        className="w-full bg-white rounded-t-[30px] p-6 shadow-2xl border-t border-[#ECE7F6] space-y-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />
                        <div className="flex items-start gap-3.5">
                          <div className="w-11 h-11 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
                            <Trash2 size={20} />
                          </div>
                          <div>
                            <h3 className="text-[17px] font-extrabold text-[#290764] leading-snug">
                              Supprimer le budget {deleteConfirmCategory} ?
                            </h3>
                            <p className="text-[13px] text-[#6E6785] mt-1 leading-relaxed">
                              Cette enveloppe budgétaire et ses alertes seront retirées de votre espace Budgets. Vos opérations bancaires et votre historique de dépenses {deleteConfirmCategory} restent intégralement conservés.
                            </p>
                          </div>
                        </div>

                        <div className="pt-1 space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              const targetCat = deleteConfirmCategory;
                              setDeleteConfirmCategory(null);
                              deleteCategoryBudget(targetCat);
                              showToast(
                                `Budget ${targetCat} supprimé`,
                                'Vos opérations bancaires restent intactes dans vos dépenses.'
                              );
                            }}
                            className="w-full h-12 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[14px] font-bold transition-colors"
                          >
                            Supprimer définitivement
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmCategory(null)}
                            className="w-full h-11 rounded-full bg-[#F5F2FA] text-[#290764] text-[13px] font-bold hover:bg-[#ECE6F8] transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ============================================================= */}
            {/* SUB-TAB 3: PROJETS */}
            {/* ============================================================= */}
            {monEspaceSubTab === 'PROJETS' && (() => {
              const personalSavingsGoals = savingsGoals.filter(
                (g) => (g.scope || 'PERSONNEL') === 'PERSONNEL'
              );
              const activeProjectWidgets = getActiveCategoryWidgets('PROJETS');

              const dreamGalleries = [
                {
                  id: 'experiences',
                  title: 'Pour vivre de belles expériences',
                  items: [
                    {
                      id: 'travel',
                      title: 'Voyager',
                      subtitle: 'Côte méditerranéenne & soleil',
                      tag: 'Voyage',
                      imageUrl: TRAVEL_PHOTO_URL,
                    },
                    {
                      id: 'adventure',
                      title: "Partir à l'aventure",
                      subtitle: 'Road trip & grands espaces',
                      tag: 'Voyage',
                      imageUrl:
                        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80',
                    },
                    {
                      id: 'getaway',
                      title: "S'offrir une escapade",
                      subtitle: 'Un week-end hors du temps',
                      tag: 'Voyage',
                      imageUrl:
                        'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&auto=format&fit=crop&q=80',
                    },
                  ],
                },
                {
                  id: 'tomorrow',
                  title: 'Pour construire demain',
                  items: [
                    {
                      id: 'home',
                      title: 'Mon futur chez-moi',
                      subtitle: 'Un lieu qui vous ressemble',
                      tag: 'Maison',
                      imageUrl:
                        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
                    },
                    {
                      id: 'interior',
                      title: 'Sublimer mon intérieur',
                      subtitle: 'Déco, mobilier & cocon',
                      tag: 'Maison',
                      imageUrl:
                        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop&q=80',
                    },
                    {
                      id: 'safety',
                      title: "Avancer l'esprit libre",
                      subtitle: 'Votre coussin de sérénité',
                      tag: 'Réserve de sécurité',
                      imageUrl:
                        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
                    },
                  ],
                },
                {
                  id: 'pleasures',
                  title: 'Pour se faire plaisir',
                  items: [
                    {
                      id: 'personal',
                      title: 'Un coup de cœur',
                      subtitle: 'Cette envie qui vous fait sourire',
                      tag: 'Projet personnel',
                      imageUrl:
                        'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
                    },
                    {
                      id: 'family',
                      title: 'Célébrer un grand moment',
                      subtitle: 'Fête, mariage ou instant précieux',
                      tag: 'Projet familial',
                      imageUrl:
                        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=80',
                    },
                    {
                      id: 'passion',
                      title: 'Cultiver ma passion',
                      subtitle: 'Musique, sport ou nouveau talent',
                      tag: 'Projet personnel',
                      imageUrl:
                        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
                    },
                  ],
                },
              ];

              return (
                <div className="space-y-4">
                  {personalSavingsGoals.length > 0 ? (
                    /* Active Savings Project View */
                    <>
                      <div className="flex items-center justify-between px-1">
                        <div>
                          <h3 className="text-[15px] font-extrabold text-[#14111F]">
                            Mes projets d’épargne
                          </h3>
                          <p className="text-[12px] text-[#7D7693]">
                            {personalSavingsGoals.length > 1
                              ? `${personalSavingsGoals.length} objectifs actifs en cours`
                              : '1 objectif actif en cours'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            navigateTo('H0_CREATE_GOAL', {
                              goalScope: 'PERSONNEL',
                            })
                          }
                          className="text-xs font-bold text-[#5E1DF0] hover:underline flex items-center gap-0.5"
                        >
                          <span>+ Ajouter un nouveau projet</span>
                        </button>
                      </div>

                      {/* Ordered & customizable personal project widgets */}
                      {activeProjectWidgets.map((w) => renderWidget(w.id))}

                      {/* Main Relevant CTA */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => navigateTo('H2_ADD_MONEY')}
                          className="w-full h-11 rounded-full btn-simple-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                        >
                          <Plus size={15} />
                          <span>Verser sur mon projet</span>
                        </button>
                      </div>

                      {/* Customization footer */}
                      {renderCategoryPersonalizeFooter('PROJETS', 'Projets')}
                    </>
                  ) : (
                    /* Dreamz-Inspired Emotional Visual Gallery Discovery State */
                    <div className="space-y-6 pt-1 pb-2">
                      {/* 1. EDITORIAL INTRODUCTION (Directly on lavender background) */}
                      <header className="px-0.5 space-y-2">
                        <h2 className="text-[22px] font-extrabold text-[#290764] leading-[1.2] tracking-tight">
                          Et si on donnait vie à vos rêves ?
                        </h2>
                        <p className="text-[13.5px] text-[#6B6380] leading-relaxed">
                          Un voyage, un nouveau départ, une envie… Chaque projet commence quelque part.
                        </p>
                        <div className="pt-0.5">
                          <button
                            type="button"
                            onClick={() =>
                              navigateTo('H0_CREATE_GOAL', {
                                goalScope: 'PERSONNEL',
                              })
                            }
                            className="inline-flex items-center gap-1 text-[13px] font-extrabold text-[#8000EB] hover:text-[#5E1DF0] transition-colors active:scale-[0.99]"
                          >
                            <span>J'ai déjà une idée ↗</span>
                          </button>
                        </div>
                      </header>

                      {/* 2. VISUAL INSPIRATION GALLERIES (3 Horizontal Swipeable Photo Carousels) */}
                      <div className="space-y-6">
                        {dreamGalleries.map((section) => (
                          <section key={section.id} className="space-y-2.5">
                            <h3 className="text-[15.5px] font-extrabold text-[#290764] tracking-tight px-0.5">
                              {section.title}
                            </h3>

                            <div className="flex gap-3.5 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory">
                              {section.items.map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() =>
                                    navigateTo('H0_CREATE_GOAL', {
                                      suggestedGoalTag: item.tag,
                                      suggestedGoalImageId: item.id,
                                      suggestedGoalTitle: item.title,
                                      goalScope: 'PERSONNEL',
                                    })
                                  }
                                  className="group relative w-[166px] h-[212px] rounded-[24px] overflow-hidden shrink-0 snap-start text-left shadow-[0_12px_26px_-8px_rgba(41,7,100,0.18)] border border-white/60 transition-all duration-200 active:scale-[0.98]"
                                >
                                  <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    referrerPolicy="no-referrer"
                                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                  />

                                  {/* Subtle bottom gradient for editorial legibility */}
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#14111F]/85 via-[#14111F]/25 to-black/5" />

                                  {/* Top-right subtle glass action badge */}
                                  <span className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105">
                                    <Plus size={14} strokeWidth={2.5} />
                                  </span>

                                  {/* Bottom Title & Subtitle */}
                                  <div className="relative z-10 h-full flex flex-col justify-end p-3.5">
                                    <p className="text-[15px] font-extrabold text-white leading-snug tracking-tight drop-shadow-2xs">
                                      {item.title}
                                    </p>
                                    <p className="text-[11px] font-medium text-white/85 leading-snug mt-0.5 line-clamp-2">
                                      {item.subtitle}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </section>
                        ))}
                      </div>

                      {/* Bottom Custom Dream CTA */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            navigateTo('H0_CREATE_GOAL', {
                              goalScope: 'PERSONNEL',
                            })
                          }
                          className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_10px_22px_-6px_rgba(128,0,235,0.38)] transition-all active:scale-[0.99]"
                        >
                          <span>Créer mon propre projet</span>
                          <ArrowRight size={16} strokeWidth={2.4} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ============================================================= */}
            {/* SUB-TAB 4: FOYER */}
            {/* ============================================================= */}
            {monEspaceSubTab === 'FOYER' && (
              <div className="space-y-4">
                {/* 1. Personalized Household Card (First after household creation) */}
                {hasHouseholdSetup && (
                  <section className="card-simple p-4 space-y-3.5">
                    {/* A. Top area — household cover image */}
                    <div className="relative w-full h-[138px] rounded-[18px] overflow-hidden bg-[#F5F2FA]">
                      <img
                        src={
                          householdCoverUrl ||
                          '/src/assets/images/moroccan_family_foyer_1791969781489.jpg'
                        }
                        alt={householdName || 'Notre foyer'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                      />
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#0F7B52] text-[11px] font-bold shadow-2xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F7B52]" />
                        Actif
                      </span>
                    </div>

                    {/* B. Card header below the image */}
                    <div className="px-0.5 flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-[18px] font-bold text-[#290764] leading-tight tracking-tight">
                          {householdName || 'Notre foyer'}
                        </h3>
                        <p className="text-[12px] font-medium text-[#7D7693] mt-0.5">
                          {householdMembers.length} membre{householdMembers.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigateTo('J3_HOUSEHOLD_SETUP')}
                        className="inline-flex items-center gap-1 py-1 px-2 -mr-1 rounded-full text-[12px] font-semibold text-[#8000EB] hover:bg-[#F5F1FF] transition-colors shrink-0"
                      >
                        <Pencil size={12} strokeWidth={2.3} />
                        <span>Modifier</span>
                      </button>
                    </div>

                    {/* C. Members row — all members aligned on the same horizontal row */}
                    <div className="flex items-stretch gap-2">
                      {householdMembers.map((m) => (
                        <div
                          key={m.id}
                          className="flex-1 min-w-0 py-2.5 px-2 rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8] flex flex-col items-center text-center"
                        >
                          {m.photoUrl ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#F3EBFF] border border-white shadow-2xs shrink-0 mb-1.5">
                              <img
                                src={m.photoUrl}
                                alt={m.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#8000EB] text-white font-bold flex items-center justify-center text-xs shrink-0 mb-1.5">
                              {m.avatarInitials}
                            </div>
                          )}
                          <p className="text-[12px] font-bold text-[#290764] truncate w-full leading-tight">
                            {m.name}
                          </p>
                          <p className="text-[10px] font-medium text-[#7D7693] truncate w-full leading-tight mt-0.5">
                            {m.role}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Ordered & customizable Foyer widgets when household is set up */}
                {hasHouseholdSetup &&
                  getActiveCategoryWidgets('FOYER').map((w) =>
                    renderWidget(w.id)
                  )}

                {/* Discovery State when household is not yet created — Editorial Simple Family experience */}
                {!hasHouseholdSetup && (
                  <div className="space-y-5 pt-1 pb-2">
                    {/* 1. EDITORIAL INTRODUCTION (Directly on the lavender page background) */}
                    <header className="px-0.5 space-y-1.5">
                      <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8000EB] block">
                        SIMPLE FAMILY
                      </span>
                      <h2 className="text-[22px] font-extrabold text-[#290764] leading-[1.2] tracking-tight">
                        Et si on avançait ensemble, en famille ?
                      </h2>
                      <p className="text-[13.5px] text-[#6B6380] leading-relaxed">
                        Prenez soin de vos finances au quotidien et donnez vie aux projets qui comptent pour votre famille.
                      </p>
                    </header>

                    {/* 2. LARGE EMOTIONAL FAMILY PHOTO (Full content width, rounded corners, no outer card wrapper) */}
                    <div className="relative w-full h-[196px] rounded-[24px] overflow-hidden shadow-[0_12px_26px_-8px_rgba(41,7,100,0.18)] border border-white/60 bg-[#F5F2FA]">
                      <img
                        src="/src/assets/images/moroccan_family_foyer_1791969781489.jpg"
                        alt="Famille réunie à la maison"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#14111F]/25 via-transparent to-transparent" />
                    </div>

                    {/* 3. THREE COMPACT BENEFIT ROWS WITH DISTINCT ICONS */}
                    <div className="space-y-2.5 px-0.5">
                      {[
                        {
                          icon: PieChart,
                          title: 'Comprendre nos dépenses',
                          subtitle: "Savoir où va l'argent de la famille.",
                          iconStyle: 'bg-[#F3EBFF] text-[#8000EB]',
                        },
                        {
                          icon: Wallet,
                          title: 'Organiser nos budgets',
                          subtitle: 'Garder le cap sur les dépenses communes.',
                          iconStyle: 'bg-[#FFF3E8] text-[#D97706]',
                        },
                        {
                          icon: PiggyBank,
                          title: 'Réaliser nos projets',
                          subtitle: 'Épargner ensemble pour ce qui nous tient à cœur.',
                          iconStyle: 'bg-[#E7F7F0] text-[#0F7B52]',
                        },
                      ].map((item) => {
                        const IconComp = item.icon;
                        return (
                          <div
                            key={item.title}
                            className="flex items-center gap-3.5 py-2 px-3 rounded-[18px] bg-white/75 backdrop-blur-xs border border-white/80 shadow-[0_4px_14px_-6px_rgba(41,7,100,0.06)]"
                          >
                            <div
                              className={`w-10 h-10 rounded-full ${item.iconStyle} flex items-center justify-center shrink-0`}
                            >
                              <IconComp size={18} strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-[14px] font-extrabold text-[#290764] leading-snug">
                                {item.title}
                              </h3>
                              <p className="text-[12px] text-[#6B6380] leading-snug mt-0.5">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 4. ONE PRIMARY CTA */}
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => navigateTo('J3_HOUSEHOLD_SETUP')}
                        className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_10px_22px_-6px_rgba(128,0,235,0.38)] transition-all active:scale-[0.99]"
                      >
                        <span>Créer mon espace Famille →</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Customization footer — only visible after family creation is completed */}
                {hasHouseholdSetup &&
                  renderCategoryPersonalizeFooter('FOYER', 'Foyer')}

                {/* Inline Configuration Bottom Sheet for Yasmine's Allowance */}
                {isAllowanceSheetOpen && (
                  <div
                    className="fixed inset-0 z-50 bg-[#14111F]/45 backdrop-blur-[2px] flex items-end justify-center"
                    onClick={() => setIsAllowanceSheetOpen(false)}
                  >
                    <div
                      className="w-full max-h-[85%] overflow-y-auto bg-white rounded-t-[24px] px-5 pt-3.5 pb-7 space-y-4 shadow-[0_-10px_30px_rgba(20,17,31,0.16)] border-t border-[#EFEBF8]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="w-10 h-1 rounded-full bg-[#E3DDF2] mx-auto" />

                      <div>
                        <span className="text-[11px] font-semibold text-[#5E1DF0] block">
                          Simple One · Yasmine
                        </span>
                        <h3 className="text-[17px] font-extrabold text-[#14111F] leading-snug mt-0.5">
                          Organiser l'argent de poche de Yasmine
                        </h3>
                      </div>

                      <div className="space-y-3.5">
                        {/* Field 1: Montant de référence */}
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-bold text-[#14111F] block">
                            Montant de référence
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              inputMode="numeric"
                              min={1}
                              value={allowanceAmountInput}
                              onChange={(e) => {
                                setAllowanceAmountInput(e.target.value);
                                if (allowanceValidationError) {
                                  setAllowanceValidationError('');
                                }
                              }}
                              placeholder="Montant en DH"
                              className="w-full h-12 pl-4 pr-14 rounded-[18px] bg-[#FAF8FE] border border-[#E4D8FC] text-[15px] font-bold text-[#14111F] placeholder:text-[#9A93B0] placeholder:font-medium focus:outline-none focus:border-[#5E1DF0]"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-extrabold text-[#5E1DF0]">
                              DH
                            </span>
                          </div>
                          {allowanceValidationError && (
                            <p className="text-[11px] font-semibold text-rose-600">
                              {allowanceValidationError}
                            </p>
                          )}
                        </div>

                        {/* Field 2: Fréquence */}
                        <div className="space-y-1.5">
                          <label className="text-[12px] font-bold text-[#14111F] block">
                            Fréquence
                          </label>
                          <div className="grid grid-cols-3 gap-1 p-1 rounded-[16px] bg-[#F5F1FF] border border-[#EAE2FF]">
                            {(
                              ['Ponctuel', 'Hebdomadaire', 'Mensuel'] as AllowanceFrequency[]
                            ).map((freq) => {
                              const isSelected = allowanceFrequencyInput === freq;
                              return (
                                <button
                                  key={freq}
                                  type="button"
                                  onClick={() => setAllowanceFrequencyInput(freq)}
                                  className={`h-9 rounded-[12px] text-[12px] font-bold transition-all ${
                                    isSelected
                                      ? 'bg-[#5E1DF0] text-white shadow-2xs'
                                      : 'text-[#4A4063] hover:text-[#14111F]'
                                  }`}
                                >
                                  {freq}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-1 flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={handleActivateAllowanceTracking}
                          className="w-full h-11 rounded-full btn-simple-primary text-[13px] font-bold flex items-center justify-center gap-2"
                        >
                          <span>Activer le suivi</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAllowanceSheetOpen(false)}
                          className="py-1.5 px-4 text-[12px] font-bold text-[#7D7693] hover:text-[#14111F] transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Personalization Invitation Bottom Sheet */}
                {isPersonalizationInviteSheetOpen && (
                  <div
                    className="fixed inset-0 z-50 bg-[#14111F]/45 backdrop-blur-[2px] flex items-end justify-center"
                    onClick={() => setIsPersonalizationInviteSheetOpen(false)}
                  >
                    <div
                      className="w-full max-h-[85%] overflow-y-auto bg-white rounded-t-[24px] px-5 pt-3.5 pb-7 space-y-4 shadow-[0_-10px_30px_rgba(20,17,31,0.16)] border-t border-[#EFEBF8]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="w-10 h-1 rounded-full bg-[#E3DDF2] mx-auto" />

                      <div className="w-full h-[108px] rounded-[18px] overflow-hidden bg-[#F5F2FA]">
                        <img
                          src="/src/assets/images/moroccan_family_foyer_1791969781489.jpg"
                          alt="Famille réunie à la maison"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold tracking-wide text-[#8000EB] block">
                          Simple Foyer
                        </span>
                        <h3 className="text-[18px] font-bold text-[#290764] leading-snug tracking-tight">
                          Créez un foyer qui vous ressemble
                        </h3>
                        <p className="text-[13px] text-[#6B6380] leading-relaxed">
                          Ajoutez vos proches, leurs photos et organisez plus simplement les dépenses du quotidien.
                        </p>
                      </div>

                      <div className="space-y-2 py-0.5">
                        {[
                          'Visualiser les membres du foyer',
                          'Suivre les dépenses partagées',
                          'Garder les comptes personnels privés',
                        ].map((benefit) => (
                          <div
                            key={benefit}
                            className="flex items-center gap-2.5 text-[13px] font-medium text-[#290764]"
                          >
                            <div className="w-5 h-5 rounded-full bg-[#F3EBFF] text-[#8000EB] flex items-center justify-center shrink-0">
                              <Check size={12} strokeWidth={2.6} />
                            </div>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-1 flex flex-col items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsPersonalizationInviteSheetOpen(false);
                            navigateTo('J3_HOUSEHOLD_SETUP');
                          }}
                          className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
                        >
                          <span>Commencer</span>
                          <ArrowRight size={15} strokeWidth={2.3} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPersonalizationInviteSheetOpen(false)}
                          className="py-1 text-[13px] font-medium text-[#7D7693] hover:text-[#290764] transition-colors"
                        >
                          Plus tard
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Family Budgets Detail Bottom Sheet */}
                {isFamilyBudgetsSheetOpen && (
                  <div
                    className="fixed inset-0 z-50 bg-[#14111F]/45 backdrop-blur-[2px] flex items-end justify-center"
                    onClick={() => setIsFamilyBudgetsSheetOpen(false)}
                  >
                    <div
                      className="w-full max-h-[85%] overflow-y-auto bg-white rounded-t-[24px] px-5 pt-3.5 pb-7 space-y-4 shadow-[0_-10px_30px_rgba(20,17,31,0.16)] border-t border-[#EFEBF8]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="w-10 h-1 rounded-full bg-[#E3DDF2] mx-auto" />

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E1DF0] block">
                            Nos budgets · Octobre
                          </span>
                          <h3 className="text-[18px] font-extrabold text-[#14111F] leading-snug mt-0.5">
                            Suivi des budgets familiaux
                          </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#0F7B52] text-[11px] font-extrabold">
                          En bonne voie
                        </span>
                      </div>

                      <div className="p-3.5 rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-semibold text-[#6F6A82] block">
                            Total dépensé ce mois
                          </span>
                          <p className="text-[17px] font-black text-[#14111F]">
                            4 730{' '}
                            <span className="text-[13px] font-bold text-[#6F6A82]">
                              / 6 200 DH
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-semibold text-[#6F6A82] block">
                            Reste disponible
                          </span>
                          <p className="text-[16px] font-extrabold text-[#0F7B52]">
                            1 470 DH
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {[
                          {
                            label: 'Courses',
                            spent: 2600,
                            limit: 3200,
                            remaining: 600,
                            pct: 81,
                            color: '#5E1DF0',
                          },
                          {
                            label: 'Factures',
                            spent: 1350,
                            limit: 1800,
                            remaining: 450,
                            pct: 75,
                            color: '#10B981',
                          },
                          {
                            label: 'Loisirs',
                            spent: 780,
                            limit: 1200,
                            remaining: 420,
                            pct: 65,
                            color: '#F59E0B',
                          },
                        ].map((b) => (
                          <div
                            key={b.label}
                            className="p-3.5 rounded-[16px] bg-white border border-[#EFEBF8] space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[13px] font-extrabold text-[#14111F]">
                                {b.label}
                              </span>
                              <span className="text-[12px] font-bold text-[#0F7B52]">
                                Reste {b.remaining} DH
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-[#EFEBF8] overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${b.pct}%`,
                                  backgroundColor: b.color,
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-semibold text-[#6F6A82]">
                              <span>
                                {b.spent.toLocaleString('fr-FR')} /{' '}
                                {b.limit.toLocaleString('fr-FR')} DH
                              </span>
                              <span>{b.pct} % utilisé</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-1 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsFamilyBudgetsSheetOpen(false);
                            navigateTo('J4_FAMILY_BUDGETS');
                          }}
                          className="w-full h-11 rounded-full btn-simple-primary text-[13px] font-bold flex items-center justify-center gap-2"
                        >
                          <span>Comprendre nos dépenses</span>
                          <ArrowRight size={15} strokeWidth={2.3} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsFamilyBudgetsSheetOpen(false)}
                          className="py-1.5 text-[12px] font-bold text-[#7D7693] hover:text-[#14111F] transition-colors"
                        >
                          Fermer
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Yasmine · Simple One Detail Bottom Sheet */}
                {isYasmineDetailSheetOpen && (() => {
                  const sheetChild =
                    householdMembers.find(
                      (m) => m.id === selectedSimpleOneChildId
                    ) || {
                      id: 'draft-yasmine',
                      name: 'Yasmine',
                    };
                  return (
                  <div
                    className="fixed inset-0 z-50 bg-[#14111F]/45 backdrop-blur-[2px] flex items-end justify-center"
                    onClick={() => setIsYasmineDetailSheetOpen(false)}
                  >
                    <div
                      className="w-full max-h-[85%] overflow-y-auto bg-white rounded-t-[24px] px-5 pt-3.5 pb-7 space-y-4 shadow-[0_-10px_30px_rgba(20,17,31,0.16)] border-t border-[#EFEBF8]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="w-10 h-1 rounded-full bg-[#E3DDF2] mx-auto" />

                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E1DF0] block">
                            {sheetChild.name} · Simple One
                          </span>
                          <h3 className="text-[18px] font-extrabold text-[#14111F] leading-snug mt-0.5">
                            Suivi de l'argent de poche
                          </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-[#F5F1FF] text-[#5E1DF0] text-[11px] font-extrabold">
                          Octobre
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8]">
                          <span className="text-[10px] font-semibold text-[#6F6A82] block">
                            Argent de poche
                          </span>
                          <p className="text-[14px] font-extrabold text-[#14111F] mt-0.5">
                            300 DH
                          </p>
                        </div>
                        <div className="p-3 rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8]">
                          <span className="text-[10px] font-semibold text-[#6F6A82] block">
                            Dépensé
                          </span>
                          <p className="text-[14px] font-extrabold text-[#14111F] mt-0.5">
                            120 DH
                          </p>
                        </div>
                        <div className="p-3 rounded-[16px] bg-[#ECFEF6] border border-[#D4F5E9]">
                          <span className="text-[10px] font-semibold text-[#0F7B52] block">
                            Disponible
                          </span>
                          <p className="text-[14px] font-extrabold text-[#0F7B52] mt-0.5">
                            180 DH
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="w-full h-2.5 rounded-full bg-[#EFEBF8] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#5E1DF0]"
                            style={{ width: '40%' }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#6F6A82]">
                          <span>120 DH utilisés</span>
                          <span>40 % du budget mensuel</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6A82] block">
                          Dernières opérations de Yasmine
                        </span>
                        {[
                          {
                            label: 'Librairie Papeterie',
                            date: '14 oct.',
                            amount: '-45 DH',
                          },
                          {
                            label: 'Cinéma Mégarama',
                            date: '09 oct.',
                            amount: '-50 DH',
                          },
                          {
                            label: 'Boulangerie Pâtisserie',
                            date: '04 oct.',
                            amount: '-25 DH',
                          },
                        ].map((tx) => (
                          <div
                            key={tx.label}
                            className="p-3 rounded-[14px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-center justify-between"
                          >
                            <div>
                              <p className="text-[13px] font-bold text-[#14111F]">
                                {tx.label}
                              </p>
                              <p className="text-[11px] font-medium text-[#6F6A82]">
                                {tx.date}
                              </p>
                            </div>
                            <span className="text-[13px] font-extrabold text-[#14111F]">
                              {tx.amount}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-1 flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsYasmineDetailSheetOpen(false);
                            openAllowanceSheet();
                          }}
                          className="w-full h-11 rounded-full btn-simple-primary text-[13px] font-bold flex items-center justify-center gap-2"
                        >
                          <span>Modifier l'argent de poche</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsYasmineDetailSheetOpen(false)}
                          className="py-1.5 text-[12px] font-bold text-[#7D7693] hover:text-[#14111F] transition-colors"
                        >
                          Fermer
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })()}
              </div>
            )}

            {/* ============================================================= */}
            {/* SUB-TAB 5: COMMUNAUTÉ */}
            {/* ============================================================= */}
            {monEspaceSubTab === 'COMMUNAUTE' && (
              <CommunityTabContent
                key={`communaute-${communityEntryCount}`}
                renderCategoryPersonalizeFooter={() =>
                  renderCategoryPersonalizeFooter('COMMUNAUTE', 'Communauté')
                }
              />
            )}

            {/* ============================================================= */}
            {/* SUB-TAB 6: INVESTIR */}
            {/* ============================================================= */}
            {monEspaceSubTab === 'INVESTIR' && (
              <div className="space-y-4">
                {getActiveCategoryWidgets('INVESTIR').map((w) =>
                  renderWidget(w.id)
                )}

                {/* Customization footer */}
                {renderCategoryPersonalizeFooter('INVESTIR', 'Investir')}
              </div>
            )}
          </div>
        )}

        {!isR1 && activeHubTab === 'MES_DEFIS' && <MesDefisTabContent />}

        {!isR1 && activeHubTab === 'LEARN_EARN' && <LearnAndEarnTabContent />}
      </div>

      {/* Dedicated Full-Screen 3-Step Verification Flow & Completion Experience */}
      {isVerifyFlowOpen && (() => {
        const currentFlowTx =
          challengeTransactions[verifyStepIndex] || challengeTransactions[0];

        return (
          <div className="fixed inset-0 z-50 bg-[#F7F4FE] flex flex-col">
            {/* Top Bar */}
            <header className="px-5 pt-4 pb-3 flex items-center justify-between gap-3 bg-[#F7F4FE]">
              <button
                type="button"
                onClick={() => {
                  setIsVerifyFlowOpen(false);
                  setIsCategoryPickerOpenInFlow(false);
                  setShowCompletionScreen(false);
                }}
                aria-label="Fermer"
                className="w-10 h-10 rounded-full bg-white shadow-[0_4px_14px_rgba(20,17,31,0.06)] border border-[#EFEBF8] flex items-center justify-center text-[#14111F] hover:bg-[#FAF8FF] transition-all shrink-0"
              >
                <ArrowRight size={18} className="rotate-180" />
              </button>

              {!showCompletionScreen ? (
                <span className="text-[13px] font-extrabold text-[#2F80ED] tabular-nums">
                  {verifyStepIndex + 1} sur {totalVerifyCount}
                </span>
              ) : (
                <span className="text-[13px] font-extrabold text-[#2F80ED] tabular-nums">
                  Défi terminé · {totalVerifyCount}/{totalVerifyCount}
                </span>
              )}

              <div className="px-2.5 py-1 rounded-full bg-[#DFF0FF] border border-[#BFE0FF] text-[#2F80ED] text-[12px] font-extrabold tabular-nums flex items-center gap-1 shrink-0">
                <Award
                  size={13}
                  strokeWidth={2.4}
                  className="text-[#4FA9FF]"
                />
                <span>{verifiedCount}/{totalVerifyCount}</span>
              </div>
            </header>

            {!showCompletionScreen && currentFlowTx ? (
              <div className="px-5 pt-1 pb-7 flex-1 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  {/* Sky-Blue Progress Bar & Warm Encouragement */}
                  <div className="rounded-[20px] bg-[#F2F8FF] border border-[#BFE0FF] p-4 space-y-2.5 shadow-[0_8px_20px_-8px_rgba(79,169,255,0.14)]">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-bold text-[#14111F]">
                        Progression du défi
                      </span>
                      <span className="font-extrabold text-[#2F80ED] tabular-nums">
                        {verifiedCount}/{totalVerifyCount} vérifiés
                      </span>
                    </div>

                    <div className="w-full h-2 bg-[#DFF0FF] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4FA9FF] rounded-full transition-all duration-300"
                        style={{ width: `${challengeProgressPct}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      {verifiedCount > 0 ? (
                        <span className="w-4 h-4 rounded-full bg-[#DFF0FF] text-[#2F80ED] flex items-center justify-center shrink-0">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      ) : (
                        <Sparkles
                          size={14}
                          className="text-[#4FA9FF] shrink-0"
                        />
                      )}
                      <p className="text-[12px] font-semibold text-[#2F80ED] leading-snug">
                        {challengeEncouragementText}
                      </p>
                    </div>
                  </div>

                  {/* Single Transaction Spotlight Card */}
                  <div className="card-simple p-6 text-center space-y-5 border border-[#BFE0FF]">
                    <div className="flex flex-col items-center space-y-3">
                      <CategoryIcon
                        category={currentFlowTx.category}
                        size="lg"
                        variant="skyBlue"
                      />
                      <div className="space-y-1">
                        <h3 className="text-[20px] font-extrabold text-[#14111F] leading-snug">
                          {currentFlowTx.merchant}
                        </h3>
                        <p className="text-[13px] font-medium text-[#7D7693]">
                          {currentFlowTx.date}
                        </p>
                      </div>
                    </div>

                    <div className="py-2">
                      <span className="text-[30px] font-extrabold text-[#2F80ED] tabular-nums tracking-tight">
                        −{formatDH(currentFlowTx.amount)}
                      </span>
                    </div>

                    {/* Current Category Box */}
                    <div className="rounded-[18px] bg-[#F2F8FF] border border-[#BFE0FF] p-3.5 flex items-center justify-between gap-3 text-left">
                      <div>
                        <span className="text-[11px] font-semibold text-[#5C6F84] block">
                          Catégorie actuelle
                        </span>
                        <span className="text-[15px] font-extrabold text-[#2F80ED] mt-0.5 block">
                          {currentFlowTx.category}
                        </span>
                      </div>
                      <CategoryIcon
                        category={currentFlowTx.category}
                        size="sm"
                        variant="skyBlue"
                      />
                    </div>
                  </div>
                </div>

                {/* Two Clear Actions */}
                <div className="pt-4 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      bulkVerifyTransactions([currentFlowTx.id]);
                      dismissToast();
                      advanceOrFinishVerifyFlow(currentFlowTx.id);
                    }}
                    className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_-4px_rgba(128,0,235,0.4)] transition-all active:scale-[0.99]"
                  >
                    <Check size={17} strokeWidth={2.5} />
                    <span>Oui, c'est la bonne catégorie</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCategoryPickerOpenInFlow(true)}
                    className="w-full h-12 rounded-full bg-white hover:bg-[#F2F8FF] text-[#2F80ED] border border-[#4FA9FF] shadow-[0_2px_8px_rgba(79,169,255,0.08)] text-[14px] font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
                  >
                    <Edit3 size={15} className="text-[#4FA9FF]" />
                    <span>Modifier la catégorie</span>
                  </button>
                </div>
              </div>
            ) : (
              /* 6. COMPLETION EXPERIENCE */
              <div className="px-5 pt-2 pb-7 flex-1 flex flex-col justify-between overflow-y-auto">
                <div className="my-auto space-y-5">
                  <div className="card-simple p-6 text-center space-y-5 border border-[#BFE0FF]">
                    {/* Personal Challenge Sky-Blue Achievement Illustration */}
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="w-20 h-20 rounded-[26px] bg-gradient-to-br from-[#4FA9FF] to-[#2F80ED] flex items-center justify-center shadow-[0_12px_28px_-6px_rgba(47,128,237,0.35)]">
                        <Award
                          size={38}
                          className="text-white"
                          strokeWidth={2.1}
                        />
                      </div>
                      <span className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-[#DFF0FF] text-[#2F80ED] border-2 border-white flex items-center justify-center shadow-xs">
                        <Check size={16} strokeWidth={3} />
                      </span>
                    </div>

                    {/* Completed Progress */}
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-[#2F80ED] tabular-nums">
                        Progression complétée · {totalVerifyCount}/{totalVerifyCount}
                      </span>
                      <div className="w-36 h-2 bg-[#DFF0FF] rounded-full overflow-hidden mx-auto">
                        <div className="h-full w-full bg-[#4FA9FF] rounded-full" />
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1.5">
                      <h2 className="text-[22px] font-extrabold text-[#14111F] leading-tight">
                        Vous avez l'œil !
                      </h2>
                      <p className="text-[13.5px] text-[#6B6380] leading-relaxed">
                        Vos {totalVerifyCount} achats sont vérifiés. Vos analyses gagnent en
                        précision !
                      </p>
                    </div>

                    {/* Badge Reward Only (Centered) */}
                    <div className="rounded-[20px] bg-[#F2F8FF] border border-[#BFE0FF] py-3.5 px-5 text-center flex flex-col items-center justify-center gap-0.5">
                      <span className="text-[11px] font-semibold text-[#5C6F84] block">
                        Badge débloqué
                      </span>
                      <span className="text-[15px] font-extrabold text-[#2F80ED]">
                        {verifyChallenge?.badgeName || 'Œil Attentif'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsVerifyFlowOpen(false);
                    setIsCategoryPickerOpenInFlow(false);
                    setShowCompletionScreen(false);
                  }}
                  className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_-4px_rgba(128,0,235,0.4)] transition-all active:scale-[0.99]"
                >
                  <span>Continuer vers mes dépenses</span>
                </button>
              </div>
            )}

            {/* Category Selector Bottom Sheet inside the Verification Flow */}
            {isCategoryPickerOpenInFlow && currentFlowTx && (
              <div
                className="fixed inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-end justify-center"
                onClick={() => setIsCategoryPickerOpenInFlow(false)}
              >
                <div
                  className="w-full bg-white rounded-t-[30px] p-5 shadow-2xl border-t border-[#BFE0FF]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-10 h-1.5 bg-[#D6EBFF] rounded-full mx-auto mb-3.5" />
                  <h3 className="text-[17px] font-extrabold text-[#14111F]">
                    Modifier la catégorie
                  </h3>
                  <p className="text-[12px] text-[#7D7693] mt-0.5">
                    {currentFlowTx.merchant} · −{formatDH(currentFlowTx.amount)}
                  </p>

                  <div className="mt-3.5 space-y-2 max-h-[50vh] overflow-y-auto pr-0.5">
                    {selectableCategories.map((cat) => {
                      const isCurrent = currentFlowTx.category === cat;

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            recategorizeTransaction(currentFlowTx.id, cat);
                            dismissToast();
                            setIsCategoryPickerOpenInFlow(false);
                            advanceOrFinishVerifyFlow(currentFlowTx.id);
                          }}
                          className={`w-full p-3 rounded-[20px] flex items-center justify-between border text-left transition-all ${
                            isCurrent
                              ? 'border-[#4FA9FF] bg-[#F2F8FF]'
                              : 'border-[#E6F2FF] hover:bg-[#F8FBFF]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <CategoryIcon
                              category={cat}
                              size="md"
                              variant="skyBlue"
                            />
                            <div>
                              <p className="text-[14px] font-bold text-[#14111F]">
                                {cat}
                              </p>
                              <p className="text-[11px] text-[#7D7693]">
                                {CATEGORY_META[cat].description}
                              </p>
                            </div>
                          </div>
                          {isCurrent && (
                            <Check
                              size={17}
                              className="text-[#2F80ED] shrink-0"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCategoryPickerOpenInFlow(false)}
                    className="mt-3.5 w-full h-11 rounded-full bg-[#F2F8FF] hover:bg-[#E5F2FF] text-[#2F80ED] border border-[#BFE0FF] text-[13px] font-bold transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      <BottomBankingNav />
    </div>
  );
};

// PHASE I — SCREENS I1, I2, I3 & WIDGET_DETAIL
const CATEGORY_LABELS: Record<MonEspaceSubTab, string> = {
  DEPENSES: 'Dépenses',
  BUDGETS: 'Budgets',
  PROJETS: 'Projets',
  FOYER: 'Foyer',
  COMMUNAUTE: 'Communauté',
  INVESTIR: 'Investir',
};

const CATEGORY_SUBTITLES: Record<MonEspaceSubTab, string> = {
  DEPENSES: 'Personnalisez le suivi et l’analyse de vos dépenses.',
  BUDGETS: 'Personnalisez vos repères et le suivi de vos budgets.',
  PROJETS: 'Personnalisez le suivi de vos objectifs d’épargne.',
  FOYER: 'Personnalisez le suivi des dépenses et projets de votre foyer.',
  COMMUNAUTE:
    'Personnalisez le suivi de vos cagnottes, dépenses partagées et remboursements de groupe.',
  INVESTIR: 'Personnalisez votre espace de découverte et de simulation.',
};

export const PersonalizeAndCatalogScreens: React.FC = () => {
  const {
    currentScreen,
    monEspaceSubTab,
    widgets,
    activeWidgets,
    getCategoryWidgets,
    getActiveCategoryWidgets,
    toggleWidgetActive,
    moveWidgetOrder,
    selectedWidgetId,
    showSimulatedPortfolio,
    setShowSimulatedPortfolio,
    mainAccountBalance,
    savingsGoal,
    navigateTo,
    showToast,
  } = usePFM();

  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuWidgetId, setOpenMenuWidgetId] = useState<string | null>(null);
  const [reorderSheetOpen, setReorderSheetOpen] = useState<boolean>(
    currentScreen === 'I2_PERSONALIZE_LAYOUT'
  );
  const [focusedReorderWidgetId, setFocusedReorderWidgetId] = useState<
    string | null
  >(null);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [simMonthlyInvest, setSimMonthlyInvest] = useState<number>(500);
  const [simHorizonYears, setSimHorizonYears] = useState<number>(5);
  const [simRiskProfile, setSimRiskProfile] = useState<
    'PRUDENT' | 'EQUILIBRE' | 'DYNAMIQUE'
  >('EQUILIBRE');

  const categoryLabel = CATEGORY_LABELS[monEspaceSubTab] || 'Dépenses';
  const categorySubtitle =
    CATEGORY_SUBTITLES[monEspaceSubTab] ||
    `Enrichissez votre espace ${categoryLabel}`;

  // UNIFIED WIDGET MANAGEMENT SCREEN (+ Widgets [Catégorie])
  if (
    currentScreen === 'I1_WIDGET_CATALOG' ||
    currentScreen === 'I2_PERSONALIZE_LAYOUT'
  ) {
    const allCategoryWidgets = getCategoryWidgets(monEspaceSubTab);
    const activeCategoryWidgets = getActiveCategoryWidgets(monEspaceSubTab);

    const filteredWidgets = allCategoryWidgets.filter((w) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q)
      );
    });

    const handleDropOnWidget = (targetWidgetId: string) => {
      if (!draggedWidgetId || draggedWidgetId === targetWidgetId) {
        setDraggedWidgetId(null);
        return;
      }
      const fromIdx = activeCategoryWidgets.findIndex(
        (w) => w.id === draggedWidgetId
      );
      const toIdx = activeCategoryWidgets.findIndex(
        (w) => w.id === targetWidgetId
      );
      if (fromIdx === -1 || toIdx === -1) {
        setDraggedWidgetId(null);
        return;
      }
      const direction = fromIdx > toIdx ? 'UP' : 'DOWN';
      const steps = Math.abs(fromIdx - toIdx);
      for (let i = 0; i < steps; i++) {
        moveWidgetOrder(draggedWidgetId, direction);
      }
      setDraggedWidgetId(null);
    };

    return (
      <div
        className="min-h-full flex flex-col bg-simple-canvas pb-6"
        onClick={() => {
          if (openMenuWidgetId) setOpenMenuWidgetId(null);
        }}
      >
        <MobileHeader
          title={`+ Widgets ${categoryLabel}`}
          subtitle={categorySubtitle}
          onBack={() =>
            navigateTo('C1_HUB', {
              hubTab: 'MON_ESPACE',
              monEspaceSubTab,
            })
          }
        />

        <div className="px-5 pt-2 pb-6 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Widget Search scoped to current category */}
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7D7693]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Rechercher un widget ${categoryLabel}…`}
                className="w-full h-12 pl-11 pr-4 rounded-full bg-white border border-[#EFEBF8] shadow-2xs text-[13px] text-[#14111F] placeholder:text-[#8E87A6] focus:outline-none focus:border-[#5E1DF0]"
              />
            </div>

            {/* Unified List Header */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-[14px] font-extrabold text-[#14111F]">
                  Catalogue · {categoryLabel}
                </h3>
                <p className="text-[12px] text-[#7D7693]">
                  {activeCategoryWidgets.length} sur {allCategoryWidgets.length}{' '}
                  widget{allCategoryWidgets.length > 1 ? 's' : ''} affiché
                  {activeCategoryWidgets.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* One Unified List of Available & Already Added Widgets */}
            {filteredWidgets.length > 0 ? (
              <div className="space-y-3">
                {filteredWidgets.map((w) => {
                  const isAdded = w.defaultActive;
                  const isMenuOpen = openMenuWidgetId === w.id;

                  return (
                    <div
                      key={w.id}
                      className={`card-simple p-4 transition-all relative ${
                        isAdded
                          ? 'border border-[#E4DAF8] bg-white'
                          : 'border border-[#EFEBF8] bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[14.5px] font-extrabold text-[#14111F] leading-snug">
                            {w.title}
                          </h4>
                          <p className="text-[12px] text-[#7D7693] mt-1 leading-relaxed">
                            {w.description}
                          </p>
                          {w.previewMetric && (
                            <p className="text-[11px] font-semibold text-[#5E1DF0] mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#F5F1FF] tabular-nums">
                              {w.previewMetric}
                            </p>
                          )}
                        </div>

                        {/* Action Area: Before Adding ("Ajouter") vs After Adding ("Affiché" + ⋯) */}
                        <div className="shrink-0 flex items-center gap-1.5 relative">
                          {!isAdded ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuWidgetId(null);
                                toggleWidgetActive(w.id, true);
                                showToast(
                                  `Widget « ${w.title} » ajouté à ${categoryLabel}`
                                );
                              }}
                              className="h-9 px-3.5 rounded-full bg-[#F2EDFF] text-[#5E1DF0] hover:bg-[#E5DCFF] text-[12px] font-bold transition-colors inline-flex items-center gap-1 active:scale-[0.98]"
                            >
                              <Plus size={14} strokeWidth={2.5} />
                              <span>Ajouter</span>
                            </button>
                          ) : (
                            <>
                              <span className="px-2.5 py-1 rounded-full bg-[#E7F7F0] text-[#0F7B52] text-[11px] font-extrabold inline-flex items-center gap-1">
                                <Check size={11} strokeWidth={3} />
                                <span>Affiché</span>
                              </span>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuWidgetId((prev) =>
                                    prev === w.id ? null : w.id
                                  );
                                }}
                                aria-label={`Options pour ${w.title}`}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                  isMenuOpen
                                    ? 'bg-[#5E1DF0] text-white'
                                    : 'bg-[#F5F1FF] hover:bg-[#EAE2FF] text-[#5E1DF0]'
                                }`}
                              >
                                <MoreHorizontal size={16} strokeWidth={2.3} />
                              </button>

                              {/* Three-dot Dropdown Menu (Déplacer / Retirer) */}
                              {isMenuOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-10 w-44 rounded-[18px] bg-white border border-[#EFEBF8] shadow-[0_14px_30px_rgba(20,17,31,0.14)] py-1.5 z-30 divide-y divide-[#F5F2FA]"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuWidgetId(null);
                                      setFocusedReorderWidgetId(w.id);
                                      setReorderSheetOpen(true);
                                    }}
                                    className="w-full px-3.5 py-2.5 text-left text-[12.5px] font-bold text-[#14111F] hover:bg-[#FAF8FE] flex items-center gap-2.5 transition-colors"
                                  >
                                    <ArrowUpDown
                                      size={14}
                                      className="text-[#5E1DF0] shrink-0"
                                    />
                                    <span>Déplacer</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuWidgetId(null);
                                      toggleWidgetActive(w.id, false);
                                      showToast(
                                        `Widget « ${w.title} » retiré de ${categoryLabel}`
                                      );
                                    }}
                                    className="w-full px-3.5 py-2.5 text-left text-[12.5px] font-bold text-rose-600 hover:bg-rose-50/60 flex items-center gap-2.5 transition-colors"
                                  >
                                    <EyeOff size={14} className="shrink-0" />
                                    <span>Retirer</span>
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <section className="card-simple p-6 text-center space-y-2.5">
                <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center mx-auto">
                  <Search size={19} />
                </div>
                <h4 className="text-[15px] font-extrabold text-[#14111F]">
                  Aucun widget trouvé
                </h4>
                <p className="text-[12px] text-[#7D7693] leading-relaxed">
                  Essayez un autre mot-clé pour la catégorie {categoryLabel}.
                </p>
              </section>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              navigateTo('C1_HUB', {
                hubTab: 'MON_ESPACE',
                monEspaceSubTab,
              })
            }
            className="mt-4 w-full h-[50px] btn-simple-primary text-[14px] font-bold"
          >
            Retour à {categoryLabel}
          </button>
        </div>

        {/* LIGHTWEIGHT REORDER INTERFACE ("Déplacer") */}
        {reorderSheetOpen && (
          <div
            className="fixed inset-0 z-50 bg-[#14111F]/45 backdrop-blur-[2px] flex items-end justify-center"
            onClick={() => {
              setReorderSheetOpen(false);
              if (currentScreen === 'I2_PERSONALIZE_LAYOUT') {
                navigateTo('I1_WIDGET_CATALOG', { monEspaceSubTab });
              }
            }}
          >
            <div
              className="w-full max-w-[412px] max-h-[82vh] flex flex-col bg-white rounded-t-[28px] px-5 pt-3.5 pb-6 shadow-[0_-12px_34px_rgba(20,17,31,0.18)] border-t border-[#EFEBF8]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1.5 rounded-full bg-[#E3DDF2] mx-auto mb-3" />

              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#F3EFFA]">
                <div>
                  <span className="text-[11px] font-bold text-[#5E1DF0] uppercase tracking-wide block">
                    Ordre d’affichage · {categoryLabel}
                  </span>
                  <h3 className="text-[17px] font-extrabold text-[#14111F] mt-0.5">
                    Déplacer les widgets affichés
                  </h3>
                  <p className="text-[12px] text-[#7D7693] mt-0.5">
                    Réorganisez l’ordre d’apparition sur votre page {categoryLabel}.
                  </p>
                </div>
              </div>

              <div className="py-3.5 space-y-2.5 overflow-y-auto flex-1 pr-0.5">
                {activeCategoryWidgets.length > 0 ? (
                  activeCategoryWidgets.map((w, idx) => {
                    const isFocused = focusedReorderWidgetId === w.id;
                    return (
                      <div
                        key={w.id}
                        draggable
                        onDragStart={() => setDraggedWidgetId(w.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropOnWidget(w.id)}
                        className={`p-3.5 rounded-[20px] border flex items-center justify-between gap-3 transition-all ${
                          isFocused
                            ? 'bg-[#FAF7FF] border-[#8000EB]/40 ring-1 ring-[#8000EB]/20'
                            : 'bg-[#FAF8FE] border-[#EFEBF8]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="w-7 h-7 rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-[12px] font-extrabold flex items-center justify-center shrink-0 tabular-nums">
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13.5px] font-extrabold text-[#14111F] truncate">
                              {w.title}
                            </p>
                            <p className="text-[11px] text-[#7D7693] truncate">
                              {w.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => {
                              setFocusedReorderWidgetId(w.id);
                              moveWidgetOrder(w.id, 'UP');
                            }}
                            aria-label={`Monter ${w.title}`}
                            className="w-9 h-9 rounded-full bg-white border border-[#E5DDF7] text-[#5E1DF0] hover:bg-[#F5F1FF] flex items-center justify-center disabled:opacity-30 transition-colors"
                          >
                            <ArrowUp size={15} strokeWidth={2.4} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === activeCategoryWidgets.length - 1}
                            onClick={() => {
                              setFocusedReorderWidgetId(w.id);
                              moveWidgetOrder(w.id, 'DOWN');
                            }}
                            aria-label={`Descendre ${w.title}`}
                            className="w-9 h-9 rounded-full bg-white border border-[#E5DDF7] text-[#5E1DF0] hover:bg-[#F5F1FF] flex items-center justify-center disabled:opacity-30 transition-colors"
                          >
                            <ArrowDown size={15} strokeWidth={2.4} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-5 text-center text-xs text-[#7D7693]">
                    Aucun widget affiché dans {categoryLabel}.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setReorderSheetOpen(false);
                  if (currentScreen === 'I2_PERSONALIZE_LAYOUT') {
                    navigateTo('I1_WIDGET_CATALOG', { monEspaceSubTab });
                  }
                }}
                className="mt-2 w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-bold transition-colors"
              >
                Terminer
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // SCREEN I3 — Lamia discovers investing (Chapter 5)
  if (currentScreen === 'I3_INVEST_DISCOVERY') {
    const totalContributed = simMonthlyInvest * 12 * simHorizonYears;
    const isInvestWidgetAdded = activeWidgets.some(
      (w) => w.id === 'w-mes-placements'
    );

    // Annual estimated rate based on selected profile
    const annualRate =
      simRiskProfile === 'PRUDENT' ? 0.035 : simRiskProfile === 'EQUILIBRE' ? 0.055 : 0.075;
    const monthlyRate = annualRate / 12;
    const totalMonths = simHorizonYears * 12;
    const estimatedValue = Math.round(
      simMonthlyInvest * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate)
    );
    const estimatedGain = estimatedValue - totalContributed;

    return (
      <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
        <MobileHeader
          title="Découvrir l'investissement"
          subtitle="Exploration pédagogique & simulations"
          onBack={() => navigateTo('C1_HUB', { hubTab: 'MON_ESPACE' })}
        />

        <div className="p-5 space-y-4 flex-1">
          {/* Wealth Overview Card */}
          <section className="card-simple p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#5E1DF0]">
                Patrimoine global · Octobre 2026
              </span>
              <span className="text-[11px] text-[#7D7693]">Simple Banking</span>
            </div>

            <div className="pt-1">
              <span className="text-xs text-[#7D7693] block">Total avoirs disponibles & projets</span>
              <p className="text-[28px] font-extrabold text-[#14111F] tabular-nums mt-0.5">
                {formatDH(mainAccountBalance + savingsGoal.savedAmount + (showSimulatedPortfolio ? 14500 : 0), true)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
              <div className="p-3 rounded-[18px] bg-[#F7F4FE] border border-[#EFEBF8]">
                <span className="text-[#7D7693] block text-[11px]">Compte principal</span>
                <span className="font-extrabold text-[#14111F] tabular-nums mt-0.5 block">
                  {formatDH(mainAccountBalance, true)}
                </span>
              </div>
              <div className="p-3 rounded-[18px] bg-[#F7F4FE] border border-[#EFEBF8]">
                <span className="text-[#7D7693] block text-[11px]">Projet Voyage (Épargne)</span>
                <span className="font-extrabold text-[#5E1DF0] tabular-nums mt-0.5 block">
                  {formatDH(savingsGoal.savedAmount)}
                </span>
              </div>
            </div>
          </section>

          {/* Dual Portfolio State: No holdings (Real customer state) vs Explicit Demo Scenario */}
          {showSimulatedPortfolio ? (
            <section className="card-simple p-5 space-y-4 border-2 border-[#5E1DF0]/20">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2.5 py-1 rounded-full bg-[#EAE2FF] text-[#5E1DF0] text-[10px] font-extrabold">
                    Données fictives de démonstration
                  </span>
                  <h3 className="text-[17px] font-extrabold text-[#14111F] mt-2">
                    Portefeuille fictif Simple Invest
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSimulatedPortfolio(false)}
                  className="text-xs text-[#7D7693] hover:underline"
                >
                  Masquer
                </button>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-xs text-[#7D7693] block">Valorisation simulée</span>
                  <span className="text-[26px] font-extrabold text-[#14111F] tabular-nums">
                    14 500 DH
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-[#E7F7F0] text-[#0F7B52] text-xs font-extrabold">
                    +4,8 % (+660 DH)
                  </span>
                  <span className="text-[11px] text-[#7D7693] block mt-1">Depuis ouverture</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#F2EFFA]">
                <p className="text-[12px] font-bold text-[#14111F]">
                  Répartition indicative :
                </p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#7D7693]">Fonds Monétaire Court Terme (40 %)</span>
                    <span className="font-bold tabular-nums">5 800 DH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7D7693]">Obligations d'État Maroc (35 %)</span>
                    <span className="font-bold tabular-nums">5 075 DH</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7D7693]">Actions Durables & Tech (25 %)</span>
                    <span className="font-bold tabular-nums">3 625 DH</span>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="card-simple p-5 space-y-3.5">
              <div className="w-12 h-12 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center">
                <Landmark size={23} />
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-xs font-semibold">
                Aucun portefeuille actif · Découverte libre
              </span>
              <h2 className="text-[19px] font-extrabold text-[#14111F] leading-snug">
                Explorez l’investissement à votre rythme, sans modifier vos priorités actuelles
              </h2>
              <p className="text-[13px] text-[#7D7693] leading-relaxed">
                Vous avez déjà constitué <strong>2 650 DH</strong> sur votre Projet Voyage et disposez de <strong>3 075,33 DH</strong> sur votre compte principal. Lorsque vous souhaiterez préparer des projets à plus long terme (3 à 8 ans), cette section vous aide à comprendre les fondamentaux.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleWidgetActive('w-mes-placements', !isInvestWidgetAdded);
                    showToast(
                      isInvestWidgetAdded
                        ? 'Widget Mes placements retiré de Mon espace'
                        : 'Widget « Mes placements » ajouté à Mon espace !'
                    );
                  }}
                  className="w-full h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#E5DCFF]"
                >
                  <Check size={15} />
                  <span>
                    {isInvestWidgetAdded
                      ? 'Widget « Mes placements » actif dans Mon espace'
                      : 'Épingler « Mes placements » dans Mon espace'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSimulatedPortfolio(true)}
                  className="w-full h-10 rounded-full bg-white border border-[#DED4F8] text-[#5E1DF0] text-xs font-semibold hover:bg-[#FAF8FF]"
                >
                  Visualiser un exemple de portefeuille fictif (Démo)
                </button>
              </div>
            </section>
          )}

          {/* Interactive Simulator with Risk Profile Selection */}
          <section className="card-simple p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-extrabold text-[#14111F]">
                Simulateur pédagogique d’investissement
              </h3>
            </div>

            {/* Risk profile selection */}
            <div>
              <span className="text-xs text-[#7D7693] block mb-2">Profil de risque envisagé :</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'PRUDENT', label: 'Prudent', rate: '~3,5 %' },
                  { id: 'EQUILIBRE', label: 'Équilibré', rate: '~5,5 %' },
                  { id: 'DYNAMIQUE', label: 'Dynamique', rate: '~7,5 %' },
                ].map((prof) => (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => setSimRiskProfile(prof.id as any)}
                    className={`p-2.5 rounded-[18px] text-center transition-all ${
                      simRiskProfile === prof.id
                        ? 'bg-[#5E1DF0] text-white shadow-xs'
                        : 'bg-[#F7F4FE] text-[#7D7693] border border-[#EFEBF8]'
                    }`}
                  >
                    <span className="text-xs font-bold block">{prof.label}</span>
                    <span className="text-[10px] opacity-80 block">{prof.rate}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly amount slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7D7693]">Versement mensuel régulier</span>
                <span className="font-extrabold text-[#5E1DF0] tabular-nums text-[14px]">
                  {formatDH(simMonthlyInvest)} / mois
                </span>
              </div>
              <input
                type="range"
                min={200}
                max={2000}
                step={100}
                value={simMonthlyInvest}
                onChange={(e) => setSimMonthlyInvest(Number(e.target.value))}
                className="w-full accent-[#5E1DF0]"
              />
            </div>

            {/* Duration selector */}
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#7D7693]">Horizon temporel</span>
              <div className="flex gap-1.5">
                {[3, 5, 8, 10].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSimHorizonYears(yr)}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      simHorizonYears === yr
                        ? 'bg-[#5E1DF0] text-white'
                        : 'bg-[#F5F1FF] text-[#7D7693]'
                    }`}
                  >
                    {yr} ans
                  </button>
                ))}
              </div>
            </div>

            {/* Projected outcome box */}
            <div className="p-4 rounded-[22px] bg-[#F7F4FE] border border-[#EFEBF8] space-y-2">
              <div className="flex justify-between items-baseline text-xs">
                <span className="text-[#7D7693]">Cumul des versements</span>
                <span className="font-bold text-[#14111F] tabular-nums">
                  {formatDH(totalContributed)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-[#EAE4F5]">
                <span className="text-xs text-[#7D7693]">Capital estimé projeté</span>
                <span className="text-[18px] font-extrabold text-[#5E1DF0] tabular-nums">
                  ~{formatDH(estimatedValue)}
                </span>
              </div>
              <p className="text-[11px] text-[#8E87A6] leading-tight pt-1">
                Hypothèse purement indicative à taux constant ({annualRate * 100} %/an). Les performances passées ne préjugent pas des performances futures. Capital non garanti.
              </p>
            </div>
          </section>

          {/* Simple Invest Discovery Card */}
          <section className="card-simple p-5 space-y-3">
            <h3 className="text-[15px] font-extrabold text-[#14111F]">
              Simple Invest en 3 points
            </h3>

            <div className="p-3.5 rounded-[20px] bg-[#FAF8FE] border border-[#EFEBF8]">
              <p className="text-[13px] font-bold text-[#14111F]">
                1. Gestion pilotée par des experts
              </p>
              <p className="text-[12px] text-[#7D7693] mt-1 leading-relaxed">
                Des professionnels agréés gèrent les arbitrages selon le profil de risque que vous avez choisi.
              </p>
            </div>

            <div className="p-3.5 rounded-[20px] bg-[#FAF8FE] border border-[#EFEBF8]">
              <p className="text-[13px] font-bold text-[#14111F]">
                2. Accessible dès 300 DH / mois
              </p>
              <p className="text-[12px] text-[#7D7693] mt-1 leading-relaxed">
                Pas besoin d’un gros capital de départ : versez régulièrement et ajustez vos versements à tout moment.
              </p>
            </div>

            <div className="p-3.5 rounded-[20px] bg-[#FAF8FE] border border-[#EFEBF8]">
              <p className="text-[13px] font-bold text-[#14111F]">
                3. Zéro paperasse, 100 % dans Simple
              </p>
              <p className="text-[12px] text-[#7D7693] mt-1 leading-relaxed">
                Suivez votre progression et vos relevés directement dans votre espace bancaire habituel.
              </p>
            </div>
          </section>

          <button
            type="button"
            onClick={() =>
              navigateTo('G2_COURSE_DETAIL', { courseId: 'course-invest-5' })
            }
            className="w-full h-[52px] btn-simple-primary text-[14px] font-semibold flex items-center justify-center gap-2"
          >
            <BookOpen size={17} />
            <span>Suivre la leçon « Découvrir l’investissement »</span>
          </button>
        </div>
      </div>
    );
  }

  // UNIVERSAL WIDGET DETAIL SCREEN
  const currentWidget =
    widgets.find((w) => w.id === selectedWidgetId) || widgets[0];
  const widgetCategoryLabel =
    CATEGORY_LABELS[currentWidget.category] || categoryLabel;

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
      <MobileHeader
        title={currentWidget.title}
        subtitle={`Widget · ${widgetCategoryLabel}`}
        onBack={() =>
          navigateTo('I1_WIDGET_CATALOG', {
            monEspaceSubTab: currentWidget.category,
          })
        }
      />

      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <section className="card-simple p-5 space-y-3.5">
            <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center">
              <Layers size={21} />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-xs font-semibold">
              {widgetCategoryLabel} · {currentWidget.objective}
            </span>
            <h2 className="text-[19px] font-extrabold text-[#14111F]">
              {currentWidget.title}
            </h2>
            <p className="text-[13px] text-[#7D7693] leading-relaxed">
              {currentWidget.description}
            </p>

            {currentWidget.previewMetric && (
              <div className="p-4 rounded-[20px] bg-[#F6F3FF]">
                <span className="text-[11px] font-medium text-[#7D7693] block">
                  Aperçu avec vos données actuelles
                </span>
                <span className="text-[15px] font-extrabold text-[#5E1DF0] tabular-nums mt-0.5 block">
                  {currentWidget.previewMetric}
                </span>
              </div>
            )}
          </section>

          <section className="card-simple p-4.5 flex items-center justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#14111F]">
                Afficher dans {widgetCategoryLabel}
              </p>
              <p className="text-[12px] text-[#7D7693]">
                {currentWidget.defaultActive
                  ? `Visible dans votre espace ${widgetCategoryLabel}`
                  : `Ajoutez ce widget à votre espace ${widgetCategoryLabel}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggleWidgetActive(currentWidget.id)}
              className={`h-9 px-4 rounded-full text-xs font-bold ${
                currentWidget.defaultActive
                  ? 'bg-[#F5F2FA] text-[#7D7693]'
                  : 'bg-[#5E1DF0] text-white'
              }`}
            >
              {currentWidget.defaultActive ? 'Masquer' : '+ Activer'}
            </button>
          </section>
        </div>

        <button
          type="button"
          onClick={() =>
            navigateTo('C1_HUB', {
              hubTab: 'MON_ESPACE',
              monEspaceSubTab: currentWidget.category,
            })
          }
          className="w-full h-[52px] btn-simple-primary text-[15px] font-semibold"
        >
          Retour à {widgetCategoryLabel}
        </button>
      </div>
    </div>
  );
};
