import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  ChevronRight,
  Check,
  SlidersHorizontal,
  Bell,
  Send,
  BookOpen,
  CreditCard,
  Calendar,
  Store,
  CheckCircle2,
  Edit3,
  Paperclip,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Wallet,
  Info,
  ShoppingBag,
  Coins,
  PieChart,
  User,
  Users,
  Repeat,
  Clock,
  ChevronDown,
  XCircle,
  RefreshCw,
  Target,
  Award,
  CalendarCheck,
  Flag,
} from 'lucide-react';
import { usePFM } from '../context/PFMContext';
import {
  CATEGORY_META,
  IMPULSIF_COURSE_IMAGE_URL,
  LAMIA_AVATAR_URL,
  formatDH,
  INITIAL_RECURRING_CHARGES,
} from '../data/initialData';
import {
  BilanMonthKey,
  BudgetScope,
  PeriodFilter,
  SpendingCategory,
  SubscriptionFrequency,
} from '../types/pfm';
import {
  BottomBankingNav,
  CategoryIcon,
  InteractiveDonutChart,
  MobileHeader,
  SimpleBarsIcon,
  SimpleRobotIcon,
} from './SharedUI';

// SCREEN D1 — Mon bilan (Detailed monthly financial balance screen)
export const SpendingAnalysisScreen: React.FC = () => {
  const {
    bilanMonth,
    setBilanMonth,
    bilanAccount,
    setBilanAccount,
    eligibleAccounts,
    bilanAnalytics,
    transactions,
    navigateTo,
    goBack,
    screenHistory,
  } = usePFM();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [evolutionPeriod, setEvolutionPeriod] = useState<'3M' | '6M' | '12M'>(
    '3M'
  );
  const [evolutionAccount, setEvolutionAccount] =
    useState<string>('TOUS_COMPTES');
  const [isEvoAccountMenuOpen, setIsEvoAccountMenuOpen] = useState(false);
  const [selectedEvoMonthKey, setSelectedEvoMonthKey] =
    useState<string>('2026-10');

  const availableMonths: { id: BilanMonthKey; label: string }[] = [
    { id: '2026-10', label: 'Octobre 2026' },
    { id: '2026-09', label: 'Septembre 2026' },
    { id: '2026-08', label: 'Août 2026' },
  ];

  const handleBackToDepenses = () => {
    const lastScreen =
      screenHistory.length > 0
        ? screenHistory[screenHistory.length - 1]
        : null;
    if (lastScreen === 'C1_HUB') {
      goBack();
    } else {
      navigateTo('C1_HUB', {
        hubTab: 'MON_ESPACE',
        monEspaceSubTab: 'DEPENSES',
      });
    }
  };

  const varPct = bilanAnalytics.expensesVariationPct;
  const isIncrease = varPct !== null && varPct > 0;
  const isDecrease = varPct !== null && varPct < 0;
  const netDiff = bilanAnalytics.netDifference;

  // Evolution chart data calculation across 3, 6, or 12 months for the selected card account filter
  const resolvedEvoAccount =
    eligibleAccounts.find((a) => a.id === evolutionAccount) ||
    eligibleAccounts[0];
  const hasMainAccountData =
    resolvedEvoAccount.id === 'TOUS_COMPTES' ||
    resolvedEvoAccount.id === 'COMPTE_PRINCIPAL';

  const computeRealMonthTotals = (mKey: BilanMonthKey) => {
    if (!hasMainAccountData) {
      return { income: 0, expenses: 0 };
    }
    const mTxs = transactions.filter(
      (tx) =>
        tx.monthKey === mKey &&
        tx.type !== 'INTERNAL_TRANSFER' &&
        (resolvedEvoAccount.id === 'TOUS_COMPTES'
          ? tx.account === 'COMPTE_PRINCIPAL' ||
            tx.account === 'COMPTE_SECONDAIRE'
          : tx.account === 'COMPTE_PRINCIPAL')
    );
    const exp = mTxs
      .filter((tx) => tx.type === 'EXPENSE')
      .reduce((s, t) => s + t.amount, 0);
    const inc = mTxs
      .filter((tx) => tx.type === 'INCOME')
      .reduce((s, t) => s + t.amount, 0);
    return {
      income: inc > 0 ? inc : 11500,
      expenses: exp,
    };
  };

  const augTotals = computeRealMonthTotals('2026-08');
  const sepTotals = computeRealMonthTotals('2026-09');
  const octTotals = computeRealMonthTotals('2026-10');

  const full12MonthsSeries = [
    {
      monthKey: '2025-11',
      label: 'Novembre 2025',
      shortLabel: 'Nov.',
      compactLabel: 'N',
      income: hasMainAccountData ? 11500 : 0,
      expenses: hasMainAccountData ? 7240 : 0,
    },
    {
      monthKey: '2025-12',
      label: 'Décembre 2025',
      shortLabel: 'Déc.',
      compactLabel: 'D',
      income: hasMainAccountData ? 12500 : 0,
      expenses: hasMainAccountData ? 8350 : 0,
    },
    {
      monthKey: '2026-01',
      label: 'Janvier 2026',
      shortLabel: 'Janv.',
      compactLabel: 'J',
      income: hasMainAccountData ? 11500 : 0,
      expenses: hasMainAccountData ? 7180 : 0,
    },
    {
      monthKey: '2026-02',
      label: 'Février 2026',
      shortLabel: 'Fév.',
      compactLabel: 'F',
      income: hasMainAccountData ? 11500 : 0,
      expenses: hasMainAccountData ? 6950 : 0,
    },
    {
      monthKey: '2026-03',
      label: 'Mars 2026',
      shortLabel: 'Mars',
      compactLabel: 'M',
      income: hasMainAccountData ? 11500 : 0,
      expenses: hasMainAccountData ? 7410 : 0,
    },
    {
      monthKey: '2026-04',
      label: 'Avril 2026',
      shortLabel: 'Avr.',
      compactLabel: 'A',
      income: hasMainAccountData ? 11500 : 0,
      expenses: hasMainAccountData ? 7320 : 0,
    },
    {
      monthKey: '2026-05',
      label: 'Mai 2026',
      shortLabel: 'Mai',
      compactLabel: 'M',
      income: hasMainAccountData ? 11500 : 0,
      expenses: hasMainAccountData ? 7190 : 0,
    },
    {
      monthKey: '2026-06',
      label: 'Juin 2026',
      shortLabel: 'Juin',
      compactLabel: 'J',
      income: hasMainAccountData ? 12200 : 0,
      expenses: hasMainAccountData ? 7640 : 0,
    },
    {
      monthKey: '2026-07',
      label: 'Juillet 2026',
      shortLabel: 'Juil.',
      compactLabel: 'J',
      income: hasMainAccountData ? 11500 : 0,
      expenses: hasMainAccountData ? 8120 : 0,
    },
    {
      monthKey: '2026-08',
      label: 'Août 2026',
      shortLabel: 'Août',
      compactLabel: 'A',
      income: augTotals.income,
      expenses: augTotals.expenses,
    },
    {
      monthKey: '2026-09',
      label: 'Septembre 2026',
      shortLabel: 'Sept.',
      compactLabel: 'S',
      income: sepTotals.income,
      expenses: sepTotals.expenses,
    },
    {
      monthKey: '2026-10',
      label: 'Octobre 2026',
      shortLabel: 'Oct.',
      compactLabel: 'O',
      income: octTotals.income,
      expenses: octTotals.expenses,
    },
  ];

  const visibleEvolutionSeries =
    evolutionPeriod === '3M'
      ? full12MonthsSeries.slice(-3)
      : evolutionPeriod === '6M'
      ? full12MonthsSeries.slice(-6)
      : full12MonthsSeries;

  const maxEvolutionVal = Math.max(
    ...visibleEvolutionSeries.flatMap((m) => [m.income, m.expenses]),
    1
  );

  const activeEvoPoint =
    visibleEvolutionSeries.find((m) => m.monthKey === selectedEvoMonthKey) ||
    visibleEvolutionSeries[visibleEvolutionSeries.length - 1];
  const activeEvoDiff = activeEvoPoint.income - activeEvoPoint.expenses;

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas">
      <MobileHeader
        title="Mon bilan"
        subtitle={`${bilanAnalytics.monthLabel} · ${bilanAnalytics.accountLabel}`}
        onBack={handleBackToDepenses}
      />

      <div className="px-5 pt-2 pb-6 space-y-4 flex-1">
        {/* Top Carried-Over Filters: Account Dropdown + Month Selector */}
        <div className="flex items-center gap-2 relative">
          {/* Account Dropdown */}
          <div className="relative flex-1 min-w-0">
            <button
              type="button"
              onClick={() => {
                setIsAccountMenuOpen((prev) => !prev);
                setIsMonthMenuOpen(false);
              }}
              className="w-full h-10 px-3.5 rounded-full bg-white border border-[#EFEBF8] shadow-2xs flex items-center justify-between gap-2 text-left hover:bg-[#FAF8FE] transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Wallet size={14} className="text-[#5E1DF0] shrink-0" />
                <span className="text-[12px] font-bold text-[#14111F] truncate">
                  {bilanAnalytics.accountLabel}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-[#7D7693] shrink-0 transition-transform ${
                  isAccountMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isAccountMenuOpen && (
              <div className="absolute left-0 right-0 mt-1.5 w-64 max-w-[85vw] rounded-[18px] bg-white border border-[#EFEBF8] shadow-[0_12px_28px_rgba(20,17,31,0.12)] py-1.5 z-30 divide-y divide-[#F6F3FC]">
                {eligibleAccounts.map((acc) => {
                  const active = bilanAccount === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => {
                        setBilanAccount(acc.id);
                        setEvolutionAccount(acc.id);
                        setIsAccountMenuOpen(false);
                      }}
                      className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 transition-colors ${
                        active ? 'bg-[#F5F1FF]' : 'hover:bg-[#FAF8FE]'
                      }`}
                    >
                      <div className="min-w-0">
                        <p
                          className={`text-[12px] truncate ${
                            active
                              ? 'font-bold text-[#5E1DF0]'
                              : 'font-semibold text-[#14111F]'
                          }`}
                        >
                          {acc.label}
                        </p>
                        {acc.subtitle && (
                          <p className="text-[10.5px] text-[#7D7693] truncate mt-0.5">
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

          {/* Month Selector */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setIsMonthMenuOpen((prev) => !prev);
                setIsAccountMenuOpen(false);
              }}
              className="h-10 px-3.5 rounded-full bg-[#F2EDFF] hover:bg-[#E7DDFC] text-[#5E1DF0] text-[12px] font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <span>{bilanAnalytics.monthLabel}</span>
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  isMonthMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isMonthMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 rounded-[18px] bg-white border border-[#EFEBF8] shadow-[0_12px_28px_rgba(20,17,31,0.12)] py-1.5 z-30">
                {availableMonths.map((m) => {
                  const active = bilanMonth === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setBilanMonth(m.id);
                        setSelectedEvoMonthKey(m.id);
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
          </div>
        </div>

        {/* SECTION A — MONTHLY OVERVIEW */}
        <section className="card-simple p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F2EDFF] flex items-center justify-center shrink-0">
                <SimpleBarsIcon size={19} />
              </div>
              <div>
                <h2 className="text-[16px] font-extrabold text-[#14111F] leading-tight">
                  Synthèse du mois
                </h2>
                <p className="text-[12px] text-[#7D7693] mt-0.5">
                  {bilanAnalytics.monthDateRange}
                </p>
              </div>
            </div>
          </div>

          {/* Revenus du mois & Dépenses du mois side by side */}
          <div className="grid grid-cols-2 gap-4 pt-1 divide-x divide-[#F0ECF9]">
            <div className="min-w-0">
              <span className="text-[12px] font-medium text-[#7D7693] block">
                Revenus du mois
              </span>
              <p className="text-[22px] font-extrabold text-[#14111F] tabular-nums tracking-tight mt-1">
                {formatDH(bilanAnalytics.income)}
              </p>
              <span className="text-[11px] text-[#7D7693] mt-1.5 block">
                {bilanAnalytics.hasIncomeData
                  ? 'Entrées enregistrées'
                  : 'Aucun revenu enregistré'}
              </span>
            </div>

            <div className="pl-4 min-w-0">
              <span className="text-[12px] font-medium text-[#7D7693] block">
                Dépenses du mois
              </span>
              <p className="text-[22px] font-extrabold text-[#14111F] tabular-nums tracking-tight mt-1">
                {formatDH(bilanAnalytics.expenses)}
              </p>
              {bilanAnalytics.hasPrevMonthComparison && varPct !== null ? (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-extrabold tabular-nums ${
                      isIncrease
                        ? 'text-[#E11D48]'
                        : isDecrease
                        ? 'text-[#12895B]'
                        : 'text-[#7D7693]'
                    }`}
                  >
                    {isDecrease ? (
                      <ArrowDown size={12} strokeWidth={2.5} />
                    ) : (
                      <ArrowUp size={12} strokeWidth={2.5} />
                    )}
                    {varPct > 0 ? `+${varPct} %` : `${varPct} %`}
                  </span>
                  <span className="text-[11px] text-[#7D7693] truncate">
                    vs {bilanAnalytics.prevMonthShortLabel}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-[#8E87A6] mt-1.5 block">
                  Pas d&apos;historique comparable
                </span>
              )}
            </div>
          </div>

          {/* Différence du mois = Revenus - Dépenses */}
          <div className="rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] p-3.5 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-bold text-[#14111F]">
                Différence du mois
              </span>
              <span
                className={`text-[18px] font-extrabold tabular-nums ${
                  netDiff > 0
                    ? 'text-[#12895B]'
                    : netDiff < 0
                    ? 'text-[#E11D48]'
                    : 'text-[#14111F]'
                }`}
              >
                {netDiff > 0 ? `+${formatDH(netDiff)}` : formatDH(netDiff)}
              </span>
            </div>
            <div className="flex items-start gap-1.5 text-[11px] text-[#7D7693] leading-snug">
              <Info size={13} className="text-[#8E87A6] shrink-0 mt-0.5" />
              <p>
                Flux net du mois (Revenus − Dépenses). Ce montant ne constitue ni un solde bancaire ni une épargne disponible garantie.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION B — FINANCIAL EVOLUTION (Unified Grouped Vertical Bar Chart) */}
        <section className="card-simple p-5 space-y-3.5">
          {/* Header & Legend */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-[16px] font-extrabold text-[#14111F]">
                Évolution mensuelle
              </h3>
              <p className="text-[12px] text-[#7D7693] mt-0.5">
                Revenus et dépenses comparés
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold shrink-0">
              <span className="inline-flex items-center gap-1.5 text-[#49A36D]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#49A36D]" />
                Revenus
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#E38B47]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E38B47]" />
                Dépenses
              </span>
            </div>
          </div>

          {/* Top Card Filters: Account Filter + Period Filter (3 mois / 6 mois / 12 mois) */}
          <div className="space-y-2 pt-0.5">
            <div className="flex items-center justify-between gap-2">
              {/* Period Filter: 3 mois / 6 mois / 12 mois */}
              <div className="inline-flex items-center bg-[#F4F1FA] p-1 rounded-full border border-[#EFEBF8] shrink-0">
                {(
                  [
                    { id: '3M', label: '3 mois' },
                    { id: '6M', label: '6 mois' },
                    { id: '12M', label: '12 mois' },
                  ] as const
                ).map((p) => {
                  const active = evolutionPeriod === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setEvolutionPeriod(p.id)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                        active
                          ? 'bg-[#5E1DF0] text-white shadow-2xs'
                          : 'text-[#7D7693] hover:text-[#14111F]'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Compact Account Filter inside Évolution mensuelle */}
              <div className="relative flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => setIsEvoAccountMenuOpen((prev) => !prev)}
                  className="w-full h-8 px-2.5 rounded-full bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] flex items-center justify-between gap-1.5 text-left transition-colors"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Wallet size={12} className="text-[#5E1DF0] shrink-0" />
                    <span className="text-[11px] font-bold text-[#14111F] truncate">
                      {resolvedEvoAccount.label}
                    </span>
                  </div>
                  <ChevronDown
                    size={12}
                    className={`text-[#7D7693] shrink-0 transition-transform ${
                      isEvoAccountMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isEvoAccountMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-60 max-w-[80vw] rounded-[16px] bg-white border border-[#EFEBF8] shadow-[0_12px_28px_rgba(20,17,31,0.12)] py-1.5 z-30 divide-y divide-[#F6F3FC]">
                    {eligibleAccounts.map((acc) => {
                      const active = resolvedEvoAccount.id === acc.id;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => {
                            setEvolutionAccount(acc.id);
                            setBilanAccount(acc.id);
                            setIsEvoAccountMenuOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 transition-colors ${
                            active ? 'bg-[#F5F1FF]' : 'hover:bg-[#FAF8FE]'
                          }`}
                        >
                          <div className="min-w-0">
                            <p
                              className={`text-[11.5px] truncate ${
                                active
                                  ? 'font-bold text-[#5E1DF0]'
                                  : 'font-semibold text-[#14111F]'
                              }`}
                            >
                              {acc.label}
                            </p>
                            {acc.subtitle && (
                              <p className="text-[10px] text-[#7D7693] truncate mt-0.5">
                                {acc.subtitle}
                              </p>
                            )}
                          </div>
                          {active && (
                            <Check
                              size={13}
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
          </div>

          {/* Single Unified Grouped Vertical Bar Chart */}
          <div className="rounded-[20px] bg-[#FAF8FE] border border-[#EFEBF8] px-3 pt-4 pb-3">
            <div className="relative h-[132px] flex items-end justify-between gap-1">
              {/* Subtle reference lines */}
              <div className="absolute inset-x-0 top-0 border-t border-dashed border-[#E9E3F5] pointer-events-none" />
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-[#E9E3F5]/70 pointer-events-none" />
              <div className="absolute inset-x-0 bottom-[22px] border-t border-[#E6E0F4] pointer-events-none" />

              {visibleEvolutionSeries.map((item) => {
                const isSelected = item.monthKey === activeEvoPoint.monthKey;
                const incHeightPx =
                  item.income > 0
                    ? Math.max(
                        10,
                        Math.round((item.income / maxEvolutionVal) * 96)
                      )
                    : 4;
                const expHeightPx =
                  item.expenses > 0
                    ? Math.max(
                        10,
                        Math.round((item.expenses / maxEvolutionVal) * 96)
                      )
                    : 4;

                const barWidthClass =
                  evolutionPeriod === '3M'
                    ? 'w-4 rounded-t-[6px]'
                    : evolutionPeriod === '6M'
                    ? 'w-2.5 rounded-t-[5px]'
                    : 'w-1.5 rounded-t-[3px]';

                const pairGapClass =
                  evolutionPeriod === '3M'
                    ? 'gap-1.5'
                    : evolutionPeriod === '6M'
                    ? 'gap-1'
                    : 'gap-[2px]';

                return (
                  <button
                    key={item.monthKey}
                    type="button"
                    onClick={() => {
                      setSelectedEvoMonthKey(item.monthKey);
                      if (
                        item.monthKey === '2026-10' ||
                        item.monthKey === '2026-09' ||
                        item.monthKey === '2026-08'
                      ) {
                        setBilanMonth(item.monthKey);
                      }
                    }}
                    className={`relative z-10 flex-1 flex flex-col items-center justify-end h-full rounded-[12px] pt-2 pb-0.5 transition-colors ${
                      isSelected ? 'bg-[#EFE9FE]/75' : 'hover:bg-[#F3EEFF]/50'
                    }`}
                  >
                    <div
                      className={`flex items-end justify-center ${pairGapClass} h-[100px]`}
                    >
                      {/* Revenus bar (green) */}
                      <div
                        className={`${barWidthClass} transition-all duration-300 ${
                          item.income > 0
                            ? isSelected
                              ? 'bg-[#49A36D]'
                              : 'bg-[#BFE3CB]'
                            : 'bg-[#E2DCEB]'
                        }`}
                        style={{ height: `${incHeightPx}px` }}
                        title={`Revenus ${item.label}: ${formatDH(item.income)}`}
                      />
                      {/* Dépenses bar (orange) */}
                      <div
                        className={`${barWidthClass} transition-all duration-300 ${
                          item.expenses > 0
                            ? isSelected
                              ? 'bg-[#E38B47]'
                              : 'bg-[#F3C9A5]'
                            : 'bg-[#E2DCEB]'
                        }`}
                        style={{ height: `${expHeightPx}px` }}
                        title={`Dépenses ${item.label}: ${formatDH(item.expenses)}`}
                      />
                    </div>

                    <span
                      className={`mt-1.5 leading-none tabular-nums truncate ${
                        evolutionPeriod === '12M'
                          ? 'text-[10px]'
                          : 'text-[11px]'
                      } ${
                        isSelected
                          ? 'font-extrabold text-[#5E1DF0]'
                          : 'font-semibold text-[#7D7693]'
                      }`}
                    >
                      {evolutionPeriod === '12M'
                        ? item.compactLabel
                        : item.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Compact Summary Below the Chart for Selected / Latest Visible Month */}
          <div className="rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] px-3.5 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-bold text-[#5E1DF0]">
                {activeEvoPoint.label}
              </span>
              <span className="text-[10.5px] text-[#7D7693]">
                Touchez un mois sur le graphique pour détailler
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-0.5 divide-x divide-[#ECE6F8]">
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#49A36D] shrink-0" />
                  <span className="text-[11px] font-medium text-[#7D7693] truncate">
                    Revenus
                  </span>
                </div>
                <p className="text-[13px] font-extrabold text-[#14111F] tabular-nums mt-0.5 whitespace-nowrap truncate">
                  {formatDH(activeEvoPoint.income)}
                </p>
              </div>

              <div className="pl-2.5 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#E38B47] shrink-0" />
                  <span className="text-[11px] font-medium text-[#7D7693] truncate">
                    Dépenses
                  </span>
                </div>
                <p className="text-[13px] font-extrabold text-[#14111F] tabular-nums mt-0.5 whitespace-nowrap truncate">
                  {formatDH(activeEvoPoint.expenses)}
                </p>
              </div>

              <div className="pl-2.5 min-w-0">
                <span className="text-[11px] font-medium text-[#7D7693] block truncate">
                  Solde / Diff.
                </span>
                <p
                  className={`text-[13px] font-extrabold tabular-nums mt-0.5 whitespace-nowrap truncate ${
                    activeEvoDiff > 0
                      ? 'text-[#12895B]'
                      : activeEvoDiff < 0
                      ? 'text-[#E11D48]'
                      : 'text-[#14111F]'
                  }`}
                >
                  {activeEvoDiff > 0
                    ? `+${formatDH(activeEvoDiff)}`
                    : formatDH(activeEvoDiff)}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <BottomBankingNav />
    </div>
  );
};

// SCREEN D2 — Category details (Shopping & other categories)
export const CategoryDetailScreen: React.FC = () => {
  const {
    selectedCategory,
    categoryBreakdown,
    transactions,
    navigateTo,
    returnFromCategoryDetail,
  } = usePFM();

  const [selectedMerchantTxId, setSelectedMerchantTxId] = useState<
    string | null
  >(null);

  const summary =
    categoryBreakdown.find((c) => c.category === selectedCategory) ||
    categoryBreakdown[0];

  const categoryTxs = transactions.filter(
    (tx) =>
      tx.monthKey === '2026-10' &&
      tx.type === 'EXPENSE' &&
      tx.category === selectedCategory
  );

  const augAmount = transactions
    .filter(
      (tx) =>
        tx.monthKey === '2026-08' &&
        tx.type === 'EXPENSE' &&
        tx.category === selectedCategory
    )
    .reduce((s, t) => s + t.amount, 0);

  const sepAmount = summary.prevMonthAmount;
  const octAmount = summary.amount;
  const maxBar = Math.max(augAmount, sepAmount, octAmount, 1);

  const currentMonthLabel = "Dépenses d'octobre";
  const prevMonthName = 'septembre';
  const hasPrevMonthData = summary.prevMonthAmount > 0;
  const diffAmount = summary.amount - summary.prevMonthAmount;

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
      <MobileHeader
        title={`Catégorie ${selectedCategory}`}
        subtitle="Octobre 2026 · Analyse détaillée"
        onBack={returnFromCategoryDetail}
      />

      <div className="p-5 space-y-4 flex-1">
        {/* 1. Original Approved Top Summary Card */}
        <section className="card-simple p-5 space-y-4">
          {/* 1. HEADER */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <CategoryIcon category={selectedCategory} size="lg" />
              <span className="text-[13px] text-[#7D7693] font-semibold truncate">
                {currentMonthLabel}
              </span>
            </div>

            {hasPrevMonthData && (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-extrabold tabular-nums shrink-0 ${
                  summary.variationPct > 0
                    ? 'bg-[#FFECEE] text-[#E11D48]'
                    : summary.variationPct < 0
                    ? 'bg-[#E7F7F0] text-[#12895B]'
                    : 'bg-[#F2EFF9] text-[#7D7693]'
                }`}
              >
                {summary.variationPct > 0
                  ? `+${summary.variationPct} %`
                  : `${summary.variationPct} %`}
              </span>
            )}
          </div>

          {/* 2. MAIN AMOUNT & FULL-WIDTH COMPARISON */}
          <div className="w-full">
            <h2 className="text-[30px] font-extrabold text-[#14111F] tabular-nums leading-none tracking-tight">
              {formatDH(summary.amount)}
            </h2>
            {hasPrevMonthData && (
              <p className="w-full text-[13px] font-medium text-[#7D7693] tabular-nums mt-1.5 whitespace-nowrap truncate">
                {diffAmount > 0 ? (
                  <>
                    <span className="text-[#E11D48]">{`+${formatDH(diffAmount)}`}</span>
                    {` par rapport à ${prevMonthName}`}
                  </>
                ) : diffAmount < 0 ? (
                  `-${formatDH(Math.abs(diffAmount))} par rapport à ${prevMonthName}`
                ) : (
                  `Stable par rapport à ${prevMonthName}`
                )}
              </p>
            )}
          </div>

          {/* 3. SPENDING TREND */}
          <div className="pt-3 border-t border-[#F4F1FA]">
            <div className="flex items-center justify-between text-[12px] text-[#7D7693] mb-3.5">
              <span className="font-bold text-[#14111F]">
                Évolution sur 3 mois
              </span>
            </div>
            <div className="grid grid-cols-3 gap-5 items-end pt-5 pb-4 px-6 bg-[#F6F3FF] rounded-[20px]">
              {[
                { label: 'Août', value: augAmount, active: false },
                { label: 'Sept.', value: sepAmount, active: false },
                { label: 'Oct.', value: octAmount, active: true },
              ].map((bar) => {
                const ratio = bar.value / maxBar;
                const barHeightPx =
                  bar.value === 0
                    ? 8
                    : Math.max(22, Math.round(Math.pow(ratio, 1.75) * 104));
                return (
                  <div
                    key={bar.label}
                    className="flex flex-col items-center justify-end"
                  >
                    <span
                      className={`text-[12px] tabular-nums mb-2 whitespace-nowrap ${
                        bar.active
                          ? 'font-extrabold text-[#14111F]'
                          : 'font-bold text-[#6E6785]'
                      }`}
                    >
                      {formatDH(bar.value)}
                    </span>
                    <div
                      className={`w-[28px] rounded-t-[10px] shrink-0 transition-all duration-300 ${
                        bar.active ? 'bg-[#5E1DF0]' : 'bg-[#DDD2FA]'
                      }`}
                      style={{ height: `${barHeightPx}px` }}
                    />
                    <span
                      className={`text-[12px] leading-none mt-2.5 ${
                        bar.active
                          ? 'font-bold text-[#14111F]'
                          : 'font-semibold text-[#7D7693]'
                      }`}
                    >
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. Principaux marchands ce mois-ci */}
        <section className="card-simple p-5">
          <div className="flex items-center gap-2 mb-3">
            <Store size={16} className="text-[#5E1DF0]" />
            <h3 className="text-[14px] font-extrabold text-[#14111F]">
              Principaux marchands ce mois-ci
            </h3>
          </div>
          <div className="divide-y divide-[#F4F1FA]">
            {categoryTxs.map((tx) => {
              const pct = Math.round((tx.amount / (summary.amount || 1)) * 100);
              const isExpanded = selectedMerchantTxId === tx.id;
              return (
                <div key={tx.id} className="py-2.5 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedMerchantTxId((prev) =>
                        prev === tx.id ? null : tx.id
                      )
                    }
                    className="w-full flex items-start justify-between gap-3 text-left text-[13px] group"
                  >
                    <span className="font-semibold text-[#14111F] leading-snug break-words group-hover:text-[#5E1DF0] transition-colors">
                      {tx.merchant}
                    </span>
                    <span className="text-[#7D7693] tabular-nums shrink-0 whitespace-nowrap">
                      <strong className="text-[#14111F] font-extrabold">
                        {formatDH(tx.amount)}
                      </strong>{' '}
                      ({pct} %)
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2 px-3 py-2.5 rounded-[14px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-center justify-between gap-3 text-[12px]">
                      <div className="min-w-0 space-y-0.5">
                        <p className="font-semibold text-[#14111F]">
                          {tx.subtitle}
                        </p>
                        <p className="text-[11px] text-[#7D7693]">
                          {tx.date} ·{' '}
                          {tx.cardLast4
                            ? `Carte •• ${tx.cardLast4}`
                            : 'Compte principal'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          navigateTo('D3_TRANSACTION_DETAIL', {
                            transactionId: tx.id,
                          })
                        }
                        className="text-[11.5px] font-bold text-[#5E1DF0] hover:underline shrink-0 inline-flex items-center gap-0.5"
                      >
                        <span>Détail</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Opérations récentes */}
        <section className="card-simple p-5">
          <div className="mb-2.5">
            <h3 className="text-[15px] font-extrabold text-[#14111F]">
              Opérations récentes
            </h3>
          </div>

          <div className="divide-y divide-[#F3EFFA]">
            {categoryTxs.map((tx) => (
              <button
                key={tx.id}
                type="button"
                onClick={() =>
                  navigateTo('D3_TRANSACTION_DETAIL', {
                    transactionId: tx.id,
                  })
                }
                className="w-full py-3 first:pt-1 last:pb-1 px-1.5 flex items-center justify-between gap-3 text-left rounded-2xl hover:bg-[#FAF8FF] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon category={tx.category} size="md" />
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#14111F] leading-snug break-words">
                      {tx.merchant}
                    </p>
                    <p className="text-[12px] text-[#7D7693] mt-0.5">
                      {tx.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-[14px] font-extrabold text-[#14111F] tabular-nums">
                      -{formatDH(tx.amount)}
                    </p>
                  </div>
                  <ChevronRight size={15} className="text-[#8E87A6]" />
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// SCREEN D2_SHOPPING_INSIGHT — Dedicated guided Shopping insight journey ("Comprendre ma hausse Shopping")
export const ShoppingInsightScreen: React.FC = () => {
  const {
    shoppingSummary,
    transactions,
    budgets,
    courses,
    challenges,
    screenHistory,
    navigateTo,
    setShoppingChallengeOrigin,
  } = usePFM();

  const summary = shoppingSummary;

  const shoppingTxs = transactions.filter(
    (tx) =>
      tx.monthKey === '2026-10' &&
      tx.type === 'EXPENSE' &&
      tx.category === 'Shopping'
  );

  const augAmount = transactions
    .filter(
      (tx) =>
        tx.monthKey === '2026-08' &&
        tx.type === 'EXPENSE' &&
        tx.category === 'Shopping'
    )
    .reduce((s, t) => s + t.amount, 0);

  const sepAmount = summary.prevMonthAmount;
  const octAmount = summary.amount;
  const maxBar = Math.max(augAmount, sepAmount, octAmount, 1);

  const currentMonthLabel = "Dépenses d'octobre";
  const prevMonthName = 'septembre';
  const hasPrevMonthData = summary.prevMonthAmount > 0;
  const diffAmount = summary.amount - summary.prevMonthAmount;

  const impulsifCourse =
    courses.find((c) => c.id === 'course-impulsif-1') || courses[0];

  const existingShoppingBudget = budgets['Shopping'];
  const hasPersonalShoppingBudget =
    Boolean(existingShoppingBudget) &&
    (existingShoppingBudget.scope || 'PERSONNEL') === 'PERSONNEL';

  const shoppingChallenge = challenges.find((c) => c.id === 'defi-shopping-1');

  const handleBackToExpenses = () => {
    const cameFromD1 =
      screenHistory.length > 0 &&
      screenHistory[screenHistory.length - 1] === 'D1_EXPENSES';
    if (cameFromD1) {
      navigateTo('D1_EXPENSES');
    } else {
      navigateTo('C1_HUB', {
        hubTab: 'MON_ESPACE',
        monEspaceSubTab: 'DEPENSES',
      });
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
      {/* 1. HEADER */}
      <MobileHeader
        title="Comprendre ma hausse Shopping"
        onBack={handleBackToExpenses}
      />

      <div className="p-5 space-y-4 flex-1">
        {/* 2. SECTION ONE — SPENDING OVERVIEW */}
        <section className="card-simple p-5 space-y-4">
          {/* 1. HEADER */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <CategoryIcon category="Shopping" size="lg" />
              <span className="text-[13px] text-[#7D7693] font-semibold truncate">
                {currentMonthLabel}
              </span>
            </div>

            {hasPrevMonthData && (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-extrabold tabular-nums shrink-0 ${
                  summary.variationPct > 0
                    ? 'bg-[#FFECEE] text-[#E11D48]'
                    : summary.variationPct < 0
                    ? 'bg-[#E7F7F0] text-[#12895B]'
                    : 'bg-[#F2EFF9] text-[#7D7693]'
                }`}
              >
                {summary.variationPct > 0
                  ? `+${summary.variationPct} %`
                  : `${summary.variationPct} %`}
              </span>
            )}
          </div>

          {/* 2. MAIN AMOUNT & FULL-WIDTH COMPARISON */}
          <div className="w-full">
            <h2 className="text-[30px] font-extrabold text-[#14111F] tabular-nums leading-none tracking-tight">
              {formatDH(summary.amount)}
            </h2>
            {hasPrevMonthData && (
              <p className="w-full text-[13px] font-medium text-[#7D7693] tabular-nums mt-1.5 whitespace-nowrap truncate">
                {diffAmount > 0 ? (
                  <>
                    <span className="text-[#E11D48]">{`+${formatDH(diffAmount)}`}</span>
                    {` par rapport à ${prevMonthName}`}
                  </>
                ) : diffAmount < 0 ? (
                  `-${formatDH(Math.abs(diffAmount))} par rapport à ${prevMonthName}`
                ) : (
                  `Stable par rapport à ${prevMonthName}`
                )}
              </p>
            )}
          </div>

          {/* 3. SPENDING TREND */}
          <div className="pt-3 border-t border-[#F4F1FA]">
            <div className="flex items-center justify-between text-[12px] text-[#7D7693] mb-3.5">
              <span className="font-bold text-[#14111F]">
                Évolution sur 3 mois
              </span>
            </div>
            <div className="grid grid-cols-3 gap-5 items-end pt-5 pb-4 px-6 bg-[#F6F3FF] rounded-[20px]">
              {[
                { label: 'Août', value: augAmount, active: false },
                { label: 'Sept.', value: sepAmount, active: false },
                { label: 'Oct.', value: octAmount, active: true },
              ].map((bar) => {
                const ratio = bar.value / maxBar;
                const barHeightPx =
                  bar.value === 0
                    ? 8
                    : Math.max(22, Math.round(Math.pow(ratio, 1.75) * 104));
                return (
                  <div
                    key={bar.label}
                    className="flex flex-col items-center justify-end"
                  >
                    <span
                      className={`text-[12px] tabular-nums mb-2 whitespace-nowrap ${
                        bar.active
                          ? 'font-extrabold text-[#14111F]'
                          : 'font-bold text-[#6E6785]'
                      }`}
                    >
                      {formatDH(bar.value)}
                    </span>
                    <div
                      className={`w-[28px] rounded-t-[10px] shrink-0 transition-all duration-300 ${
                        bar.active ? 'bg-[#5E1DF0]' : 'bg-[#DDD2FA]'
                      }`}
                      style={{ height: `${barHeightPx}px` }}
                    />
                    <span
                      className={`text-[12px] leading-none mt-2.5 ${
                        bar.active
                          ? 'font-bold text-[#14111F]'
                          : 'font-semibold text-[#7D7693]'
                      }`}
                    >
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. SECTION TWO — MAIN MERCHANTS */}
        <section className="card-simple p-5">
          <div className="flex items-center gap-2 mb-3">
            <Store size={16} className="text-[#5E1DF0]" />
            <h3 className="text-[14px] font-extrabold text-[#14111F]">
              Vos principaux marchands
            </h3>
          </div>
          <div className="divide-y divide-[#F4F1FA]">
            {shoppingTxs.map((tx) => {
              const pct = Math.round((tx.amount / (summary.amount || 1)) * 100);
              return (
                <div
                  key={tx.id}
                  className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-[13px]"
                >
                  <span className="font-semibold text-[#14111F] truncate">
                    {tx.merchant}
                  </span>
                  <span className="text-[#7D7693] tabular-nums shrink-0">
                    <strong className="text-[#14111F] font-extrabold">
                      {formatDH(tx.amount)}
                    </strong>{' '}
                    ({pct} %)
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. SECTION THREE — LEARN & TAKE ACTION */}
        <div className="pt-1 space-y-3">
          <h3 className="text-[15px] font-extrabold text-[#14111F] px-1">
            Et maintenant, on avance ?
          </h3>

          {/* 5. CARD 1 — SIMPLE LEARN (Editorial, image-first layout with soft lavender accents) */}
          <section className="rounded-[24px] bg-white border border-[#EFEBF8] shadow-[0_8px_24px_-6px_rgba(41,7,100,0.06)] overflow-hidden">
            {/* Top section — Hero image */}
            <div className="relative w-full h-[144px] bg-[#F5F1FF] overflow-hidden">
              <img
                src={IMPULSIF_COURSE_IMAGE_URL}
                alt="Comprendre vos achats impulsifs"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#14111F]/45 via-transparent to-[#14111F]/20" />

              {/* Top left & Top right readable badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#5E1DF0] text-[11px] font-extrabold tracking-tight shadow-2xs">
                  Simple Learn
                </span>
                <span className="px-2.5 py-1 rounded-full bg-[#F5F1FF]/95 backdrop-blur-md text-[#5E1DF0] border border-[#E5DCFF] text-[11px] font-extrabold tabular-nums shadow-2xs">
                  +100 pts
                </span>
              </div>
            </div>

            {/* Below the image — Content */}
            <div className="p-4 space-y-3.5">
              <div className="space-y-1">
                <h4 className="text-[16px] font-extrabold text-[#14111F] leading-snug tracking-tight">
                  Comprendre vos achats impulsifs
                </h4>
                <p className="text-[12.5px] text-[#7D7693] leading-relaxed">
                  Découvrez ce qui influence vos achats en 3 minutes.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigateTo('G2_COURSE_DETAIL', {
                    courseId: 'course-impulsif-1',
                    category: 'Shopping',
                  })
                }
                className="w-full h-11 px-4 rounded-full bg-[#F3EDFF] hover:bg-[#E7DCFF] text-[#5E1DF0] text-[13px] font-extrabold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
              >
                <span>Découvrir la leçon →</span>
              </button>
            </div>
          </section>

          {/* 6. CARD 2 — BUDGET SHOPPING (Practical, action-oriented card with soft blue palette) */}
          <section className="rounded-[24px] bg-white border border-[#DCEBFA] shadow-[0_8px_24px_-6px_rgba(52,120,212,0.07)] p-4 space-y-3.5">
            {/* Top section — Label + compact budget gauge */}
            <div className="rounded-[18px] bg-[#EEF5FF] border border-[#DCEBFA] p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-white text-[#3478D4] flex items-center justify-center shadow-2xs shrink-0">
                    <Target size={14} strokeWidth={2.3} />
                  </div>
                  <span className="text-[12px] font-extrabold text-[#3478D4] truncate">
                    Budget · Shopping
                  </span>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-white text-[#3478D4] text-[11px] font-bold tabular-nums shadow-2xs shrink-0">
                  {hasPersonalShoppingBudget && existingShoppingBudget
                    ? `Actif · ${formatDH(existingShoppingBudget.limit)}`
                    : 'Repère · 1 600 DH'}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="w-full h-2 rounded-full bg-white/90 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#3478D4] transition-all duration-300"
                    style={{ width: '68%' }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-medium text-[#52739C] tabular-nums">
                  <span>Suivi mensuel</span>
                  <span className="font-bold text-[#3478D4]">
                    Limite personnalisable
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-1">
              <h4 className="text-[16px] font-extrabold text-[#14111F] leading-snug tracking-tight">
                Gardez le cap sur vos achats
              </h4>
              <p className="text-[12.5px] text-[#7D7693] leading-relaxed">
                Fixez votre budget Shopping et suivez vos dépenses.
              </p>
            </div>

            {hasPersonalShoppingBudget ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    navigateTo('C1_HUB', {
                      hubTab: 'MON_ESPACE',
                      monEspaceSubTab: 'BUDGETS',
                    })
                  }
                  className="w-full h-11 px-4 rounded-full bg-[#EEF5FF] hover:bg-[#E0ECFF] text-[#3478D4] text-[13px] font-extrabold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
                >
                  <span>Voir mon budget Shopping →</span>
                </button>
                {shoppingChallenge && (
                  <button
                    type="button"
                    onClick={() => {
                      setShoppingChallengeOrigin('D2_SHOPPING_INSIGHT');
                      navigateTo('F4_SHOPPING_CHALLENGE');
                    }}
                    className="w-full h-10 rounded-full bg-white hover:bg-[#F5F9FF] text-[#3478D4] border border-[#DCEBFA] text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Award size={14} />
                    <span>
                      {shoppingChallenge.status === 'ACTIVE'
                        ? 'Suivre mon défi Shopping (4 semaines)'
                        : 'Découvrir le défi Shopping (4 semaines)'}
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  navigateTo('E1_CREATE_BUDGET', {
                    category: 'Shopping',
                    budgetScope: 'PERSONNEL',
                  })
                }
                className="w-full h-11 px-4 rounded-full bg-[#EEF5FF] hover:bg-[#E0ECFF] text-[#3478D4] text-[13px] font-extrabold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
              >
                <span>Créer mon budget →</span>
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

// SCREEN D3 — Transaction details & Recategorization bottom sheet
export const TransactionDetailScreen: React.FC = () => {
  const {
    selectedTransactionId,
    transactions,
    recategorizeTransaction,
    goBack,
    navigateTo,
    isInternetBillSplit,
  } = usePFM();

  const [isCatSheetOpen, setIsCatSheetOpen] = useState(false);

  const tx =
    transactions.find((t) => t.id === selectedTransactionId) || transactions[0];

  const selectableCategories: SpendingCategory[] = [
    'Shopping',
    'Sorties',
    'Courses',
    'Transport',
    'Autres',
  ];

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
      <MobileHeader title="Détail de l'opération" onBack={goBack} />

      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <section className="card-simple p-6 text-center">
            <div className="flex justify-center mb-3">
              <CategoryIcon category={tx.category} size="lg" />
            </div>
            <p className="text-[12px] font-medium text-[#7D7693]">
              {tx.subtitle}
            </p>
            <h2 className="text-[19px] font-extrabold text-[#14111F] mt-0.5">
              {tx.merchant}
            </h2>
            <p className="text-[28px] font-extrabold text-[#14111F] tabular-nums mt-3">
              {tx.type === 'INCOME' ? '+ ' : '- '}
              {formatDH(tx.amount, true)}
            </p>
            {tx.verifiedByUser && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F7F0] text-xs font-bold text-[#12895B]">
                <CheckCircle2 size={14} />
                <span>Catégorie confirmée</span>
              </div>
            )}
          </section>

          <section className="card-simple p-5 space-y-3.5 text-[13px]">
            <div className="flex items-center justify-between py-1.5 border-b border-[#F3EFFA]">
              <span className="text-[#7D7693] flex items-center gap-2">
                <Calendar size={16} />
                Date de l’opération
              </span>
              <span className="font-bold text-[#14111F]">{tx.date}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-[#F3EFFA]">
              <span className="text-[#7D7693] flex items-center gap-2">
                <CreditCard size={16} />
                Moyen de paiement
              </span>
              <span className="font-bold text-[#14111F]">
                {tx.cardLast4
                  ? `Carte Visa •• ${tx.cardLast4}`
                  : 'Compte principal •• 4821'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#7D7693]">Catégorie attribuée</span>
              <button
                type="button"
                onClick={() => setIsCatSheetOpen(true)}
                className="px-3 py-1 rounded-full bg-[#F2EDFF] font-bold text-[#5E1DF0] flex items-center gap-1.5 hover:bg-[#E5DCFF]"
              >
                <span>{tx.category}</span>
                <Edit3 size={13} />
              </button>
            </div>
          </section>

          <section className="rounded-[22px] bg-[#F5F1FF] p-4">
            <p className="text-[13px] font-bold text-[#14111F]">
              Pourquoi vérifier la catégorie de vos opérations ?
            </p>
            <p className="text-[12px] text-[#7D7693] mt-1 leading-relaxed">
              Lorsque vous reclassez une dépense, votre répartition mensuelle et vos budgets se mettent à jour instantanément. Cela fait également progresser votre défi « Vérifier mes dépenses ».
            </p>
          </section>
        </div>

        <div className="space-y-2.5">
          {tx.id === 'tx-internet-bill' || tx.isSplit || isInternetBillSplit ? (
            isInternetBillSplit || tx.isSplit ? (
              <button
                type="button"
                onClick={() =>
                  navigateTo('J2_HOUSEHOLD_SPLIT', { transactionId: tx.id })
                }
                className="w-full h-[52px] btn-simple-primary text-[15px] font-semibold flex items-center justify-center gap-2 shadow-xs"
              >
                <Users size={17} />
                <span>Voir la répartition</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  navigateTo('J2_HOUSEHOLD_SPLIT', { transactionId: tx.id })
                }
                className="w-full h-[52px] btn-simple-primary text-[15px] font-semibold flex items-center justify-center gap-2 shadow-xs"
              >
                <Users size={17} />
                <span>Répartir cette dépense</span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={() =>
                navigateTo('J2_HOUSEHOLD_SPLIT', { transactionId: tx.id })
              }
              className="w-full h-[48px] rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-[#E5DCFF] transition-colors"
            >
              <Users size={16} />
              <span>Répartir cette dépense</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCatSheetOpen(true)}
            className="w-full h-[48px] rounded-full bg-white border border-[#EFEBF8] text-[#14111F] text-[14px] font-semibold hover:bg-[#FAF8FE] transition-colors"
          >
            Modifier la catégorie
          </button>
        </div>
      </div>

      {/* Category Selection Bottom Sheet */}
      {isCatSheetOpen && (
        <div className="fixed sm:absolute inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full bg-white rounded-t-[34px] p-6 shadow-2xl border-t border-[#ECE7F6]">
            <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto mb-4" />
            <h3 className="text-[18px] font-extrabold text-[#14111F]">
              Choisir une catégorie pour {tx.merchant}
            </h3>
            <p className="text-[12px] text-[#7D7693] mt-1">
              Votre bilan mensuel sera recalculé immédiatement.
            </p>

            <div className="mt-4 space-y-2">
              {selectableCategories.map((cat) => {
                const isCurrent = tx.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      recategorizeTransaction(tx.id, cat);
                      setIsCatSheetOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-[22px] flex items-center justify-between border text-left transition-all ${
                      isCurrent
                        ? 'border-[#5E1DF0] bg-[#F6F3FF]'
                        : 'border-[#EFEBF8] hover:bg-[#FAF8FF]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={cat} size="md" />
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
                      <Check size={17} className="text-[#5E1DF0] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsCatSheetOpen(false)}
              className="mt-4 w-full h-11 rounded-full bg-[#F5F2FA] text-[#14111F] text-[13px] font-bold"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// SCREEN D4 — Financial Coach (Matching Reference Screens 2 & 5 pixel-for-pixel)
export const FinancialCoachScreen: React.FC = () => {
  const {
    coachMessages,
    askCoachQuestion,
    shoppingSummary,
    navigateTo,
    goBack,
    showToast,
  } = usePFM();

  const [customText, setCustomText] = useState('');
  const [avatarError, setAvatarError] = useState(false);

  const quickQuestions = [
    'Pourquoi mes dépenses ont-elles augmenté ?',
    'Comment réduire mon budget Shopping ?',
    'Combien pourrais-je mettre de côté ?',
    'Aide-moi à créer un budget.',
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    askCoachQuestion(customText.trim());
    setCustomText('');
  };

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas">
      <MobileHeader title="Coach financier" onBack={goBack} />

      <div className="px-5 pt-2 pb-4 space-y-4 flex-1 overflow-y-auto">
        {/* Initial Structured Insights Sequence matching Reference Screen 5 */}
        <div className="flex items-center justify-end gap-2.5">
          <div className="px-4 py-2.5 rounded-[22px] bg-[#EAE2FF] text-[#14111F] text-[14px] font-medium shadow-2xs">
            Comprendre pourquoi
          </div>
          <div className="w-9 h-9 rounded-full overflow-hidden border border-white shadow-xs bg-[#EFEAFF] shrink-0">
            {!avatarError ? (
              <img
                src={LAMIA_AVATAR_URL}
                alt="Lamia"
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-[#5E1DF0] flex items-center justify-center h-full">
                L
              </span>
            )}
          </div>
        </div>

        {/* Coach Bubble: Voici ce que j'ai identifié */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#EFEAFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
            <SimpleRobotIcon size={20} color="#5E1DF0" />
          </div>
          <div className="bg-white rounded-[22px] px-4 py-3 text-[14px] font-medium text-[#14111F] shadow-[0_4px_14px_rgba(20,17,31,0.04)]">
            Voici ce que j’ai identifié.
          </div>
        </div>

        {/* Embedded White Card: "Vos insights" matching Reference Screen 5 */}
        <section className="card-simple p-5 space-y-4">
          <h3 className="text-[19px] font-extrabold text-[#14111F]">
            Vos insights
          </h3>

          <div className="divide-y divide-[#F4F1FA]">
            <div className="pb-3.5 flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0 mt-0.5">
                <ShoppingBag size={19} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#14111F]">
                  Vos dépenses principales
                </p>
                <p className="text-[13px] text-[#7D7693] mt-0.5 leading-snug">
                  Shopping ({formatDH(shoppingSummary.amount)}) et sorties figurent parmi vos catégories les plus importantes.
                </p>
              </div>
            </div>

            <div className="py-3.5 flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#FFECEE] text-[#E11D48] flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp size={19} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#14111F]">
                  Une tendance à la hausse
                </p>
                <p className="text-[13px] text-[#7D7693] mt-0.5 leading-snug">
                  Vos dépenses Shopping ont augmenté de +{shoppingSummary.variationPct} % par rapport à votre rythme habituel ({formatDH(shoppingSummary.prevMonthAmount)}).
                </p>
              </div>
            </div>

            <div className="pt-3.5 flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-full bg-[#E7F7F0] text-[#12895B] flex items-center justify-center shrink-0 mt-0.5">
                <Coins size={19} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[14px] font-bold text-[#14111F]">
                  Une marge disponible
                </p>
                <p className="text-[13px] text-[#7D7693] mt-0.5 leading-snug">
                  Vous pourriez commencer à mettre une somme régulière (250 à 450 DH) de côté pour votre Projet Voyage.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Conversation Messages */}
        {coachMessages.map((msg) => {
          const isCoach = msg.sender === 'COACH';
          return (
            <div key={msg.id} className="space-y-3">
              {isCoach ? (
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#EFEAFF] text-[#5E1DF0] flex items-center justify-center shrink-0 mt-1">
                    <SimpleRobotIcon size={20} color="#5E1DF0" />
                  </div>
                  <div className="flex-1 space-y-2.5">
                    <div className="bg-white rounded-[22px] px-4 py-3 text-[13px] text-[#14111F] leading-relaxed shadow-[0_4px_14px_rgba(20,17,31,0.04)]">
                      <p>{msg.text}</p>
                    </div>

                    {msg.highlightBox && (
                      <div className="card-simple p-4">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-8 h-8 rounded-full bg-[#F2EDFF] flex items-center justify-center">
                            <SimpleBarsIcon size={15} />
                          </div>
                          <span className="text-[13px] font-bold text-[#14111F]">
                            {msg.highlightBox.label}
                          </span>
                        </div>
                        <p className="text-[16px] font-extrabold text-[#5E1DF0] tabular-nums">
                          {msg.highlightBox.value}
                        </p>
                        {msg.highlightBox.subtext && (
                          <p className="text-[12px] text-[#7D7693] mt-0.5">
                            {msg.highlightBox.subtext}
                          </p>
                        )}
                      </div>
                    )}

                    {msg.actionCta && (
                      <button
                        type="button"
                        onClick={() =>
                          navigateTo(msg.actionCta!.targetScreen, {
                            category: msg.actionCta!.category,
                          })
                        }
                        className="w-full h-[50px] btn-simple-primary text-[14px] font-semibold flex items-center justify-center gap-2"
                      >
                        <span>{msg.actionCta.label}</span>
                        <ArrowRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-2">
                  <div className="bg-[#6422F5] text-white rounded-[22px] px-4 py-2.5 text-[13px] font-medium max-w-[82%] shadow-xs">
                    {msg.text}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Chat Input Bar + Quick Suggestion Pills matching Reference Screens 2 & 5 */}
      <div className="bg-white/95 backdrop-blur-md rounded-t-[28px] shadow-[0_-6px_24px_rgba(20,17,31,0.05)] border-t border-[#F0ECF9] p-4 space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => askCoachQuestion(q)}
              className="px-3.5 py-1.5 rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-[12px] font-semibold hover:bg-[#E5DCFF] transition-colors whitespace-nowrap shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              showToast(
                'Opérations synchronisées',
                'Le Coach analyse déjà vos relevés d’octobre.'
              )
            }
            aria-label="Joindre"
            className="w-10 h-10 rounded-full bg-[#F5F3FA] text-[#7D7693] flex items-center justify-center shrink-0 hover:text-[#14111F]"
          >
            <Paperclip size={18} />
          </button>

          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Écrire un message..."
            className="flex-1 h-11 px-4 rounded-full bg-[#F5F3FA] text-[13px] text-[#14111F] placeholder:text-[#8E87A6] focus:outline-none focus:ring-2 focus:ring-[#5E1DF0]/25"
          />

          <button
            type="submit"
            aria-label="Envoyer"
            className="w-11 h-11 rounded-full bg-[#5B19E8] text-white flex items-center justify-center shrink-0 shadow-[0_6px_16px_rgba(91,25,232,0.32)] hover:brightness-105 active:scale-95 transition-all"
          >
            <Send size={17} />
          </button>
        </form>
      </div>
    </div>
  );
};

// SCREEN E1 & E2 — Budget Creation and Success
export const BudgetCreationScreens: React.FC = () => {
  const {
    currentScreen,
    monEspaceSubTab,
    selectedCategory,
    setSelectedCategory,
    categoryBreakdown,
    sharedExpenses,
    budgets,
    challenges,
    screenHistory,
    selectedBudgetScope,
    setSelectedBudgetScope,
    createOrUpdateBudget,
    budgetCreationOrigin,
    clearBudgetCreationOrigin,
    courseReturnContext,
    setPeriodFilter,
    setAccountScope,
    navigateTo,
    goBack,
  } = usePFM();

  const catSummary =
    categoryBreakdown.find((c) => c.category === selectedCategory) ||
    categoryBreakdown[0];

  const isFoyerScope = selectedBudgetScope === 'FOYER';
  const familyOctoberSpentByCat: Partial<Record<SpendingCategory, number>> = {
    Courses: 2600,
    Factures: 1350,
    Loisirs: 780,
  };

  const sharedCategoryExpenses = sharedExpenses.filter(
    (e) => e.category === selectedCategory
  );
  const sharedCategoryTotal =
    familyOctoberSpentByCat[selectedCategory] ??
    sharedCategoryExpenses.reduce((sum, e) => sum + e.totalAmount, 0);
  const hasHouseholdCategoryData = sharedCategoryTotal > 0;

  const existingBudget = isFoyerScope
    ? budgets[`${selectedCategory}_FOYER`]
    : budgets[selectedCategory];

  const defaultFamilyLimits: Partial<Record<SpendingCategory, number>> = {
    Courses: 3200,
    Factures: 1800,
    Loisirs: 1200,
  };

  const defaultPersonalLimits: Record<SpendingCategory, number> = {
    Shopping: 1600,
    Sorties: 750,
    Courses: 1850,
    Transport: 500,
    Factures: 1500,
    Autres: 400,
    Loisirs: 750,
  };

  const [limitAmount, setLimitAmount] = useState<number>(
    existingBudget?.limit ||
      (isFoyerScope
        ? defaultFamilyLimits[selectedCategory] || 1800
        : defaultPersonalLimits[selectedCategory] || 1600)
  );
  const [alertAt80, setAlertAt80] = useState<boolean>(
    existingBudget ? existingBudget.alertThresholdPct === 80 : true
  );
  const [isCatSheetOpen, setIsCatSheetOpen] = useState<boolean>(false);
  const [startMonthOption, setStartMonthOption] = useState<'CURRENT' | 'NEXT'>(
    existingBudget?.startPeriod || 'CURRENT'
  );
  const [isStartDateSheetOpen, setIsStartDateSheetOpen] =
    useState<boolean>(false);
  const [isEditingAmount, setIsEditingAmount] = useState<boolean>(false);
  const [amountInputStr, setAmountInputStr] = useState<string>(
    String(limitAmount)
  );
  const amountInputRef = React.useRef<HTMLInputElement>(null);

  const updateBudgetLimit = (nextValue: number) => {
    const clamped = Math.max(400, Math.min(5000, Math.round(nextValue)));
    setLimitAmount(clamped);
    setAmountInputStr(String(clamped));
  };

  const commitAmountInput = () => {
    setIsEditingAmount(false);
    const parsed = parseInt(amountInputStr.replace(/\D/g, ''), 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      updateBudgetLimit(parsed);
    } else {
      setAmountInputStr(String(limitAmount));
    }
  };

  const selectableCategories: SpendingCategory[] = isFoyerScope
    ? ['Courses', 'Factures', 'Loisirs', 'Shopping', 'Transport', 'Autres']
    : ['Shopping', 'Sorties', 'Courses', 'Transport', 'Factures', 'Autres'];

  if (currentScreen === 'E2_BUDGET_SUCCESS') {
    const configuredBudget = existingBudget || {
      category: selectedCategory,
      limit: limitAmount,
      alertThresholdPct: alertAt80 ? 80 : 100,
      scope: selectedBudgetScope,
      startPeriod: startMonthOption,
    };
    const effectiveScope: BudgetScope =
      configuredBudget.scope || selectedBudgetScope || 'PERSONNEL';
    const effectiveStartPeriod =
      configuredBudget.startPeriod || startMonthOption || 'CURRENT';
    const octSpentForCat =
      effectiveScope === 'FOYER' ? sharedCategoryTotal : catSummary.amount;
    const trackedSpent =
      effectiveStartPeriod === 'CURRENT' ? octSpentForCat : 0;
    const isExceeded =
      effectiveStartPeriod === 'CURRENT' &&
      trackedSpent > configuredBudget.limit;
    const exceededBy = Math.max(0, trackedSpent - configuredBudget.limit);
    const remainingBudget = Math.max(0, configuredBudget.limit - trackedSpent);

    const shoppingChallenge = challenges.find(
      (c) => c.id === 'defi-shopping-1'
    );
    const showOptionalShoppingChallenge =
      configuredBudget.category === 'Shopping' &&
      effectiveScope === 'PERSONNEL' &&
      Boolean(shoppingChallenge);

    return (
      <div className="min-h-full flex flex-col justify-between bg-simple-canvas p-6 text-center">
        <div className="pt-4 space-y-5">
          {/* 1. SUCCESS FEEDBACK */}
          <div>
            <div className="w-16 h-16 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center mx-auto shadow-sm">
              <Check size={32} strokeWidth={2.5} />
            </div>

            <span className="inline-block px-3.5 py-1 rounded-full bg-[#E7F7F0] text-[#12895B] text-xs font-bold mt-4">
              Suivi budgétaire activé
            </span>
            <h2 className="text-[22px] font-extrabold text-[#14111F] mt-2">
              {effectiveScope === 'FOYER'
                ? `Votre budget familial ${configuredBudget.category} est prêt !`
                : `Votre budget ${configuredBudget.category} est prêt !`}
            </h2>
            <p className="text-[13.5px] text-[#7D7693] mt-1.5 leading-relaxed max-w-xs mx-auto">
              Votre nouveau repère de{' '}
              <strong className="text-[#14111F] tabular-nums">
                {formatDH(configuredBudget.limit)}
              </strong>{' '}
              par mois est en place.
            </p>
          </div>

          {/* 2. SIMPLIFIED BUDGET SUMMARY WITH ACTUAL STATUS */}
          <div className="card-simple px-4 py-3.5 space-y-3 text-left">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <CategoryIcon category={configuredBudget.category} size="md" />
                <div className="min-w-0">
                  <span className="text-[11.5px] font-medium text-[#7D7693] block">
                    Catégorie suivie
                  </span>
                  <p className="text-[15px] font-extrabold text-[#14111F] truncate">
                    {configuredBudget.category}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11.5px] font-medium text-[#7D7693] block">
                  Budget mensuel
                </span>
                <span className="text-[16px] font-extrabold text-[#5E1DF0] tabular-nums">
                  {formatDH(configuredBudget.limit)} / mois
                </span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-[#F3EFFA] flex items-center justify-between gap-2 text-[12px]">
              <span className="font-medium text-[#7D7693] tabular-nums">
                {effectiveStartPeriod === 'CURRENT' ? (
                  <>
                    Dépenses d&apos;octobre :{' '}
                    <strong className="font-extrabold text-[#14111F]">
                      {formatDH(trackedSpent)}
                    </strong>
                  </>
                ) : (
                  'Suivi à partir du 1er novembre'
                )}
              </span>

              {effectiveStartPeriod === 'CURRENT' ? (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11.5px] font-bold tabular-nums shrink-0 ${
                    isExceeded
                      ? 'bg-[#FFF7ED] text-[#B45309]'
                      : 'bg-[#E7F7F0] text-[#0F7B52]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isExceeded ? 'bg-[#F59E0B]' : 'bg-[#12895B]'
                    }`}
                  />
                  <span>
                    {isExceeded
                      ? `Dépassé de ${formatDH(exceededBy)}`
                      : `${formatDH(remainingBudget)} disponibles`}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E7F7F0] text-[#0F7B52] text-[11.5px] font-bold tabular-nums shrink-0">
                  {formatDH(configuredBudget.limit)} disponibles
                </span>
              )}
            </div>
          </div>

          {/* 3. SIMPLIFIED OPTIONAL CHALLENGE ROW */}
          {showOptionalShoppingChallenge && (
            <div className="rounded-[20px] bg-[#F5F1FF] border border-[#E5DCFF] px-4 py-3.5 text-left flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#EAE2FF] text-[#5E1DF0] flex items-center justify-center shrink-0 mt-0.5">
                <Flag size={15} strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-extrabold text-[#14111F] leading-snug">
                  Et si vous gardiez le cap ?
                </p>
                <p className="text-[12px] text-[#7D7693] mt-0.5 leading-relaxed">
                  Un défi de 4 semaines vous attend dans Mes défis, si vous souhaitez aller plus loin.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4. PRIMARY CTA (Context-aware based on entry origin) */}
        <div className="pt-5">
          <button
            type="button"
            onClick={() => {
              const isFromLearnAndEarn = budgetCreationOrigin === 'LEARN_EARN';
              clearBudgetCreationOrigin();
              if (isFromLearnAndEarn) {
                if (courseReturnContext) {
                  setPeriodFilter(courseReturnContext.periodFilter);
                  setAccountScope(courseReturnContext.accountScope);
                }
                navigateTo('C1_HUB', {
                  hubTab: 'MON_ESPACE',
                  monEspaceSubTab: 'DEPENSES',
                });
              } else if (effectiveScope === 'FOYER') {
                navigateTo('J4_FAMILY_BUDGETS');
              } else {
                navigateTo('C1_HUB', {
                  hubTab: 'MON_ESPACE',
                  monEspaceSubTab: 'BUDGETS',
                });
              }
            }}
            className="w-full h-[52px] btn-simple-primary text-[15px] font-semibold flex items-center justify-center gap-2"
          >
            <span>
              {budgetCreationOrigin === 'LEARN_EARN'
                ? 'Continuer vers Mes finances'
                : effectiveScope === 'FOYER'
                ? 'Voir nos budgets'
                : 'Voir mon budget'}
            </span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN E1 — Budget creation (Redesigned compact, colorful, premium flow)
  const spentAmount = isFoyerScope ? sharedCategoryTotal : catSummary.amount;
  const coachSuggestedAmount = isFoyerScope
    ? defaultFamilyLimits[selectedCategory] || 1800
    : selectedCategory === 'Shopping'
    ? 1500
    : Math.max(
        500,
        Math.round((catSummary.prevMonthAmount || catSummary.amount * 0.85) / 100) * 100
      );

  const diffWithOct = spentAmount - limitAmount;

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas pb-5">
      {/* HEADER */}
      <MobileHeader
        title={isFoyerScope ? 'Budget de ma famille' : 'Créer un budget'}
        onBack={goBack}
      />

      <div className="px-5 pt-2 pb-4 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3.5">
          {/* 1. CATEGORY HEADER — Two-row layout to prevent crowded/overlapping text */}
          <section className="card-simple px-4 py-3.5 space-y-2.5">
            {/* First row: Category icon + Category name + "Modifier" action */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <CategoryIcon category={selectedCategory} size="md" />
                <h2 className="text-[16px] font-extrabold text-[#14111F] leading-snug truncate">
                  {selectedCategory}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsCatSheetOpen(true)}
                className="inline-flex items-center gap-1 text-[13px] font-bold text-[#8000EB] hover:text-[#6800BF] transition-colors shrink-0 py-1.5 px-3 rounded-full bg-[#F6F1FF] hover:bg-[#EDE3FF]"
              >
                <span>Modifier</span>
              </button>
            </div>

            {/* Second row: Spending reference with subtle amber indicator */}
            <div className="flex items-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF7ED] border border-[#FED7AA]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" />
                <span className="text-[12px] font-bold text-[#B45309] tabular-nums">
                  {formatDH(spentAmount)} dépensés en octobre
                </span>
              </div>
            </div>
          </section>

          {/* 2. MONTHLY BUDGET — MAIN FOCUS */}
          <section className="card-simple p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[15px] font-extrabold text-[#14111F]">
                Mon budget mensuel
              </h3>
              <button
                type="button"
                onClick={() => updateBudgetLimit(coachSuggestedAmount)}
                className="text-[11.5px] font-bold text-[#7D7693] hover:text-[#8000EB] transition-colors tabular-nums shrink-0"
              >
                Repère suggéré :{' '}
                <span className="font-extrabold text-[#8000EB]">
                  {formatDH(coachSuggestedAmount)}
                </span>
              </button>
            </div>

            {/* Large Directly Editable Amount with Functional − / + Controls */}
            <div className="flex items-center justify-between gap-3 py-1.5">
              <button
                type="button"
                aria-label="Diminuer le budget"
                onClick={() => updateBudgetLimit(limitAmount - 100)}
                className="w-12 h-12 rounded-full bg-[#F4EEFF] text-[#8000EB] text-[22px] font-extrabold hover:bg-[#E7DAFF] active:scale-95 transition-all shrink-0 flex items-center justify-center"
              >
                −
              </button>

              <div className="text-center min-w-0 flex-1">
                {isEditingAmount ? (
                  <div className="inline-flex items-baseline justify-center gap-1 border-b-2 border-[#8000EB] pb-0.5 px-2">
                    <input
                      ref={amountInputRef}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoFocus
                      value={amountInputStr}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        setAmountInputStr(digits);
                        const num = parseInt(digits, 10);
                        if (!Number.isNaN(num) && num >= 100 && num <= 50000) {
                          setLimitAmount(num);
                        }
                      }}
                      onBlur={commitAmountInput}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          commitAmountInput();
                        }
                      }}
                      aria-label="Montant du budget mensuel en DH"
                      className="w-28 text-center text-[34px] font-extrabold text-[#14111F] tabular-nums leading-none tracking-tight bg-transparent focus:outline-none"
                    />
                    <span className="text-[22px] font-extrabold text-[#14111F]">
                      DH
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAmountInputStr(String(limitAmount));
                      setIsEditingAmount(true);
                      setTimeout(() => amountInputRef.current?.select(), 10);
                    }}
                    title="Touchez pour saisir un montant"
                    className="inline-flex items-center justify-center px-3 py-1 rounded-2xl hover:bg-[#FAF8FE] active:bg-[#F4EEFF] transition-colors cursor-text"
                  >
                    <span className="text-[36px] font-extrabold text-[#14111F] tabular-nums leading-none tracking-tight border-b border-dashed border-[#D5CDE6]">
                      {formatDH(limitAmount)}
                    </span>
                  </button>
                )}
                <span className="text-[12px] font-semibold text-[#7D7693] mt-1 block">
                  par mois
                </span>
              </div>

              <button
                type="button"
                aria-label="Augmenter le budget"
                onClick={() => updateBudgetLimit(limitAmount + 100)}
                className="w-12 h-12 rounded-full bg-[#F4EEFF] text-[#8000EB] text-[22px] font-extrabold hover:bg-[#E7DAFF] active:scale-95 transition-all shrink-0 flex items-center justify-center"
              >
                +
              </button>
            </div>

            {/* Compact Dynamic Mint Insight */}
            <div className="rounded-[16px] bg-[#ECFDF5] border border-[#A7F3D0] px-3.5 py-2.5 flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0" />
              <p className="text-[12.5px] font-bold text-[#065F46] leading-snug tabular-nums">
                {diffWithOct > 0
                  ? `Un repère de ${formatDH(diffWithOct)} de moins que vos dépenses d'octobre.`
                  : diffWithOct < 0
                  ? `Un repère de ${formatDH(Math.abs(diffWithOct))} de plus que vos dépenses d'octobre.`
                  : `Un repère identique à vos dépenses d'octobre (${formatDH(spentAmount)}).`}
              </p>
            </div>
          </section>

          {/* 3. TRACKING & ALERTS */}
          <div className="space-y-2">
            <section className="card-simple px-4 py-3 divide-y divide-[#F3EFFA]">
              {/* Row 1: Début du suivi */}
              <div className="pb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#F4EEFF] text-[#8000EB] flex items-center justify-center shrink-0">
                    <Calendar size={16} />
                  </div>
                  <p className="text-[13.5px] font-bold text-[#14111F] truncate">
                    Début du suivi
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsStartDateSheetOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F6F3FF] hover:bg-[#EDE4FF] text-[#8000EB] text-[12px] font-bold transition-colors shrink-0"
                >
                  <span>
                    {startMonthOption === 'CURRENT'
                      ? 'Ce mois-ci · Octobre'
                      : 'Mois prochain · Novembre'}
                  </span>
                  <ChevronDown size={13} strokeWidth={2.4} />
                </button>
              </div>

              {/* Row 2: Alerte à 80 % */}
              <div className="pt-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      alertAt80
                        ? 'bg-[#FFF7ED] text-[#D97706]'
                        : 'bg-[#F4F1FA] text-[#7D7693]'
                    }`}
                  >
                    <Bell size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-bold text-[#14111F] truncate">
                      Alerte à 80 %
                    </p>
                    <p className="text-[12px] font-medium text-[#7D7693] tabular-nums truncate">
                      Dès {formatDH(Math.round(limitAmount * 0.8))} dépensés
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={alertAt80}
                  onClick={() => setAlertAt80((v) => !v)}
                  className={`w-11 h-6.5 rounded-full p-0.5 transition-colors shrink-0 ${
                    alertAt80 ? 'bg-[#8000EB]' : 'bg-[#D5CDE6]'
                  }`}
                >
                  <div
                    className={`w-5.5 h-5.5 rounded-full bg-white shadow-2xs transition-transform ${
                      alertAt80 ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </section>

            {/* Discreet Reassurance Below */}
            <p className="text-[11.5px] font-medium text-[#7D7693] text-center px-2">
              Renouvelé chaque mois. Arrêtable à tout moment.
            </p>
          </div>
        </div>

        {/* 5. PRIMARY CREATION CTA */}
        <button
          type="button"
          onClick={() => {
            const parsed = parseInt(amountInputStr.replace(/\D/g, ''), 10);
            const finalLimit =
              isEditingAmount && !Number.isNaN(parsed) && parsed > 0
                ? Math.max(400, Math.min(5000, Math.round(parsed)))
                : limitAmount;
            setLimitAmount(finalLimit);
            setAmountInputStr(String(finalLimit));
            setIsEditingAmount(false);
            createOrUpdateBudget(
              selectedCategory,
              finalLimit,
              alertAt80 ? 80 : 100,
              selectedBudgetScope,
              startMonthOption
            );
            navigateTo('E2_BUDGET_SUCCESS');
          }}
          className="w-full h-[52px] rounded-full bg-[#8000EB] hover:bg-[#7000CE] text-white text-[15px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_22px_-4px_rgba(128,0,235,0.34)] transition-all active:scale-[0.985]"
        >
          <span>
            {existingBudget
              ? `Enregistrer le budget ${selectedCategory}`
              : `Créer mon budget ${selectedCategory}`}
          </span>
          <ArrowRight size={17} />
        </button>
      </div>

      {/* Start Date Selection Bottom Sheet */}
      {isStartDateSheetOpen && (
        <div
          className="fixed sm:absolute inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setIsStartDateSheetOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-[34px] p-6 shadow-2xl border-t border-[#ECE7F6]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto mb-4" />
            <h3 className="text-[18px] font-extrabold text-[#14111F]">
              Début du suivi
            </h3>
            <p className="text-[12px] text-[#7D7693] mt-1">
              Choisissez quand démarrer le suivi de votre budget mensuel.
            </p>

            <div className="mt-4 space-y-2.5">
              {(
                [
                  {
                    id: 'CURRENT',
                    title: 'Ce mois-ci · Octobre',
                    subtitle: 'Inclut les dépenses déjà réalisées en octobre',
                  },
                  {
                    id: 'NEXT',
                    title: 'Mois prochain · Novembre',
                    subtitle: 'Démarre le 1er novembre à 0 DH',
                  },
                ] as const
              ).map((opt) => {
                const active = startMonthOption === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setStartMonthOption(opt.id);
                      setIsStartDateSheetOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-[20px] flex items-center justify-between border text-left transition-all ${
                      active
                        ? 'border-[#8000EB] bg-[#F6F3FF]'
                        : 'border-[#EFEBF8] hover:bg-[#FAF8FF]'
                    }`}
                  >
                    <div>
                      <p className="text-[14px] font-bold text-[#14111F]">
                        {opt.title}
                      </p>
                      <p className="text-[11.5px] text-[#7D7693] mt-0.5">
                        {opt.subtitle}
                      </p>
                    </div>
                    {active && (
                      <Check size={17} className="text-[#8000EB] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsStartDateSheetOpen(false)}
              className="mt-4 w-full h-11 rounded-full bg-[#F5F2FA] text-[#14111F] text-[13px] font-bold"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
      {isCatSheetOpen && (
        <div className="fixed sm:absolute inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-end justify-center">
          <div className="w-full bg-white rounded-t-[34px] p-6 shadow-2xl border-t border-[#ECE7F6]">
            <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto mb-4" />
            <h3 className="text-[18px] font-extrabold text-[#14111F]">
              Choisir une catégorie
            </h3>
            <p className="text-[12px] text-[#7D7693] mt-1">
              Sélectionnez la catégorie de dépenses à suivre.
            </p>

            <div className="mt-4 space-y-2 max-h-[55vh] overflow-y-auto no-scrollbar">
              {selectableCategories.map((cat) => {
                const isCurrent = selectedCategory === cat;
                const catData = categoryBreakdown.find(
                  (c) => c.category === cat
                );
                const catSpent = isFoyerScope
                  ? familyOctoberSpentByCat[cat] ?? 0
                  : catData
                  ? catData.amount
                  : 0;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      const catBudget = isFoyerScope
                        ? budgets[`${cat}_FOYER`]
                        : budgets[cat];
                      if (catBudget) {
                        updateBudgetLimit(catBudget.limit);
                      } else if (isFoyerScope && defaultFamilyLimits[cat]) {
                        updateBudgetLimit(defaultFamilyLimits[cat]!);
                      }
                      setIsCatSheetOpen(false);
                    }}
                    className={`w-full p-3.5 rounded-[22px] flex items-center justify-between border text-left transition-all ${
                      isCurrent
                        ? 'border-[#5E1DF0] bg-[#F6F3FF]'
                        : 'border-[#EFEBF8] hover:bg-[#FAF8FF]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={cat} size="md" />
                      <div>
                        <p className="text-[14px] font-bold text-[#14111F]">
                          {cat}
                        </p>
                        <p className="text-[11.5px] text-[#7D7693] tabular-nums">
                          {formatDH(catSpent)} dépensés en octobre
                        </p>
                      </div>
                    </div>
                    {isCurrent && (
                      <Check size={17} className="text-[#5E1DF0] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsCatSheetOpen(false)}
              className="mt-4 w-full h-11 rounded-full bg-[#F5F2FA] text-[#14111F] text-[13px] font-bold"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// SCREEN E4 — Prévisions de solde et charges fixes (Chapter 2)
export const ForecastAndRecurringScreen: React.FC = () => {
  const {
    mainAccountBalance,
    estimatedEndOfMonthBalance,
    dailyAllowance,
    identifiedIncome,
    remainingDisposableIncome,
    navigateTo,
    goBack,
  } = usePFM();

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
      <MobileHeader
        title="Prévisions & Échéances"
        subtitle="Anticipation du solde et charges fixes"
        onBack={goBack}
      />

      <div className="p-5 space-y-4 flex-1">
        {/* End-of-month Forecast Card */}
        <section className="card-simple p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                <TrendingUp size={20} strokeWidth={2.2} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#5E1DF0] block">
                  Anticipation prédictive · Octobre 2026
                </span>
                <h2 className="text-[17px] font-extrabold text-[#14111F]">
                  Solde prévisionnel fin de mois
                </h2>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#E7F7F0] text-[#0F7B52] text-xs font-bold">
              Solde positif
            </span>
          </div>

          <div className="pt-1">
            <p className="text-[32px] font-extrabold text-[#14111F] tabular-nums tracking-tight leading-none">
              ~{formatDH(estimatedEndOfMonthBalance)}
            </p>
            <p className="text-[12px] text-[#7D7693] mt-2 leading-relaxed">
              Calculé à partir de votre solde actuel ({formatDH(mainAccountBalance)}) après déduction de vos charges récurrentes à venir d'ici votre prochain salaire.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-[20px] bg-[#F7F4FE] border border-[#EFEBF8]">
              <span className="text-[11px] text-[#7D7693] block">
                Reste à vivre journalier
              </span>
              <p className="text-[16px] font-extrabold text-[#5E1DF0] tabular-nums mt-0.5">
                {formatDH(dailyAllowance)} / jour
              </p>
              <span className="text-[10px] text-[#8E87A6] mt-0.5 block">
                Jusqu'au 28 oct. (17 j)
              </span>
            </div>

            <div className="p-3.5 rounded-[20px] bg-[#F7F4FE] border border-[#EFEBF8]">
              <span className="text-[11px] text-[#7D7693] block">
                Prochain salaire net
              </span>
              <p className="text-[16px] font-extrabold text-[#14111F] tabular-nums mt-0.5">
                {formatDH(identifiedIncome)}
              </p>
              <span className="text-[10px] text-[#8E87A6] mt-0.5 block">
                Attendu le 28 du mois
              </span>
            </div>
          </div>
        </section>

        {/* Recurring Charges List */}
        <section className="card-simple p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-extrabold text-[#14111F]">
              Charges fixes & abonnements
            </h3>
            <span className="text-xs font-bold text-[#7D7693]">
              5 charges identifiées
            </span>
          </div>

          <div className="divide-y divide-[#F3EFFA]">
            {INITIAL_RECURRING_CHARGES.map((charge) => (
              <div
                key={charge.id}
                className="py-3 flex items-center justify-between text-left gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                    <Calendar size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#14111F] truncate">
                      {charge.title}
                    </p>
                    <p className="text-[11px] text-[#7D7693] mt-0.5">
                      Échéance le {charge.dueDay} du mois · {charge.category}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[14px] font-extrabold text-[#14111F] tabular-nums block">
                    {formatDH(charge.amount)}
                  </span>
                  <span
                    className={`text-[10px] font-bold block ${
                      charge.dueDay <= 10
                        ? 'text-[#0F7B52]'
                        : 'text-[#D97706]'
                    }`}
                  >
                    {charge.dueDay <= 10 ? 'Déjà prélevé' : 'À venir'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Financial Coach Recommendation */}
        <section className="rounded-[24px] bg-[#F5F1FF] p-4 flex items-center justify-between gap-3 border border-[#E2D6FF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EAE2FF] text-[#5E1DF0] flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#14111F]">
                Envie de poser un cadre clair ?
              </p>
              <p className="text-[11px] text-[#7D7693] mt-0.5">
                Créez un budget Shopping pour sécuriser votre fin de mois
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              navigateTo('E1_CREATE_BUDGET', { category: 'Shopping' })
            }
            className="px-3.5 py-2 rounded-full bg-[#5E1DF0] text-white text-xs font-semibold shrink-0 hover:brightness-105"
          >
            Créer
          </button>
        </section>
      </div>
    </div>
  );
};

// SCREEN D5 — Mes abonnements (Subscriptions Detail View in Dépenses)
export const SubscriptionsDetailScreen: React.FC = () => {
  const {
    detectedSubscriptions,
    confirmedSubscriptions,
    pendingSubscriptions,
    confirmedSubscriptionsMonthlyTotal,
    confirmSubscription,
    dismissSubscription,
    updateSubscriptionFrequency,
    resetSubscriptionsDetection,
    dismissToast,
    transactions,
    currentMonthExpenses,
    navigateTo,
  } = usePFM();

  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [expandedHistorySubId, setExpandedHistorySubId] = useState<
    string | null
  >(null);
  const [isSubChallengeFlowOpen, setIsSubChallengeFlowOpen] = useState(false);
  const [subStepIndex, setSubStepIndex] = useState(0);
  const [showSubCompletionScreen, setShowSubCompletionScreen] = useState(false);
  const [expandedFlowTxHistory, setExpandedFlowTxHistory] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedSubId((prev) => {
      const next = prev === id ? null : id;
      if (next !== id) {
        setExpandedHistorySubId(null);
      }
      return next;
    });
  };

  // Eligible subscription candidates for the challenge (excludes already-confirmed baseline subscriptions and rent/syndic)
  const challengeCandidates = detectedSubscriptions.filter(
    (s) => s.id !== 'tx-oct-aut-3' && s.id !== 'tx-oct-aut-4'
  );
  const totalChallengeCount = challengeCandidates.length;
  const reviewedChallengeCount = challengeCandidates.filter(
    (s) => s.status === 'CONFIRMED' || s.status === 'DISMISSED'
  ).length;
  const remainingChallengeCount = Math.max(
    0,
    totalChallengeCount - reviewedChallengeCount
  );
  const challengeProgressPct =
    totalChallengeCount > 0
      ? Math.round((reviewedChallengeCount / totalChallengeCount) * 100)
      : 0;

  const challengeEncouragementText =
    reviewedChallengeCount === 0
      ? 'Faites le tri et débloquez votre badge !'
      : reviewedChallengeCount === 1 && totalChallengeCount > 1
      ? 'Bien vu ! Un premier abonnement clarifié.'
      : 'Vous y voyez plus clair !';

  const openSubChallengeFlow = () => {
    const firstPendingIdx = challengeCandidates.findIndex(
      (s) => s.status === 'PENDING'
    );
    setSubStepIndex(firstPendingIdx >= 0 ? firstPendingIdx : 0);
    setExpandedFlowTxHistory(false);
    setShowSubCompletionScreen(firstPendingIdx === -1);
    setIsSubChallengeFlowOpen(true);
  };

  const advanceOrFinishSubChallengeFlow = (justReviewedId: string) => {
    setExpandedFlowTxHistory(false);
    const nextPendingIdx = challengeCandidates.findIndex(
      (s, idx) =>
        idx > subStepIndex &&
        s.id !== justReviewedId &&
        s.status === 'PENDING'
    );
    if (nextPendingIdx >= 0) {
      setSubStepIndex(nextPendingIdx);
      return;
    }
    const anyOtherPendingIdx = challengeCandidates.findIndex(
      (s) => s.id !== justReviewedId && s.status === 'PENDING'
    );
    if (anyOtherPendingIdx >= 0) {
      setSubStepIndex(anyOtherPendingIdx);
      return;
    }
    setShowSubCompletionScreen(true);
  };

  // Next expected payment from confirmed subscriptions
  const nextExpectedSub = confirmedSubscriptions[0] || null;

  // Real data insights derived from actual transactions
  const octRecurringTotal = transactions
    .filter(
      (tx) => tx.monthKey === '2026-10' && tx.type === 'EXPENSE' && tx.isRecurring
    )
    .reduce((sum, tx) => sum + tx.amount, 0);
  const sepRecurringTx = transactions.find((tx) => tx.id === 'tx-sep-aut-1');
  const augRecurringTx = transactions.find((tx) => tx.id === 'tx-aug-aut-1');
  const sepRecurringAmount = sepRecurringTx ? sepRecurringTx.amount : 0;
  const augRecurringAmount = augRecurringTx ? augRecurringTx.amount : 0;
  const octVsSepDiff = octRecurringTotal - sepRecurringAmount;

  const hasAnyIdentifiedSubscriptions =
    confirmedSubscriptions.length > 0 ||
    pendingSubscriptions.length > 0 ||
    challengeCandidates.length > 0;

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
      <MobileHeader
        title="Mes abonnements"
        subtitle="Gardez un œil sur vos paiements récurrents."
        onBack={() =>
          navigateTo('C1_HUB', {
            hubTab: 'MON_ESPACE',
            monEspaceSubTab: 'DEPENSES',
          })
        }
      />

      <div className="px-5 pt-2 pb-6 space-y-4 flex-1">
        {!hasAnyIdentifiedSubscriptions ? (
          /* 5. EMPTY STATE */
          <section className="card-simple p-6 text-center space-y-3 mt-2">
            <div className="w-12 h-12 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center mx-auto">
              <Repeat size={21} strokeWidth={2.2} />
            </div>
            <div className="space-y-1.5 max-w-[290px] mx-auto">
              <h2 className="text-[16px] font-extrabold text-[#14111F] leading-snug">
                Aucun abonnement identifié pour le moment
              </h2>
              <p className="text-[13px] text-[#7D7693] leading-relaxed">
                Retrouvez ici vos abonnements dès qu'ils auront été identifiés.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={resetSubscriptionsDetection}
                className="px-4 py-2 rounded-full bg-[#F5F1FF] text-[#5E1DF0] text-xs font-bold hover:bg-[#EAE2FF] transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw size={13} />
                <span>Réanalyser mes opérations</span>
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* Top Summary Card (Confirmed totals only) */}
            <section className="card-simple p-4 space-y-3.5 shadow-[0_12px_28px_-8px_rgba(41,7,100,0.08)] border border-[#ECE4FA]">
              {/* 1. MAIN FINANCIAL HIGHLIGHT */}
              <div className="rounded-[20px] bg-[#F5F1FF] border border-[#E6D9FC] p-4 space-y-2.5">
                {/* Top row: small subscription icon, label, compact confirmed badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-white text-[#8000EB] shadow-[0_4px_10px_rgba(128,0,235,0.12)] flex items-center justify-center shrink-0">
                      <Repeat size={15} strokeWidth={2.3} />
                    </div>
                    <span className="text-[12.5px] font-semibold text-[#5E4E82] truncate">
                      Coût mensuel estimé
                    </span>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-[#E8F8F2] text-[#0F7B52] border border-[#CBECE0] text-[11px] font-extrabold inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                    <Check size={10.5} strokeWidth={3} className="text-[#12895B]" />
                    <span>
                      {confirmedSubscriptions.length} confirmé
                      {confirmedSubscriptions.length > 1 ? 's' : ''}
                    </span>
                  </span>
                </div>

                {/* Single horizontal line amount */}
                <div className="flex items-baseline gap-1.5 whitespace-nowrap pt-0.5">
                  <h2 className="text-[30px] font-extrabold text-[#290764] tabular-nums leading-none tracking-tight whitespace-nowrap">
                    {formatDH(confirmedSubscriptionsMonthlyTotal)}
                  </h2>
                  <span className="text-[14px] font-medium text-[#6B5E94] whitespace-nowrap">
                    / mois
                  </span>
                </div>
              </div>

              {/* 2. NEXT PAYMENT (Clean horizontal information row) */}
              <div className="flex items-start gap-3 px-1 pt-0.5">
                <div className="w-9 h-9 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar size={16} strokeWidth={2.2} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11.5px] font-medium text-[#7D7693] block">
                    Prochain paiement estimé
                  </span>
                  {nextExpectedSub ? (
                    <>
                      <p className="text-[14px] font-extrabold text-[#14111F] leading-snug break-words mt-0.5">
                        {nextExpectedSub.merchant}
                      </p>
                      <span className="text-[12px] font-bold text-[#8000EB] tabular-nums mt-0.5 block">
                        {nextExpectedSub.nextExpectedDate.replace(/^~\s*/, '')}
                      </span>
                    </>
                  ) : (
                    <span className="text-[13px] font-bold text-[#7D7693] mt-0.5 block">
                      Non disponible
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* 2. CONFIRMED SUBSCRIPTIONS LIST (Unified container positioned directly below monthly summary) */}
            <section className="card-simple p-4 space-y-3 border border-[#EFEBF8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={19} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[16px] font-semibold text-[#14111F] leading-tight">
                    Abonnements confirmés
                  </h3>
                  <p className="text-[12px] text-[#7D7693] mt-0.5 leading-snug">
                    Vos paiements récurrents à venir.
                  </p>
                </div>
              </div>

              {confirmedSubscriptions.length === 0 ? (
                <div className="pt-2 border-t border-[#F3EFFA] text-center space-y-1">
                  <p className="text-[14px] font-bold text-[#14111F]">
                    Aucun abonnement confirmé
                  </p>
                  <p className="text-[12.5px] text-[#7D7693]">
                    Confirmez l'un des paiements récurrents détectés ci-dessous pour l'ajouter à votre suivi mensuel.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#F3EFFA] border-t border-[#F3EFFA]">
                  {confirmedSubscriptions.map((sub) => {
                    const isExpanded = expandedSubId === sub.id;
                    const isHistoryOpen = expandedHistorySubId === sub.id;
                    const cleanNextDate = sub.nextExpectedDate.replace(
                      /^~\s*/,
                      ''
                    );

                    return (
                      <div
                        key={sub.id}
                        className="py-3 first:pt-3 last:pb-0.5 transition-all"
                      >
                        {/* Compact Horizontal Subscription Row */}
                        <button
                          type="button"
                          onClick={() => toggleExpand(sub.id)}
                          className="w-full text-left flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-full bg-[#EAF7EF] text-[#2E9A60] flex items-center justify-center shrink-0">
                              <Repeat size={18} strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-[14.5px] font-bold text-[#14111F] leading-snug truncate">
                                {sub.merchant}
                              </h4>
                              <p className="text-[12.5px] font-medium text-[#7D7693] mt-0.5 truncate">
                                Prochaine échéance :{' '}
                                <span className="text-[#5E1DF0] font-semibold tabular-nums">
                                  {cleanNextDate}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <span className="text-[15px] font-extrabold text-[#14111F] tabular-nums whitespace-nowrap block">
                                {formatDH(sub.amount)}
                                <span className="text-[11.5px] font-semibold text-[#7D7693]">
                                  {sub.frequency === 'Mensuel'
                                    ? ' / mois'
                                    : sub.frequency === 'Trimestriel'
                                    ? ' / trim.'
                                    : ' / an'}
                                </span>
                              </span>
                            </div>
                            <ChevronRight
                              size={16}
                              className={`text-[#8E87A6] transition-transform duration-200 shrink-0 ${
                                isExpanded ? 'rotate-90 text-[#5E1DF0]' : ''
                              }`}
                            />
                          </div>
                        </button>

                        {/* Expanded Subscription Details */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-[#F6F3FC] space-y-3">
                            {/* Last known payment, Next estimated payment, Billing frequency */}
                            <div className="rounded-[14px] bg-[#FAF8FE] p-3 space-y-1.5 text-[12px]">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[#7D7693] font-medium">
                                  Dernier paiement connu
                                </span>
                                <span className="font-bold text-[#14111F] tabular-nums">
                                  {sub.lastPaymentDate}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[#7D7693] font-medium">
                                  Prochain paiement estimé
                                </span>
                                <span className="font-bold text-[#5E1DF0] tabular-nums">
                                  {cleanNextDate}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[#7D7693] font-medium">
                                  Fréquence de facturation
                                </span>
                                <span className="font-bold text-[#14111F]">
                                  {sub.frequency}
                                </span>
                              </div>
                            </div>

                            {/* Frequency selector pill */}
                            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-[12px] bg-[#F5F1FF]">
                              {(
                                [
                                  'Mensuel',
                                  'Trimestriel',
                                  'Annuel',
                                ] as SubscriptionFrequency[]
                              ).map((freq) => {
                                const active = sub.frequency === freq;
                                return (
                                  <button
                                    key={freq}
                                    type="button"
                                    onClick={() =>
                                      updateSubscriptionFrequency(sub.id, freq)
                                    }
                                    className={`py-1.5 rounded-[9px] text-[11px] font-bold transition-all ${
                                      active
                                        ? 'bg-[#5E1DF0] text-white shadow-2xs'
                                        : 'text-[#4A4063] hover:text-[#14111F]'
                                    }`}
                                  >
                                    {freq}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Expandable "Historique & opérations" and Secondary Action "Ce n'est pas un abonnement" */}
                            <div className="pt-0.5 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedHistorySubId((prev) =>
                                    prev === sub.id ? null : sub.id
                                  )
                                }
                                className="text-[12px] font-bold text-[#5E1DF0] inline-flex items-center gap-1 hover:underline"
                              >
                                <span>
                                  {isHistoryOpen
                                    ? 'Masquer l’historique'
                                    : `Historique & opérations (${sub.relatedTransactions.length})`}
                                </span>
                                <ChevronDown
                                  size={14}
                                  className={`transition-transform duration-200 ${
                                    isHistoryOpen ? 'rotate-180' : ''
                                  }`}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() => dismissSubscription(sub.id)}
                                className="text-[11.5px] font-semibold text-[#7D7693] hover:text-rose-600 transition-colors"
                              >
                                Ce n'est pas un abonnement
                              </button>
                            </div>

                            {isHistoryOpen && (
                              <div className="divide-y divide-[#F3EFFA] bg-[#FAF8FE] rounded-[14px] px-3">
                                {sub.relatedTransactions.map((tx) => (
                                  <button
                                    key={tx.id}
                                    type="button"
                                    onClick={() =>
                                      navigateTo('D3_TRANSACTION_DETAIL', {
                                        transactionId: tx.id,
                                      })
                                    }
                                    className="w-full py-2.5 flex items-center justify-between text-left hover:opacity-80 transition-opacity"
                                  >
                                    <div className="min-w-0 pr-2">
                                      <p className="text-[12px] font-bold text-[#14111F] leading-snug">
                                        {tx.merchant}
                                      </p>
                                      <p className="text-[11px] text-[#7D7693]">
                                        {tx.date} · {tx.subtitle}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="text-[12px] font-extrabold text-[#14111F] tabular-nums">
                                        -{formatDH(tx.amount)}
                                      </span>
                                      <ChevronRight
                                        size={14}
                                        className="text-[#8E87A6]"
                                      />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 3. GAMIFIED SUBSCRIPTION CONFIRMATION WIDGET (Personal Challenge in Sky Blue) */}
            {challengeCandidates.length > 0 && (
              <section className="rounded-[24px] p-4 bg-[#F2F8FF] border border-[#BFE0FF] shadow-[0_8px_24px_-6px_rgba(79,169,255,0.1)] space-y-3.5">
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
                    {reviewedChallengeCount}/{totalChallengeCount} vérifiés
                  </span>
                </div>

                {/* 2. MAIN TITLE & SUPPORTING TEXT */}
                <div className="space-y-1">
                  <h2 className="text-[16px] font-extrabold text-[#14111F] leading-snug tracking-tight">
                    Et si on faisait le point sur vos abonnements ?
                  </h2>
                  <p className="text-[12.5px] text-[#6E6785] leading-relaxed">
                    {remainingChallengeCount > 0
                      ? `${totalChallengeCount} abonnements à examiner pour mieux maîtriser vos paiements.`
                      : 'Vos abonnements ont été examinés. Votre suivi est désormais plus précis.'}
                  </p>
                </div>

                {/* 3. SUBSCRIPTIONS TO REVIEW */}
                <div className="space-y-1.5">
                  <h3 className="text-[12px] font-bold text-[#5C6F84] px-0.5">
                    Les abonnements à examiner
                  </h3>

                  <div className="rounded-[18px] bg-white/90 border border-[#D6EBFF] divide-y divide-[#EAF4FF] px-3.5 py-1">
                    {challengeCandidates.map((sub, idx) => {
                      const isReviewed =
                        sub.status === 'CONFIRMED' || sub.status === 'DISMISSED';

                      return (
                        <div
                          key={sub.id}
                          className="py-2.5 first:pt-2 last:pb-2 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-full bg-[#DFF0FF] text-[#4FA9FF] flex items-center justify-center shrink-0">
                              {idx % 2 === 0 ? (
                                <Repeat size={15} strokeWidth={2.2} />
                              ) : (
                                <CalendarCheck size={15} strokeWidth={2.2} />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13.5px] font-bold text-[#14111F] leading-snug">
                                {sub.merchant}
                              </p>
                              <p className="text-[11.5px] font-medium text-[#7D7693] mt-0.5">
                                {sub.frequency}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isReviewed && (
                              <span
                                className="w-4 h-4 rounded-full bg-[#DFF0FF] text-[#4FA9FF] flex items-center justify-center"
                                aria-label="Examiné"
                              >
                                <Check size={10} strokeWidth={3} />
                              </span>
                            )}
                            <span className="text-[13.5px] font-extrabold text-[#14111F] tabular-nums">
                              {formatDH(sub.amount)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. PRIMARY CTA */}
                <div className="pt-0.5">
                  {remainingChallengeCount > 0 ? (
                    <button
                      type="button"
                      onClick={openSubChallengeFlow}
                      className="w-full h-11 px-4 rounded-full bg-white hover:bg-[#F5FAFF] text-[#4FA9FF] border border-[#4FA9FF] shadow-[0_2px_8px_rgba(79,169,255,0.08)] text-[13px] font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] whitespace-nowrap"
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
                            className="text-[#4FA9FF] shrink-0"
                          />
                          <span className="text-[12px] font-bold text-[#2476CE] truncate">
                            Défi terminé · {reviewedChallengeCount}/{totalChallengeCount} vérifiés
                          </span>
                        </div>
                        <span className="text-[11px] font-extrabold text-[#2476CE] shrink-0">
                          Badge « Abonnements clairs »
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          navigateTo('C1_HUB', { hubTab: 'MES_DEFIS' })
                        }
                        className="w-full h-11 px-4 rounded-full bg-white hover:bg-[#F5FAFF] text-[#4FA9FF] border border-[#4FA9FF] shadow-[0_2px_8px_rgba(79,169,255,0.08)] text-[13px] font-extrabold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                      >
                        <span>Voir mon badge dans Mes défis</span>
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* 5. DEDICATED GAMIFIED SUBSCRIPTION VERIFICATION FLOW */}
      {isSubChallengeFlowOpen && (() => {
        const currentFlowSub =
          challengeCandidates[subStepIndex] || challengeCandidates[0];

        return (
          <div className="fixed inset-0 z-50 bg-[#F7F4FE] flex flex-col">
            {/* Top Bar */}
            <header className="px-5 pt-4 pb-3 flex items-center justify-between gap-3 bg-[#F7F4FE]">
              <button
                type="button"
                onClick={() => {
                  setIsSubChallengeFlowOpen(false);
                  setExpandedFlowTxHistory(false);
                  setShowSubCompletionScreen(false);
                }}
                aria-label="Retour"
                className="w-10 h-10 rounded-full bg-white shadow-[0_4px_14px_rgba(20,17,31,0.06)] border border-[#EFEBF8] flex items-center justify-center text-[#14111F] hover:bg-[#FAF8FF] transition-all shrink-0"
              >
                <ArrowRight size={18} className="rotate-180" />
              </button>

              {!showSubCompletionScreen ? (
                <span className="text-[13px] font-extrabold text-[#2F80ED] tabular-nums">
                  {subStepIndex + 1} sur {totalChallengeCount}
                </span>
              ) : (
                <span className="text-[13px] font-extrabold text-[#2F80ED] tabular-nums">
                  Défi terminé · {totalChallengeCount}/{totalChallengeCount}
                </span>
              )}

              <div className="px-2.5 py-1 rounded-full bg-[#DFF0FF] border border-[#BFE0FF] text-[#2F80ED] text-[12px] font-extrabold tabular-nums flex items-center gap-1 shrink-0">
                <CalendarCheck
                  size={13}
                  strokeWidth={2.4}
                  className="text-[#4FA9FF]"
                />
                <span>
                  {reviewedChallengeCount}/{totalChallengeCount}
                </span>
              </div>
            </header>

            {!showSubCompletionScreen && currentFlowSub ? (
              <div className="px-5 pt-1 pb-7 flex-1 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  {/* Sky-Blue Progress Indicator & Encouraging Feedback */}
                  <div className="rounded-[20px] bg-[#F2F8FF] border border-[#BFE0FF] p-4 space-y-2.5 shadow-[0_8px_20px_-8px_rgba(79,169,255,0.14)]">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-bold text-[#14111F]">
                        Progression du défi
                      </span>
                      <span className="font-extrabold text-[#2F80ED] tabular-nums">
                        {reviewedChallengeCount}/{totalChallengeCount}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-[#DFF0FF] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#4FA9FF] rounded-full transition-all duration-300"
                        style={{ width: `${challengeProgressPct}%` }}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      {reviewedChallengeCount > 0 ? (
                        <span className="w-4 h-4 rounded-full bg-[#DFF0FF] text-[#2F80ED] flex items-center justify-center shrink-0">
                          <Check size={10} strokeWidth={3} />
                        </span>
                      ) : (
                        <CalendarCheck
                          size={14}
                          className="text-[#4FA9FF] shrink-0"
                        />
                      )}
                      <p className="text-[12px] font-semibold text-[#2F80ED] leading-snug">
                        {challengeEncouragementText}
                      </p>
                    </div>
                  </div>

                  {/* Single Subscription Spotlight Card */}
                  <div className="card-simple p-6 text-center space-y-5 border border-[#BFE0FF]">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-[#DFF0FF] text-[#4FA9FF] flex items-center justify-center">
                        <Repeat size={25} strokeWidth={2.2} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-[20px] font-extrabold text-[#14111F] leading-snug">
                          {currentFlowSub.merchant}
                        </h3>
                        <p className="text-[13px] font-medium text-[#7D7693]">
                          {currentFlowSub.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Estimated Recurring Amount */}
                    <div className="py-1">
                      <span className="text-[30px] font-extrabold text-[#2F80ED] tabular-nums tracking-tight">
                        {formatDH(currentFlowSub.amount)}
                      </span>
                      <span className="text-[14px] font-semibold text-[#5C6F84]">
                        {' '}
                        / mois
                      </span>
                    </div>

                    {/* Billing Frequency & Next Expected Payment Date */}
                    <div className="rounded-[18px] bg-[#F2F8FF] border border-[#BFE0FF] p-3.5 grid grid-cols-2 gap-3 text-left">
                      <div>
                        <span className="text-[11px] font-semibold text-[#5C6F84] block">
                          Fréquence
                        </span>
                        <span className="text-[14px] font-extrabold text-[#2F80ED] mt-0.5 block">
                          {currentFlowSub.frequency}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-[#5C6F84] block">
                          Prochain paiement
                        </span>
                        <span className="text-[14px] font-extrabold text-[#2F80ED] mt-0.5 block tabular-nums">
                          {currentFlowSub.nextExpectedDate.replace(/^~\s*/, '')}
                        </span>
                      </div>
                    </div>

                    {/* Expandable "Voir les opérations associées" (collapsed by default) */}
                    <div className="pt-1 border-t border-[#E6F2FF]">
                      <button
                        type="button"
                        onClick={() => setExpandedFlowTxHistory((prev) => !prev)}
                        className="w-full py-1 text-[12.5px] font-bold text-[#2F80ED] flex items-center justify-center gap-1.5 hover:underline"
                      >
                        <span>
                          {expandedFlowTxHistory
                            ? 'Masquer les opérations associées'
                            : `Voir les opérations associées (${currentFlowSub.relatedTransactions.length})`}
                        </span>
                        <ChevronDown
                          size={15}
                          className={`transition-transform duration-200 ${
                            expandedFlowTxHistory ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {expandedFlowTxHistory && (
                        <div className="mt-2.5 pt-2.5 border-t border-[#E6F2FF] text-left space-y-1.5">
                          <span className="text-[11px] font-bold text-[#5C6F84] block px-1">
                            Opérations détectées dans votre historique
                          </span>
                          <div className="divide-y divide-[#EAF4FF] rounded-[14px] bg-[#F2F8FF] border border-[#BFE0FF] px-3">
                            {currentFlowSub.relatedTransactions.map((tx) => (
                              <div
                                key={tx.id}
                                className="py-2.5 flex items-center justify-between gap-2"
                              >
                                <div className="min-w-0">
                                  <p className="text-[12px] font-bold text-[#14111F] leading-snug">
                                    {tx.merchant}
                                  </p>
                                  <p className="text-[11px] text-[#7D7693]">
                                    {tx.date} · {tx.subtitle}
                                  </p>
                                </div>
                                <span className="text-[12px] font-extrabold text-[#14111F] tabular-nums shrink-0">
                                  −{formatDH(tx.amount)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Two Clear Decision CTAs (Personal Challenge CTA hierarchy) */}
                <div className="pt-4 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      confirmSubscription(currentFlowSub.id);
                      dismissToast();
                      advanceOrFinishSubChallengeFlow(currentFlowSub.id);
                    }}
                    className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_-4px_rgba(128,0,235,0.4)] transition-all active:scale-[0.99]"
                  >
                    <Check size={17} strokeWidth={2.5} />
                    <span>Oui, c'est un abonnement</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      dismissSubscription(currentFlowSub.id);
                      dismissToast();
                      advanceOrFinishSubChallengeFlow(currentFlowSub.id);
                    }}
                    className="w-full h-12 rounded-full bg-white hover:bg-[#F2F8FF] text-[#2F80ED] border border-[#4FA9FF] shadow-[0_2px_8px_rgba(79,169,255,0.08)] text-[14px] font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
                  >
                    <span>Non, ce n'est pas un abonnement</span>
                  </button>
                </div>
              </div>
            ) : (
              /* 7. COMPLETION SCREEN */
              <div className="px-5 pt-2 pb-7 flex-1 flex flex-col justify-between overflow-y-auto">
                <div className="my-auto space-y-5">
                  <div className="card-simple p-6 text-center space-y-5 border border-[#BFE0FF]">
                    {/* Personal Challenge Sky-Blue Subscription Badge Illustration */}
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="w-20 h-20 rounded-[26px] bg-gradient-to-br from-[#4FA9FF] to-[#2F80ED] flex items-center justify-center shadow-[0_12px_28px_-6px_rgba(47,128,237,0.35)]">
                        <CalendarCheck
                          size={38}
                          className="text-white"
                          strokeWidth={2.1}
                        />
                      </div>
                      <span className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-[#DFF0FF] text-[#2F80ED] border-2 border-white flex items-center justify-center shadow-xs">
                        <Check size={16} strokeWidth={3} />
                      </span>
                    </div>

                    {/* Completed Progress 2/2 */}
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-extrabold text-[#2F80ED] tabular-nums">
                        Défi terminé · {totalChallengeCount}/{totalChallengeCount}
                      </span>
                      <div className="w-36 h-2 bg-[#DFF0FF] rounded-full overflow-hidden mx-auto">
                        <div className="h-full w-full bg-[#4FA9FF] rounded-full" />
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-1.5">
                      <h2 className="text-[22px] font-extrabold text-[#14111F] leading-tight">
                        Vous y voyez plus clair !
                      </h2>
                      <p className="text-[13.5px] text-[#6B6380] leading-relaxed">
                        Vos abonnements ont été examinés. Votre suivi est
                        désormais plus précis.
                      </p>
                    </div>

                    {/* Badge Reward Only (Centered, No Points) */}
                    <div className="rounded-[20px] bg-[#F2F8FF] border border-[#BFE0FF] py-3.5 px-5 text-center flex flex-col items-center justify-center gap-0.5">
                      <span className="text-[11px] font-semibold text-[#5C6F84] block">
                        Badge débloqué
                      </span>
                      <span className="text-[15px] font-extrabold text-[#2F80ED]">
                        Abonnements clairs
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubChallengeFlowOpen(false);
                    setExpandedFlowTxHistory(false);
                    setShowSubCompletionScreen(false);
                  }}
                  className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_-4px_rgba(128,0,235,0.4)] transition-all active:scale-[0.99]"
                >
                  <span>Retour à mes abonnements</span>
                </button>
              </div>
            )}
          </div>
        );
      })()}

      <BottomBankingNav />
    </div>
  );
};


