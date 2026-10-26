import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Send,
  ReceiptText,
  Smartphone,
  MoreHorizontal,
  ChevronRight,
  Check,
  ShieldCheck,
  TrendingUp,
  PieChart,
  Target,
  Users,
  Landmark,
  Eye,
  EyeOff,
  CreditCard,
  Lock,
  Sliders,
  Search,
  Bell,
  ArrowRight,
  Sparkles,
  X,
  BarChart3,
  Home,
} from 'lucide-react';
import { usePFM } from '../context/PFMContext';
import {
  INTERNET_BILL_TRANSACTION,
  LAMIA_AVATAR_URL,
  SIMPLE_ONE_TRANSFER_TRANSACTION,
  formatDH,
} from '../data/initialData';
import { ObjectiveCategory } from '../types/pfm';
import {
  BottomBankingNav,
  CategoryIcon,
  MobileHeader,
  SimpleBarsIcon,
} from './SharedUI';
import slideComprendreImg from '../assets/images/budget_purple_control_illustration_1791991796652.jpg';
import slideAgirImg from '../assets/images/regenerated_image_1791986216184.png';
import slideAvancerImg from '../assets/images/invest_purple_growth_illustration_1791991676392.jpg';

export const BankingHomeScreen: React.FC = () => {
  const {
    mainAccountBalance,
    transactions,
    isDiscoverySheetOpen,
    setIsDiscoverySheetOpen,
    hasCompletedOnboarding,
    hasSavingsGoal,
    savingsGoal,
    budgets,
    shoppingSummary,
    currentMonthExpenses,
    internetBillNotificationDismissed,
    setInternetBillNotificationDismissed,
    isInternetBillSplit,
    isSimpleOneScenario,
    simpleOneNotificationDismissed,
    setSimpleOneNotificationDismissed,
    activeHomeNotification,
    navigateTo,
    showToast,
  } = usePFM();

  const [hideBalance, setHideBalance] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Post-savings / later-stage reconciled balance: 43 109,00 DH
  const isPostSavingsScenario =
    !isDiscoverySheetOpen &&
    (isSimpleOneScenario || hasSavingsGoal || savingsGoal.isCreated);
  const effectiveBalance = isPostSavingsScenario ? 43109.0 : mainAccountBalance;

  const recentTxs = useMemo(() => {
    const list = transactions.filter((t) => t.monthKey === '2026-10');
    if (isPostSavingsScenario) {
      if (activeHomeNotification === 'SIMPLE_ONE') {
        const simpleOneTx =
          transactions.find((t) => t.id === SIMPLE_ONE_TRANSFER_TRANSACTION.id) ||
          SIMPLE_ONE_TRANSFER_TRANSACTION;
        const otherTxs = list.filter(
          (t) =>
            t.id !== SIMPLE_ONE_TRANSFER_TRANSACTION.id &&
            t.id !== INTERNET_BILL_TRANSACTION.id
        );
        return [simpleOneTx, ...otherTxs].slice(0, 5);
      }
      // Ensure the completed Internet bill transaction is strictly first
      const billTx =
        transactions.find((t) => t.id === INTERNET_BILL_TRANSACTION.id) ||
        INTERNET_BILL_TRANSACTION;
      const otherTxs = list.filter(
        (t) =>
          t.id !== INTERNET_BILL_TRANSACTION.id &&
          t.id !== SIMPLE_ONE_TRANSFER_TRANSACTION.id
      );
      if (billTx) {
        return [billTx, ...otherTxs].slice(0, 5);
      }
    }
    return list
      .filter(
        (t) =>
          t.id !== SIMPLE_ONE_TRANSFER_TRANSACTION.id &&
          t.id !== INTERNET_BILL_TRANSACTION.id
      )
      .slice(0, 5);
  }, [transactions, isPostSavingsScenario, activeHomeNotification]);

  // Format integer and decimal parts to match the reference typography
  const formattedBalance = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(effectiveBalance);
  const [integerPart, decimalPart] = formattedBalance.split(',');

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas">
      {/* Top Welcome Bar — Matching Reference Screen 1 */}
      <header className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-[0_4px_12px_rgba(20,17,31,0.08)] bg-[#EFEAFF] flex items-center justify-center shrink-0">
            {!avatarError ? (
              <img
                src={LAMIA_AVATAR_URL}
                alt="Portrait de Lamia"
                referrerPolicy="no-referrer"
                onError={() => setAvatarError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-[#5E1DF0]">L</span>
            )}
          </div>
          <div>
            <p className="text-[13px] font-medium text-[#7D7693] leading-tight">
              Bienvenue
            </p>
            <h1 className="text-[20px] font-extrabold text-[#14111F] leading-tight mt-0.5">
              Lamia
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigateTo('I1_WIDGET_CATALOG')}
            aria-label="Rechercher"
            className="w-11 h-11 rounded-full bg-white shadow-[0_4px_14px_rgba(20,17,31,0.06)] flex items-center justify-center text-[#14111F] hover:bg-[#FAF8FF] transition-colors"
          >
            <Search size={19} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={() =>
              showToast(
                'Nouveau bilan mensuel disponible',
                'Découvrez l’évolution de vos dépenses d’octobre dans Mes finances.'
              )
            }
            aria-label="Notifications"
            className="w-11 h-11 rounded-full bg-white shadow-[0_4px_14px_rgba(20,17,31,0.06)] flex items-center justify-center text-[#14111F] relative hover:bg-[#FAF8FF] transition-colors"
          >
            <Bell size={19} strokeWidth={2} />
            <span className="w-2.5 h-2.5 rounded-full bg-[#5E1DF0] border-2 border-white absolute top-2 right-2.5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-5 space-y-5 flex-1 pb-4">
        {/* Centered Account Balance Section — Directly on soft lavender canvas like Reference Screen 1 */}
        <section className="pt-4 pb-1 text-center">
          <div className="inline-flex items-center gap-2.5">
            <span className="text-[15px] font-medium text-[#14111F]">
              Compte principal
            </span>
            <button
              type="button"
              onClick={() =>
                hasCompletedOnboarding
                  ? navigateTo('C1_HUB', { hubTab: 'MON_ESPACE' })
                  : navigateTo('D1_EXPENSES')
              }
              className="px-3 py-1 rounded-full bg-[#EAE3FF] text-[#6B5E94] text-[12px] font-semibold inline-flex items-center gap-0.5 hover:bg-[#E0D6FF] transition-colors"
            >
              <span>Détails</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-center gap-2.5">
            {hideBalance ? (
              <p className="text-[36px] font-extrabold text-[#14111F] tracking-tight tabular-nums leading-none">
                •••••• DH
              </p>
            ) : (
              <p className="font-extrabold text-[#14111F] tracking-tight tabular-nums leading-none">
                <span className="text-[40px]">{integerPart}</span>
                <span className="text-[28px]">,{decimalPart} DH</span>
              </p>
            )}
            <button
              type="button"
              onClick={() => setHideBalance((prev) => !prev)}
              aria-label="Afficher ou masquer le solde"
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#8E87A6] hover:text-[#14111F] transition-colors"
            >
              {hideBalance ? <EyeOff size={21} /> : <Eye size={21} />}
            </button>
          </div>

          {/* 3 Pagination Dots */}
          <div className="flex items-center justify-center gap-2 mt-3.5">
            <span className="w-2 h-2 rounded-full bg-[#5E1DF0]" />
            <span className="w-2 h-2 rounded-full bg-[#DED8F0]" />
            <span className="w-2 h-2 rounded-full bg-[#DED8F0]" />
          </div>
        </section>

        {/* Quick Actions Row — 3 Square White Cards + 1 Compact More Card */}
        <section className="flex items-stretch gap-2.5">
          <button
            type="button"
            onClick={() => navigateTo('H2_ADD_MONEY')}
            className="flex-1 bg-white rounded-[24px] py-3.5 px-2 shadow-[0_8px_24px_rgba(94,29,240,0.05)] border border-[#F2EFFA] flex flex-col items-center justify-center gap-2 hover:bg-[#FDFCFF] active:scale-[0.98] transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center">
              <Send size={19} strokeWidth={2} />
            </div>
            <span className="text-[13px] font-bold text-[#14111F] whitespace-nowrap">
              Virement
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              showToast(
                'Paiement de factures à jour',
                'Vos factures Lydec et Orange Maroc d’octobre ont déjà été réglées.'
              )
            }
            className="flex-1 bg-white rounded-[24px] py-3.5 px-2 shadow-[0_8px_24px_rgba(94,29,240,0.05)] border border-[#F2EFFA] flex flex-col items-center justify-center gap-2 hover:bg-[#FDFCFF] active:scale-[0.98] transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center">
              <ReceiptText size={20} strokeWidth={2.1} />
            </div>
            <span className="text-[13px] font-bold text-[#14111F] whitespace-nowrap">
              Factures
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              showToast(
                'Recharge mobile rapide',
                'Forfait Orange Maroc actif · Prochain renouvellement le 05 nov.'
              )
            }
            className="flex-1 bg-white rounded-[24px] py-3.5 px-2 shadow-[0_8px_24px_rgba(94,29,240,0.05)] border border-[#F2EFFA] flex flex-col items-center justify-center gap-2 hover:bg-[#FDFCFF] active:scale-[0.98] transition-all"
          >
            <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center">
              <Smartphone size={19} strokeWidth={2} />
            </div>
            <span className="text-[13px] font-bold text-[#14111F] whitespace-nowrap">
              Recharge
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('MENU_VIEW')}
            aria-label="Plus d'actions"
            className="w-14 bg-white rounded-[24px] shadow-[0_8px_24px_rgba(94,29,240,0.05)] border border-[#F2EFFA] flex items-center justify-center text-[#5E1DF0] hover:bg-[#FDFCFF] active:scale-[0.98] transition-all shrink-0"
          >
            <MoreHorizontal size={22} strokeWidth={2.4} />
          </button>
        </section>

        {/* Contextual Notification: Simple One (Later-stage scenario, mutually exclusive with Internet bill notification) */}
        {isPostSavingsScenario &&
        activeHomeNotification === 'SIMPLE_ONE' &&
        !simpleOneNotificationDismissed ? (
          <section className="rounded-[24px] bg-[#290764] p-5 space-y-3.5">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#C8B7F2]">
                SIMPLE ONE
              </span>
              <button
                type="button"
                onClick={() => setSimpleOneNotificationDismissed(true)}
                aria-label="Fermer"
                className="text-[#C8B7F2] hover:text-white transition-colors shrink-0"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h3 className="text-[16px] font-semibold text-white leading-snug">
                300 DH envoyés à Yasmine
              </h3>
              <p className="text-[13px] text-[#E4DBFA] leading-relaxed">
                Aidez-la à gérer son argent de poche avec quelques repères simples.
              </p>
            </div>

            {/* Vertically Stacked CTAs */}
            <div className="pt-1 flex flex-col items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  navigateTo('C1_HUB', {
                    hubTab: 'MON_ESPACE',
                    monEspaceSubTab: 'FOYER',
                    fromSimpleOneNotification: true,
                  })
                }
                className="w-full h-11 rounded-full bg-white text-[#290764] text-[13px] font-semibold flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
              >
                <span>Configurer le suivi</span>
                <ArrowRight size={15} strokeWidth={2.2} />
              </button>
              <button
                type="button"
                onClick={() => setSimpleOneNotificationDismissed(true)}
                className="text-[12px] font-medium text-[#C8B7F2] hover:text-white transition-colors text-center"
              >
                Plus tard
              </button>
            </div>
          </section>
        ) : isPostSavingsScenario &&
          activeHomeNotification === 'INTERNET_BILL' &&
          !internetBillNotificationDismissed &&
          !isInternetBillSplit ? (
          <section className="bg-gradient-to-br from-[#FAF8FF] to-[#F1EAFF] rounded-[24px] p-4.5 border border-[#E4D8FC] shadow-[0_4px_20px_rgba(94,29,240,0.08)] space-y-3 relative">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#5E1DF0] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Users size={18} strokeWidth={2.4} />
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-[#14111F] leading-tight">
                    Une dépense à partager ?
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInternetBillNotificationDismissed(true)}
                aria-label="Plus tard"
                className="w-7 h-7 rounded-full bg-white/80 text-[#8E87A6] hover:text-[#14111F] flex items-center justify-center transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-[13px] text-[#4F4665] leading-relaxed">
              Votre facture Internet de 450 DH a été payée. Souhaitez-vous répartir cette dépense ?
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  navigateTo('J2_HOUSEHOLD_SPLIT', { transactionId: 'tx-internet-bill' })
                }
                className="flex-1 h-10 rounded-full btn-simple-primary text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Répartir</span>
                <ArrowRight size={14} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                onClick={() => setInternetBillNotificationDismissed(true)}
                className="h-10 px-4 rounded-full bg-white/90 text-[#7D7693] hover:text-[#14111F] text-xs font-semibold border border-[#EFEBF8] transition-colors"
              >
                Plus tard
              </button>
            </div>
          </section>
        ) : null}

        {/* Active Mes finances Card / Initial Discovery Card */}
        {hasCompletedOnboarding ? (
          <section className="card-simple p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                  <SimpleBarsIcon size={20} />
                </div>
                <div>
                  <h2 className="text-[18px] font-extrabold text-[#14111F] leading-tight">
                    Mes finances
                  </h2>
                  <span className="text-[11px] font-semibold text-[#12895B] flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#12895B]" />
                    Espace actif & à jour
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-[11px] font-bold">
                Actif
              </span>
            </div>

            <p className="text-[13px] text-[#7D7693] leading-relaxed">
              Gardez un œil sur vos dépenses, vos budgets et vos projets.
            </p>

            {/* Compact Previews of Budget and Savings Goal */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Compact Budget Preview */}
              <button
                type="button"
                onClick={() =>
                  navigateTo('C1_HUB', {
                    hubTab: 'MON_ESPACE',
                    monEspaceSubTab: 'BUDGETS',
                  })
                }
                className="p-3 rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] space-y-1.5 text-left hover:border-[#5E1DF0]/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#7D7693]">
                    Budget {budgets['Shopping'] ? 'Shopping' : 'Mensuel'}
                  </span>
                  <PieChart size={13} className="text-[#5E1DF0]" />
                </div>
                <p className="text-[14px] font-extrabold text-[#14111F] tabular-nums">
                  {budgets['Shopping']
                    ? formatDH(shoppingSummary.amount)
                    : formatDH(currentMonthExpenses)}
                </p>
                <div className="w-full h-1.5 bg-[#EFEAFF] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5E1DF0] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (shoppingSummary.amount /
                            (budgets['Shopping']?.limit || 1600)) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-[#7D7693] block truncate">
                  {budgets['Shopping']
                    ? `Reste ${formatDH(
                        Math.max(0, budgets['Shopping'].limit - shoppingSummary.amount)
                      )}`
                    : 'Suivi régulier'}
                </span>
              </button>

              {/* Compact Savings Project Preview */}
              <button
                type="button"
                onClick={() =>
                  navigateTo('C1_HUB', {
                    hubTab: 'MON_ESPACE',
                    monEspaceSubTab: 'PROJETS',
                  })
                }
                className="p-3 rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] space-y-1.5 text-left hover:border-[#5E1DF0]/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#7D7693] truncate">
                    {savingsGoal.isCreated ? savingsGoal.title : "Projet d'épargne"}
                  </span>
                  <Target size={13} className="text-[#5E1DF0]" />
                </div>
                <p className="text-[14px] font-extrabold text-[#5E1DF0] tabular-nums">
                  {formatDH(savingsGoal.savedAmount)}
                </p>
                <div className="w-full h-1.5 bg-[#EFEAFF] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5E1DF0] rounded-full"
                    style={{
                      width: `${
                        savingsGoal.targetAmount > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (savingsGoal.savedAmount /
                                  savingsGoal.targetAmount) *
                                  100
                              )
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-[#7D7693] block truncate">
                  {savingsGoal.isCreated
                    ? `Sur ${formatDH(savingsGoal.targetAmount)}`
                    : 'Objectif à définir'}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('C1_HUB', { hubTab: 'MON_ESPACE' })}
              className="w-full h-[50px] btn-simple-primary flex items-center justify-center gap-2 text-[14px] font-semibold shadow-xs"
            >
              <span>Accéder à Mes finances</span>
              <ArrowRight size={16} strokeWidth={2.4} />
            </button>
          </section>
        ) : (
          /* Redesigned Premium PFM Discovery Banner — Matching Figma Reference */
          <section
            aria-label="Découvrir mes finances"
            className="relative rounded-[28px] overflow-hidden bg-[#EEE5FB] p-5 border border-[#D2B4FE] shadow-[0_10px_28px_rgba(91,32,170,0.14)] min-h-[275px] flex flex-col justify-between"
          >
            {/* Supplied Figma PNG Background Asset (mapped to exact card bounds without distortion) */}
            <img
              src="/assets/aistudio/Section_-_D_couvrir_mes_finances__Simple___Mon_Espace_Financier__PFM___62b4badd.png"
              alt=""
              aria-hidden="true"
              className="absolute left-[-8.31%] top-[-6.96%] w-[116.91%] h-[121.61%] max-w-none pointer-events-none select-none"
            />

            {/* Left-aligned Text Hierarchy */}
            <div className="relative z-10 flex-1 flex flex-col">
              {/* ROW 1 — Small purple sparkle icon + label */}
              <div className="flex items-center gap-1.5 text-[#8000EB] text-[11.5px] font-semibold tracking-wide">
                <Sparkles size={13} className="text-[#8000EB] fill-[#8000EB]/15 shrink-0" strokeWidth={2.2} />
                <span>Votre compagnon financier</span>
              </div>

              {/* ROW 2 — Headline positioned in left column clear of the coach */}
              <h2 className="mt-2.5 max-w-[190px] text-[17px] font-bold text-[#180A33] leading-[1.25] tracking-[-0.015em]">
                Votre solde ne raconte pas tout.
              </h2>

              {/* ROW 3 — Description vertically centered between title and CTA */}
              <p className="my-auto py-3 max-w-[182px] text-[13px] font-normal text-[#62586F] leading-[1.44]">
                Et si on découvrait ensemble tout ce que vos finances peuvent vous permettre de réaliser ?
              </p>
            </div>

            {/* ROW 4 — Full-width primary CTA at bottom */}
            <div className="relative z-10">
              <button
                type="button"
                onClick={() => navigateTo('B0_INTRO')}
                className="w-full h-[48px] rounded-full bg-[#8000EB] hover:bg-[#6E00CA] active:scale-[0.99] text-white transition-all flex items-center justify-center gap-2 text-[14px] font-semibold shadow-[0_4px_16px_rgba(128,0,235,0.25)] hover:shadow-[0_6px_20px_rgba(128,0,235,0.32)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8000EB] focus:ring-offset-2"
              >
                <span>Découvrir mes finances</span>
                <ArrowRight size={16} strokeWidth={2.4} />
              </button>
            </div>
          </section>
        )}

        {/* Mes opérations Section — Matching Reference Screen 1 */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[19px] font-extrabold text-[#14111F]">
              Mes opérations
            </h2>
            <button
              type="button"
              onClick={() => navigateTo('D1_EXPENSES')}
              className="text-[13px] font-semibold text-[#5E1DF0] inline-flex items-center gap-1 hover:underline whitespace-nowrap"
            >
              <span>Voir plus</span>
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="card-simple px-4 py-2 divide-y divide-[#F3EFFA]">
            {recentTxs.map((tx) => (
              <button
                key={tx.id}
                type="button"
                onClick={() => {
                  navigateTo('D3_TRANSACTION_DETAIL', { transactionId: tx.id });
                }}
                className="w-full py-3.5 flex items-center justify-between gap-3 text-left hover:bg-[#FAF8FF] rounded-2xl px-1 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <CategoryIcon category={tx.category} size="md" />
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold text-[#14111F] truncate">
                      {tx.merchant}
                    </p>
                    <p className="text-[12px] text-[#8E87A6] truncate mt-0.5">
                      {tx.id === 'tx-simple-one-yasmine'
                        ? `${tx.subtitle} · ${tx.date} · ${tx.status}`
                        : `${tx.date} · ${tx.category}${
                            tx.status ? ` · ${tx.status}` : ''
                          }`}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-[14px] font-extrabold tabular-nums ${
                      tx.type === 'INCOME'
                        ? 'text-[#12895B]'
                        : tx.type === 'INTERNAL_TRANSFER'
                        ? 'text-[#5E1DF0]'
                        : 'text-[#14111F]'
                    }`}
                  >
                    {tx.type === 'INCOME' ? '+ ' : '- '}
                    {formatDH(tx.amount, true)}
                  </span>
                  {tx.status === 'Paiement effectué' || tx.status === 'Effectué' ? (
                    <span className="block text-[10px] font-semibold text-[#12895B]">
                      {tx.status}
                    </span>
                  ) : tx.uncertainCategory ? (
                    <span className="block text-[10px] font-semibold text-[#5E1DF0]">
                      À vérifier
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <BottomBankingNav />
    </div>
  );
};

// Menu & Cards views
export const MenuAndCardsScreen: React.FC<{ mode: 'MENU' | 'CARDS' }> = ({ mode }) => {
  const { navigateTo, mainAccountBalance, showToast } = usePFM();

  if (mode === 'CARDS') {
    return (
      <div className="min-h-full flex flex-col bg-simple-canvas">
        <MobileHeader title="Mes cartes" onBack={() => navigateTo('A1_HOME')} />
        <div className="p-5 space-y-4 flex-1">
          <div className="rounded-[28px] bg-gradient-to-br from-[#290764] via-[#4612A8] to-[#5E1DF0] p-6 text-white shadow-[0_14px_30px_rgba(94,29,240,0.22)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#E9D5FF]">
                Simple Visa Platinum
              </span>
              <CreditCard size={22} />
            </div>
            <p className="text-lg font-mono tracking-widest mt-6">
              •••• •••• •••• 4821
            </p>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/15 text-xs">
              <div>
                <span className="text-white/70 block text-[10px]">Titulaire</span>
                <span className="font-bold">LAMIA BENNANI</span>
              </div>
              <div className="text-right">
                <span className="text-white/70 block text-[10px]">
                  Solde disponible
                </span>
                <span className="font-bold tabular-nums">
                  {formatDH(mainAccountBalance, true)}
                </span>
              </div>
            </div>
          </div>

          <div className="card-simple p-4 space-y-1.5">
            <button
              type="button"
              onClick={() => navigateTo('D1_EXPENSES')}
              className="w-full py-3 px-3 rounded-2xl hover:bg-[#FAF8FF] flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center">
                  <PieChart size={19} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#14111F]">
                    Analyser les dépenses carte
                  </p>
                  <p className="text-[12px] text-[#7D7693]">
                    Voir la répartition par catégorie
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#8E87A6]" />
            </button>

            <button
              type="button"
              onClick={() =>
                showToast(
                  'Plafonds personnalisables',
                  'Plafond mensuel actuel : 20 000 DH'
                )
              }
              className="w-full py-3 px-3 rounded-2xl hover:bg-[#FAF8FF] flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center">
                  <Sliders size={19} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#14111F]">
                    Gérer les plafonds et paiements
                  </p>
                  <p className="text-[12px] text-[#7D7693]">
                    Sans contact, e-commerce et étranger
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#8E87A6]" />
            </button>

            <button
              type="button"
              onClick={() =>
                showToast(
                  'Verrouillage temporaire disponible',
                  'Votre carte reste active.'
                )
              }
              className="w-full py-3 px-3 rounded-2xl hover:bg-[#FAF8FF] flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center">
                  <Lock size={19} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#14111F]">
                    Verrouiller temporairement
                  </p>
                  <p className="text-[12px] text-[#7D7693]">
                    Sécurité immédiate en un clic
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#8E87A6]" />
            </button>
          </div>
        </div>
        <BottomBankingNav />
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas">
      <MobileHeader title="Menu" onBack={() => navigateTo('A1_HOME')} />
      <div className="p-5 space-y-4 flex-1">
        {/* Highlighted Menu Entry: Mes finances */}
        <div className="card-simple p-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#F2EDFF] flex items-center justify-center shrink-0">
              <SimpleBarsIcon size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#5E1DF0]">
                Accompagnement intelligent
              </span>
              <h3 className="text-[17px] font-extrabold text-[#14111F]">
                Mes finances
              </h3>
              <p className="text-[12px] text-[#7D7693]">
                Mon espace, Mes défis, Learn & Earn et budgets
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigateTo('C1_HUB', { hubTab: 'MON_ESPACE' })}
            className="mt-4 w-full h-[48px] btn-simple-primary text-[14px] font-semibold flex items-center justify-center gap-2"
          >
            <span>Ouvrir Mes finances</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="card-simple p-3 divide-y divide-[#F3EFFA]">
          <button
            type="button"
            onClick={() => navigateTo('B0_INTRO')}
            className="w-full py-3.5 px-2 flex items-center justify-between text-left hover:bg-[#FAF8FF] rounded-2xl"
          >
            <div>
              <p className="text-[14px] font-bold text-[#14111F]">
                Parcours d’accueil Mes finances
              </p>
              <p className="text-[12px] text-[#7D7693]">
                Revoir l’introduction personnalisée
              </p>
            </div>
            <ChevronRight size={16} className="text-[#8E87A6]" />
          </button>

          <button
            type="button"
            onClick={() => navigateTo('H1_SAVINGS_GOAL')}
            className="w-full py-3.5 px-2 flex items-center justify-between text-left hover:bg-[#FAF8FF] rounded-2xl"
          >
            <div>
              <p className="text-[14px] font-bold text-[#14111F]">
                Mon objectif (Projet Voyage)
              </p>
              <p className="text-[12px] text-[#7D7693]">
                2 650 DH épargnés sur 8 000 DH
              </p>
            </div>
            <ChevronRight size={16} className="text-[#8E87A6]" />
          </button>

          <button
            type="button"
            onClick={() => navigateTo('D4_COACH')}
            className="w-full py-3.5 px-2 flex items-center justify-between text-left hover:bg-[#FAF8FF] rounded-2xl"
          >
            <div>
              <p className="text-[14px] font-bold text-[#14111F]">
                Coach financier
              </p>
              <p className="text-[12px] text-[#7D7693]">
                Poser une question sur vos dépenses
              </p>
            </div>
            <ChevronRight size={16} className="text-[#8E87A6]" />
          </button>

          <button
            type="button"
            onClick={() => navigateTo('I3_INVEST_DISCOVERY')}
            className="w-full py-3.5 px-2 flex items-center justify-between text-left hover:bg-[#FAF8FF] rounded-2xl"
          >
            <div>
              <p className="text-[14px] font-bold text-[#14111F]">
                Découvrir l’investissement
              </p>
              <p className="text-[12px] text-[#7D7693]">
                Comprendre les bases à votre rythme
              </p>
            </div>
            <ChevronRight size={16} className="text-[#8E87A6]" />
          </button>
        </div>
      </div>
      <BottomBankingNav />
    </div>
  );
};

// PHASE B — SIMPLIFIED "MES FINANCES" DISCOVERY & ONBOARDING
export const OnboardingFlowScreens: React.FC = () => {
  const {
    isR1,
    currentScreen,
    navigateTo,
    selectedIntention,
    setSelectedIntention,
    setHasCompletedOnboarding,
    shoppingSummary,
    currentMonthExpenses,
    previousMonthExpenses,
    expensesVariationPct,
  } = usePFM();

  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>(() => {
    switch (selectedIntention) {
      case 'Maîtriser ma situation financière':
        return 'budget';
      case 'Apprendre à épargner':
        return 'epargner';
      case 'Gérer les dépenses de mon foyer':
        return 'foyer';
      case 'Investir mon argent':
        return 'investir';
      case 'Comprendre mon comportement financier':
      default:
        return 'comprendre';
    }
  });

  // Intro walkthrough 3-slide carousel state & swipe handling
  const [activeIntroSlide, setActiveIntroSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [mouseStartX, setMouseStartX] = useState<number | null>(null);

  const introSlides = useMemo(
    () => [
      {
        id: 'comprendre',
        pillar: 'Comprendre',
        title: 'Faisons le point sur vos finances',
        description:
          'Découvrez où va votre argent, comprenez vos habitudes et identifiez vos priorités.',
        image: '/assets/aistudio/comprendre_5c0e6660.png',
      },
      {
        id: 'agir',
        pillar: 'Agir',
        title: 'Donnons vie à vos objectifs',
        description:
          isR1 ? 'Budgets et projets d’épargne : avancez selon vos priorités.' : 'Budgets, épargne, projets, famille, communauté ou investissement : avancez selon vos envies.',
        image: '/assets/aistudio/agir__1__0baa1610.png',
      },
      {
        id: 'avancer',
        pillar: 'Avancer',
        title: 'Chaque progrès compte !',
        description:
          isR1 ? 'Comprenez vos dépenses et suivez vos progrès au quotidien.' : 'Profitez de conseils adaptés, relevez des défis et apprenez à mieux gérer votre argent.',
        image: '/assets/aistudio/progresser_25558ffa.png',
      },
    ],
    [isR1]
  );

  useEffect(() => {
    if (currentScreen !== 'B0_INTRO') return;

    const timer = window.setInterval(() => {
      setActiveIntroSlide((prev) => (prev + 1) % introSlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [currentScreen, activeIntroSlide, introSlides]);

  const handleSwipeDelta = (deltaX: number) => {
    const threshold = 40;
    if (deltaX <= -threshold) {
      // Swiped left -> next slide (1 -> 2 -> 3 -> 1)
      setActiveIntroSlide((prev) => (prev + 1) % introSlides.length);
    } else if (deltaX >= threshold) {
      // Swiped right -> previous slide
      setActiveIntroSlide(
        (prev) => (prev - 1 + introSlides.length) % introSlides.length
      );
    }
  };

  const selectObjective = (id: string, category: ObjectiveCategory) => {
    setSelectedObjectiveId(id);
    setSelectedIntention(category);
  };

  const handleEnterMonEspace = () => {
    setHasCompletedOnboarding(true);
    navigateTo('C1_HUB', {
      hubTab: 'MON_ESPACE',
      monEspaceSubTab: 'DEPENSES',
    });
  };

  // SCREEN B0 — Full-Screen "Mes finances" Introduction Page
  if (currentScreen === 'B0_INTRO') {
    return (
      <div className="h-full min-h-full flex-1 flex flex-col overflow-hidden bg-simple-canvas">
        {/* A. Header */}
        <MobileHeader
          title="Mes finances"
          onBack={() => navigateTo('A1_HOME')}
        />

        <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
          {/* Scrollable Main Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 pt-4 pb-6 flex flex-col">
            <div className="my-auto flex flex-col gap-8">
              {/* B. Introduction */}
              <div className="space-y-2 text-left">
                <h1 className="text-[24px] font-extrabold leading-[1.18] tracking-tight text-balance">
                  <span className="text-[#290764]">
                    Un accompagnement adapté{' '}
                  </span>
                  <span className="text-[#8000EB]">
                    à vos objectifs.
                  </span>
                </h1>

                <p className="text-[13px] font-medium text-[#6B6380] leading-relaxed">
                  Des outils et des conseils pour mieux comprendre, organiser et faire évoluer vos finances.
                </p>
              </div>

              {/* C. 3-Pillar Interactive Walkthrough Carousel (Comprendre · Agir · Avancer) */}
              <div
                className="w-full overflow-hidden select-none touch-pan-y flex flex-col gap-4"
                onTouchStart={(e) => {
                  setTouchStartX(e.touches[0]?.clientX ?? null);
                }}
                onTouchEnd={(e) => {
                  if (touchStartX === null) return;
                  const endX = e.changedTouches[0]?.clientX ?? touchStartX;
                  handleSwipeDelta(endX - touchStartX);
                  setTouchStartX(null);
                }}
                onMouseDown={(e) => {
                  setMouseStartX(e.clientX);
                }}
                onMouseUp={(e) => {
                  if (mouseStartX === null) return;
                  handleSwipeDelta(e.clientX - mouseStartX);
                  setMouseStartX(null);
                }}
                onMouseLeave={() => {
                  setMouseStartX(null);
                }}
              >
                {/* Carousel Track */}
                <div className="overflow-hidden w-full">
                  <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{
                      transform: `translateX(-${activeIntroSlide * 100}%)`,
                    }}
                  >
                    {introSlides.map((slide) => (
                      <div
                        key={slide.id}
                        className="w-full shrink-0 flex flex-col items-center gap-6"
                      >
                        {/* Centered prominent glassmorphism visual */}
                        <div className="relative w-full h-[248px] rounded-[24px] overflow-hidden flex items-center justify-center">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            referrerPolicy="no-referrer"
                            draggable={false}
                            className="w-full h-full object-cover object-center pointer-events-none select-none"
                          />
                        </div>

                        {/* Active slide title & description */}
                        <div className="w-full h-[76px] px-2 flex flex-col items-center justify-start text-center gap-2">
                          <h3 className="text-[17px] font-extrabold text-[#290764] leading-snug">
                            {slide.title}
                          </h3>
                          <p className="text-[13px] font-medium text-[#6B6380] leading-relaxed max-w-[300px]">
                            {slide.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Three subtle pagination indicators */}
                <div
                  className="flex items-center justify-center gap-2 h-4"
                  role="tablist"
                  aria-label="Diapositives de présentation"
                >
                  {introSlides.map((slide, index) => {
                    const isActive = index === activeIntroSlide;
                    return (
                      <button
                        key={slide.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-label={`Aller à la diapositive ${index + 1} : ${slide.title}`}
                        onClick={() => setActiveIntroSlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          isActive
                            ? 'w-5 bg-[#8000EB]'
                            : 'w-1.5 bg-[#D5CCF0] hover:bg-[#C1B4E8]'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Dedicated Bottom Action Container — Permanently Anchored */}
          <div className="shrink-0 px-4 pt-4 pb-[max(24px,env(safe-area-inset-bottom))] bg-simple-canvas flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo('B1_INTENTION')}
              className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-[0_8px_20px_-4px_rgba(128,0,235,0.32)] transition-all active:scale-[0.99]"
            >
              <span>Commencer</span>
              <ArrowRight size={16} strokeWidth={2.3} />
            </button>

            <button
              type="button"
              onClick={() => navigateTo('A1_HOME')}
              className="h-8 px-4 text-[13px] font-semibold text-[#7D7693] hover:text-[#290764] transition-colors flex items-center justify-center"
            >
              Plus tard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN B1 — Single Streamlined Personalization Step -> Directly enters Mon espace
  if (
    currentScreen === 'B1_INTENTION' ||
    currentScreen === 'B2_PERSONALIZATION' ||
    currentScreen === 'B3_TRANSPARENCY' ||
    currentScreen === 'B4_LOADING'
  ) {
    const objectives: {
      id: string;
      title: string;
      desc: string;
      category: ObjectiveCategory;
      icon: React.ReactNode;
      iconClass: string;
      activeCardClass: string;
      activeCheckClass: string;
    }[] = [
      {
        id: 'comprendre',
        title: 'Comprendre mes dépenses',
        desc: 'Identifier mes habitudes financières.',
        category: 'Comprendre mon comportement financier',
        icon: <BarChart3 size={20} strokeWidth={2} />,
        iconClass: 'bg-[#8000EB]/[0.08] text-[#8000EB]',
        activeCardClass:
          'bg-white border-[#8000EB] shadow-[0_6px_18px_-4px_rgba(128,0,235,0.12)]',
        activeCheckClass: 'border-[#8000EB] bg-[#8000EB] text-white',
      },
      {
        id: 'budget',
        title: 'Maîtriser mon budget',
        desc: 'Garder le contrôle au quotidien.',
        category: 'Maîtriser ma situation financière',
        icon: <Sliders size={20} strokeWidth={2} />,
        iconClass: 'bg-[#3478D4]/[0.09] text-[#3478D4]',
        activeCardClass:
          'bg-white border-[#3478D4] shadow-[0_6px_18px_-4px_rgba(52,120,212,0.12)]',
        activeCheckClass: 'border-[#3478D4] bg-[#3478D4] text-white',
      },
      {
        id: 'epargner',
        title: 'Épargner pour mes projets',
        desc: 'Mettre de côté à mon rythme.',
        category: 'Apprendre à épargner',
        icon: <Target size={20} strokeWidth={2} />,
        iconClass: 'bg-[#0D967D]/[0.09] text-[#0D967D]',
        activeCardClass:
          'bg-white border-[#0D967D] shadow-[0_6px_18px_-4px_rgba(13,150,125,0.12)]',
        activeCheckClass: 'border-[#0D967D] bg-[#0D967D] text-white',
      },
      {
        id: 'foyer',
        title: 'Gérer les dépenses de mon foyer',
        desc: 'Suivre les dépenses partagées.',
        category: 'Gérer les dépenses de mon foyer',
        icon: <Home size={20} strokeWidth={2} />,
        iconClass: 'bg-[#D17A2D]/[0.09] text-[#D17A2D]',
        activeCardClass:
          'bg-white border-[#D17A2D] shadow-[0_6px_18px_-4px_rgba(209,122,45,0.12)]',
        activeCheckClass: 'border-[#D17A2D] bg-[#D17A2D] text-white',
      },
      {
        id: 'communaute',
        title: 'Réaliser un projet en communauté',
        desc: 'Avancer ensemble vers un objectif commun.',
        category: 'Gérer les dépenses de mon foyer',
        icon: <Users size={20} strokeWidth={2} />,
        iconClass: 'bg-[#C45D86]/[0.09] text-[#C45D86]',
        activeCardClass:
          'bg-white border-[#C45D86] shadow-[0_6px_18px_-4px_rgba(196,93,134,0.12)]',
        activeCheckClass: 'border-[#C45D86] bg-[#C45D86] text-white',
      },
      {
        id: 'investir',
        title: 'Investir mon argent',
        desc: "Explorer les possibilités d'investissement.",
        category: 'Investir mon argent',
        icon: <TrendingUp size={20} strokeWidth={2} />,
        iconClass: 'bg-[#5865B8]/[0.09] text-[#5865B8]',
        activeCardClass:
          'bg-white border-[#5865B8] shadow-[0_6px_18px_-4px_rgba(88,101,184,0.12)]',
        activeCheckClass: 'border-[#5865B8] bg-[#5865B8] text-white',
      },
    ].filter((item) => !isR1 || ['comprendre', 'budget', 'epargner'].includes(item.id));

    return (
      <div className="h-full min-h-full flex-1 flex flex-col overflow-hidden bg-simple-canvas">
        <MobileHeader
          title="Mes finances"
          onBack={() => navigateTo('B0_INTRO')}
        />

        <div className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
          {/* Scrollable Objectives Content */}
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 pt-3 pb-6">
            <div className="space-y-1.5">
              <h2 className="text-[22px] font-extrabold text-[#14111F] leading-snug tracking-tight">
                Qu'aimeriez-vous améliorer en priorité ?
              </h2>
              <p className="text-[13.5px] font-medium text-[#6B6380] leading-relaxed">
                Choisissez ce qui compte le plus pour vous.
              </p>
            </div>

            <div className="mt-5 space-y-3" role="radiogroup" aria-label="Objectifs financiers">
              {objectives.map((item) => {
                const isSelected = selectedObjectiveId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => selectObjective(item.id, item.category)}
                    className={`w-full p-4 rounded-[20px] text-left transition-all flex items-center gap-3.5 border-[1.5px] ${
                      isSelected
                        ? item.activeCardClass
                        : 'bg-white border-[#ECE8F4] shadow-[0_2px_10px_rgba(20,17,31,0.03)] hover:border-[#DCD5EC]'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 ${item.iconClass}`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-[#14111F] leading-snug">
                        {item.title}
                      </p>
                      <p className="text-[12.5px] text-[#6B6380] mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? item.activeCheckClass
                          : 'border-[#D5CEE8] bg-transparent'
                      }`}
                    >
                      {isSelected && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dedicated Bottom Action Container — Permanently Anchored */}
          <div className="shrink-0 px-4 pt-3 pb-[max(24px,env(safe-area-inset-bottom))] bg-simple-canvas">
            <button
              type="button"
              onClick={handleEnterMonEspace}
              className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-[0_8px_20px_-4px_rgba(128,0,235,0.32)] transition-all active:scale-[0.99]"
            >
              <span>Continuer</span>
              <ArrowRight size={16} strokeWidth={2.3} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN B5 — First financial value (preserved for Journey 1 quick launcher)
  return (
    <div className="min-h-full flex flex-col bg-simple-canvas">
      <MobileHeader
        title="Votre premier bilan"
        onBack={() => navigateTo('A1_HOME')}
      />

      <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-xs font-semibold">
              Octobre 2026 · Compte principal
            </span>
            <h2 className="text-[22px] font-extrabold text-[#14111F] mt-2.5 leading-snug">
              Découvrez ce qui a changé dans vos dépenses
            </h2>
          </div>

          {/* Main Insight White Card matching Reference Screen 4 aesthetic */}
          <div className="card-simple p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F2EDFF] flex items-center justify-center shrink-0">
                <SimpleBarsIcon size={20} />
              </div>
              <div>
                <p className="text-[16px] font-bold text-[#14111F]">
                  Éclairage Shopping
                </p>
                <p className="text-[12px] text-[#7D7693]">
                  Comparaison avec le mois précédent
                </p>
              </div>
            </div>

            <div className="p-4 rounded-[22px] bg-[#F6F3FF]">
              <p className="text-[16px] font-extrabold text-[#14111F] leading-snug">
                « Vos dépenses Shopping ont augmenté de {shoppingSummary.variationPct} % par rapport au mois précédent. »
              </p>
              <div className="grid grid-cols-2 gap-3 mt-3.5 pt-3 border-t border-[#E6DEFA]">
                <div>
                  <span className="text-[12px] text-[#7D7693] block">
                    Ce mois-ci (Oct.)
                  </span>
                  <span className="text-[20px] font-extrabold text-[#5E1DF0] tabular-nums">
                    {formatDH(shoppingSummary.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-[12px] text-[#7D7693] block">
                    Mois dernier (Sept.)
                  </span>
                  <span className="text-[18px] font-bold text-[#14111F] tabular-nums">
                    {formatDH(shoppingSummary.prevMonthAmount)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[13px] text-[#7D7693] leading-relaxed">
              Soit une évolution de <strong className="text-[#14111F]">+{formatDH(shoppingSummary.amount - shoppingSummary.prevMonthAmount)}</strong> sur vos achats Shopping ce mois-ci.
            </p>
          </div>

          {/* Monthly Overview Summary Card matching Reference Screen 4 "Ce mois-ci" */}
          <div className="card-simple p-5">
            <div className="grid grid-cols-2 gap-4 divide-x divide-[#F0ECF9]">
              <div>
                <span className="text-[13px] text-[#7D7693] block">
                  Dépenses totales
                </span>
                <span className="text-[22px] font-extrabold text-[#14111F] tabular-nums mt-1 block">
                  {formatDH(currentMonthExpenses)}
                </span>
                <span className="text-[12px] font-bold text-[#E11D48] mt-1 block">
                  +{expensesVariationPct} % vs sept. ({formatDH(previousMonthExpenses)})
                </span>
              </div>
              <div className="pl-4">
                <span className="text-[13px] text-[#7D7693] block">
                  Épargne possible
                </span>
                <span className="text-[22px] font-extrabold text-[#5E1DF0] tabular-nums mt-1 block">
                  450 DH
                </span>
                <span className="text-[12px] text-[#7D7693] mt-1 block">
                  En suivant nos recommandations
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={() => {
              setHasCompletedOnboarding(true);
              navigateTo('D2_CATEGORY_DETAIL', { category: 'Shopping' });
            }}
            className="w-full h-[52px] btn-simple-primary text-[15px] font-semibold flex items-center justify-center gap-2"
          >
            <span>Comprendre cette hausse</span>
            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            onClick={() => {
              setHasCompletedOnboarding(true);
              navigateTo('C1_HUB', { hubTab: 'MON_ESPACE' });
            }}
            className="w-full h-[48px] rounded-full bg-white text-[#14111F] text-[14px] font-bold shadow-[0_4px_14px_rgba(20,17,31,0.05)] hover:bg-[#FAF8FF] transition-colors"
          >
            Explorer Mes finances
          </button>
        </div>
      </div>
    </div>
  );
};
