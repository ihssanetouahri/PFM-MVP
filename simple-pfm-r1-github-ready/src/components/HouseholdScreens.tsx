import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  Plus,
  Receipt,
  ShoppingCart,
  Zap,
  Wifi,
  ChevronRight,
  CreditCard,
  DollarSign,
  HelpCircle,
  Sparkles,
  X,
  UserPlus,
  Home,
  AlertCircle,
  Check,
  ArrowLeft,
  RefreshCw,
  SlidersHorizontal,
  Lock,
  Heart,
  User,
  Camera,
  Pencil,
  Upload,
  Trash2,
  MoreHorizontal,
  PauseCircle,
  Wallet,
  Landmark,
  Copy,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { usePFM } from '../context/PFMContext';
import { formatDH, LAMIA_AVATAR_URL } from '../data/initialData';
import { HouseholdDraftMember, SpendingCategory } from '../types/pfm';
import { MobileHeader, BottomBankingNav, CategoryIcon } from './SharedUI';

// ============================================================================
// 1. EXPENSE SPLITTING FLOW (4 SCREEN STEPS)
// ============================================================================

interface ParticipantItem {
  id: string;
  name: string;
  phone?: string;
  avatarInitials: string;
}

export const HouseholdSplitScreen: React.FC = () => {
  const {
    saveExpenseSplit,
    navigateTo,
    goBack,
    sharedExpenses,
    splitRequests,
    simulateReceiveReimbursement,
    selectedTransactionId,
    setSelectedTransactionId,
    householdMembers,
  } = usePFM();

  const matchedSavedExpense =
    selectedTransactionId && selectedTransactionId !== 'NEW_SPLIT'
      ? sharedExpenses.find((e) => e.id === selectedTransactionId)
      : undefined;

  // Internal Step State: 1 = Participants, 2 = Define Split, 3 = Review, 4 = Details & Tracking
  const [step, setStep] = useState<1 | 2 | 3 | 4>(matchedSavedExpense ? 4 : 1);

  // Selected Transaction: matched expense if viewing details, or Facture Internet default
  const [selectedTxId, setSelectedTxId] = useState<string>(
    matchedSavedExpense ? matchedSavedExpense.id : 'tx-internet-bill'
  );
  const [isChangeTxModalOpen, setIsChangeTxModalOpen] = useState(false);

  const availableOps = [
    {
      id: 'tx-internet-bill',
      title: 'Facture Internet',
      subtitle: 'Paiement effectué · Orange Fibre',
      amount: 450,
      date: '13 oct. 2026',
      category: 'Factures' as SpendingCategory,
      status: 'Paiement effectué',
    },
    {
      id: 'tx-courses-1',
      title: 'Carrefour Market Maarif',
      subtitle: 'Courses alimentaires',
      amount: 640,
      date: '09 oct. 2026',
      category: 'Courses' as SpendingCategory,
      status: 'Paiement effectué',
    },
    {
      id: 'tx-lydec-1',
      title: 'Facture Électricité Lydec',
      subtitle: 'Facture mensuelle énergie',
      amount: 480,
      date: '04 oct. 2026',
      category: 'Factures' as SpendingCategory,
      status: 'Paiement effectué',
    },
    {
      id: 'tx-bricolage-1',
      title: 'Bricoma Bouskoura',
      subtitle: 'Équipement maison',
      amount: 320,
      date: '01 oct. 2026',
      category: 'Autres' as SpendingCategory,
      status: 'Paiement effectué',
    },
  ];

  const currentOp = availableOps.find((o) => o.id === selectedTxId) || availableOps[0];

  // Screen 1 State: Participants
  // Empty initially as required! Lamia has not added anyone yet.
  const [participants, setParticipants] = useState<ParticipantItem[]>([]);
  const [isAddParticipantModalOpen, setIsAddParticipantModalOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonPhone, setNewPersonPhone] = useState('');

  // Suggested contacts (user can click to quickly add without any participant being pre-selected)
  const baseSuggestedContacts = [
    { name: 'Yassine', phone: 'Conjoint · Foyer' },
    { name: 'Youssef', phone: '06 61 •• •• 82' },
    { name: 'Sara', phone: '06 63 •• •• 45' },
    { name: 'Karim', phone: '06 62 •• •• 19' },
  ];

  const householdMemberSuggestions = householdMembers
    .filter(
      (m) =>
        m.id !== 'draft-lamia' &&
        m.role !== 'Vous' &&
        m.role !== 'Administratrice' &&
        !baseSuggestedContacts.some(
          (c) => c.name.toLowerCase() === m.name.toLowerCase()
        )
    )
    .map((m) => ({ name: m.name, phone: m.role }));

  const suggestedContacts = [...householdMemberSuggestions, ...baseSuggestedContacts];

  const handleAddParticipant = (name: string, phone?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (participants.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setIsAddParticipantModalOpen(false);
      return;
    }
    const newP: ParticipantItem = {
      id: `p-${Date.now()}`,
      name: trimmed,
      phone: phone || '',
      avatarInitials: trimmed.charAt(0).toUpperCase(),
    };
    setParticipants((prev) => [...prev, newP]);
    setNewPersonName('');
    setNewPersonPhone('');
    setIsAddParticipantModalOpen(false);
  };

  const handleRemoveParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  // Screen 2 State: Split Calculation
  const [splitMode, setSplitMode] = useState<'EQUAL' | 'PERCENTAGE' | 'CUSTOM'>('EQUAL');
  const [partnerPercentage, setPartnerPercentage] = useState<number>(50); // percentage for others
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});

  // Dynamic share calculations
  const totalAmount = currentOp.amount;
  const participantCount = participants.length;

  let myShare = 0;
  const partnerShares: { name: string; shareAmount: number; pct: number }[] = [];

  if (participantCount > 0) {
    if (splitMode === 'EQUAL') {
      const sharePerPerson = Math.round(totalAmount / (participantCount + 1));
      myShare = totalAmount - sharePerPerson * participantCount;
      participants.forEach((p) => {
        partnerShares.push({
          name: p.name,
          shareAmount: sharePerPerson,
          pct: Math.round((sharePerPerson / totalAmount) * 100),
        });
      });
    } else if (splitMode === 'PERCENTAGE') {
      const totalPartnerPct = partnerPercentage;
      const pctPerPartner = totalPartnerPct / participantCount;
      const totalPartnerAmount = Math.round((totalAmount * totalPartnerPct) / 100);
      const amountPerPartner = Math.round(totalPartnerAmount / participantCount);
      myShare = totalAmount - amountPerPartner * participantCount;
      participants.forEach((p) => {
        partnerShares.push({
          name: p.name,
          shareAmount: amountPerPartner,
          pct: Math.round(pctPerPartner),
        });
      });
    } else {
      // CUSTOM
      let totalAssignedToPartners = 0;
      participants.forEach((p) => {
        const amt = customAmounts[p.id] !== undefined ? customAmounts[p.id] : Math.round(totalAmount / (participantCount + 1));
        totalAssignedToPartners += amt;
        partnerShares.push({
          name: p.name,
          shareAmount: amt,
          pct: Math.round((amt / totalAmount) * 100),
        });
      });
      myShare = totalAmount - totalAssignedToPartners;
    }
  }

  const totalCalculatedShares = myShare + partnerShares.reduce((s, p) => s + p.shareAmount, 0);
  const isSplitValid = participantCount > 0 && totalCalculatedShares === totalAmount && myShare >= 0;

  // Screen 3: Confirmation Handler — saves split and returns to Mon espace -> Foyer
  const handleConfirmSplit = (sendRequest: boolean) => {
    saveExpenseSplit({
      expenseId: currentOp.id,
      title: currentOp.title,
      totalAmount: currentOp.amount,
      category: currentOp.category,
      date: currentOp.date,
      participants: partnerShares.map((p) => ({
        name: p.name,
        shareAmount: p.shareAmount,
      })),
      myShare,
      sendRequest,
    });
    setSelectedTransactionId(currentOp.id);
    navigateTo('C1_HUB', {
      hubTab: 'MON_ESPACE',
      monEspaceSubTab: 'FOYER',
    });
  };

  // Screen 4: Expense Details & Reimbursement Tracking (references the saved SharedExpense record)
  const savedExpenseRecord = sharedExpenses.find((e) => e.id === currentOp.id);
  const detailTitle = savedExpenseRecord ? savedExpenseRecord.title : currentOp.title;
  const detailTotalAmount = savedExpenseRecord
    ? savedExpenseRecord.totalAmount
    : totalAmount;
  const detailMyShare = savedExpenseRecord ? savedExpenseRecord.shareLamia : myShare;
  const detailOtherShare = savedExpenseRecord
    ? savedExpenseRecord.shareOther
    : totalAmount - myShare;
  const detailParticipants =
    savedExpenseRecord?.participants && savedExpenseRecord.participants.length > 0
      ? savedExpenseRecord.participants
      : partnerShares.map((p) => ({ name: p.name, shareAmount: p.shareAmount }));

  const pendingExpenseRequests = splitRequests.filter(
    (r) => r.expenseId === currentOp.id && r.status === 'PENDING'
  );

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
      {/* Dynamic Header */}
      <MobileHeader
        title={
          step === 1
            ? 'Avec qui souhaitez-vous partager ?'
            : step === 2
            ? 'Comment répartir cette dépense ?'
            : step === 3
            ? 'Vérifiez la répartition'
            : 'Détail de la dépense partagée'
        }
        subtitle={
          step === 1
            ? 'Sélectionnez les participants'
            : step === 2
            ? 'Choisissez le mode de partage'
            : step === 3
            ? 'Confirmez les détails'
            : 'Suivi de la répartition et du remboursement'
        }
        onBack={() => {
          if (step === 1) goBack();
          else if (step === 2) setStep(1);
          else if (step === 3) setStep(2);
          else
            navigateTo('C1_HUB', {
              hubTab: 'MON_ESPACE',
              monEspaceSubTab: 'FOYER',
            });
        }}
      />

      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        {/* ==================================================================== */}
        {/* STEP 1: SELECT PARTICIPANTS */}
        {/* ==================================================================== */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Selected Transaction Summary */}
            <section className="card-simple p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                    <Wifi size={20} strokeWidth={2.2} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#12895B] uppercase tracking-wide">
                      {currentOp.status}
                    </span>
                    <h3 className="text-[16px] font-extrabold text-[#14111F] leading-tight">
                      {currentOp.title}
                    </h3>
                    <p className="text-[12px] text-[#7D7693] mt-0.5">
                      {currentOp.subtitle} · {currentOp.date}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[17px] font-extrabold text-[#14111F] tabular-nums">
                    {formatDH(currentOp.amount, true)}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#F3EFFA] flex items-center justify-between">
                <span className="text-xs text-[#7D7693]">Opération sélectionnée</span>
                <button
                  type="button"
                  onClick={() => setIsChangeTxModalOpen(true)}
                  className="text-xs font-bold text-[#5E1DF0] hover:underline"
                >
                  Changer d'opération
                </button>
              </div>
            </section>

            {/* Payer Summary */}
            <section className="p-3.5 rounded-[20px] bg-white border border-[#EFEBF8] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#EFEAFF] shrink-0 border border-[#5E1DF0]/20">
                  <img
                    src={LAMIA_AVATAR_URL}
                    alt="Lamia"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#14111F]">
                    Lamia (Vous)
                  </p>
                  <p className="text-[11px] text-[#7D7693]">
                    Payeur initial · 100 % réglé
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#12895B] bg-[#E7F7F0] px-2.5 py-1 rounded-full">
                Payé
              </span>
            </section>

            {/* Participants Section */}
            <section className="card-simple p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[15px] font-extrabold text-[#14111F]">
                    Participants au partage
                  </h3>
                  <p className="text-[12px] text-[#7D7693]">
                    {participants.length === 0
                      ? 'Aucune personne sélectionnée pour le moment'
                      : `${participants.length} personne${participants.length > 1 ? 's' : ''} ajoutée${participants.length > 1 ? 's' : ''}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddParticipantModalOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-xs font-bold flex items-center gap-1.5 hover:bg-[#E5DCFF] transition-colors"
                >
                  <UserPlus size={14} />
                  <span>Ajouter une personne</span>
                </button>
              </div>

              {/* Empty state when no participants added yet */}
              {participants.length === 0 ? (
                <div className="p-6 rounded-[24px] bg-[#FAF8FE] border border-dashed border-[#DED4FA] text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center mx-auto">
                    <Users size={22} />
                  </div>
                  <div>
                    <p className="text-[14px] font-extrabold text-[#14111F]">
                      Qui partage cette facture avec vous ?
                    </p>
                    <p className="text-[12px] text-[#7D7693] mt-1 max-w-[280px] mx-auto leading-relaxed">
                      Ajoutez manuellement un proche ou choisissez parmi vos contacts récents.
                    </p>
                  </div>

                  {/* Quick suggested chips */}
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-[#5E1DF0] mb-2 uppercase tracking-wide">
                      Suggestions rapides
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {suggestedContacts.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleAddParticipant(c.name, c.phone)}
                          className="px-3.5 py-1.5 rounded-full bg-white border border-[#E0D5FA] shadow-2xs text-xs font-bold text-[#14111F] hover:border-[#5E1DF0] hover:text-[#5E1DF0] flex items-center gap-1.5 transition-colors"
                        >
                          <Plus size={13} className="text-[#5E1DF0]" />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Added participants list */
                <div className="space-y-2 pt-1">
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-[20px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#5E1DF0] text-white font-extrabold flex items-center justify-center text-sm shrink-0">
                          {p.avatarInitials}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#14111F]">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-[#7D7693]">
                            {p.phone || 'Participant invité'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(p.id)}
                        aria-label="Supprimer"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[#8E87A6] hover:text-[#DC2626] hover:bg-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Step 1 Primary Action */}
        {step === 1 && (
          <button
            type="button"
            disabled={participants.length === 0}
            onClick={() => setStep(2)}
            className={`w-full h-[52px] rounded-full text-[15px] font-semibold flex items-center justify-center gap-2 transition-all ${
              participants.length > 0
                ? 'btn-simple-primary shadow-xs'
                : 'bg-[#EAE4F5] text-[#A69DC0] cursor-not-allowed'
            }`}
          >
            <span>Continuer</span>
            <ArrowRight size={17} strokeWidth={2.4} />
          </button>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: DEFINE THE SPLIT */}
        {/* ==================================================================== */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Header info card */}
            <section className="p-4 rounded-[22px] bg-white border border-[#EFEBF8] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#7D7693] uppercase">
                  Dépense à répartir
                </span>
                <p className="text-[16px] font-extrabold text-[#14111F]">
                  {currentOp.title}
                </p>
              </div>
              <p className="text-[18px] font-extrabold text-[#5E1DF0] tabular-nums">
                {formatDH(totalAmount)}
              </p>
            </section>

            {/* Split Mode Selector */}
            <section className="card-simple p-5 space-y-4">
              <h3 className="text-[14px] font-extrabold text-[#14111F]">
                Mode de calcul
              </h3>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSplitMode('EQUAL')}
                  className={`py-2.5 px-2 rounded-[18px] text-xs font-bold transition-all text-center border ${
                    splitMode === 'EQUAL'
                      ? 'bg-[#5E1DF0] text-white border-[#5E1DF0] shadow-2xs'
                      : 'bg-[#F7F4FE] text-[#7D7693] border-[#EFEBF8] hover:bg-[#EAE2FF]'
                  }`}
                >
                  Part égale
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode('PERCENTAGE')}
                  className={`py-2.5 px-2 rounded-[18px] text-xs font-bold transition-all text-center border ${
                    splitMode === 'PERCENTAGE'
                      ? 'bg-[#5E1DF0] text-white border-[#5E1DF0] shadow-2xs'
                      : 'bg-[#F7F4FE] text-[#7D7693] border-[#EFEBF8] hover:bg-[#EAE2FF]'
                  }`}
                >
                  Pourcentage
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode('CUSTOM')}
                  className={`py-2.5 px-2 rounded-[18px] text-xs font-bold transition-all text-center border ${
                    splitMode === 'CUSTOM'
                      ? 'bg-[#5E1DF0] text-white border-[#5E1DF0] shadow-2xs'
                      : 'bg-[#F7F4FE] text-[#7D7693] border-[#EFEBF8] hover:bg-[#EAE2FF]'
                  }`}
                >
                  Montant libre
                </button>
              </div>

              {/* Percentage options */}
              {splitMode === 'PERCENTAGE' && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-[#7D7693]">
                    <span>Part des participants :</span>
                    <strong className="text-[#5E1DF0] font-extrabold">{partnerPercentage} %</strong>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[50, 40, 30].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setPartnerPercentage(pct)}
                        className={`py-2 rounded-full text-xs font-bold transition-colors ${
                          partnerPercentage === pct
                            ? 'bg-[#5E1DF0] text-white'
                            : 'bg-[#F2EDFF] text-[#5E1DF0]'
                        }`}
                      >
                        {pct} / {100 - pct}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Breakdown cards */}
              <div className="space-y-2.5 pt-2">
                {/* Lamia's share */}
                <div className="p-3.5 rounded-[20px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EFEAFF] text-[#5E1DF0] flex items-center justify-center font-bold text-xs shrink-0">
                      L
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#14111F]">
                        Lamia (Votre part)
                      </p>
                      <p className="text-[11px] text-[#7D7693]">
                        Ce qui reste à votre charge
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-extrabold text-[#14111F] tabular-nums">
                      {formatDH(myShare)}
                    </p>
                    <span className="text-[11px] text-[#7D7693]">
                      {Math.round((myShare / totalAmount) * 100)} %
                    </span>
                  </div>
                </div>

                {/* Partner shares */}
                {partnerShares.map((p, idx) => (
                  <div
                    key={p.name}
                    className="p-3.5 rounded-[20px] bg-[#FAF8FE] border border-[#EAE4F5] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#5E1DF0] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#14111F]">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-[#5E1DF0] font-semibold">
                          À rembourser à Lamia
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {splitMode === 'CUSTOM' ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max={totalAmount}
                            value={customAmounts[participants[idx]?.id] ?? p.shareAmount}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 0;
                              setCustomAmounts((prev) => ({
                                ...prev,
                                [participants[idx]?.id]: val,
                              }));
                            }}
                            className="w-20 px-2 py-1 text-right text-xs font-bold border border-[#D8CEF6] rounded-lg bg-white"
                          />
                          <span className="text-xs font-bold text-[#14111F]">DH</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-[15px] font-extrabold text-[#5E1DF0] tabular-nums">
                            {formatDH(p.shareAmount)}
                          </p>
                          <span className="text-[11px] text-[#7D7693]">
                            {p.pct} %
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total check indicator */}
              <div
                className={`p-3 rounded-[16px] text-xs flex items-center justify-between font-semibold ${
                  isSplitValid
                    ? 'bg-[#E7F7F0] text-[#0F7B52]'
                    : 'bg-[#FEE2E2] text-[#DC2626]'
                }`}
              >
                <span>Total réparti : {formatDH(totalCalculatedShares)} / {formatDH(totalAmount)}</span>
                {isSplitValid ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
              </div>
            </section>
          </div>
        )}

        {/* Step 2 Primary Action */}
        {step === 2 && (
          <button
            type="button"
            disabled={!isSplitValid}
            onClick={() => setStep(3)}
            className={`w-full h-[52px] rounded-full text-[15px] font-semibold flex items-center justify-center gap-2 transition-all ${
              isSplitValid
                ? 'btn-simple-primary shadow-xs'
                : 'bg-[#EAE4F5] text-[#A69DC0] cursor-not-allowed'
            }`}
          >
            <span>Continuer</span>
            <ArrowRight size={17} strokeWidth={2.4} />
          </button>
        )}

        {/* ==================================================================== */}
        {/* STEP 3: REVIEW AND CONFIRM */}
        {/* ==================================================================== */}
        {step === 3 && (
          <div className="space-y-4">
            <section className="card-simple p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#5E1DF0] uppercase">
                    Récapitulatif de la répartition
                  </span>
                  <h3 className="text-[17px] font-extrabold text-[#14111F]">
                    {currentOp.title}
                  </h3>
                </div>
                <span className="text-[18px] font-extrabold text-[#14111F] tabular-nums">
                  {formatDH(totalAmount)}
                </span>
              </div>

              <div className="divide-y divide-[#F3EFFA] text-[13px]">
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#7D7693]">Payé initialement par :</span>
                  <span className="font-bold text-[#14111F]">Lamia</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-[#7D7693]">Votre part (Lamia) :</span>
                  <span className="font-bold text-[#14111F]">{formatDH(myShare)}</span>
                </div>
                {partnerShares.map((p) => (
                  <div key={p.name} className="py-2.5 flex justify-between">
                    <span className="text-[#7D7693]">Part assignée à {p.name} :</span>
                    <span className="font-bold text-[#5E1DF0]">{formatDH(p.shareAmount)}</span>
                  </div>
                ))}
              </div>

              {/* Amount to receive highlight */}
              <div className="p-4 rounded-[20px] bg-[#F2EDFF] border border-[#E2D6FF] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#5E1DF0] uppercase">
                    À recevoir en remboursement
                  </span>
                  <p className="text-[20px] font-extrabold text-[#5E1DF0] tabular-nums mt-0.5">
                    {formatDH(totalAmount - myShare)}
                  </p>
                </div>
                <Clock size={24} className="text-[#5E1DF0]" />
              </div>
            </section>

            {/* Information Disclosure & Transparency note */}
            <section className="p-4 rounded-[22px] bg-[#FAF8FE] border border-[#EFEBF8] space-y-2 text-xs text-[#7D7693]">
              <div className="flex items-center gap-2 text-[#14111F] font-bold">
                <ShieldCheck size={16} className="text-[#5E1DF0]" />
                <span>Informations partagées</span>
              </div>
              <p className="leading-relaxed">
                Seule cette opération (<strong>{currentOp.title} · {formatDH(totalAmount)}</strong>) et les quotes-parts calculées seront partagées. Vos autres opérations et votre solde bancaire restent strictement confidentiels.
              </p>
              <p className="text-[11px] text-[#6B5E94] italic pt-0.5">
                Simulation Simple Pay : Un récapitulatif clair et un lien de remboursement sécurisé seront préparés.
              </p>
            </section>
          </div>
        )}

        {/* Step 3 Confirmation Buttons */}
        {step === 3 && (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => handleConfirmSplit(true)}
              className="w-full h-[52px] btn-simple-primary text-[14px] font-bold flex items-center justify-center gap-2 shadow-xs"
            >
              <Send size={16} />
              <span>Enregistrer et demander un remboursement</span>
            </button>

            <button
              type="button"
              onClick={() => handleConfirmSplit(false)}
              className="w-full h-[48px] rounded-full bg-white border border-[#EFEBF8] text-[#14111F] text-[14px] font-semibold hover:bg-[#FAF8FE] transition-colors"
            >
              Enregistrer uniquement
            </button>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 4: EXPENSE SPLIT DETAILS AND REIMBURSEMENT TRACKING             */}
        {/* ==================================================================== */}
        {step === 4 && (
          <div className="space-y-4">
            {/* Details & Status Card */}
            <section className="card-simple p-5 space-y-3.5 border-2 border-[#E2D6FF]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#E7F7F0] text-[#0F7B52] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#0F7B52] uppercase">
                    Répartition validée
                  </span>
                  <h3 className="text-[17px] font-extrabold text-[#14111F] leading-tight">
                    {detailTitle} — {formatDH(detailTotalAmount)}
                  </h3>
                  <p className="text-[11px] text-[#7D7693] mt-0.5">
                    Payé par Lamia · {savedExpenseRecord?.date || currentOp.date}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8]">
                  <span className="text-[11px] text-[#7D7693]">Votre part :</span>
                  <p className="text-[16px] font-extrabold text-[#14111F] tabular-nums mt-0.5">
                    {formatDH(detailMyShare)}
                  </p>
                </div>
                <div className="p-3 rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8]">
                  <span className="text-[11px] text-[#7D7693]">À recevoir :</span>
                  <p className="text-[16px] font-extrabold text-[#5E1DF0] tabular-nums mt-0.5">
                    {formatDH(detailOtherShare)}
                  </p>
                </div>
              </div>

              {detailParticipants.length > 0 && (
                <div className="divide-y divide-[#F3EFFA] text-[12px] pt-1">
                  {detailParticipants.map((p) => (
                    <div key={p.name} className="py-2 flex items-center justify-between">
                      <span className="text-[#7D7693]">Part de {p.name}</span>
                      <span className="font-bold text-[#14111F]">
                        {formatDH(p.shareAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#7D7693]">Statut du remboursement :</span>
                {pendingExpenseRequests.length > 0 ? (
                  <span className="px-2.5 py-1 rounded-full bg-[#FFF3E2] text-[#D97706] font-bold flex items-center gap-1">
                    <Clock size={12} />
                    <span>
                      En attente ({pendingExpenseRequests.map((r) => r.recipientName).join(', ')})
                    </span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-[#E7F7F0] text-[#0F7B52] font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>Remboursé / Réglé</span>
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[#7D7693] leading-relaxed pt-1 border-t border-[#F3EFFA]">
                Le paiement initial de {formatDH(detailTotalAmount)} reste débité de votre compte. Votre solde ne sera crédité que lors de la réception effective du remboursement.
              </p>

              {/* Action to simulate receiving each pending reimbursement */}
              {pendingExpenseRequests.map((req) => (
                <button
                  key={req.id}
                  type="button"
                  onClick={() => simulateReceiveReimbursement(req.id)}
                  className="w-full h-11 rounded-full bg-[#5E1DF0] text-white text-xs font-bold hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <RefreshCw size={14} />
                  <span>
                    Marquer comme reçu de {req.recipientName} (+{formatDH(req.amountRequested)})
                  </span>
                </button>
              ))}
            </section>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() =>
                  navigateTo('C1_HUB', {
                    hubTab: 'MON_ESPACE',
                    monEspaceSubTab: 'FOYER',
                  })
                }
                className="w-full h-12 rounded-full btn-simple-primary text-[14px] font-bold flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Retour à Mon espace Foyer</span>
                <ArrowRight size={16} strokeWidth={2.4} />
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full h-11 rounded-full bg-white text-[#7D7693] hover:text-[#14111F] text-[13px] font-semibold border border-[#EFEBF8] transition-colors"
              >
                Modifier cette répartition
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Participant Modal */}
      {isAddParticipantModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#14111F]/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-[390px] bg-white rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center">
                  <UserPlus size={18} />
                </div>
                <h3 className="text-[16px] font-extrabold text-[#14111F]">
                  Ajouter un participant
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddParticipantModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8FE] text-[#7D7693] hover:text-[#14111F] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Suggestions */}
            <div>
              <p className="text-[11px] font-bold text-[#7D7693] uppercase tracking-wide mb-2">
                Contacts suggérés
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedContacts.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleAddParticipant(c.name, c.phone)}
                    className="px-3.5 py-1.5 rounded-full bg-[#F5F1FF] text-xs font-bold text-[#5E1DF0] hover:bg-[#EAE2FF] transition-colors flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>{c.name} ({c.phone})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Form */}
            <div className="space-y-3 pt-2 border-t border-[#F3EFFA]">
              <div>
                <label className="text-[11px] font-bold text-[#14111F] block mb-1">
                  Nom ou prénom *
                </label>
                <input
                  type="text"
                  placeholder="Ex : Youssef"
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#EFEBF8] bg-[#FAF8FE] text-sm text-[#14111F] focus:outline-none focus:border-[#5E1DF0]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#7D7693] block mb-1">
                  Numéro ou contact (facultatif)
                </label>
                <input
                  type="text"
                  placeholder="Ex : 06 61 •• •• 82"
                  value={newPersonPhone}
                  onChange={(e) => setNewPersonPhone(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#EFEBF8] bg-[#FAF8FE] text-sm text-[#14111F] focus:outline-none focus:border-[#5E1DF0]"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={!newPersonName.trim()}
              onClick={() => handleAddParticipant(newPersonName, newPersonPhone)}
              className={`w-full h-11 rounded-full text-xs font-bold transition-all ${
                newPersonName.trim()
                  ? 'btn-simple-primary'
                  : 'bg-[#EAE4F5] text-[#A69DC0] cursor-not-allowed'
              }`}
            >
              Ajouter ce participant
            </button>
          </div>
        </div>
      )}

      {/* Change Transaction Bottom Sheet */}
      {isChangeTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#14111F]/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-[390px] bg-white rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-extrabold text-[#14111F]">
                Changer d'opération
              </h3>
              <button
                type="button"
                onClick={() => setIsChangeTxModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF8FE] text-[#7D7693] hover:text-[#14111F] flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {availableOps.map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => {
                    setSelectedTxId(op.id);
                    setIsChangeTxModalOpen(false);
                  }}
                  className={`w-full p-3.5 rounded-[18px] text-left transition-all flex items-center justify-between border ${
                    selectedTxId === op.id
                      ? 'bg-[#FAF8FE] border-[#5E1DF0] ring-2 ring-[#5E1DF0]/15'
                      : 'bg-white border-[#EFEBF8] hover:bg-[#FAF8FE]'
                  }`}
                >
                  <div>
                    <p className="text-[13px] font-bold text-[#14111F]">{op.title}</p>
                    <p className="text-[11px] text-[#7D7693] mt-0.5">{op.date}</p>
                  </div>
                  <span className="text-[14px] font-extrabold text-[#14111F] tabular-nums">
                    {formatDH(op.amount)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. HOUSEHOLD PERSONALIZATION — STEP 1 OF 2: FAMILY MEMBERS & PORTRAITS
// ============================================================================

const ILLUSTRATIVE_PORTRAITS: { id: string; label: string; url: string }[] = [
  {
    id: 'portrait-husband',
    label: 'Conjoint',
    url: '/src/assets/images/portrait_husband_father_1791972720059.jpg',
  },
  {
    id: 'portrait-yasmine',
    label: 'Fille',
    url: '/src/assets/images/portrait_yasmine_teen_1791972719154.jpg',
  },
  {
    id: 'portrait-amine',
    label: 'Fils',
    url: '/src/assets/images/portrait_amine_son_1791972720121.jpg',
  },
  {
    id: 'portrait-lamia',
    label: 'Lamia',
    url: LAMIA_AVATAR_URL,
  },
];

const RELATIONSHIP_OPTIONS = [
  'Conjoint',
  'Fils',
  'Fille',
  'Enfant',
  'Simple One',
  'Parent',
  'Autre',
];

export const HouseholdSetupScreen: React.FC = () => {
  const {
    hasHouseholdSetup,
    householdName,
    householdCoverUrl,
    householdMembers,
    householdDraftMembers,
    setHouseholdDraftMembers,
    completeHouseholdPersonalization,
    navigateTo,
  } = usePFM();

  const DEFAULT_SUGGESTED_COVER =
    '/src/assets/images/moroccan_family_foyer_1791969781489.jpg';

  const [personalizationStep, setPersonalizationStep] = useState<1 | 2>(1);
  const [spaceNameInput, setSpaceNameInput] = useState<string>(
    householdName && householdName.trim() ? householdName : 'Notre foyer'
  );
  const [coverImageUrl, setCoverImageUrl] = useState<string>(
    householdCoverUrl || DEFAULT_SUGGESTED_COVER
  );

  // When reopened in EDIT mode, preload saved members, portraits, name and cover image
  useEffect(() => {
    if (hasHouseholdSetup && householdMembers.length > 0) {
      setHouseholdDraftMembers(
        householdMembers.map((m) => ({
          id: m.id,
          firstName: m.name,
          relationship: m.role,
          photoUrl: m.photoUrl ?? null,
          isSelf:
            m.id === 'draft-lamia' ||
            m.role === 'Vous' ||
            m.role === 'Administratrice',
          isSuggestedSimpleOne:
            m.id === 'draft-yasmine' || m.role === 'Simple One',
          isConfirmed: true,
        }))
      );
      setSpaceNameInput(
        householdName && householdName.trim() ? householdName : 'Notre foyer'
      );
      setCoverImageUrl(householdCoverUrl || DEFAULT_SUGGESTED_COVER);
    }
  }, []);

  // Compact Member Editor Bottom Sheet state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editorFirstName, setEditorFirstName] = useState('');
  const [editorRelationship, setEditorRelationship] = useState('Conjoint');
  const [editorPhotoUrl, setEditorPhotoUrl] = useState<string | null>(null);
  const [editorError, setEditorError] = useState('');

  const openAddMemberSheet = (presetRelationship?: string) => {
    setEditingMemberId(null);
    setEditorFirstName('');
    const rel = presetRelationship || 'Conjoint';
    setEditorRelationship(rel);
    if (rel === 'Conjoint') {
      setEditorPhotoUrl('/src/assets/images/portrait_husband_father_1791972720059.jpg');
    } else if (rel === 'Fils' || rel === 'Enfant') {
      setEditorPhotoUrl('/src/assets/images/portrait_amine_son_1791972720121.jpg');
    } else {
      setEditorPhotoUrl(null);
    }
    setEditorError('');
    setIsEditorOpen(true);
  };

  const openEditMemberSheet = (member: HouseholdDraftMember) => {
    setEditingMemberId(member.id);
    setEditorFirstName(member.firstName);
    setEditorRelationship(member.relationship);
    setEditorPhotoUrl(member.photoUrl);
    setEditorError('');
    setIsEditorOpen(true);
  };

  const handleConfirmSuggestedMember = (memberId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHouseholdDraftMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, isConfirmed: true } : m))
    );
  };

  const handleRelationshipSelect = (rel: string) => {
    setEditorRelationship(rel);
    if (!editingMemberId) {
      if (rel === 'Conjoint') {
        setEditorPhotoUrl('/src/assets/images/portrait_husband_father_1791972720059.jpg');
      } else if (rel === 'Fils' || rel === 'Enfant') {
        setEditorPhotoUrl('/src/assets/images/portrait_amine_son_1791972720121.jpg');
      } else if (rel === 'Fille' || rel === 'Simple One') {
        setEditorPhotoUrl('/src/assets/images/portrait_yasmine_teen_1791972719154.jpg');
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditorPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCoverImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMember = () => {
    const trimmedName = editorFirstName.trim();
    if (!trimmedName) {
      setEditorError('Veuillez renseigner un prénom.');
      return;
    }

    if (editingMemberId) {
      setHouseholdDraftMembers((prev) =>
        prev.map((m) =>
          m.id === editingMemberId
            ? {
                ...m,
                firstName: trimmedName,
                relationship: m.isSelf ? 'Vous' : editorRelationship,
                photoUrl: editorPhotoUrl,
                isConfirmed: true,
              }
            : m
        )
      );
    } else {
      const newMember: HouseholdDraftMember = {
        id: `draft-member-${Date.now()}`,
        firstName: trimmedName,
        relationship: editorRelationship,
        photoUrl: editorPhotoUrl,
        isConfirmed: true,
      };
      setHouseholdDraftMembers((prev) => [...prev, newMember]);
    }

    setIsEditorOpen(false);
    setEditorError('');
  };

  const handleDeleteMember = () => {
    if (!editingMemberId) return;
    const target = householdDraftMembers.find((m) => m.id === editingMemberId);
    if (!target || target.isSelf || target.isSuggestedSimpleOne) return;
    setHouseholdDraftMembers((prev) => prev.filter((m) => m.id !== editingMemberId));
    setIsEditorOpen(false);
  };

  const handleContinueStep1 = () => {
    setHouseholdDraftMembers((prev) =>
      prev.map((m) => (m.isSuggestedSimpleOne ? { ...m, isConfirmed: true } : m))
    );
    setPersonalizationStep(2);
  };

  const handleCreateFoyerSpace = () => {
    const finalSpaceName = spaceNameInput.trim() || 'Notre foyer';
    completeHouseholdPersonalization(finalSpaceName, coverImageUrl);
    navigateTo('C1_HUB', {
      hubTab: 'MON_ESPACE',
      monEspaceSubTab: 'FOYER',
    });
  };

  const editingMemberObj = editingMemberId
    ? householdDraftMembers.find((m) => m.id === editingMemberId)
    : null;

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
      <MobileHeader
        title="Personnaliser mon foyer"
        onBack={() => {
          if (personalizationStep === 2) {
            setPersonalizationStep(1);
          } else {
            navigateTo('C1_HUB', {
              hubTab: 'MON_ESPACE',
              monEspaceSubTab: 'FOYER',
            });
          }
        }}
      />

      {/* Progress Indicator */}
      <div className="px-5 pt-1 pb-2">
        <div className="flex items-center justify-between text-[12px] font-semibold text-[#6B6380] mb-1.5">
          <span>Simple Foyer</span>
          <span className="font-bold text-[#8000EB]">
            {personalizationStep === 1 ? 'Étape 1 sur 2' : 'Étape 2 sur 2'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-1.5 rounded-full bg-[#8000EB]" />
          <div
            className={`h-1.5 rounded-full transition-colors ${
              personalizationStep === 2 ? 'bg-[#8000EB]' : 'bg-[#E5DFF5]'
            }`}
          />
        </div>
      </div>

      {personalizationStep === 1 ? (
        /* ================================================================== */
        /* STEP 1 SUR 2: FAMILY MEMBERS & PORTRAITS                           */
        /* ================================================================== */
        <div className="px-5 pt-2 pb-4 flex-1 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-[20px] font-bold text-[#290764] leading-snug tracking-tight">
                Les personnes qui comptent pour vous
              </h2>
              <p className="text-[13px] text-[#6B6380] leading-relaxed">
                Ajoutez vos proches pour créer un espace qui vous ressemble.
              </p>
            </div>

            {/* Two-Column Portrait Grid */}
            <div className="grid grid-cols-2 gap-3.5 pt-1">
              {householdDraftMembers.map((member) => {
                const isUnconfirmedSuggestion =
                  member.isSuggestedSimpleOne && !member.isConfirmed;

                return (
                  <div
                    key={member.id}
                    onClick={() => openEditMemberSheet(member)}
                    className={`rounded-[24px] bg-white p-4 flex flex-col items-center text-center transition-all cursor-pointer border ${
                      isUnconfirmedSuggestion
                        ? 'border-dashed border-[#C7B2F8] bg-[#FDFBFF]'
                        : 'border-[#EFEBF8] shadow-[0_4px_14px_rgba(20,17,31,0.03)] hover:border-[#D5C2FA]'
                    }`}
                  >
                    {/* Large Circular Member Portrait */}
                    <div className="relative mb-2.5">
                      <div className="w-[76px] h-[76px] rounded-full overflow-hidden bg-[#F3EBFF] border-2 border-white shadow-[0_4px_12px_rgba(41,7,100,0.08)] flex items-center justify-center">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.firstName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#F3EBFF] text-[#8000EB] flex flex-col items-center justify-center">
                            <User size={28} strokeWidth={2} />
                          </div>
                        )}
                      </div>

                      {/* Small Discreet Photo-Edit Affordance */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditMemberSheet(member);
                        }}
                        aria-label={`Modifier ${member.firstName}`}
                        className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white border border-[#E5D9FC] text-[#8000EB] flex items-center justify-center shadow-2xs hover:bg-[#F5F1FF]"
                      >
                        <Camera size={12} strokeWidth={2.3} />
                      </button>
                    </div>

                    {/* Name & Relationship */}
                    <p className="text-[15px] font-bold text-[#290764] leading-tight truncate max-w-full">
                      {member.firstName}
                    </p>
                    <p className="text-[12px] font-medium text-[#7D7693] mt-0.5 truncate max-w-full">
                      {member.relationship}
                    </p>

                    {/* Suggested Simple One Confirmation Affordance */}
                    {member.isSuggestedSimpleOne && (
                      isUnconfirmedSuggestion ? (
                        <button
                          type="button"
                          onClick={(e) => handleConfirmSuggestedMember(member.id, e)}
                          className="mt-2 px-3 py-1 rounded-full bg-[#F3EBFF] text-[#8000EB] text-[11px] font-semibold hover:bg-[#E7D8FF] transition-colors flex items-center gap-1"
                        >
                          <Check size={11} strokeWidth={2.6} />
                          <span>Confirmer</span>
                        </button>
                      ) : (
                        <span className="mt-2 px-2.5 py-0.5 rounded-full bg-[#E7F7F0] text-[#0F7B52] text-[10px] font-semibold flex items-center gap-1">
                          <Check size={10} strokeWidth={2.6} />
                          <span>Confirmé</span>
                        </span>
                      )
                    )}
                  </div>
                );
              })}

              {/* Single Add Member Slot */}
              <button
                type="button"
                onClick={() => openAddMemberSheet('Conjoint')}
                className="rounded-[24px] bg-white/80 hover:bg-white p-4 border border-dashed border-[#D5C5F7] flex flex-col items-center justify-center text-center min-h-[154px] transition-all active:scale-[0.99]"
              >
                <div className="w-[68px] h-[68px] rounded-full bg-[#F5F1FF] text-[#8000EB] flex items-center justify-center mb-2.5">
                  <Plus size={24} strokeWidth={2.2} />
                </div>
                <span className="text-[14px] font-semibold text-[#290764]">
                  Ajouter un membre
                </span>
                <span className="text-[11px] text-[#7D7693] mt-0.5">
                  Conjoint, enfant…
                </span>
              </button>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleContinueStep1}
              className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
            >
              <span>Continuer</span>
              <ArrowRight size={16} strokeWidth={2.3} />
            </button>
          </div>
        </div>
      ) : (
        /* ================================================================== */
        /* STEP 2 SUR 2: FAMILY COVER & SPACE NAME                            */
        /* ================================================================== */
        <div className="px-5 pt-2 pb-4 flex-1 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-[20px] font-bold text-[#290764] leading-snug tracking-tight">
                Un espace à votre image
              </h2>
              <p className="text-[13px] text-[#6B6380] leading-relaxed">
                Choisissez une image qui représente votre famille.
              </p>
            </div>

            {/* Cover + Preview + Space Name Card */}
            <section className="card-simple p-4 space-y-4">
              {/* Family Cover Image */}
              <div className="space-y-2.5">
                <div className="relative w-full h-[160px] rounded-[20px] overflow-hidden bg-[#F5F2FA]">
                  <img
                    src={coverImageUrl}
                    alt="Photo de couverture du foyer"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center"
                  />
                  <label className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-xs text-[#290764] text-[12px] font-semibold shadow-sm hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5">
                    <Camera size={13} className="text-[#8000EB]" strokeWidth={2.3} />
                    <span>Changer l'image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {coverImageUrl !== DEFAULT_SUGGESTED_COVER && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImageUrl(DEFAULT_SUGGESTED_COVER);
                      }}
                      className="text-[11px] font-semibold text-[#8000EB] hover:text-[#290764] transition-colors"
                    >
                      Rétablir l'image suggérée
                    </button>
                  </div>
                )}
              </div>

              {/* Family Preview — Compact Horizontal Row of Selected Members */}
              <div className="pt-1 border-t border-[#F3EFFA]">
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                  {householdDraftMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 pr-3 py-1.5 pl-1.5 rounded-full bg-[#FAF8FE] border border-[#EFEBF8] shrink-0"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#F3EBFF] flex items-center justify-center shrink-0">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt={member.firstName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={15} className="text-[#8000EB]" />
                        )}
                      </div>
                      <span className="text-[12px] font-bold text-[#290764]">
                        {member.firstName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Space Name Field */}
              <div className="space-y-1.5 pt-1 border-t border-[#F3EFFA]">
                <label className="text-[12px] font-bold text-[#290764] block">
                  Nom de votre espace
                </label>
                <input
                  type="text"
                  value={spaceNameInput}
                  onChange={(e) => setSpaceNameInput(e.target.value)}
                  placeholder="Notre foyer"
                  className="w-full h-11 px-4 rounded-[16px] bg-[#FAF8FE] border border-[#E4D8FC] text-[14px] font-semibold text-[#290764] placeholder:text-[#9A93B0] placeholder:font-normal focus:outline-none focus:border-[#8000EB]"
                />
              </div>
            </section>
          </div>

          {/* Step 2 CTAs */}
          <div className="pt-2 flex flex-col items-center gap-2.5">
            <button
              type="button"
              onClick={handleCreateFoyerSpace}
              className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
            >
              <span>
                {hasHouseholdSetup
                  ? 'Enregistrer les modifications'
                  : 'Créer mon espace Foyer'}
              </span>
              <ArrowRight size={16} strokeWidth={2.3} />
            </button>
            <button
              type="button"
              onClick={() => setPersonalizationStep(1)}
              className="py-1.5 px-4 text-[13px] font-medium text-[#7D7693] hover:text-[#290764] transition-colors"
            >
              Retour
            </button>
          </div>
        </div>
      )}

      {/* Compact Member Editor Bottom Sheet (Constrained inside mobile phone viewport) */}
      {isEditorOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#14111F]/45 backdrop-blur-[2px] flex items-end justify-center"
          onClick={() => setIsEditorOpen(false)}
        >
          <div
            className="w-full max-h-[86%] overflow-y-auto bg-white rounded-t-[24px] px-5 pt-3.5 pb-6 space-y-4 shadow-[0_-10px_30px_rgba(20,17,31,0.16)] border-t border-[#EFEBF8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-[#E3DDF2] mx-auto" />

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#8000EB] block">
                  Simple Foyer
                </span>
                <h3 className="text-[17px] font-bold text-[#290764] leading-snug">
                  {editingMemberId ? 'Modifier ce proche' : 'Ajouter un membre'}
                </h3>
              </div>
              {editingMemberObj &&
                !editingMemberObj.isSelf &&
                !editingMemberObj.isSuggestedSimpleOne && (
                  <button
                    type="button"
                    onClick={handleDeleteMember}
                    aria-label="Retirer ce membre"
                    className="p-2 rounded-full text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
            </div>

            <div className="space-y-3.5">
              {/* Field 1: Prénom */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-[#290764] block">
                  Prénom
                </label>
                <input
                  type="text"
                  value={editorFirstName}
                  onChange={(e) => {
                    setEditorFirstName(e.target.value);
                    if (editorError) setEditorError('');
                  }}
                  placeholder="Ex : Youssef, Amine…"
                  className="w-full h-11 px-4 rounded-[16px] bg-[#FAF8FE] border border-[#E4D8FC] text-[14px] font-semibold text-[#290764] placeholder:text-[#9A93B0] placeholder:font-normal focus:outline-none focus:border-[#8000EB]"
                />
                {editorError && (
                  <p className="text-[11px] font-semibold text-rose-600">
                    {editorError}
                  </p>
                )}
              </div>

              {/* Field 2: Lien familial */}
              {!editingMemberObj?.isSelf && (
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#290764] block">
                    Lien familial
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {RELATIONSHIP_OPTIONS.map((rel) => {
                      const isSelected = editorRelationship === rel;
                      return (
                        <button
                          key={rel}
                          type="button"
                          onClick={() => handleRelationshipSelect(rel)}
                          className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                            isSelected
                              ? 'bg-[#8000EB] text-white'
                              : 'bg-[#F5F1FF] text-[#4A4063] hover:bg-[#EAE2FF]'
                          }`}
                        >
                          {rel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Field 3: Photo de profil (facultatif) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-bold text-[#290764]">
                    Photo de profil <span className="font-normal text-[#7D7693]">(facultatif)</span>
                  </label>
                  <label className="text-[11px] font-semibold text-[#8000EB] hover:underline cursor-pointer flex items-center gap-1">
                    <Upload size={12} />
                    <span>Importer</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                  {/* Neutral Avatar Option */}
                  <button
                    type="button"
                    onClick={() => setEditorPhotoUrl(null)}
                    className={`flex flex-col items-center gap-1 shrink-0 p-1.5 rounded-[16px] border transition-all ${
                      editorPhotoUrl === null
                        ? 'border-[#8000EB] bg-[#F5F1FF]'
                        : 'border-transparent hover:bg-[#FAF8FE]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#F3EBFF] text-[#8000EB] flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <span className="text-[10px] font-semibold text-[#6B6380]">
                      Neutre
                    </span>
                  </button>

                  {/* Illustrative Portraits */}
                  {ILLUSTRATIVE_PORTRAITS.map((p) => {
                    const isSelected = editorPhotoUrl === p.url;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setEditorPhotoUrl(p.url)}
                        className={`flex flex-col items-center gap-1 shrink-0 p-1.5 rounded-[16px] border transition-all ${
                          isSelected
                            ? 'border-[#8000EB] bg-[#F5F1FF]'
                            : 'border-transparent hover:bg-[#FAF8FE]'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F3EBFF]">
                          <img
                            src={p.url}
                            alt={p.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-[#6B6380]">
                          {p.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Editor Actions */}
            <div className="pt-1 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={handleSaveMember}
                className="w-full h-11 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span>{editingMemberId ? 'Enregistrer' : 'Ajouter'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="py-1 text-[12px] font-semibold text-[#7D7693] hover:text-[#290764] transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. ESPACE FOYER DASHBOARD (REQUIREMENT 8)
// ============================================================================

export const HouseholdSpaceScreen: React.FC = () => {
  const {
    householdName,
    sharedExpenses,
    splitRequests,
    settleSplitRequest,
    navigateTo,
  } = usePFM();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const pendingRequests = splitRequests.filter((r) => r.status === 'PENDING');

  const familyCategories = [
    {
      id: 'Courses',
      label: 'Courses',
      amount: 2600,
      budget: 3200,
      pct: 55,
      color: '#5E1DF0',
      bgLight: '#F3EDFF',
    },
    {
      id: 'Factures',
      label: 'Factures',
      amount: 1350,
      budget: 1800,
      pct: 29,
      color: '#10B981',
      bgLight: '#ECFEF6',
    },
    {
      id: 'Loisirs',
      label: 'Loisirs',
      amount: 780,
      budget: 1200,
      pct: 16,
      color: '#F59E0B',
      bgLight: '#FEF3C7',
    },
  ];

  const familyOctoberTransactions = [
    {
      id: 'fam-tx-1',
      title: 'Marjane Californie',
      category: 'Courses',
      member: 'Lamia',
      date: '16 oct.',
      amount: 1150,
    },
    {
      id: 'fam-tx-2',
      title: 'Carrefour Market Anfa',
      category: 'Courses',
      member: 'Karim',
      date: '11 oct.',
      amount: 890,
    },
    {
      id: 'fam-tx-3',
      title: 'Lydec · Eau & Électricité',
      category: 'Factures',
      member: 'Karim',
      date: '08 oct.',
      amount: 950,
    },
    {
      id: 'fam-tx-4',
      title: 'Marché Frais & Primeurs',
      category: 'Courses',
      member: 'Lamia',
      date: '06 oct.',
      amount: 560,
    },
    {
      id: 'fam-tx-5',
      title: 'Sortie Cinéma & Dîner Famille',
      category: 'Loisirs',
      member: 'Lamia',
      date: '05 oct.',
      amount: 480,
    },
    {
      id: 'fam-tx-6',
      title: 'Orange Fibre Maison',
      category: 'Factures',
      member: 'Lamia',
      date: '03 oct.',
      amount: 400,
    },
    {
      id: 'fam-tx-7',
      title: 'Parc Sindibad & Activités',
      category: 'Loisirs',
      member: 'Karim',
      date: '01 oct.',
      amount: 300,
    },
  ];

  const filteredTransactions =
    selectedCategory === 'ALL'
      ? familyOctoberTransactions
      : familyOctoberTransactions.filter(
          (tx) => tx.category === selectedCategory
        );

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
      <MobileHeader
        title="Nos dépenses"
        subtitle={`${householdName || 'Notre foyer'} · Analyse d'octobre`}
        onBack={() =>
          navigateTo('C1_HUB', {
            hubTab: 'MON_ESPACE',
            monEspaceSubTab: 'FOYER',
          })
        }
      />

      <div className="p-5 space-y-4 flex-1">
        {/* 1. Main Family Spending Summary Card */}
        <section className="card-simple p-5 space-y-4 border-2 border-[#E4D8FC] bg-linear-to-b from-white via-white to-[#FAF7FF]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E1DF0] block">
                Dépenses familiales · Octobre
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-[32px] font-black text-[#14111F] tracking-tight leading-none tabular-nums">
                  4 730
                </span>
                <span className="text-[16px] font-extrabold text-[#5E1DF0]">
                  DH
                </span>
              </div>
              <p className="text-[12px] font-medium text-[#6F6A82] mt-1">
                Sur un budget familial de 6 200 DH (reste 1 470 DH)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#F3EDFF] text-[#5E1DF0] text-[11px] font-bold">
              Octobre
            </span>
          </div>

          {/* Stacked visual breakdown bar */}
          <div className="w-full h-3 rounded-full bg-[#EFEBF8] overflow-hidden flex gap-0.5 p-0.5">
            {familyCategories.map((cat) => (
              <div
                key={cat.id}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
                style={{
                  width: `${cat.pct}%`,
                  backgroundColor: cat.color,
                }}
              />
            ))}
          </div>

          {/* Interactive Category Breakdown */}
          <div className="space-y-2">
            {familyCategories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(isSelected ? 'ALL' : cat.id)
                  }
                  className={`w-full p-3 rounded-[16px] border text-left transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#F5F1FF] border-[#5E1DF0] ring-2 ring-[#5E1DF0]/10'
                      : 'bg-white border-[#EFEBF8] hover:bg-[#FAF8FE]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div>
                      <p className="text-[13px] font-extrabold text-[#14111F]">
                        {cat.label}
                      </p>
                      <p className="text-[11px] font-medium text-[#6F6A82]">
                        Budget : {cat.amount.toLocaleString('fr-FR')} /{' '}
                        {cat.budget.toLocaleString('fr-FR')} DH
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-extrabold text-[#14111F] tabular-nums">
                      {cat.amount.toLocaleString('fr-FR')} DH
                    </p>
                    <span className="text-[11px] font-bold text-[#5E1DF0]">
                      {cat.pct} % du total
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Contextual insight */}
          <div className="p-3 rounded-[14px] bg-[#F3EDFF]/80 border border-[#E4D8FC] flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#5E1DF0] shrink-0" />
            <p className="text-[12px] font-bold text-[#2E1065] leading-snug">
              Les courses représentent 55 % de vos dépenses familiales.
            </p>
          </div>
        </section>

        {/* 2. October Family Transactions List */}
        <section className="card-simple p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-extrabold text-[#14111F]">
                Détail des dépenses familiales
              </h3>
              <p className="text-[11px] text-[#7D7693]">
                {selectedCategory === 'ALL'
                  ? 'Toutes les catégories (7 opérations)'
                  : `Catégorie : ${selectedCategory}`}
              </p>
            </div>
            {selectedCategory !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className="text-[11px] font-bold text-[#5E1DF0] hover:underline"
              >
                Tout afficher
              </button>
            )}
          </div>

          <div className="divide-y divide-[#F3EFFA]">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                    {tx.category === 'Courses' ? (
                      <ShoppingCart size={16} />
                    ) : tx.category === 'Factures' ? (
                      <Zap size={16} />
                    ) : (
                      <Wifi size={16} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#14111F] truncate">
                      {tx.title}
                    </p>
                    <p className="text-[11px] text-[#7D7693] mt-0.5">
                      {tx.category} · Payé par {tx.member} · {tx.date}
                    </p>
                  </div>
                </div>
                <span className="text-[13px] font-extrabold text-[#14111F] tabular-nums shrink-0">
                  -{tx.amount.toLocaleString('fr-FR')} DH
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Pending Reimbursements Card */}
        {pendingRequests.length > 0 && (
          <section className="card-simple p-5 space-y-3.5 border-2 border-[#E2D6FF]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-[#14111F]">
                    Remboursement en attente
                  </h3>
                  <p className="text-[11px] text-[#7D7693]">
                    {pendingRequests.length} demande{pendingRequests.length > 1 ? 's' : ''} en cours
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#FFF3E2] text-[#D97706] text-xs font-extrabold">
                En attente
              </span>
            </div>

            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-[20px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-[13px] font-bold text-[#14111F]">
                    {req.title}
                  </p>
                  <p className="text-[11px] text-[#7D7693] mt-0.5">
                    Part demandée : <strong>{formatDH(req.amountRequested)}</strong> · {req.recipientName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => settleSplitRequest(req.id)}
                  className="px-3.5 py-2 rounded-full bg-[#5E1DF0] text-white text-xs font-bold hover:brightness-105 active:scale-95 transition-all whitespace-nowrap shadow-2xs"
                >
                  Marquer reçu
                </button>
              </div>
            ))}
          </section>
        )}

        {/* Shared Expenses List */}
        <section className="card-simple p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-extrabold text-[#14111F]">
              Opérations partagées ({sharedExpenses.length})
            </h3>
            <button
              type="button"
              onClick={() =>
                navigateTo('J2_HOUSEHOLD_SPLIT', { transactionId: 'NEW_SPLIT' })
              }
              className="text-xs font-bold text-[#5E1DF0] hover:underline flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Partager une dépense</span>
            </button>
          </div>

          {sharedExpenses.length === 0 ? (
            <p className="text-xs text-[#7D7693] py-2 text-center">
              Aucune dépense partagée pour le moment.
            </p>
          ) : (
            <div className="divide-y divide-[#F3EFFA]">
              {sharedExpenses.map((exp) => (
                <button
                  key={exp.id}
                  type="button"
                  onClick={() =>
                    navigateTo('J2_HOUSEHOLD_SPLIT', { transactionId: exp.id })
                  }
                  className="w-full py-3 flex items-center justify-between gap-3 text-left hover:bg-[#FAF8FE] rounded-[14px] px-1.5 -mx-1.5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                      {exp.category === 'Courses' ? (
                        <ShoppingCart size={17} />
                      ) : exp.title.includes('Lydec') ? (
                        <Zap size={17} />
                      ) : (
                        <Wifi size={17} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#14111F] truncate">
                        {exp.title}
                      </p>
                      <p className="text-[11px] text-[#7D7693] mt-0.5">
                        Votre part : {formatDH(exp.shareLamia)} · {exp.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-[14px] font-extrabold text-[#14111F] tabular-nums">
                        {formatDH(exp.totalAmount)}
                      </p>
                      <span
                        className={`text-[11px] font-bold block mt-0.5 ${
                          exp.status === 'SETTLED' || exp.status === 'REIMBURSED'
                            ? 'text-[#0F7B52]'
                            : 'text-[#D97706]'
                        }`}
                      >
                        {exp.status === 'SETTLED'
                          ? 'Réglé'
                          : exp.status === 'REIMBURSED'
                          ? 'Remboursé'
                          : 'À recevoir : ' + formatDH(exp.shareOther)}
                      </span>
                    </div>
                    <ChevronRight size={15} className="text-[#8E87A6]" />
                  </div>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              navigateTo('J2_HOUSEHOLD_SPLIT', { transactionId: 'NEW_SPLIT' })
            }
            className="w-full h-11 rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#E5DCFF] transition-colors"
          >
            <Plus size={15} />
            <span>Partager une dépense</span>
          </button>
        </section>
      </div>

      <BottomBankingNav />
    </div>
  );
};

// ============================================================================
// 4. FAMILY BUDGETS DETAIL SCREEN (J4_FAMILY_BUDGETS & J5_FAMILY_BUDGET_DETAIL)
// ============================================================================

const FAMILY_OCTOBER_SPENT_BY_CATEGORY: Record<string, number> = {
  Courses: 2600,
  Factures: 1350,
  Loisirs: 780,
  Shopping: 0,
  Transport: 0,
  Autres: 0,
};

const FAMILY_OCTOBER_TRANSACTIONS_BY_CATEGORY: Record<
  string,
  { id: string; title: string; member: string; date: string; amount: number }[]
> = {
  Courses: [
    {
      id: 'fam-b-tx-1',
      title: 'Marjane Californie',
      member: 'Lamia',
      date: '16 oct. 2026',
      amount: 1150,
    },
    {
      id: 'fam-b-tx-2',
      title: 'Carrefour Market Anfa',
      member: 'Karim',
      date: '11 oct. 2026',
      amount: 890,
    },
    {
      id: 'fam-b-tx-3',
      title: 'Marché Frais & Primeurs',
      member: 'Lamia',
      date: '06 oct. 2026',
      amount: 560,
    },
  ],
  Factures: [
    {
      id: 'fam-b-tx-4',
      title: 'Lydec · Eau & Électricité',
      member: 'Karim',
      date: '08 oct. 2026',
      amount: 950,
    },
    {
      id: 'fam-b-tx-5',
      title: 'Orange Fibre Maison',
      member: 'Lamia',
      date: '03 oct. 2026',
      amount: 400,
    },
  ],
  Loisirs: [
    {
      id: 'fam-b-tx-6',
      title: 'Sortie Cinéma & Dîner Famille',
      member: 'Lamia',
      date: '05 oct. 2026',
      amount: 480,
    },
    {
      id: 'fam-b-tx-7',
      title: 'Parc Sindibad & Activités',
      member: 'Karim',
      date: '01 oct. 2026',
      amount: 300,
    },
  ],
};

export const FamilyBudgetsScreen: React.FC = () => {
  const {
    budgets,
    createOrUpdateBudget,
    toggleBudgetTrackingStatus,
    deleteCategoryBudget,
    showToast,
    navigateTo,
  } = usePFM();

  const [openMenuCategory, setOpenMenuCategory] =
    useState<SpendingCategory | null>(null);
  const [editingCategory, setEditingCategory] =
    useState<SpendingCategory | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<number>(3200);
  const [deleteConfirmCat, setDeleteConfirmCat] =
    useState<SpendingCategory | null>(null);

  // Build ordered list of family budgets (Courses, Factures, Loisirs + any additional FOYER budgets)
  const coreOrder: SpendingCategory[] = ['Courses', 'Factures', 'Loisirs'];
  const defaultLimits: Record<string, number> = {
    Courses: 3200,
    Factures: 1800,
    Loisirs: 1200,
  };

  const foyerBudgetEntries = Object.values(budgets).filter(
    (b) => b.scope === 'FOYER'
  );

  const orderedCategories: SpendingCategory[] = [
    ...coreOrder.filter(
      (cat) =>
        Boolean(budgets[`${cat}_FOYER`]) || foyerBudgetEntries.length === 0
    ),
    ...foyerBudgetEntries
      .map((b) => b.category)
      .filter((cat) => !coreOrder.includes(cat)),
  ];

  const familyBudgetCards = orderedCategories.map((category) => {
    const stored = budgets[`${category}_FOYER`];
    const limit = stored?.limit ?? defaultLimits[category] ?? 1500;
    const spent = FAMILY_OCTOBER_SPENT_BY_CATEGORY[category] ?? 0;
    const remaining = Math.max(0, limit - spent);
    const pct =
      limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
    const isStopped = stored?.status === 'STOPPED';
    const needsWatch = !isStopped && pct >= 80;

    return {
      category,
      spent,
      limit,
      remaining,
      pct,
      needsWatch,
      isStopped,
    };
  });

  const totalSpent = familyBudgetCards.reduce((s, b) => s + b.spent, 0);
  const totalLimit = familyBudgetCards.reduce((s, b) => s + b.limit, 0);
  const totalRemaining = Math.max(0, totalLimit - totalSpent);
  const totalPct =
    totalLimit > 0
      ? Math.min(100, Math.round((totalSpent / totalLimit) * 100))
      : 0;

  const openQuickEdit = (cat: SpendingCategory, currentLimit: number) => {
    setOpenMenuCategory(null);
    setEditingCategory(cat);
    setEditLimitValue(currentLimit);
  };

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
      {/* 1. HEADER */}
      <MobileHeader
        title="Budgets de ma famille"
        subtitle={`Octobre 2026 · ${familyBudgetCards.length} enveloppe${
          familyBudgetCards.length > 1 ? 's' : ''
        }`}
        onBack={() =>
          navigateTo('C1_HUB', {
            hubTab: 'MON_ESPACE',
            monEspaceSubTab: 'FOYER',
          })
        }
      />

      <div className="px-5 pt-2 pb-6 space-y-4 flex-1">
        {/* 2. GLOBAL SUMMARY — Compact white card */}
        <section className="card-simple p-5 space-y-3">
          <div>
            <span className="text-[12px] font-medium text-[#7D7693] block">
              Marge totale restante
            </span>
            <div className="flex items-baseline justify-between gap-2 mt-1">
              <span className="text-[30px] font-extrabold text-[#0F7B52] tabular-nums leading-none tracking-tight">
                {formatDH(totalRemaining)}
              </span>
              <span className="text-[12.5px] font-extrabold text-[#5E1DF0] tabular-nums">
                {totalPct} %
              </span>
            </div>
            <p className="text-[12.5px] font-medium text-[#7D7693] mt-1.5 tabular-nums">
              {formatDH(totalSpent)} utilisés sur {formatDH(totalLimit)}
            </p>
          </div>

          <div className="w-full h-2.5 bg-[#EFEAFF] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8000EB] rounded-full transition-all duration-300"
              style={{ width: `${totalPct}%` }}
            />
          </div>
        </section>

        {/* 3. FAMILY BUDGET CARDS SECTION */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-[16px] font-extrabold text-[#14111F]">
              Nos enveloppes
            </h2>
            <button
              type="button"
              onClick={() =>
                navigateTo('E1_CREATE_BUDGET', {
                  category: 'Shopping',
                  budgetScope: 'FOYER',
                  budgetOrigin: 'STANDARD',
                })
              }
              className="inline-flex items-center gap-1 text-[13px] font-extrabold text-[#8000EB] hover:text-[#6800BF] transition-colors"
            >
              <span>+ Ajouter</span>
            </button>
          </div>

          <div className="space-y-3">
            {familyBudgetCards.map((bCard) => {
              const isMenuOpen = openMenuCategory === bCard.category;

              return (
                <section
                  key={bCard.category}
                  className="card-simple p-4 space-y-3 relative"
                >
                  {/* Top Row: Category Icon + Name + Amber Indicator vs Remaining + 3-dot Menu */}
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigateTo('J5_FAMILY_BUDGET_DETAIL', {
                          category: bCard.category,
                          budgetScope: 'FOYER',
                        })
                      }
                      className="flex items-start gap-3 min-w-0 text-left flex-1"
                    >
                      <CategoryIcon category={bCard.category} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-[15.5px] font-extrabold text-[#14111F] leading-snug">
                            {bCard.category}
                          </h3>
                          {bCard.needsWatch && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-[10.5px] font-bold leading-tight shrink-0">
                              À surveiller
                            </span>
                          )}
                          {bCard.isStopped && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#F2EFF9] text-[#6E6785] text-[10.5px] font-bold leading-tight shrink-0">
                              En pause
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] font-extrabold text-[#0F7B52] mt-0.5 tabular-nums">
                          {formatDH(bCard.remaining)} restants
                        </p>
                      </div>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[13px] font-extrabold text-[#5E1DF0] tabular-nums">
                        {bCard.pct} %
                      </span>

                      <div className="relative">
                        <button
                          type="button"
                          aria-label={`Options du budget ${bCard.category}`}
                          onClick={() =>
                            setOpenMenuCategory((prev) =>
                              prev === bCard.category ? null : bCard.category
                            )
                          }
                          className="w-8 h-8 rounded-full hover:bg-[#F5F1FF] text-[#6E6785] hover:text-[#290764] flex items-center justify-center transition-colors"
                        >
                          <MoreHorizontal size={17} />
                        </button>

                        {isMenuOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setOpenMenuCategory(null)}
                            />
                            <div className="absolute right-0 mt-1 w-52 rounded-[20px] bg-white border border-[#EFEBF8] shadow-[0_14px_32px_rgba(20,17,31,0.14)] py-1.5 z-30 divide-y divide-[#F5F2FA]">
                              <button
                                type="button"
                                onClick={() =>
                                  openQuickEdit(bCard.category, bCard.limit)
                                }
                                className="w-full px-3.5 py-2.5 text-left text-[13px] font-bold text-[#290764] hover:bg-[#FAF8FE] flex items-center gap-2.5 transition-colors"
                              >
                                <SlidersHorizontal
                                  size={15}
                                  className="text-[#8000EB] shrink-0"
                                />
                                <span>Modifier le plafond</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuCategory(null);
                                  toggleBudgetTrackingStatus(
                                    bCard.category,
                                    bCard.isStopped ? 'ACTIVE' : 'STOPPED',
                                    'FOYER'
                                  );
                                  showToast(
                                    bCard.isStopped
                                      ? `Suivi ${bCard.category} réactivé`
                                      : `Suivi ${bCard.category} mis en pause`,
                                    'Vos budgets familiaux ont été mis à jour.'
                                  );
                                }}
                                className="w-full px-3.5 py-2.5 text-left text-[13px] font-bold text-[#290764] hover:bg-[#FAF8FE] flex items-center gap-2.5 transition-colors"
                              >
                                <PauseCircle
                                  size={15}
                                  className="text-[#6E6785] shrink-0"
                                />
                                <span>
                                  {bCard.isStopped
                                    ? 'Réactiver le suivi'
                                    : 'Mettre en pause'}
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuCategory(null);
                                  setDeleteConfirmCat(bCard.category);
                                }}
                                className="w-full px-3.5 py-2.5 text-left text-[13px] font-bold text-[#DC2626] hover:bg-[#FFF5F5] flex items-center gap-2.5 transition-colors"
                              >
                                <Trash2
                                  size={15}
                                  className="text-[#DC2626] shrink-0"
                                />
                                <span>Supprimer</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-[#EFEAFF] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        bCard.isStopped
                          ? 'bg-[#B8B0CC]'
                          : bCard.needsWatch
                          ? 'bg-[#F59E0B]'
                          : 'bg-[#8000EB]'
                      }`}
                      style={{ width: `${bCard.pct}%` }}
                    />
                  </div>

                  {/* Bottom Row: Spent / Limit + Detail / Adjust link */}
                  <div className="flex items-center justify-between gap-2 text-[12px] pt-0.5">
                    <span className="font-medium text-[#7D7693] tabular-nums">
                      <strong className="font-extrabold text-[#14111F]">
                        {formatDH(bCard.spent)}
                      </strong>{' '}
                      / {formatDH(bCard.limit)}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        navigateTo('J5_FAMILY_BUDGET_DETAIL', {
                          category: bCard.category,
                          budgetScope: 'FOYER',
                        })
                      }
                      className="inline-flex items-center gap-1 text-[12.5px] font-extrabold text-[#8000EB] hover:text-[#6800BF] transition-colors"
                    >
                      <span>Voir le détail</span>
                      <ChevronRight size={14} strokeWidth={2.4} />
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* 4. COACH INSIGHT CARD */}
        <section className="rounded-[20px] bg-[#FAF8FE] border border-[#EFEBF8] px-4 py-3.5 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-bold text-[#14111F] leading-tight">
              Constat de votre coach
            </p>
            <p className="text-[12px] text-[#7D7693] mt-0.5 leading-relaxed">
              L'enveloppe <strong className="text-[#14111F]">Courses</strong> atteint 81 % ce mois-ci. Il vous reste <strong className="text-[#0F7B52]">600 DH</strong> pour terminer le mois dans votre budget familial.
            </p>
          </div>
        </section>
      </div>

      {/* Quick Edit Limit Bottom Sheet */}
      {editingCategory && (
        <div
          className="fixed inset-0 z-50 bg-[#14111F]/45 backdrop-blur-[2px] flex items-end justify-center"
          onClick={() => setEditingCategory(null)}
        >
          <div
            className="w-full bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t border-[#EFEBF8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 rounded-full bg-[#E3DDF2] mx-auto" />
            <div className="flex items-center gap-3">
              <CategoryIcon category={editingCategory} size="md" />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8000EB] block">
                  Budget familial
                </span>
                <h3 className="text-[17px] font-extrabold text-[#14111F]">
                  Modifier l'enveloppe {editingCategory}
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-[20px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  setEditLimitValue((v) => Math.max(400, v - 100))
                }
                className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#8000EB] text-lg font-extrabold hover:bg-[#E5DCFF] transition-colors"
              >
                −
              </button>
              <div className="text-center">
                <span className="text-[26px] font-extrabold text-[#14111F] tabular-nums block leading-none">
                  {formatDH(editLimitValue)}
                </span>
                <span className="text-[11.5px] font-medium text-[#7D7693] mt-1 block">
                  Plafond mensuel
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setEditLimitValue((v) => Math.min(8000, v + 100))
                }
                className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#8000EB] text-lg font-extrabold hover:bg-[#E5DCFF] transition-colors"
              >
                +
              </button>
            </div>

            <div className="pt-1 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  createOrUpdateBudget(
                    editingCategory,
                    editLimitValue,
                    80,
                    'FOYER'
                  );
                  showToast(
                    `Budget ${editingCategory} mis à jour`,
                    `Nouveau plafond familial fixé à ${formatDH(editLimitValue)}.`
                  );
                  setEditingCategory(null);
                }}
                className="w-full h-11 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[13.5px] font-bold transition-colors"
              >
                Enregistrer
              </button>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="py-1.5 text-[12.5px] font-bold text-[#7D7693] hover:text-[#14111F] transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Bottom Sheet */}
      {deleteConfirmCat && (
        <div
          className="fixed inset-0 z-50 bg-[#14111F]/45 backdrop-blur-[2px] flex items-end justify-center"
          onClick={() => setDeleteConfirmCat(null)}
        >
          <div
            className="w-full bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t border-[#EFEBF8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 rounded-full bg-[#E3DDF2] mx-auto" />
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="text-[16px] font-extrabold text-[#14111F]">
                  Supprimer l'enveloppe {deleteConfirmCat} ?
                </h3>
                <p className="text-[12.5px] text-[#7D7693] mt-1 leading-relaxed">
                  Cette enveloppe sera retirée de vos budgets familiaux. Les dépenses du foyer restent conservées.
                </p>
              </div>
            </div>
            <div className="pt-1 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = deleteConfirmCat;
                  setDeleteConfirmCat(null);
                  deleteCategoryBudget(target, 'FOYER');
                  showToast(
                    `Budget ${target} supprimé`,
                    'Vos dépenses familiales restent intactes.'
                  );
                }}
                className="w-full h-11 rounded-full bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[13.5px] font-bold transition-colors"
              >
                Supprimer
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmCat(null)}
                className="py-1.5 text-[12.5px] font-bold text-[#7D7693] hover:text-[#14111F] transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomBankingNav />
    </div>
  );
};

export const FamilyBudgetDetailScreen: React.FC = () => {
  const { selectedCategory, budgets, navigateTo } = usePFM();

  const defaultLimits: Record<string, number> = {
    Courses: 3200,
    Factures: 1800,
    Loisirs: 1200,
  };

  const stored = budgets[`${selectedCategory}_FOYER`];
  const limit = stored?.limit ?? defaultLimits[selectedCategory] ?? 1500;
  const spent = FAMILY_OCTOBER_SPENT_BY_CATEGORY[selectedCategory] ?? 0;
  const remaining = Math.max(0, limit - spent);
  const pct =
    limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  const needsWatch = pct >= 80;
  const categoryTxs =
    FAMILY_OCTOBER_TRANSACTIONS_BY_CATEGORY[selectedCategory] || [];

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
      <MobileHeader
        title={`Budget ${selectedCategory}`}
        subtitle="Octobre 2026 · Budget de ma famille"
        onBack={() => navigateTo('J4_FAMILY_BUDGETS')}
      />

      <div className="px-5 pt-2 pb-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Top Summary Card */}
          <section className="card-simple p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CategoryIcon category={selectedCategory} size="lg" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[18px] font-extrabold text-[#14111F]">
                      {selectedCategory}
                    </h2>
                    {needsWatch && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] text-[10.5px] font-bold">
                        À surveiller
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#7D7693] mt-0.5">
                    Enveloppe mensuelle du foyer
                  </p>
                </div>
              </div>
              <span className="text-[14px] font-extrabold text-[#5E1DF0] tabular-nums">
                {pct} %
              </span>
            </div>

            <div>
              <span className="text-[12px] font-medium text-[#7D7693] block">
                Marge restante
              </span>
              <span className="text-[28px] font-extrabold text-[#0F7B52] tabular-nums leading-none tracking-tight mt-1 block">
                {formatDH(remaining)} restants
              </span>
              <p className="text-[12.5px] text-[#7D7693] mt-1.5 tabular-nums">
                {formatDH(spent)} utilisés sur {formatDH(limit)}
              </p>
            </div>

            <div className="w-full h-2.5 bg-[#EFEAFF] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  needsWatch ? 'bg-[#F59E0B]' : 'bg-[#8000EB]'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </section>

          {/* Category Transactions in October */}
          <section className="card-simple p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-extrabold text-[#14111F]">
                Dépenses {selectedCategory} en octobre
              </h3>
              <span className="text-[11.5px] font-semibold text-[#7D7693]">
                {categoryTxs.length} opération{categoryTxs.length > 1 ? 's' : ''}
              </span>
            </div>

            {categoryTxs.length === 0 ? (
              <p className="text-[12.5px] text-[#7D7693] py-2">
                Aucune dépense enregistrée sur cette enveloppe ce mois-ci.
              </p>
            ) : (
              <div className="divide-y divide-[#F3EFFA]">
                {categoryTxs.map((tx) => (
                  <div
                    key={tx.id}
                    className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <CategoryIcon category={selectedCategory} size="sm" />
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-bold text-[#14111F] truncate">
                          {tx.title}
                        </p>
                        <p className="text-[11.5px] text-[#7D7693] mt-0.5">
                          Payé par {tx.member} · {tx.date}
                        </p>
                      </div>
                    </div>
                    <span className="text-[13.5px] font-extrabold text-[#14111F] tabular-nums shrink-0">
                      −{formatDH(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <button
          type="button"
          onClick={() =>
            navigateTo('E1_CREATE_BUDGET', {
              category: selectedCategory,
              budgetScope: 'FOYER',
              budgetOrigin: 'STANDARD',
            })
          }
          className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <SlidersHorizontal size={16} />
          <span>Modifier ce budget familial</span>
        </button>
      </div>

      <BottomBankingNav />
    </div>
  );
};

// ============================================================================
// 5. HOUSEHOLD POCKET DETAIL SCREEN (J_POCKET_DETAIL)
// ============================================================================

export const HouseholdPocketDetailScreen: React.FC = () => {
  const {
    householdPockets,
    selectedPocketId,
    setSelectedPocketId,
    fundHouseholdPocket,
    goBack,
    navigateTo,
    showToast,
  } = usePFM();

  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('200');

  const pocket =
    householdPockets.find((p) => p.id === selectedPocketId) ||
    householdPockets[0];

  if (!pocket) return null;

  const isSimpleOne = pocket.roleLabel === 'Simple One';

  const handleFundConfirm = () => {
    const parsed = Number(fundAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    fundHouseholdPocket(pocket.id, parsed);
    setIsFundModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F3FA]">
      <MobileHeader
        title={`Pocket · ${pocket.memberName}`}
        subtitle={pocket.roleLabel}
        onBack={goBack}
      />

      <div className="flex-1 px-4 pt-3 pb-8 space-y-4">
        {/* Member selector tabs to quickly switch between family pockets */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {householdPockets.map((p) => {
            const active = p.id === pocket.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPocketId(p.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12.5px] font-bold transition-all shrink-0 border ${
                  active
                    ? 'bg-[#F3EDFF] border-[#8000EB] text-[#290764]'
                    : 'bg-white border-[#EFEBF8] text-[#7D7693] hover:text-[#14111F]'
                }`}
              >
                <img
                  src={p.avatarUrl}
                  alt={p.memberName}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span>{p.memberName}</span>
              </button>
            );
          })}
        </div>

        {/* Hero Pocket Balance Card */}
        <section className="card-simple p-5 space-y-4 border border-[#E4D8FC] bg-gradient-to-br from-white via-[#FDFBFF] to-[#F5EEFF]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F3EBFF] border-2 border-[#C9A4FF] shrink-0">
                <img
                  src={pocket.avatarUrl}
                  alt={pocket.memberName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#F2EDFF] text-[#8000EB] text-[10.5px] font-extrabold uppercase tracking-wide">
                  {pocket.roleLabel}
                </span>
                <h2 className="text-[18px] font-extrabold text-[#14111F] leading-tight mt-0.5 truncate">
                  Pocket de {pocket.memberName}
                </h2>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
              <Wallet size={20} strokeWidth={2.2} />
            </div>
          </div>

          <div className="pt-1">
            <span className="text-[12px] font-medium text-[#7D7693] block">
              Solde disponible
            </span>
            <span className="text-[32px] font-extrabold text-[#14111F] tabular-nums tracking-tight leading-none mt-1 block">
              {formatDH(pocket.balance)}
            </span>
          </div>

          {/* Card & Allowance info pills */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="rounded-[14px] bg-white/90 border border-[#EFEBF8] px-3 py-2">
              <span className="text-[10.5px] font-medium text-[#7D7693] block">
                Carte associée
              </span>
              <span className="text-[12.5px] font-extrabold text-[#14111F] tabular-nums mt-0.5 block">
                Simple {pocket.cardNumberMasked}
              </span>
            </div>
            <div className="rounded-[14px] bg-white/90 border border-[#EFEBF8] px-3 py-2">
              <span className="text-[10.5px] font-medium text-[#7D7693] block">
                {isSimpleOne ? 'Argent de poche' : 'Plafond mensuel'}
              </span>
              <span className="text-[12.5px] font-extrabold text-[#5E1DF0] tabular-nums mt-0.5 block">
                {isSimpleOne && pocket.monthlyAllowance
                  ? `${formatDH(pocket.monthlyAllowance)} / mois`
                  : pocket.spendingLimit
                  ? formatDH(pocket.spendingLimit)
                  : 'Illimité'}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setFundAmount(isSimpleOne ? '100' : '500');
                setIsFundModalOpen(true);
              }}
              className="flex-1 h-11 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
            >
              <Plus size={16} strokeWidth={2.4} />
              <span>
                {pocket.memberName === 'Lamia'
                  ? 'Alimenter mon pocket'
                  : `Envoyer à ${pocket.memberName}`}
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                showToast(
                  'RIB Pocket copié',
                  `${pocket.iban} copié dans le presse-papiers.`
                )
              }
              className="h-11 px-4 rounded-full bg-[#F3EDFF] hover:bg-[#E7DCFF] text-[#5E1DF0] text-[12.5px] font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <Copy size={14} />
              <span>RIB</span>
            </button>
          </div>
        </section>

        {/* Recent Pocket Operations */}
        <section className="card-simple p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15.5px] font-extrabold text-[#14111F]">
              Dernières opérations
            </h3>
            <span className="text-[11.5px] font-semibold text-[#7D7693]">
              Octobre 2026
            </span>
          </div>

          <div className="divide-y divide-[#F2EFFA]">
            {pocket.transactions.map((tx) => {
              const isCredit = tx.type === 'credit';
              return (
                <div
                  key={tx.id}
                  className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-[#E7F7F0] text-[#0F7B52]'
                          : 'bg-[#F5F1FF] text-[#5E1DF0]'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft size={17} strokeWidth={2.3} />
                      ) : (
                        <ArrowUpRight size={17} strokeWidth={2.3} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-bold text-[#14111F] truncate">
                        {tx.label}
                      </p>
                      <p className="text-[11.5px] text-[#7D7693] mt-0.5">
                        {tx.date}
                        {tx.category ? ` · ${tx.category}` : ''}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[13.5px] font-extrabold tabular-nums shrink-0 ${
                      isCredit ? 'text-[#0F7B52]' : 'text-[#14111F]'
                    }`}
                  >
                    {isCredit ? '+' : '−'}
                    {formatDH(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Back to Famille space */}
        <button
          type="button"
          onClick={() =>
            navigateTo('C1_HUB', {
              hubTab: 'MON_ESPACE',
              monEspaceSubTab: 'FOYER',
            })
          }
          className="w-full h-11 rounded-full bg-white border border-[#E4D8FC] text-[#5E1DF0] text-[13px] font-bold hover:bg-[#FAF8FE] transition-colors flex items-center justify-center gap-1.5"
        >
          <ArrowLeft size={15} />
          <span>Retour à l&apos;espace Famille</span>
        </button>
      </div>

      {/* Instant Fund Pocket Modal */}
      {isFundModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#14111F]/50 backdrop-blur-[2px] flex items-end justify-center p-0 sm:p-4">
          <div className="w-full max-w-[412px] bg-white rounded-t-[28px] sm:rounded-[28px] p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-extrabold text-[#14111F]">
                {pocket.memberName === 'Lamia'
                  ? 'Alimenter mon pocket'
                  : `Envoyer vers le pocket de ${pocket.memberName}`}
              </h3>
              <button
                type="button"
                onClick={() => setIsFundModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F5F3FA] text-[#7D7693] flex items-center justify-center"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#7D7693] block">
                Montant du virement instantané (DH)
              </label>
              <input
                type="number"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="w-full h-12 px-4 rounded-[16px] border border-[#DFD8F0] text-[18px] font-extrabold text-[#14111F] focus:outline-none focus:border-[#8000EB]"
              />
              <div className="flex items-center gap-2 pt-1">
                {[100, 200, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFundAmount(String(preset))}
                    className={`flex-1 py-1.5 rounded-full text-[12px] font-bold border transition-colors ${
                      Number(fundAmount) === preset
                        ? 'bg-[#F3EDFF] border-[#8000EB] text-[#5E1DF0]'
                        : 'bg-[#FAF8FE] border-[#EFEBF8] text-[#7D7693]'
                    }`}
                  >
                    +{preset} DH
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleFundConfirm}
              className="w-full h-12 rounded-full bg-[#8000EB] text-white text-[14px] font-bold hover:bg-[#6E00CA] transition-colors"
            >
              Confirmer le versement
            </button>
          </div>
        </div>
      )}

      <BottomBankingNav />
    </div>
  );
};

// ============================================================================
// 6. HOUSEHOLD FAMILY ACCOUNT SCREEN (J_FAMILY_ACCOUNT)
// ============================================================================

export const HouseholdFamilyAccountScreen: React.FC = () => {
  const { familyAccount, fundFamilyAccount, goBack, navigateTo, showToast } =
    usePFM();

  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState('1000');

  const handleFundConfirm = () => {
    const parsed = Number(fundAmount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    fundFamilyAccount(parsed);
    setIsFundModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F3FA]">
      <MobileHeader
        title={familyAccount.label}
        subtitle={familyAccount.subtitle}
        onBack={goBack}
      />

      <div className="flex-1 px-4 pt-3 pb-8 space-y-4">
        {/* Shared Family Account Overview Card */}
        <section className="card-simple p-5 space-y-4 border border-[#E4D8FC] bg-gradient-to-br from-white via-[#FDFBFF] to-[#F4ECFF]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
                <Landmark size={21} strokeWidth={2.2} />
              </div>
              <div>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E7F7F0] text-[#0F7B52] text-[10.5px] font-extrabold">
                  Compte actif · {familyAccount.holderNames}
                </span>
                <h2 className="text-[18px] font-extrabold text-[#14111F] leading-tight mt-1">
                  {familyAccount.label}
                </h2>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <span className="text-[12px] font-medium text-[#7D7693] block">
              Solde disponible du foyer
            </span>
            <span className="text-[32px] font-extrabold text-[#0F7B52] tabular-nums tracking-tight leading-none mt-1 block">
              {formatDH(familyAccount.balance)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="rounded-[14px] bg-white/90 border border-[#EFEBF8] px-3 py-2">
              <span className="text-[10.5px] font-medium text-[#7D7693] block">
                Co-titulaires
              </span>
              <span className="text-[12.5px] font-extrabold text-[#14111F] mt-0.5 block">
                {familyAccount.holderNames}
              </span>
            </div>
            <div className="rounded-[14px] bg-white/90 border border-[#EFEBF8] px-3 py-2">
              <span className="text-[10.5px] font-medium text-[#7D7693] block">
                Cartes rattachées
              </span>
              <span className="text-[12.5px] font-extrabold text-[#5E1DF0] mt-0.5 block">
                {familyAccount.cardCount} cartes Simple
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setIsFundModalOpen(true)}
              className="flex-1 h-11 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
            >
              <Plus size={16} strokeWidth={2.4} />
              <span>Alimenter le compte</span>
            </button>
            <button
              type="button"
              onClick={() =>
                showToast(
                  'RIB Compte Famille copié',
                  `${familyAccount.iban} copié dans le presse-papiers.`
                )
              }
              className="h-11 px-4 rounded-full bg-[#F3EDFF] hover:bg-[#E7DCFF] text-[#5E1DF0] text-[12.5px] font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <Copy size={14} />
              <span>RIB</span>
            </button>
          </div>
        </section>

        {/* Recent Shared Account Transactions */}
        <section className="card-simple p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-[15.5px] font-extrabold text-[#14111F]">
              Opérations du Compte Famille
            </h3>
            <span className="text-[11.5px] font-semibold text-[#7D7693]">
              Octobre 2026
            </span>
          </div>

          <div className="divide-y divide-[#F2EFFA]">
            {familyAccount.transactions.map((tx) => {
              const isCredit = tx.type === 'credit';
              return (
                <div
                  key={tx.id}
                  className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-[#E7F7F0] text-[#0F7B52]'
                          : 'bg-[#F5F1FF] text-[#5E1DF0]'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft size={17} strokeWidth={2.3} />
                      ) : (
                        <ArrowUpRight size={17} strokeWidth={2.3} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-bold text-[#14111F] truncate">
                        {tx.label}
                      </p>
                      <p className="text-[11.5px] text-[#7D7693] mt-0.5">
                        {tx.date}
                        {tx.category ? ` · ${tx.category}` : ''}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[13.5px] font-extrabold tabular-nums shrink-0 ${
                      isCredit ? 'text-[#0F7B52]' : 'text-[#14111F]'
                    }`}
                  >
                    {isCredit ? '+' : '−'}
                    {formatDH(tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Back to Famille space */}
        <button
          type="button"
          onClick={() =>
            navigateTo('C1_HUB', {
              hubTab: 'MON_ESPACE',
              monEspaceSubTab: 'FOYER',
            })
          }
          className="w-full h-11 rounded-full bg-white border border-[#E4D8FC] text-[#5E1DF0] text-[13px] font-bold hover:bg-[#FAF8FE] transition-colors flex items-center justify-center gap-1.5"
        >
          <ArrowLeft size={15} />
          <span>Retour à l&apos;espace Famille</span>
        </button>
      </div>

      {/* Fund Family Account Modal */}
      {isFundModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#14111F]/50 backdrop-blur-[2px] flex items-end justify-center p-0 sm:p-4">
          <div className="w-full max-w-[412px] bg-white rounded-t-[28px] sm:rounded-[28px] p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-extrabold text-[#14111F]">
                Alimenter le Compte Famille
              </h3>
              <button
                type="button"
                onClick={() => setIsFundModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F5F3FA] text-[#7D7693] flex items-center justify-center"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#7D7693] block">
                Montant à transférer depuis votre Compte Principal (DH)
              </label>
              <input
                type="number"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="w-full h-12 px-4 rounded-[16px] border border-[#DFD8F0] text-[18px] font-extrabold text-[#14111F] focus:outline-none focus:border-[#8000EB]"
              />
              <div className="flex items-center gap-2 pt-1">
                {[500, 1000, 2000, 4000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFundAmount(String(preset))}
                    className={`flex-1 py-1.5 rounded-full text-[12px] font-bold border transition-colors ${
                      Number(fundAmount) === preset
                        ? 'bg-[#F3EDFF] border-[#8000EB] text-[#5E1DF0]'
                        : 'bg-[#FAF8FE] border-[#EFEBF8] text-[#7D7693]'
                    }`}
                  >
                    +{preset} DH
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleFundConfirm}
              className="w-full h-12 rounded-full bg-[#8000EB] text-white text-[14px] font-bold hover:bg-[#6E00CA] transition-colors"
            >
              Confirmer le virement
            </button>
          </div>
        </div>
      )}

      <BottomBankingNav />
    </div>
  );
};


