import React, { useState, useEffect } from 'react';
import {
  PiggyBank,
  Sparkles,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Check,
  Plane,
  PlusCircle,
  FileText,
  PartyPopper,
  Zap,
  Repeat,
  ShoppingBag,
  CreditCard,
  Trash2,
  Edit3,
  PauseCircle,
  PlayCircle,
  Info,
  Clock,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  User,
  Users,
  MoreHorizontal,
  Coins,
} from 'lucide-react';
import { usePFM } from '../context/PFMContext';
import {
  formatDH,
  SAVINGS_PROJECT_IMAGES,
  TRAVEL_PHOTO_URL,
} from '../data/initialData';
import {
  GoalScope,
  SavingsMethodType,
  SavingsMethodConfig,
  SpendingCategory,
} from '../types/pfm';
import {
  MobileHeader,
  SimpleBarsIcon,
  BottomBankingNav,
  DreamzCircularProject,
} from './SharedUI';

export const SavingsFlowScreens: React.FC = () => {
  const {
    isR1,
    currentScreen,
    monEspaceSubTab,
    savingsGoal,
    hasSavingsGoal,
    selectedGoalScope,
    mainAccountBalance,
    secondaryAccountBalance,
    createFullSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    toggleSavingsMethodPause,
    changeSavingsMethod,
    transferToSavingsGoal,
    navigateTo,
    goBack,
    suggestedGoalTag,
    suggestedGoalImageId,
    suggestedGoalTitle,
    setSuggestedGoalTag,
    setSuggestedGoalImageId,
  } = usePFM();

  const [photoError, setPhotoError] = useState(false);

  // ==========================================
  // H0: 2-STEP SAVINGS GOAL CREATION STATE
  // ==========================================
  const [creationStep, setCreationStep] = useState<1 | 2>(1);

  // Step 1 values
  const [goalScope, setGoalScope] = useState<GoalScope>(isR1 ? 'PERSONNEL' : (selectedGoalScope || 'PERSONNEL'));
  const [selectedImage, setSelectedImage] = useState(SAVINGS_PROJECT_IMAGES[0]);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [deadline, setDeadline] = useState('');
  const [step1Error, setStep1Error] = useState<string | null>(null);

  useEffect(() => {
    if (currentScreen === 'H0_CREATE_GOAL') {
      if (suggestedGoalImageId || suggestedGoalTag) {
        const found = SAVINGS_PROJECT_IMAGES.find(
          (img) => img.id === suggestedGoalImageId || img.tag === suggestedGoalTag
        );
        if (found) {
          setSelectedImage(found);
        }
      }
      setCreationStep(1);
      setProjectName(suggestedGoalTitle || '');
      setTargetAmount('');
      setDeadline('');
      setStep1Error(null);
    }
  }, [currentScreen, suggestedGoalImageId, suggestedGoalTag, suggestedGoalTitle]);

  // Step 2 values (Method selection & contextual config)
  const [selectedMethod, setSelectedMethod] =
    useState<SavingsMethodType | null>(isR1 ? 'VERSEMENT_PONCTUEL' : null);

  // Method 1: Arrondis
  const [roundingLevel, setRoundingLevel] = useState<5 | 10>(10);
  const [roundingMultiplier, setRoundingMultiplier] = useState<1 | 2 | 5>(1);
  const [arrondiCeiling, setArrondiCeiling] = useState<number>(300);

  // Method 2: Versement ponctuel
  const [oneTimeAmount, setOneTimeAmount] = useState<number>(300);
  const [oneTimeError, setOneTimeError] = useState<string | null>(null);

  // Method 3: Épargne intelligente
  const [smartIntensity, setSmartIntensity] = useState<
    'DOUCE' | 'EQUILIBREE' | 'DYNAMIQUE'
  >('EQUILIBREE');
  const [smartMinBalance, setSmartMinBalance] = useState<number>(1000);
  const [smartMaxWeekly, setSmartMaxWeekly] = useState<number>(100);
  const [smartPauseEnabled, setSmartPauseEnabled] = useState(true);

  // Method 4: Versement programmé
  const [scheduledAmount, setScheduledAmount] = useState<number>(350);
  const [scheduledFrequency, setScheduledFrequency] = useState<
    'HEBDOMADAIRE' | 'MENSUELLE' | 'PERSONNALISEE'
  >('MENSUELLE');
  const [scheduledDay, setScheduledDay] = useState<'28' | '01'>('28');

  // Method 5: Après mes achats
  const [purchaseTriggerType, setPurchaseTriggerType] = useState<
    'CATEGORY' | 'MERCHANT'
  >('CATEGORY');
  const [purchaseCategory, setPurchaseCategory] =
    useState<SpendingCategory>('Shopping');
  const [purchaseMerchant, setPurchaseMerchant] = useState('Zara');
  const [purchaseRuleType, setPurchaseRuleType] = useState<
    'FIXED' | 'PERCENTAGE'
  >('FIXED');
  const [purchaseRuleValue, setPurchaseRuleValue] = useState<number>(5);
  const [purchaseMonthlyMax, setPurchaseMonthlyMax] = useState<number>(200);

  // Shared source account & progressive disclosure / bottom-sheet selector state for Step 2
  const [selectedSourceAccount, setSelectedSourceAccount] = useState<string>(
    'Compte principal Simple •• 4821'
  );
  const [showSmartAdvanced, setShowSmartAdvanced] = useState<boolean>(false);
  const [activeMethodSheet, setActiveMethodSheet] = useState<
    | null
    | 'SOURCE_ACCOUNT'
    | 'ARRONDI_LEVEL'
    | 'ARRONDI_CEILING'
    | 'ONE_TIME_AMOUNT'
    | 'SCHEDULED_AMOUNT'
    | 'SCHEDULED_FREQUENCY'
    | 'SMART_INTENSITY'
    | 'SMART_MIN_BALANCE'
    | 'SMART_MAX_WEEKLY'
    | 'PURCHASE_RULE'
    | 'PURCHASE_MONTHLY_MAX'
  >(null);

  // ==========================================
  // H1: PROJECT DETAILS / MODALS STATE
  // ==========================================
  const [showGoalDetailDrawer, setShowGoalDetailDrawer] = useState(false);
  const [showEditGoalModal, setShowEditGoalModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showChangeMethodModal, setShowChangeMethodModal] = useState(false);
  const [showFoyerActionsMenu, setShowFoyerActionsMenu] = useState(false);
  const [showPersonalActionsMenu, setShowPersonalActionsMenu] = useState(false);
  const [showAllContributionsModal, setShowAllContributionsModal] = useState(false);

  // Edit Goal Form
  const [editTitle, setEditTitle] = useState(savingsGoal.title || '');
  const [editTarget, setEditTarget] = useState(savingsGoal.targetAmount || 8000);
  const [editDeadline, setEditDeadline] = useState(savingsGoal.deadline || 'Juin 2027');

  // H2: Transfer State
  const [transferAmount, setTransferAmount] = useState<number>(350);
  const [confirmingTransfer, setConfirmingTransfer] = useState(false);

  // Derived progress values for existing goal
  const progressPct =
    savingsGoal.targetAmount > 0
      ? Math.min(
          100,
          Math.round((savingsGoal.savedAmount / savingsGoal.targetAmount) * 100)
        )
      : 0;
  const remainingAmount = Math.max(
    0,
    savingsGoal.targetAmount - savingsGoal.savedAmount
  );

  // Validate and Proceed from Step 1 to Step 2
  const handleProceedToStep2 = () => {
    if (!projectName.trim()) {
      setStep1Error('Veuillez saisir un nom pour votre projet');
      return;
    }
    const numTarget = Number(targetAmount);
    if (!numTarget || numTarget <= 0) {
      setStep1Error('Veuillez indiquer un montant cible positif');
      return;
    }
    if (!deadline.trim()) {
      setStep1Error("Veuillez définir une date d'échéance");
      return;
    }
    setStep1Error(null);
    setCreationStep(2);
  };

  // Build configured method object
  const buildCurrentMethodConfig = (): SavingsMethodConfig => {
    const activeMethod = selectedMethod || (isR1 ? 'VERSEMENT_PONCTUEL' : 'ARRONDIS');
    const base: SavingsMethodConfig = {
      type: activeMethod,
      sourceAccount: selectedSourceAccount,
      status: 'ACTIVE',
    };

    switch (activeMethod) {
      case 'ARRONDIS':
        return {
          ...base,
          roundingLevel,
          roundingMultiplier,
          monthlyCeiling: arrondiCeiling,
        };
      case 'VERSEMENT_PONCTUEL':
        return {
          ...base,
          oneTimeAmount,
        };
      case 'EPARGNE_INTELLIGENTE':
        return {
          ...base,
          smartIntensity,
          minPreservedBalance: smartMinBalance,
          smartMaxWeekly,
          smartPauseEnabled,
        };
      case 'VERSEMENT_PROGRAMME':
        return {
          ...base,
          scheduledAmount,
          scheduledFrequency,
          scheduledStartDate: `Le ${scheduledDay} de chaque mois`,
          scheduledEndDate: deadline,
        };
      case 'APRES_ACHATS':
        return {
          ...base,
          purchaseTriggerType,
          purchaseCategory:
            purchaseTriggerType === 'CATEGORY' ? purchaseCategory : undefined,
          purchaseMerchant:
            purchaseTriggerType === 'MERCHANT' ? purchaseMerchant : undefined,
          purchaseRuleType,
          purchaseRuleValue,
          purchasePerTxMax: 25,
          purchaseMonthlyMax,
        };
    }
  };

  // Final Confirmation in Step 2
  const handleConfirmCreateGoal = () => {
    const numTarget = Number(targetAmount) || 5000;
    const methodCfg = buildCurrentMethodConfig();
    const activeMethod = selectedMethod || (isR1 ? 'VERSEMENT_PONCTUEL' : 'ARRONDIS');

    let initialDeposit = 0;
    if (activeMethod === 'VERSEMENT_PONCTUEL') {
      if (oneTimeAmount > mainAccountBalance) {
        setOneTimeError(
          `Solde insuffisant : vous disposez de ${formatDH(
            mainAccountBalance,
            true
          )} sur votre compte.`
        );
        return;
      }
      initialDeposit = oneTimeAmount;
    }

    const rawTitle = projectName.trim();
    const finalProjectName =
      rawTitle && rawTitle.toLowerCase() !== 'text'
        ? rawTitle
        : selectedImage.tag
        ? `Projet ${selectedImage.tag}`
        : "Mon projet d'épargne";

    createFullSavingsGoal({
      title: finalProjectName,
      targetAmount: numTarget,
      deadline,
      imageUrl: selectedImage.url,
      categoryTag: selectedImage.tag,
      methodConfig: methodCfg,
      initialDeposit,
      scope: isR1 ? 'PERSONNEL' : (selectedGoalScope === 'FOYER' ? 'FOYER' : 'PERSONNEL'),
    });

    // Reset creation fields
    setCreationStep(1);
    setProjectName('');
    setTargetAmount('');
    setDeadline('');
    setStep1Error(null);
    setOneTimeError(null);

    // Automatically navigate back to Mon espace -> Projets or Foyer
    navigateTo('C1_HUB', {
      hubTab: 'MON_ESPACE',
      monEspaceSubTab: isR1 ? 'PROJETS' : (selectedGoalScope === 'FOYER' ? 'FOYER' : 'PROJETS'),
    });
  };

  // =========================================================================
  // SCREEN H0 — 2-STEP INTERACTIVE SAVINGS GOAL CREATION FLOW
  // =========================================================================
  if (currentScreen === 'H0_CREATE_GOAL') {
    // -------------------------------------------------------------
    // STEP 1 / 2 : INFORMATIONS DU PROJET
    // -------------------------------------------------------------
    if (creationStep === 1) {
      return (
        <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
          <MobileHeader
            title="Donnons vie à votre rêve"
            subtitle="Définissez votre objectif d'épargne."
            onBack={() =>
              navigateTo('C1_HUB', {
                hubTab: 'MON_ESPACE',
                monEspaceSubTab:
                  selectedGoalScope === 'FOYER' ? 'FOYER' : 'PROJETS',
              })
            }
          />

          <div className="p-5 space-y-5 flex-1 flex flex-col justify-between max-w-lg mx-auto w-full">
            <div className="space-y-5">
              {/* Step indicator */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[12px] font-extrabold text-[#5E1DF0] uppercase tracking-wide">
                  Étape 1 sur 2
                </span>
                <span className="text-[11px] text-[#7D7693]">
                  Définition de l'objectif
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-1.5 rounded-full bg-[#5E1DF0]" />
                <div className="h-1.5 rounded-full bg-[#E5DCF8]" />
              </div>

              {/* Large Centered Circle Photo with Overlapping Edit Button */}
              <div className="flex flex-col items-center pt-2 pb-1 relative">
                <div className="relative w-40 h-40 rounded-full p-1 bg-gradient-to-b from-white via-[#F6F3FE] to-[#E5DCF8] shadow-[0_16px_40px_rgba(94,29,240,0.2)]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#F2EDFF] relative">
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowImageGallery((v) => !v)}
                    className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-white text-[#5E1DF0] shadow-[0_6px_20px_rgba(41,7,100,0.18)] border border-[#EFEBF8] flex items-center justify-center hover:bg-[#F6F3FE] hover:scale-105 transition-all active:scale-95 group"
                    aria-label="Modifier la photo du projet"
                    title="Modifier la photo"
                  >
                    <Edit3 size={18} strokeWidth={2.4} className="transition-transform group-hover:rotate-12" />
                  </button>
                </div>

                {/* Expandable Image Gallery Selection Modal/Drawer */}
                {showImageGallery && (
                  <div className="w-full mt-4 p-4 rounded-[22px] bg-white border border-[#EFEBF8] shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-extrabold text-[#14111F]">
                        Choisir une photo d'inspiration
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowImageGallery(false)}
                        className="text-xs font-bold text-[#5E1DF0] hover:underline"
                      >
                        Fermer
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {SAVINGS_PROJECT_IMAGES.map((img) => {
                        const isSelected = selectedImage.id === img.id;
                        return (
                          <button
                            key={img.id}
                            type="button"
                            onClick={() => {
                              setSelectedImage(img);
                              setShowImageGallery(false);
                            }}
                            className={`relative rounded-[16px] overflow-hidden h-20 text-left border-2 transition-all ${
                              isSelected
                                ? 'border-[#5E1DF0] ring-2 ring-[#5E1DF0]/20'
                                : 'border-transparent hover:opacity-90'
                            }`}
                          >
                            <img
                              src={img.url}
                              alt={img.label}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-end p-1.5">
                              <span className="text-[10px] font-bold text-white truncate">
                                {img.tag}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#5E1DF0] text-white flex items-center justify-center">
                                <Check size={10} strokeWidth={3} />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 3 Compact Fields Below the Circle */}
              <div className="space-y-4 pt-1">
                {/* 1. Project Name */}
                <div className="space-y-1.5">
                  <label className="text-[13px] font-extrabold text-[#14111F] block px-1">
                    Quel nom donner à votre projet ? <span className="text-[#5E1DF0]">*</span>
                  </label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => {
                      setProjectName(e.target.value);
                      if (step1Error) setStep1Error(null);
                    }}
                    placeholder="Ex. Vacances en famille"
                    className="w-full h-12 px-4 rounded-[18px] bg-white border border-[#EFEBF8] text-[14px] font-bold text-[#14111F] placeholder:text-[#A39CAE] focus:outline-none focus:border-[#5E1DF0] shadow-2xs transition-all"
                  />
                </div>

                {/* 2. Target Amount */}
                <div className="space-y-1.5">
                  <label className="text-[13px] font-extrabold text-[#14111F] block px-1">
                    Combien souhaitez-vous épargner ? <span className="text-[#5E1DF0]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={targetAmount}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Number(e.target.value);
                        setTargetAmount(val);
                        if (step1Error) setStep1Error(null);
                      }}
                      placeholder="Montant cible en DH"
                      className="w-full h-12 pl-4 pr-14 rounded-[18px] bg-white border border-[#EFEBF8] text-[15px] font-extrabold text-[#14111F] placeholder:text-[#A39CAE] focus:outline-none focus:border-[#5E1DF0] shadow-2xs transition-all tabular-nums"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-[#5E1DF0]">
                      DH
                    </span>
                  </div>
                </div>

                {/* 3. Deadline / Date Selector */}
                <div className="space-y-1.5">
                  <label className="text-[13px] font-extrabold text-[#14111F] block px-1">
                    Pour quand ? <span className="text-[#5E1DF0]">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={deadline}
                        onChange={(e) => {
                          setDeadline(e.target.value);
                          if (step1Error) setStep1Error(null);
                        }}
                        placeholder="Ex. Juin 2027"
                        className="w-full h-12 px-4 rounded-[18px] bg-white border border-[#EFEBF8] text-[14px] font-bold text-[#14111F] placeholder:text-[#A39CAE] focus:outline-none focus:border-[#5E1DF0] shadow-2xs transition-all"
                      />
                    </div>
                    <div className="relative w-12 h-12 rounded-[18px] bg-white border border-[#EFEBF8] flex items-center justify-center shrink-0 shadow-2xs hover:bg-[#FAF8FE] transition-colors">
                      <input
                        type="month"
                        min="2026-11"
                        onChange={(e) => {
                          if (e.target.value) {
                            const [y, m] = e.target.value.split('-');
                            const monthNames = [
                              'Janvier',
                              'Février',
                              'Mars',
                              'Avril',
                              'Mai',
                              'Juin',
                              'Juillet',
                              'Août',
                              'Septembre',
                              'Octobre',
                              'Novembre',
                              'Décembre',
                            ];
                            const mIndex = parseInt(m, 10) - 1;
                            if (mIndex >= 0 && mIndex < 12) {
                              setDeadline(`${monthNames[mIndex]} ${y}`);
                              if (step1Error) setStep1Error(null);
                            }
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        aria-label="Sélectionner la date d'échéance"
                      />
                      <Calendar size={18} className="text-[#5E1DF0]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 1 Error Feedback */}
              {step1Error && (
                <div className="p-3.5 rounded-[18px] bg-[#FEE2E2] text-[#DC2626] text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{step1Error}</span>
                </div>
              )}
            </div>

            {/* Bottom CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleProceedToStep2}
                className="w-full h-[50px] btn-simple-primary text-[14px] font-bold flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Continuer</span>
                <ArrowRight size={16} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // -------------------------------------------------------------
    // STEP 2 / 2 : CHOISIR LA MÉTHODE D'ÉPARGNE & CONFIGURATION
    // -------------------------------------------------------------
    const numTarget = Number(targetAmount) || 5000;
    const estimatedEffortPerMonth = Math.round(numTarget / 8);

    return (
      <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
        <MobileHeader
          title="Épargnez à votre façon"
          subtitle=""
          onBack={() => setCreationStep(1)}
        />

        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Step indicator */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[12px] font-extrabold text-[#5E1DF0] uppercase tracking-wide">
                Étape 2 sur 2
              </span>
              <span className="text-[11px] text-[#7D7693]">
                Méthode & paramètres
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-1.5 rounded-full bg-[#5E1DF0]" />
              <div className="h-1.5 rounded-full bg-[#5E1DF0]" />
            </div>

            {/* 5 Selectable Methods Cards */}
            <div className="space-y-3">
              <div className="px-1 space-y-0.5">
                <h3 className="text-[16px] font-extrabold text-[#14111F]">
                  {isR1 ? 'Comment souhaitez-vous épargner ?' : 'Découvrez vos Saving Hacks'}
                </h3>
                <p className="text-[12.5px] text-[#7D7693]">
                  {isR1 ? 'Choisissez votre mode de versement.' : "Choisissez l'astuce qui vous convient."}
                </p>
              </div>

              {/* METHOD 1 — ARRONDIS */}
              {!isR1 && (<div
                onClick={() => setSelectedMethod('ARRONDIS')}
                className={`rounded-[24px] p-4 border transition-all cursor-pointer ${
                  selectedMethod === 'ARRONDIS'
                    ? 'bg-white border-[#8000EB] ring-2 ring-[#8000EB]/20 shadow-[0_8px_24px_rgba(128,0,235,0.08)]'
                    : 'bg-white/80 border-[#EFEBF8] hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-[16px] bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
                      <Coins size={22} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-extrabold text-[#14111F]">
                        Arrondis
                      </h4>
                      <p className="text-[12px] text-[#7D7693] mt-0.5 leading-snug">
                        Épargnez quelques dirhams à chaque achat.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedMethod === 'ARRONDIS'
                        ? 'border-[#8000EB] bg-[#8000EB] text-white'
                        : 'border-[#D5CEE8]'
                    }`}
                  >
                    {selectedMethod === 'ARRONDIS' && (
                      <Check size={12} strokeWidth={3} />
                    )}
                  </div>
                </div>

                {/* Simplified Contextual Configuration for Method 1 */}
                {selectedMethod === 'ARRONDIS' && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 pt-3.5 border-t border-[#F3EFFA] space-y-2.5"
                  >
                    {/* 2. ROUNDING SETTING */}
                    <button
                      type="button"
                      onClick={() => setActiveMethodSheet('ARRONDI_LEVEL')}
                      className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] flex items-center justify-between gap-2 text-left transition-colors"
                    >
                      <span className="text-xs font-bold text-[#14111F]">
                        Arrondir mes achats à
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5E1DF0] tabular-nums shrink-0">
                        <span>{formatDH(roundingLevel)}</span>
                        <ChevronRight size={14} />
                      </span>
                    </button>

                    {/* 3. ONE SIMPLE EXAMPLE (Mint-highlighted sentence, dynamic based on roundingLevel with x1) */}
                    <div className="px-3.5 py-2.5 rounded-[16px] bg-[#E7F7F0] border border-[#C6EFE0]">
                      <p className="text-[12px] font-bold text-[#0F7B52] leading-snug tabular-nums">
                        Un achat de 43 DH ?{' '}
                        {formatDH(
                          Math.ceil(43 / roundingLevel) * roundingLevel - 43
                        )}{' '}
                        mis de côté.
                      </p>
                    </div>

                    {/* 4. MONTHLY LIMIT */}
                    <button
                      type="button"
                      onClick={() => setActiveMethodSheet('ARRONDI_CEILING')}
                      className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] flex items-center justify-between gap-2 text-left transition-colors"
                    >
                      <span className="text-xs font-bold text-[#14111F]">
                        Maximum par mois
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5E1DF0] tabular-nums shrink-0">
                        <span>{formatDH(arrondiCeiling)}</span>
                        <ChevronRight size={14} />
                      </span>
                    </button>

                    {/* 5. SOURCE ACCOUNT */}
                    <button
                      type="button"
                      onClick={() => setActiveMethodSheet('SOURCE_ACCOUNT')}
                      className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] flex items-center justify-between gap-2 text-left transition-colors"
                    >
                      <span className="text-xs font-bold text-[#14111F] shrink-0">
                        Depuis mon compte
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#14111F] truncate">
                        <span className="truncate">
                          {selectedSourceAccount.includes('4821')
                            ? 'Simple •• 4821'
                            : selectedSourceAccount}
                        </span>
                        <ChevronRight size={14} className="text-[#5E1DF0] shrink-0" />
                      </span>
                    </button>
                  </div>
                )}
              </div>)}

              {/* METHOD 2 — VERSEMENT PONCTUEL */}
              <div
                onClick={() => setSelectedMethod('VERSEMENT_PONCTUEL')}
                className={`rounded-[24px] p-4 border transition-all cursor-pointer ${
                  selectedMethod === 'VERSEMENT_PONCTUEL'
                    ? 'bg-white border-[#8000EB] ring-2 ring-[#8000EB]/20 shadow-[0_8px_24px_rgba(128,0,235,0.08)]'
                    : 'bg-white/80 border-[#EFEBF8] hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-[16px] bg-[#EFF6FF] text-[#2875D0] flex items-center justify-center shrink-0">
                      <PlusCircle size={22} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-extrabold text-[#14111F]">
                        Versement ponctuel
                      </h4>
                      <p className="text-[12px] text-[#7D7693] mt-0.5 leading-snug">
                        Ajoutez de l'argent quand vous le souhaitez.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedMethod === 'VERSEMENT_PONCTUEL'
                        ? 'border-[#8000EB] bg-[#8000EB] text-white'
                        : 'border-[#D5CEE8]'
                    }`}
                  >
                    {selectedMethod === 'VERSEMENT_PONCTUEL' && (
                      <Check size={12} strokeWidth={3} />
                    )}
                  </div>
                </div>

                {/* Contextual Configuration for Method 2 */}
                {selectedMethod === 'VERSEMENT_PONCTUEL' && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 pt-3.5 border-t border-[#F3EFFA] space-y-2.5"
                  >
                    {/* Row 1: Combien souhaitez-vous mettre de côté ? */}
                    <button
                      type="button"
                      onClick={() => setActiveMethodSheet('ONE_TIME_AMOUNT')}
                      className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] flex items-center justify-between gap-2 text-left transition-colors"
                    >
                      <span className="text-xs font-bold text-[#14111F]">
                        Combien souhaitez-vous mettre de côté ?
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5E1DF0] tabular-nums shrink-0">
                        <span>{formatDH(oneTimeAmount)}</span>
                        <ChevronRight size={14} />
                      </span>
                    </button>

                    {/* Row 2: Depuis mon compte */}
                    <button
                      type="button"
                      onClick={() => setActiveMethodSheet('SOURCE_ACCOUNT')}
                      className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] flex items-center justify-between gap-2 text-left transition-colors"
                    >
                      <span className="text-xs font-bold text-[#14111F] shrink-0">
                        Depuis mon compte
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#14111F] truncate">
                        <span className="truncate">{selectedSourceAccount}</span>
                        <ChevronRight size={14} className="text-[#5E1DF0] shrink-0" />
                      </span>
                    </button>

                    {oneTimeError && (
                      <p className="text-xs text-[#DC2626] font-bold px-1">
                        {oneTimeError}
                      </p>
                    )}

                    {/* Short practical note */}
                    <div className="p-3 rounded-[16px] bg-[#F7F4FE] border border-[#EFEBF8]">
                      <p className="text-[11.5px] text-[#7D7693] leading-snug">
                        Un seul virement de <strong className="text-[#14111F]">{formatDH(oneTimeAmount)}</strong> sera effectué vers votre projet dès sa création.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* METHOD 3 — ÉPARGNE INTELLIGENTE */}
              {!isR1 && (<div
                onClick={() => setSelectedMethod('EPARGNE_INTELLIGENTE')}
                className={`rounded-[24px] p-4 border transition-all cursor-pointer ${
                  selectedMethod === 'EPARGNE_INTELLIGENTE'
                    ? 'bg-white border-[#8000EB] ring-2 ring-[#8000EB]/20 shadow-[0_8px_24px_rgba(128,0,235,0.08)]'
                    : 'bg-white/80 border-[#EFEBF8] hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-[16px] bg-[#F0FDFA] text-[#009B85] flex items-center justify-center shrink-0">
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-extrabold text-[#14111F]">
                        Épargne intelligente
                      </h4>
                      <p className="text-[12px] text-[#7D7693] mt-0.5 leading-snug">
                        Épargnez selon votre situation financière.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedMethod === 'EPARGNE_INTELLIGENTE'
                        ? 'border-[#8000EB] bg-[#8000EB] text-white'
                        : 'border-[#D5CEE8]'
                    }`}
                  >
                    {selectedMethod === 'EPARGNE_INTELLIGENTE' && (
                      <Check size={12} strokeWidth={3} />
                    )}
                  </div>
                </div>

                {/* Contextual Configuration for Method 3 */}
                {selectedMethod === 'EPARGNE_INTELLIGENTE' && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 pt-3.5 border-t border-[#F3EFFA] space-y-2.5"
                  >
                    <p className="text-[12px] text-[#6E6785] leading-snug px-0.5">
                      De petites sommes sont mises de côté uniquement lorsque votre solde reste au-dessus du seuil que vous choisissez.
                    </p>

                    {/* Essential Row 1: Rythme d'épargne */}
                    <button
                      type="button"
                      onClick={() => setActiveMethodSheet('SMART_INTENSITY')}
                      className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] flex items-center justify-between gap-2 text-left transition-colors"
                    >
                      <span className="text-xs font-bold text-[#14111F]">
                        Rythme d'épargne
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5E1DF0] shrink-0">
                        <span>
                          {smartIntensity === 'DOUCE'
                            ? 'Douce (~25 DH/sem.)'
                            : smartIntensity === 'EQUILIBREE'
                            ? 'Équilibrée (~60 DH/sem.)'
                            : 'Dynamique (~140 DH/sem.)'}
                        </span>
                        <ChevronRight size={14} />
                      </span>
                    </button>

                    {/* Essential Row 2: Solde minimum à garder */}
                    <button
                      type="button"
                      onClick={() => setActiveMethodSheet('SMART_MIN_BALANCE')}
                      className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] flex items-center justify-between gap-2 text-left transition-colors"
                    >
                      <span className="text-xs font-bold text-[#14111F]">
                        Solde minimum à préserver
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5E1DF0] tabular-nums shrink-0">
                        <span>{formatDH(smartMinBalance)}</span>
                        <ChevronRight size={14} />
                      </span>
                    </button>

                    {/* Essential Row 3: Depuis mon compte */}
                    <button
                      type="button"
                      onClick={() => setActiveMethodSheet('SOURCE_ACCOUNT')}
                      className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] flex items-center justify-between gap-2 text-left transition-colors"
                    >
                      <span className="text-xs font-bold text-[#14111F] shrink-0">
                        Depuis mon compte
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#14111F] truncate">
                        <span className="truncate">{selectedSourceAccount}</span>
                        <ChevronRight size={14} className="text-[#5E1DF0] shrink-0" />
                      </span>
                    </button>

                    {/* Short Estimate Note */}
                    <div className="p-3 rounded-[16px] bg-[#F7F4FE] border border-[#EFEBF8]">
                      <p className="text-[11.5px] text-[#7D7693] leading-snug">
                        Estimation indicative : environ{' '}
                        <strong className="text-[#14111F]">
                          {smartIntensity === 'DOUCE'
                            ? '25 DH'
                            : smartIntensity === 'EQUILIBREE'
                            ? '60 DH'
                            : '140 DH'}{' '}
                          / semaine
                        </strong>{' '}
                        (montant estimé et non garanti, ajusté selon votre solde).
                      </p>
                    </div>

                    {/* Progressive Disclosure: Options avancées */}
                    <div className="pt-0.5">
                      <button
                        type="button"
                        onClick={() => setShowSmartAdvanced((v) => !v)}
                        className="w-full py-1.5 px-1 flex items-center justify-between text-xs font-bold text-[#5E1DF0] hover:text-[#4812C2] transition-colors"
                      >
                        <span>Options avancées</span>
                        <ChevronDown
                          size={15}
                          className={`transition-transform ${
                            showSmartAdvanced ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {showSmartAdvanced && (
                        <div className="mt-2 space-y-2 pt-2 border-t border-[#F3EFFA]">
                          <button
                            type="button"
                            onClick={() => setActiveMethodSheet('SMART_MAX_WEEKLY')}
                            className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] flex items-center justify-between gap-2 text-left transition-colors"
                          >
                            <span className="text-xs font-bold text-[#14111F]">
                              Plafond maximum par semaine
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5E1DF0] tabular-nums shrink-0">
                              <span>{formatDH(smartMaxWeekly)}</span>
                              <ChevronRight size={14} />
                            </span>
                          </button>

                          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8]">
                            <div>
                              <span className="text-xs font-bold text-[#14111F] block">
                                Pause automatique sécurisée
                              </span>
                              <span className="text-[10.5px] text-[#7D7693]">
                                Suspend l'épargne sous {formatDH(smartMinBalance)}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSmartPauseEnabled((v) => !v)}
                              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                                smartPauseEnabled ? 'bg-[#5E1DF0]' : 'bg-[#D5CEE8]'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                                  smartPauseEnabled ? 'right-1' : 'left-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>)}

              {/* METHOD 4 — VERSEMENT PROGRAMMÉ */}
              <div
                onClick={() => setSelectedMethod('VERSEMENT_PROGRAMME')}
                className={`rounded-[24px] p-4 border transition-all cursor-pointer ${
                  selectedMethod === 'VERSEMENT_PROGRAMME'
                    ? 'bg-white border-[#8000EB] ring-2 ring-[#8000EB]/20 shadow-[0_8px_24px_rgba(128,0,235,0.08)]'
                    : 'bg-white/80 border-[#EFEBF8] hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-[16px] bg-[#FFF7ED] text-[#DD8128] flex items-center justify-center shrink-0">
                      <Repeat size={22} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-extrabold text-[#14111F]">
                        Versement programmé
                      </h4>
                      <p className="text-[12px] text-[#7D7693] mt-0.5 leading-snug">
                        Mettez de côté automatiquement à votre rythme.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedMethod === 'VERSEMENT_PROGRAMME'
                        ? 'border-[#8000EB] bg-[#8000EB] text-white'
                        : 'border-[#D5CEE8]'
                    }`}
                  >
                    {selectedMethod === 'VERSEMENT_PROGRAMME' && (
                      <Check size={12} strokeWidth={3} />
                    )}
                  </div>
                </div>

                {/* Contextual Configuration for Method 4 */}
                {selectedMethod === 'VERSEMENT_PROGRAMME' && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 pt-3.5 border-t border-[#F3EFFA] space-y-2.5"
                  >
                    {/* Row 1: Montant à épargner */}
                    <button
                      type="button"
                      onClick={() => setActiveMethodSheet('SCHEDULED_AMOUNT')}
                      className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] flex items-center justify-between gap-2 text-left transition-colors"
                    >
                      <span className="text-xs font-bold text-[#14111F]">
                        Montant à épargner
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5E1DF0] tabular-nums shrink-0">
                        <span>{formatDH(scheduledAmount)}</span>
                        <ChevronRight size={14} />
                      </span>
                    </button>

                    {/* Row 2: À quelle fréquence ? */}
                    <button
                      type="button"
                      onClick={() => setActiveMethodSheet('SCHEDULED_FREQUENCY')}
                      className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] flex items-center justify-between gap-2 text-left transition-colors"
                    >
                      <span className="text-xs font-bold text-[#14111F]">
                        À quelle fréquence ?
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5E1DF0] shrink-0">
                        <span>
                          {scheduledFrequency === 'MENSUELLE'
                            ? `Chaque mois · Le ${scheduledDay === '01' ? '1er' : '28'}`
                            : scheduledFrequency === 'HEBDOMADAIRE'
                            ? 'Chaque semaine'
                            : 'Personnalisée'}
                        </span>
                        <ChevronRight size={14} />
                      </span>
                    </button>

                    {/* Row 3: Depuis mon compte */}
                    <button
                      type="button"
                      onClick={() => setActiveMethodSheet('SOURCE_ACCOUNT')}
                      className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] flex items-center justify-between gap-2 text-left transition-colors"
                    >
                      <span className="text-xs font-bold text-[#14111F] shrink-0">
                        Depuis mon compte
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#14111F] truncate">
                        <span className="truncate">{selectedSourceAccount}</span>
                        <ChevronRight size={14} className="text-[#5E1DF0] shrink-0" />
                      </span>
                    </button>

                    {/* Short practical summary */}
                    <div className="p-3 rounded-[16px] bg-[#F7F4FE] border border-[#EFEBF8]">
                      <p className="text-[11.5px] text-[#7D7693] leading-snug">
                        <strong className="text-[#14111F]">{formatDH(scheduledAmount)}</strong> seront transférés automatiquement{' '}
                        {scheduledFrequency === 'HEBDOMADAIRE'
                          ? 'chaque semaine'
                          : scheduledFrequency === 'MENSUELLE'
                          ? `le ${scheduledDay === '01' ? '1er' : '28'} de chaque mois`
                          : 'selon votre rythme'}{' '}
                        vers votre projet.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* METHOD 5 — ÉPARGNE APRÈS ACHATS */}
              {!isR1 && (<div
                onClick={() => setSelectedMethod('APRES_ACHATS')}
                className={`rounded-[24px] p-4 border transition-all cursor-pointer ${
                  selectedMethod === 'APRES_ACHATS'
                    ? 'bg-white border-[#8000EB] ring-2 ring-[#8000EB]/20 shadow-[0_8px_24px_rgba(128,0,235,0.08)]'
                    : 'bg-white/80 border-[#EFEBF8] hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-[16px] bg-[#FDF2F8] text-[#CD4D8E] flex items-center justify-center shrink-0">
                      <ShoppingBag size={22} />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-extrabold text-[#14111F]">
                        Épargne après achats
                      </h4>
                      <p className="text-[12px] text-[#7D7693] mt-0.5 leading-snug">
                        Mettez un petit montant de côté après vos achats.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      selectedMethod === 'APRES_ACHATS'
                        ? 'border-[#8000EB] bg-[#8000EB] text-white'
                        : 'border-[#D5CEE8]'
                    }`}
                  >
                    {selectedMethod === 'APRES_ACHATS' && (
                      <Check size={12} strokeWidth={3} />
                    )}
                  </div>
                </div>

                {/* Contextual Configuration for Method 5 */}
                {selectedMethod === 'APRES_ACHATS' && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-4 pt-3.5 border-t border-[#F3EFFA] space-y-2.5"
                  >
                    {/* Row 1: Règle d'épargne après achat */}
                    <button
                      type="button"
                      onClick={() => setActiveMethodSheet('PURCHASE_RULE')}
                      className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] flex items-center justify-between gap-2 text-left transition-colors"
                    >
                      <span className="text-xs font-bold text-[#14111F]">
                        Montant mis de côté
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5E1DF0] shrink-0">
                        <span>
                          {purchaseRuleType === 'FIXED'
                            ? `+${purchaseRuleValue} DH / achat`
                            : `${purchaseRuleValue} % de l'achat`}{' '}
                          · {purchaseTriggerType === 'CATEGORY' ? 'Shopping' : 'Zara'}
                        </span>
                        <ChevronRight size={14} />
                      </span>
                    </button>

                    {/* Row 2: Plafond mensuel */}
                    <button
                      type="button"
                      onClick={() => setActiveMethodSheet('PURCHASE_MONTHLY_MAX')}
                      className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] flex items-center justify-between gap-2 text-left transition-colors"
                    >
                      <span className="text-xs font-bold text-[#14111F]">
                        Plafond mensuel
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#5E1DF0] tabular-nums shrink-0">
                        <span>{formatDH(purchaseMonthlyMax)}</span>
                        <ChevronRight size={14} />
                      </span>
                    </button>

                    {/* Row 3: Depuis mon compte */}
                    <button
                      type="button"
                      onClick={() => setActiveMethodSheet('SOURCE_ACCOUNT')}
                      className="w-full px-3.5 py-2.5 rounded-[16px] bg-[#FAF8FE] hover:bg-[#F3EEFF] border border-[#EFEBF8] flex items-center justify-between gap-2 text-left transition-colors"
                    >
                      <span className="text-xs font-bold text-[#14111F] shrink-0">
                        Depuis mon compte
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#14111F] truncate">
                        <span className="truncate">{selectedSourceAccount}</span>
                        <ChevronRight size={14} className="text-[#5E1DF0] shrink-0" />
                      </span>
                    </button>

                    {/* Short accurate example generated from selected rule */}
                    <div className="p-3 rounded-[16px] bg-[#F7F4FE] border border-[#EFEBF8]">
                      <p className="text-[11.5px] text-[#7D7693] leading-snug">
                        Exemple : après un achat{' '}
                        {purchaseTriggerType === 'CATEGORY' ? 'Shopping' : 'chez Zara'}
                        {purchaseRuleType === 'PERCENTAGE' ? ' de 200 DH' : ''},{' '}
                        <strong className="text-[#14111F]">
                          {purchaseRuleType === 'FIXED'
                            ? `${purchaseRuleValue} DH fixes`
                            : `${Math.round(200 * (purchaseRuleValue / 100))} DH (${purchaseRuleValue} %)`}
                        </strong>{' '}
                        sont mis de côté (en plus de votre achat, sans arrondir son montant).
                      </p>
                    </div>
                  </div>
                )}
              </div>)}
            </div>

            {/* Final Project Review Summary */}
            <section className="card-simple p-4.5 space-y-3 bg-[#FAF8FE] border border-[#EBE4F8]">
              <span className="text-[11px] font-extrabold text-[#5E1DF0] uppercase tracking-wide block">
                Récapitulatif de votre objectif
              </span>

              <div className="flex items-center gap-3">
                <img
                  src={selectedImage.url}
                  alt={projectName}
                  className="w-12 h-12 rounded-[14px] object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-[15px] font-extrabold text-[#14111F] truncate">
                    {projectName}
                  </h4>
                  <p className="text-[12px] text-[#7D7693]">
                    {formatDH(numTarget)} · {deadline}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EFEBF8] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#7D7693]">Méthode sélectionnée :</span>
                  <span className="font-bold text-[#14111F]">
                    {selectedMethod === 'ARRONDIS'
                      ? 'Arrondis automatiques'
                      : selectedMethod === 'VERSEMENT_PONCTUEL'
                      ? 'Versement ponctuel'
                      : selectedMethod === 'EPARGNE_INTELLIGENTE'
                      ? 'Épargne intelligente'
                      : selectedMethod === 'VERSEMENT_PROGRAMME'
                      ? 'Versement programmé'
                      : 'Épargne après achats'}
                  </span>
                </div>
                {selectedMethod === 'VERSEMENT_PONCTUEL' && (
                  <div className="flex justify-between">
                    <span className="text-[#7D7693]">Versement initial :</span>
                    <span className="font-extrabold text-[#5E1DF0]">
                      {formatDH(oneTimeAmount)}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-[10px] text-[#A39CAE] leading-normal pt-1">
                * Les montants projetés sont des estimations indicatives personnalisées et réversibles à tout moment.
              </p>
            </section>
          </div>

          {/* Creation Actions */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleConfirmCreateGoal}
              className="w-full h-[52px] btn-simple-primary text-[15px] font-semibold flex items-center justify-center gap-2"
            >
              <span>Créer mon objectif</span>
              <Check size={18} strokeWidth={2.5} />
            </button>

            <button
              type="button"
              onClick={() => setCreationStep(1)}
              className="w-full h-10 rounded-full text-xs font-bold text-[#7D7693] hover:text-[#14111F]"
            >
              Modifier les informations du projet
            </button>
          </div>
        </div>

        {/* MOBILE BOTTOM SHEETS FOR STEP 2 CONFIGURATION */}
        {activeMethodSheet && (
          <div
            className="fixed sm:absolute inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-end justify-center"
            onClick={() => setActiveMethodSheet(null)}
          >
            <div
              className="w-full bg-white rounded-t-[30px] p-5 shadow-2xl border-t border-[#ECE7F6] space-y-4 max-h-[82vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />

              {/* 1. SOURCE ACCOUNT SELECTOR */}
              {activeMethodSheet === 'SOURCE_ACCOUNT' && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-[#14111F]">
                      Depuis mon compte
                    </h3>
                    <p className="text-xs text-[#7D7693] mt-0.5">
                      Choisissez le compte qui alimentera votre projet.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        label: 'Compte principal Simple •• 4821',
                        sub: `Solde disponible : ${formatDH(mainAccountBalance, true)}`,
                      },
                      {
                        label: 'Sous-compte Réserve Simple',
                        sub: `Épargne disponible : ${formatDH(secondaryAccountBalance, true)}`,
                      },
                    ].map((acc) => {
                      const active = selectedSourceAccount === acc.label;
                      return (
                        <button
                          key={acc.label}
                          type="button"
                          onClick={() => {
                            setSelectedSourceAccount(acc.label);
                            setActiveMethodSheet(null);
                          }}
                          className={`w-full p-3.5 rounded-[18px] border text-left flex items-center justify-between gap-3 transition-all ${
                            active
                              ? 'border-[#5E1DF0] bg-[#FAF8FE] ring-1 ring-[#5E1DF0]'
                              : 'border-[#EFEBF8] bg-white hover:bg-[#FAF8FE]'
                          }`}
                        >
                          <div>
                            <p className="text-[13px] font-extrabold text-[#14111F]">
                              {acc.label}
                            </p>
                            <p className="text-[11.5px] text-[#7D7693] mt-0.5">
                              {acc.sub}
                            </p>
                          </div>
                          {active && (
                            <Check size={16} className="text-[#5E1DF0] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 1B. ARRONDI LEVEL SELECTOR */}
              {activeMethodSheet === 'ARRONDI_LEVEL' && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-[#14111F]">
                      Arrondir mes achats à
                    </h3>
                    <p className="text-xs text-[#7D7693] mt-0.5">
                      Choisissez comment arrondir le montant de vos achats.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        val: 5 as const,
                        label: '5 DH',
                        desc: 'Un achat de 43 DH ? 2 DH mis de côté.',
                      },
                      {
                        val: 10 as const,
                        label: '10 DH',
                        desc: 'Un achat de 43 DH ? 7 DH mis de côté.',
                      },
                    ].map((opt) => {
                      const active = roundingLevel === opt.val;
                      return (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => {
                            setRoundingLevel(opt.val);
                            setActiveMethodSheet(null);
                          }}
                          className={`w-full p-3.5 rounded-[18px] border text-left flex items-center justify-between gap-3 transition-all ${
                            active
                              ? 'border-[#5E1DF0] bg-[#FAF8FE] ring-1 ring-[#5E1DF0]'
                              : 'border-[#EFEBF8] bg-white hover:bg-[#FAF8FE]'
                          }`}
                        >
                          <div>
                            <p className="text-[13px] font-extrabold text-[#14111F]">
                              {opt.label}
                            </p>
                            <p className="text-[11.5px] text-[#7D7693] mt-0.5">
                              {opt.desc}
                            </p>
                          </div>
                          {active && (
                            <Check size={16} className="text-[#5E1DF0] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 1C. ARRONDI MONTHLY CEILING SELECTOR */}
              {activeMethodSheet === 'ARRONDI_CEILING' && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-[#14111F]">
                      Maximum par mois
                    </h3>
                    <p className="text-xs text-[#7D7693] mt-0.5">
                      Choisissez la limite mensuelle d'épargne par arrondis.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[150, 300, 500].map((val) => {
                      const active = arrondiCeiling === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setArrondiCeiling(val);
                            setActiveMethodSheet(null);
                          }}
                          className={`w-full p-3.5 rounded-[18px] border text-left flex items-center justify-between transition-all ${
                            active
                              ? 'border-[#5E1DF0] bg-[#FAF8FE] ring-1 ring-[#5E1DF0]'
                              : 'border-[#EFEBF8] bg-white hover:bg-[#FAF8FE]'
                          }`}
                        >
                          <span className="text-[13px] font-extrabold text-[#14111F]">
                            {formatDH(val)}
                          </span>
                          {active && (
                            <Check size={16} className="text-[#5E1DF0]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. ONE-TIME AMOUNT SELECTOR */}
              {activeMethodSheet === 'ONE_TIME_AMOUNT' && (
                <div className="space-y-3.5">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-[#14111F]">
                      Combien souhaitez-vous mettre de côté ?
                    </h3>
                    <p className="text-xs text-[#7D7693] mt-0.5">
                      Choisissez ou saisissez le montant de votre versement ponctuel.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[150, 300, 500, 1000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setOneTimeAmount(amt);
                          setOneTimeError(null);
                          setActiveMethodSheet(null);
                        }}
                        className={`py-2.5 px-3 rounded-[16px] text-xs font-extrabold border transition-all ${
                          oneTimeAmount === amt
                            ? 'bg-[#5E1DF0] text-white border-[#5E1DF0]'
                            : 'bg-[#FAF8FE] text-[#14111F] border-[#EFEBF8]'
                        }`}
                      >
                        {formatDH(amt)}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#7D7693] block mb-1.5">
                      Autre montant (DH)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="10"
                        value={oneTimeAmount}
                        onChange={(e) => {
                          setOneTimeAmount(Math.max(0, Number(e.target.value)));
                          setOneTimeError(null);
                        }}
                        className="flex-1 h-11 px-3.5 rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8] text-[15px] font-extrabold text-[#14111F] tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => setActiveMethodSheet(null)}
                        className="h-11 px-5 rounded-full bg-[#5E1DF0] text-white text-xs font-bold"
                      >
                        Valider
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. SCHEDULED AMOUNT SELECTOR */}
              {activeMethodSheet === 'SCHEDULED_AMOUNT' && (
                <div className="space-y-3.5">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-[#14111F]">
                      Montant à épargner
                    </h3>
                    <p className="text-xs text-[#7D7693] mt-0.5">
                      Choisissez le montant de chaque versement automatique.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[200, 350, 500, 800].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setScheduledAmount(amt);
                          setActiveMethodSheet(null);
                        }}
                        className={`py-2.5 px-3 rounded-[16px] text-xs font-extrabold border transition-all ${
                          scheduledAmount === amt
                            ? 'bg-[#5E1DF0] text-white border-[#5E1DF0]'
                            : 'bg-[#FAF8FE] text-[#14111F] border-[#EFEBF8]'
                        }`}
                      >
                        {formatDH(amt)}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#7D7693] block mb-1.5">
                      Autre montant (DH)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="50"
                        value={scheduledAmount}
                        onChange={(e) =>
                          setScheduledAmount(Math.max(0, Number(e.target.value)))
                        }
                        className="flex-1 h-11 px-3.5 rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8] text-[15px] font-extrabold text-[#14111F] tabular-nums"
                      />
                      <button
                        type="button"
                        onClick={() => setActiveMethodSheet(null)}
                        className="h-11 px-5 rounded-full bg-[#5E1DF0] text-white text-xs font-bold"
                      >
                        Valider
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. SCHEDULED FREQUENCY & EXECUTION DAY SELECTOR */}
              {activeMethodSheet === 'SCHEDULED_FREQUENCY' && (
                <div className="space-y-3.5">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-[#14111F]">
                      À quelle fréquence ?
                    </h3>
                    <p className="text-xs text-[#7D7693] mt-0.5">
                      Choisissez le rythme de votre épargne programmée.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      {
                        id: 'MENSUELLE',
                        label: 'Chaque mois',
                        desc: 'Idéal pour épargner juste après votre salaire',
                      },
                      {
                        id: 'HEBDOMADAIRE',
                        label: 'Chaque semaine',
                        desc: 'Des petits montants réguliers chaque semaine',
                      },
                      {
                        id: 'PERSONNALISEE',
                        label: 'Personnalisée',
                        desc: 'Selon votre propre calendrier',
                      },
                    ].map((opt) => {
                      const active = scheduledFrequency === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setScheduledFrequency(opt.id as any)}
                          className={`w-full p-3.5 rounded-[18px] border text-left flex items-center justify-between gap-3 transition-all ${
                            active
                              ? 'border-[#5E1DF0] bg-[#FAF8FE] ring-1 ring-[#5E1DF0]'
                              : 'border-[#EFEBF8] bg-white hover:bg-[#FAF8FE]'
                          }`}
                        >
                          <div>
                            <p className="text-[13px] font-extrabold text-[#14111F]">
                              {opt.label}
                            </p>
                            <p className="text-[11px] text-[#7D7693] mt-0.5">
                              {opt.desc}
                            </p>
                          </div>
                          {active && (
                            <Check size={16} className="text-[#5E1DF0] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {scheduledFrequency === 'MENSUELLE' && (
                    <div className="pt-2 border-t border-[#F3EFFA] space-y-2">
                      <span className="text-xs font-bold text-[#14111F] block">
                        Jour du versement mensuel
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: '28', label: 'Le 28 (après salaire)' },
                          { id: '01', label: 'Le 1er du mois' },
                        ].map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => setScheduledDay(d.id as any)}
                            className={`py-2.5 px-3 rounded-[14px] text-xs font-bold border transition-all ${
                              scheduledDay === d.id
                                ? 'bg-[#5E1DF0] text-white border-[#5E1DF0]'
                                : 'bg-[#FAF8FE] text-[#14111F] border-[#EFEBF8]'
                            }`}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveMethodSheet(null)}
                    className="w-full h-11 rounded-full bg-[#5E1DF0] text-white text-xs font-bold"
                  >
                    Confirmer
                  </button>
                </div>
              )}

              {/* 5. SMART INTENSITY SELECTOR */}
              {activeMethodSheet === 'SMART_INTENSITY' && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-[#14111F]">
                      Rythme d'épargne
                    </h3>
                    <p className="text-xs text-[#7D7693] mt-0.5">
                      Choisissez l'allure indicative qui vous convient.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[
                      {
                        id: 'DOUCE',
                        label: 'Douce',
                        desc: 'Estimation indicative : ~25 DH / semaine',
                      },
                      {
                        id: 'EQUILIBREE',
                        label: 'Équilibrée',
                        desc: 'Estimation indicative : ~60 DH / semaine',
                      },
                      {
                        id: 'DYNAMIQUE',
                        label: 'Dynamique',
                        desc: 'Estimation indicative : ~140 DH / semaine',
                      },
                    ].map((item) => {
                      const active = smartIntensity === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSmartIntensity(item.id as any);
                            setActiveMethodSheet(null);
                          }}
                          className={`w-full p-3.5 rounded-[18px] border text-left flex items-center justify-between gap-3 transition-all ${
                            active
                              ? 'border-[#5E1DF0] bg-[#FAF8FE] ring-1 ring-[#5E1DF0]'
                              : 'border-[#EFEBF8] bg-white hover:bg-[#FAF8FE]'
                          }`}
                        >
                          <div>
                            <p className="text-[13px] font-extrabold text-[#14111F]">
                              {item.label}
                            </p>
                            <p className="text-[11px] text-[#7D7693] mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                          {active && (
                            <Check size={16} className="text-[#5E1DF0] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 6. SMART MIN BALANCE SELECTOR */}
              {activeMethodSheet === 'SMART_MIN_BALANCE' && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-[#14111F]">
                      Solde minimum à préserver
                    </h3>
                    <p className="text-xs text-[#7D7693] mt-0.5">
                      Aucun montant n'est mis de côté sous ce seuil de sécurité.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[500, 1000, 2000].map((val) => {
                      const active = smartMinBalance === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setSmartMinBalance(val);
                            setActiveMethodSheet(null);
                          }}
                          className={`w-full p-3.5 rounded-[18px] border text-left flex items-center justify-between transition-all ${
                            active
                              ? 'border-[#5E1DF0] bg-[#FAF8FE] ring-1 ring-[#5E1DF0]'
                              : 'border-[#EFEBF8] bg-white hover:bg-[#FAF8FE]'
                          }`}
                        >
                          <span className="text-[13px] font-extrabold text-[#14111F]">
                            {formatDH(val)}
                          </span>
                          {active && (
                            <Check size={16} className="text-[#5E1DF0]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 7. SMART MAX WEEKLY SELECTOR */}
              {activeMethodSheet === 'SMART_MAX_WEEKLY' && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-[#14111F]">
                      Plafond maximum par semaine
                    </h3>
                    <p className="text-xs text-[#7D7693] mt-0.5">
                      Limite hebdomadaire pour garder le contrôle total.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[50, 100, 200].map((val) => {
                      const active = smartMaxWeekly === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setSmartMaxWeekly(val);
                            setActiveMethodSheet(null);
                          }}
                          className={`w-full p-3.5 rounded-[18px] border text-left flex items-center justify-between transition-all ${
                            active
                              ? 'border-[#5E1DF0] bg-[#FAF8FE] ring-1 ring-[#5E1DF0]'
                              : 'border-[#EFEBF8] bg-white hover:bg-[#FAF8FE]'
                          }`}
                        >
                          <span className="text-[13px] font-extrabold text-[#14111F]">
                            {formatDH(val)} / semaine
                          </span>
                          {active && (
                            <Check size={16} className="text-[#5E1DF0]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 8. PURCHASE RULE & TRIGGER SELECTOR */}
              {activeMethodSheet === 'PURCHASE_RULE' && (
                <div className="space-y-3.5">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-[#14111F]">
                      Montant mis de côté après achat
                    </h3>
                    <p className="text-xs text-[#7D7693] mt-0.5">
                      Choisissez le montant ajouté après chaque achat concerné.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { val: 5, label: '+5 DH par achat', isPct: false },
                      { val: 10, label: '+10 DH par achat', isPct: false },
                      { val: 5, label: "5 % du montant de l'achat", isPct: true },
                    ].map((r, idx) => {
                      const active =
                        purchaseRuleValue === r.val &&
                        (r.isPct
                          ? purchaseRuleType === 'PERCENTAGE'
                          : purchaseRuleType === 'FIXED');
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setPurchaseRuleType(r.isPct ? 'PERCENTAGE' : 'FIXED');
                            setPurchaseRuleValue(r.val);
                          }}
                          className={`w-full p-3.5 rounded-[18px] border text-left flex items-center justify-between transition-all ${
                            active
                              ? 'border-[#5E1DF0] bg-[#FAF8FE] ring-1 ring-[#5E1DF0]'
                              : 'border-[#EFEBF8] bg-white hover:bg-[#FAF8FE]'
                          }`}
                        >
                          <span className="text-[13px] font-extrabold text-[#14111F]">
                            {r.label}
                          </span>
                          {active && (
                            <Check size={16} className="text-[#5E1DF0]" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-[#F3EFFA] space-y-2">
                    <span className="text-xs font-bold text-[#14111F] block">
                      Achats concernés
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'CATEGORY', label: 'Catégorie Shopping' },
                        { id: 'MERCHANT', label: 'Marchand Zara' },
                      ].map((trig) => (
                        <button
                          key={trig.id}
                          type="button"
                          onClick={() => setPurchaseTriggerType(trig.id as any)}
                          className={`py-2.5 px-3 rounded-[14px] text-xs font-bold border transition-all ${
                            purchaseTriggerType === trig.id
                              ? 'bg-[#5E1DF0] text-white border-[#5E1DF0]'
                              : 'bg-[#FAF8FE] text-[#14111F] border-[#EFEBF8]'
                          }`}
                        >
                          {trig.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveMethodSheet(null)}
                    className="w-full h-11 rounded-full bg-[#5E1DF0] text-white text-xs font-bold"
                  >
                    Confirmer
                  </button>
                </div>
              )}

              {/* 9. PURCHASE MONTHLY MAX SELECTOR */}
              {activeMethodSheet === 'PURCHASE_MONTHLY_MAX' && (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-[16px] font-extrabold text-[#14111F]">
                      Plafond mensuel
                    </h3>
                    <p className="text-xs text-[#7D7693] mt-0.5">
                      Limite mensuelle mise de côté après vos achats.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[100, 200, 400].map((val) => {
                      const active = purchaseMonthlyMax === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            setPurchaseMonthlyMax(val);
                            setActiveMethodSheet(null);
                          }}
                          className={`w-full p-3.5 rounded-[18px] border text-left flex items-center justify-between transition-all ${
                            active
                              ? 'border-[#5E1DF0] bg-[#FAF8FE] ring-1 ring-[#5E1DF0]'
                              : 'border-[#EFEBF8] bg-white hover:bg-[#FAF8FE]'
                          }`}
                        >
                          <span className="text-[13px] font-extrabold text-[#14111F]">
                            {formatDH(val)} / mois
                          </span>
                          {active && (
                            <Check size={16} className="text-[#5E1DF0]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // SCREEN H1 — PROJECT DETAILS SCREEN (« Mon objectif » / Projet familial)
  // =========================================================================
  if (currentScreen === 'H1_SAVINGS_GOAL') {
    const isPaused = savingsGoal.methodConfig?.status === 'PAUSED';
    const methodType = savingsGoal.methodConfig?.type || 'ARRONDIS';
    const isFoyerGoal = savingsGoal.scope === 'FOYER';
    const safeGoalTitle =
      savingsGoal.title && savingsGoal.title.toLowerCase() !== 'text'
        ? savingsGoal.title
        : savingsGoal.categoryTag
        ? savingsGoal.categoryTag === 'Voyage'
          ? 'Voyager'
          : `Projet ${savingsGoal.categoryTag}`
        : isFoyerGoal
        ? 'Vacances en famille'
        : 'Voyager';

    const foyerPhotoUrl =
      savingsGoal.id === 'foyer-demo-vacances' ||
      !savingsGoal.imageUrl ||
      savingsGoal.imageUrl.includes('photo-1581579438747-1dc8d17bbce4')
        ? TRAVEL_PHOTO_URL
        : savingsGoal.imageUrl;

    const personalPhotoUrl =
      !savingsGoal.imageUrl ||
      savingsGoal.imageUrl.includes('photo-1581579438747-1dc8d17bbce4')
        ? TRAVEL_PHOTO_URL
        : savingsGoal.imageUrl;

    const foyerAutoSavingsSummary = (() => {
      const statusSuffix = isPaused ? ' · En pause' : '';
      switch (methodType) {
        case 'VERSEMENT_PROGRAMME': {
          const amt = savingsGoal.methodConfig?.scheduledAmount || 600;
          const freq =
            savingsGoal.methodConfig?.scheduledFrequency === 'HEBDOMADAIRE'
              ? 'chaque semaine'
              : 'chaque mois';
          return `Versement programmé · ${formatDH(amt)} ${freq}${statusSuffix}`;
        }
        case 'ARRONDIS': {
          const lvl = savingsGoal.methodConfig?.roundingLevel || 10;
          return `Arrondis automatiques · À ${lvl} DH supérieurs${statusSuffix}`;
        }
        case 'EPARGNE_INTELLIGENTE':
          return `Épargne intelligente · Selon votre solde${statusSuffix}`;
        case 'APRES_ACHATS': {
          const val = savingsGoal.methodConfig?.purchaseRuleValue || 5;
          return `Après mes achats · +${val} DH par achat${statusSuffix}`;
        }
        case 'VERSEMENT_PONCTUEL':
        default:
          return `Versement ponctuel · À votre rythme${statusSuffix}`;
      }
    })();

    const personalAutoSavingsSummary = (() => {
      const statusLabel = isPaused ? 'En pause' : 'Actif';
      switch (methodType) {
        case 'EPARGNE_INTELLIGENTE': {
          const rhythm =
            savingsGoal.methodConfig?.smartIntensity === 'DOUCE'
              ? 'Rythme doux'
              : savingsGoal.methodConfig?.smartIntensity === 'DYNAMIQUE'
              ? 'Rythme dynamique'
              : 'Rythme équilibré';
          return `${statusLabel} · Selon votre solde (${rhythm})`;
        }
        case 'ARRONDIS': {
          const lvl = savingsGoal.methodConfig?.roundingLevel || 10;
          return `${statusLabel} · Arrondis à ${lvl} DH supérieurs`;
        }
        case 'VERSEMENT_PROGRAMME': {
          const amt = savingsGoal.methodConfig?.scheduledAmount || 350;
          const freq =
            savingsGoal.methodConfig?.scheduledFrequency === 'HEBDOMADAIRE'
              ? 'chaque semaine'
              : 'chaque mois';
          return `${statusLabel} · ${formatDH(amt)} ${freq}`;
        }
        case 'APRES_ACHATS': {
          const val = savingsGoal.methodConfig?.purchaseRuleValue || 5;
          const unit =
            savingsGoal.methodConfig?.purchaseRuleType === 'PERCENTAGE'
              ? '%'
              : 'DH';
          return `${statusLabel} · +${val} ${unit} après vos achats`;
        }
        case 'VERSEMENT_PONCTUEL':
        default:
          return `${statusLabel} · Versements libres à votre rythme`;
      }
    })();

    const allContributions = savingsGoal.contributionsHistory || [];
    const recentTwoContributions = allContributions.slice(0, 2);

    return (
      <div
        className="min-h-full flex flex-col bg-simple-canvas pb-6"
        onClick={() => {
          if (showFoyerActionsMenu) setShowFoyerActionsMenu(false);
          if (showPersonalActionsMenu) setShowPersonalActionsMenu(false);
        }}
      >
        <MobileHeader
          title={isFoyerGoal ? safeGoalTitle : 'Mon objectif'}
          subtitle={
            isFoyerGoal
              ? `Projet familial · ${savingsGoal.deadline || 'Été 2027'}`
              : undefined
          }
          centered={!isFoyerGoal}
          onBack={() =>
            navigateTo('C1_HUB', {
              hubTab: 'MON_ESPACE',
              monEspaceSubTab: isFoyerGoal ? 'FOYER' : 'PROJETS',
            })
          }
          rightAction={
            isFoyerGoal ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFoyerActionsMenu((v) => !v);
                  }}
                  aria-label="Options du projet"
                  className="w-10 h-10 rounded-full bg-white shadow-[0_4px_14px_rgba(20,17,31,0.06)] border border-white flex items-center justify-center text-[#14111F] hover:bg-[#FAF8FF] active:scale-95 transition-all"
                >
                  <MoreHorizontal size={19} strokeWidth={2.2} />
                </button>

                {showFoyerActionsMenu && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-11 w-48 rounded-[18px] bg-white border border-[#EFEBF8] shadow-[0_14px_30px_rgba(20,17,31,0.14)] py-1.5 z-40 divide-y divide-[#F5F2FA]"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowFoyerActionsMenu(false);
                        setEditTitle(safeGoalTitle);
                        setEditTarget(savingsGoal.targetAmount || 10000);
                        setEditDeadline(savingsGoal.deadline || 'Été 2027');
                        setShowEditGoalModal(true);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-[12.5px] font-bold text-[#14111F] hover:bg-[#FAF8FE] flex items-center gap-2.5 transition-colors"
                    >
                      <Edit3 size={14} className="text-[#8000EB] shrink-0" />
                      <span>Modifier le projet</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowFoyerActionsMenu(false);
                        setShowDeleteConfirmModal(true);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-[12.5px] font-bold text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2.5 transition-colors"
                    >
                      <Trash2 size={14} className="shrink-0" />
                      <span>Supprimer le projet</span>
                    </button>
                  </div>
                )}
              </div>
            ) : undefined
          }
        />

        {isFoyerGoal ? (
          /* =============================================================== */
          /* OPTIMIZED FAMILY PROJECT DETAIL SCREEN ("Vacances en famille")  */
          /* =============================================================== */
          <div className="px-5 pt-1.5 space-y-3.5 flex-1">
            {/* 2. MAIN PROJECT HERO */}
            <section className="card-simple p-5 space-y-4 text-center">
              {/* Circular Progress Component (Main Visual Element) */}
              <div className="pt-0.5 pb-1 flex justify-center">
                <DreamzCircularProject
                  imageUrl={foyerPhotoUrl}
                  title={safeGoalTitle}
                  progressPct={progressPct}
                  size="detail"
                />
              </div>

              {/* Two Amounts Side by Side + Secondary Target Text */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] text-left">
                  <div>
                    <span className="text-[11px] font-semibold text-[#7D7693] block">
                      Déjà épargné
                    </span>
                    <p className="text-[17px] font-extrabold text-[#290764] tabular-nums mt-0.5 leading-snug">
                      {formatDH(savingsGoal.savedAmount)}
                    </p>
                  </div>
                  <div className="text-right border-l border-[#EFEBF8] pl-3">
                    <span className="text-[11px] font-semibold text-[#7D7693] block">
                      Encore à épargner
                    </span>
                    <p className="text-[17px] font-extrabold text-[#8000EB] tabular-nums mt-0.5 leading-snug">
                      {formatDH(remainingAmount)}
                    </p>
                  </div>
                </div>

                <p className="text-[12px] font-semibold text-[#7D7693] tabular-nums">
                  Objectif :{' '}
                  <strong className="font-extrabold text-[#290764]">
                    {formatDH(savingsGoal.targetAmount)}
                  </strong>
                </p>
              </div>

              {/* ONE Primary CTA */}
              <button
                type="button"
                onClick={() => navigateTo('H2_ADD_MONEY')}
                className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_-4px_rgba(128,0,235,0.4)] transition-all active:scale-[0.99]"
              >
                <PlusCircle size={18} strokeWidth={2.3} />
                <span>Ajouter de l'argent</span>
              </button>
            </section>

            {/* 3. AUTOMATIC SAVINGS (One Compact Card) */}
            <section className="card-simple p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
                    <Sparkles size={17} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[14.5px] font-extrabold text-[#14111F] leading-snug">
                      Épargne automatique
                    </h3>
                    <p className="text-[12px] font-semibold text-[#7D7693] truncate mt-0.5">
                      {foyerAutoSavingsSummary}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowChangeMethodModal(true)}
                  className="text-[12.5px] font-bold text-[#8000EB] hover:text-[#6800BF] shrink-0 transition-colors"
                >
                  Gérer →
                </button>
              </div>
            </section>

            {/* 4. FAMILY CONTRIBUTIONS (Compact Section) */}
            <section className="card-simple p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[14.5px] font-extrabold text-[#14111F]">
                  Contributions au projet
                </h3>
                {allContributions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllContributionsModal(true)}
                    className="text-[12.5px] font-bold text-[#8000EB] hover:text-[#6800BF] transition-colors shrink-0"
                  >
                    Voir tout →
                  </button>
                )}
              </div>

              {recentTwoContributions.length > 0 ? (
                <div className="space-y-2">
                  {recentTwoContributions.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-extrabold text-[#14111F] truncate">
                          {item.label}
                        </p>
                        <p className="text-[11px] font-medium text-[#7D7693] mt-0.5">
                          {item.date}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#E7F7F0] text-[#0F7B52] font-extrabold text-[12.5px] tabular-nums shrink-0">
                        +{formatDH(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#7D7693] leading-relaxed">
                  Aucune contribution enregistrée pour le moment.
                </p>
              )}
            </section>
          </div>
        ) : (
          /* =============================================================== */
          /* DREAMZ-INSPIRED PERSONAL PROJECT DETAIL SCREEN ("Mon objectif") */
          /* =============================================================== */
          <div className="px-5 pt-1.5 space-y-3.5 flex-1">
            {/* 1. PROJECT HERO & 2. ACTIONS UNDER THE CIRCLE */}
            <section className="card-simple p-5 space-y-4 text-center">
              {/* Large Centered Project Title & Deadline Below */}
              <div className="space-y-1">
                <h2 className="text-[23px] font-extrabold text-[#290764] leading-tight tracking-tight">
                  {safeGoalTitle}
                </h2>
                <p className="text-[13px] font-semibold text-[#7D7693] inline-flex items-center justify-center gap-1.5">
                  <Calendar size={13.5} className="text-[#8000EB]" />
                  <span>{savingsGoal.deadline || 'Décembre 2026'}</span>
                </p>
              </div>

              {/* Large Circular Project Photo (~220px) + Purple Circular Progress Ring */}
              <div className="pt-0.5 pb-1.5 flex justify-center">
                <DreamzCircularProject
                  imageUrl={personalPhotoUrl}
                  title={safeGoalTitle}
                  progressPct={progressPct}
                  size="hero"
                />
              </div>

              {/* Elegant Progress Information: Saved Amount / Target & Percentage */}
              <div className="space-y-1 pt-0.5">
                <p className="text-[22px] font-extrabold text-[#290764] tabular-nums tracking-tight leading-none">
                  {formatDH(savingsGoal.savedAmount)}{' '}
                  <span className="text-[15px] font-semibold text-[#7D7693]">
                    / {formatDH(savingsGoal.targetAmount)}
                  </span>
                </p>
                <p className="text-[12px] font-semibold text-[#7D7693] tabular-nums">
                  {progressPct} % de l&apos;objectif · Reste {formatDH(remainingAmount)}
                </p>
              </div>

              {/* 2. ACTIONS UNDER THE CIRCLE */}
              <div className="pt-1 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => navigateTo('H2_ADD_MONEY')}
                  className="flex-1 h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_-4px_rgba(128,0,235,0.4)] transition-all active:scale-[0.99]"
                >
                  <PlusCircle size={18} strokeWidth={2.3} />
                  <span>Ajouter de l&apos;argent</span>
                </button>

                {/* Small Three-Dot Menu for Existing Project Management Actions */}
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPersonalActionsMenu((v) => !v);
                    }}
                    aria-label="Options de gestion du projet"
                    className="w-12 h-12 rounded-full bg-[#F3EDFF] hover:bg-[#E7DCFF] text-[#8000EB] flex items-center justify-center transition-colors active:scale-95"
                  >
                    <MoreHorizontal size={20} strokeWidth={2.3} />
                  </button>

                  {showPersonalActionsMenu && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-13 w-52 rounded-[18px] bg-white border border-[#EFEBF8] shadow-[0_14px_30px_rgba(20,17,31,0.14)] py-1.5 z-40 divide-y divide-[#F5F2FA] text-left"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowPersonalActionsMenu(false);
                          setEditTitle(safeGoalTitle);
                          setEditTarget(savingsGoal.targetAmount || 8000);
                          setEditDeadline(savingsGoal.deadline || 'Décembre 2026');
                          setShowEditGoalModal(true);
                        }}
                        className="w-full px-3.5 py-2.5 text-left text-[12.5px] font-bold text-[#14111F] hover:bg-[#FAF8FE] flex items-center gap-2.5 transition-colors"
                      >
                        <Edit3 size={14} className="text-[#8000EB] shrink-0" />
                        <span>Modifier l&apos;objectif</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowPersonalActionsMenu(false);
                          setShowGoalDetailDrawer(true);
                        }}
                        className="w-full px-3.5 py-2.5 text-left text-[12.5px] font-bold text-[#14111F] hover:bg-[#FAF8FE] flex items-center gap-2.5 transition-colors"
                      >
                        <FileText size={14} className="text-[#8000EB] shrink-0" />
                        <span>Détails & Infos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowPersonalActionsMenu(false);
                          setShowDeleteConfirmModal(true);
                        }}
                        className="w-full px-3.5 py-2.5 text-left text-[12.5px] font-bold text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2.5 transition-colors"
                      >
                        <Trash2 size={14} className="shrink-0" />
                        <span>Supprimer le projet</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 3. AUTOMATIC SAVINGS (One Compact Card) */}
            <section className="card-simple p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
                    <Sparkles size={17} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[14.5px] font-extrabold text-[#14111F] leading-snug">
                      Épargne intelligente
                    </h3>
                    <p className="text-[12px] font-semibold text-[#7D7693] truncate mt-0.5">
                      {personalAutoSavingsSummary}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowChangeMethodModal(true)}
                  className="text-[12.5px] font-bold text-[#8000EB] hover:text-[#6800BF] shrink-0 transition-colors"
                >
                  Gérer →
                </button>
              </div>
            </section>

            {/* 4. HISTORY (Existing Savings Transaction History) */}
            <section className="card-simple p-4 space-y-3">
              <h3 className="text-[14.5px] font-extrabold text-[#14111F]">
                Historique des versements
              </h3>

              {allContributions.length > 0 ? (
                <div className="space-y-2">
                  {allContributions.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-extrabold text-[#14111F] truncate">
                          {item.label}
                        </p>
                        <p className="text-[11px] font-medium text-[#7D7693] mt-0.5">
                          {item.date}
                        </p>
                      </div>
                      <span className="font-extrabold text-[#0F7B52] text-[13px] tabular-nums shrink-0">
                        +{formatDH(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#7D7693] leading-relaxed">
                  Aucun versement enregistré pour le moment.
                </p>
              )}
            </section>
          </div>
        )}

        {/* Modal: All Contributions History ("Voir tout →") */}
        {showAllContributionsModal && (
          <div
            className="fixed sm:absolute inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-end justify-center"
            onClick={() => setShowAllContributionsModal(false)}
          >
            <div
              className="w-full bg-white rounded-t-[34px] p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-[18px] font-extrabold text-[#14111F]">
                    Contributions au projet
                  </h3>
                  <p className="text-xs text-[#7D7693] mt-0.5">
                    {safeGoalTitle} · Total épargné :{' '}
                    <strong className="text-[#0F7B52]">
                      {formatDH(savingsGoal.savedAmount)}
                    </strong>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#E7F7F0] text-[#0F7B52] text-[11px] font-extrabold tabular-nums">
                  {allContributions.length} versement
                  {allContributions.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2">
                {allContributions.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-[13px] font-extrabold text-[#14111F]">
                        {item.label}
                      </p>
                      <p className="text-[11px] font-medium text-[#7D7693] mt-0.5">
                        {item.date}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#E7F7F0] text-[#0F7B52] font-extrabold text-[13px] tabular-nums shrink-0">
                      +{formatDH(item.amount)}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowAllContributionsModal(false)}
                className="w-full h-11 rounded-full bg-[#F5F2FA] text-[#14111F] text-xs font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Modal: Edit Goal */}
        {showEditGoalModal && (
          <div className="fixed sm:absolute inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-center justify-center p-5">
            <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl space-y-4">
              <h3 className="text-[18px] font-extrabold text-[#14111F]">
                Modifier l'objectif
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#7D7693] block mb-1">
                    Nom du projet
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8] font-bold text-[#14111F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#7D7693] block mb-1">
                    Montant cible (DH)
                  </label>
                  <input
                    type="number"
                    value={editTarget}
                    onChange={(e) => setEditTarget(Number(e.target.value))}
                    className="w-full h-11 px-3.5 rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8] font-bold text-[#14111F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#7D7693] block mb-1">
                    Date cible
                  </label>
                  <input
                    type="text"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8] font-bold text-[#14111F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditGoalModal(false)}
                  className="h-11 rounded-full bg-[#F5F2FA] text-[#14111F] text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateSavingsGoal({
                      title: editTitle,
                      targetAmount: editTarget,
                      deadline: editDeadline,
                    });
                    setShowEditGoalModal(false);
                  }}
                  className="h-11 btn-simple-primary text-xs font-bold"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Delete Confirmation */}
        {showDeleteConfirmModal && (
          <div className="fixed sm:absolute inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-center justify-center p-5">
            <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl space-y-3.5 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <h3 className="text-[18px] font-extrabold text-[#14111F]">
                Supprimer cet objectif ?
              </h3>
              <p className="text-xs text-[#7D7693] leading-relaxed">
                Si vous avez épargné des fonds ({formatDH(savingsGoal.savedAmount)}), ils restent immédiatement disponibles sur votre compte principal.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmModal(false)}
                  className="h-11 rounded-full bg-[#F5F2FA] text-[#14111F] text-xs font-bold"
                >
                  Conserver
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirmModal(false);
                    deleteSavingsGoal();
                  }}
                  className="h-11 rounded-full bg-[#DC2626] text-white text-xs font-bold hover:bg-[#B91C1C]"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Change Method */}
        {showChangeMethodModal && (
          <div
            className="fixed sm:absolute inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-end justify-center"
            onClick={() => setShowChangeMethodModal(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-white rounded-t-[34px] p-6 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4"
            >
              <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-[18px] font-extrabold text-[#14111F]">
                    Gérer l&apos;épargne intelligente
                  </h3>
                  <p className="text-xs text-[#7D7693] mt-0.5">
                    Choisissez comment vous souhaitez alimenter ce projet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleSavingsMethodPause}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold shrink-0 transition-colors ${
                    isPaused
                      ? 'bg-[#E7F7F0] text-[#0F7B52]'
                      : 'bg-[#F3EDFF] text-[#8000EB]'
                  }`}
                >
                  {isPaused ? 'Reprendre' : 'Mettre en pause'}
                </button>
              </div>

              <div className="p-3.5 rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#7D7693] font-medium">Compte source lié</span>
                  <span className="font-extrabold text-[#14111F]">
                    {savingsGoal.methodConfig?.sourceAccount ||
                      'Compte principal Simple •• 4821'}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#EFEBF8] flex justify-between items-center">
                  <span className="text-[#7D7693] font-medium">Prochain déclencheur</span>
                  <span className="font-bold text-[#8000EB]">
                    {isPaused
                      ? 'Suspendu'
                      : methodType === 'ARRONDIS'
                      ? 'Au prochain paiement carte'
                      : methodType === 'VERSEMENT_PONCTUEL'
                      ? 'Versement libre'
                      : methodType === 'EPARGNE_INTELLIGENTE'
                      ? 'Selon votre solde'
                      : methodType === 'VERSEMENT_PROGRAMME'
                      ? 'Prochaine échéance'
                      : 'Au prochain achat ciblé'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { id: 'ARRONDIS', label: 'Arrondis', desc: 'Sur chaque dépense carte' },
                  { id: 'VERSEMENT_PONCTUEL', label: 'Versement ponctuel', desc: 'Quand vous le souhaitez' },
                  { id: 'EPARGNE_INTELLIGENTE', label: 'Épargne intelligente', desc: 'Micro-épargne selon votre solde' },
                  { id: 'VERSEMENT_PROGRAMME', label: 'Versement programmé', desc: 'Fixe chaque mois' },
                  { id: 'APRES_ACHATS', label: 'Après mes achats', desc: 'Dépenses ciblées (Shopping)' },
                ].filter((m) => !isR1 || ['VERSEMENT_PONCTUEL', 'VERSEMENT_PROGRAMME'].includes(m.id)).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      changeSavingsMethod({
                        ...savingsGoal.methodConfig,
                        type: m.id as any,
                        sourceAccount:
                          savingsGoal.methodConfig?.sourceAccount ||
                          'Compte principal Simple •• 4821',
                        status: 'ACTIVE',
                      });
                      setShowChangeMethodModal(false);
                    }}
                    className={`w-full p-3.5 rounded-[18px] text-left border flex items-center justify-between ${
                      methodType === m.id
                        ? 'border-[#5E1DF0] bg-[#FAF8FE] ring-1 ring-[#5E1DF0]'
                        : 'border-[#EFEBF8] bg-white hover:bg-[#FAF8FE]'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-extrabold text-[#14111F]">{m.label}</p>
                      <p className="text-[11px] text-[#7D7693]">{m.desc}</p>
                    </div>
                    {methodType === m.id && (
                      <Check size={16} className="text-[#5E1DF0]" />
                    )}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowChangeMethodModal(false)}
                className="w-full h-11 rounded-full bg-[#F5F2FA] text-[#14111F] text-xs font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Modal: Goal Info Drawer */}
        {showGoalDetailDrawer && (
          <div className="fixed sm:absolute inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-end justify-center">
            <div className="w-full bg-white rounded-t-[34px] p-6 shadow-2xl border-t border-[#ECE7F6]">
              <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto mb-4" />
              <h3 className="text-[18px] font-extrabold text-[#14111F]">
                Détail de l'objectif · {savingsGoal.title}
              </h3>
              <p className="text-[12px] text-[#7D7693] mt-1 leading-relaxed">
                {savingsGoal.description || 'Objectif d’épargne personnalisé Simple.'}
              </p>

              <div className="mt-4 space-y-2.5 text-[13px]">
                <div className="flex justify-between py-2 border-b border-[#F3EFFA]">
                  <span className="text-[#7D7693]">Montant épargné</span>
                  <span className="font-extrabold text-[#14111F] tabular-nums">
                    {formatDH(savingsGoal.savedAmount)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F3EFFA]">
                  <span className="text-[#7D7693]">Objectif total</span>
                  <span className="font-bold text-[#14111F] tabular-nums">
                    {formatDH(savingsGoal.targetAmount)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F3EFFA]">
                  <span className="text-[#7D7693]">Reste à financer</span>
                  <span className="font-bold text-[#5E1DF0] tabular-nums">
                    {formatDH(remainingAmount)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#F3EFFA]">
                  <span className="text-[#7D7693]">Date cible</span>
                  <span className="font-bold text-[#14111F]">
                    {savingsGoal.deadline}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#7D7693]">Disponibilité des fonds</span>
                  <span className="font-semibold text-[#12895B]">
                    Disponible à tout moment sans frais
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={() => setShowGoalDetailDrawer(false)}
                  className="w-full h-11 rounded-full bg-[#F5F2FA] text-[#14111F] text-xs font-bold"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
        <BottomBankingNav />
      </div>
    );
  }

  // =========================================================================
  // SCREEN H2 — AJOUTER DE L'ARGENT (Virement interne)
  // =========================================================================
  if (currentScreen === 'H2_ADD_MONEY') {
    const quickAmounts = [150, 300, 500, 1000];
    const newSavedTotal = savingsGoal.savedAmount + transferAmount;
    const newGoalPct =
      savingsGoal.targetAmount > 0
        ? Math.min(
            100,
            Math.round((newSavedTotal / savingsGoal.targetAmount) * 100)
          )
        : 100;

    return (
      <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
        <MobileHeader
          title="Ajouter de l'argent"
          subtitle={`Virement interne vers ${savingsGoal.title || 'mon objectif'}`}
          onBack={goBack}
        />

        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <section className="card-simple p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-[#7D7693] block">
                    Compte débité
                  </span>
                  <p className="text-[14px] font-bold text-[#14111F]">
                    Compte principal Simple •• 4821
                  </p>
                </div>
                <span className="text-[13px] font-bold text-[#5E1DF0] tabular-nums">
                  {formatDH(mainAccountBalance, true)}
                </span>
              </div>

              <div className="border-t border-[#F3EFFA] pt-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-[#5E1DF0] block">
                    Destination de l’épargne
                  </span>
                  <p className="text-[14px] font-bold text-[#14111F]">
                    {savingsGoal.title || 'Mon objectif'} ({progressPct} % → {newGoalPct} %)
                  </p>
                </div>
                <span className="text-[13px] font-bold text-[#14111F] tabular-nums">
                  {formatDH(savingsGoal.savedAmount)}
                </span>
              </div>
            </section>

            <section className="card-simple p-5 text-center">
              <span className="text-xs font-bold text-[#7D7693]">
                Montant à transférer
              </span>

              <div className="my-4 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setTransferAmount((v) => Math.max(50, v - 50))}
                  className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-lg font-extrabold"
                >
                  −
                </button>
                <div className="min-w-[145px]">
                  <span className="text-[34px] font-extrabold text-[#14111F] tabular-nums leading-none">
                    {formatDH(transferAmount)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setTransferAmount((v) =>
                      Math.min(Math.floor(mainAccountBalance), v + 50)
                    )
                  }
                  className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-lg font-extrabold"
                >
                  +
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-3">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTransferAmount(amt)}
                    className={`py-2 rounded-full text-xs font-bold tabular-nums ${
                      transferAmount === amt
                        ? 'bg-[#5E1DF0] text-white'
                        : 'bg-[#F6F3FF] text-[#7D7693]'
                    }`}
                  >
                    +{amt} DH
                  </button>
                ))}
              </div>

              <p className="text-[12px] text-[#7D7693] mt-4 pt-3 border-t border-[#F3EFFA]">
                Ce virement interne augmente votre épargne et{' '}
                <strong className="text-[#14111F]">
                  n’est pas comptabilisé comme une dépense
                </strong>{' '}
                dans votre bilan du mois.
              </p>
            </section>
          </div>

          <button
            type="button"
            onClick={() => setConfirmingTransfer(true)}
            className="w-full h-[52px] btn-simple-primary text-[15px] font-semibold flex items-center justify-center gap-2"
          >
            <span>Continuer ({formatDH(transferAmount)})</span>
            <ArrowRight size={17} />
          </button>
        </div>

        {/* Confirmation Modal */}
        {confirmingTransfer && (
          <div className="fixed sm:absolute inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-center justify-center p-5">
            <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl">
              <h3 className="text-[18px] font-extrabold text-[#14111F]">
                Confirmer votre versement
              </h3>
              <p className="text-[12px] text-[#7D7693] mt-1">
                Virement immédiat et gratuit entre vos comptes Simple.
              </p>

              <div className="mt-4 p-4 rounded-[22px] bg-[#F6F3FF] space-y-2.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#7D7693]">Montant</span>
                  <span className="font-extrabold text-[#5E1DF0] tabular-nums">
                    {formatDH(transferAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7D7693]">Nouveau cumul projet</span>
                  <span className="font-bold text-[#14111F] tabular-nums">
                    {formatDH(newSavedTotal)} ({newGoalPct} %)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7D7693]">Nouveau solde compte</span>
                  <span className="font-bold text-[#14111F] tabular-nums">
                    {formatDH(mainAccountBalance - transferAmount, true)}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmingTransfer(false)}
                  className="h-11 rounded-full bg-[#F5F2FA] text-[#14111F] text-xs font-bold"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => {
                    transferToSavingsGoal(transferAmount);
                    setConfirmingTransfer(false);
                    navigateTo('H1_SAVINGS_GOAL');
                  }}
                  className="h-11 btn-simple-primary text-xs font-bold"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // SCREEN H3 & H4: FALLBACKS FOR AUTOMATIC SAVINGS
  // =========================================================================
  return (
    <div className="min-h-full flex flex-col justify-between bg-simple-canvas p-6 text-center">
      <div className="pt-8">
        <div className="w-16 h-16 rounded-full bg-[#E7F7F0] text-[#12895B] flex items-center justify-center mx-auto shadow-xs">
          <Check size={32} strokeWidth={2.5} />
        </div>

        <span className="inline-block px-3.5 py-1 rounded-full bg-[#E7F7F0] text-[#12895B] text-xs font-bold mt-5">
          Projet d'épargne configuré
        </span>
        <h2 className="text-[22px] font-extrabold text-[#14111F] mt-2.5">
          {savingsGoal.title || 'Votre objectif'} est actif !
        </h2>
        <p className="text-[13px] text-[#7D7693] mt-2 leading-relaxed max-w-xs mx-auto">
          Alimenté automatiquement ou par vos versements libres.
        </p>
      </div>

      <div className="space-y-2.5 pt-6">
        <button
          type="button"
          onClick={() => navigateTo('H1_SAVINGS_GOAL')}
          className="w-full h-[52px] btn-simple-primary text-[15px] font-semibold flex items-center justify-center gap-2"
        >
          <span>Voir mon objectif</span>
          <ArrowRight size={17} />
        </button>

        <button
          type="button"
          onClick={() => navigateTo('C1_HUB', { hubTab: 'MON_ESPACE' })}
          className="w-full h-11 rounded-full bg-white text-[#14111F] text-[13px] font-bold shadow-2xs"
        >
          Retour à Mon espace
        </button>
      </div>
    </div>
  );
};
