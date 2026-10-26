import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Clock,
  Sparkles,
  Target,
  Bell,
  BookOpen,
  Lightbulb,
  HelpCircle,
  Check,
  ArrowRight,
  Lock,
  Star,
  Flag,
  Trophy,
  Medal,
  Users,
  Heart,
  ShoppingBag,
  ShieldCheck,
  PiggyBank,
  Eye,
  Repeat,
  Gift,
  Crown,
} from 'lucide-react';
import { usePFM } from '../context/PFMContext';
import { formatDH, IMPULSIF_COURSE_IMAGE_URL } from '../data/initialData';
import { MobileHeader, SimpleBarsIcon } from './SharedUI';

type ChallengeUniverse = 'PERSO' | 'FAMILLE' | 'COMMUNAUTE';

interface ExtraUniverseChallenge {
  id: string;
  universe: 'FAMILLE' | 'COMMUNAUTE';
  title: string;
  shortDescription: string;
  duration: string;
  objectiveTag: string;
  childTag?: string;
  badgeName: string;
  accentType: 'MINT' | 'CORAL' | 'BLUE' | 'YELLOW';
  steps: string[];
  status: 'RECOMMENDED' | 'ACTIVE' | 'COMPLETED';
  completedSteps: number;
}

const INITIAL_EXTRA_CHALLENGES: ExtraUniverseChallenge[] = [
  // FAMILLE
  {
    id: 'fam-courses-1',
    universe: 'FAMILLE',
    title: 'Maîtriser notre budget Courses',
    shortDescription: 'Garder le cap ensemble sous le repère familial de 3 200 DH.',
    duration: '4 semaines',
    objectiveTag: 'Objectif : 3 200 DH / mois',
    badgeName: 'Courses Maîtrisées',
    accentType: 'MINT',
    steps: ['Sem. 1', 'Sem. 2', 'Sem. 3', 'Sem. 4'],
    status: 'RECOMMENDED',
    completedSteps: 0,
  },
  {
    id: 'fam-yasmine-1',
    universe: 'FAMILLE',
    title: 'La tirelire de Yasmine',
    shortDescription: 'Mettre 50 DH de côté sur son argent de poche du mois.',
    duration: '4 semaines',
    objectiveTag: 'Objectif : 50 DH épargnés',
    childTag: 'Simple One · Yasmine',
    badgeName: "Graine d'Épargnant",
    accentType: 'CORAL',
    steps: ['Sem. 1', 'Sem. 2', 'Sem. 3', 'Sem. 4'],
    status: 'RECOMMENDED',
    completedSteps: 0,
  },
  // COMMUNAUTÉ
  {
    id: 'comm-epargne-1',
    universe: 'COMMUNAUTE',
    title: 'Épargner ensemble pour un projet',
    shortDescription: "Atteindre le premier palier d'un objectif d'épargne partagé.",
    duration: '4 semaines',
    objectiveTag: 'Objectif collectif',
    badgeName: 'Élan Collectif',
    accentType: 'BLUE',
    steps: ['Palier 1', 'Palier 2', 'Palier 3', 'Palier 4'],
    status: 'RECOMMENDED',
    completedSteps: 0,
  },
  {
    id: 'comm-cagnotte-1',
    universe: 'COMMUNAUTE',
    title: 'Réussir notre cagnotte commune',
    shortDescription: "Mobiliser vos proches autour d'un projet ou cadeau commun.",
    duration: '14 jours',
    objectiveTag: 'Défi solidaire',
    badgeName: 'Cagnotte Réussie',
    accentType: 'YELLOW',
    steps: ['Lancement', 'Invitations', 'Mi-parcours', 'Objectif'],
    status: 'RECOMMENDED',
    completedSteps: 0,
  },
];

// TAB 2 CONTENT — Mes défis (Screen F1 embedded inside Hub Tab 2)
export const MesDefisTabContent: React.FC = () => {
  const {
    challenges,
    earnedBadges,
    navigateTo,
    startChallenge,
    shoppingChallengeActivatedAt,
    shoppingChallengeCompletedWeeks,
    setShoppingChallengeOrigin,
    clearShoppingChallengeJustActivated,
    pendingSubscriptions,
    confirmedSubscriptions,
    communities,
    selectedCommunityId,
    setSelectedCommunityId,
    showToast,
  } = usePFM();

  const activeCommunity =
    communities.find((c) => c.id === selectedCommunityId) || communities[0];

  const [selectedUniverse, setSelectedUniverse] =
    useState<ChallengeUniverse>('PERSO');
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [selectedExtraChallengeId, setSelectedExtraChallengeId] = useState<
    string | null
  >(null);

  const [extraChallenges, setExtraChallenges] = useState<
    ExtraUniverseChallenge[]
  >(() => {
    try {
      const saved = localStorage.getItem('simple_pfm_extra_universe_challenges_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_EXTRA_CHALLENGES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        'simple_pfm_extra_universe_challenges_v1',
        JSON.stringify(extraChallenges)
      );
    } catch {
      // ignore storage errors
    }
  }, [extraChallenges]);

  // Genuine Personal Challenge states
  const isShoppingCompleted =
    shoppingChallengeCompletedWeeks >= 4 ||
    challenges.find((c) => c.id === 'defi-shopping-1')?.status === 'COMPLETED';
  const isShoppingActive =
    !isShoppingCompleted &&
    (Boolean(shoppingChallengeActivatedAt) ||
      challenges.find((c) => c.id === 'defi-shopping-1')?.status === 'ACTIVE');

  const persoActiveChallenges = challenges.filter((c) => {
    if (c.id === 'defi-shopping-1') return isShoppingActive;
    return c.status === 'ACTIVE';
  });

  const persoCompletedChallenges = challenges.filter((c) => {
    if (c.id === 'defi-shopping-1') return isShoppingCompleted;
    return c.status === 'COMPLETED';
  });

  // Up to 2 recommended Personal challenges (prioritizing Shopping & Subscriptions when relevant, never duplicating active/completed)
  const hasSubscriptionsFeature =
    pendingSubscriptions.length > 0 || confirmedSubscriptions.length > 0;

  const persoRecommendedPool = challenges.filter((c) => {
    if (c.id === 'defi-shopping-1') {
      return !isShoppingActive && !isShoppingCompleted;
    }
    if (c.id === 'defi-abonnements-4' && !hasSubscriptionsFeature) {
      return false;
    }
    return c.status === 'RECOMMENDED';
  });

  const [activePersoHistoryPage, setActivePersoHistoryPage] = useState<
    'CHALLENGES' | 'BADGES' | null
  >(null);
  const [selectedCompletedChallengeId, setSelectedCompletedChallengeId] =
    useState<string | null>(null);
  const [selectedEarnedBadgeId, setSelectedEarnedBadgeId] = useState<
    string | null
  >(null);

  // Sort so "Comprendre mes abonnements" and "Vérifier mes dépenses" come first when available
  const priorityOrder = [
    'defi-abonnements-4',
    'defi-verifier-2',
    'defi-categories-2',
    'defi-shopping-1',
    'defi-epargne-3',
  ];
  const persoRecommendedChallenges = [...persoRecommendedPool]
    .sort((a, b) => priorityOrder.indexOf(a.id) - priorityOrder.indexOf(b.id))
    .slice(0, 2);

  // Genuine Personal Badges (no fabricated unlocks) — Sky Blue palette
  const persoBadges = [
    {
      id: 'badge-shopping',
      title: 'Équilibre Shopping',
      subtitle: '4 semaines dans votre limite Shopping',
      earnedDate: '28 oct. 2026',
      requirement:
        'Débloqué en maintenant vos dépenses Shopping sous votre objectif de réduction de 250 DH pendant 4 semaines consécutives.',
      relatedChallengeTitle: 'Mon défi Shopping',
      unlocked:
        isShoppingCompleted || earnedBadges.includes('Équilibre Shopping'),
      icon: ShoppingBag,
      unlockedBg: 'bg-gradient-to-br from-[#F2F8FF] to-[#E6F3FF]',
      unlockedBorder: 'border-[#BFE0FF]',
      iconBg: 'bg-[#4FA9FF] text-white',
    },
    {
      id: 'badge-abonnements',
      title: 'Abonnements Clairs',
      subtitle: 'Abonnements récurrents passés en revue',
      earnedDate: '15 oct. 2026',
      requirement:
        'Débloqué en examinant et confirmant vos 2 paiements récurrents détectés dans vos abonnements.',
      relatedChallengeTitle: 'Comprendre mes abonnements',
      unlocked:
        challenges.find((c) => c.id === 'defi-abonnements-4')?.status ===
          'COMPLETED' ||
        earnedBadges.includes('Abonnements clairs') ||
        earnedBadges.includes('Abonnements Clairs'),
      icon: Repeat,
      unlockedBg: 'bg-gradient-to-br from-[#F2F8FF] to-[#E6F3FF]',
      unlockedBorder: 'border-[#BFE0FF]',
      iconBg: 'bg-[#4FA9FF] text-white',
    },
    {
      id: 'badge-oeil',
      title: 'Œil Attentif',
      subtitle: '3 opérations récentes vérifiées',
      earnedDate: '15 oct. 2026',
      requirement:
        'Débloqué en vérifiant et recatégorisant vos 3 transactions récentes pour fiabiliser votre bilan.',
      relatedChallengeTitle: 'Vérifier mes dépenses',
      unlocked:
        challenges.find(
          (c) => c.id === 'defi-categories-2' || c.id === 'defi-verifier-2'
        )?.status === 'COMPLETED' ||
        earnedBadges.includes('Budget Clair') ||
        earnedBadges.includes('Œil Attentif'),
      icon: Eye,
      unlockedBg: 'bg-gradient-to-br from-[#F2F8FF] to-[#E6F3FF]',
      unlockedBorder: 'border-[#BFE0FF]',
      iconBg: 'bg-[#4FA9FF] text-white',
    },
    {
      id: 'badge-epargne',
      title: 'Cap Voyage',
      subtitle: 'Premier réflexe d’épargne activé',
      earnedDate: '18 oct. 2026',
      requirement:
        'Débloqué en mettant en place votre premier réflexe d’épargne vers votre Projet Voyage.',
      relatedChallengeTitle: "Faire mes premiers pas vers l'épargne",
      unlocked:
        challenges.find((c) => c.id === 'defi-epargne-3')?.status ===
          'COMPLETED' ||
        earnedBadges.includes('Épargnant Serein') ||
        earnedBadges.includes('Cap Voyage'),
      icon: PiggyBank,
      unlockedBg: 'bg-gradient-to-br from-[#F2F8FF] to-[#E6F3FF]',
      unlockedBorder: 'border-[#BFE0FF]',
      iconBg: 'bg-[#4FA9FF] text-white',
    },
  ];

  const getPersoChallengeHistoryMeta = (ch: (typeof challenges)[number]) => {
    if (ch.id === 'defi-shopping-1') {
      return {
        title: 'Mon défi Shopping',
        icon: ShoppingBag,
        completionDate: '28 oct. 2026',
        achievedObjective: '−250 DH économisés en 4 semaines',
        detailedObjective:
          'Vous avez maintenu vos achats Shopping sous votre repère hebdomadaire de 400 DH pendant 4 semaines et économisé 250 DH.',
        badgeTitle: 'Équilibre Shopping',
      };
    }
    if (ch.id === 'defi-abonnements-4') {
      return {
        title: ch.title,
        icon: Repeat,
        completionDate: '15 oct. 2026',
        achievedObjective: '2 abonnements récurrents vérifiés',
        detailedObjective:
          'Vous avez examiné vos 2 abonnements détectés pour garder une visibilité claire sur vos charges fixes à venir.',
        badgeTitle: 'Abonnements Clairs',
      };
    }
    if (ch.id === 'defi-categories-2' || ch.id === 'defi-verifier-2') {
      return {
        title: ch.title,
        icon: CheckCircle2,
        completionDate: '15 oct. 2026',
        achievedObjective: '3 opérations vérifiées et classées',
        detailedObjective:
          'Vous avez confirmé la catégorie de vos 3 opérations récentes pour fiabiliser le suivi de votre budget mensuel.',
        badgeTitle: 'Budget Clair',
      };
    }
    return {
      title: ch.title,
      icon: PiggyBank,
      completionDate: '18 oct. 2026',
      achievedObjective:
        (ch as any).targetSummary || ch.criteriaText || '300 DH mis de côté',
      detailedObjective:
        ch.purpose ||
        'Vous avez alimenté votre sous-compte épargne et validé votre objectif personnel.',
      badgeTitle: ch.badgeName || 'Épargnant Serein',
    };
  };

  // Genuine Family & Community challenge lists
  const familleChallenges = extraChallenges.filter(
    (c) => c.universe === 'FAMILLE'
  );
  const familleActive = familleChallenges.filter((c) => c.status === 'ACTIVE');
  const familleCompleted = familleChallenges.filter(
    (c) => c.status === 'COMPLETED'
  );
  const familleRecommended = familleChallenges
    .filter((c) => c.status === 'RECOMMENDED')
    .slice(0, 2);

  // Family Badges — Green palette
  const familleBadges = [
    {
      id: 'fam-badge-courses',
      title: 'Courses Maîtrisées',
      subtitle: 'Budget Courses familial respecté sur 4 semaines',
      unlocked:
        familleChallenges.find((c) => c.id === 'fam-courses-1')?.status ===
        'COMPLETED',
      icon: ShieldCheck,
      unlockedBg: 'bg-gradient-to-br from-[#EFFAF4] to-[#E2F5EB]',
      unlockedBorder: 'border-[#BFE7CF]',
      iconBg: 'bg-[#3BAA6E] text-white',
      ownerTag: undefined as string | undefined,
    },
    {
      id: 'fam-badge-yasmine',
      title: "Graine d'Épargnant",
      subtitle: 'Objectif tirelire atteint par Yasmine',
      unlocked:
        familleChallenges.find((c) => c.id === 'fam-yasmine-1')?.status ===
        'COMPLETED',
      icon: Sparkles,
      unlockedBg: 'bg-gradient-to-br from-[#EFFAF4] to-[#E2F5EB]',
      unlockedBorder: 'border-[#BFE7CF]',
      iconBg: 'bg-[#3BAA6E] text-white',
      ownerTag: 'Simple One · Yasmine',
    },
    {
      id: 'fam-badge-foyer',
      title: 'Foyer Synchronisé',
      subtitle: '2 défis réalisés ensemble en famille',
      unlocked: familleCompleted.length >= 2,
      icon: Heart,
      unlockedBg: 'bg-gradient-to-br from-[#EFFAF4] to-[#E2F5EB]',
      unlockedBorder: 'border-[#BFE7CF]',
      iconBg: 'bg-[#3BAA6E] text-white',
      ownerTag: undefined as string | undefined,
    },
    {
      id: 'fam-badge-vacances',
      title: 'Cap Vacances',
      subtitle: 'Épargne familiale régulière sur un projet commun',
      unlocked: false,
      icon: Trophy,
      unlockedBg: 'bg-gradient-to-br from-[#EFFAF4] to-[#E2F5EB]',
      unlockedBorder: 'border-[#BFE7CF]',
      iconBg: 'bg-[#3BAA6E] text-white',
      ownerTag: undefined as string | undefined,
    },
  ];

  const commChallenges = extraChallenges.filter(
    (c) => c.universe === 'COMMUNAUTE'
  );
  const commActive = commChallenges.filter((c) => c.status === 'ACTIVE');
  const commCompleted = commChallenges.filter((c) => c.status === 'COMPLETED');

  const commEditorialRecommended = [
    {
      id: 'comm-rec-1',
      title: 'Ensemble, atteignons notre premier cap !',
      description: 'Atteignons 50 % de notre objectif commun.',
      badge: 'Premier cap ensemble',
      coverUrl:
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=85',
    },
    {
      id: 'comm-rec-2',
      title: 'Des dépenses, des comptes clairs',
      description:
        'Organisons nos dépenses et validons leur partage ensemble.',
      badge: 'Comptes clairs',
      coverUrl:
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=85',
    },
    {
      id: 'comm-rec-3',
      title: 'Tout est réglé !',
      description: 'Finalisons nos remboursements en toute simplicité.',
      badge: 'Équipe en équilibre',
      coverUrl:
        'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=85',
    },
  ];

  // Community Badges — 3 visual badges
  const commBadges = [
    {
      id: 'comm-badge-1',
      title: 'Premier cap ensemble',
      subtitle: 'Atteindre 50 % de notre objectif commun',
      unlocked: false,
      icon: Flag,
      unlockedBg: 'bg-gradient-to-br from-[#F7F3FF] to-[#EFE8FF]',
      unlockedBorder: 'border-[#E2D6FA]',
      iconBg: 'bg-[#8000EB] text-white',
      ownerTag: undefined as string | undefined,
    },
    {
      id: 'comm-badge-2',
      title: 'Comptes clairs',
      subtitle: 'Organiser et valider le partage des dépenses',
      unlocked: false,
      icon: CheckCircle2,
      unlockedBg: 'bg-gradient-to-br from-[#F7F3FF] to-[#EFE8FF]',
      unlockedBorder: 'border-[#E2D6FA]',
      iconBg: 'bg-[#8000EB] text-white',
      ownerTag: undefined as string | undefined,
    },
    {
      id: 'comm-badge-3',
      title: 'Équipe en équilibre',
      subtitle: 'Finaliser nos remboursements en toute simplicité',
      unlocked: false,
      icon: Users,
      unlockedBg: 'bg-gradient-to-br from-[#F7F3FF] to-[#EFE8FF]',
      unlockedBorder: 'border-[#E2D6FA]',
      iconBg: 'bg-[#8000EB] text-white',
      ownerTag: undefined as string | undefined,
    },
  ];

  // Current universe computed data
  const currentBadges =
    selectedUniverse === 'PERSO'
      ? persoBadges
      : selectedUniverse === 'FAMILLE'
      ? familleBadges
      : commBadges;

  const unlockedBadgesCount = currentBadges.filter((b) => b.unlocked).length;
  const completedCount =
    selectedUniverse === 'PERSO'
      ? persoCompletedChallenges.length
      : selectedUniverse === 'FAMILLE'
      ? familleCompleted.length
      : commCompleted.length;

  const totalChallengesInUniverse =
    selectedUniverse === 'PERSO'
      ? persoBadges.length
      : selectedUniverse === 'FAMILLE'
      ? familleChallenges.length
      : commEditorialRecommended.length;

  // Meaningful progress indicator for the Hero
  const heroProgressPct = (() => {
    if (selectedUniverse === 'PERSO') {
      if (isShoppingActive) {
        return Math.min(
          100,
          Math.max(25, Math.round((shoppingChallengeCompletedWeeks / 4) * 100))
        );
      }
      if (persoActiveChallenges.length > 0) {
        return Math.max(25, persoActiveChallenges[0].progressPct);
      }
      return Math.max(
        25,
        Math.round(
          (completedCount / Math.max(1, totalChallengesInUniverse)) * 100
        )
      );
    }
    const activeList =
      selectedUniverse === 'FAMILLE' ? familleActive : commActive;
    if (activeList.length > 0) {
      const first = activeList[0];
      return Math.max(
        15,
        Math.round((first.completedSteps / Math.max(1, first.steps.length)) * 100)
      );
    }
    return Math.round(
      (completedCount / Math.max(1, totalChallengesInUniverse)) * 100
    );
  })();

  const handleStartExtraChallenge = (id: string) => {
    setExtraChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'ACTIVE' } : c))
    );
    const target = extraChallenges.find((c) => c.id === id);
    if (target) {
      showToast(
        'Défi lancé !',
        `Votre mission « ${target.title} » est maintenant active.`
      );
    }
  };

  const handleAdvanceExtraChallengeStep = (id: string) => {
    setExtraChallenges((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const nextSteps = Math.min(c.steps.length, c.completedSteps + 1);
        const isNowDone = nextSteps >= c.steps.length;
        return {
          ...c,
          completedSteps: nextSteps,
          status: isNowDone ? 'COMPLETED' : 'ACTIVE',
        };
      })
    );
  };

  const selectedExtraChallenge = extraChallenges.find(
    (c) => c.id === selectedExtraChallengeId
  );

  // Visual theme tokens per universe:
  // PERSO = Sky Blue (#4FA9FF / #F2F8FF / #BFE0FF / #3E97F4)
  // FAMILLE = Green (#3BAA6E / #EFFAF4 / #BFE7CF / #2E9A60)
  // COMMUNAUTE = Orange/Purple (#8000EB / #F7F3FF / #EFEBF8)
  const universeTheme = {
    PERSO: {
      heroTitle: 'Mes accomplissements',
      heroSubtitle: 'Lamia',
      heroAvatarUrl:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80',
      heroAvatarAlt: 'Lamia',
      ringTrackColor: '#DCEEFF',
      ringStrokeColor: '#4FA9FF',
      pctPillClass: 'border-[#BFE0FF] text-[#2F80ED]',
      heroBg:
        'bg-gradient-to-br from-[#F2F8FF] via-white to-[#EAF4FF] border-[#BFE0FF]',
      heroIconBg:
        'bg-[#4FA9FF] text-white shadow-[0_8px_18px_-4px_rgba(79,169,255,0.35)]',
      statBox1: 'bg-white/90 border-[#BFE0FF] text-[#14111F]',
      statBox2: 'bg-white/90 border-[#BFE0FF] text-[#14111F]',
      statIconColor: 'text-[#4FA9FF] border-[#BFE0FF]',
      statLabelColor: 'text-[#3E97F4]',
      barTrack: 'bg-[#DCEEFF]',
      barFill: 'bg-[#4FA9FF]',
      activeSectionTitle: 'Mes défis en cours',
      cardBorder: 'border-[#BFE0FF]',
      linkText: 'text-[#3E97F4] hover:text-[#287FD9]',
      pillClass: 'bg-[#F2F8FF] border border-[#BFE0FF] text-[#3E97F4]',
      checkBadgeBg: 'bg-[#4FA9FF] text-white',
      lockedIconBg: 'bg-[#F2F8FF] text-[#4FA9FF]/65 border border-[#BFE0FF]/60',
      ctaBtnClass:
        'bg-white hover:bg-[#F2F8FF] text-[#3E97F4] border border-[#3E97F4] shadow-[0_2px_8px_rgba(62,151,244,0.08)]',
    },
    FAMILLE: {
      heroTitle: 'Nos accomplissements',
      heroSubtitle: 'Ma famille',
      heroAvatarUrl:
        'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=400&q=80',
      heroAvatarAlt: 'Ma famille',
      ringTrackColor: '#D7EFE1',
      ringStrokeColor: '#3BAA6E',
      pctPillClass: 'border-[#BFE7CF] text-[#2E9A60]',
      heroBg:
        'bg-gradient-to-br from-[#EFFAF4] via-white to-[#E6F6ED] border-[#BFE7CF]',
      heroIconBg:
        'bg-[#3BAA6E] text-white shadow-[0_8px_18px_-4px_rgba(59,170,110,0.32)]',
      statBox1: 'bg-white/90 border-[#BFE7CF] text-[#14111F]',
      statBox2: 'bg-white/90 border-[#BFE7CF] text-[#14111F]',
      statIconColor: 'text-[#3BAA6E] border-[#BFE7CF]',
      statLabelColor: 'text-[#2E9A60]',
      barTrack: 'bg-[#D7EFE1]',
      barFill: 'bg-[#3BAA6E]',
      activeSectionTitle: 'Nos défis en famille en cours',
      cardBorder: 'border-[#BFE7CF]',
      linkText: 'text-[#2E9A60] hover:text-[#237B4B]',
      pillClass: 'bg-[#EFFAF4] border border-[#BFE7CF] text-[#2E9A60]',
      checkBadgeBg: 'bg-[#3BAA6E] text-white',
      lockedIconBg: 'bg-[#EFFAF4] text-[#3BAA6E]/65 border border-[#BFE7CF]/60',
      ctaBtnClass:
        'bg-white hover:bg-[#EFFAF4] text-[#2E9A60] border border-[#2E9A60] shadow-[0_2px_8px_rgba(46,154,96,0.08)]',
    },
    COMMUNAUTE: {
      heroTitle: 'Nos accomplissements',
      heroSubtitle:
        activeCommunity?.name ||
        'Relevez des missions solidaires et épargnez à plusieurs',
      heroAvatarUrl:
        activeCommunity?.coverUrl ||
        'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400&auto=format&fit=crop&q=80',
      heroAvatarAlt: activeCommunity?.name || 'Communauté',
      ringTrackColor: '#EAE2FF',
      ringStrokeColor: '#8000EB',
      pctPillClass: 'border-[#E4D8FC] text-[#290764]',
      heroBg:
        'bg-gradient-to-br from-[#F7F3FF] via-white to-[#FFF7EE] border-[#EFEBF8]',
      heroIconBg:
        'bg-[#8000EB] text-white shadow-[0_8px_18px_-4px_rgba(128,0,235,0.28)]',
      statBox1: 'bg-white/90 border-[#EFEBF8] text-[#14111F]',
      statBox2: 'bg-white/90 border-[#EFEBF8] text-[#14111F]',
      statIconColor: 'text-[#8000EB] border-[#EAE2FF]',
      statLabelColor: 'text-[#6E6785]',
      barTrack: 'bg-[#EAE2FF]',
      barFill: 'bg-[#8000EB]',
      activeSectionTitle: 'Nos défis en cours',
      cardBorder: 'border-[#EFEBF8]',
      linkText: 'text-[#8000EB] hover:text-[#6800C2]',
      pillClass: 'bg-[#F5F1FF] border border-[#E4D8FC] text-[#8000EB]',
      checkBadgeBg: 'bg-[#8000EB] text-white',
      lockedIconBg: 'bg-[#F5F2FA] text-[#8E87A6] border border-[#EFEBF8]',
      ctaBtnClass:
        'bg-white hover:bg-[#F5F1FF] text-[#8000EB] border border-[#8000EB] shadow-[0_2px_8px_rgba(128,0,235,0.08)]',
    },
  }[selectedUniverse];

  // Helper to render a gamified circular milestone path aligned with the 3 universe palettes
  const renderCircularMilestonePath = (
    labels: string[],
    completedStepsCount: number,
    universeType: ChallengeUniverse
  ) => {
    const total = labels.length;
    const isAllDone = completedStepsCount >= total;
    const activeIdx = isAllDone ? total - 1 : completedStepsCount;

    const paletteStyles = {
      PERSO: {
        trackBg: 'bg-[#DCEEFF]',
        lineDone: 'bg-[#4FA9FF]',
        nodeDone: 'bg-[#4FA9FF] text-white border-[#4FA9FF]',
        nodeCurrent:
          'bg-[#F2F8FF] text-[#3E97F4] border-2 border-[#4FA9FF] ring-4 ring-[#F2F8FF]',
        nodeUpcoming: 'bg-white text-[#7D97B8] border border-[#BFE0FF]',
        labelDone: 'text-[#3E97F4] font-bold',
        labelCurrent: 'text-[#3E97F4] font-extrabold',
      },
      FAMILLE: {
        trackBg: 'bg-[#D7EFE1]',
        lineDone: 'bg-[#3BAA6E]',
        nodeDone: 'bg-[#3BAA6E] text-white border-[#3BAA6E]',
        nodeCurrent:
          'bg-[#EFFAF4] text-[#2E9A60] border-2 border-[#3BAA6E] ring-4 ring-[#EFFAF4]',
        nodeUpcoming: 'bg-white text-[#6E9982] border border-[#BFE7CF]',
        labelDone: 'text-[#2E9A60] font-bold',
        labelCurrent: 'text-[#2E9A60] font-extrabold',
      },
      COMMUNAUTE: {
        trackBg: 'bg-[#FAE5CA]',
        lineDone: 'bg-[#F29A3A]',
        nodeDone: 'bg-[#F29A3A] text-white border-[#F29A3A]',
        nodeCurrent:
          'bg-[#FFF6EC] text-[#D9821F] border-2 border-[#F29A3A] ring-4 ring-[#FFF6EC]',
        nodeUpcoming: 'bg-white text-[#B08960] border border-[#F5D2A8]',
        labelDone: 'text-[#D9821F] font-bold',
        labelCurrent: 'text-[#D9821F] font-extrabold',
      },
    }[universeType];

    return (
      <div className="relative pt-1 pb-0.5">
        {/* Connecting background track */}
        {total > 1 && (
          <div
            className={`absolute left-[12%] right-[12%] top-[19px] h-[3px] ${paletteStyles.trackBg} rounded-full z-0 overflow-hidden`}
          >
            <div
              className={`h-full ${paletteStyles.lineDone} transition-all duration-500`}
              style={{
                width: `${Math.min(
                  100,
                  Math.round((completedStepsCount / Math.max(1, total - 1)) * 100)
                )}%`,
              }}
            />
          </div>
        )}

        <div
          className="relative z-10 grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
        >
          {labels.map((lbl, idx) => {
            const isDone = idx < completedStepsCount;
            const isCurrent = !isAllDone && idx === activeIdx;

            return (
              <div key={lbl + idx} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[11.5px] font-extrabold transition-all duration-300 ${
                    isDone
                      ? paletteStyles.nodeDone
                      : isCurrent
                      ? paletteStyles.nodeCurrent
                      : paletteStyles.nodeUpcoming
                  }`}
                >
                  {isDone ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`text-[10.5px] mt-1.5 text-center leading-tight truncate max-w-full px-0.5 ${
                    isDone
                      ? paletteStyles.labelDone
                      : isCurrent
                      ? paletteStyles.labelCurrent
                      : 'text-[#8E87A6] font-medium'
                  }`}
                >
                  {lbl}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-2">
      {/* 1. THREE CHALLENGE UNIVERSES — Horizontal Segmented Control */}
      <div
        role="tablist"
        aria-label="Univers de défis"
        className={`grid grid-cols-3 gap-1.5 p-1.5 rounded-[20px] bg-white border ${universeTheme.cardBorder} shadow-[0_6px_18px_-6px_rgba(20,17,31,0.06)] transition-colors`}
      >
        <button
          type="button"
          role="tab"
          aria-selected={selectedUniverse === 'PERSO'}
          onClick={() => setSelectedUniverse('PERSO')}
          className={`h-10 rounded-[15px] text-[12.5px] font-extrabold flex items-center justify-center gap-1.5 transition-all ${
            selectedUniverse === 'PERSO'
              ? 'bg-[#4FA9FF] text-white shadow-[0_6px_14px_-4px_rgba(79,169,255,0.4)]'
              : 'text-[#6E6785] hover:text-[#3E97F4] hover:bg-[#F2F8FF]'
          }`}
        >
          <Sparkles
            size={13.5}
            className={
              selectedUniverse === 'PERSO' ? 'text-white' : 'text-[#4FA9FF]'
            }
          />
          <span>Perso</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={selectedUniverse === 'FAMILLE'}
          onClick={() => setSelectedUniverse('FAMILLE')}
          className={`h-10 rounded-[15px] text-[12.5px] font-extrabold flex items-center justify-center gap-1.5 transition-all ${
            selectedUniverse === 'FAMILLE'
              ? 'bg-[#3BAA6E] text-white shadow-[0_6px_14px_-4px_rgba(59,170,110,0.38)]'
              : 'text-[#6E6785] hover:text-[#2E9A60] hover:bg-[#EFFAF4]'
          }`}
        >
          <Heart
            size={13.5}
            className={
              selectedUniverse === 'FAMILLE' ? 'text-white' : 'text-[#3BAA6E]'
            }
          />
          <span>Famille</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={selectedUniverse === 'COMMUNAUTE'}
          onClick={() => setSelectedUniverse('COMMUNAUTE')}
          className={`h-10 rounded-[15px] text-[12.5px] font-extrabold flex items-center justify-center gap-1.5 transition-all ${
            selectedUniverse === 'COMMUNAUTE'
              ? 'bg-[#F29A3A] text-white shadow-[0_6px_14px_-4px_rgba(242,154,58,0.38)]'
              : 'text-[#6E6785] hover:text-[#D9821F] hover:bg-[#FFF6EC]'
          }`}
        >
          <Users
            size={13.5}
            className={
              selectedUniverse === 'COMMUNAUTE'
                ? 'text-white'
                : 'text-[#F29A3A]'
            }
          />
          <span>Communauté</span>
        </button>
      </div>

      {/* 1.5 COMMUNITY SELECTOR (Only in COMMUNAUTE tab — 1 selected community at a time, no "Toutes" option) */}
      {selectedUniverse === 'COMMUNAUTE' && communities.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {communities.map((comm) => {
            const isSelected = activeCommunity?.id === comm.id;
            return (
              <button
                key={comm.id}
                type="button"
                onClick={() => setSelectedCommunityId(comm.id)}
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
      )}

      {/* 2. ACHIEVEMENTS HERO (Unified layout across Perso, Famille, Communauté) */}
      <section
        className={`rounded-[24px] p-4.5 border shadow-[0_10px_26px_-8px_rgba(20,17,31,0.06)] space-y-3.5 ${universeTheme.heroBg}`}
      >
        <div className="flex flex-col items-center text-center space-y-2.5 pt-0.5">
          <div>
            <h2 className="text-[18px] font-extrabold text-[#14111F] leading-tight tracking-tight">
              {universeTheme.heroTitle}
            </h2>
            <p className="text-[12px] font-semibold text-[#6E6785] mt-0.5">
              {universeTheme.heroSubtitle}
            </p>
          </div>

          {/* Centered circular image/avatar with circular progress ring & percentage pill */}
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg
              className="w-20 h-20 -rotate-90"
              viewBox="0 0 80 80"
              aria-hidden="true"
            >
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke={universeTheme.ringTrackColor}
                strokeWidth="4"
              />
              <circle
                cx="40"
                cy="40"
                r="36"
                fill="none"
                stroke={universeTheme.ringStrokeColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 36}
                strokeDashoffset={
                  2 * Math.PI * 36 * (1 - Math.min(100, heroProgressPct) / 100)
                }
                className="transition-all duration-500"
              />
            </svg>
            <img
              src={universeTheme.heroAvatarUrl}
              alt={universeTheme.heroAvatarAlt}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs absolute"
            />
            <span
              className={`absolute -bottom-1.5 px-2 py-0.5 rounded-full bg-white border text-[10.5px] font-extrabold tabular-nums shadow-2xs ${universeTheme.pctPillClass}`}
            >
              {heroProgressPct} %
            </span>
          </div>
        </div>

        {/* Two compact achievement counters (Clickable in PERSO, visual in FAMILLE & COMMUNAUTE) */}
        <div className="grid grid-cols-2 gap-2.5">
          {selectedUniverse === 'PERSO' ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setSelectedCompletedChallengeId(null);
                  setActivePersoHistoryPage('CHALLENGES');
                }}
                className={`rounded-[16px] border px-3.5 py-2.5 flex items-center justify-between gap-2 text-left transition-all hover:bg-[#E8F3FF] active:scale-[0.98] cursor-pointer ${universeTheme.statBox1}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full bg-white border flex items-center justify-center shrink-0 shadow-2xs ${universeTheme.statIconColor}`}
                  >
                    <Flag size={15} strokeWidth={2.4} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[16px] font-extrabold tabular-nums leading-none block">
                      {completedCount}/{totalChallengesInUniverse}
                    </span>
                    <span
                      className={`text-[11px] font-semibold block mt-0.5 truncate ${universeTheme.statLabelColor}`}
                    >
                      Défis terminés
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={15}
                  strokeWidth={2.4}
                  className="text-[#4FA9FF] shrink-0"
                />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedEarnedBadgeId(null);
                  setActivePersoHistoryPage('BADGES');
                }}
                className={`rounded-[16px] border px-3.5 py-2.5 flex items-center justify-between gap-2 text-left transition-all hover:bg-[#E8F3FF] active:scale-[0.98] cursor-pointer ${universeTheme.statBox2}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full bg-white border flex items-center justify-center shrink-0 shadow-2xs ${universeTheme.statIconColor}`}
                  >
                    <Medal size={15} strokeWidth={2.4} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[16px] font-extrabold tabular-nums leading-none block">
                      {unlockedBadgesCount}/{currentBadges.length}
                    </span>
                    <span
                      className={`text-[11px] font-semibold block mt-0.5 truncate ${universeTheme.statLabelColor}`}
                    >
                      Badges gagnés
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={15}
                  strokeWidth={2.4}
                  className="text-[#4FA9FF] shrink-0"
                />
              </button>
            </>
          ) : (
            <>
              <div
                className={`rounded-[16px] border px-3.5 py-2.5 flex items-center gap-2.5 ${universeTheme.statBox1}`}
              >
                <div
                  className={`w-8 h-8 rounded-full bg-white border flex items-center justify-center shrink-0 shadow-2xs ${universeTheme.statIconColor}`}
                >
                  <Flag size={15} strokeWidth={2.4} />
                </div>
                <div className="min-w-0">
                  <span className="text-[16px] font-extrabold tabular-nums leading-none block">
                    {completedCount}/{totalChallengesInUniverse}
                  </span>
                  <span
                    className={`text-[11px] font-semibold block mt-0.5 truncate ${universeTheme.statLabelColor}`}
                  >
                    Défis terminés
                  </span>
                </div>
              </div>

              <div
                className={`rounded-[16px] border px-3.5 py-2.5 flex items-center gap-2.5 ${universeTheme.statBox2}`}
              >
                <div
                  className={`w-8 h-8 rounded-full bg-white border flex items-center justify-center shrink-0 shadow-2xs ${universeTheme.statIconColor}`}
                >
                  <Medal size={15} strokeWidth={2.4} />
                </div>
                <div className="min-w-0">
                  <span className="text-[16px] font-extrabold tabular-nums leading-none block">
                    {unlockedBadgesCount}/{currentBadges.length}
                  </span>
                  <span
                    className={`text-[11px] font-semibold block mt-0.5 truncate ${universeTheme.statLabelColor}`}
                  >
                    Badges gagnés
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 3. ACTIVE CHALLENGES */}
      {(selectedUniverse === 'PERSO'
        ? persoActiveChallenges.length > 0
        : selectedUniverse === 'FAMILLE'
        ? familleActive.length > 0
        : commActive.length > 0) && (
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[16px] font-extrabold text-[#14111F]">
              {universeTheme.activeSectionTitle}
            </h3>
            {selectedUniverse === 'PERSO' && persoActiveChallenges.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#F2F8FF] border border-[#BFE0FF] text-[#3E97F4] text-[11px] font-extrabold tabular-nums">
                {persoActiveChallenges.length} en cours
              </span>
            )}
            {selectedUniverse === 'FAMILLE' && familleActive.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#EFFAF4] border border-[#BFE7CF] text-[#2E9A60] text-[11px] font-extrabold tabular-nums">
                {familleActive.length} en cours
              </span>
            )}
            {selectedUniverse === 'COMMUNAUTE' && commActive.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFF6EC] border border-[#F5D2A8] text-[#D9821F] text-[11px] font-extrabold tabular-nums">
                {commActive.length} en cours
              </span>
            )}
          </div>

          {/* PERSO ACTIVE CHALLENGES (Sky Blue) */}
          {selectedUniverse === 'PERSO' &&
            persoActiveChallenges.map((ch) => {
              if (ch.id === 'defi-shopping-1') {
                const activeWeek = Math.min(
                  4,
                  shoppingChallengeCompletedWeeks + 1
                );
                const pct = Math.min(
                  100,
                  Math.round((shoppingChallengeCompletedWeeks / 4) * 100)
                );

                return (
                  <div
                    key={ch.id}
                    className="rounded-[24px] p-4.5 space-y-3.5 border border-[#BFE0FF] bg-gradient-to-br from-[#F2F8FF] via-white to-white shadow-[0_8px_22px_-6px_rgba(79,169,255,0.12)]"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-[16px] bg-[#F2F8FF] border border-[#BFE0FF] text-[#4FA9FF] flex items-center justify-center shrink-0 shadow-2xs">
                          <ShoppingBag size={20} strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-extrabold text-[#3E97F4] uppercase tracking-wider">
                              4 semaines
                            </span>
                            <span className="text-[#BFE0FF]">·</span>
                            <span className="text-[11px] font-bold text-[#3E97F4]">
                              Objectif −250 DH
                            </span>
                          </div>
                          <h4 className="text-[16px] font-extrabold text-[#14111F] leading-snug truncate">
                            Mon défi Shopping
                          </h4>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-[#F2F8FF] border border-[#BFE0FF] text-[#3E97F4] text-[11px] font-extrabold tabular-nums shrink-0">
                        Sem. {activeWeek}/4 · {pct} %
                      </span>
                    </div>

                    {/* Gamified circular milestone path */}
                    {renderCircularMilestonePath(
                      ['Sem. 1', 'Sem. 2', 'Sem. 3', 'Sem. 4'],
                      shoppingChallengeCompletedWeeks,
                      'PERSO'
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShoppingChallengeOrigin('MES_DEFIS');
                        clearShoppingChallengeJustActivated();
                        navigateTo('F4_SHOPPING_CHALLENGE');
                      }}
                      className="w-full h-11 rounded-full bg-white hover:bg-[#F2F8FF] text-[#3E97F4] border border-[#3E97F4] text-[13px] font-extrabold flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(62,151,244,0.08)] transition-all active:scale-[0.99]"
                    >
                      <span>Continuer mon défi</span>
                      <ArrowRight size={15} strokeWidth={2.3} />
                    </button>
                  </div>
                );
              }

              const doneMilestonesCount = ch.milestones.filter(
                (m) => m.completed
              ).length;
              const stepLabels = ch.milestones.map(
                (_, idx) => `Étape ${idx + 1}`
              );

              return (
                <div
                  key={ch.id}
                  className="rounded-[24px] p-4.5 space-y-3.5 border border-[#BFE0FF] bg-gradient-to-br from-[#F2F8FF] via-white to-white shadow-[0_8px_22px_-6px_rgba(79,169,255,0.1)]"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-[16px] bg-[#F2F8FF] border border-[#BFE0FF] text-[#4FA9FF] flex items-center justify-center shrink-0">
                        <Target size={20} strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-extrabold text-[#3E97F4] uppercase tracking-wider block">
                          {ch.duration}
                        </span>
                        <h4 className="text-[16px] font-extrabold text-[#14111F] leading-snug truncate">
                          {ch.title}
                        </h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#F2F8FF] border border-[#BFE0FF] text-[#3E97F4] text-[11px] font-extrabold tabular-nums shrink-0">
                      {ch.progressPct} %
                    </span>
                  </div>

                  {renderCircularMilestonePath(
                    stepLabels,
                    doneMilestonesCount,
                    'PERSO'
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      navigateTo('F3_ACTIVE_CHALLENGE', {
                        challengeId: ch.id,
                      })
                    }
                    className="w-full h-11 rounded-full bg-white hover:bg-[#F2F8FF] text-[#3E97F4] border border-[#3E97F4] text-[13px] font-extrabold flex items-center justify-center gap-1.5 shadow-[0_2px_8px_rgba(62,151,244,0.08)] transition-all active:scale-[0.99]"
                  >
                    <span>Continuer mon défi</span>
                    <ArrowRight size={15} strokeWidth={2.3} />
                  </button>
                </div>
              );
            })}

          {/* FAMILLE (Green) & COMMUNAUTE (Orange) ACTIVE CHALLENGES */}
          {(selectedUniverse === 'FAMILLE' ||
            selectedUniverse === 'COMMUNAUTE') && (() => {
            const isFam = selectedUniverse === 'FAMILLE';
            const activeList = isFam ? familleActive : commActive;

            if (activeList.length === 0) {
              return (
                <div className="rounded-[24px] p-4.5 flex items-center gap-3.5 border bg-gradient-to-br from-[#FFF6EC] via-white to-white border-[#F5D2A8] shadow-[0_8px_22px_-8px_rgba(242,154,58,0.1)]">
                  <div className="w-11 h-11 rounded-[16px] border flex items-center justify-center shrink-0 bg-[#FFF6EC] border-[#F5D2A8] text-[#F29A3A]">
                    <Users size={20} strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-[#14111F]">
                      Aucun défi collectif en cours
                    </p>
                    <p className="text-[12px] text-[#6E6785] mt-0.5 leading-snug">
                      Choisissez un défi recommandé ci-dessous pour épargner à plusieurs.
                    </p>
                  </div>
                </div>
              );
            }

            return activeList.map((ch) => {
              const pct = Math.min(
                100,
                Math.round(
                  (ch.completedSteps / Math.max(1, ch.steps.length)) * 100
                )
              );
              const isCoral = ch.accentType === 'CORAL';
              const isMint = ch.accentType === 'MINT';
              const isBlue = ch.accentType === 'BLUE';

              return (
                <div
                  key={ch.id}
                  className={`rounded-[24px] p-4.5 space-y-3.5 border ${
                    isFam
                      ? 'bg-gradient-to-br from-[#EFFAF4] via-white to-white border-[#BFE7CF] shadow-[0_8px_22px_-6px_rgba(59,170,110,0.1)]'
                      : 'bg-gradient-to-br from-[#FFF6EC] via-white to-white border-[#F5D2A8] shadow-[0_8px_22px_-6px_rgba(242,154,58,0.1)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-[16px] border flex items-center justify-center shrink-0 ${
                          isFam
                            ? 'bg-[#EFFAF4] border-[#BFE7CF] text-[#3BAA6E]'
                            : 'bg-[#FFF6EC] border-[#F5D2A8] text-[#F29A3A]'
                        }`}
                      >
                        {isCoral ? (
                          <Sparkles size={20} strokeWidth={2.2} />
                        ) : isMint ? (
                          <ShieldCheck size={20} strokeWidth={2.2} />
                        ) : isBlue ? (
                          <Users size={20} strokeWidth={2.2} />
                        ) : (
                          <Gift size={20} strokeWidth={2.2} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {ch.childTag && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                isFam
                                  ? 'bg-[#EFFAF4] border-[#BFE7CF] text-[#2E9A60]'
                                  : 'bg-[#FFF6EC] border-[#F5D2A8] text-[#D9821F]'
                              }`}
                            >
                              {ch.childTag}
                            </span>
                          )}
                          <span
                            className={`text-[11px] font-extrabold uppercase tracking-wide ${
                              isFam ? 'text-[#2E9A60]' : 'text-[#D9821F]'
                            }`}
                          >
                            {ch.duration}
                          </span>
                        </div>
                        <h4 className="text-[15.5px] font-extrabold text-[#14111F] leading-snug mt-0.5">
                          {ch.title}
                        </h4>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full border text-[11px] font-extrabold tabular-nums shrink-0 ${
                        isFam
                          ? 'bg-[#EFFAF4] border-[#BFE7CF] text-[#2E9A60]'
                          : 'bg-[#FFF6EC] border-[#F5D2A8] text-[#D9821F]'
                      }`}
                    >
                      {pct} %
                    </span>
                  </div>

                  {renderCircularMilestonePath(
                    ch.steps,
                    ch.completedSteps,
                    isFam ? 'FAMILLE' : 'COMMUNAUTE'
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedExtraChallengeId(ch.id)}
                    className={`w-full h-11 rounded-full bg-white text-[13px] font-extrabold flex items-center justify-center gap-1.5 border transition-all active:scale-[0.99] ${
                      isFam
                        ? 'hover:bg-[#EFFAF4] text-[#2E9A60] border-[#2E9A60] shadow-[0_2px_8px_rgba(46,154,96,0.08)]'
                        : 'hover:bg-[#FFF6EC] text-[#D9821F] border-[#D9821F] shadow-[0_2px_8px_rgba(217,130,31,0.08)]'
                    }`}
                  >
                    <span>Continuer mon défi</span>
                    <ArrowRight size={15} strokeWidth={2.3} />
                  </button>
                </div>
              );
            });
          })()}
        </section>
      )}

      {/* 4. RECOMMENDED CHALLENGES (Up to 2 compact cards per universe) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[16px] font-extrabold text-[#14111F]">
            Défis recommandés
          </h3>
          <span
            className={`text-[11.5px] font-bold ${
              selectedUniverse === 'PERSO' || selectedUniverse === 'FAMILLE'
                ? 'text-[#7D7693]'
                : universeTheme.statLabelColor
            }`}
          >
            {selectedUniverse === 'PERSO'
              ? 'Adaptés à vos habitudes'
              : selectedUniverse === 'FAMILLE'
              ? 'Foyer & Simple One'
              : 'Projets à plusieurs'}
          </span>
        </div>

        {/* PERSO RECOMMENDED — Horizontal Editorial Carousel */}
        {selectedUniverse === 'PERSO' &&
          (persoRecommendedChallenges.length === 0 ? (
            <div className="rounded-[24px] bg-white border border-[#EFEBF8] p-4 text-center text-[12.5px] text-[#6E6785] font-semibold shadow-[0_8px_22px_-10px_rgba(20,17,31,0.06)]">
              Tous vos défis recommandés sont déjà en cours ou terminés.
            </div>
          ) : (
            <div className="flex gap-3.5 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-1 px-1 pb-1.5">
              {persoRecommendedChallenges.map((ch) => {
                const isShopping = ch.id === 'defi-shopping-1';
                const isSubs = ch.id === 'defi-abonnements-4';
                const isVerify =
                  ch.id === 'defi-verifier-2' || ch.id === 'defi-categories-2';

                const coverImageUrl = isSubs
                  ? 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=85'
                  : isVerify
                  ? 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=85'
                  : isShopping
                  ? 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85'
                  : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85';

                const shortSentence = isSubs
                  ? 'Examinez vos 3 abonnements détectés pour garder le contrôle de vos paiements récurrents.'
                  : isVerify
                  ? 'Passez en revue 4 opérations récentes pour affiner vos catégories et votre bilan.'
                  : isShopping
                  ? 'Réduisez de 250 DH vos achats Shopping en 4 semaines à votre rythme.'
                  : ch.purpose;

                const badgeRewardLabel =
                  ch.badgeName ||
                  (isSubs
                    ? 'Abonnements clairs'
                    : isVerify
                    ? 'Œil Attentif'
                    : isShopping
                    ? 'Équilibre Shopping'
                    : 'Cap Voyage');

                const handleDiscoverChallenge = () => {
                  if (isShopping) {
                    setShoppingChallengeOrigin('MES_DEFIS');
                    navigateTo('F4_SHOPPING_CHALLENGE');
                  } else {
                    navigateTo('F2_CHALLENGE_DETAIL', {
                      challengeId: ch.id,
                    });
                  }
                };

                return (
                  <div
                    key={ch.id}
                    role="button"
                    tabIndex={0}
                    onClick={handleDiscoverChallenge}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleDiscoverChallenge();
                      }
                    }}
                    className="group w-[83%] sm:w-[292px] shrink-0 snap-start rounded-[24px] bg-white border border-[#EFEBF8] shadow-[0_10px_28px_-10px_rgba(20,17,31,0.08)] overflow-hidden flex flex-col justify-between transition-all hover:border-[#8000EB]/30 active:scale-[0.99] cursor-pointer text-left"
                  >
                    {/* Top Cover Image with Duration & Discreet Badge Reward */}
                    <div>
                      <div className="relative h-[142px] w-full overflow-hidden bg-[#F5F2FA]">
                        <img
                          src={coverImageUrl}
                          alt={ch.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-black/15" />

                        {/* Top-left: Small duration label */}
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/92 backdrop-blur-md text-[#14111F] text-[11px] font-bold shadow-2xs">
                            {ch.duration}
                          </span>
                        </div>

                        {/* Top-right: Discreet badge reward indicator */}
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/92 backdrop-blur-md text-[#290764] text-[11px] font-bold shadow-2xs">
                            <Medal
                              size={11.5}
                              strokeWidth={2.3}
                              className="text-[#8000EB] shrink-0"
                            />
                            <span>Badge « {badgeRewardLabel} »</span>
                          </span>
                        </div>
                      </div>

                      {/* Editorial Content */}
                      <div className="p-4 pb-3 space-y-1.5">
                        <h4 className="text-[16px] font-extrabold text-[#14111F] leading-snug tracking-tight">
                          {ch.title}
                        </h4>
                        <p className="text-[12.5px] text-[#6E6785] leading-relaxed line-clamp-2">
                          {shortSentence}
                        </p>
                      </div>
                    </div>

                    {/* Footer: Discreet Objective + Secondary CTA "Découvrir →" */}
                    <div className="px-4 pb-4 pt-2.5 border-t border-[#F4F1FA] flex items-center justify-between gap-2">
                      <span className="text-[11.5px] font-medium text-[#7D7693] truncate">
                        {ch.criteriaText}
                      </span>
                      <span className="text-[13px] font-extrabold text-[#8000EB] inline-flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                        <span>Découvrir →</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

        {/* FAMILLE RECOMMENDED — Horizontal Editorial Carousel */}
        {selectedUniverse === 'FAMILLE' &&
          (familleRecommended.length === 0 ? (
            <div className="rounded-[24px] bg-white border border-[#EFEBF8] p-4 text-center text-[12.5px] text-[#6E6785] font-semibold shadow-[0_8px_22px_-10px_rgba(20,17,31,0.06)]">
              Tous vos défis familiaux recommandés sont déjà en cours ou terminés.
            </div>
          ) : (
            <div className="flex gap-3.5 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-1 px-1 pb-1.5">
              {familleRecommended.map((ch) => {
                const isCourses = ch.id === 'fam-courses-1';
                const coverImageUrl = isCourses
                  ? 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=85'
                  : 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&w=900&q=85';

                const footerLabel = ch.childTag
                  ? `${ch.childTag} · ${ch.objectiveTag}`
                  : ch.objectiveTag;

                return (
                  <div
                    key={ch.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleStartExtraChallenge(ch.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleStartExtraChallenge(ch.id);
                      }
                    }}
                    className="group w-[83%] sm:w-[292px] shrink-0 snap-start rounded-[24px] bg-white border border-[#EFEBF8] shadow-[0_10px_28px_-10px_rgba(20,17,31,0.08)] overflow-hidden flex flex-col justify-between transition-all hover:border-[#8000EB]/30 active:scale-[0.99] cursor-pointer text-left"
                  >
                    {/* Top Cover Image with Duration & Discreet Badge Reward */}
                    <div>
                      <div className="relative h-[142px] w-full overflow-hidden bg-[#F5F2FA]">
                        <img
                          src={coverImageUrl}
                          alt={ch.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-black/15" />

                        {/* Top-left: Small duration label */}
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white/92 backdrop-blur-md text-[#14111F] text-[11px] font-bold shadow-2xs">
                            {ch.duration}
                          </span>
                        </div>

                        {/* Top-right: Discreet badge reward indicator */}
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/92 backdrop-blur-md text-[#290764] text-[11px] font-bold shadow-2xs">
                            <Medal
                              size={11.5}
                              strokeWidth={2.3}
                              className="text-[#8000EB] shrink-0"
                            />
                            <span>Badge « {ch.badgeName} »</span>
                          </span>
                        </div>
                      </div>

                      {/* Editorial Content */}
                      <div className="p-4 pb-3 space-y-1.5">
                        <h4 className="text-[16px] font-extrabold text-[#14111F] leading-snug tracking-tight">
                          {ch.title}
                        </h4>
                        <p className="text-[12.5px] text-[#6E6785] leading-relaxed line-clamp-2">
                          {ch.shortDescription}
                        </p>
                      </div>
                    </div>

                    {/* Footer: Discreet Objective + Secondary CTA "Découvrir →" */}
                    <div className="px-4 pb-4 pt-2.5 border-t border-[#F4F1FA] flex items-center justify-between gap-2">
                      <span className="text-[11.5px] font-medium text-[#7D7693] truncate">
                        {footerLabel}
                      </span>
                      <span className="text-[13px] font-extrabold text-[#8000EB] inline-flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                        <span>Découvrir →</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

        {/* COMMUNAUTE RECOMMENDED — Horizontal Editorial Carousel (Visual only) */}
        {selectedUniverse === 'COMMUNAUTE' && (
          <div className="flex gap-3.5 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-1 px-1 pb-1.5">
            {commEditorialRecommended.map((card) => (
              <div
                key={card.id}
                className="w-[83%] sm:w-[292px] shrink-0 snap-start rounded-[24px] bg-white border border-[#EFEBF8] shadow-[0_10px_28px_-10px_rgba(20,17,31,0.08)] overflow-hidden flex flex-col justify-between text-left"
              >
                {/* Top Cover Image with Discreet Badge Reward */}
                <div>
                  <div className="relative h-[142px] w-full overflow-hidden bg-[#F5F2FA]">
                    <img
                      src={card.coverUrl}
                      alt={card.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-black/15" />

                    {/* Top-right: Discreet badge reward indicator */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/92 backdrop-blur-md text-[#290764] text-[11px] font-bold shadow-2xs">
                        <Medal
                          size={11.5}
                          strokeWidth={2.3}
                          className="text-[#8000EB] shrink-0"
                        />
                        <span>Badge « {card.badge} »</span>
                      </span>
                    </div>
                  </div>

                  {/* Editorial Content */}
                  <div className="p-4 pb-3 space-y-1.5">
                    <h4 className="text-[16px] font-extrabold text-[#14111F] leading-snug tracking-tight">
                      {card.title}
                    </h4>
                    <p className="text-[12.5px] text-[#6E6785] leading-relaxed line-clamp-2">
                      {card.description}
                    </p>
                  </div>
                </div>

                {/* Footer: Associated Badge Label + Visual CTA "Découvrir →" */}
                <div className="px-4 pb-4 pt-2.5 border-t border-[#F4F1FA] flex items-center justify-between gap-2">
                  <span className="text-[11.5px] font-medium text-[#7D7693] truncate">
                    Badge « {card.badge} »
                  </span>
                  <span className="text-[13px] font-extrabold text-[#8000EB] inline-flex items-center gap-1 shrink-0">
                    <span>Découvrir →</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. MY ACHIEVEMENTS ("Mes réussites" / "Nos réussites" — Illustrated badges) */}
      <section
        className={`card-simple p-4.5 space-y-3.5 border ${universeTheme.cardBorder}`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[16px] font-extrabold text-[#14111F] leading-tight">
              {selectedUniverse === 'PERSO' ? 'Mes réussites' : 'Nos réussites'}
            </h3>
            <p className="text-[11.5px] text-[#7D7693] mt-0.5">
              {selectedUniverse === 'PERSO'
                ? 'Badges personnels débloqués grâce à vos défis'
                : selectedUniverse === 'FAMILLE'
                ? 'Badges du foyer et missions Simple One · Yasmine'
                : 'Badges collectifs de votre communauté'}
            </p>
          </div>
          {selectedUniverse !== 'COMMUNAUTE' && (
            <button
              type="button"
              onClick={() => setIsBadgesModalOpen(true)}
              className={`text-[12.5px] font-extrabold inline-flex items-center gap-0.5 shrink-0 ${universeTheme.linkText}`}
            >
              <span>Voir tout</span>
              <ChevronRight size={14} strokeWidth={2.4} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {currentBadges.map((badge) => {
            const BadgeIcon = badge.icon;
            const ownerTag = 'ownerTag' in badge ? badge.ownerTag : undefined;

            if (selectedUniverse === 'COMMUNAUTE') {
              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-[18px] border text-left flex flex-col justify-between gap-2 ${
                    badge.unlocked
                      ? `${badge.unlockedBg} ${badge.unlockedBorder} shadow-2xs`
                      : `bg-white ${universeTheme.cardBorder} opacity-85`
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 ${
                        badge.unlocked
                          ? badge.iconBg
                          : universeTheme.lockedIconBg
                      }`}
                    >
                      <BadgeIcon size={18} strokeWidth={2.2} />
                    </div>

                    {badge.unlocked ? (
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${universeTheme.checkBadgeBg}`}
                      >
                        <Check size={11} strokeWidth={3} />
                      </span>
                    ) : (
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${universeTheme.lockedIconBg}`}
                      >
                        <Lock size={11} strokeWidth={2.3} />
                      </span>
                    )}
                  </div>

                  <div>
                    <p
                      className={`text-[13px] font-extrabold leading-tight ${
                        badge.unlocked ? 'text-[#14111F]' : 'text-[#6E6785]'
                      }`}
                    >
                      {badge.title}
                    </p>
                    <p className="text-[11px] text-[#7D7693] leading-snug mt-0.5 line-clamp-2">
                      {badge.subtitle}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={badge.id}
                type="button"
                onClick={() => setIsBadgesModalOpen(true)}
                className={`p-3 rounded-[18px] border text-left transition-all flex flex-col justify-between gap-2 ${
                  badge.unlocked
                    ? `${badge.unlockedBg} ${badge.unlockedBorder} shadow-2xs`
                    : `bg-white ${universeTheme.cardBorder} opacity-85`
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 ${
                      badge.unlocked
                        ? badge.iconBg
                        : universeTheme.lockedIconBg
                    }`}
                  >
                    <BadgeIcon size={18} strokeWidth={2.2} />
                  </div>

                  {badge.unlocked ? (
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${universeTheme.checkBadgeBg}`}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  ) : (
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${universeTheme.lockedIconBg}`}
                    >
                      <Lock size={11} strokeWidth={2.3} />
                    </span>
                  )}
                </div>

                <div>
                  {ownerTag && (
                    <span className="inline-block px-1.5 py-0.5 rounded-md bg-[#EFFAF4] border border-[#BFE7CF] text-[#2E9A60] text-[9.5px] font-extrabold mb-1">
                      {ownerTag}
                    </span>
                  )}
                  <p
                    className={`text-[13px] font-extrabold leading-tight ${
                      badge.unlocked ? 'text-[#14111F]' : 'text-[#6E6785]'
                    }`}
                  >
                    {badge.title}
                  </p>
                  <p className="text-[11px] text-[#7D7693] leading-snug mt-0.5 line-clamp-2">
                    {badge.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* FULL ACHIEVEMENTS COLLECTION SHEET ("Voir tout") */}
      {isBadgesModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-end justify-center"
          onClick={() => setIsBadgesModalOpen(false)}
        >
          <div
            className={`w-full max-w-[412px] max-h-[82vh] overflow-y-auto bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t ${universeTheme.cardBorder}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 rounded-full bg-[#E2DCF0] mx-auto" />

            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className={`text-[11px] font-extrabold uppercase tracking-wider block ${universeTheme.statLabelColor}`}
                >
                  Collection ·{' '}
                  {selectedUniverse === 'PERSO'
                    ? 'Perso'
                    : selectedUniverse === 'FAMILLE'
                    ? 'Famille & Simple One'
                    : 'Communauté'}
                </span>
                <h3 className="text-[18px] font-extrabold text-[#14111F] mt-0.5">
                  {universeTheme.heroTitle}
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold tabular-nums ${universeTheme.pillClass}`}
              >
                {unlockedBadgesCount}/{currentBadges.length} débloqués
              </span>
            </div>

            <div className="space-y-2.5">
              {currentBadges.map((badge) => {
                const BadgeIcon = badge.icon;
                const ownerTag =
                  'ownerTag' in badge ? badge.ownerTag : undefined;

                return (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-[18px] border flex items-center justify-between gap-3 ${
                      badge.unlocked
                        ? `${badge.unlockedBg} ${badge.unlockedBorder}`
                        : `bg-white ${universeTheme.cardBorder}`
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-[15px] flex items-center justify-center shrink-0 ${
                          badge.unlocked
                            ? badge.iconBg
                            : universeTheme.lockedIconBg
                        }`}
                      >
                        <BadgeIcon size={20} strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0">
                        {ownerTag && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-[#EFFAF4] border border-[#BFE7CF] text-[#2E9A60] text-[10px] font-extrabold mb-0.5">
                            {ownerTag}
                          </span>
                        )}
                        <p className="text-[14px] font-extrabold text-[#14111F] leading-snug">
                          {badge.title}
                        </p>
                        <p className="text-[12px] text-[#6E6785] leading-snug mt-0.5">
                          {badge.subtitle}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold shrink-0 ${
                        badge.unlocked
                          ? universeTheme.pillClass
                          : 'bg-[#F5F2FA] text-[#7D7693]'
                      }`}
                    >
                      {badge.unlocked ? 'Débloqué' : 'À débloquer'}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setIsBadgesModalOpen(false)}
              className={`w-full h-11 rounded-full text-[13.5px] font-extrabold transition-colors ${universeTheme.ctaBtnClass}`}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* DETAIL SHEET FOR ACTIVE FAMILY / COMMUNITY CHALLENGE */}
      {selectedExtraChallenge && (() => {
        const isExtraFam = selectedExtraChallenge.universe === 'FAMILLE';
        return (
          <div
            className="fixed inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-end justify-center"
            onClick={() => setSelectedExtraChallengeId(null)}
          >
            <div
              className={`w-full max-w-[412px] bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t ${
                isExtraFam ? 'border-[#BFE7CF]' : 'border-[#F5D2A8]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1.5 rounded-full bg-[#E2DCF0] mx-auto" />

              <div className="flex items-start justify-between gap-2">
                <div>
                  <span
                    className={`text-[11px] font-extrabold uppercase tracking-wider block ${
                      isExtraFam ? 'text-[#2E9A60]' : 'text-[#D9821F]'
                    }`}
                  >
                    {selectedExtraChallenge.childTag ||
                      selectedExtraChallenge.duration}
                  </span>
                  <h3 className="text-[18px] font-extrabold text-[#14111F] mt-0.5">
                    {selectedExtraChallenge.title}
                  </h3>
                  <p className="text-[12.5px] text-[#6E6785] mt-1">
                    {selectedExtraChallenge.shortDescription}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full border text-[11px] font-extrabold shrink-0 ${
                    isExtraFam
                      ? 'bg-[#EFFAF4] border-[#BFE7CF] text-[#2E9A60]'
                      : 'bg-[#FFF6EC] border-[#F5D2A8] text-[#D9821F]'
                  }`}
                >
                  {selectedExtraChallenge.completedSteps}/
                  {selectedExtraChallenge.steps.length} étapes
                </span>
              </div>

              <div
                className={`p-4 rounded-[18px] border ${
                  isExtraFam
                    ? 'bg-[#EFFAF4] border-[#BFE7CF]'
                    : 'bg-[#FFF6EC] border-[#F5D2A8]'
                }`}
              >
                {renderCircularMilestonePath(
                  selectedExtraChallenge.steps,
                  selectedExtraChallenge.completedSteps,
                  isExtraFam ? 'FAMILLE' : 'COMMUNAUTE'
                )}
              </div>

              <div className="space-y-2 pt-1">
                {selectedExtraChallenge.status !== 'COMPLETED' && (
                  <button
                    type="button"
                    onClick={() =>
                      handleAdvanceExtraChallengeStep(selectedExtraChallenge.id)
                    }
                    className={`w-full h-11 rounded-full text-white text-[13.5px] font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      isExtraFam
                        ? 'bg-[#3BAA6E] hover:bg-[#2E9A60]'
                        : 'bg-[#F29A3A] hover:bg-[#D9821F]'
                    }`}
                  >
                    <span>Valider l’étape en cours</span>
                    <Check size={15} strokeWidth={2.6} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedExtraChallengeId(null)}
                  className={`w-full h-11 rounded-full bg-white border text-[13px] font-extrabold ${
                    isExtraFam
                      ? 'border-[#2E9A60] text-[#2E9A60] hover:bg-[#EFFAF4]'
                      : 'border-[#D9821F] text-[#D9821F] hover:bg-[#FFF6EC]'
                  }`}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* DEDICATED PAGE 1 — "Mes défis accomplis" (Perso Completed Challenges History) */}
      {activePersoHistoryPage === 'CHALLENGES' && (() => {
        const selectedCompletedCh = persoCompletedChallenges.find(
          (c) => c.id === selectedCompletedChallengeId
        );

        return (
          <div className="fixed sm:absolute inset-0 z-50 bg-simple-canvas flex flex-col overflow-y-auto">
            <MobileHeader
              title="Mes défis accomplis"
              onBack={() => {
                if (selectedCompletedChallengeId) {
                  setSelectedCompletedChallengeId(null);
                } else {
                  setActivePersoHistoryPage(null);
                }
              }}
            />

            <div className="px-5 pt-2 pb-8 flex-1 flex flex-col justify-between gap-6">
              {persoCompletedChallenges.length === 0 ? (
                /* Empty state — No completed challenges */
                <div className="flex-1 flex flex-col justify-center py-6">
                  <section className="rounded-[24px] p-6 bg-[#F2F8FF] border border-[#BFE0FF] text-center space-y-4 shadow-[0_10px_26px_-10px_rgba(79,169,255,0.14)]">
                    <div className="w-14 h-14 rounded-[20px] bg-white border border-[#BFE0FF] text-[#4FA9FF] flex items-center justify-center mx-auto shadow-2xs">
                      <Flag size={24} strokeWidth={2.2} />
                    </div>
                    <div className="space-y-1.5 max-w-[285px] mx-auto">
                      <h2 className="text-[17px] font-extrabold text-[#14111F] leading-snug">
                        Aucun défi accompli pour le moment
                      </h2>
                      <p className="text-[13px] text-[#5C6F84] leading-relaxed">
                        Lancez votre premier défi personnel pour suivre vos progrès et célébrer vos réussites.
                      </p>
                    </div>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setActivePersoHistoryPage(null)}
                        className="w-full h-[50px] rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_-4px_rgba(128,0,235,0.34)] transition-all active:scale-[0.985]"
                      >
                        <span>Découvrir mes défis</span>
                        <ArrowRight size={16} strokeWidth={2.3} />
                      </button>
                    </div>
                  </section>
                </div>
              ) : selectedCompletedCh ? (
                /* Read-only detail of a completed personal challenge */
                (() => {
                  const meta = getPersoChallengeHistoryMeta(selectedCompletedCh);
                  const ChIcon = meta.icon;
                  return (
                    <div className="space-y-4">
                      <section className="rounded-[24px] p-5 bg-[#F2F8FF] border border-[#BFE0FF] space-y-4 shadow-[0_10px_26px_-10px_rgba(79,169,255,0.14)]">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#BFE0FF] text-[#2F80ED] text-[11.5px] font-extrabold">
                            <Check size={12} strokeWidth={3} className="text-[#4FA9FF]" />
                            <span>Défi accompli</span>
                          </span>
                          <span className="text-[12px] font-semibold text-[#5C6F84] tabular-nums">
                            Terminé le {meta.completionDate}
                          </span>
                        </div>

                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-[18px] bg-white border border-[#BFE0FF] text-[#4FA9FF] flex items-center justify-center shrink-0 shadow-2xs">
                            <ChIcon size={22} strokeWidth={2.2} />
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-[18px] font-extrabold text-[#14111F] leading-snug">
                              {meta.title}
                            </h2>
                            <p className="text-[12.5px] font-semibold text-[#2F80ED] mt-0.5">
                              {meta.achievedObjective}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-[18px] bg-white border border-[#BFE0FF] p-3.5 space-y-1">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2F80ED] block">
                            Objectif atteint
                          </span>
                          <p className="text-[13px] text-[#14111F] leading-relaxed">
                            {meta.detailedObjective}
                          </p>
                        </div>
                      </section>

                      <section className="card-simple p-4.5 border border-[#BFE0FF] space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-[14.5px] font-extrabold text-[#14111F]">
                            Étapes validées
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#F2F8FF] border border-[#BFE0FF] text-[#2F80ED] text-[11px] font-extrabold tabular-nums">
                            100 % complété
                          </span>
                        </div>

                        <div className="space-y-2">
                          {selectedCompletedCh.milestones.map((m) => (
                            <div
                              key={m.id}
                              className="p-3 rounded-[16px] bg-[#F2F8FF] border border-[#BFE0FF] flex items-center gap-3"
                            >
                              <div className="w-6 h-6 rounded-full bg-[#4FA9FF] text-white flex items-center justify-center shrink-0">
                                <Check size={13} strokeWidth={3} />
                              </div>
                              <span className="text-[13px] font-bold text-[#14111F] leading-snug">
                                {m.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>

                      <section className="rounded-[20px] p-4 bg-[#F2F8FF] border border-[#BFE0FF] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-[14px] bg-[#4FA9FF] text-white flex items-center justify-center shrink-0">
                            <Medal size={18} strokeWidth={2.2} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2F80ED] block">
                              Badge débloqué
                            </span>
                            <p className="text-[14px] font-extrabold text-[#14111F] truncate">
                              {meta.badgeTitle}
                            </p>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-white border border-[#BFE0FF] text-[#2F80ED] text-[11px] font-extrabold shrink-0">
                          Acquis
                        </span>
                      </section>

                      <button
                        type="button"
                        onClick={() => setSelectedCompletedChallengeId(null)}
                        className="w-full h-[48px] rounded-full bg-white hover:bg-[#F2F8FF] text-[#2F80ED] border border-[#4FA9FF] text-[13.5px] font-extrabold transition-colors"
                      >
                        Retour à mes défis accomplis
                      </button>
                    </div>
                  );
                })()
              ) : (
                /* Chronological list of completed personal challenges */
                <div className="space-y-3.5">
                  <div className="rounded-[20px] px-4 py-3.5 bg-[#F2F8FF] border border-[#BFE0FF] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-[14px] bg-white border border-[#BFE0FF] text-[#4FA9FF] flex items-center justify-center shrink-0">
                        <Flag size={18} strokeWidth={2.3} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-extrabold text-[#14111F]">
                          Historique de vos défis personnels
                        </p>
                        <p className="text-[12px] text-[#5C6F84]">
                          Touchez un défi accompli pour consulter son récapitulatif.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white border border-[#BFE0FF] text-[#2F80ED] text-[11.5px] font-extrabold tabular-nums shrink-0">
                      {persoCompletedChallenges.length} terminé
                      {persoCompletedChallenges.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {persoCompletedChallenges.map((ch) => {
                      const meta = getPersoChallengeHistoryMeta(ch);
                      const ChIcon = meta.icon;

                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => setSelectedCompletedChallengeId(ch.id)}
                          className="w-full rounded-[22px] p-4 bg-white hover:bg-[#F2F8FF] border border-[#BFE0FF] text-left transition-all flex items-center justify-between gap-3 shadow-[0_6px_18px_-8px_rgba(79,169,255,0.12)] active:scale-[0.99]"
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className="w-11 h-11 rounded-[16px] bg-[#F2F8FF] border border-[#BFE0FF] text-[#4FA9FF] flex items-center justify-center shrink-0 mt-0.5">
                              <ChIcon size={20} strokeWidth={2.2} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F2F8FF] border border-[#BFE0FF] text-[#2F80ED] text-[10.5px] font-extrabold">
                                  <Check size={10} strokeWidth={3} className="text-[#4FA9FF]" />
                                  <span>Terminé le {meta.completionDate}</span>
                                </span>
                              </div>
                              <h3 className="text-[15px] font-extrabold text-[#14111F] leading-snug mt-1">
                                {meta.title}
                              </h3>
                              <p className="text-[12.5px] font-semibold text-[#2F80ED] mt-0.5">
                                {meta.achievedObjective}
                              </p>
                            </div>
                          </div>

                          <ChevronRight
                            size={18}
                            strokeWidth={2.3}
                            className="text-[#4FA9FF] shrink-0"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* DEDICATED PAGE 2 — "Mes badges" (Perso Earned Badges Only) */}
      {activePersoHistoryPage === 'BADGES' && (() => {
        const earnedPersoBadges = persoBadges.filter((b) => b.unlocked);
        const selectedBadge = earnedPersoBadges.find(
          (b) => b.id === selectedEarnedBadgeId
        );

        return (
          <div className="fixed sm:absolute inset-0 z-50 bg-simple-canvas flex flex-col overflow-y-auto">
            <MobileHeader
              title="Mes badges"
              onBack={() => {
                if (selectedEarnedBadgeId) {
                  setSelectedEarnedBadgeId(null);
                } else {
                  setActivePersoHistoryPage(null);
                }
              }}
            />

            <div className="px-5 pt-2 pb-8 flex-1 flex flex-col justify-between gap-6">
              {earnedPersoBadges.length === 0 ? (
                /* Empty state — No earned badges */
                <div className="flex-1 flex flex-col justify-center py-6">
                  <section className="rounded-[24px] p-6 bg-[#F2F8FF] border border-[#BFE0FF] text-center space-y-4 shadow-[0_10px_26px_-10px_rgba(79,169,255,0.14)]">
                    <div className="w-14 h-14 rounded-[20px] bg-white border border-[#BFE0FF] text-[#4FA9FF] flex items-center justify-center mx-auto shadow-2xs">
                      <Medal size={24} strokeWidth={2.2} />
                    </div>
                    <div className="space-y-1.5 max-w-[285px] mx-auto">
                      <h2 className="text-[17px] font-extrabold text-[#14111F] leading-snug">
                        Aucun badge débloqué pour le moment
                      </h2>
                      <p className="text-[13px] text-[#5C6F84] leading-relaxed">
                        Complétez des défis personnels pour débloquer vos premiers badges.
                      </p>
                    </div>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setActivePersoHistoryPage(null)}
                        className="w-full h-[50px] rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_20px_-4px_rgba(128,0,235,0.34)] transition-all active:scale-[0.985]"
                      >
                        <span>Voir les défis disponibles</span>
                        <ArrowRight size={16} strokeWidth={2.3} />
                      </button>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-[20px] px-4 py-3.5 bg-[#F2F8FF] border border-[#BFE0FF] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-[14px] bg-white border border-[#BFE0FF] text-[#4FA9FF] flex items-center justify-center shrink-0">
                        <Medal size={18} strokeWidth={2.3} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-extrabold text-[#14111F]">
                          Badges personnels gagnés
                        </p>
                        <p className="text-[12px] text-[#5C6F84]">
                          Touchez un badge pour voir l’objectif qui l’a débloqué.
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white border border-[#BFE0FF] text-[#2F80ED] text-[11.5px] font-extrabold tabular-nums shrink-0">
                      {earnedPersoBadges.length} gagné
                      {earnedPersoBadges.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Elegant visual grid of earned badges */}
                  <div className="grid grid-cols-2 gap-3">
                    {earnedPersoBadges.map((badge) => {
                      const BadgeIcon = badge.icon;
                      return (
                        <button
                          key={badge.id}
                          type="button"
                          onClick={() => setSelectedEarnedBadgeId(badge.id)}
                          className="p-4 rounded-[22px] bg-gradient-to-br from-[#F2F8FF] via-white to-[#EBF5FF] border border-[#BFE0FF] text-left transition-all flex flex-col justify-between gap-3 shadow-[0_6px_18px_-8px_rgba(79,169,255,0.14)] hover:border-[#4FA9FF] active:scale-[0.98]"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="w-12 h-12 rounded-[16px] bg-[#4FA9FF] text-white flex items-center justify-center shrink-0 shadow-[0_6px_14px_-4px_rgba(79,169,255,0.4)]">
                              <BadgeIcon size={22} strokeWidth={2.2} />
                            </div>
                            <span className="w-6 h-6 rounded-full bg-[#4FA9FF] text-white flex items-center justify-center shrink-0">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          </div>

                          <div>
                            <h3 className="text-[14.5px] font-extrabold text-[#14111F] leading-snug">
                              {badge.title}
                            </h3>
                            <span className="text-[11.5px] font-semibold text-[#2F80ED] mt-1 block">
                              Obtenu le {badge.earnedDate}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Earned Badge Detail Sheet */}
            {selectedBadge && (() => {
              const SelectedBadgeIcon = selectedBadge.icon;
              return (
                <div
                  className="fixed inset-0 z-50 bg-[#14111F]/45 backdrop-blur-xs flex items-end justify-center"
                  onClick={() => setSelectedEarnedBadgeId(null)}
                >
                  <div
                    className="w-full max-w-[412px] bg-white rounded-t-[28px] p-5 space-y-4 shadow-2xl border-t border-[#BFE0FF]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-10 h-1.5 rounded-full bg-[#DCEEFF] mx-auto" />

                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-[18px] bg-[#4FA9FF] text-white flex items-center justify-center shrink-0 shadow-[0_8px_18px_-4px_rgba(79,169,255,0.4)]">
                        <SelectedBadgeIcon size={26} strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F2F8FF] border border-[#BFE0FF] text-[#2F80ED] text-[11px] font-extrabold">
                          <Check size={11} strokeWidth={3} className="text-[#4FA9FF]" />
                          <span>Obtenu le {selectedBadge.earnedDate}</span>
                        </span>
                        <h3 className="text-[18px] font-extrabold text-[#14111F] mt-1 leading-tight">
                          {selectedBadge.title}
                        </h3>
                      </div>
                    </div>

                    <div className="rounded-[18px] bg-[#F2F8FF] border border-[#BFE0FF] p-4 space-y-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2F80ED] block">
                        Accomplissement débloqué
                      </span>
                      <p className="text-[13px] font-medium text-[#14111F] leading-relaxed">
                        {selectedBadge.requirement}
                      </p>
                      <div className="pt-1.5 border-t border-[#BFE0FF]/60 flex items-center justify-between text-[12px]">
                        <span className="text-[#5C6F84] font-semibold">
                          Défi associé
                        </span>
                        <span className="font-extrabold text-[#2F80ED]">
                          {selectedBadge.relatedChallengeTitle}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedEarnedBadgeId(null)}
                      className="w-full h-11 rounded-full bg-white hover:bg-[#F2F8FF] text-[#2F80ED] border border-[#4FA9FF] text-[13.5px] font-extrabold transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}
    </div>
  );
};

// SCREEN F2 & F3 — Challenge Details and Active Challenge Screen
export const ChallengeDetailAndActiveScreens: React.FC = () => {
  const {
    currentScreen,
    selectedChallengeId,
    challenges,
    budgets,
    shoppingSummary,
    startChallenge,
    simulateNextWeek,
    navigateTo,
  } = usePFM();

  const [notifyProgress, setNotifyProgress] = useState(true);

  const challenge =
    challenges.find((c) => c.id === selectedChallengeId) || challenges[0];

  const shoppingBudgetLimit = budgets['Shopping']?.limit || 1600;

  // SCREEN F2 — Challenge details (Before starting)
  if (currentScreen === 'F2_CHALLENGE_DETAIL') {
    return (
      <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
        <MobileHeader
          title="Détail du défi"
          onBack={() => navigateTo('C1_HUB', { hubTab: 'MES_DEFIS' })}
        />

        <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <section className="card-simple p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-full bg-[#F2EDFF] flex items-center justify-center">
                  <SimpleBarsIcon size={22} />
                </div>
                <span className="px-3 py-1 rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-xs font-bold">
                  {challenge.duration}
                </span>
              </div>

              <h2 className="text-[20px] font-extrabold text-[#14111F] leading-snug">
                {challenge.shortTitle}
              </h2>
              <p className="text-[13px] text-[#7D7693] leading-relaxed">
                {challenge.purpose}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#F3EFFA]">
                <div>
                  <span className="text-[12px] text-[#7D7693] block">
                    Durée prévue
                  </span>
                  <span className="text-[15px] font-extrabold text-[#14111F]">
                    {challenge.duration}
                  </span>
                </div>
                <div>
                  <span className="text-[12px] text-[#7D7693] block">
                    Budget de référence
                  </span>
                  <span className="text-[15px] font-extrabold text-[#5E1DF0] tabular-nums">
                    {formatDH(shoppingBudgetLimit)} / mois
                  </span>
                </div>
              </div>
            </section>

            <section className="card-simple p-5 space-y-3">
              <h3 className="text-[15px] font-extrabold text-[#14111F]">
                Comment votre progression est calculée
              </h3>
              <p className="text-[13px] text-[#7D7693] leading-relaxed">
                Chaque semaine, Simple compare vos achats {challenge.category}{' '}
                au rythme hebdomadaire de votre budget (
                {formatDH(Math.round(shoppingBudgetLimit / 4))} / semaine). Un
                écart ponctuel ne bloque jamais votre progression.
              </p>

              <div className="space-y-2.5 pt-2">
                <p className="text-[13px] font-bold text-[#14111F]">
                  Étapes attendues :
                </p>
                {challenge.milestones.map((m, idx) => (
                  <div
                    key={m.id}
                    className="flex items-start gap-3 text-[13px] text-[#14111F]"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#F2EDFF] text-[#5E1DF0] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span>{m.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card-simple p-4.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0">
                  <Bell size={18} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#14111F]">
                    Point d’étape hebdomadaire
                  </p>
                  <p className="text-[12px] text-[#7D7693]">
                    Récapitulatif encourageant chaque dimanche
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={notifyProgress}
                onClick={() => setNotifyProgress((v) => !v)}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  notifyProgress ? 'bg-[#5E1DF0]' : 'bg-[#D5CDE6]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    notifyProgress ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </section>
          </div>

          <button
            type="button"
            onClick={() => {
              startChallenge(challenge.id);
              navigateTo('F3_ACTIVE_CHALLENGE', { challengeId: challenge.id });
            }}
            className="w-full h-[52px] btn-simple-primary text-[15px] font-semibold flex items-center justify-center gap-2"
          >
            <span>Commencer ce défi</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    );
  }

  // SCREEN F3 — Active challenge view
  return (
    <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
      <MobileHeader
        title="Suivi de mon défi"
        onBack={() => navigateTo('C1_HUB', { hubTab: 'MES_DEFIS' })}
      />

      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          <section className="card-simple p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[#E7F7F0] text-[#12895B] text-xs font-bold">
                {challenge.status === 'COMPLETED'
                  ? 'Défi terminé'
                  : 'Défi actif'}
              </span>
              <span className="flex items-center gap-1 text-xs font-medium text-[#7D7693] tabular-nums">
                <Clock size={14} className="text-[#5E1DF0]" />
                {challenge.daysRemaining} jours restants
              </span>
            </div>

            <h2 className="text-[19px] font-extrabold text-[#14111F]">
              {challenge.title}
            </h2>

            <div className="flex items-end justify-between">
              <div>
                <span className="text-[12px] text-[#7D7693] block">
                  Progression validée
                </span>
                <span className="text-[24px] font-extrabold text-[#5E1DF0] tabular-nums">
                  {challenge.progressPct} %
                </span>
              </div>
              <div className="text-right">
                <span className="text-[12px] text-[#7D7693] block">
                  Budget de référence
                </span>
                <span className="text-[16px] font-bold text-[#14111F] tabular-nums">
                  {formatDH(shoppingBudgetLimit)} / mois
                </span>
              </div>
            </div>

            <div className="w-full h-3 bg-[#EFEAFF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5E1DF0] rounded-full transition-all duration-300"
                style={{ width: `${challenge.progressPct}%` }}
              />
            </div>
          </section>

          <section className="rounded-[22px] bg-[#F5F1FF] p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EAE2FF] text-[#5E1DF0] flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#14111F]">
                Encouragement de la semaine
              </p>
              <p className="text-[12px] text-[#7D7693] mt-0.5 leading-relaxed">
                Vous avez déjà posé votre repère Shopping (
                {formatDH(shoppingBudgetLimit)}). Actuellement, vos achats du
                mois s’élèvent à {formatDH(shoppingSummary.amount)}.
              </p>
            </div>
          </section>

          <section className="card-simple p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-extrabold text-[#14111F]">
                Étapes du défi (
                {challenge.milestones.filter((m) => m.completed).length}/
                {challenge.milestones.length})
              </h3>
              <button
                type="button"
                onClick={simulateNextWeek}
                className="text-xs font-bold text-[#5E1DF0] hover:underline"
              >
                + Simuler 1 semaine
              </button>
            </div>

            <div className="space-y-2.5">
              {challenge.milestones.map((m) => (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-[20px] flex items-center justify-between gap-3 ${
                    m.completed ? 'bg-[#F6F3FF]' : 'bg-[#FAF9FC]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        m.completed
                          ? 'bg-[#5E1DF0] text-white'
                          : 'bg-[#E5DFF5] text-[#7D7693]'
                      }`}
                    >
                      <Check size={13} strokeWidth={2.5} />
                    </div>
                    <span
                      className={`text-[13px] ${
                        m.completed
                          ? 'font-bold text-[#14111F]'
                          : 'text-[#7D7693]'
                      }`}
                    >
                      {m.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#5E1DF0] shrink-0">
                    {m.completed ? 'Validé' : 'À venir'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-2.5 pt-3">
          <button
            type="button"
            onClick={() =>
              navigateTo('D2_CATEGORY_DETAIL', { category: 'Shopping' })
            }
            className="w-full h-[52px] btn-simple-primary text-[15px] font-semibold flex items-center justify-center gap-2"
          >
            <span>Inspecter mes dépenses Shopping</span>
            <ArrowRight size={17} />
          </button>

          <button
            type="button"
            onClick={() => navigateTo('C1_HUB', { hubTab: 'MES_DEFIS' })}
            className="w-full h-11 rounded-full bg-white text-[#14111F] text-[13px] font-bold shadow-2xs"
          >
            Retour à Mes défis
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// REVOLUT-INSPIRED 3D ILLUSTRATION SYSTEM FOR LEARN & EARN
// ============================================================================

interface CourseThemeVisual {
  id: string;
  shortCategory: string;
  gradientBg: string;
  cardCoverBg: string;
  accentColor: string;
  pillBg: string;
  pillText: string;
  durationPerLesson: string;
  stepSubtitles: string[];
}

const COURSE_VISUAL_CONFIG: Record<string, CourseThemeVisual> = {
  'course-impulsif-1': {
    id: 'course-impulsif-1',
    shortCategory: 'Dépenses',
    gradientBg: 'from-[#290764] via-[#4C1D95] to-[#8000EB]',
    cardCoverBg: 'from-[#3B0A8F] via-[#5B21B6] to-[#8000EB]',
    accentColor: '#8000EB',
    pillBg: 'bg-[#F3EBFF]',
    pillText: 'text-[#8000EB]',
    durationPerLesson: '1 min',
    stepSubtitles: [
      'Repérer le déclic émotionnel',
      'La règle des 24 heures',
      'Mon enveloppe plaisir',
    ],
  },
  'course-budget-2': {
    id: 'course-budget-2',
    shortCategory: 'Budget',
    gradientBg: 'from-[#064B43] via-[#0D9468] to-[#34D399]',
    cardCoverBg: 'from-[#065F46] via-[#0D9468] to-[#10B981]',
    accentColor: '#0D9468',
    pillBg: 'bg-[#E6F8F1]',
    pillText: 'text-[#0D9468]',
    durationPerLesson: '1 min',
    stepSubtitles: [
      'Les 3 grandes enveloppes',
      'Adapter les % à votre vie',
      'Automatiser le suivi',
    ],
  },
  'course-epargne-3': {
    id: 'course-epargne-3',
    shortCategory: 'Épargne',
    gradientBg: 'from-[#7C2D12] via-[#D97706] to-[#F59E0B]',
    cardCoverBg: 'from-[#9A3412] via-[#D97706] to-[#FBBF24]',
    accentColor: '#D97706',
    pillBg: 'bg-[#FEF3C7]',
    pillText: 'text-[#B45309]',
    durationPerLesson: '1 min',
    stepSubtitles: [
      'Se payer en premier',
      'La force des arrondis',
      'Visualiser son projet',
    ],
  },
  'course-famille-4': {
    id: 'course-famille-4',
    shortCategory: 'Famille',
    gradientBg: 'from-[#831843] via-[#BE185D] to-[#F43F5E]',
    cardCoverBg: 'from-[#9D174D] via-[#DB2777] to-[#FB7185]',
    accentColor: '#DB2777',
    pillBg: 'bg-[#FCE7F3]',
    pillText: 'text-[#BE185D]',
    durationPerLesson: '1 min',
    stepSubtitles: [
      'Commun vs personnel',
      'Lisser les temps forts',
      'Épargner en famille',
    ],
  },
  'course-invest-5': {
    id: 'course-invest-5',
    shortCategory: 'Investir',
    gradientBg: 'from-[#1E1B4B] via-[#3730A3] to-[#6366F1]',
    cardCoverBg: 'from-[#1E1B4B] via-[#4338CA] to-[#6366F1]',
    accentColor: '#4338CA',
    pillBg: 'bg-[#E0E7FF]',
    pillText: 'text-[#3730A3]',
    durationPerLesson: '1 min',
    stepSubtitles: [
      'Épargne de sécurité d’abord',
      'Horizon de temps & risque',
      'Pourquoi diversifier ?',
    ],
  },
  'preview-depenses-abonnements': {
    id: 'preview-depenses-abonnements',
    shortCategory: 'Dépenses',
    gradientBg: 'from-[#311068] via-[#6D28D9] to-[#A855F7]',
    cardCoverBg: 'from-[#3B0764] via-[#6D28D9] to-[#9333EA]',
    accentColor: '#7C3AED',
    pillBg: 'bg-[#F3EBFF]',
    pillText: 'text-[#7C3AED]',
    durationPerLesson: '1 min',
    stepSubtitles: [],
  },
  'preview-budget-premier': {
    id: 'preview-budget-premier',
    shortCategory: 'Budget',
    gradientBg: 'from-[#065F46] via-[#059669] to-[#34D399]',
    cardCoverBg: 'from-[#064E3B] via-[#0D9468] to-[#34D399]',
    accentColor: '#0D9468',
    pillBg: 'bg-[#E6F8F1]',
    pillText: 'text-[#0D9468]',
    durationPerLesson: '1 min',
    stepSubtitles: [],
  },
  'preview-epargne-projet': {
    id: 'preview-epargne-projet',
    shortCategory: 'Épargne',
    gradientBg: 'from-[#9A3412] via-[#EA580C] to-[#FBBF24]',
    cardCoverBg: 'from-[#7C2D12] via-[#D97706] to-[#F59E0B]',
    accentColor: '#D97706',
    pillBg: 'bg-[#FEF3C7]',
    pillText: 'text-[#B45309]',
    durationPerLesson: '1 min',
    stepSubtitles: [],
  },
  'preview-famille-simple-one': {
    id: 'preview-famille-simple-one',
    shortCategory: 'Famille',
    gradientBg: 'from-[#0C4A6E] via-[#0284C7] to-[#38BDF8]',
    cardCoverBg: 'from-[#075985] via-[#0284C7] to-[#38BDF8]',
    accentColor: '#0284C7',
    pillBg: 'bg-[#E0F2FE]',
    pillText: 'text-[#0369A1]',
    durationPerLesson: '1 min',
    stepSubtitles: [],
  },
  'preview-communaute-partage': {
    id: 'preview-communaute-partage',
    shortCategory: 'Communauté',
    gradientBg: 'from-[#7C2D12] via-[#EA580C] to-[#FB923C]',
    cardCoverBg: 'from-[#9A3412] via-[#EA580C] to-[#FB923C]',
    accentColor: '#EA580C',
    pillBg: 'bg-[#FFEDD5]',
    pillText: 'text-[#C2410C]',
    durationPerLesson: '1 min',
    stepSubtitles: [],
  },
  'preview-invest-risque': {
    id: 'preview-invest-risque',
    shortCategory: 'Investir',
    gradientBg: 'from-[#1E1B4B] via-[#312E81] to-[#4F46E5]',
    cardCoverBg: 'from-[#1E1B4B] via-[#3730A3] to-[#4F46E5]',
    accentColor: '#4338CA',
    pillBg: 'bg-[#E0E7FF]',
    pillText: 'text-[#3730A3]',
    durationPerLesson: '1 min',
    stepSubtitles: [],
  },
};

const Course3DArtwork: React.FC<{
  courseId: string;
  variant?: 'hero' | 'grid' | 'horizontal' | 'cover' | 'lesson';
  stepIdx?: number;
}> = ({ courseId, variant = 'hero', stepIdx = 0 }) => {
  const sizeClass =
    variant === 'horizontal'
      ? 'w-20 h-20 rounded-[18px]'
      : variant === 'grid'
      ? 'w-full h-[112px] rounded-t-[20px]'
      : variant === 'cover'
      ? 'w-full h-[168px] rounded-[24px]'
      : variant === 'lesson'
      ? 'w-full h-[136px] rounded-[20px]'
      : 'w-full h-[148px] rounded-t-[22px]';

  const config =
    COURSE_VISUAL_CONFIG[courseId] || COURSE_VISUAL_CONFIG['course-impulsif-1'];

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${config.cardCoverBg} ${sizeClass} flex items-center justify-center select-none shrink-0`}
    >
      {/* Ambient 3D studio lighting blobs */}
      <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/15 blur-xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-8 w-28 h-28 rounded-full bg-black/20 blur-xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(circle at 75% 25%, rgba(255,255,255,0.45) 0%, transparent 55%)',
        }}
      />

      {/* Course 1: Achats impulsifs — 3D Shopping Bag + 24h Pause Clock + Gold Coin */}
      {courseId === 'course-impulsif-1' && (
        <svg
          viewBox="0 0 220 140"
          className={variant === 'horizontal' ? 'w-16 h-16' : 'w-44 h-28'}
          fill="none"
        >
          <defs>
            <linearGradient id="impBag" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E9D5FF" />
              <stop offset="55%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#581C87" />
            </linearGradient>
            <linearGradient id="impBagSide" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#3B0764" />
            </linearGradient>
            <linearGradient id="impCoin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="impClock" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#DDD6FE" />
            </linearGradient>
          </defs>
          {/* Soft floor shadow */}
          <ellipse cx="110" cy="124" rx="64" ry="9" fill="rgba(20,7,50,0.38)" />
          {/* Floating 3D Card in background */}
          <g transform="translate(26, 26) rotate(-12)">
            <rect
              x="0"
              y="0"
              width="58"
              height="38"
              rx="9"
              fill="rgba(255,255,255,0.18)"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1.2"
            />
            <rect x="8" y="9" width="14" height="10" rx="2.5" fill="#FCD34D" />
            <rect
              x="8"
              y="25"
              width="32"
              height="4"
              rx="2"
              fill="rgba(255,255,255,0.65)"
            />
          </g>
          {/* 3D Shopping Bag */}
          <g transform="translate(68, 22)">
            {/* Bag handles */}
            <path
              d="M22 24 C22 8, 46 8, 46 24"
              stroke="#F3E8FF"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Bag 3D side depth */}
            <path d="M58 22 L68 28 L64 92 L54 88 Z" fill="url(#impBagSide)" />
            {/* Bag front body */}
            <rect
              x="8"
              y="22"
              width="50"
              height="68"
              rx="10"
              fill="url(#impBag)"
            />
            {/* Specular highlight */}
            <path
              d="M14 28 H36 C24 44, 18 62, 14 82 Z"
              fill="rgba(255,255,255,0.22)"
            />
            {/* Price tag / heart */}
            <circle cx="33" cy="56" r="12" fill="rgba(255,255,255,0.2)" />
            <path
              d="M33 62 C33 62 25 56.5 25 51.5 C25 48.8 27.2 47 29.5 47 C31.2 47 32.5 48 33 49.2 C33.5 48 34.8 47 36.5 47 C38.8 47 41 48.8 41 51.5 C41 56.5 33 62 33 62 Z"
              fill="#FFF"
            />
          </g>
          {/* 3D 24h Pause Timer Sphere (Right) */}
          <g transform="translate(128, 52)">
            <circle cx="26" cy="26" r="24" fill="#4C1D95" opacity="0.45" />
            <circle
              cx="24"
              cy="24"
              r="22"
              fill="url(#impClock)"
              stroke="#F3E8FF"
              strokeWidth="2"
            />
            <circle
              cx="24"
              cy="24"
              r="17"
              stroke="#8000EB"
              strokeWidth="2.2"
              strokeDasharray="4 3"
            />
            <path
              d="M24 13 V24 L31 28"
              stroke="#290764"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          {/* Floating 3D Gold Star Coin (Top Right) */}
          <g transform="translate(154, 14)">
            <ellipse cx="18" cy="19" rx="15" ry="15" fill="#92400E" />
            <circle cx="16" cy="16" r="15" fill="url(#impCoin)" />
            <circle
              cx="16"
              cy="16"
              r="11.5"
              stroke="#FEF9C3"
              strokeWidth="1.2"
              opacity="0.8"
            />
            <path
              d="M16 8.5 L18.2 13 L23.2 13.7 L19.6 17.2 L20.4 22.1 L16 19.8 L11.6 22.1 L12.4 17.2 L8.8 13.7 L13.8 13 Z"
              fill="#FFFBEB"
            />
          </g>
          {stepIdx > 0 && (
            <circle cx="42" cy="96" r="6" fill="#6EE7B7" opacity="0.9" />
          )}
        </svg>
      )}

      {/* Course 2: Budget 50/30/20 — 3D Isometric Cylinders & Envelopes */}
      {courseId === 'course-budget-2' && (
        <svg
          viewBox="0 0 220 140"
          className={variant === 'horizontal' ? 'w-16 h-16' : 'w-44 h-28'}
          fill="none"
        >
          <defs>
            <linearGradient id="budMint" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#065F46" />
            </linearGradient>
            <linearGradient id="budPurple" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E9D5FF" />
              <stop offset="50%" stopColor="#9333EA" />
              <stop offset="100%" stopColor="#4C1D95" />
            </linearGradient>
            <linearGradient id="budGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
          <ellipse cx="110" cy="124" rx="68" ry="9" fill="rgba(4,47,36,0.38)" />
          {/* 50% Pillar (Left Mint) */}
          <g transform="translate(38, 28)">
            <rect
              x="0"
              y="0"
              width="38"
              height="86"
              rx="12"
              fill="url(#budMint)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.2"
            />
            <text
              x="19"
              y="48"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="13"
              fontWeight="800"
            >
              50%
            </text>
          </g>
          {/* 30% Pillar (Center Purple) */}
          <g transform="translate(88, 46)">
            <rect
              x="0"
              y="0"
              width="38"
              height="68"
              rx="12"
              fill="url(#budPurple)"
              stroke="rgba(255,255,255,0.45)"
              strokeWidth="1.2"
            />
            <text
              x="19"
              y="39"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="13"
              fontWeight="800"
            >
              30%
            </text>
          </g>
          {/* 20% Pillar (Right Gold) */}
          <g transform="translate(138, 62)">
            <rect
              x="0"
              y="0"
              width="38"
              height="52"
              rx="12"
              fill="url(#budGold)"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.2"
            />
            <text
              x="19"
              y="31"
              textAnchor="middle"
              fill="#FFFBEB"
              fontSize="13"
              fontWeight="800"
            >
              20%
            </text>
          </g>
          {/* Floating 3D Check Badge */}
          <g transform="translate(142, 16)">
            <circle cx="18" cy="18" r="16" fill="#FFFFFF" opacity="0.95" />
            <path
              d="M12 18.5 L16.2 22.5 L24.5 14"
              stroke="#0D9468"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      )}

      {/* Course 3: Épargner sans effort — 3D Vault Jar + Gold Coins + Paper Plane */}
      {courseId === 'course-epargne-3' && (
        <svg
          viewBox="0 0 220 140"
          className={variant === 'horizontal' ? 'w-16 h-16' : 'w-44 h-28'}
          fill="none"
        >
          <defs>
            <linearGradient id="savJar" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.18)" />
            </linearGradient>
            <linearGradient id="savCoin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
          <ellipse cx="110" cy="124" rx="64" ry="9" fill="rgba(69,26,3,0.35)" />
          {/* 3D Glass Savings Capsule */}
          <g transform="translate(68, 22)">
            <rect
              x="14"
              y="0"
              width="44"
              height="12"
              rx="6"
              fill="#FDE68A"
              stroke="#FFF"
              strokeWidth="1.2"
            />
            <rect
              x="4"
              y="10"
              width="64"
              height="84"
              rx="22"
              fill="url(#savJar)"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth="2"
            />
            {/* Stacked 3D Gold Coins inside jar */}
            <ellipse cx="36" cy="78" rx="20" ry="7" fill="url(#savCoin)" />
            <ellipse cx="36" cy="68" rx="20" ry="7" fill="url(#savCoin)" />
            <ellipse cx="36" cy="58" rx="20" ry="7" fill="url(#savCoin)" />
            <circle
              cx="36"
              cy="40"
              r="11"
              fill="url(#savCoin)"
              stroke="#FEF9C3"
              strokeWidth="1.2"
            />
          </g>
          {/* Floating 3D Paper Plane / Travel Goal */}
          <g transform="translate(140, 18) rotate(-10)">
            <path
              d="M4 22 L44 6 L28 38 L20 26 L4 22 Z"
              fill="#FFFFFF"
              stroke="#E9D5FF"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path d="M44 6 L20 26 L24 35 L28 38 L44 6 Z" fill="#DDD6FE" />
          </g>
          {/* Floating Round-up +6 DH bubble */}
          <g transform="translate(22, 42)">
            <rect
              x="0"
              y="0"
              width="42"
              height="26"
              rx="13"
              fill="#FFFFFF"
              opacity="0.92"
            />
            <text
              x="21"
              y="17"
              textAnchor="middle"
              fill="#B45309"
              fontSize="11"
              fontWeight="800"
            >
              +6 DH
            </text>
          </g>
        </svg>
      )}

      {/* Course 4: Famille — 3D Home + Shared Cards + Heart */}
      {courseId === 'course-famille-4' && (
        <svg
          viewBox="0 0 220 140"
          className={variant === 'horizontal' ? 'w-16 h-16' : 'w-44 h-28'}
          fill="none"
        >
          <defs>
            <linearGradient id="famHouse" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FCE7F3" />
            </linearGradient>
            <linearGradient id="famRoof" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
          <ellipse cx="110" cy="124" rx="64" ry="9" fill="rgba(80,7,36,0.35)" />
          {/* Left Shared Card */}
          <g transform="translate(26, 48) rotate(-14)">
            <rect
              x="0"
              y="0"
              width="52"
              height="34"
              rx="8"
              fill="#8000EB"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.5"
            />
            <circle cx="14" cy="17" r="6" fill="#FDE047" opacity="0.9" />
          </g>
          {/* Right Shared Card */}
          <g transform="translate(142, 36) rotate(14)">
            <rect
              x="0"
              y="0"
              width="52"
              height="34"
              rx="8"
              fill="#10B981"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="1.5"
            />
            <circle cx="14" cy="17" r="6" fill="#FFFFFF" opacity="0.9" />
          </g>
          {/* Center 3D Family Home */}
          <g transform="translate(68, 22)">
            <path
              d="M42 6 L80 38 H68 V88 H16 V38 H4 L42 6 Z"
              fill="url(#famHouse)"
            />
            <path
              d="M42 4 L82 38 L75 44 L42 16 L9 44 L2 38 L42 4 Z"
              fill="url(#famRoof)"
            />
            {/* Heart inside home */}
            <path
              d="M42 68 C42 68 28 58 28 48.5 C28 43.5 32 40 36.5 40 C39.5 40 41.2 41.8 42 43.8 C42.8 41.8 44.5 40 47.5 40 C52 40 56 43.5 56 48.5 C56 58 42 68 42 68 Z"
              fill="#E11D48"
            />
          </g>
        </svg>
      )}

      {/* Course 5: Investissement — 3D Stepped Growth Bars + Compass + Star */}
      {courseId === 'course-invest-5' && (
        <svg
          viewBox="0 0 220 140"
          className={variant === 'horizontal' ? 'w-16 h-16' : 'w-44 h-28'}
          fill="none"
        >
          <defs>
            <linearGradient id="invBar1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A5B4FC" />
              <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>
            <linearGradient id="invBar2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C4B5FD" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id="invBar3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <ellipse cx="110" cy="124" rx="68" ry="9" fill="rgba(15,12,41,0.42)" />
          {/* 3 Ascending 3D Bars */}
          <rect
            x="42"
            y="72"
            width="28"
            height="42"
            rx="8"
            fill="url(#invBar1)"
            stroke="rgba(255,255,255,0.35)"
          />
          <rect
            x="84"
            y="52"
            width="28"
            height="62"
            rx="8"
            fill="url(#invBar2)"
            stroke="rgba(255,255,255,0.4)"
          />
          <rect
            x="126"
            y="30"
            width="28"
            height="84"
            rx="8"
            fill="url(#invBar3)"
            stroke="rgba(255,255,255,0.5)"
          />
          {/* Rising trajectory line */}
          <path
            d="M40 62 Q88 42 138 18"
            stroke="#FDE047"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Floating Gold Star Coin at peak */}
          <g transform="translate(152, 12)">
            <circle cx="16" cy="16" r="15" fill="#F59E0B" />
            <circle cx="15" cy="15" r="13" fill="#FDE047" />
            <path
              d="M15 8 L17 12.5 L22 13 L18.2 16.3 L19.2 21 L15 18.6 L10.8 21 L11.8 16.3 L8 13 L13 12.5 Z"
              fill="#92400E"
            />
          </g>
        </svg>
      )}

      {/* Preview 1: Faire le tri dans mes abonnements — 3D Recurring Cards + Check Toggle */}
      {courseId === 'preview-depenses-abonnements' && (
        <svg
          viewBox="0 0 220 140"
          className={variant === 'horizontal' ? 'w-16 h-16' : 'w-44 h-28'}
          fill="none"
        >
          <ellipse cx="110" cy="124" rx="64" ry="9" fill="rgba(25,7,54,0.38)" />
          <g transform="translate(36, 30) rotate(-6)">
            <rect
              x="0"
              y="0"
              width="116"
              height="36"
              rx="10"
              fill="rgba(255,255,255,0.22)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.2"
            />
            <circle cx="18" cy="18" r="8" fill="#F472B6" />
            <rect
              x="34"
              y="13"
              width="48"
              height="5"
              rx="2.5"
              fill="rgba(255,255,255,0.8)"
            />
            <rect
              x="34"
              y="21"
              width="30"
              height="4"
              rx="2"
              fill="rgba(255,255,255,0.45)"
            />
          </g>
          <g transform="translate(52, 58)">
            <rect
              x="0"
              y="0"
              width="124"
              height="44"
              rx="12"
              fill="#FFFFFF"
              opacity="0.96"
            />
            <circle cx="22" cy="22" r="10" fill="#8000EB" />
            <path
              d="M18 22 H26 M22 18 V26"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <rect x="40" y="14" width="46" height="6" rx="3" fill="#290764" />
            <rect x="40" y="24" width="32" height="5" rx="2.5" fill="#A78BFA" />
            <rect x="94" y="14" width="22" height="14" rx="7" fill="#10B981" />
            <circle cx="109" cy="21" r="5" fill="#FFFFFF" />
          </g>
          <g transform="translate(150, 18)">
            <circle cx="16" cy="16" r="14" fill="#FDE047" />
            <path
              d="M11 16.5 L14.5 20 L21.5 12.5"
              stroke="#78350F"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      )}

      {/* Preview 2: Créer mon premier budget — 3D Donut Ring + Target Slider */}
      {courseId === 'preview-budget-premier' && (
        <svg
          viewBox="0 0 220 140"
          className={variant === 'horizontal' ? 'w-16 h-16' : 'w-44 h-28'}
          fill="none"
        >
          <ellipse cx="110" cy="124" rx="64" ry="9" fill="rgba(4,47,36,0.38)" />
          <g transform="translate(54, 20)">
            <circle
              cx="44"
              cy="44"
              r="34"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="14"
            />
            <circle
              cx="44"
              cy="44"
              r="34"
              stroke="#FEF08A"
              strokeWidth="14"
              strokeDasharray="115 220"
              strokeLinecap="round"
            />
            <circle
              cx="44"
              cy="44"
              r="34"
              stroke="#A7F3D0"
              strokeWidth="14"
              strokeDasharray="65 220"
              strokeDashoffset="-125"
              strokeLinecap="round"
            />
            <circle cx="44" cy="44" r="18" fill="#FFFFFF" opacity="0.95" />
            <path
              d="M38 44.5 L42.5 49 L51 39.5"
              stroke="#0D9468"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <g transform="translate(136, 66)">
            <rect
              x="0"
              y="0"
              width="54"
              height="32"
              rx="10"
              fill="#FFFFFF"
              opacity="0.94"
            />
            <rect x="8" y="10" width="38" height="4" rx="2" fill="#D1FAE5" />
            <rect x="8" y="10" width="26" height="4" rx="2" fill="#0D9468" />
            <circle cx="34" cy="12" r="5" fill="#065F46" />
            <rect x="8" y="21" width="24" height="4" rx="2" fill="#6EE7B7" />
          </g>
        </svg>
      )}

      {/* Preview 3: Comment épargner pour un projet ? — 3D Target Flag + Milestone Coins */}
      {courseId === 'preview-epargne-projet' && (
        <svg
          viewBox="0 0 220 140"
          className={variant === 'horizontal' ? 'w-16 h-16' : 'w-44 h-28'}
          fill="none"
        >
          <ellipse cx="110" cy="124" rx="64" ry="9" fill="rgba(69,26,3,0.35)" />
          <g transform="translate(48, 22)">
            <circle
              cx="46"
              cy="48"
              r="36"
              fill="rgba(255,255,255,0.2)"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="2"
            />
            <circle cx="46" cy="48" r="24" fill="#FFFFFF" opacity="0.92" />
            <circle cx="46" cy="48" r="12" fill="#F59E0B" />
            <circle cx="46" cy="48" r="5" fill="#FFFBEB" />
          </g>
          <g transform="translate(122, 18)">
            <rect x="6" y="8" width="4" height="78" rx="2" fill="#FFFBEB" />
            <path d="M10 10 L46 22 L10 36 Z" fill="#FDE047" />
            <circle cx="8" cy="8" r="4" fill="#FFFFFF" />
          </g>
          <g transform="translate(136, 72)">
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="#FDE047"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            <path
              d="M18 11 V25 M13 16 H23"
              stroke="#92400E"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </g>
        </svg>
      )}

      {/* Preview 4: Apprendre à gérer son argent avec Simple One — 3D Teen Card + Piggy Star */}
      {courseId === 'preview-famille-simple-one' && (
        <svg
          viewBox="0 0 220 140"
          className={variant === 'horizontal' ? 'w-16 h-16' : 'w-44 h-28'}
          fill="none"
        >
          <ellipse cx="110" cy="124" rx="64" ry="9" fill="rgba(7,42,64,0.38)" />
          <g transform="translate(42, 28) rotate(-8)">
            <rect
              x="0"
              y="0"
              width="98"
              height="62"
              rx="14"
              fill="#FFFFFF"
              opacity="0.95"
            />
            <rect x="12" y="12" width="28" height="14" rx="7" fill="#0284C7" />
            <text
              x="26"
              y="22"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="8.5"
              fontWeight="800"
            >
              ONE
            </text>
            <rect x="12" y="34" width="54" height="6" rx="3" fill="#0C4A6E" />
            <rect x="12" y="45" width="36" height="5" rx="2.5" fill="#7DD3FC" />
          </g>
          <g transform="translate(128, 36)">
            <circle
              cx="26"
              cy="26"
              r="24"
              fill="#FDE047"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <path
              d="M26 14 L29.2 21 L36.8 22 L31.2 27.2 L32.6 34.8 L26 31.2 L19.4 34.8 L20.8 27.2 L15.2 22 L22.8 21 Z"
              fill="#854D0E"
            />
          </g>
        </svg>
      )}

      {/* Preview 5: Partager les dépenses sans se compliquer la vie — 3D Split Bubbles + Group Nodes */}
      {courseId === 'preview-communaute-partage' && (
        <svg
          viewBox="0 0 220 140"
          className={variant === 'horizontal' ? 'w-16 h-16' : 'w-44 h-28'}
          fill="none"
        >
          <ellipse cx="110" cy="124" rx="64" ry="9" fill="rgba(69,20,7,0.38)" />
          <path
            d="M68 68 L110 38 L152 68 M68 68 L152 68"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="3"
            strokeDasharray="4 4"
          />
          <g transform="translate(90, 18)">
            <circle cx="20" cy="20" r="18" fill="#FFFFFF" />
            <text
              x="20"
              y="24"
              textAnchor="middle"
              fill="#C2410C"
              fontSize="11"
              fontWeight="800"
            >
              ÷3
            </text>
          </g>
          <g transform="translate(46, 54)">
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="#FDE047"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <path
              d="M14 20.5 L18 24.5 L26 16"
              stroke="#92400E"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <g transform="translate(134, 54)">
            <circle
              cx="20"
              cy="20"
              r="17"
              fill="#FED7AA"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <path
              d="M14 20.5 L18 24.5 L26 16"
              stroke="#9A3412"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      )}

      {/* Preview 6: Comprendre le risque avant d'investir — 3D Balance Scale + Shield */}
      {courseId === 'preview-invest-risque' && (
        <svg
          viewBox="0 0 220 140"
          className={variant === 'horizontal' ? 'w-16 h-16' : 'w-44 h-28'}
          fill="none"
        >
          <ellipse cx="110" cy="124" rx="64" ry="9" fill="rgba(15,12,41,0.42)" />
          <g transform="translate(76, 22)">
            <path
              d="M34 6 L64 18 V46 C64 68 50 84 34 92 C18 84 4 68 4 46 V18 L34 6 Z"
              fill="rgba(255,255,255,0.2)"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="2"
            />
            <path
              d="M34 16 L54 24 V45 C54 61 44 73 34 79 C24 73 14 61 14 45 V24 L34 16 Z"
              fill="#FFFFFF"
              opacity="0.95"
            />
            <path
              d="M25 46 L31.5 52.5 L44 39"
              stroke="#4338CA"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <g transform="translate(144, 24)">
            <circle cx="16" cy="16" r="14" fill="#FDE047" />
            <path
              d="M11 19 L15 14 L18 17 L22 11"
              stroke="#78350F"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      )}
    </div>
  );
};

const COURSE_EDITORIAL_PHOTOS: Record<string, string> = {
  'course-impulsif-1': IMPULSIF_COURSE_IMAGE_URL,
  'course-budget-2':
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80',
  'course-epargne-3':
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80',
  'course-famille-4':
    '/src/assets/images/moroccan_family_foyer_1791969781489.jpg',
  'course-invest-5':
    '/src/assets/images/invest_lifestyle_photo_1791991053447.jpg',
  'preview-depenses-abonnements':
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80',
  'preview-budget-premier':
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
  'preview-epargne-projet':
    '/src/assets/images/travel_project_photo_1791764239686.jpg',
  'preview-famille-simple-one':
    'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&w=900&q=80',
  'preview-communaute-partage':
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
  'preview-invest-risque':
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
};

interface PreviewCourseCardItem {
  id: string;
  title: string;
  shortCategory: string;
  filterTopics: string[];
  duration: string;
  lessonsCount: number;
  description?: string;
}

const PREVIEW_EVERYDAY_COURSES: PreviewCourseCardItem[] = [
  {
    id: 'preview-depenses-abonnements',
    title: 'Faire le tri dans mes abonnements',
    shortCategory: 'Dépenses',
    filterTopics: ['Dépenses'],
    duration: '3 min',
    lessonsCount: 3,
  },
  {
    id: 'preview-budget-premier',
    title: 'Créer mon premier budget',
    shortCategory: 'Budget',
    filterTopics: ['Budget'],
    duration: '3 min',
    lessonsCount: 3,
  },
  {
    id: 'preview-epargne-projet',
    title: 'Comment épargner pour un projet ?',
    shortCategory: 'Épargne',
    filterTopics: ['Épargne', 'Projets'],
    duration: '3 min',
    lessonsCount: 3,
  },
  {
    id: 'preview-famille-simple-one',
    title: 'Apprendre à gérer son argent avec Simple One',
    shortCategory: 'Famille',
    filterTopics: ['Famille'],
    duration: '3 min',
    lessonsCount: 3,
  },
  {
    id: 'preview-communaute-partage',
    title: 'Partager les dépenses sans se compliquer la vie',
    shortCategory: 'Communauté',
    filterTopics: ['Communauté'],
    duration: '3 min',
    lessonsCount: 3,
  },
];

const SIMPLE_WHATS_NEW_CARDS = [
  {
    id: 'whats-new-trip',
    label: 'SIMPLE TRIP',
    title: 'Vos voyages commencent ici',
    description: 'Découvrez comment organiser vos séjours avec Simple.',
    imageUrl: '/src/assets/images/travel_project_photo_1791764239686.jpg',
  },
  {
    id: 'whats-new-one',
    label: 'SIMPLE ONE',
    title: 'Grandir avec les bons réflexes',
    description: "Découvrez l'univers financier dédié aux plus jeunes.",
    imageUrl:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'whats-new-family',
    label: 'SIMPLE FAMILY',
    title: 'La famille, encore plus connectée',
    description:
      "Découvrez de nouvelles façons d'organiser votre argent en famille.",
    imageUrl: '/src/assets/images/moroccan_family_foyer_1791969781489.jpg',
  },
  {
    id: 'whats-new-communaute',
    label: 'COMMUNAUTÉ',
    title: "Ensemble, c'est plus simple",
    description: 'Découvrez les cagnottes et le partage des dépenses.',
    imageUrl:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=700&q=80',
  },
];

// Unified Editorial Course Grid Card — used across Sections 6 & 7 for consistent alignment, hierarchy & photography
const EditorialCourseGridCard: React.FC<{
  id: string;
  title: string;
  shortCategory: string;
  duration: string;
  imageUrl: string;
  isAvailable: boolean;
  points?: number;
  completed?: boolean;
  doneSteps?: number;
  totalSteps?: number;
  onOpen?: () => void;
}> = ({
  title,
  shortCategory,
  duration,
  imageUrl,
  isAvailable,
  points = 100,
  completed = false,
  doneSteps = 0,
  totalSteps = 3,
  onOpen,
}) => {
  if (isAvailable) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="group h-full rounded-[20px] bg-white border border-[#DFD5F5] shadow-[0_8px_20px_-8px_rgba(41,7,100,0.09)] overflow-hidden text-left flex flex-col justify-between hover:border-[#8000EB]/45 active:scale-[0.985] transition-all cursor-pointer"
      >
        <div>
          {/* Photographic Editorial Header */}
          <div className="relative h-[94px] w-full overflow-hidden bg-[#F5F1FF]">
            <img
              src={imageUrl}
              alt={title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#14111F]/35 via-transparent to-[#14111F]/15" />

            {/* Top-right Gold Points Pill */}
            <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[10.5px] font-extrabold shadow-2xs tabular-nums">
              <Star
                size={10}
                className="text-[#D97706] fill-[#F59E0B] shrink-0"
              />
              <span>+{points} pts</span>
            </span>

            {completed && (
              <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-[#0D9468] text-white flex items-center justify-center shadow-xs">
                <Check size={13} strokeWidth={3} />
              </span>
            )}
          </div>

          {/* Card Body — Full Title (Never Truncated) */}
          <div className="p-3 pb-2 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8000EB] block">
              {shortCategory} · {duration}
            </span>
            <h4 className="text-[13px] font-extrabold text-[#14111F] leading-[1.3]">
              {title}
            </h4>
          </div>
        </div>

        {/* Aligned Card Footer */}
        <div className="px-3 pb-2.5 pt-2 border-t border-[#F3EFFA] flex items-center justify-between gap-1.5">
          <span className="text-[11px] font-bold text-[#6E6785] tabular-nums">
            {completed ? 'Terminé' : `${doneSteps}/${totalSteps} leçons`}
          </span>
          <span className="text-[11.5px] font-extrabold text-[#8000EB] inline-flex items-center gap-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform">
            <span>
              {completed ? 'Revoir' : doneSteps > 0 ? 'Continuer' : 'Découvrir'}
            </span>
            <ChevronRight size={13} strokeWidth={2.5} />
          </span>
        </div>
      </button>
    );
  }

  // Upcoming ("À venir") Course Card — Softened, Non-Interactive Editorial Preview
  return (
    <div className="h-full rounded-[20px] bg-[#F7F5FB] border border-[#E6E1F0] overflow-hidden text-left flex flex-col justify-between select-none cursor-default">
      <div>
        {/* Softened Photographic Header */}
        <div className="relative h-[94px] w-full overflow-hidden bg-[#EAE5F3]">
          <img
            src={imageUrl}
            alt={title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-70 saturate-[0.65]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[#290764]/15" />

          {/* Top-right Frosted "À venir" Pill */}
          <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[#5A5273] border border-[#E2DCEB] text-[10px] font-extrabold shadow-2xs">
            <Clock size={10} strokeWidth={2.4} className="text-[#7D7693]" />
            <span>À venir</span>
          </span>
        </div>

        {/* Card Body — Full Title (Never Truncated) */}
        <div className="p-3 pb-2 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A82A3] block">
            {shortCategory} · {duration}
          </span>
          <h4 className="text-[13px] font-bold text-[#5A5273] leading-[1.3]">
            {title}
          </h4>
        </div>
      </div>

      {/* Aligned Muted Footer */}
      <div className="px-3 pb-2.5 pt-2 border-t border-[#ECE8F4] flex items-center justify-between gap-1.5">
        <span className="text-[11px] font-medium text-[#958EAE] tabular-nums">
          {totalSteps} leçons
        </span>
        <span className="text-[11px] font-bold text-[#8A82A3] shrink-0">
          Bientôt
        </span>
      </div>
    </div>
  );
};

// TAB 3 CONTENT — Simple Learn Main Page
export const LearnAndEarnTabContent: React.FC = () => {
  const { courses, learningPoints, navigateTo } = usePFM();
  const [selectedTopic, setSelectedTopic] = useState<string>('Tous');

  const filterTabs = [
    'Tous',
    'Dépenses',
    'Budget',
    'Épargne',
    'Projets',
    'Famille',
    'Communauté',
    'Investir',
  ];

  // Featured course: "Comprendre les achats impulsifs"
  const featuredCourse =
    courses.find((c) => c.id === 'course-impulsif-1') || courses[0];

  // Conditional in-progress course for Section 2 ("Reprendre mon apprentissage")
  const inProgressCourse = courses.find((c) => c.progressPct > 0 && !c.completed);

  // Statistics strictly based on the 5 existing configured courses (excluding preview courses)
  const completedCoursesCount = courses.filter((c) => c.completed).length;
  const totalLessonsCompleted = courses.reduce((acc, c) => {
    if (c.completed) return acc + c.slides.length;
    return (
      acc +
      Math.min(
        c.slides.length,
        Math.round((c.progressPct / 100) * c.slides.length)
      )
    );
  }, 0);
  const totalLessonsAvailable = courses.reduce(
    (acc, c) => acc + c.slides.length,
    0
  );
  const remainingPointsToEarn = courses
    .filter((c) => !c.completed)
    .reduce((sum, c) => sum + c.points, 0);

  const overallCourseProgressPct = Math.round(
    (completedCoursesCount / Math.max(1, courses.length)) * 100
  );

  const getCourseCompletedLessons = (c: typeof featuredCourse) =>
    c.completed
      ? c.slides.length
      : Math.min(
          c.slides.length,
          Math.max(0, Math.round((c.progressPct / 100) * c.slides.length))
        );

  const getCoursePhoto = (courseId: string) =>
    COURSE_EDITORIAL_PHOTOS[courseId] ||
    COURSE_EDITORIAL_PHOTOS['course-impulsif-1'];

  // Map existing courses to thematic filter tags
  const matchesTopicForExistingCourse = (
    course: typeof featuredCourse,
    topic: string
  ) => {
    if (topic === 'Tous') return true;
    const visual = COURSE_VISUAL_CONFIG[course.id];
    const shortCat = visual?.shortCategory || '';
    if (topic === 'Projets') {
      return shortCat === 'Épargne';
    }
    return shortCat === topic;
  };

  // Everyday existing courses (first 4 courses)
  const everydayExistingCourses = courses.slice(0, 4).filter((c) => {
    // Do not duplicate the featured course immediately under "À la une pour vous" when "Tous" is selected
    if (selectedTopic === 'Tous' && c.id === featuredCourse.id) {
      return false;
    }
    return matchesTopicForExistingCourse(c, selectedTopic);
  });

  // Everyday preview courses filtered by selectedTopic
  const everydayPreviewCourses = PREVIEW_EVERYDAY_COURSES.filter((p) => {
    if (selectedTopic === 'Tous') return true;
    return p.filterTopics.includes(selectedTopic);
  });

  const showEverydaySection =
    everydayExistingCourses.length > 0 || everydayPreviewCourses.length > 0;

  const showInvestSection =
    selectedTopic === 'Tous' || selectedTopic === 'Investir';

  const investCourse = courses[4];

  return (
    <div className="space-y-4 pb-2">
      {/* 1. MON PARCOURS SIMPLE LEARN — Compact Achievement Card */}
      <section className="rounded-[24px] p-4 border border-[#EFEBF8] bg-gradient-to-br from-[#F7F3FF] via-white to-[#FAF8FF] shadow-[0_10px_26px_-8px_rgba(20,17,31,0.06)] space-y-3">
        <div className="flex flex-col items-center text-center space-y-2">
          <div>
            <h2 className="text-[17.5px] font-extrabold text-[#14111F] leading-tight tracking-tight">
              Mon parcours Simple Learn
            </h2>
            <p className="text-[12px] font-semibold text-[#6E6785] mt-0.5">
              Apprenez à mieux gérer votre argent, à votre rythme.
            </p>
          </div>

          {/* Centered circular portrait of Lamia with purple progress ring & completion percentage pill */}
          <div className="relative w-18 h-18 flex items-center justify-center">
            <svg
              className="w-18 h-18 -rotate-90"
              viewBox="0 0 72 72"
              aria-hidden="true"
            >
              <circle
                cx="36"
                cy="36"
                r="32"
                fill="none"
                stroke="#EAE2FF"
                strokeWidth="4"
              />
              <circle
                cx="36"
                cy="36"
                r="32"
                fill="none"
                stroke="#8000EB"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={
                  2 *
                  Math.PI *
                  32 *
                  (1 - Math.min(100, overallCourseProgressPct) / 100)
                }
                className="transition-all duration-500"
              />
            </svg>
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80"
              alt="Lamia"
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs absolute"
            />
            <span className="absolute -bottom-1.5 px-2 py-0.5 rounded-full bg-white border border-[#E4D8FC] text-[#290764] text-[10px] font-extrabold tabular-nums shadow-2xs">
              {overallCourseProgressPct} %
            </span>
          </div>

          {/* Current points immediately below with small gold star icon */}
          <div className="pt-0.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-[11.5px] font-extrabold tabular-nums shadow-2xs">
              <Star
                size={12}
                className="text-[#D97706] fill-[#F59E0B] shrink-0"
              />
              <span>{learningPoints} points</span>
            </span>
          </div>
        </div>

        {/* Three compact statistic cells in a single row at the bottom */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-[15px] bg-white/95 border border-[#EFEBF8] px-2 py-2 text-center">
            <span className="text-[14.5px] font-extrabold text-[#290764] tabular-nums leading-none block">
              {completedCoursesCount}/{courses.length}
            </span>
            <span className="text-[10.5px] font-semibold text-[#6E6785] block mt-1 whitespace-nowrap">
              Cours validés
            </span>
          </div>

          <div className="rounded-[15px] bg-white/95 border border-[#EFEBF8] px-2 py-2 text-center">
            <span className="text-[14.5px] font-extrabold text-[#8000EB] tabular-nums leading-none block">
              {totalLessonsCompleted}/{totalLessonsAvailable}
            </span>
            <span className="text-[10.5px] font-semibold text-[#6E6785] block mt-1 whitespace-nowrap">
              Leçons lues
            </span>
          </div>

          <div className="rounded-[15px] bg-white/95 border border-[#EFEBF8] px-2 py-2 text-center">
            <span className="text-[14.5px] font-extrabold text-[#D97706] tabular-nums leading-none block">
              +{remainingPointsToEarn} pts
            </span>
            <span className="text-[10.5px] font-semibold text-[#6E6785] block mt-1 whitespace-nowrap">
              À gagner
            </span>
          </div>
        </div>
      </section>

      {/* 2. REPRENDRE MON APPRENTISSAGE (Conditional — only shown if a course is in progress) */}
      {inProgressCourse && (() => {
        const doneSteps = getCourseCompletedLessons(inProgressCourse);
        const visual =
          COURSE_VISUAL_CONFIG[inProgressCourse.id] ||
          COURSE_VISUAL_CONFIG['course-impulsif-1'];
        return (
          <section className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-[15.5px] font-extrabold text-[#14111F] tracking-tight">
                Reprendre mon apprentissage
              </h3>
            </div>

            <button
              type="button"
              onClick={() =>
                navigateTo('G2_COURSE_DETAIL', {
                  courseId: inProgressCourse.id,
                })
              }
              className="w-full rounded-[20px] bg-white p-3 border border-[#DFD5F5] shadow-[0_8px_20px_-8px_rgba(41,7,100,0.08)] flex items-center gap-3 text-left hover:border-[#8000EB]/40 active:scale-[0.99] transition-all"
            >
              <div className="relative w-18 h-18 rounded-[15px] overflow-hidden bg-[#F5F1FF] shrink-0">
                <img
                  src={getCoursePhoto(inProgressCourse.id)}
                  alt={inProgressCourse.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8000EB] block">
                  {visual.shortCategory} · {inProgressCourse.duration}
                </span>

                <h4 className="text-[14px] font-extrabold text-[#14111F] leading-snug">
                  {inProgressCourse.title}
                </h4>

                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-[11.5px] font-bold text-[#6E6785] tabular-nums">
                    {doneSteps}/{inProgressCourse.slides.length} leçons
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F3EBFF] text-[#8000EB] text-[11.5px] font-extrabold shrink-0">
                    <span>Reprendre</span>
                    <ArrowRight size={12} strokeWidth={2.5} />
                  </span>
                </div>
              </div>
            </button>
          </section>
        );
      })()}

      {/* 3. À LA UNE POUR VOUS */}
      {(() => {
        const heroVisual =
          COURSE_VISUAL_CONFIG[featuredCourse.id] ||
          COURSE_VISUAL_CONFIG['course-impulsif-1'];
        const heroCompletedSteps = getCourseCompletedLessons(featuredCourse);

        return (
          <section className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-[15.5px] font-extrabold text-[#14111F] tracking-tight">
                À la une pour vous
              </h3>
              <span className="text-[11.5px] font-bold text-[#8000EB]">
                {featuredCourse.duration} · {featuredCourse.lessonsCount} leçons
              </span>
            </div>

            <div
              onClick={() =>
                navigateTo('G2_COURSE_DETAIL', {
                  courseId: featuredCourse.id,
                })
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigateTo('G2_COURSE_DETAIL', {
                    courseId: featuredCourse.id,
                  });
                }
              }}
              className="group rounded-[22px] bg-white border border-[#DFD5F5] shadow-[0_10px_26px_-8px_rgba(41,7,100,0.09)] overflow-hidden cursor-pointer transition-all hover:border-[#8000EB]/40 active:scale-[0.99]"
            >
              {/* Photographic Editorial Cover */}
              <div className="relative h-[132px] w-full overflow-hidden bg-[#F5F1FF]">
                <img
                  src={getCoursePhoto(featuredCourse.id)}
                  alt={featuredCourse.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#14111F]/40 via-transparent to-[#14111F]/20" />

                {/* Top-left Category Tag */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#290764] text-[10.5px] font-extrabold shadow-2xs">
                    {heroVisual.shortCategory} · {featuredCourse.duration}
                  </span>
                </div>

                {/* Top-right Points Reward Pill */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-[11px] font-extrabold shadow-xs border border-[#FDE68A] tabular-nums">
                    <Star
                      size={11}
                      className="text-[#D97706] fill-[#F59E0B] shrink-0"
                    />
                    <span>
                      {featuredCourse.completed
                        ? `+${featuredCourse.points} pts gagnés`
                        : `+${featuredCourse.points} pts`}
                    </span>
                  </span>
                </div>
              </div>

              {/* Editorial Card Body */}
              <div className="p-3.5 space-y-2.5">
                <div className="space-y-1">
                  <h4 className="text-[16.5px] font-extrabold text-[#14111F] leading-snug tracking-tight">
                    {featuredCourse.title}
                  </h4>
                  <p className="text-[12px] text-[#6E6785] leading-relaxed">
                    {featuredCourse.description}
                  </p>
                </div>

                {/* Lesson progression bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11.5px]">
                    <span className="font-bold text-[#6E6785]">
                      Progression :{' '}
                      <strong className="text-[#290764] font-extrabold tabular-nums">
                        {heroCompletedSteps}/{featuredCourse.slides.length}{' '}
                        leçons
                      </strong>
                    </span>
                    <span className="font-extrabold text-[#8000EB] tabular-nums">
                      {featuredCourse.completed
                        ? '100 %'
                        : `${Math.round(
                            (heroCompletedSteps /
                              Math.max(1, featuredCourse.slides.length)) *
                              100
                          )} %`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F0EBFA] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#8000EB] rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          featuredCourse.completed
                            ? 100
                            : Math.max(
                                8,
                                Math.round(
                                  (heroCompletedSteps /
                                    Math.max(
                                      1,
                                      featuredCourse.slides.length
                                    )) *
                                    100
                                )
                              )
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Primary Action CTA */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo('G2_COURSE_DETAIL', {
                      courseId: featuredCourse.id,
                    });
                  }}
                  className="w-full h-10 rounded-full bg-[#8000EB] hover:bg-[#6E00CA] text-white text-[13px] font-extrabold flex items-center justify-center gap-2 shadow-[0_6px_16px_-4px_rgba(128,0,235,0.32)] transition-all"
                >
                  <span>
                    {featuredCourse.completed
                      ? 'Revoir ce cours'
                      : heroCompletedSteps > 0
                      ? `Continuer (${heroCompletedSteps}/${featuredCourse.slides.length})`
                      : 'Commencer le cours (3 min)'}
                  </span>
                  <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </section>
        );
      })()}

      {/* 4. QUOI DE NEUF CHEZ SIMPLE ? — Product Discovery Carousel (Visual Only) */}
      <section className="space-y-2">
        <div>
          <h3 className="text-[15.5px] font-extrabold text-[#14111F] tracking-tight">
            Quoi de neuf chez Simple ?
          </h3>
          <p className="text-[11.5px] font-medium text-[#6E6785] mt-0.5">
            Découvrez les fonctionnalités qui facilitent votre quotidien.
          </p>
        </div>

        <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory">
          {SIMPLE_WHATS_NEW_CARDS.map((card) => (
            <div
              key={card.id}
              className="w-[78%] shrink-0 snap-start rounded-[20px] bg-white border border-[#EFEBF8] shadow-[0_8px_20px_-8px_rgba(41,7,100,0.07)] overflow-hidden flex flex-col select-none"
            >
              <div className="relative h-[112px] w-full shrink-0 overflow-hidden bg-[#F5F1FF]">
                <img
                  src={card.imageUrl}
                  alt={card.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14111F]/35 via-transparent to-[#14111F]/15" />

                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[#290764] text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                    {card.label}
                  </span>
                </div>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="text-[14.5px] font-extrabold text-[#14111F] leading-snug tracking-tight">
                    {card.title}
                  </h4>
                  <p className="text-[11.5px] text-[#6E6785] leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="pt-2.5 mt-auto flex items-center justify-end">
                  <span className="text-[12px] font-extrabold text-[#8000EB] inline-flex items-center gap-1">
                    <span>Découvrir</span>
                    <span>→</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. EXPLORER PAR THÉMATIQUE — Horizontal Scrollable Thematic Filter */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-[15.5px] font-extrabold text-[#14111F] tracking-tight">
            Explorer par thématique
          </h3>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {filterTabs.map((topicLabel) => {
            const isActive = selectedTopic === topicLabel;
            return (
              <button
                key={topicLabel}
                type="button"
                onClick={() => setSelectedTopic(topicLabel)}
                className={`h-8.5 px-3.5 rounded-full text-[12px] font-extrabold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#290764] text-white shadow-[0_4px_12px_rgba(41,7,100,0.22)]'
                    : 'bg-white border border-[#EAE4F8] text-[#6E6785] hover:text-[#290764]'
                }`}
              >
                {topicLabel}
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. LES ESSENTIELS AU QUOTIDIEN — 2-Column Editorial Course Grid */}
      {showEverydaySection && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="text-[15.5px] font-extrabold text-[#14111F]">
              Les essentiels au quotidien
            </h3>
            <span className="text-[11px] font-bold text-[#7D7693]">
              3 leçons par cours
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 items-stretch">
            {/* Available Interactive Everyday Courses */}
            {everydayExistingCourses.map((course) => {
              const visual =
                COURSE_VISUAL_CONFIG[course.id] ||
                COURSE_VISUAL_CONFIG['course-impulsif-1'];
              const doneSteps = getCourseCompletedLessons(course);

              return (
                <EditorialCourseGridCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  shortCategory={visual.shortCategory}
                  duration={course.duration}
                  imageUrl={getCoursePhoto(course.id)}
                  isAvailable={true}
                  points={course.points}
                  completed={course.completed}
                  doneSteps={doneSteps}
                  totalSteps={course.slides.length}
                  onOpen={() =>
                    navigateTo('G2_COURSE_DETAIL', { courseId: course.id })
                  }
                />
              );
            })}

            {/* Upcoming ("À venir") Everyday Course Previews */}
            {everydayPreviewCourses.map((preview) => (
              <EditorialCourseGridCard
                key={preview.id}
                id={preview.id}
                title={preview.title}
                shortCategory={preview.shortCategory}
                duration={preview.duration}
                imageUrl={getCoursePhoto(preview.id)}
                isAvailable={false}
                totalSteps={preview.lessonsCount}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. PRÉPARER L'AVENIR — 2-Column Editorial Investment Course Grid */}
      {showInvestSection && investCourse && (() => {
        const doneSteps = getCourseCompletedLessons(investCourse);
        return (
          <section className="space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <h3 className="text-[15.5px] font-extrabold text-[#14111F]">
                Préparer l&apos;avenir
              </h3>
              <span className="text-[11px] font-bold text-[#4338CA]">
                Vision long terme
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 items-stretch">
              {/* Available Investment Course */}
              <EditorialCourseGridCard
                id={investCourse.id}
                title={investCourse.title}
                shortCategory="Investir"
                duration={investCourse.duration}
                imageUrl={getCoursePhoto(investCourse.id)}
                isAvailable={true}
                points={investCourse.points}
                completed={investCourse.completed}
                doneSteps={doneSteps}
                totalSteps={investCourse.slides.length}
                onOpen={() =>
                  navigateTo('G2_COURSE_DETAIL', {
                    courseId: investCourse.id,
                  })
                }
              />

              {/* Upcoming ("À venir") Investment Course Preview */}
              <EditorialCourseGridCard
                id="preview-invest-risque"
                title="Comprendre le risque avant d'investir"
                shortCategory="Investir"
                duration="3 min"
                imageUrl={getCoursePhoto('preview-invest-risque')}
                isAvailable={false}
                totalSteps={3}
              />
            </div>
          </section>
        );
      })()}
    </div>
  );
};

// SCREENS G2, G3, G4, G5 — Revolut-Learn-Inspired Course Cover, Story Lessons, Quiz & Points Celebration
export const LearnCourseFlowScreens: React.FC = () => {
  const {
    currentScreen,
    selectedCourseId,
    courses,
    learningPoints,
    completeCourseStep,
    completeCourseQuiz,
    navigateTo,
    courseReturnContext,
    returnFromCourse,
  } = usePFM();

  const course =
    courses.find((c) => c.id === selectedCourseId) || courses[0];

  const [slideIdx, setSlideIdx] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [justCompletedStep, setJustCompletedStep] = useState<number | null>(
    null
  );

  const isImpulsifModule = course.id === 'course-impulsif-1';
  const visualConfig =
    COURSE_VISUAL_CONFIG[course.id] ||
    COURSE_VISUAL_CONFIG['course-impulsif-1'];

  const completedStepsCount = course.completed
    ? course.slides.length
    : Math.min(
        course.slides.length,
        Math.max(0, Math.round((course.progressPct / 100) * course.slides.length))
      );

  const progressBarPct = course.completed
    ? 100
    : Math.round((completedStepsCount / Math.max(1, course.slides.length)) * 100);

  const allStepsCompleted =
    course.completed || completedStepsCount >= course.slides.length;

  // =========================================================================
  // SCREEN G2 — IMMERSIVE REVOLUT-LEARN COURSE COVER & LESSON ROADMAP
  // =========================================================================
  if (currentScreen === 'G2_COURSE_DETAIL') {
    const primaryCtaLabel =
      completedStepsCount === 0
        ? 'Commencer la leçon 1'
        : completedStepsCount === 1
        ? 'Continuer la leçon 2'
        : completedStepsCount === 2
        ? 'Continuer la leçon 3'
        : `Passer au quiz (+${course.points} pts)`;

    const handlePrimaryAction = () => {
      if (completedStepsCount < course.slides.length) {
        setSlideIdx(completedStepsCount);
        navigateTo('G3_LESSON');
      } else {
        setQuizIdx(0);
        setSelectedOption(null);
        setIsSubmitted(false);
        navigateTo('G4_QUIZ');
      }
    };

    return (
      <div className="min-h-full flex flex-col bg-simple-canvas pb-5">
        <MobileHeader title="Simple Learn" onBack={returnFromCourse} />

        <div className="px-5 pt-2 pb-4 flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            {/* 1. EDITORIAL IMAGE-FIRST HERO & LESSON INTRODUCTION */}
            <section className="rounded-[24px] bg-white border border-[#EFEBF8] shadow-[0_8px_24px_-6px_rgba(41,7,100,0.06)] overflow-hidden">
              <div className="relative w-full h-[164px] bg-[#F5F1FF] overflow-hidden">
                <img
                  src={IMPULSIF_COURSE_IMAGE_URL}
                  alt={
                    isImpulsifModule
                      ? 'Comprendre vos achats impulsifs'
                      : course.title
                  }
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#14111F]/40 via-transparent to-[#14111F]/20" />

                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#5E1DF0] text-[11px] font-extrabold tracking-tight shadow-2xs border border-white/70">
                    Simple Learn · {course.duration}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#5E1DF0] text-[11px] font-extrabold tabular-nums shadow-2xs border border-[#E5DCFF]">
                    {course.completed
                      ? `+${course.points} pts gagnés`
                      : `+${course.points} pts à gagner`}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <h2 className="text-[18px] font-extrabold text-[#14111F] leading-snug tracking-tight">
                  {isImpulsifModule
                    ? 'Comprendre vos achats impulsifs'
                    : course.title}
                </h2>
                <p className="text-[13px] text-[#7D7693] leading-relaxed">
                  {isImpulsifModule
                    ? 'Découvrez ce qui influence vos achats et apprenez à faire des choix plus réfléchis.'
                    : course.description}
                </p>
              </div>
            </section>

            {/* 2. COURSE PROGRAM ("Programme du cours") */}
            <section className="rounded-[24px] bg-white border border-[#EFEBF8] shadow-[0_8px_24px_-6px_rgba(41,7,100,0.06)] p-4 space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-extrabold text-[#14111F]">
                    Programme du cours
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#F5F1FF] text-[#5E1DF0] text-[11.5px] font-extrabold tabular-nums">
                    {completedStepsCount}/{course.slides.length} leçons
                  </span>
                </div>

                <div className="w-full h-1.5 bg-[#F2EDFF] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5E1DF0] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressBarPct}%` }}
                  />
                </div>
              </div>

              {/* 3 Interactive Lesson Rows */}
              <div className="relative space-y-2">
                {course.slides.map((s, idx) => {
                  const isStepDone = idx < completedStepsCount;
                  const isCurrentStep = idx === completedStepsCount;
                  const isLocked = idx > completedStepsCount;
                  const isNewlyCompleted = justCompletedStep === idx;

                  const stepTitle =
                    visualConfig.stepSubtitles[idx] || s.title;

                  return (
                    <div key={s.id} className="relative">
                      {idx < course.slides.length - 1 && (
                        <div
                          className={`absolute left-[27px] top-[44px] -bottom-[10px] w-[2px] z-0 transition-colors duration-300 ${
                            isStepDone ? 'bg-[#A7E3C1]' : 'bg-[#EFEBF8]'
                          }`}
                        />
                      )}

                      <button
                        type="button"
                        disabled={isLocked}
                        onClick={() => {
                          if (isLocked) return;
                          setSlideIdx(idx);
                          navigateTo('G3_LESSON');
                        }}
                        className={`relative z-10 w-full px-3 py-2.5 rounded-[18px] flex items-center justify-between gap-3 text-left transition-all ${
                          isCurrentStep
                            ? 'bg-[#FAF7FF] border border-[#E2D4FF]'
                            : isStepDone
                            ? 'bg-white border border-[#EFEBF8] hover:bg-[#FAF8FF]'
                            : 'bg-[#FAF8FE] border border-transparent opacity-75 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[13px] font-extrabold transition-all duration-300 ${
                              isStepDone
                                ? `bg-[#EAF7EF] text-[#2E9A60] ${
                                    isNewlyCompleted
                                      ? 'scale-110 ring-4 ring-[#EAF7EF]/60'
                                      : ''
                                  }`
                                : isCurrentStep
                                ? 'bg-[#F2EDFF] text-[#5E1DF0] border border-[#DFD2FF]'
                                : 'bg-[#F5F2FA] text-[#9B93B8]'
                            }`}
                          >
                            {isStepDone ? (
                              <Check size={15} strokeWidth={3} />
                            ) : (
                              idx + 1
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="text-[10.5px] font-bold text-[#7D7693] block">
                              Leçon {idx + 1} · {visualConfig.durationPerLesson}
                            </span>
                            <span
                              className={`text-[13.5px] leading-snug truncate block ${
                                isCurrentStep
                                  ? 'font-extrabold text-[#14111F]'
                                  : isStepDone
                                  ? 'font-bold text-[#14111F]'
                                  : 'font-semibold text-[#7D7693]'
                              }`}
                            >
                              {stepTitle}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center">
                          {isStepDone ? (
                            <span className="px-2 py-0.5 rounded-full bg-[#EAF7EF] text-[#2E9A60] text-[10.5px] font-extrabold">
                              Lu
                            </span>
                          ) : isCurrentStep ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#F2EDFF] text-[#5E1DF0] text-[11px] font-extrabold">
                              À lire
                            </span>
                          ) : (
                            <Lock size={14} className="text-[#B5AED0]" />
                          )}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Quiz Final & Points Reward Row */}
              <div className="pt-2 border-t border-[#F3EFFA]">
                <button
                  type="button"
                  disabled={!allStepsCompleted}
                  onClick={() => {
                    if (!allStepsCompleted) return;
                    setQuizIdx(0);
                    setSelectedOption(null);
                    setIsSubmitted(false);
                    navigateTo('G4_QUIZ');
                  }}
                  className={`w-full px-3.5 py-3 rounded-[18px] flex items-center justify-between gap-3 transition-all ${
                    course.completed
                      ? 'bg-[#EAF7EF]/60 border border-[#CBEAD7]'
                      : allStepsCompleted
                      ? 'bg-[#FAF7FF] border border-[#E2D4FF]'
                      : 'bg-[#FAF8FE] border border-[#EFEBF8] opacity-80 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        course.completed
                          ? 'bg-[#EAF7EF] text-[#2E9A60]'
                          : 'bg-[#F2EDFF] text-[#5E1DF0]'
                      }`}
                    >
                      {course.completed ? (
                        <Check size={15} strokeWidth={3} />
                      ) : (
                        <Award size={15} strokeWidth={2.2} />
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <span className="text-[13.5px] font-extrabold text-[#14111F] block truncate">
                        Quiz final · 3 questions
                      </span>
                      <span className="text-[11px] text-[#7D7693] block">
                        {course.completed
                          ? 'Quiz réussi · Points crédités'
                          : 'Validez vos acquis pour débloquer vos points'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-[#F5F1FF] text-[#5E1DF0] border border-[#E5DCFF] text-[11.5px] font-extrabold tabular-nums">
                      +{course.points} pts
                    </span>
                    {!allStepsCompleted && (
                      <Lock size={14} className="text-[#B5AED0]" />
                    )}
                  </div>
                </button>
              </div>
            </section>
          </div>

          {/* 3. PRIMARY BOTTOM CTA */}
          <div>
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#7000CE] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_22px_-4px_rgba(128,0,235,0.3)] transition-all active:scale-[0.985]"
            >
              <span>{primaryCtaLabel}</span>
              <ArrowRight size={16} strokeWidth={2.3} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const lessonHeroImages = [
    IMPULSIF_COURSE_IMAGE_URL,
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop&q=80',
  ];

  // =========================================================================
  // SCREEN G3 — SIMPLE LEARN EDITORIAL LESSON SCREEN
  // =========================================================================
  if (currentScreen === 'G3_LESSON') {
    const currentSlide = course.slides[slideIdx] || course.slides[0];
    const totalSlides = course.slides.length;
    const stepShortTitle =
      visualConfig.stepSubtitles[slideIdx] || currentSlide.title;

    const impulsifLessons = [
      {
        headline: 'Pourquoi dépensons-nous parfois sans l’avoir prévu ?',
        explanation:
          'Un achat spontané répond souvent à une émotion du moment : fatigue en fin de journée, envie de se récompenser ou promotion présentée comme urgente. Identifier ce déclic permet de reprendre la main sur ses décisions sans se priver.',
        tipLabel: 'En pratique dans Simple',
        tipText:
          'En fin de semaine ou après une journée chargée, une offre affichée à durée limitée donne l’impression d’économiser immédiatement, même sur un achat non prévu.',
      },
      {
        headline: 'Une courte pause pour décider au calme',
        explanation:
          'Avant un achat non essentiel, attendre 24 heures permet de laisser retomber l’effet d’urgence et de prendre du recul. Le lendemain, il devient beaucoup plus simple de distinguer une envie passagère d’un achat vraiment utile.',
        tipLabel: 'Astuce concrète',
        tipText:
          'Ajoutez l’article en favoris ou prenez-le en photo : après une nuit de recul, un achat impulsif sur deux perd naturellement son caractère pressant.',
      },
      {
        headline: 'Un repère souple plutôt qu’une contrainte',
        explanation:
          'Prévoir une enveloppe mensuelle dédiée à vos achats plaisir permet de profiter de vos envies sans culpabilité ni mauvaise surprise. Ce cadre souple transforme une bonne intention en habitude durable.',
        tipLabel: 'Repère personnalisé',
        tipText:
          'Fixer un repère mensuel réaliste (ex. 1 600 DH en Shopping) vous aide à garder le contrôle de votre budget tout en préservant vos projets.',
      },
    ];

    const lessonData = isImpulsifModule
      ? impulsifLessons[slideIdx] || impulsifLessons[0]
      : {
          headline: currentSlide.title,
          explanation: currentSlide.content,
          tipLabel: 'En pratique dans Simple',
          tipText: currentSlide.exampleBox,
        };

    const lessonCtaLabel =
      slideIdx === 0
        ? 'Continuer vers la leçon 2'
        : slideIdx === 1
        ? 'Continuer vers la leçon 3'
        : `Passer au quiz (+${course.points} pts)`;

    const handleConfirmLessonStep = () => {
      completeCourseStep(course.id, slideIdx);
      setJustCompletedStep(slideIdx);
      if (slideIdx < totalSlides - 1) {
        setSlideIdx(slideIdx + 1);
      } else {
        setQuizIdx(0);
        setSelectedOption(null);
        setIsSubmitted(false);
        navigateTo('G4_QUIZ');
      }
    };

    const currentHeroImage =
      lessonHeroImages[slideIdx % lessonHeroImages.length];

    return (
      <div className="min-h-full flex flex-col bg-simple-canvas pb-5">
        <MobileHeader
          title="Simple Learn"
          onBack={() => {
            if (slideIdx > 0) {
              setSlideIdx(slideIdx - 1);
            } else {
              navigateTo('G2_COURSE_DETAIL');
            }
          }}
          rightAction={
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEF7E0] border border-[#F8E3A3] text-[#9A6B16] text-[11.5px] font-extrabold tabular-nums">
              <Star size={11} className="text-[#D97706] fill-[#F59E0B]" />
              <span>+{course.points} pts</span>
            </span>
          }
        />

        <div className="px-5 pt-2 pb-4 flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            {/* Simple & Clean Segmented Progress Indicator */}
            <div className="space-y-2 px-0.5">
              <div className="grid grid-cols-3 gap-1.5">
                {course.slides.map((s, idx) => {
                  const isFilled = idx <= slideIdx;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        if (idx <= Math.max(slideIdx, completedStepsCount)) {
                          setSlideIdx(idx);
                        }
                      }}
                      className="h-1.5 rounded-full bg-[#ECE7F6] overflow-hidden"
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFilled ? 'w-full bg-[#8000EB]' : 'w-0'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[12px]">
                <span className="font-extrabold text-[#5E1DF0]">
                  Leçon {slideIdx + 1} sur {totalSlides} · {stepShortTitle}
                </span>
                <span className="font-semibold text-[#7D7693] tabular-nums">
                  {visualConfig.durationPerLesson}
                </span>
              </div>
            </div>

            {/* Editorial Lesson Card with Hero Visual & Soft Practical Example Block */}
            <section className="rounded-[24px] bg-white border border-[#EFEBF8] shadow-[0_8px_24px_-6px_rgba(41,7,100,0.06)] overflow-hidden">
              {/* Top Hero Visual */}
              <div className="relative w-full h-[156px] bg-[#F5F1FF] overflow-hidden">
                <img
                  src={currentHeroImage}
                  alt={lessonData.headline}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#14111F]/40 via-transparent to-[#14111F]/20" />

                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#5E1DF0] text-[11px] font-extrabold tracking-tight shadow-2xs border border-white/70">
                    Simple Learn · Leçon {slideIdx + 1}/{totalSlides}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#14111F] text-[11px] font-bold shadow-2xs border border-white/70 truncate max-w-[160px]">
                    {stepShortTitle}
                  </span>
                </div>
              </div>

              {/* Main Lesson Content & Practical Example Block */}
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-[18px] font-extrabold text-[#14111F] leading-snug tracking-tight">
                    {lessonData.headline}
                  </h3>
                  <p className="text-[13.5px] text-[#6E6785] leading-[1.6]">
                    {lessonData.explanation}
                  </p>
                </div>

                {/* Lighter, softer Practical Example Block ("En pratique dans Simple") */}
                <div className="rounded-[18px] bg-[#FAF8FE] border border-[#ECE6F8] p-3.5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb size={14} strokeWidth={2.2} />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5E1DF0] block">
                      {lessonData.tipLabel}
                    </span>
                    <p className="text-[12.5px] text-[#4A435E] leading-relaxed">
                      {lessonData.tipText}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Bottom Primary CTA */}
          <div>
            <button
              type="button"
              onClick={handleConfirmLessonStep}
              className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#7000CE] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_22px_-4px_rgba(128,0,235,0.3)] transition-all active:scale-[0.985]"
            >
              <span>{lessonCtaLabel}</span>
              <ArrowRight size={16} strokeWidth={2.3} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN G4 — SIMPLE LEARN FINAL QUIZ SCREEN
  // =========================================================================
  if (currentScreen === 'G4_QUIZ') {
    const currentQuestion = course.quiz[quizIdx] || course.quiz[0];
    const totalQuestions = course.quiz.length;
    const isCorrect = selectedOption === currentQuestion.correctIndex;

    return (
      <div className="min-h-full flex flex-col bg-simple-canvas pb-5">
        <MobileHeader
          title="Simple Learn"
          onBack={() => navigateTo('G2_COURSE_DETAIL')}
          rightAction={
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEF7E0] border border-[#F8E3A3] text-[#9A6B16] text-[11.5px] font-extrabold tabular-nums">
              <Star size={11} className="text-[#D97706] fill-[#F59E0B]" />
              <span>+{course.points} pts</span>
            </span>
          }
        />

        <div className="px-5 pt-2 pb-4 flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            {/* Segmented Quiz Progress */}
            <div className="space-y-2 px-0.5">
              <div className="grid grid-cols-3 gap-1.5">
                {course.quiz.map((q, idx) => {
                  const isFilled =
                    idx < quizIdx || (idx === quizIdx && isSubmitted);
                  const isCurrent = idx === quizIdx;
                  return (
                    <div
                      key={q.id}
                      className="h-1.5 rounded-full bg-[#ECE7F6] overflow-hidden"
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFilled
                            ? 'w-full bg-[#2E9A60]'
                            : isCurrent
                            ? 'w-1/2 bg-[#8000EB]'
                            : 'w-0'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[12px]">
                <span className="font-extrabold text-[#5E1DF0]">
                  Quiz final · Question {quizIdx + 1} sur {totalQuestions}
                </span>
                <span className="font-semibold text-[#7D7693] truncate max-w-[160px]">
                  {isImpulsifModule
                    ? 'Comprendre vos achats impulsifs'
                    : course.title}
                </span>
              </div>
            </div>

            {/* Editorial Quiz Card with Hero Visual Header */}
            <section className="rounded-[24px] bg-white border border-[#EFEBF8] shadow-[0_8px_24px_-6px_rgba(41,7,100,0.06)] overflow-hidden">
              <div className="relative w-full h-[112px] bg-[#F5F1FF] overflow-hidden">
                <img
                  src={lessonHeroImages[0]}
                  alt="Quiz Simple Learn"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#14111F]/40 via-transparent to-[#14111F]/25" />

                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#5E1DF0] text-[11px] font-extrabold tracking-tight shadow-2xs border border-white/70">
                    Simple Learn · Quiz final
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#14111F] text-[11px] font-bold tabular-nums shadow-2xs border border-white/70">
                    Question {quizIdx + 1}/{totalQuestions}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <h3 className="text-[17px] font-extrabold text-[#14111F] leading-snug tracking-tight">
                  {currentQuestion.question}
                </h3>

                <div className="space-y-2.5">
                  {currentQuestion.options.map((opt, idx) => {
                    const selected = selectedOption === idx;
                    const showRight =
                      isSubmitted && idx === currentQuestion.correctIndex;
                    const showWrong =
                      isSubmitted &&
                      selected &&
                      idx !== currentQuestion.correctIndex;

                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full px-3.5 py-3.5 rounded-[18px] border text-left text-[13px] transition-all flex items-center justify-between gap-3 ${
                          showRight
                            ? 'bg-[#EAF7EF] border-[#2E9A60] text-[#1E6F43] font-bold'
                            : showWrong
                            ? 'bg-[#FFF5EB] border-[#E59849] text-[#9A5316] font-semibold'
                            : selected
                            ? 'bg-[#FAF7FF] border-[#8000EB] text-[#14111F] font-bold shadow-[0_4px_12px_-6px_rgba(128,0,235,0.18)]'
                            : 'bg-[#FAF8FE] border-[#EFEBF8] text-[#14111F] font-medium hover:bg-[#F5F1FF]/60'
                        }`}
                      >
                        <span className="leading-snug">{opt}</span>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            showRight
                              ? 'border-[#2E9A60] bg-[#2E9A60] text-white'
                              : selected
                              ? 'border-[#8000EB] bg-[#8000EB] text-white'
                              : 'border-[#D5CEE8] bg-white'
                          }`}
                        >
                          {(selected || showRight) && (
                            <Check size={11} strokeWidth={3} />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {isSubmitted && (
                  <div
                    className={`rounded-[18px] p-3.5 text-[12.5px] leading-relaxed ${
                      isCorrect
                        ? 'bg-[#EAF7EF] text-[#1E6F43] border border-[#CBEAD7]'
                        : 'bg-[#FAF8FE] text-[#4A435E] border border-[#ECE6F8]'
                    }`}
                  >
                    <p className="font-extrabold text-[#14111F]">
                      {isCorrect ? 'Exactement !' : 'À retenir :'}
                    </p>
                    <p className="mt-0.5">{currentQuestion.explanation}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Primary Quiz CTA */}
          <div>
            {!isSubmitted ? (
              <button
                type="button"
                disabled={selectedOption === null}
                onClick={() => {
                  if (selectedOption === null) return;
                  setIsSubmitted(true);
                }}
                className={`w-full h-12 rounded-full text-[14.5px] font-bold flex items-center justify-center gap-2 transition-all ${
                  selectedOption !== null
                    ? 'bg-[#8000EB] hover:bg-[#7000CE] text-white shadow-[0_8px_22px_-4px_rgba(128,0,235,0.3)] active:scale-[0.985]'
                    : 'bg-[#E5DFF5] text-[#7D7693] cursor-not-allowed'
                }`}
              >
                <span>Valider ma réponse</span>
                <ArrowRight size={16} strokeWidth={2.3} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (quizIdx < totalQuestions - 1) {
                    setQuizIdx((q) => q + 1);
                    setSelectedOption(null);
                    setIsSubmitted(false);
                  } else {
                    completeCourseQuiz(course.id);
                    navigateTo('G5_COURSE_SUCCESS');
                  }
                }}
                className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#7000CE] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_22px_-4px_rgba(128,0,235,0.3)] transition-all active:scale-[0.985]"
              >
                <span>
                  {quizIdx < totalQuestions - 1
                    ? 'Question suivante'
                    : `Terminer et gagner +${course.points} pts`}
                </span>
                <ArrowRight size={16} strokeWidth={2.3} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN G5 — SIMPLE LEARN COMPLETION & REWARD SCREEN
  // =========================================================================
  return (
    <div className="min-h-full flex flex-col bg-simple-canvas pb-5">
      <MobileHeader
        title="Simple Learn"
        onBack={returnFromCourse}
        rightAction={
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEF7E0] border border-[#F8E3A3] text-[#9A6B16] text-[11.5px] font-extrabold tabular-nums">
            <Star size={11} className="text-[#D97706] fill-[#F59E0B]" />
            <span>{learningPoints} pts</span>
          </span>
        }
      />

      <div className="px-5 pt-2 pb-4 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-4 my-auto">
          <section className="rounded-[24px] bg-white border border-[#EFEBF8] shadow-[0_8px_24px_-6px_rgba(41,7,100,0.06)] overflow-hidden text-center">
            {/* Editorial Hero Image */}
            <div className="relative w-full h-[148px] bg-[#F5F1FF] overflow-hidden">
              <img
                src={lessonHeroImages[0]}
                alt="Cours terminé"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#14111F]/40 via-transparent to-[#14111F]/25" />

              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#5E1DF0] text-[11px] font-extrabold tracking-tight shadow-2xs border border-white/70">
                  Simple Learn · Terminé
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FEF7E0]/95 backdrop-blur-md border border-[#F8E3A3] text-[#9A6B16] text-[11px] font-extrabold tabular-nums shadow-2xs">
                  <Star size={11} className="text-[#D97706] fill-[#F59E0B]" />
                  <span>+{course.points} pts</span>
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Soft Cream/Gold Points Reward Pill */}
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FEF7E0] border border-[#F8E3A3] text-[#9A6B16] text-[13px] font-extrabold tabular-nums">
                  <Star size={13} className="text-[#D97706] fill-[#F59E0B]" />
                  <span>+{course.points} points gagnés !</span>
                </span>

                <h2 className="text-[20px] font-extrabold text-[#14111F] leading-snug tracking-tight pt-0.5">
                  Cours terminé avec succès !
                </h2>
                <p className="text-[13px] text-[#6E6785] leading-relaxed max-w-xs mx-auto">
                  {isImpulsifModule
                    ? 'Vous savez maintenant repérer les déclics d’achats impulsifs et poser un repère serein.'
                    : `Vous avez validé les 3 leçons et le quiz du parcours « ${course.title} ».`}
                </p>
              </div>

              {/* Clean, Light Points Balance Summary */}
              <div className="rounded-[18px] bg-[#FAF8FE] border border-[#ECE6F8] p-3.5 flex items-center justify-between gap-3 text-left">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5E1DF0] block">
                    Solde Simple Learn
                  </span>
                  <span className="text-[12.5px] text-[#6E6785] font-medium mt-0.5 block">
                    3/3 leçons · Quiz validé
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-[14px] bg-[#FEF7E0] border border-[#F8E3A3] text-right shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A6B16] block">
                    Total cumulé
                  </span>
                  <span className="text-[15px] font-extrabold text-[#92400E] tabular-nums">
                    {learningPoints} pts
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Contextual Primary & Secondary CTAs */}
        <div className="space-y-2.5">
          {isImpulsifModule ? (
            <>
              <button
                type="button"
                onClick={() =>
                  navigateTo('E1_CREATE_BUDGET', {
                    category:
                      courseReturnContext?.screen === 'D2_CATEGORY_DETAIL'
                        ? courseReturnContext.category
                        : 'Shopping',
                    budgetScope: 'PERSONNEL',
                    budgetOrigin: 'LEARN_EARN',
                  })
                }
                className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#7000CE] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_22px_-4px_rgba(128,0,235,0.3)] transition-all active:scale-[0.985]"
              >
                <span>Fixer mon budget Shopping</span>
                <ArrowRight size={16} strokeWidth={2.3} />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigateTo('C1_HUB', { hubTab: 'LEARN_EARN' })
                }
                className="w-full h-11 rounded-full bg-white border border-[#EFEBF8] text-[#5E1DF0] text-[13px] font-bold hover:bg-[#FAF8FF] transition-colors"
              >
                Explorer les autres cours
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => navigateTo('C1_HUB', { hubTab: 'LEARN_EARN' })}
              className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#7000CE] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_22px_-4px_rgba(128,0,235,0.3)] transition-all active:scale-[0.985]"
            >
              <span>Continuer sur Simple Learn</span>
              <ArrowRight size={16} strokeWidth={2.3} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// SCREEN F4 — 4-Week Shopping Savings Challenge ("Mon défi Shopping")
export const ShoppingSavingsChallengeScreen: React.FC = () => {
  const {
    budgets,
    shoppingSummary,
    shoppingChallengeActivatedAt,
    shoppingChallengeJustActivated,
    clearShoppingChallengeJustActivated,
    shoppingChallengePostActivationSpent,
    shoppingChallengeCompletedWeeks,
    shoppingChallengeOrigin,
    startChallenge,
    challenges,
    navigateTo,
  } = usePFM();

  const [isJustConfirmed, setIsJustConfirmed] = useState(false);

  useEffect(() => {
    if (shoppingChallengeJustActivated) {
      clearShoppingChallengeJustActivated();
    }
  }, [shoppingChallengeJustActivated, clearShoppingChallengeJustActivated]);

  const shoppingChallenge = challenges.find((c) => c.id === 'defi-shopping-1');
  const isChallengeActive =
    Boolean(shoppingChallengeActivatedAt) ||
    shoppingChallenge?.status === 'ACTIVE' ||
    shoppingChallenge?.status === 'COMPLETED';

  const shoppingBudget = budgets.Shopping;
  const budgetLimit = shoppingBudget?.limit || 1600;
  const currentSpent = shoppingSummary.amount || 1850;
  const savingsTarget =
    currentSpent > budgetLimit ? currentSpent - budgetLimit : 250;
  const weeklyCap = Math.round(budgetLimit / 4); // 400 DH / semaine

  // =========================================================================
  // ÉCRAN 2 — CONFIRMATION APRÈS CLIC SUR "COMMENCER LE DÉFI"
  // =========================================================================
  if (isJustConfirmed) {
    return (
      <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
        <MobileHeader
          title="Mon défi Shopping"
          onBack={() => {
            clearShoppingChallengeJustActivated();
            navigateTo('C1_HUB', { hubTab: 'MES_DEFIS' });
          }}
        />

        <div className="px-5 pt-4 pb-4 flex-1 flex flex-col justify-between gap-5">
          <div className="space-y-5 my-auto">
            {/* 1. Icône de succès + Titre + Message court */}
            <div className="text-center space-y-2.5">
              <div className="w-16 h-16 rounded-full bg-[#EAF7EF] border border-[#BCE8CE] text-[#12895B] flex items-center justify-center mx-auto shadow-sm">
                <Check size={32} strokeWidth={2.8} />
              </div>

              <h2 className="text-[22px] font-extrabold text-[#14111F] tracking-tight pt-1">
                Défi activé !
              </h2>

              <p className="text-[13.5px] text-[#5C6F84] leading-relaxed max-w-xs mx-auto">
                Retrouvez votre défi Shopping dans Mes défis.
              </p>
            </div>

            {/* 2. Petit récapitulatif */}
            <section className="card-simple p-4 space-y-3">
              <h3 className="text-[11.5px] font-extrabold uppercase tracking-wider text-[#2F80ED] px-0.5">
                Récapitulatif du défi
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] p-3.5 space-y-1">
                  <span className="text-[11px] font-semibold text-[#7D7693] block">
                    Objectif
                  </span>
                  <p className="text-[20px] font-extrabold text-[#2F80ED] tabular-nums">
                    -250 DH
                  </p>
                  <span className="text-[10.5px] text-[#5C6F84] block font-medium">
                    Sur mes dépenses
                  </span>
                </div>

                <div className="rounded-[18px] bg-[#FAF8FE] border border-[#EFEBF8] p-3.5 space-y-1">
                  <span className="text-[11px] font-semibold text-[#7D7693] block">
                    Durée
                  </span>
                  <p className="text-[20px] font-extrabold text-[#14111F]">
                    4 semaines
                  </p>
                  <span className="text-[10.5px] text-[#5C6F84] block font-medium">
                    1 mois complet
                  </span>
                </div>
              </div>

              <div className="rounded-[16px] bg-[#F2F8FF] border border-[#BFE0FF] p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-[#2F80ED] flex items-center justify-center shrink-0 shadow-2xs">
                  <Target size={15} strokeWidth={2.3} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-extrabold text-[#14111F]">
                    Objectif de départ : sous {formatDH(weeklyCap)}
                  </p>
                  <p className="text-[11px] text-[#5C6F84]">
                    Semaine 1 lancée · Vos achats actualiseront votre suivi.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* 3. CTAs */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                clearShoppingChallengeJustActivated();
                navigateTo('C1_HUB', { hubTab: 'MES_DEFIS' });
              }}
              className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#7000CE] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_22px_-4px_rgba(128,0,235,0.3)] transition-all active:scale-[0.985]"
            >
              <span>Voir dans Mes défis</span>
              <ArrowRight size={16} strokeWidth={2.3} />
            </button>

            <button
              type="button"
              onClick={() => {
                clearShoppingChallengeJustActivated();
                navigateTo('C1_HUB', {
                  hubTab: 'MON_ESPACE',
                  monEspaceSubTab: 'BUDGETS',
                });
              }}
              className="w-full h-11 rounded-full bg-white border border-[#EFEBF8] text-[#14111F] text-[13.5px] font-bold hover:bg-[#FAF8FE] transition-colors"
            >
              Retour à mes budgets
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ÉCRAN 1 — PRÉSENTATION / ACTIVATION DU DÉFI (AVANT DÉMARRAGE)
  // =========================================================================
  if (!isChallengeActive) {
    const handleStartChallenge = () => {
      startChallenge('defi-shopping-1', true);
      setIsJustConfirmed(true);
    };

    return (
      <div className="min-h-full flex flex-col bg-simple-canvas pb-6">
        {/* HEADER */}
        <MobileHeader
          title="Mon défi Shopping"
          onBack={() => {
            if (shoppingChallengeOrigin === 'MES_DEFIS') {
              navigateTo('C1_HUB', { hubTab: 'MES_DEFIS' });
            } else if (shoppingChallengeOrigin === 'D2_SHOPPING_INSIGHT') {
              navigateTo('D2_SHOPPING_INSIGHT');
            } else {
              navigateTo('C1_HUB', {
                hubTab: 'MON_ESPACE',
                monEspaceSubTab: 'BUDGETS',
              });
            }
          }}
          rightAction={
            <span className="px-3 py-1 rounded-full bg-[#DFF0FF] border border-[#BFE0FF] text-[#2F80ED] text-[12px] font-extrabold tabular-nums">
              4 semaines
            </span>
          }
        />

        <div className="px-5 pt-2.5 pb-4 flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-3.5">
            {/* 1. MAIN OBJECTIVE CARD */}
            <section className="rounded-[24px] p-4 bg-[#F2F8FF] border border-[#BFE0FF] shadow-[0_8px_24px_-6px_rgba(79,169,255,0.12)] space-y-2">
              <div className="inline-flex items-center gap-1.5">
                <Target
                  size={14}
                  strokeWidth={2.3}
                  className="text-[#4FA9FF] shrink-0"
                />
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#2F80ED]">
                  Défi personnel · 4 semaines
                </span>
              </div>

              <h2 className="text-[16.5px] font-extrabold text-[#14111F] leading-snug tracking-tight">
                Réduire mes dépenses Shopping
              </h2>

              <div className="pt-0.5 flex items-baseline gap-2.5">
                <span className="text-[28px] font-extrabold text-[#2F80ED] tabular-nums leading-none tracking-tight">
                  –{formatDH(savingsTarget)}
                </span>
                <span className="text-[12.5px] font-semibold text-[#5C6F84]">
                  Objectif global du défi
                </span>
              </div>
            </section>

            {/* 2. PROGRESSION CARD (NON-DÉMARRÉ / SEMAINE 1 NON ACTIVE) */}
            <section className="card-simple p-4 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[15px] font-extrabold text-[#14111F]">
                  Votre progression
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F2F8FF] border border-[#BFE0FF] text-[11.5px] font-bold text-[#2F80ED] tabular-nums">
                  0/4 semaines validées
                </span>
              </div>

              {/* Horizontal 4-week stepper */}
              <div className="relative pt-1 pb-0.5">
                {/* Connecting track behind the 4 circles */}
                <div className="absolute left-[12%] right-[12%] top-[21px] h-[3px] bg-[#E6F2FF] rounded-full z-0 overflow-hidden">
                  <div
                    className="h-full bg-[#4FA9FF] transition-all duration-500 ease-out"
                    style={{ width: '0%' }}
                  />
                </div>

                <div className="relative z-10 grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((weekNum) => {
                    const isFinalStep = weekNum === 4;
                    const statusLabel = isFinalStep ? 'Objectif final' : 'À venir';

                    return (
                      <div
                        key={weekNum}
                        className="flex flex-col items-center text-center"
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-[12.5px] font-extrabold transition-all duration-300 ${
                            isFinalStep
                              ? 'bg-[#F2F8FF] text-[#2F80ED] border border-[#BFE0FF]'
                              : 'bg-[#F2F8FF] text-[#5C6F84] border border-[#BFE0FF]'
                          }`}
                        >
                          {isFinalStep ? (
                            <Flag size={14} strokeWidth={2.4} />
                          ) : (
                            `S${weekNum}`
                          )}
                        </div>

                        <span className="text-[12px] mt-1.5 leading-tight font-bold text-[#6E6785]">
                          S{weekNum}
                        </span>

                        <span className="text-[10.5px] mt-0.5 leading-tight font-medium text-[#7D7693]">
                          {statusLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 3. WEEKLY OBJECTIVE CARD (NON DÉMARRÉ) */}
            <section className="card-simple p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[15px] font-extrabold text-[#14111F]">
                  Cette semaine
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#F2F8FF] border border-[#BFE0FF] text-[#2F80ED] text-[11.5px] font-extrabold tabular-nums">
                  Rester sous {formatDH(weeklyCap)}
                </span>
              </div>

              {/* Highlighted weekly target */}
              <div className="rounded-[18px] bg-[#F2F8FF] border border-[#BFE0FF] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-[13px] tabular-nums">
                  <span className="font-semibold text-[#5C6F84]">
                    Dépensé :{' '}
                    <strong className="text-[#14111F] font-extrabold">
                      0 DH
                    </strong>
                  </span>
                  <span className="font-semibold text-[#5C6F84]">
                    Reste :{' '}
                    <strong className="text-[#2F80ED] font-extrabold">
                      {formatDH(weeklyCap)}
                    </strong>
                  </span>
                </div>

                {/* Progress bar: 0 / 400 DH */}
                <div className="space-y-1.5">
                  <div className="w-full h-2.5 bg-white border border-[#BFE0FF]/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4FA9FF] rounded-full transition-all duration-300"
                      style={{ width: '0%' }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11.5px] font-bold text-[#2F80ED] tabular-nums">
                    <span>
                      0 DH / {formatDH(weeklyCap)}
                    </span>
                    <span>0%</span>
                  </div>
                </div>
              </div>

              {/* One short helper text */}
              <p className="text-[12px] text-[#6E6785] leading-snug">
                Chaque dépense Shopping met à jour votre progression.
              </p>
            </section>
          </div>

          {/* 4. ACTIONS DU BAS : CTA PRINCIPAL & CTA SECONDAIRE */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleStartChallenge}
              className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#7000CE] text-white text-[14.5px] font-bold flex items-center justify-center gap-2 shadow-[0_8px_22px_-4px_rgba(128,0,235,0.3)] transition-all active:scale-[0.985]"
            >
              <span>Commencer le défi</span>
              <ArrowRight size={16} strokeWidth={2.3} />
            </button>

            <button
              type="button"
              onClick={() => {
                if (shoppingChallengeOrigin === 'MES_DEFIS') {
                  navigateTo('C1_HUB', { hubTab: 'MES_DEFIS' });
                } else {
                  navigateTo('D2_SHOPPING_INSIGHT');
                }
              }}
              className="w-full py-2.5 text-center text-[13px] font-semibold text-[#6E6785] hover:text-[#14111F] transition-colors"
            >
              Retour à l’analyse Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ÉCRAN 3 — VRAI ÉCRAN DE SUIVI ACTIF DU DÉFI (APRÈS ACTIVATION)
  // =========================================================================
  const weeksSinceActivation = shoppingChallengeActivatedAt
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(shoppingChallengeActivatedAt).getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        )
      )
    : 0;

  const completedWeeks = Math.min(
    4,
    Math.max(shoppingChallengeCompletedWeeks, weeksSinceActivation)
  ); // 0..4
  const isAllCompleted = completedWeeks >= 4;
  const activeWeekNumber = isAllCompleted ? 4 : completedWeeks + 1;

  // Genuine Shopping spending since activation in the current active week
  const weeklySpent = Math.max(0, shoppingChallengePostActivationSpent);
  const weeklyRemaining = Math.max(0, weeklyCap - weeklySpent);
  const weeklyPct = Math.min(
    100,
    weeklyCap > 0 ? Math.round((weeklySpent / weeklyCap) * 100) : 0
  );

  return (
    <div className="min-h-full flex flex-col bg-simple-canvas pb-5">
      {/* HEADER */}
      <MobileHeader
        title="Mon défi Shopping"
        onBack={() => {
          if (shoppingChallengeOrigin === 'MES_DEFIS') {
            navigateTo('C1_HUB', {
              hubTab: 'MES_DEFIS',
            });
          } else if (shoppingChallengeOrigin === 'D2_SHOPPING_INSIGHT') {
            navigateTo('D2_SHOPPING_INSIGHT');
          } else {
            navigateTo('C1_HUB', {
              hubTab: 'MON_ESPACE',
              monEspaceSubTab: 'BUDGETS',
            });
          }
        }}
        rightAction={
          <span className="px-3 py-1 rounded-full bg-[#DFF0FF] border border-[#BFE0FF] text-[#2F80ED] text-[12px] font-extrabold tabular-nums">
            Semaine {activeWeekNumber}/4
          </span>
        }
      />

      <div className="px-5 pt-2.5 pb-4 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3.5">
          {/* 1. MAIN OBJECTIVE CARD */}
          <section className="rounded-[24px] p-4 bg-[#F2F8FF] border border-[#BFE0FF] shadow-[0_8px_24px_-6px_rgba(79,169,255,0.12)] space-y-2">
            <div className="inline-flex items-center gap-1.5">
              <Target
                size={14}
                strokeWidth={2.3}
                className="text-[#4FA9FF] shrink-0"
              />
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#2F80ED]">
                Défi personnel · 4 semaines
              </span>
            </div>

            <h2 className="text-[16.5px] font-extrabold text-[#14111F] leading-snug tracking-tight">
              Réduire mes dépenses Shopping
            </h2>

            <div className="pt-0.5 flex items-baseline gap-2.5">
              <span className="text-[28px] font-extrabold text-[#2F80ED] tabular-nums leading-none tracking-tight">
                –{formatDH(savingsTarget)}
              </span>
              <span className="text-[12.5px] font-semibold text-[#5C6F84]">
                Objectif global du défi
              </span>
            </div>
          </section>

          {/* 2. PROGRESSION CARD */}
          <section className="card-simple p-4 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[15px] font-extrabold text-[#14111F]">
                Votre progression
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F2F8FF] border border-[#BFE0FF] text-[11.5px] font-bold text-[#2F80ED] tabular-nums">
                {completedWeeks}/4 semaines validées
              </span>
            </div>

            {/* Horizontal 4-week stepper */}
            <div className="relative pt-1 pb-0.5">
              {/* Connecting track behind the 4 circles */}
              <div className="absolute left-[12%] right-[12%] top-[21px] h-[3px] bg-[#E6F2FF] rounded-full z-0 overflow-hidden">
                <div
                  className="h-full bg-[#4FA9FF] transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.min(100, Math.round((completedWeeks / 3) * 100))}%`,
                  }}
                />
              </div>

              <div className="relative z-10 grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((weekNum) => {
                  const isDone = weekNum <= completedWeeks;
                  const isActive =
                    !isAllCompleted && weekNum === activeWeekNumber;
                  const isFinalStep = weekNum === 4;

                  const statusLabel = isDone
                    ? 'Validée'
                    : isActive
                    ? 'En cours'
                    : isFinalStep
                    ? 'Objectif final'
                    : 'À venir';

                  return (
                    <div
                      key={weekNum}
                      className="flex flex-col items-center text-center"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-[12.5px] font-extrabold transition-all duration-300 ${
                          isDone
                            ? 'bg-[#4FA9FF] text-white shadow-[0_4px_10px_rgba(79,169,255,0.28)]'
                            : isActive
                            ? 'bg-[#2F80ED] text-white ring-4 ring-[#BFE0FF]/70 shadow-[0_6px_14px_rgba(47,128,237,0.24)]'
                            : isFinalStep
                            ? 'bg-[#F2F8FF] text-[#2F80ED] border border-[#BFE0FF]'
                            : 'bg-[#F2F8FF] text-[#5C6F84] border border-[#BFE0FF]'
                        }`}
                      >
                        {isDone ? (
                          <Check size={16} strokeWidth={3} />
                        ) : isFinalStep ? (
                          <Flag size={14} strokeWidth={2.4} />
                        ) : (
                          `S${weekNum}`
                        )}
                      </div>

                      <span
                        className={`text-[12px] mt-1.5 leading-tight ${
                          isActive || isDone
                            ? 'font-extrabold text-[#14111F]'
                            : 'font-bold text-[#6E6785]'
                        }`}
                      >
                        S{weekNum}
                      </span>

                      <span
                        className={`text-[10.5px] mt-0.5 leading-tight ${
                          isDone || isActive
                            ? 'font-extrabold text-[#2F80ED]'
                            : 'font-medium text-[#7D7693]'
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 3. WEEKLY OBJECTIVE CARD */}
          <section className="card-simple p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[15px] font-extrabold text-[#14111F]">
                Cette semaine
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#F2F8FF] border border-[#BFE0FF] text-[#2F80ED] text-[11.5px] font-extrabold tabular-nums">
                Rester sous {formatDH(weeklyCap)}
              </span>
            </div>

            {/* Highlighted weekly target */}
            <div className="rounded-[18px] bg-[#F2F8FF] border border-[#BFE0FF] p-3.5 space-y-2.5">
              <div className="flex items-center justify-between gap-2 text-[13px] tabular-nums">
                <span className="font-semibold text-[#5C6F84]">
                  Dépensé :{' '}
                  <strong className="text-[#14111F] font-extrabold">
                    {formatDH(weeklySpent)}
                  </strong>
                </span>
                <span className="font-semibold text-[#5C6F84]">
                  Reste :{' '}
                  <strong className="text-[#2F80ED] font-extrabold">
                    {formatDH(weeklyRemaining)}
                  </strong>
                </span>
              </div>

              {/* Progress bar: 0 / 400 DH */}
              <div className="space-y-1.5">
                <div className="w-full h-2.5 bg-white border border-[#BFE0FF]/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4FA9FF] rounded-full transition-all duration-300"
                    style={{ width: `${weeklyPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11.5px] font-bold text-[#2F80ED] tabular-nums">
                  <span>
                    {weeklySpent} / {formatDH(weeklyCap)}
                  </span>
                  <span>{weeklyPct}%</span>
                </div>
              </div>
            </div>

            {/* One short helper text */}
            <p className="text-[12px] text-[#6E6785] leading-snug">
              Chaque dépense Shopping met à jour votre progression.
            </p>
          </section>
        </div>

        {/* BOTTOM CTA */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              if (shoppingChallengeOrigin === 'MES_DEFIS') {
                navigateTo('C1_HUB', { hubTab: 'MES_DEFIS' });
              } else {
                navigateTo('D2_SHOPPING_INSIGHT');
              }
            }}
            className="w-full h-12 rounded-full bg-[#8000EB] hover:bg-[#7000CE] text-white text-[14px] font-extrabold flex items-center justify-center gap-2 shadow-[0_8px_22px_-4px_rgba(128,0,235,0.3)] transition-all active:scale-[0.985]"
          >
            <span>
              {shoppingChallengeOrigin === 'MES_DEFIS'
                ? 'Retour à Mes défis →'
                : "Retour à l'analyse Shopping →"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

