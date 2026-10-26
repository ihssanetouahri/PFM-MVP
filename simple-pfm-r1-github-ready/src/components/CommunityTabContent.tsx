import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Users,
  PiggyBank,
  Receipt,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Send,
  UserPlus,
  Wallet,
  Calendar,
  Check,
  X,
  Share2,
  HeartHandshake,
  ArrowUpRight,
  ArrowDownLeft,
  SlidersHorizontal,
  Info,
  Bell,
  Camera,
  FileText,
  PenLine,
  Upload,
  Trash2,
} from 'lucide-react';
import { usePFM } from '../context/PFMContext';
import { formatDH, LAMIA_AVATAR_URL } from '../data/initialData';
import {
  CommunityCagnotte,
  CommunitySharedExpense,
  CommunityBalanceItem,
  CommunityCategoryTag,
  SpendingCategory,
} from '../types/pfm';
import { CategoryIcon } from './SharedUI';

const COMMUNITY_COVER_PRESETS: {
  id: string;
  label: string;
  tag: CommunityCategoryTag;
  url: string;
}[] = [
  {
    id: 'marrakech',
    label: 'Voyage & Amis',
    tag: 'Voyage & Amis',
    url: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'celebration',
    label: 'Cadeau & Fête',
    tag: 'Cadeau & Événement',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'sport',
    label: 'Sport & Club',
    tag: 'Sport & Club',
    url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'coloc',
    label: 'Colocation & Vie',
    tag: 'Colocation',
    url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&auto=format&fit=crop&q=80',
  },
];

interface RecognizedExpenseItem {
  id: string;
  label: string;
  amount: number;
  assignedMemberIds: string[];
}

const DEMO_OCR_SAMPLES: Record<
  string,
  {
    SCAN: {
      merchant: string;
      date: string;
      category: SpendingCategory;
      totalAmount: number;
      items: { label: string; amount: number }[];
    };
    IMPORT: {
      merchant: string;
      date: string;
      category: SpendingCategory;
      totalAmount: number;
      items: { label: string; amount: number }[];
    };
  }
> = {
  'comm-marrakech': {
    SCAN: {
      merchant: 'Terrasse des Épices',
      date: '20 oct. 2026',
      category: 'Sorties',
      totalAmount: 950,
      items: [
        { label: 'Assortiment Briouates & Entrées', amount: 250 },
        { label: 'Tajines & Couscous Royal', amount: 480 },
        { label: 'Thés à la menthe & Pâtisseries', amount: 220 },
      ],
    },
    IMPORT: {
      merchant: 'Riad Dar Anika — Forfait Hammam & Spa',
      date: '20 oct. 2026',
      category: 'Sorties',
      totalAmount: 1200,
      items: [
        { label: 'Hammam Traditionnel (Groupe)', amount: 750 },
        { label: 'Soins & Huiles d’Argan', amount: 450 },
      ],
    },
  },
  'comm-essaouira': {
    SCAN: {
      merchant: 'Chez Sam — Port d’Essaouira',
      date: '20 oct. 2026',
      category: 'Sorties',
      totalAmount: 680,
      items: [
        { label: 'Plateau Grillades Poissons du jour', amount: 480 },
        { label: 'Salades marocaines & Boissons', amount: 200 },
      ],
    },
    IMPORT: {
      merchant: 'Ocean Vagabond — Facture Kitesurf',
      date: '20 oct. 2026',
      category: 'Sorties',
      totalAmount: 1500,
      items: [
        { label: 'Session Kitesurf & Location matériel', amount: 1200 },
        { label: 'Casiers & Combinaisons', amount: 300 },
      ],
    },
  },
  'comm-nadia': {
    SCAN: {
      merchant: 'Pâtisserie Amoud Casablanca',
      date: '20 oct. 2026',
      category: 'Sorties',
      totalAmount: 720,
      items: [
        { label: 'Gâteau d’anniversaire sur-mesure', amount: 480 },
        { label: 'Assortiment Mignardises salées', amount: 240 },
      ],
    },
    IMPORT: {
      merchant: 'Concept Store Maârif — Facture Cadeau',
      date: '20 oct. 2026',
      category: 'Shopping',
      totalAmount: 1100,
      items: [
        { label: 'Coffret Montre & Écrin personnalisé', amount: 850 },
        { label: 'Bouquet de fleurs séchées & Carte', amount: 250 },
      ],
    },
  },
  'comm-padel': {
    SCAN: {
      merchant: 'Oasis Padel Club — Cafétéria',
      date: '20 oct. 2026',
      category: 'Sorties',
      totalAmount: 320,
      items: [
        { label: 'Boissons isotoniques & Eau minérale', amount: 140 },
        { label: 'Tubes de balles Head Pro (x2)', amount: 180 },
      ],
    },
    IMPORT: {
      merchant: 'Oasis Padel Club — Facture Terrain',
      date: '20 oct. 2026',
      category: 'Sorties',
      totalAmount: 600,
      items: [
        { label: 'Location Court Panoramique (2h)', amount: 480 },
        { label: 'Location raquettes carbone', amount: 120 },
      ],
    },
  },
};

export const CommunityTabContent: React.FC<{
  renderCategoryPersonalizeFooter: () => React.ReactNode;
}> = ({ renderCategoryPersonalizeFooter }) => {
  const {
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
    getActiveCategoryWidgets,
    mainAccountBalance,
    showToast,
  } = usePFM();

  // Always display the Simple Communauté presentation page first when entering the Community section
  const [isDiscoveryMode, setIsDiscoveryMode] = useState(true);

  // Activity filter
  const [activityFilter, setActivityFilter] = useState<
    'ALL' | 'CAGNOTTE_CONTRIBUTION' | 'SHARED_EXPENSE' | 'SETTLEMENT'
  >('ALL');

  // Balance filter
  const [balanceTab, setBalanceTab] = useState<'ALL' | 'OWES_YOU' | 'YOU_OWE'>(
    'ALL'
  );

  // Modals / Bottom Sheets state
  const [activeCagnotteDetail, setActiveCagnotteDetail] =
    useState<CommunityCagnotte | null>(null);
  const [contributingCagnotte, setContributingCagnotte] =
    useState<CommunityCagnotte | null>(null);
  const [contribAmountInput, setContribAmountInput] = useState<string>('400');
  const [contribNoteInput, setContribNoteInput] = useState<string>('');

  const [isCreateCagnotteOpen, setIsCreateCagnotteOpen] = useState(false);
  const [newCagTitle, setNewCagTitle] = useState('');
  const [newCagDesc, setNewCagDesc] = useState('');
  const [newCagTarget, setNewCagTarget] = useState('3000');
  const [newCagDeadline, setNewCagDeadline] = useState('30 nov. 2026');
  const [newCagInitDeposit, setNewCagInitDeposit] = useState('500');
  const [newCagCommId, setNewCagCommId] = useState<string>('comm-marrakech');

  const [activeExpenseDetail, setActiveExpenseDetail] =
    useState<CommunitySharedExpense | null>(null);

  // Entry method bottom sheet ("Ajouter une dépense": Scan / Import / Manual)
  const [isExpenseEntrySheetOpen, setIsExpenseEntrySheetOpen] = useState(false);

  // Intermediate Receipt Scanner & Photo Validation Flow ("Scanner votre ticket")
  const [isTicketScannerOpen, setIsTicketScannerOpen] = useState(false);
  const [scannerStep, setScannerStep] = useState<
    'CAMERA' | 'PREVIEW' | 'PROCESSING'
  >('CAMERA');
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true);
  const [cameraReady, setCameraReady] = useState<boolean>(false);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedFileName, setCapturedFileName] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Scan / Import OCR Review & Confirmation Sheet
  const [isOcrReviewOpen, setIsOcrReviewOpen] = useState(false);
  const [ocrSourceType, setOcrSourceType] = useState<'SCAN' | 'IMPORT'>('SCAN');
  const [ocrFileName, setOcrFileName] = useState<string | null>(null);
  const [ocrMerchant, setOcrMerchant] = useState('');
  const [ocrDate, setOcrDate] = useState('20 oct. 2026');
  const [ocrTotalAmount, setOcrTotalAmount] = useState('950');
  const [ocrCategory, setOcrCategory] = useState<SpendingCategory>('Sorties');
  const [ocrItems, setOcrItems] = useState<RecognizedExpenseItem[]>([]);
  const scanFileInputRef = useRef<HTMLInputElement | null>(null);
  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  // Expense Creation & Splitting Sheet
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expCommId, setExpCommId] = useState<string>('comm-marrakech');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('600');
  const [expDate, setExpDate] = useState('Aujourd’hui');
  const [expCategory, setExpCategory] = useState<SpendingCategory>('Sorties');
  const [expPaidBy, setExpPaidBy] = useState<string>('Lamia (Vous)');
  const [expSplitMode, setExpSplitMode] = useState<
    'EQUAL' | 'CUSTOM' | 'PERCENTAGE' | 'ITEMS'
  >('EQUAL');
  const [expCustomShares, setExpCustomShares] = useState<Record<string, number>>(
    {}
  );
  const [expSelectedMemberIds, setExpSelectedMemberIds] = useState<string[]>(
    []
  );
  const [expItems, setExpItems] = useState<RecognizedExpenseItem[]>([]);
  const [isPayerSelectorOpen, setIsPayerSelectorOpen] = useState(false);
  const [isMemberSelectorOpen, setIsMemberSelectorOpen] = useState(false);
  const [isEditingExpenseSummary, setIsEditingExpenseSummary] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editingArticleMemberIds, setEditingArticleMemberIds] = useState<
    string[]
  >([]);

  const [settlingBalance, setSettlingBalance] =
    useState<CommunityBalanceItem | null>(null);

  const [isCreateCommunityOpen, setIsCreateCommunityOpen] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommSubtitle, setNewCommSubtitle] = useState('');
  const [newCommPresetId, setNewCommPresetId] = useState('marrakech');
  const [newCommMembers, setNewCommMembers] = useState<string[]>([
    'Youssef B.',
    'Sara M.',
  ]);
  const [newCommMemberInput, setNewCommMemberInput] = useState('');

  const [isCommunityInfoOpen, setIsCommunityInfoOpen] = useState(false);
  const [inviteMemberInput, setInviteMemberInput] = useState('');

  const hasCommunities = communities.length > 0;
  const showPresentation = !hasCommunities || isDiscoveryMode;

  const activeCommunity = useMemo(() => {
    return (
      communities.find((c) => c.id === selectedCommunityId) ||
      communities[0] || {
        id: '',
        name: '',
        subtitle: '',
        categoryTag: 'Voyage & Amis' as CommunityCategoryTag,
        coverUrl: COMMUNITY_COVER_PRESETS[0].url,
        createdAt: '',
        visibilityNote:
          'Seules les contributions aux cagnottes et les dépenses partagées du groupe sont visibles.',
        members: [],
      }
    );
  }, [communities, selectedCommunityId]);

  const currentUserMember = useMemo(
    () =>
      activeCommunity.members.find((m) => m.isCurrentUser) ||
      activeCommunity.members[0],
    [activeCommunity]
  );

  // Strictly filtered items for the active selected community ONLY (never mix communities)
  const filteredCagnottes = useMemo(() => {
    return communityCagnottes.filter(
      (c) => c.communityId === activeCommunity.id
    );
  }, [communityCagnottes, activeCommunity.id]);

  const filteredExpenses = useMemo(() => {
    return communityExpenses.filter(
      (e) => e.communityId === activeCommunity.id
    );
  }, [communityExpenses, activeCommunity.id]);

  const filteredBalances = useMemo(() => {
    return communityBalances.filter(
      (b) => b.communityId === activeCommunity.id
    );
  }, [communityBalances, activeCommunity.id]);

  const filteredActivities = useMemo(() => {
    const byComm = communityActivities.filter(
      (a) => a.communityId === activeCommunity.id
    );
    if (activityFilter === 'ALL') return byComm;
    return byComm.filter((a) => a.type === activityFilter);
  }, [communityActivities, activeCommunity.id, activityFilter]);

  // Financial summaries for the selected community
  const totalOwedToYou = useMemo(
    () =>
      filteredBalances
        .filter((b) => b.direction === 'OWES_YOU' && b.status === 'PENDING')
        .reduce((sum, b) => sum + b.amount, 0),
    [filteredBalances]
  );

  const totalYouOwe = useMemo(
    () =>
      filteredBalances
        .filter((b) => b.direction === 'YOU_OWE' && b.status === 'PENDING')
        .reduce((sum, b) => sum + b.amount, 0),
    [filteredBalances]
  );

  const netCommunityBalance = totalOwedToYou - totalYouOwe;

  const totalCollectedInCagnottes = useMemo(
    () => filteredCagnottes.reduce((sum, c) => sum + c.collectedAmount, 0),
    [filteredCagnottes]
  );

  const totalSharedExpensesAmount = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + e.totalAmount, 0),
    [filteredExpenses]
  );

  const activeCommunityWidgets = getActiveCategoryWidgets('COMMUNAUTE');

  // Keep activeCagnotteDetail synced with latest state
  const currentCagnotteDetail = useMemo(() => {
    if (!activeCagnotteDetail) return null;
    return (
      communityCagnottes.find((c) => c.id === activeCagnotteDetail.id) ||
      activeCagnotteDetail
    );
  }, [activeCagnotteDetail, communityCagnottes]);

  const currentExpenseDetail = useMemo(() => {
    if (!activeExpenseDetail) return null;
    return (
      communityExpenses.find((e) => e.id === activeExpenseDetail.id) ||
      activeExpenseDetail
    );
  }, [activeExpenseDetail, communityExpenses]);

  const handleSelectCommunity = (communityId: string) => {
    setSelectedCommunityId(communityId);
    setBalanceTab('ALL');
    setActivityFilter('ALL');
    setNewCagCommId(communityId);
    setExpCommId(communityId);
  };

  // Handlers
  const handleConfirmContribution = () => {
    if (!contributingCagnotte) return;
    const parsed = Number(contribAmountInput.replace(/\s+/g, ''));
    if (Number.isNaN(parsed) || parsed <= 0) return;
    contributeToCagnotte(contributingCagnotte.id, parsed, contribNoteInput);
    setContributingCagnotte(null);
    setContribAmountInput('400');
    setContribNoteInput('');
  };

  const handleConfirmCreateCagnotte = () => {
    if (!newCagTitle.trim()) return;
    const target = Number(newCagTarget.replace(/\s+/g, '')) || 3000;
    const initDep = Number(newCagInitDeposit.replace(/\s+/g, '')) || 0;
    createCommunityCagnotte({
      communityId: newCagCommId || activeCommunity.id,
      title: newCagTitle,
      description: newCagDesc,
      targetAmount: target,
      deadline: newCagDeadline || 'Décembre 2026',
      initialContribution: initDep,
    });
    setIsCreateCagnotteOpen(false);
    setNewCagTitle('');
    setNewCagDesc('');
  };

  const selectedExpenseCommunity = useMemo(
    () => communities.find((c) => c.id === expCommId) || activeCommunity,
    [communities, expCommId, activeCommunity]
  );

  const effectiveSelectedMembers = useMemo(() => {
    const allMembers = selectedExpenseCommunity.members;
    if (expSelectedMemberIds.length === 0) return allMembers;
    const filtered = allMembers.filter((m) =>
      expSelectedMemberIds.includes(m.id)
    );
    return filtered.length > 0 ? filtered : allMembers;
  }, [selectedExpenseCommunity, expSelectedMemberIds]);

  const loadSampleOcrData = (
    mode: 'SCAN' | 'IMPORT',
    commId: string,
    customFileName?: string | null
  ) => {
    const targetComm =
      communities.find((c) => c.id === commId) || activeCommunity;
    const sampleGroup =
      DEMO_OCR_SAMPLES[targetComm.id] || DEMO_OCR_SAMPLES['comm-marrakech'];
    const sample = sampleGroup[mode];
    const memberIds = targetComm.members.map((m) => m.id);

    setOcrSourceType(mode);
    setOcrFileName(customFileName || null);
    setOcrMerchant(
      customFileName
        ? customFileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
        : sample.merchant
    );
    setOcrDate(sample.date);
    setOcrCategory(sample.category);
    setOcrTotalAmount(String(sample.totalAmount));
    setOcrItems(
      sample.items.map((it, idx) => ({
        id: `ocr-item-${Date.now()}-${idx}`,
        label: it.label,
        amount: it.amount,
        assignedMemberIds: memberIds,
      }))
    );
  };

  const stopCameraStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  }, []);

  const startCameraStream = useCallback(async () => {
    stopCameraStream();
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraAvailable(false);
      return;
    }
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }
      mediaStreamRef.current = stream;
      setCameraAvailable(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
          videoRef.current?.play().catch(() => {});
        };
      }
    } catch {
      setCameraAvailable(false);
      setCameraReady(false);
    }
  }, [stopCameraStream]);

  useEffect(() => {
    if (isTicketScannerOpen && scannerStep === 'CAMERA') {
      startCameraStream();
    } else {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [isTicketScannerOpen, scannerStep, startCameraStream, stopCameraStream]);

  const generateReceiptSnapshotDataUrl = (commId: string): string => {
    const sampleGroup =
      DEMO_OCR_SAMPLES[commId] || DEMO_OCR_SAMPLES['comm-marrakech'];
    const sample = sampleGroup.SCAN;
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 820;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Dark surface background
    ctx.fillStyle = '#1B162A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Paper receipt card
    const rx = 56;
    const ry = 44;
    const rw = 488;
    const rh = 732;
    ctx.fillStyle = '#FCFBF9';
    ctx.beginPath();
    ctx.roundRect(rx, ry, rw, rh, 14);
    ctx.fill();

    // Top receipt header
    ctx.fillStyle = '#14111F';
    ctx.font = 'bold 21px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sample.merchant.toUpperCase(), canvas.width / 2, ry + 64);

    ctx.fillStyle = '#6E6785';
    ctx.font = '14px monospace';
    ctx.fillText(`REÇU DE CAISSE · ${sample.date}`, canvas.width / 2, ry + 96);

    // Dashed divider
    ctx.strokeStyle = '#D5CEE6';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(rx + 36, ry + 124);
    ctx.lineTo(rx + rw - 36, ry + 124);
    ctx.stroke();

    // Columns header
    ctx.textAlign = 'left';
    ctx.fillStyle = '#7D7693';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('DÉSIGNATION', rx + 40, ry + 158);
    ctx.textAlign = 'right';
    ctx.fillText('MONTANT', rx + rw - 40, ry + 158);

    // Line items
    let yOffset = ry + 204;
    ctx.font = '15px monospace';
    sample.items.forEach((it) => {
      ctx.fillStyle = '#14111F';
      ctx.textAlign = 'left';
      ctx.fillText(it.label.slice(0, 30), rx + 40, yOffset);
      ctx.textAlign = 'right';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`${it.amount},00 DH`, rx + rw - 40, yOffset);
      ctx.font = '15px monospace';
      yOffset += 46;
    });

    // Bottom dashed divider
    ctx.beginPath();
    ctx.moveTo(rx + 36, yOffset + 12);
    ctx.lineTo(rx + rw - 36, yOffset + 12);
    ctx.stroke();
    ctx.setLineDash([]);

    // Total row
    const totalY = yOffset + 58;
    ctx.fillStyle = '#290764';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('TOTAL TTC', rx + 40, totalY);
    ctx.textAlign = 'right';
    ctx.fillText(`${sample.totalAmount},00 DH`, rx + rw - 40, totalY);

    // Payment info
    ctx.fillStyle = '#7D7693';
    ctx.font = '13px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CARTE BANCAIRE · APPROUVÉ', rx + 40, totalY + 42);

    // Simulated barcode at bottom
    const barY = ry + rh - 105;
    ctx.fillStyle = '#2A2438';
    for (let i = 0; i < 42; i++) {
      const bw = i % 3 === 0 ? 4 : i % 2 === 0 ? 2 : 6;
      ctx.fillRect(rx + 74 + i * 8, barY, bw, 44);
    }
    ctx.fillStyle = '#7D7693';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MERCI DE VOTRE VISITE', canvas.width / 2, barY + 68);

    return canvas.toDataURL('image/jpeg', 0.92);
  };

  const handleOpenTicketScanner = () => {
    setIsExpenseEntrySheetOpen(false);
    setExpCommId(activeCommunity.id);
    setExpPaidBy('Lamia (Vous)');
    setOcrSourceType('SCAN');
    setCapturedPhotoUrl(null);
    setCapturedFileName(null);
    setScannerStep('CAMERA');
    setIsTicketScannerOpen(true);
  };

  const handleTakeReceiptPhoto = () => {
    if (
      videoRef.current &&
      cameraAvailable &&
      cameraReady &&
      videoRef.current.videoWidth > 0 &&
      videoRef.current.videoHeight > 0
    ) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        stopCameraStream();
        setCapturedPhotoUrl(dataUrl);
        setCapturedFileName(null);
        setScannerStep('PREVIEW');
        return;
      }
    }
    // Fallback when camera access is unavailable: open device photo picker
    scanFileInputRef.current?.click();
    stopCameraStream();
    const fallbackUrl = generateReceiptSnapshotDataUrl(
      expCommId || activeCommunity.id
    );
    setCapturedPhotoUrl(fallbackUrl);
    setCapturedFileName(null);
    setScannerStep('PREVIEW');
  };

  const handleRetakeReceiptPhoto = () => {
    setCapturedPhotoUrl(null);
    setCapturedFileName(null);
    setScannerStep('CAMERA');
  };

  const handleValidateScannedTicket = () => {
    setScannerStep('PROCESSING');
    const targetCommId = expCommId || activeCommunity.id;
    setTimeout(() => {
      loadSampleOcrData('SCAN', targetCommId, capturedFileName);
      setIsTicketScannerOpen(false);
      setScannerStep('CAMERA');
      setIsOcrReviewOpen(true);
    }, 850);
  };

  const handleChooseScanOrImport = (mode: 'SCAN' | 'IMPORT') => {
    if (mode === 'SCAN') {
      handleOpenTicketScanner();
      return;
    }
    setIsExpenseEntrySheetOpen(false);
    setExpCommId(activeCommunity.id);
    setExpPaidBy('Lamia (Vous)');
    loadSampleOcrData('IMPORT', activeCommunity.id, null);
    setIsOcrReviewOpen(true);

    setTimeout(() => {
      importFileInputRef.current?.click();
    }, 60);
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: 'SCAN' | 'IMPORT'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (mode === 'SCAN') {
        const reader = new FileReader();
        reader.onload = () => {
          stopCameraStream();
          setCapturedPhotoUrl(
            typeof reader.result === 'string'
              ? reader.result
              : generateReceiptSnapshotDataUrl(expCommId || activeCommunity.id)
          );
          setCapturedFileName(file.name);
          setIsTicketScannerOpen(true);
          setScannerStep('PREVIEW');
        };
        reader.readAsDataURL(file);
      } else {
        loadSampleOcrData('IMPORT', expCommId || activeCommunity.id, file.name);
      }
    }
    e.target.value = '';
  };

  const handleChooseManualEntry = () => {
    setIsExpenseEntrySheetOpen(false);
    setIsOcrReviewOpen(false);
    const comm = activeCommunity;
    setExpCommId(comm.id);
    setExpPaidBy('Lamia (Vous)');
    setExpTitle('Terrasse des Épices');
    setExpAmount('950');
    setExpDate('Aujourd’hui');
    setExpCategory('Sorties');
    setExpItems([]);
    setExpSelectedMemberIds(comm.members.map((m) => m.id));
    setExpSplitMode('EQUAL');
    setExpCustomShares({});
    setIsPayerSelectorOpen(false);
    setIsMemberSelectorOpen(false);
    setIsEditingExpenseSummary(true);
    setIsAddExpenseOpen(true);
  };

  const ocrItemsTotal = useMemo(
    () =>
      ocrItems.reduce(
        (sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0),
        0
      ),
    [ocrItems]
  );

  const handleProceedFromOcrToSplit = () => {
    const targetComm =
      communities.find((c) => c.id === expCommId) || activeCommunity;
    const memberIds = targetComm.members.map((m) => m.id);
    const cleanItems = ocrItems
      .filter((it) => it.label.trim() && it.amount > 0)
      .map((it) => ({
        ...it,
        amount: Math.round(it.amount),
        assignedMemberIds:
          it.assignedMemberIds.length > 0 ? it.assignedMemberIds : memberIds,
      }));

    const parsedTotal = Math.max(
      0,
      Math.round(Number(ocrTotalAmount.replace(/\s+/g, '')) || 0)
    );
    const itemsSum = cleanItems.reduce((s, it) => s + it.amount, 0);
    const finalTotal = parsedTotal > 0 ? parsedTotal : itemsSum || 600;

    setExpTitle(ocrMerchant.trim() || 'Terrasse des Épices');
    setExpDate(ocrDate.trim() || 'Aujourd’hui');
    setExpCategory(ocrCategory);
    setExpAmount(String(finalTotal));
    setExpSelectedMemberIds(memberIds);
    setExpItems(cleanItems);
    setExpCustomShares({});
    setIsPayerSelectorOpen(false);
    setIsMemberSelectorOpen(false);
    setIsEditingExpenseSummary(false);
    setEditingArticleId(null);

    // Always default to "Parts égales" when opening "Répartir la dépense"
    setExpSplitMode('EQUAL');

    setIsOcrReviewOpen(false);
    setIsAddExpenseOpen(true);
  };

  const toggleExpenseMemberSelection = (memberId: string) => {
    setExpSelectedMemberIds((prev) => {
      const current =
        prev.length > 0
          ? prev
          : selectedExpenseCommunity.members.map((m) => m.id);
      if (current.includes(memberId)) {
        if (current.length <= 1) return current; // Keep at least 1 member selected
        const next = current.filter((id) => id !== memberId);
        setExpItems((items) =>
          items.map((it) => ({
            ...it,
            assignedMemberIds: it.assignedMemberIds.filter((id) =>
              next.includes(id)
            ),
          }))
        );
        return next;
      }
      const next = [...current, memberId];
      setExpItems((items) =>
        items.map((it) => ({
          ...it,
          assignedMemberIds: it.assignedMemberIds.includes(memberId)
            ? it.assignedMemberIds
            : [...it.assignedMemberIds, memberId],
        }))
      );
      return next;
    });
  };

  const editingArticle = useMemo(
    () => expItems.find((it) => it.id === editingArticleId) || null,
    [expItems, editingArticleId]
  );

  const handleOpenEditArticleModal = (item: RecognizedExpenseItem) => {
    const validIds = effectiveSelectedMembers
      .filter((m) => item.assignedMemberIds.includes(m.id))
      .map((m) => m.id);
    setEditingArticleId(item.id);
    setEditingArticleMemberIds(validIds);
  };

  const handleToggleEditingArticleMember = (memberId: string) => {
    setEditingArticleMemberIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleToggleAllEditingArticleMembers = () => {
    const allIds = effectiveSelectedMembers.map((m) => m.id);
    const allSelected =
      allIds.length > 0 &&
      allIds.every((id) => editingArticleMemberIds.includes(id));
    setEditingArticleMemberIds(allSelected ? [] : allIds);
  };

  const handleConfirmEditArticleMembers = () => {
    if (!editingArticleId || editingArticleMemberIds.length === 0) return;
    setExpItems((prev) =>
      prev.map((item) =>
        item.id === editingArticleId
          ? { ...item, assignedMemberIds: editingArticleMemberIds }
          : item
      )
    );
    setEditingArticleId(null);
  };

  const hasUnassignedArticle = useMemo(() => {
    if (expSplitMode !== 'ITEMS') return false;
    if (expItems.length === 0) return true;
    return expItems.some(
      (item) =>
        effectiveSelectedMembers.filter((m) =>
          item.assignedMemberIds.includes(m.id)
        ).length === 0
    );
  }, [expSplitMode, expItems, effectiveSelectedMembers]);

  const computedExpenseShares = useMemo(() => {
    const total = Math.max(
      0,
      Math.round(Number(expAmount.replace(/\s+/g, '')) || 0)
    );
    const members = effectiveSelectedMembers;
    const count = Math.max(1, members.length);

    if (expSplitMode === 'EQUAL') {
      const perPerson = Math.floor(total / count);
      const remainder = total - perPerson * count;
      return members.map((m, idx) => ({
        participantId: m.id,
        participantName: m.isCurrentUser ? 'Lamia (Vous)' : m.name,
        avatarInitials: m.avatarInitials,
        avatarUrl: m.avatarUrl,
        amount: idx < remainder ? perPerson + 1 : perPerson,
      }));
    }

    if (expSplitMode === 'ITEMS' && expItems.length > 0) {
      const totalsByMember: Record<string, number> = {};
      members.forEach((m) => {
        totalsByMember[m.id] = 0;
      });

      let allItemsAssigned = true;
      expItems.forEach((item) => {
        const validAssigned = members.filter((m) =>
          item.assignedMemberIds.includes(m.id)
        );
        if (validAssigned.length === 0) {
          allItemsAssigned = false;
          return;
        }
        const itemCount = validAssigned.length;
        const base = Math.floor(item.amount / itemCount);
        const rem = item.amount - base * itemCount;
        validAssigned.forEach((m, idx) => {
          totalsByMember[m.id] =
            (totalsByMember[m.id] || 0) + (idx < rem ? base + 1 : base);
        });
      });

      // Ensure allocated amounts add up to total (including any rounding adjustments) when all articles have participants
      if (allItemsAssigned && total > 0) {
        const allocatedSum = members.reduce(
          (sum, m) => sum + (totalsByMember[m.id] || 0),
          0
        );
        const diff = total - allocatedSum;
        if (diff !== 0) {
          const activeRecipients = members.filter(
            (m) => (totalsByMember[m.id] || 0) > 0
          );
          const targetRecipients =
            activeRecipients.length > 0 ? activeRecipients : members;
          const perRecip = Math.trunc(diff / targetRecipients.length);
          const remDiff = diff - perRecip * targetRecipients.length;
          targetRecipients.forEach((m, idx) => {
            const extra =
              perRecip +
              (idx < Math.abs(remDiff) ? (remDiff > 0 ? 1 : -1) : 0);
            totalsByMember[m.id] = Math.max(
              0,
              (totalsByMember[m.id] || 0) + extra
            );
          });
        }
      }

      return members.map((m) => ({
        participantId: m.id,
        participantName: m.isCurrentUser ? 'Lamia (Vous)' : m.name,
        avatarInitials: m.avatarInitials,
        avatarUrl: m.avatarUrl,
        amount: totalsByMember[m.id] || 0,
      }));
    }

    if (expSplitMode === 'PERCENTAGE') {
      const perPerson = Math.floor(total / count);
      const remainder = total - perPerson * count;
      return members.map((m, idx) => ({
        participantId: m.id,
        participantName: m.isCurrentUser ? 'Lamia (Vous)' : m.name,
        avatarInitials: m.avatarInitials,
        avatarUrl: m.avatarUrl,
        amount: idx < remainder ? perPerson + 1 : perPerson,
      }));
    }

    // CUSTOM
    const perPerson = Math.floor(total / count);
    const remainder = total - perPerson * count;
    return members.map((m, idx) => ({
      participantId: m.id,
      participantName: m.isCurrentUser ? 'Lamia (Vous)' : m.name,
      avatarInitials: m.avatarInitials,
      avatarUrl: m.avatarUrl,
      amount:
        expCustomShares[m.id] !== undefined
          ? expCustomShares[m.id]
          : idx < remainder
          ? perPerson + 1
          : perPerson,
    }));
  }, [
    expAmount,
    effectiveSelectedMembers,
    expSplitMode,
    expCustomShares,
    expItems,
  ]);

  const expenseNumericTotal = useMemo(
    () => Math.max(0, Math.round(Number(expAmount.replace(/\s+/g, '')) || 0)),
    [expAmount]
  );

  const allocatedSharesTotal = useMemo(
    () => computedExpenseShares.reduce((sum, s) => sum + s.amount, 0),
    [computedExpenseShares]
  );

  const isAllocationBalanced =
    !hasUnassignedArticle &&
    expenseNumericTotal > 0 &&
    allocatedSharesTotal === expenseNumericTotal &&
    computedExpenseShares.length > 0;

  const handleAutoBalanceShares = () => {
    if (expSplitMode === 'ITEMS' && expItems.length > 0) {
      const itemsSum = expItems.reduce((s, it) => s + it.amount, 0);
      if (itemsSum > 0) {
        setExpAmount(String(itemsSum));
      }
      return;
    }

    // Balance custom shares so their sum matches expenseNumericTotal
    const members = effectiveSelectedMembers;
    if (members.length === 0) return;
    const nextCustom: Record<string, number> = {};
    let runningSum = 0;
    members.forEach((m, idx) => {
      const currentVal =
        computedExpenseShares.find((s) => s.participantId === m.id)?.amount || 0;
      if (idx < members.length - 1) {
        nextCustom[m.id] = Math.max(0, currentVal);
        runningSum += nextCustom[m.id];
      } else {
        nextCustom[m.id] = Math.max(0, expenseNumericTotal - runningSum);
      }
    });
    setExpCustomShares(nextCustom);
  };

  const handleConfirmAddExpense = () => {
    if (!expTitle.trim() || !isAllocationBalanced) return;

    addCommunitySharedExpense({
      communityId: selectedExpenseCommunity.id,
      title: expTitle,
      category: expCategory,
      totalAmount: expenseNumericTotal,
      paidByName: expPaidBy,
      date: expDate,
      splitMode: expSplitMode === 'ITEMS' ? 'CUSTOM' : expSplitMode,
      shares: computedExpenseShares,
    });
    setIsAddExpenseOpen(false);
    setExpTitle('');
    setExpItems([]);
  };

  const handleConfirmCreateCommunity = () => {
    if (!newCommName.trim()) return;
    const preset =
      COMMUNITY_COVER_PRESETS.find((p) => p.id === newCommPresetId) ||
      COMMUNITY_COVER_PRESETS[0];
    createCommunityGroup({
      name: newCommName,
      subtitle: newCommSubtitle || `${newCommMembers.length + 1} participants`,
      categoryTag: preset.tag,
      coverUrl: preset.url,
      memberNames: newCommMembers,
    });
    setIsCreateCommunityOpen(false);
    setIsDiscoveryMode(false);
    setNewCommName('');
    setNewCommSubtitle('');
  };

  // Render an individual Community Widget
  const renderCommunityWidget = (widgetId: string) => {
    switch (widgetId) {
      // =====================================================================
      // WIDGET 1: NOS CAGNOTTES COMMUNES (Community Savings Pots)
      // =====================================================================
      case 'w-communaute-cagnottes': {
        const CAGNOTTE_ACCENTS = [
          {
            id: 'purple',
            cardClass: 'bg-[#F5F0FF] border-[#E4D5FF]',
            barClass: 'bg-[#8000EB]',
            trackClass: 'bg-[#E5D6FF]',
            badgeClass: 'bg-[#8000EB]',
            btnClass:
              'bg-[#E8DAFF] hover:bg-[#DEC8FF] border-[#D8C2FF] text-[#7000D0]',
            textClass: 'text-[#7000D0]',
          },
          {
            id: 'blue',
            cardClass: 'bg-[#EEF5FF] border-[#D4E4FF]',
            barClass: 'bg-[#2563EB]',
            trackClass: 'bg-[#D6E6FF]',
            badgeClass: 'bg-[#2563EB]',
            btnClass:
              'bg-[#DCEAFE] hover:bg-[#CBE0FD] border-[#C5DCFD] text-[#1D4ED8]',
            textClass: 'text-[#1D4ED8]',
          },
          {
            id: 'green',
            cardClass: 'bg-[#EDF8F2] border-[#CBEBD9]',
            barClass: 'bg-[#10B981]',
            trackClass: 'bg-[#CDEEE0]',
            badgeClass: 'bg-[#059669]',
            btnClass:
              'bg-[#D5F2E3] hover:bg-[#C1EBD5] border-[#BCE8D1] text-[#047857]',
            textClass: 'text-[#047857]',
          },
          {
            id: 'orange',
            cardClass: 'bg-[#FFF4E6] border-[#FFE0BA]',
            barClass: 'bg-[#F97316]',
            trackClass: 'bg-[#FFE2BF]',
            badgeClass: 'bg-[#EA580C]',
            btnClass:
              'bg-[#FFE6C7] hover:bg-[#FFDAB0] border-[#FFD4A1] text-[#C2410C]',
            textClass: 'text-[#C2410C]',
          },
          {
            id: 'pink',
            cardClass: 'bg-[#FFF0F5] border-[#FCD4E4]',
            barClass: 'bg-[#EC4899]',
            trackClass: 'bg-[#FBD5E6]',
            badgeClass: 'bg-[#DB2777]',
            btnClass:
              'bg-[#FCE0EC] hover:bg-[#F9CEE1] border-[#F8C8DD] text-[#BE185D]',
            textClass: 'text-[#BE185D]',
          },
        ];

        const CAGNOTTE_ID_ACCENT_INDEX: Record<string, number> = {
          'cag-marrakech-villa': 0, // purple (#F5F0FF)
          'cag-marrakech-riad': 0, // purple (#F5F0FF)
          'cag-marrakech-agafay': 1, // blue (#EEF5FF)
          'cag-nadia-cadeau': 4, // pink (#FFF0F5)
          'cag-nadia-diner': 3, // orange (#FFF4E6)
          'cag-padel-tournoi': 2, // green (#EDF8F2)
        };

        return (
          <section
            key={widgetId}
            className="card-simple py-4 space-y-3.5 overflow-hidden bg-white"
          >
            {/* Header aligned with 16px horizontal padding */}
            <div className="flex items-center justify-between gap-2 px-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#F3EBFF] text-[#8000EB] flex items-center justify-center shrink-0">
                  <PiggyBank size={18} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[16px] font-extrabold text-[#14111F] leading-tight">
                    Nos cagnottes
                  </h3>
                  <p className="text-[11.5px] text-[#7D7693] truncate">
                    {filteredCagnottes.length} cagnotte
                    {filteredCagnottes.length > 1 ? 's' : ''} ·{' '}
                    {formatDH(totalCollectedInCagnottes)} collectés
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setNewCagCommId(activeCommunity.id);
                  setIsCreateCagnotteOpen(true);
                }}
                className="inline-flex items-center justify-center gap-1 h-8 px-3.5 rounded-full bg-[#F3EBFF] hover:bg-[#E7D8FF] text-[#8000EB] text-[12px] font-bold transition-colors shrink-0 active:scale-[0.98]"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>Créer</span>
              </button>
            </div>

            {/* Horizontal Carousel of Cagnotte Cards */}
            {filteredCagnottes.length > 0 ? (
              <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar px-4 py-1">
                {filteredCagnottes.map((cag, idx) => {
                  const pct = Math.min(
                    100,
                    Math.round(
                      (cag.collectedAmount / Math.max(1, cag.targetAmount)) * 100
                    )
                  );
                  const accentIndex =
                    CAGNOTTE_ID_ACCENT_INDEX[cag.id] !== undefined
                      ? CAGNOTTE_ID_ACCENT_INDEX[cag.id]
                      : (idx + 2) % CAGNOTTE_ACCENTS.length;
                  const accent = CAGNOTTE_ACCENTS[accentIndex];

                  return (
                    <div
                      key={cag.id}
                      className={`${
                        filteredCagnottes.length === 1
                          ? 'w-full'
                          : 'w-[264px] shrink-0'
                      } ${accent.cardClass} rounded-[22px] border p-3.5 flex flex-col justify-between space-y-3 shadow-[0_6px_18px_-6px_rgba(41,7,100,0.06)]`}
                    >
                      <div className="space-y-2.5">
                        {/* Top Cover + Community Badge */}
                        <div
                          onClick={() => setActiveCagnotteDetail(cag)}
                          className="relative w-full h-[96px] rounded-[16px] overflow-hidden bg-white/60 cursor-pointer group"
                        >
                          <img
                            src={cag.imageUrl}
                            alt={cag.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#14111F]/75 via-[#14111F]/20 to-transparent" />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/92 backdrop-blur-xs text-[#290764] text-[10px] font-extrabold inline-flex items-center gap-1.5 max-w-[180px]">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${accent.barClass}`}
                            />
                            <span className="truncate">{cag.communityName}</span>
                          </span>
                          <span
                            className={`absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-white text-[10.5px] font-extrabold tabular-nums shadow-2xs ${accent.badgeClass}`}
                          >
                            {pct} %
                          </span>
                        </div>

                        {/* Title & Deadline */}
                        <div>
                          <button
                            type="button"
                            onClick={() => setActiveCagnotteDetail(cag)}
                            className="text-left block w-full"
                          >
                            <h4 className="text-[14.5px] font-extrabold text-[#14111F] leading-snug line-clamp-1 hover:underline">
                              {cag.title}
                            </h4>
                          </button>
                          <p className="text-[11px] font-medium text-[#6E6785] mt-0.5">
                            Échéance : {cag.deadline} ·{' '}
                            <span className={`font-bold ${accent.textClass}`}>
                              {cag.contributorsCount}/{cag.totalMembersCount}{' '}
                              participants
                            </span>
                          </p>
                        </div>

                        {/* Collected vs Target + Progress bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-baseline justify-between text-[12px]">
                            <span className="font-extrabold text-[#14111F] tabular-nums text-[15px]">
                              {formatDH(cag.collectedAmount)}
                            </span>
                            <span className="text-[11px] font-semibold text-[#6E6785] tabular-nums">
                              sur {formatDH(cag.targetAmount)}
                            </span>
                          </div>
                          <div
                            className={`w-full h-2 rounded-full overflow-hidden ${accent.trackClass}`}
                          >
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${accent.barClass}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Actions: Participer + Voir */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setContributingCagnotte(cag);
                            setContribAmountInput('400');
                            setContribNoteInput('');
                          }}
                          className={`flex-1 h-8 px-3.5 rounded-full border text-[12px] font-bold inline-flex items-center justify-center gap-1 transition-colors active:scale-[0.98] ${accent.btnClass}`}
                        >
                          <Plus size={13} strokeWidth={2.5} />
                          <span>Participer</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveCagnotteDetail(cag)}
                          className="h-8 px-3 rounded-full bg-white/90 hover:bg-white border border-[#E6E0F2] text-[#6E6785] hover:text-[#290764] text-[12px] font-semibold transition-colors inline-flex items-center justify-center gap-0.5 shrink-0"
                        >
                          <span>Voir</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-3">
                <div className="p-4 rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] text-center space-y-2">
                  <p className="text-[13px] font-bold text-[#290764]">
                    Aucune cagnotte active dans cette communauté
                  </p>
                  <p className="text-[11.5px] text-[#7D7693]">
                    Lancez une cagnotte pour collecter des fonds entre les{' '}
                    {activeCommunity.members.length} participants.
                  </p>
                </div>
              </div>
            )}
          </section>
        );
      }

      // =====================================================================
      // WIDGET 2: DÉPENSES PARTAGÉES DU GROUPE (Organize & split expenses)
      // =====================================================================
      case 'w-communaute-depenses': {
        return (
          <section key={widgetId} className="card-simple p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                  <Receipt size={19} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[16px] font-extrabold text-[#14111F] leading-tight">
                    Dépenses partagées
                  </h3>
                  <p className="text-[11.5px] text-[#7D7693]">
                    Suivez les dépenses du groupe.
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-[#F5F1FF] text-[#290764] text-[11px] font-extrabold tabular-nums shrink-0">
                {formatDH(totalSharedExpensesAmount)}
              </span>
            </div>

            {/* List of shared expenses */}
            <div className="divide-y divide-[#F3EFFA]">
              {filteredExpenses.map((exp) => {
                const paidSharesCount = exp.shares.filter(
                  (s) => s.status === 'PAID'
                ).length;
                const totalSharesCount = exp.shares.length;
                const allPaid = paidSharesCount === totalSharesCount;
                const perPersonAvg = Math.round(
                  exp.totalAmount / Math.max(1, totalSharesCount)
                );

                return (
                  <button
                    key={exp.id}
                    type="button"
                    onClick={() => setActiveExpenseDetail(exp)}
                    className="w-full py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3 text-left hover:bg-[#FAF8FE] rounded-xl px-1 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <CategoryIcon category={exp.category} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] font-extrabold text-[#14111F] truncate">
                          {exp.title}
                        </p>
                        <p className="text-[11.5px] text-[#7D7693] truncate mt-0.5">
                          Payé par{' '}
                          <strong className="text-[#290764]">
                            {exp.paidByName}
                          </strong>{' '}
                          · {formatDH(perPersonAvg)} / pers.
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end">
                      <span className="text-[13.5px] font-extrabold text-[#14111F] tabular-nums">
                        {formatDH(exp.totalAmount)}
                      </span>
                      <span
                        className={`mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          allPaid
                            ? 'bg-[#E7F7F0] text-[#0F7B52]'
                            : 'bg-[#FFF3E2] text-[#D97706]'
                        }`}
                      >
                        {allPaid
                          ? 'Tout est réglé'
                          : `${paidSharesCount}/${totalSharesCount} réglés`}
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredExpenses.length === 0 && (
                <div className="py-4 text-center">
                  <p className="text-[13px] font-bold text-[#290764]">
                    Aucune dépense partagée pour le moment
                  </p>
                  <p className="text-[11.5px] text-[#7D7693] mt-0.5">
                    Ajoutez une dépense pour la diviser entre les membres de{' '}
                    {activeCommunity.name}.
                  </p>
                </div>
              )}
            </div>

            {/* Primary CTA to add & split a new community expense */}
            <button
              type="button"
              onClick={() => {
                setExpCommId(activeCommunity.id);
                setExpPaidBy('Lamia (Vous)');
                setIsExpenseEntrySheetOpen(true);
              }}
              className="w-full h-11 rounded-full bg-[#F3EDFF] hover:bg-[#E7DCFF] text-[#5E1DF0] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
            >
              <Plus size={15} strokeWidth={2.4} />
              <span>Ajouter et diviser une dépense</span>
            </button>
          </section>
        );
      }

      // =====================================================================
      // WIDGET 3: ÉQUILIBRE & REMBOURSEMENTS (What you owe / should receive)
      // =====================================================================
      case 'w-communaute-equilibre': {
        const visibleBalances = filteredBalances.filter((b) => {
          if (balanceTab === 'ALL') return true;
          return b.direction === balanceTab;
        });

        return (
          <section key={widgetId} className="card-simple p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
                  <HeartHandshake size={19} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[16px] font-extrabold text-[#14111F] leading-tight">
                    Équilibre & remboursements
                  </h3>
                  <p className="text-[11.5px] text-[#7D7693]">
                    Voyez qui doit quoi.
                  </p>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold tabular-nums shrink-0 ${
                  netCommunityBalance >= 0
                    ? 'bg-[#E7F7F0] text-[#0F7B52]'
                    : 'bg-[#FFF3E2] text-[#B45309]'
                }`}
              >
                {netCommunityBalance >= 0
                  ? `+${formatDH(netCommunityBalance)}`
                  : `−${formatDH(Math.abs(netCommunityBalance))}`}
              </span>
            </div>

            {/* 3-Column Financial Balance Summary */}
            <div className="grid grid-cols-3 gap-2 p-3.5 rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8]">
              <div>
                <span className="text-[11px] font-medium text-[#7D7693] flex items-center gap-1">
                  <ArrowDownLeft size={12} className="text-[#0F7B52]" />
                  On vous doit
                </span>
                <p className="text-[15px] font-extrabold text-[#0F7B52] tabular-nums mt-0.5">
                  +{formatDH(totalOwedToYou)}
                </p>
              </div>

              <div className="pl-2.5 border-l border-[#EFEBF8]">
                <span className="text-[11px] font-medium text-[#7D7693] flex items-center gap-1">
                  <ArrowUpRight size={12} className="text-[#D97706]" />
                  Vous devez
                </span>
                <p className="text-[15px] font-extrabold text-[#D97706] tabular-nums mt-0.5">
                  {formatDH(totalYouOwe)}
                </p>
              </div>

              <div className="pl-2.5 border-l border-[#EFEBF8]">
                <span className="text-[11px] font-medium text-[#7D7693] block">
                  Solde net
                </span>
                <p
                  className={`text-[15px] font-extrabold tabular-nums mt-0.5 ${
                    netCommunityBalance >= 0
                      ? 'text-[#290764]'
                      : 'text-[#E11D48]'
                  }`}
                >
                  {netCommunityBalance >= 0
                    ? `+${formatDH(netCommunityBalance)}`
                    : `−${formatDH(Math.abs(netCommunityBalance))}`}
                </p>
              </div>
            </div>

            {/* Filter Pills: Tous | On me doit | Je dois */}
            <div className="flex items-center gap-1.5">
              {[
                { id: 'ALL' as const, label: 'Tous les soldes' },
                {
                  id: 'OWES_YOU' as const,
                  label: `À recevoir (${
                    filteredBalances.filter(
                      (b) => b.direction === 'OWES_YOU' && b.status === 'PENDING'
                    ).length
                  })`,
                },
                {
                  id: 'YOU_OWE' as const,
                  label: `À régler (${
                    filteredBalances.filter(
                      (b) => b.direction === 'YOU_OWE' && b.status === 'PENDING'
                    ).length
                  })`,
                },
              ].map((pill) => {
                const active = balanceTab === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setBalanceTab(pill.id)}
                    className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold transition-all ${
                      active
                        ? 'bg-[#290764] text-white shadow-2xs'
                        : 'bg-[#F5F1FF] text-[#6B5E94] hover:bg-[#EAE2FF]'
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Participant Balance Rows */}
            <div className="divide-y divide-[#F3EFFA]">
              {visibleBalances.map((item) => {
                const isSettled = item.status === 'SETTLED';
                const owesYou = item.direction === 'OWES_YOU';

                return (
                  <div
                    key={item.id}
                    className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt={item.participantName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border border-[#E4D8FC] shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#5E1DF0] font-extrabold text-xs flex items-center justify-center shrink-0">
                          {item.avatarInitials}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[13.5px] font-extrabold text-[#14111F] truncate">
                            {item.participantName}
                          </p>
                          <span
                            className={`text-[11px] font-extrabold tabular-nums shrink-0 ${
                              isSettled
                                ? 'text-[#7D7693] line-through'
                                : owesYou
                                ? 'text-[#0F7B52]'
                                : 'text-[#D97706]'
                            }`}
                          >
                            {owesYou
                              ? `+${formatDH(item.amount)}`
                              : `−${formatDH(item.amount)}`}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-[#7D7693] truncate mt-0.5">
                          {owesYou ? 'Vous doit' : 'Vous lui devez'} ·{' '}
                          {item.contextLabel}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSettled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E7F7F0] text-[#0F7B52] text-[11px] font-bold">
                          <Check size={12} strokeWidth={2.5} />
                          Réglé
                        </span>
                      ) : owesYou ? (
                        <>
                          <button
                            type="button"
                            onClick={() => remindCommunityBalance(item.id)}
                            className="px-2.5 py-1.5 rounded-full bg-[#F5F1FF] hover:bg-[#EAE0FF] text-[#5E1DF0] text-[11px] font-bold transition-colors"
                          >
                            Relancer
                          </button>
                          <button
                            type="button"
                            onClick={() => settleCommunityBalance(item.id)}
                            className="px-2.5 py-1.5 rounded-full bg-[#E7F7F0] hover:bg-[#D1F2E3] text-[#0F7B52] text-[11px] font-bold transition-colors"
                          >
                            Reçu ✓
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSettlingBalance(item)}
                          className="px-3 py-1.5 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[11.5px] font-bold shadow-2xs transition-all active:scale-[0.98]"
                        >
                          Rembourser
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {visibleBalances.length === 0 && (
                <div className="py-4 text-center">
                  <p className="text-[13px] font-bold text-[#290764]">
                    Aucun solde dans cette vue
                  </p>
                  <p className="text-[11.5px] text-[#7D7693] mt-0.5">
                    Les comptes de {activeCommunity.name} sont parfaitement
                    équilibrés.
                  </p>
                </div>
              )}
            </div>
          </section>
        );
      }

      // =====================================================================
      // WIDGET 4: ACTIVITÉ FINANCIÈRE DE LA COMMUNAUTÉ (Authorized Activity)
      // =====================================================================
      case 'w-communaute-activite': {
        return (
          <section key={widgetId} className="card-simple p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
                  <Clock size={19} strokeWidth={2.2} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[16px] font-extrabold text-[#14111F] leading-tight">
                    Activité de la communauté
                  </h3>
                  <p className="text-[11.5px] text-[#7D7693]">
                    Retrouvez les contributions et dépenses du groupe.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCommunityInfoOpen(true)}
                className="px-2.5 py-1 rounded-full bg-[#E7F7F0] text-[#0F7B52] text-[10.5px] font-bold flex items-center gap-1 shrink-0"
              >
                <ShieldCheck size={12} />
                <span>Autorisée</span>
              </button>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {[
                { id: 'ALL' as const, label: 'Toute l’activité' },
                { id: 'CAGNOTTE_CONTRIBUTION' as const, label: 'Cagnottes' },
                { id: 'SHARED_EXPENSE' as const, label: 'Dépenses' },
                { id: 'SETTLEMENT' as const, label: 'Règlements' },
              ].map((f) => {
                const active = activityFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActivityFilter(f.id)}
                    className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold whitespace-nowrap transition-all ${
                      active
                        ? 'bg-[#5E1DF0] text-white shadow-2xs'
                        : 'bg-[#F5F1FF] text-[#6B5E94] hover:bg-[#EAE2FF]'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Chronological Feed */}
            <div className="divide-y divide-[#F3EFFA]">
              {filteredActivities.slice(0, 6).map((act) => (
                <div
                  key={act.id}
                  className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {act.avatarUrl ? (
                      <img
                        src={act.avatarUrl}
                        alt={act.actorName}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-full object-cover border border-[#E4D8FC] shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#F2EDFF] text-[#8000EB] font-extrabold text-xs flex items-center justify-center shrink-0">
                        {act.avatarInitials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-[#14111F] leading-snug truncate">
                        {act.title}
                      </p>
                      <p className="text-[11px] text-[#7D7693] truncate mt-0.5">
                        {act.subtitle}
                      </p>
                    </div>
                  </div>

                  {act.amount !== undefined && (
                    <span
                      className={`text-[13px] font-extrabold tabular-nums shrink-0 ${
                        act.type === 'CAGNOTTE_CONTRIBUTION' || act.isPositive
                          ? 'text-[#0F7B52]'
                          : 'text-[#14111F]'
                      }`}
                    >
                      {act.type === 'CAGNOTTE_CONTRIBUTION'
                        ? `+${formatDH(act.amount)}`
                        : formatDH(act.amount)}
                    </span>
                  )}
                </div>
              ))}

              {filteredActivities.length === 0 && (
                <div className="py-4 text-center">
                  <p className="text-[13px] font-bold text-[#290764]">
                    Aucune activité dans ce filtre
                  </p>
                  <p className="text-[11.5px] text-[#7D7693] mt-0.5">
                    Les opérations de {activeCommunity.name} apparaîtront ici.
                  </p>
                </div>
              )}
            </div>
          </section>
        );
      }

      // =====================================================================
      // WIDGET 5: MEMBRES & RÈGLES DE TRANSPARENCE
      // =====================================================================
      case 'w-communaute-membres': {
        return (
          <section key={widgetId} className="card-simple p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
                  <Users size={19} strokeWidth={2.2} />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#8000EB] uppercase tracking-wide block">
                    Participants actifs ({activeCommunity.members.length})
                  </span>
                  <h3 className="text-[16px] font-extrabold text-[#14111F]">
                    Membres · {activeCommunity.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCommunityInfoOpen(true)}
                className="text-[12.5px] font-bold text-[#5E1DF0] hover:underline"
              >
                Gérer
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeCommunity.members.map((m) => (
                <div
                  key={m.id}
                  className="px-3 py-1.5 rounded-full bg-[#FAF8FE] border border-[#EFEBF8] flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-[#8000EB] text-white text-[10px] font-bold flex items-center justify-center overflow-hidden">
                    {m.avatarUrl ? (
                      <img
                        src={m.avatarUrl}
                        alt={m.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      m.avatarInitials
                    )}
                  </div>
                  <span className="text-[12px] font-bold text-[#290764]">
                    {m.name}
                  </span>
                  <span className="text-[10px] font-semibold text-[#7D7693]">
                    ({m.role})
                  </span>
                </div>
              ))}
            </div>
          </section>
        );
      }

      default:
        return null;
    }
  };

  // =========================================================================
  // MAIN RENDER: PRESENTATION PAGE (0 COMMUNITIES OR EXPLICIT PRESENTATION)
  //              OR MES COMMUNAUTÉS DASHBOARD (>= 1 COMMUNITY)
  // =========================================================================
  return (
    <div className="space-y-4">
      {showPresentation ? (
        <div className="space-y-5 pt-1 pb-2">
          <header className="px-0.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#8000EB] block">
                SIMPLE COMMUNAUTÉ
              </span>
              {hasCommunities && (
                <button
                  type="button"
                  onClick={() => setIsDiscoveryMode(false)}
                  className="text-[11.5px] font-bold text-[#5E1DF0] underline"
                >
                  Retour à mes communautés ({communities.length})
                </button>
              )}
            </div>
            <h2 className="text-[22px] font-extrabold text-[#290764] leading-[1.2] tracking-tight">
              Et si vos projets à plusieurs devenaient plus simples ?
            </h2>
            <p className="text-[13.5px] text-[#62586F] leading-relaxed">
              Des projets communs, des dépenses partagées et des cagnottes pour
              avancer ensemble.
            </p>
          </header>

          <div className="relative w-full h-[192px] rounded-[24px] overflow-hidden shadow-[0_12px_26px_-8px_rgba(41,7,100,0.18)] border border-white/60 bg-[#F5F2FA]">
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&auto=format&fit=crop&q=80"
              alt="Groupe d'amis réunis"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14111F]/65 via-transparent to-transparent" />
          </div>

          <div className="space-y-2.5 px-0.5">
            {[
              {
                icon: PiggyBank,
                title: 'Collecter avec nos cagnottes',
                subtitle:
                  'Réunissez des fonds pour un voyage, un cadeau groupé ou un événement.',
                iconStyle: 'bg-[#F3EBFF] text-[#8000EB]',
              },
              {
                icon: Receipt,
                title: 'Diviser les dépenses partagées',
                subtitle:
                  'Répartissez les frais à parts égales ou personnalisées en quelques secondes.',
                iconStyle: 'bg-[#FFF3E8] text-[#D97706]',
              },
              {
                icon: HeartHandshake,
                title: 'Régler les comptes sans gêne',
                subtitle:
                  'Visualisez immédiatement qui doit quoi et remboursez en un geste.',
                iconStyle: 'bg-[#E7F7F0] text-[#0F7B52]',
              },
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-center gap-3.5 py-2.5 px-3.5 rounded-[18px] bg-white/85 backdrop-blur-xs border border-white/90 shadow-[0_4px_14px_-6px_rgba(41,7,100,0.06)]"
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
                    <p className="text-[12px] text-[#62586F] leading-snug mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-1 space-y-2">
            <button
              type="button"
              onClick={() => setIsCreateCommunityOpen(true)}
              className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-[0_10px_22px_-6px_rgba(128,0,235,0.38)] transition-all active:scale-[0.99]"
            >
              <Plus size={17} strokeWidth={2.5} />
              <span>Créer une nouvelle communauté</span>
            </button>
            {hasCommunities && (
              <button
                type="button"
                onClick={() => setIsDiscoveryMode(false)}
                className="w-full h-11 rounded-full bg-[#F3EDFF] text-[#5E1DF0] text-[13px] font-bold hover:bg-[#E7DCFF] transition-colors"
              >
                Explorer mes {communities.length} communauté
                {communities.length > 1 ? 's' : ''} active
                {communities.length > 1 ? 's' : ''} →
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
      {/* 1. COMMUNITY SWITCHER BAR (Always 1 specific community selected) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#8000EB]">
              Mes communautés ({communities.length})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDiscoveryMode(true)}
              className="text-[11.5px] font-semibold text-[#7D7693] hover:text-[#290764]"
            >
              Présentation
            </button>
            <button
              type="button"
              onClick={() => setIsCreateCommunityOpen(true)}
              className="text-[12px] font-extrabold text-[#8000EB] hover:underline flex items-center gap-0.5"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>Nouveau groupe</span>
            </button>
          </div>
        </div>

        {/* Horizontal Community Pills (No "Toutes" filter — 1 active community at a time) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {communities.map((comm) => {
            const isSelected = activeCommunity.id === comm.id;
            return (
              <button
                key={comm.id}
                type="button"
                onClick={() => handleSelectCommunity(comm.id)}
                className={`px-3.5 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#8000EB] text-white shadow-xs'
                    : 'bg-white text-[#14111F] border border-[#E5DDF5] hover:bg-[#F5F1FF]'
                }`}
              >
                <span className="whitespace-nowrap">{comm.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold shrink-0 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[#F3EBFF] text-[#8000EB]'
                  }`}
                >
                  {comm.members.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. FEATURED COMMUNITY HEADER CARD */}
      <section className="card-simple p-4 space-y-3">
        <div className="relative w-full h-[134px] rounded-[18px] overflow-hidden bg-[#F5F2FA]">
          <img
            src={activeCommunity.coverUrl}
            alt={activeCommunity.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14111F]/80 via-[#14111F]/25 to-transparent" />

          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/92 backdrop-blur-xs text-[#290764] text-[10.5px] font-extrabold shadow-2xs">
            {activeCommunity.categoryTag}
          </span>

          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#E7F7F0]/95 backdrop-blur-xs text-[#0F7B52] text-[10.5px] font-bold shadow-2xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F7B52]" />
            Rôle : {currentUserMember?.role || 'Membre'}
          </span>

          <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between gap-2 text-white">
            <div className="min-w-0">
              <h2 className="text-[17px] font-extrabold leading-tight truncate">
                {activeCommunity.name}
              </h2>
              <p className="text-[11.5px] text-white/85 truncate mt-0.5">
                {activeCommunity.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Members Avatars & Role Management Row */}
        <div className="px-0.5 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex -space-x-2 overflow-hidden shrink-0">
              {activeCommunity.members.slice(0, 4).map((m) =>
                m.avatarUrl ? (
                  <img
                    key={m.id}
                    src={m.avatarUrl}
                    alt={m.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
                  />
                ) : (
                  <div
                    key={m.id}
                    className="w-8 h-8 rounded-full bg-[#8000EB] text-white text-[11px] font-extrabold flex items-center justify-center ring-2 ring-white"
                  >
                    {m.avatarInitials}
                  </div>
                )
              )}
              {activeCommunity.members.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-[#F3EBFF] text-[#8000EB] text-[10.5px] font-extrabold flex items-center justify-center ring-2 ring-white">
                  +{activeCommunity.members.length - 4}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsCommunityInfoOpen(true)}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-[#F5F1FF] hover:bg-[#EAE0FF] text-[#5E1DF0] text-[11.5px] font-bold whitespace-nowrap transition-colors shrink-0"
            >
              <UserPlus size={12} strokeWidth={2.3} />
              <span>Membres & rôles</span>
            </button>
          </div>

          <p className="text-[12px] font-extrabold text-[#290764] leading-tight">
            {activeCommunity.members.length} participant
            {activeCommunity.members.length > 1 ? 's' : ''}
          </p>
        </div>
      </section>

      {/* 3. ORDERED & CUSTOMIZABLE COMMUNITY WIDGETS */}
      {activeCommunityWidgets.map((w) => renderCommunityWidget(w.id))}

      {/* 4. CUSTOMIZATION FOOTER (+ Widgets Communauté) */}
      {renderCategoryPersonalizeFooter()}
        </>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: CAGNOTTE DETAIL & CONTRIBUTIONS SHEET                      */}
      {/* =================================================================== */}
      {currentCagnotteDetail && (
        <div
          className="fixed inset-0 z-50 bg-[#14111F]/50 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setActiveCagnotteDetail(null)}
        >
          <div
            className="w-full max-w-[412px] max-h-[88vh] overflow-y-auto bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t border-[#EFEBF8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />

            <div className="relative w-full h-[140px] rounded-[20px] overflow-hidden bg-[#F5F2FA]">
              <img
                src={currentCagnotteDetail.imageUrl}
                alt={currentCagnotteDetail.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14111F]/80 via-[#14111F]/25 to-transparent" />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-[#290764] text-[10.5px] font-extrabold">
                {currentCagnotteDetail.communityName}
              </span>
              <button
                type="button"
                onClick={() => setActiveCagnotteDetail(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                <h3 className="text-[18px] font-extrabold leading-snug">
                  {currentCagnotteDetail.title}
                </h3>
              </div>
            </div>

            <p className="text-[12.5px] text-[#62586F] leading-relaxed">
              {currentCagnotteDetail.description}
            </p>

            {/* Progress Card */}
            <div className="p-4 rounded-[20px] bg-[#FAF8FE] border border-[#EFEBF8] space-y-2.5">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-[#7D7693] block">
                    Montant collecté
                  </span>
                  <span className="text-[24px] font-extrabold text-[#290764] tabular-nums">
                    {formatDH(currentCagnotteDetail.collectedAmount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-[#7D7693] block">
                    Objectif
                  </span>
                  <span className="text-[15px] font-extrabold text-[#14111F] tabular-nums">
                    {formatDH(currentCagnotteDetail.targetAmount)}
                  </span>
                </div>
              </div>

              <div className="w-full h-2.5 rounded-full bg-[#EAE2FF] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#8000EB] transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (currentCagnotteDetail.collectedAmount /
                          Math.max(1, currentCagnotteDetail.targetAmount)) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11.5px] font-semibold text-[#7D7693]">
                <span>
                  {currentCagnotteDetail.contributorsCount}/
                  {currentCagnotteDetail.totalMembersCount} participants ont
                  cotisé
                </span>
                <span>Échéance : {currentCagnotteDetail.deadline}</span>
              </div>
            </div>

            {/* Contributions List */}
            <div className="space-y-2">
              <h4 className="text-[12px] font-extrabold uppercase tracking-wider text-[#7D7693]">
                Historique des contributions (
                {currentCagnotteDetail.contributions.length})
              </h4>
              <div className="divide-y divide-[#F3EFFA] max-h-[210px] overflow-y-auto pr-1">
                {currentCagnotteDetail.contributions.map((c) => (
                  <div
                    key={c.id}
                    className="py-2.5 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#F2EDFF] text-[#8000EB] font-extrabold text-xs flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
                        {c.avatarUrl ? (
                          <img
                            src={c.avatarUrl}
                            alt={c.participantName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          c.avatarInitials
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-[#14111F]">
                          {c.participantName}
                        </p>
                        <p className="text-[11px] text-[#7D7693]">{c.date}</p>
                        {c.note && (
                          <p className="text-[11.5px] text-[#5E1DF0] bg-[#F5F1FF] px-2.5 py-1 rounded-xl mt-1">
                            « {c.note} »
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[13px] font-extrabold text-[#0F7B52] tabular-nums shrink-0">
                      +{formatDH(c.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-1 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const cag = currentCagnotteDetail;
                  setActiveCagnotteDetail(null);
                  setContributingCagnotte(cag);
                }}
                className="flex-1 h-11 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Participer à la cagnotte</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(
                    'Lien de cagnotte copié',
                    `Partagez « ${currentCagnotteDetail.title} » avec vos proches.`
                  );
                }}
                className="h-11 px-4 rounded-full bg-[#F3EDFF] text-[#5E1DF0] text-[12.5px] font-bold flex items-center gap-1.5"
              >
                <Share2 size={14} />
                <span>Partager</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: CONTRIBUTE TO CAGNOTTE SHEET                               */}
      {/* =================================================================== */}
      {contributingCagnotte && (
        <div
          className="fixed inset-0 z-50 bg-[#14111F]/50 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setContributingCagnotte(null)}
        >
          <div
            className="w-full max-w-[412px] bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t border-[#EFEBF8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />

            <div>
              <span className="text-[11px] font-bold text-[#8000EB] uppercase tracking-wide block">
                Participation cagnotte · {contributingCagnotte.communityName}
              </span>
              <h3 className="text-[18px] font-extrabold text-[#290764] mt-0.5">
                {contributingCagnotte.title}
              </h3>
              <p className="text-[12px] text-[#7D7693] mt-0.5">
                Déjà {formatDH(contributingCagnotte.collectedAmount)} sur{' '}
                {formatDH(contributingCagnotte.targetAmount)}
              </p>
            </div>

            {/* Preset Amounts */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[#14111F] block">
                Montant de votre participation (DH)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['200', '400', '500', '1000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setContribAmountInput(amt)}
                    className={`h-9 rounded-full text-[12px] font-extrabold transition-all ${
                      contribAmountInput === amt
                        ? 'bg-[#8000EB] text-white shadow-2xs'
                        : 'bg-[#F5F1FF] text-[#290764] hover:bg-[#EAE0FF]'
                    }`}
                  >
                    {amt} DH
                  </button>
                ))}
              </div>
              <div className="relative mt-2">
                <input
                  type="number"
                  value={contribAmountInput}
                  onChange={(e) => setContribAmountInput(e.target.value)}
                  className="w-full h-12 pl-4 pr-14 rounded-[16px] bg-[#FAF8FE] border border-[#E4D8FC] text-[16px] font-extrabold text-[#14111F] focus:outline-none focus:border-[#8000EB]"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-extrabold text-[#8000EB]">
                  DH
                </span>
              </div>
            </div>

            {/* Optional Note */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#14111F] block">
                Petit mot pour le groupe (facultatif)
              </label>
              <input
                type="text"
                value={contribNoteInput}
                onChange={(e) => setContribNoteInput(e.target.value)}
                placeholder="Ex. Avec plaisir pour notre week-end ! ✨"
                className="w-full h-11 px-3.5 rounded-[14px] bg-[#FAF8FE] border border-[#EFEBF8] text-[13px] text-[#14111F] placeholder:text-[#9A93B0] focus:outline-none focus:border-[#8000EB]"
              />
            </div>

            <div className="p-3 rounded-[14px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-center justify-between text-[12px]">
              <span className="text-[#7D7693]">Compte débité :</span>
              <strong className="text-[#290764]">
                Compte Principal ({formatDH(mainAccountBalance, true)})
              </strong>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmContribution}
                className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-bold shadow-xs transition-all"
              >
                Confirmer le versement de {contribAmountInput || 0} DH
              </button>
              <button
                type="button"
                onClick={() => setContributingCagnotte(null)}
                className="w-full h-10 rounded-full text-[12.5px] font-bold text-[#7D7693]"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: CREATE NEW CAGNOTTE SHEET                                  */}
      {/* =================================================================== */}
      {isCreateCagnotteOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#14111F]/50 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setIsCreateCagnotteOpen(false)}
        >
          <div
            className="w-full max-w-[412px] max-h-[88vh] overflow-y-auto bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t border-[#EFEBF8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />
            <div>
              <span className="text-[11px] font-bold text-[#8000EB] uppercase tracking-wide block">
                Nouvelle cagnotte collective
              </span>
              <h3 className="text-[18px] font-extrabold text-[#290764] mt-0.5">
                Collecter de l&apos;argent ensemble
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-bold text-[#14111F] block mb-1">
                  Communauté associée
                </label>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {communities.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNewCagCommId(c.id)}
                      className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold whitespace-nowrap ${
                        newCagCommId === c.id
                          ? 'bg-[#8000EB] text-white'
                          : 'bg-[#F5F1FF] text-[#290764]'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#14111F] block mb-1">
                  Titre de la cagnotte
                </label>
                <input
                  type="text"
                  value={newCagTitle}
                  onChange={(e) => setNewCagTitle(e.target.value)}
                  placeholder="Ex. Excursion Quad Agafay, Cadeau départ..."
                  className="w-full h-11 px-3.5 rounded-[14px] bg-[#FAF8FE] border border-[#E4D8FC] text-[13.5px] font-semibold text-[#14111F] focus:outline-none focus:border-[#8000EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[12px] font-bold text-[#14111F] block mb-1">
                    Objectif (DH)
                  </label>
                  <input
                    type="number"
                    value={newCagTarget}
                    onChange={(e) => setNewCagTarget(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-[14px] bg-[#FAF8FE] border border-[#E4D8FC] text-[14px] font-extrabold text-[#14111F]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-[#14111F] block mb-1">
                    Premier versement (DH)
                  </label>
                  <input
                    type="number"
                    value={newCagInitDeposit}
                    onChange={(e) => setNewCagInitDeposit(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-[14px] bg-[#FAF8FE] border border-[#E4D8FC] text-[14px] font-extrabold text-[#8000EB]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#14111F] block mb-1">
                  Date cible / Échéance
                </label>
                <input
                  type="text"
                  value={newCagDeadline}
                  onChange={(e) => setNewCagDeadline(e.target.value)}
                  placeholder="Ex. 30 nov. 2026"
                  className="w-full h-11 px-3.5 rounded-[14px] bg-[#FAF8FE] border border-[#EFEBF8] text-[13px] text-[#14111F]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmCreateCagnotte}
                disabled={!newCagTitle.trim()}
                className="w-full h-12 rounded-full bg-[#8000EB] disabled:opacity-45 hover:bg-[#6E00CA] text-white text-[14px] font-bold shadow-xs transition-all"
              >
                Lancer la cagnotte
              </button>
              <button
                type="button"
                onClick={() => setIsCreateCagnotteOpen(false)}
                className="w-full h-10 rounded-full text-[12.5px] font-bold text-[#7D7693]"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: SHARED EXPENSE BREAKDOWN DETAIL SHEET                      */}
      {/* =================================================================== */}
      {currentExpenseDetail && (
        <div
          className="fixed inset-0 z-50 bg-[#14111F]/50 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setActiveExpenseDetail(null)}
        >
          <div
            className="w-full max-w-[412px] max-h-[85vh] overflow-y-auto bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t border-[#EFEBF8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <CategoryIcon category={currentExpenseDetail.category} size="md" />
                <div>
                  <span className="text-[11px] font-bold text-[#8000EB] block">
                    {currentExpenseDetail.communityName}
                  </span>
                  <h3 className="text-[17px] font-extrabold text-[#14111F]">
                    {currentExpenseDetail.title}
                  </h3>
                  <p className="text-[12px] text-[#7D7693]">
                    {currentExpenseDetail.date} · Payé par{' '}
                    <strong className="text-[#290764]">
                      {currentExpenseDetail.paidByName}
                    </strong>
                  </p>
                </div>
              </div>
              <span className="text-[18px] font-extrabold text-[#290764] tabular-nums shrink-0">
                {formatDH(currentExpenseDetail.totalAmount)}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11.5px] font-extrabold uppercase tracking-wider text-[#7D7693]">
                Répartition par participant ({currentExpenseDetail.shares.length})
              </h4>
              <div className="divide-y divide-[#F3EFFA]">
                {currentExpenseDetail.shares.map((sh) => (
                  <div
                    key={sh.participantId}
                    className="py-2.5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#F2EDFF] text-[#8000EB] font-extrabold text-xs flex items-center justify-center overflow-hidden">
                        {sh.avatarUrl ? (
                          <img
                            src={sh.avatarUrl}
                            alt={sh.participantName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          sh.avatarInitials
                        )}
                      </div>
                      <span className="text-[13px] font-bold text-[#14111F]">
                        {sh.participantName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-extrabold text-[#14111F] tabular-nums">
                        {formatDH(sh.amount)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                          sh.status === 'PAID'
                            ? 'bg-[#E7F7F0] text-[#0F7B52]'
                            : 'bg-[#FFF3E2] text-[#D97706]'
                        }`}
                      >
                        {sh.status === 'PAID' ? 'Réglé' : 'En attente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveExpenseDetail(null)}
              className="w-full h-11 rounded-full bg-[#F3EDFF] text-[#5E1DF0] text-[13px] font-bold"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Hidden file inputs for Camera Scan & Bill Import */}
      <input
        ref={scanFileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileInputChange(e, 'SCAN')}
        className="hidden"
      />
      <input
        ref={importFileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => handleFileInputChange(e, 'IMPORT')}
        className="hidden"
      />

      {/* =================================================================== */}
      {/* MODAL 5A: EXPENSE ENTRY METHOD BOTTOM SHEET ("Ajouter une dépense") */}
      {/* =================================================================== */}
      {isExpenseEntrySheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#14111F]/50 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setIsExpenseEntrySheetOpen(false)}
        >
          <div
            className="w-full max-w-[412px] bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t border-[#EFEBF8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[18px] font-extrabold text-[#14111F] leading-tight">
                  Ajouter une dépense
                </h3>
                <p className="text-[12px] text-[#7D7693] mt-0.5">
                  Choisissez comment renseigner cette dépense pour{' '}
                  <strong className="text-[#290764]">
                    {activeCommunity.name}
                  </strong>
                  .
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExpenseEntrySheetOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F5F1FF] text-[#6E6785] hover:text-[#290764] flex items-center justify-center shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* Option 1: Scanner un ticket */}
              <button
                type="button"
                onClick={() => handleChooseScanOrImport('SCAN')}
                className="w-full p-3.5 rounded-[18px] bg-[#FAF8FE] hover:bg-[#F3EBFF]/70 border border-[#EFEBF8] hover:border-[#D8C2FF] flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#F3EBFF] text-[#8000EB] flex items-center justify-center shrink-0">
                    <Camera size={19} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-[#14111F] leading-snug">
                      Scanner un ticket
                    </p>
                    <p className="text-[12px] text-[#7D7693] mt-0.5">
                      Photographiez votre reçu.
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={17}
                  className="text-[#8000EB] shrink-0"
                />
              </button>

              {/* Option 2: Importer une facture */}
              <button
                type="button"
                onClick={() => handleChooseScanOrImport('IMPORT')}
                className="w-full p-3.5 rounded-[18px] bg-[#FAF8FE] hover:bg-[#EEF5FF] border border-[#EFEBF8] hover:border-[#C5DCFD] flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#EEF5FF] text-[#2563EB] flex items-center justify-center shrink-0">
                    <FileText size={19} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-[#14111F] leading-snug">
                      Importer une facture
                    </p>
                    <p className="text-[12px] text-[#7D7693] mt-0.5">
                      Photo ou fichier PDF.
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={17}
                  className="text-[#2563EB] shrink-0"
                />
              </button>

              {/* Option 3: Saisir manuellement */}
              <button
                type="button"
                onClick={handleChooseManualEntry}
                className="w-full p-3.5 rounded-[18px] bg-[#FAF8FE] hover:bg-[#EDF8F2] border border-[#EFEBF8] hover:border-[#BCE8D1] flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#EDF8F2] text-[#059669] flex items-center justify-center shrink-0">
                    <PenLine size={19} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-[#14111F] leading-snug">
                      Saisir manuellement
                    </p>
                    <p className="text-[12px] text-[#7D7693] mt-0.5">
                      Renseignez les détails vous-même.
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={17}
                  className="text-[#059669] shrink-0"
                />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsExpenseEntrySheetOpen(false)}
              className="w-full h-10 rounded-full text-[12.5px] font-bold text-[#7D7693]"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5A-BIS: RECEIPT SCANNER & PHOTO VALIDATION ("Scanner votre ticket") */}
      {/* =================================================================== */}
      {isTicketScannerOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#14111F]/65 backdrop-blur-xs flex items-end justify-center"
          onClick={() => {
            if (scannerStep !== 'PROCESSING') {
              stopCameraStream();
              setIsTicketScannerOpen(false);
            }
          }}
        >
          <div
            className="w-full max-w-[412px] max-h-[92vh] overflow-y-auto bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t border-[#EFEBF8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-[#8000EB] uppercase tracking-wide block">
                  {scannerStep === 'CAMERA'
                    ? 'Capture du reçu'
                    : scannerStep === 'PREVIEW'
                      ? 'Validation de la photo'
                      : 'Lecture intelligente OCR'}
                </span>
                <h3 className="text-[18px] font-extrabold text-[#14111F] mt-0.5">
                  Scanner votre ticket
                </h3>
                <p className="text-[12px] text-[#7D7693] mt-0.5">
                  {scannerStep === 'CAMERA'
                    ? 'Cadrez votre ticket de caisse pour extraire automatiquement les montants.'
                    : scannerStep === 'PREVIEW'
                      ? 'Vérifiez que le ticket est net et lisible avant l’extraction.'
                      : 'Extraction des informations du reçu en cours...'}
                </p>
              </div>
              {scannerStep !== 'PROCESSING' && (
                <button
                  type="button"
                  onClick={() => {
                    stopCameraStream();
                    setIsTicketScannerOpen(false);
                  }}
                  className="w-8 h-8 rounded-full bg-[#F5F1FF] text-[#6E6785] hover:text-[#290764] flex items-center justify-center shrink-0"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* STEP 1: CAMERA VIEW WITH RECEIPT FRAMING GUIDE */}
            {scannerStep === 'CAMERA' && (
              <div className="space-y-4">
                <div className="relative w-full h-[320px] rounded-[22px] bg-[#14111F] overflow-hidden border border-[#2D2546] flex items-center justify-center">
                  {/* Live video element */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      cameraAvailable && cameraReady
                        ? 'opacity-100'
                        : 'opacity-0 pointer-events-none absolute inset-0'
                    }`}
                  />

                  {/* Simulated viewfinder backdrop when camera is unavailable or initializing */}
                  {(!cameraAvailable || !cameraReady) && (
                    <div className="inset-0 w-full h-full flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-[#1E1930] via-[#171326] to-[#120E1E]">
                      <div className="w-44 rounded-[12px] bg-white/95 p-3.5 shadow-lg border border-white/20 text-left space-y-2 opacity-90">
                        <div className="text-center border-b border-dashed border-[#D8D0E8] pb-1.5">
                          <p className="text-[9.5px] font-extrabold text-[#14111F] truncate">
                            {(
                              DEMO_OCR_SAMPLES[activeCommunity.id] ||
                              DEMO_OCR_SAMPLES['comm-marrakech']
                            ).SCAN.merchant.toUpperCase()}
                          </p>
                          <p className="text-[8px] text-[#7D7693]">
                            REÇU · 20 OCT. 2026
                          </p>
                        </div>
                        <div className="space-y-1">
                          {(
                            DEMO_OCR_SAMPLES[activeCommunity.id] ||
                            DEMO_OCR_SAMPLES['comm-marrakech']
                          ).SCAN.items.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-[8px] text-[#290764] font-medium"
                            >
                              <span className="truncate pr-2">{it.label}</span>
                              <span className="font-bold shrink-0">
                                {it.amount} DH
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-dashed border-[#D8D0E8] pt-1.5 flex justify-between items-center text-[9.5px] font-extrabold text-[#8000EB]">
                          <span>TOTAL TTC</span>
                          <span>
                            {
                              (
                                DEMO_OCR_SAMPLES[activeCommunity.id] ||
                                DEMO_OCR_SAMPLES['comm-marrakech']
                              ).SCAN.totalAmount
                            }{' '}
                            DH
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Receipt Framing Guide Overlay */}
                  <div className="absolute inset-4 pointer-events-none flex flex-col justify-between">
                    {/* Top corners */}
                    <div className="flex justify-between">
                      <div className="w-7 h-7 border-t-[3px] border-l-[3px] border-[#A855F7] rounded-tl-[10px]" />
                      <div className="px-2.5 py-1 rounded-full bg-[#14111F]/75 backdrop-blur-xs border border-white/15 text-[10.5px] font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                        <span>Alignez les bords du ticket</span>
                      </div>
                      <div className="w-7 h-7 border-t-[3px] border-r-[3px] border-[#A855F7] rounded-tr-[10px]" />
                    </div>

                    {/* Inner dashed receipt guide */}
                    <div className="mx-auto w-[72%] h-[68%] border border-dashed border-white/35 rounded-[12px]" />

                    {/* Bottom corners */}
                    <div className="flex justify-between items-end">
                      <div className="w-7 h-7 border-b-[3px] border-l-[3px] border-[#A855F7] rounded-bl-[10px]" />
                      <span className="text-[10px] font-semibold text-white/80 bg-[#14111F]/70 px-2.5 py-0.5 rounded-full">
                        Commerçant · Date · Total
                      </span>
                      <div className="w-7 h-7 border-b-[3px] border-r-[3px] border-[#A855F7] rounded-br-[10px]" />
                    </div>
                  </div>
                </div>

                {/* Primary & Secondary CTAs directly below the scanning preview (16px spacing via space-y-4) */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleTakeReceiptPhoto}
                    className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <Camera size={17} strokeWidth={2.2} />
                    <span>Prendre la photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      stopCameraStream();
                      setIsTicketScannerOpen(false);
                      setIsExpenseEntrySheetOpen(true);
                    }}
                    className="w-full h-10 rounded-full text-[12.5px] font-bold text-[#7D7693]"
                  >
                    Retour aux options
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PHOTO PREVIEW ("Reprendre" / "Valider le ticket") */}
            {scannerStep === 'PREVIEW' && (
              <div className="space-y-3.5">
                <div className="relative w-full h-[320px] rounded-[22px] bg-[#14111F] overflow-hidden border border-[#E4D5FF] flex items-center justify-center">
                  {capturedPhotoUrl && (
                    <img
                      src={capturedPhotoUrl}
                      alt="Aperçu du ticket capturé"
                      className="w-full h-full object-contain bg-[#1B162A]"
                    />
                  )}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#14111F]/80 backdrop-blur-xs text-white text-[10.5px] font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#10B981]" />
                    <span>
                      {capturedFileName
                        ? `Photo : ${capturedFileName}`
                        : 'Ticket capturé'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleRetakeReceiptPhoto}
                    className="flex-1 h-12 rounded-full bg-[#F5F1FF] hover:bg-[#EAE0FF] text-[#290764] text-[13.5px] font-bold transition-colors"
                  >
                    Reprendre
                  </button>
                  <button
                    type="button"
                    onClick={handleValidateScannedTicket}
                    className="flex-1 h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[13.5px] font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Check size={16} strokeWidth={2.5} />
                    <span>Valider le ticket</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SHORT OCR PROCESSING STATE */}
            {scannerStep === 'PROCESSING' && (
              <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-3.5">
                <div className="w-14 h-14 rounded-full bg-[#F5F0FF] border border-[#E4D5FF] flex items-center justify-center text-[#8000EB] animate-pulse">
                  <Sparkles size={26} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[15px] font-extrabold text-[#14111F]">
                    Analyse du ticket en cours...
                  </h4>
                  <p className="text-[12px] text-[#7D7693] max-w-[260px] mx-auto">
                    Identification du commerçant, de la date, des articles et du
                    montant total.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5B: SCAN / IMPORT OCR REVIEW & CONFIRMATION SHEET             */}
      {/* =================================================================== */}
      {isOcrReviewOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#14111F]/50 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setIsOcrReviewOpen(false)}
        >
          <div
            className="w-full max-w-[412px] max-h-[90vh] overflow-y-auto bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t border-[#EFEBF8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-[#8000EB] uppercase tracking-wide block">
                  {ocrSourceType === 'SCAN'
                    ? 'Scan de ticket · Vérification'
                    : 'Import de facture · Vérification'}
                </span>
                <h3 className="text-[18px] font-extrabold text-[#290764] mt-0.5">
                  Vérifier les informations extraites
                </h3>
                <p className="text-[12px] text-[#7D7693] mt-0.5">
                  Vérifiez ou corrigez les champs avant de répartir la dépense.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOcrReviewOpen(false)}
                className="w-8 h-8 rounded-full bg-[#F5F1FF] text-[#6E6785] flex items-center justify-center shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Editable Extracted Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-bold text-[#14111F] block mb-1">
                  Commerçant / Intitulé
                </label>
                <input
                  type="text"
                  value={ocrMerchant}
                  onChange={(e) => setOcrMerchant(e.target.value)}
                  placeholder="Nom du commerçant ou de la facture..."
                  className="w-full h-11 px-3.5 rounded-[14px] bg-[#FAF8FE] border border-[#E4D8FC] text-[13px] font-semibold text-[#14111F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[12px] font-bold text-[#14111F] block mb-1">
                    Date
                  </label>
                  <input
                    type="text"
                    value={ocrDate}
                    onChange={(e) => setOcrDate(e.target.value)}
                    placeholder="Ex. 20 oct. 2026"
                    className="w-full h-11 px-3 rounded-[14px] bg-[#FAF8FE] border border-[#E4D8FC] text-[13px] font-semibold text-[#14111F]"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-[#14111F] block mb-1">
                    Montant total (DH)
                  </label>
                  <input
                    type="number"
                    value={ocrTotalAmount}
                    onChange={(e) => setOcrTotalAmount(e.target.value)}
                    className="w-full h-11 px-3 rounded-[14px] bg-[#FAF8FE] border border-[#E4D8FC] text-[14px] font-extrabold text-[#290764]"
                  />
                </div>
              </div>

              {/* Editable Recognized Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] font-bold text-[#14111F]">
                    Articles détectés ({ocrItems.length})
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setOcrItems((prev) => [
                        ...prev,
                        {
                          id: `ocr-item-${Date.now()}`,
                          label: `Article ${prev.length + 1}`,
                          amount: 100,
                          assignedMemberIds: activeCommunity.members.map(
                            (m) => m.id
                          ),
                        },
                      ])
                    }
                    className="text-[11.5px] font-bold text-[#8000EB] hover:underline flex items-center gap-0.5"
                  >
                    <Plus size={12} strokeWidth={2.5} />
                    <span>Ajouter un article</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[175px] overflow-y-auto pr-1">
                  {ocrItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 rounded-[12px] bg-[#FAF8FE] border border-[#EFEBF8]"
                    >
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) =>
                          setOcrItems((prev) =>
                            prev.map((it) =>
                              it.id === item.id
                                ? { ...it, label: e.target.value }
                                : it
                            )
                          )
                        }
                        placeholder="Nom de l'article"
                        className="flex-1 h-8 px-2.5 rounded-lg bg-white border border-[#E4D8FC] text-[12px] font-semibold text-[#14111F] min-w-0"
                      />
                      <div className="relative w-24 shrink-0">
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) =>
                            setOcrItems((prev) =>
                              prev.map((it) =>
                                it.id === item.id
                                  ? {
                                      ...it,
                                      amount: Math.max(
                                        0,
                                        Number(e.target.value) || 0
                                      ),
                                    }
                                  : it
                              )
                            )
                          }
                          className="w-full h-8 pl-2 pr-7 rounded-lg bg-white border border-[#E4D8FC] text-right text-[12px] font-extrabold text-[#290764]"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#7D7693]">
                          DH
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setOcrItems((prev) =>
                            prev.filter((it) => it.id !== item.id)
                          )
                        }
                        className="w-7 h-7 rounded-lg text-[#7D7693] hover:text-[#E11D48] hover:bg-[#FFF0F5] flex items-center justify-center shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {ocrItems.length > 0 &&
                  ocrItemsTotal !==
                    Math.round(
                      Number(ocrTotalAmount.replace(/\s+/g, '')) || 0
                    ) && (
                    <div className="flex items-center justify-between px-3 py-2 rounded-[12px] bg-[#FFF4E6] border border-[#FFE0BA] text-[11.5px]">
                      <span className="text-[#C2410C] font-semibold">
                        Somme des articles : {formatDH(ocrItemsTotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setOcrTotalAmount(String(ocrItemsTotal))
                        }
                        className="font-extrabold text-[#8000EB] underline"
                      >
                        Aligner le total
                      </button>
                    </div>
                  )}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleProceedFromOcrToSplit}
                disabled={
                  !ocrMerchant.trim() ||
                  (Number(ocrTotalAmount.replace(/\s+/g, '')) || 0) <= 0
                }
                className="w-full h-12 rounded-full bg-[#8000EB] disabled:opacity-45 hover:bg-[#6E00CA] text-white text-[14px] font-bold shadow-xs transition-all"
              >
                Continuer vers le partage
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOcrReviewOpen(false);
                  handleOpenTicketScanner();
                }}
                className="w-full h-10 rounded-full text-[12.5px] font-bold text-[#7D7693]"
              >
                Scanner à nouveau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5C: ADD & SPLIT COMMUNITY SHARED EXPENSE SHEET                */}
      {/* =================================================================== */}
      {isAddExpenseOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#14111F]/50 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setIsAddExpenseOpen(false)}
        >
          <div
            className="w-full max-w-[412px] max-h-[90vh] overflow-y-auto bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t border-[#EFEBF8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />

            {/* 1. HEADER & EXPENSE SUMMARY */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[18px] font-extrabold text-[#290764]">
                  Répartir la dépense
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#F5F1FF] text-[#290764] flex items-center justify-center shrink-0"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="p-3.5 rounded-[18px] bg-[#FAF8FE] border border-[#EAE2FC] space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-extrabold text-[#14111F] leading-snug truncate">
                      {expTitle.trim() || 'Terrasse des Épices'}
                    </p>
                    <p className="text-[12px] font-semibold text-[#7D7693] truncate mt-0.5">
                      {selectedExpenseCommunity.name}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-[#F2E8FF] text-[#8000EB] text-[14px] font-extrabold tabular-nums">
                      {formatDH(expenseNumericTotal)}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (expItems.length > 0) {
                          setOcrMerchant(expTitle);
                          setOcrTotalAmount(expAmount);
                          setIsAddExpenseOpen(false);
                          setIsOcrReviewOpen(true);
                        } else {
                          setIsEditingExpenseSummary((prev) => !prev);
                        }
                      }}
                      className="text-[11.5px] font-bold text-[#8000EB] hover:underline"
                    >
                      {isEditingExpenseSummary && expItems.length === 0
                        ? 'Terminer'
                        : 'Modifier'}
                    </button>
                  </div>
                </div>

                {/* Inline details editor when editing manual expense */}
                {isEditingExpenseSummary && expItems.length === 0 && (
                  <div className="pt-2.5 border-t border-[#EFEBF8] space-y-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-[#7D7693] block mb-1">
                        Communauté
                      </label>
                      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                        {communities.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setExpCommId(c.id);
                              setExpSelectedMemberIds(
                                c.members.map((m) => m.id)
                              );
                            }}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${
                              expCommId === c.id
                                ? 'bg-[#8000EB] text-white'
                                : 'bg-white border border-[#E5DDF5] text-[#290764]'
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="text-[11px] font-bold text-[#7D7693] block mb-1">
                          Commerçant / Intitulé
                        </label>
                        <input
                          type="text"
                          value={expTitle}
                          onChange={(e) => setExpTitle(e.target.value)}
                          placeholder="Ex. Terrasse des Épices"
                          className="w-full h-9 px-3 rounded-[12px] bg-white border border-[#E4D8FC] text-[12.5px] font-semibold text-[#14111F]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#7D7693] block mb-1">
                          Total (DH)
                        </label>
                        <input
                          type="number"
                          value={expAmount}
                          onChange={(e) => setExpAmount(e.target.value)}
                          className="w-full h-9 px-2.5 rounded-[12px] bg-white border border-[#E4D8FC] text-[13px] font-extrabold text-[#290764]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. PARTICIPANTS (Progressive disclosure rows) */}
            <div className="rounded-[18px] bg-white border border-[#EFEBF8] divide-y divide-[#F3EFFA]">
              {/* Row 1: Payé par */}
              <div className="p-3 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsPayerSelectorOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between gap-2 text-left"
                >
                  <span className="text-[12.5px] font-bold text-[#7D7693]">
                    Payé par :
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-extrabold text-[#290764]">
                      {expPaidBy}
                    </span>
                    <ChevronRight
                      size={15}
                      className={`text-[#7D7693] transition-transform ${
                        isPayerSelectorOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>

                {isPayerSelectorOpen && (
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1 pb-0.5">
                    {selectedExpenseCommunity.members.map((m) => {
                      const label = m.isCurrentUser ? 'Lamia (Vous)' : m.name;
                      const active = expPaidBy === label;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setExpPaidBy(label);
                            setIsPayerSelectorOpen(false);
                          }}
                          className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold whitespace-nowrap transition-colors ${
                            active
                              ? 'bg-[#290764] text-white'
                              : 'bg-[#FAF8FE] border border-[#EFEBF8] text-[#14111F]'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Row 2: Qui participe ? */}
              <div className="p-3 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsMemberSelectorOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between gap-2 text-left"
                >
                  <span className="text-[12.5px] font-bold text-[#7D7693]">
                    Qui participe ?
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {effectiveSelectedMembers.slice(0, 5).map((m) =>
                        m.avatarUrl ? (
                          <img
                            key={m.id}
                            src={m.avatarUrl}
                            alt={m.name}
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full object-cover ring-2 ring-white"
                          />
                        ) : (
                          <div
                            key={m.id}
                            className="w-6 h-6 rounded-full bg-[#8000EB] text-white text-[9.5px] font-extrabold flex items-center justify-center ring-2 ring-white"
                          >
                            {m.avatarInitials}
                          </div>
                        )
                      )}
                    </div>
                    <span className="text-[13px] font-extrabold text-[#290764] whitespace-nowrap">
                      {effectiveSelectedMembers.length} participant
                      {effectiveSelectedMembers.length > 1 ? 's' : ''}
                    </span>
                    <ChevronRight
                      size={15}
                      className={`text-[#7D7693] transition-transform ${
                        isMemberSelectorOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </button>

                {isMemberSelectorOpen && (
                  <div className="space-y-2 pt-1">
                    {effectiveSelectedMembers.length <
                      selectedExpenseCommunity.members.length && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            const allIds =
                              selectedExpenseCommunity.members.map((m) => m.id);
                            setExpSelectedMemberIds(allIds);
                            setExpItems((items) =>
                              items.map((it) => ({
                                ...it,
                                assignedMemberIds: allIds,
                              }))
                            );
                          }}
                          className="text-[11px] font-bold text-[#8000EB] hover:underline"
                        >
                          Tout sélectionner
                        </button>
                      </div>
                    )}
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                      {selectedExpenseCommunity.members.map((m) => {
                        const isSelected = effectiveSelectedMembers.some(
                          (sel) => sel.id === m.id
                        );
                        const label = m.isCurrentUser ? 'Lamia (Vous)' : m.name;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleExpenseMemberSelection(m.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap inline-flex items-center gap-1 transition-all ${
                              isSelected
                                ? 'bg-[#F3EBFF] text-[#8000EB] border border-[#D8C2FF]'
                                : 'bg-[#FAF8FE] text-[#9A93B0] border border-[#EFEBF8]'
                            }`}
                          >
                            {isSelected && (
                              <Check size={11} strokeWidth={2.6} />
                            )}
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. SPLITTING METHOD */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-1 p-1 rounded-[14px] bg-[#F5F1FF]">
                {[
                  { id: 'EQUAL' as const, label: 'Parts égales' },
                  { id: 'ITEMS' as const, label: 'Par article' },
                  { id: 'CUSTOM' as const, label: 'Personnalisé' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      if (mode.id === 'ITEMS' && expItems.length === 0) {
                        const sampleGroup =
                          DEMO_OCR_SAMPLES[selectedExpenseCommunity.id] ||
                          DEMO_OCR_SAMPLES['comm-marrakech'];
                        const memberIds =
                          effectiveSelectedMembers.map((m) => m.id);
                        setExpItems(
                          sampleGroup.SCAN.items.map((it, idx) => ({
                            id: `split-item-${Date.now()}-${idx}`,
                            label: it.label,
                            amount: it.amount,
                            assignedMemberIds: memberIds,
                          }))
                        );
                      }
                      setExpSplitMode(mode.id);
                    }}
                    className={`h-8 rounded-[10px] text-[11.5px] font-bold transition-all ${
                      expSplitMode === mode.id
                        ? 'bg-[#8000EB] text-white shadow-2xs'
                        : 'text-[#5E5675]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Content for "Par article" */}
              {expSplitMode === 'ITEMS' && (
                <div className="space-y-2">
                  {expItems.map((item) => {
                    const assignedMembers = effectiveSelectedMembers.filter(
                      (m) => item.assignedMemberIds.includes(m.id)
                    );
                    const assignedCount = assignedMembers.length;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-[14px] border flex items-center justify-between gap-3 ${
                          assignedCount === 0
                            ? 'bg-[#FFF5F5] border-[#FECACA]'
                            : 'bg-[#FAF8FE] border-[#EFEBF8]'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[12.5px] font-bold text-[#14111F] truncate">
                            {item.label}
                          </p>
                          <p
                            className={`text-[11px] font-semibold mt-0.5 ${
                              assignedCount === 0
                                ? 'text-[#DC2626]'
                                : 'text-[#7D7693]'
                            }`}
                          >
                            {assignedCount} participant
                            {assignedCount > 1 ? 's' : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[13px] font-extrabold text-[#290764] tabular-nums">
                            {formatDH(item.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenEditArticleModal(item)}
                            className="text-[11.5px] font-bold text-[#8000EB] hover:underline whitespace-nowrap"
                          >
                            Modifier →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Content for "Parts égales" */}
              {expSplitMode === 'EQUAL' && (
                <div className="p-3.5 rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-bold text-[#7D7693]">
                      Part par personne ({computedExpenseShares.length})
                    </span>
                    <span className="text-[13px] font-extrabold text-[#8000EB] tabular-nums">
                      {formatDH(
                        Math.round(
                          expenseNumericTotal /
                            Math.max(1, computedExpenseShares.length)
                        )
                      )}{' '}
                      / pers.
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1 border-t border-[#EFEBF8]">
                    {computedExpenseShares.map((s) => (
                      <div
                        key={s.participantId}
                        className="flex items-center justify-between text-[12.5px]"
                      >
                        <span className="font-semibold text-[#14111F]">
                          {s.participantName}
                        </span>
                        <span className="font-extrabold text-[#290764] tabular-nums">
                          {formatDH(s.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content for "Personnalisé" */}
              {expSplitMode === 'CUSTOM' && (
                <div className="p-3.5 rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-bold text-[#7D7693]">
                      Montant par participant
                    </span>
                    <span
                      className={`text-[11.5px] font-extrabold tabular-nums ${
                        isAllocationBalanced
                          ? 'text-[#0F7B52]'
                          : 'text-[#D97706]'
                      }`}
                    >
                      {formatDH(allocatedSharesTotal)} /{' '}
                      {formatDH(expenseNumericTotal)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {computedExpenseShares.map((s) => (
                      <div
                        key={s.participantId}
                        className="flex items-center justify-between gap-2 text-[12.5px]"
                      >
                        <span className="font-semibold text-[#14111F]">
                          {s.participantName}
                        </span>
                        <div className="relative">
                          <input
                            type="number"
                            value={s.amount}
                            onChange={(e) =>
                              setExpCustomShares((prev) => ({
                                ...prev,
                                [s.participantId]: Math.max(
                                  0,
                                  Number(e.target.value) || 0
                                ),
                              }))
                            }
                            className="w-24 h-8 pl-2.5 pr-7 rounded-[10px] border border-[#DED4F8] bg-white text-right text-[12.5px] font-extrabold text-[#290764]"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10.5px] font-bold text-[#7D7693]">
                            DH
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!isAllocationBalanced && expenseNumericTotal > 0 && (
                    <div className="pt-2 border-t border-[#EFEBF8] flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-[#C2410C] font-semibold">
                        Reste à répartir :{' '}
                        {formatDH(
                          Math.abs(expenseNumericTotal - allocatedSharesTotal)
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={handleAutoBalanceShares}
                        className="font-extrabold text-[#8000EB] underline shrink-0"
                      >
                        Ajuster
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Participant summary for "Par article" */}
              {expSplitMode === 'ITEMS' && (
                <div className="p-3.5 rounded-[16px] bg-[#FAF8FE] border border-[#EFEBF8] space-y-2">
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="font-bold text-[#7D7693]">
                      Récapitulatif par participant ({computedExpenseShares.length})
                    </span>
                    <span
                      className={`font-extrabold tabular-nums ${
                        isAllocationBalanced
                          ? 'text-[#0F7B52]'
                          : 'text-[#D97706]'
                      }`}
                    >
                      Total : {formatDH(allocatedSharesTotal)} /{' '}
                      {formatDH(expenseNumericTotal)}
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1 border-t border-[#EFEBF8]">
                    {computedExpenseShares.map((s) => (
                      <div
                        key={s.participantId}
                        className="flex items-center justify-between text-[12.5px]"
                      >
                        <span className="font-semibold text-[#14111F]">
                          {s.participantName}
                        </span>
                        <span className="font-extrabold text-[#290764] tabular-nums">
                          {formatDH(s.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {hasUnassignedArticle && (
                    <div className="pt-1.5 border-t border-[#EFEBF8] text-[11px] text-[#DC2626] font-semibold">
                      Chaque article doit avoir au moins un participant assigné.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmAddExpense}
                disabled={
                  !expTitle.trim() ||
                  !isAllocationBalanced ||
                  hasUnassignedArticle
                }
                className="w-full h-12 rounded-full bg-[#8000EB] disabled:opacity-45 hover:bg-[#6E00CA] text-white text-[14px] font-bold shadow-xs transition-all"
              >
                Enregistrer et partager la dépense
              </button>
              <button
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="w-full h-10 rounded-full text-[12.5px] font-bold text-[#7D7693]"
              >
                Annuler
              </button>
            </div>
          </div>

          {/* Dedicated Bottom Sheet for Editing Article Participants */}
          {editingArticle && (
            <div
              className="fixed inset-0 z-60 bg-[#14111F]/50 backdrop-blur-xs flex items-end justify-center"
              onClick={(e) => {
                e.stopPropagation();
                setEditingArticleId(null);
              }}
            >
              <div
                className="w-full max-w-[412px] bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t border-[#EFEBF8]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[16px] font-extrabold text-[#290764] leading-snug">
                      {editingArticle.label}
                    </h4>
                    <p className="text-[13px] font-extrabold text-[#8000EB] tabular-nums mt-0.5">
                      {formatDH(editingArticle.amount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingArticleId(null)}
                    className="w-8 h-8 rounded-full bg-[#F5F1FF] text-[#290764] flex items-center justify-center shrink-0"
                  >
                    <X size={15} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-[#7D7693]">
                    Participants ({editingArticleMemberIds.length}/
                    {effectiveSelectedMembers.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleAllEditingArticleMembers}
                    className="text-[11.5px] font-bold text-[#8000EB] hover:underline"
                  >
                    {effectiveSelectedMembers.length > 0 &&
                    effectiveSelectedMembers.every((m) =>
                      editingArticleMemberIds.includes(m.id)
                    )
                      ? 'Tout désélectionner'
                      : 'Tout sélectionner'}
                  </button>
                </div>

                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-0.5">
                  {(() => {
                    const selectedMembersList = effectiveSelectedMembers.filter(
                      (m) => editingArticleMemberIds.includes(m.id)
                    );
                    const selCount = selectedMembersList.length;
                    const baseAmt =
                      selCount > 0
                        ? Math.floor(editingArticle.amount / selCount)
                        : 0;
                    const remAmt =
                      selCount > 0
                        ? editingArticle.amount - baseAmt * selCount
                        : 0;

                    return effectiveSelectedMembers.map((m) => {
                      const isChecked = editingArticleMemberIds.includes(m.id);
                      const selIndex = selectedMembersList.findIndex(
                        (sm) => sm.id === m.id
                      );
                      const memberShare =
                        isChecked && selIndex !== -1
                          ? selIndex < remAmt
                            ? baseAmt + 1
                            : baseAmt
                          : 0;
                      const label = m.isCurrentUser ? 'Lamia (Vous)' : m.name;

                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleToggleEditingArticleMember(m.id)}
                          className={`w-full p-3 rounded-[14px] border flex items-center justify-between gap-3 text-left transition-all ${
                            isChecked
                              ? 'bg-[#FAF6FF] border-[#D8C2FF]'
                              : 'bg-[#FAF8FE] border-[#EFEBF8]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-[6px] flex items-center justify-center border transition-colors shrink-0 ${
                                isChecked
                                  ? 'bg-[#8000EB] border-[#8000EB] text-white'
                                  : 'bg-white border-[#CFC7E2]'
                              }`}
                            >
                              {isChecked && (
                                <Check size={12} strokeWidth={2.8} />
                              )}
                            </div>
                            <span className="text-[13px] font-bold text-[#14111F] truncate">
                              {label}
                            </span>
                          </div>

                          <span
                            className={`text-[12.5px] font-extrabold tabular-nums shrink-0 ${
                              isChecked ? 'text-[#290764]' : 'text-[#9A93B0]'
                            }`}
                          >
                            {isChecked ? formatDH(memberShare) : '0 DH'}
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* Automatically calculated amount per selected participant */}
                <div className="p-3 rounded-[14px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-center justify-between text-[12px]">
                  <span className="font-semibold text-[#7D7693]">
                    Montant par participant sélectionné
                  </span>
                  <span className="font-extrabold text-[#8000EB] tabular-nums">
                    {editingArticleMemberIds.length > 0
                      ? `${formatDH(
                          Math.round(
                            editingArticle.amount /
                              editingArticleMemberIds.length
                          )
                        )} / pers.`
                      : 'Aucun participant'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmEditArticleMembers}
                  disabled={editingArticleMemberIds.length === 0}
                  className="w-full h-12 rounded-full bg-[#8000EB] disabled:opacity-45 hover:bg-[#6E00CA] text-white text-[14px] font-bold shadow-xs transition-all"
                >
                  Valider la sélection
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 6: SETTLE BALANCE CONFIRMATION SHEET                          */}
      {/* =================================================================== */}
      {settlingBalance && (
        <div
          className="fixed inset-0 z-50 bg-[#14111F]/50 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setSettlingBalance(null)}
        >
          <div
            className="w-full max-w-[412px] bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t border-[#EFEBF8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />
            <div>
              <span className="text-[11px] font-bold text-[#8000EB] uppercase tracking-wide block">
                Remboursement instantané · {settlingBalance.communityName}
              </span>
              <h3 className="text-[18px] font-extrabold text-[#290764] mt-0.5">
                Rembourser {settlingBalance.participantName}
              </h3>
              <p className="text-[12.5px] text-[#7D7693] mt-0.5">
                Pour : {settlingBalance.contextLabel}
              </p>
            </div>

            <div className="p-4 rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#14111F]">
                Montant à régler
              </span>
              <span className="text-[22px] font-extrabold text-[#8000EB] tabular-nums">
                {formatDH(settlingBalance.amount)}
              </span>
            </div>

            <div className="p-3 rounded-[14px] bg-[#F5F1FF] text-[12px] text-[#290764] flex items-center justify-between">
              <span>Depuis : Compte Principal Simple</span>
              <strong className="tabular-nums">
                {formatDH(mainAccountBalance, true)}
              </strong>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const id = settlingBalance.id;
                  setSettlingBalance(null);
                  settleCommunityBalance(id);
                }}
                className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14px] font-bold shadow-xs"
              >
                Envoyer {formatDH(settlingBalance.amount)} maintenant
              </button>
              <button
                type="button"
                onClick={() => setSettlingBalance(null)}
                className="w-full h-10 rounded-full text-[12.5px] font-bold text-[#7D7693]"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 7: CREATE NEW COMMUNITY GROUP SHEET                           */}
      {/* =================================================================== */}
      {isCreateCommunityOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#14111F]/50 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setIsCreateCommunityOpen(false)}
        >
          <div
            className="w-full max-w-[412px] max-h-[88vh] overflow-y-auto bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t border-[#EFEBF8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />
            <div>
              <span className="text-[11px] font-bold text-[#8000EB] uppercase tracking-wide block">
                Simple Communauté
              </span>
              <h3 className="text-[18px] font-extrabold text-[#290764] mt-0.5">
                Créer une nouvelle communauté
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-bold text-[#14111F] block mb-1">
                  Nom de la communauté
                </label>
                <input
                  type="text"
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  placeholder="Ex. Roadtrip Dakhla, Cadeau Mariage Salma..."
                  className="w-full h-11 px-3.5 rounded-[14px] bg-[#FAF8FE] border border-[#E4D8FC] text-[13.5px] font-semibold text-[#14111F]"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#14111F] block mb-1">
                  Description courte
                </label>
                <input
                  type="text"
                  value={newCommSubtitle}
                  onChange={(e) => setNewCommSubtitle(e.target.value)}
                  placeholder="Ex. Cagnotte & frais sur place"
                  className="w-full h-11 px-3.5 rounded-[14px] bg-[#FAF8FE] border border-[#EFEBF8] text-[13px] text-[#14111F]"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#14111F] block mb-1">
                  Thème & Photo de couverture
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COMMUNITY_COVER_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setNewCommPresetId(preset.id)}
                      className={`p-2 rounded-[14px] border text-left flex items-center gap-2 transition-all ${
                        newCommPresetId === preset.id
                          ? 'border-[#8000EB] bg-[#F5F1FF]'
                          : 'border-[#EFEBF8] bg-[#FAF8FE]'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-9 h-9 rounded-lg object-cover shrink-0"
                      />
                      <span className="text-[11.5px] font-bold text-[#290764] leading-tight">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-[#14111F] block mb-1">
                  Participants invités ({newCommMembers.length})
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCommMemberInput}
                    onChange={(e) => setNewCommMemberInput(e.target.value)}
                    placeholder="Ajouter un prénom..."
                    className="flex-1 h-10 px-3 rounded-[12px] bg-[#FAF8FE] border border-[#EFEBF8] text-[12.5px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCommMemberInput.trim()) {
                        setNewCommMembers((prev) => [
                          ...prev,
                          newCommMemberInput.trim(),
                        ]);
                        setNewCommMemberInput('');
                      }
                    }}
                    className="px-3.5 h-10 rounded-[12px] bg-[#F3EBFF] text-[#8000EB] text-[12px] font-bold"
                  >
                    + Ajouter
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {newCommMembers.map((m, idx) => (
                    <span
                      key={`${m}-${idx}`}
                      className="px-2.5 py-1 rounded-full bg-[#F5F1FF] text-[#290764] text-[11.5px] font-bold flex items-center gap-1"
                    >
                      {m}
                      <button
                        type="button"
                        onClick={() =>
                          setNewCommMembers((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmCreateCommunity}
                disabled={!newCommName.trim()}
                className="w-full h-12 rounded-full bg-[#8000EB] disabled:opacity-45 hover:bg-[#6E00CA] text-white text-[14px] font-bold shadow-xs"
              >
                Créer la communauté
              </button>
              <button
                type="button"
                onClick={() => setIsCreateCommunityOpen(false)}
                className="w-full h-10 rounded-full text-[12.5px] font-bold text-[#7D7693]"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 8: COMMUNITY MEMBERS & AUTHORIZED FINANCIAL ACTIVITY SHEET    */}
      {/* =================================================================== */}
      {isCommunityInfoOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#14111F]/50 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setIsCommunityInfoOpen(false)}
        >
          <div
            className="w-full max-w-[412px] max-h-[86vh] overflow-y-auto bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t border-[#EFEBF8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-11 h-1.5 bg-[#E2DCF0] rounded-full mx-auto" />

            <div>
              <span className="text-[11px] font-bold text-[#8000EB] uppercase tracking-wide block">
                Membres & Règles de confidentialité
              </span>
              <h3 className="text-[18px] font-extrabold text-[#290764] mt-0.5">
                {activeCommunity.name}
              </h3>
              <p className="text-[12px] text-[#7D7693] mt-0.5">
                {activeCommunity.visibilityNote}
              </p>
            </div>

            {/* Invite new member */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteMemberInput}
                onChange={(e) => setInviteMemberInput(e.target.value)}
                placeholder="Inviter un participant (prénom ou tél)..."
                className="flex-1 h-10 px-3.5 rounded-full bg-[#FAF8FE] border border-[#E4D8FC] text-[12.5px] text-[#14111F]"
              />
              <button
                type="button"
                onClick={() => {
                  if (inviteMemberInput.trim()) {
                    inviteCommunityMember(
                      activeCommunity.id,
                      inviteMemberInput.trim()
                    );
                    setInviteMemberInput('');
                  }
                }}
                className="px-4 h-10 rounded-full bg-[#8000EB] text-white text-[12px] font-bold shrink-0"
              >
                Inviter
              </button>
            </div>

            {/* Members list */}
            <div className="divide-y divide-[#F3EFFA]">
              {activeCommunity.members.map((m) => (
                <div
                  key={m.id}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F2EDFF] text-[#8000EB] font-extrabold text-xs flex items-center justify-center overflow-hidden">
                      {m.avatarUrl ? (
                        <img
                          src={m.avatarUrl}
                          alt={m.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        m.avatarInitials
                      )}
                    </div>
                    <div>
                      <p className="text-[13.5px] font-bold text-[#14111F]">
                        {m.name} {m.isCurrentUser ? '(Vous)' : ''}
                      </p>
                      <p className="text-[11px] text-[#7D7693]">{m.role}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E7F7F0] text-[#0F7B52] text-[10.5px] font-bold">
                    Activité partagée
                  </span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsCommunityInfoOpen(false)}
              className="w-full h-11 rounded-full bg-[#F3EDFF] text-[#5E1DF0] text-[13px] font-bold"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
