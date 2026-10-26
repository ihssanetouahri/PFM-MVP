import React from 'react';
import {
  ShoppingBag,
  Wine,
  ShoppingCart,
  TrainFront,
  MoreHorizontal,
  PiggyBank,
  ArrowDown,
  ChevronLeft,
  Home,
  CreditCard,
  Menu,
  CheckCircle2,
  Award,
  X,
  SlidersHorizontal,
  Bell,
  Wifi,
  Target,
  Calendar,
} from 'lucide-react';
import { SpendingCategory, SavingsGoal } from '../types/pfm';
import { CATEGORY_META, formatDH, TRAVEL_PHOTO_URL } from '../data/initialData';
import { CategorySummary, usePFM } from '../context/PFMContext';

// Signature 3 ascending rounded bars icon from Simple reference screenshots
export const SimpleBarsIcon: React.FC<{
  size?: number;
  color?: string;
}> = ({ size = 20, color = '#5E1DF0' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="4" y="13" width="4" height="7" rx="2" fill={color} />
    <rect x="10" y="9" width="4" height="11" rx="2" fill={color} />
    <rect x="16" y="4" width="4" height="16" rx="2" fill={color} />
  </svg>
);

// Signature cute Robot + Sparkle icon from Simple reference screenshots
export const SimpleRobotIcon: React.FC<{
  size?: number;
  color?: string;
}> = ({ size = 24, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Top antenna */}
    <path
      d="M13.5 4.5V7.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="13.5" cy="3.8" r="1.3" fill={color} />
    {/* Head */}
    <rect
      x="5.5"
      y="8"
      width="16"
      height="13"
      rx="6.5"
      stroke={color}
      strokeWidth="2"
    />
    {/* Eyes */}
    <circle cx="10.8" cy="14" r="1.4" fill={color} />
    <circle cx="16.2" cy="14" r="1.4" fill={color} />
    {/* Gentle smile */}
    <path
      d="M11.2 17.2C12 18 15 18 15.8 17.2"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Plus sparkle on top right */}
    <path
      d="M22.5 4.5V8.5M20.5 6.5H24.5"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export const CategoryIcon: React.FC<{
  category: SpendingCategory | 'Épargne' | 'Revenus' | 'Loisirs';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'skyBlue';
}> = ({ category, size = 'md', variant = 'default' }) => {
  const dimensions =
    size === 'sm'
      ? 'w-8 h-8 rounded-full'
      : size === 'lg'
      ? 'w-14 h-14 rounded-full'
      : 'w-10 h-10 rounded-full';
  const iconSize = size === 'sm' ? 15 : size === 'lg' ? 25 : 18;

  if (variant === 'skyBlue') {
    const renderBlueIcon = () => {
      switch (category) {
        case 'Shopping':
          return <ShoppingBag size={iconSize} strokeWidth={2.1} />;
        case 'Sorties':
        case 'Loisirs':
          return <Wine size={iconSize} strokeWidth={2.1} />;
        case 'Courses':
          return <ShoppingCart size={iconSize} strokeWidth={2.1} />;
        case 'Transport':
          return <TrainFront size={iconSize} strokeWidth={2.1} />;
        case 'Factures':
          return <Wifi size={iconSize} strokeWidth={2.1} />;
        case 'Épargne':
          return <PiggyBank size={iconSize} strokeWidth={2.1} />;
        case 'Revenus':
          return <ArrowDown size={iconSize} strokeWidth={2.2} />;
        default:
          return <MoreHorizontal size={iconSize} strokeWidth={2.2} />;
      }
    };

    return (
      <div
        className={`${dimensions} bg-[#DFF0FF] text-[#4FA9FF] flex items-center justify-center shrink-0`}
      >
        {renderBlueIcon()}
      </div>
    );
  }

  const defaultDimensions =
    size === 'sm'
      ? 'w-8 h-8 rounded-full'
      : size === 'lg'
      ? 'w-12 h-12 rounded-full'
      : 'w-10 h-10 rounded-full';
  const defaultIconSize = size === 'sm' ? 15 : size === 'lg' ? 21 : 18;

  if (category === 'Épargne') {
    return (
      <div
        className={`${defaultDimensions} bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center shrink-0`}
      >
        <PiggyBank size={defaultIconSize} strokeWidth={2} />
      </div>
    );
  }

  if (category === 'Revenus') {
    return (
      <div
        className={`${defaultDimensions} bg-[#E7F7F0] text-[#12895B] flex items-center justify-center shrink-0`}
      >
        <ArrowDown size={defaultIconSize} strokeWidth={2.2} />
      </div>
    );
  }

  const meta =
    category === 'Loisirs'
      ? CATEGORY_META.Sorties
      : CATEGORY_META[category] || CATEGORY_META.Autres;

  const renderIcon = () => {
    switch (category) {
      case 'Shopping':
        return <ShoppingBag size={defaultIconSize} strokeWidth={2} />;
      case 'Sorties':
      case 'Loisirs':
        return <Wine size={defaultIconSize} strokeWidth={2} />;
      case 'Courses':
        return <ShoppingCart size={defaultIconSize} strokeWidth={2} />;
      case 'Transport':
        return <TrainFront size={defaultIconSize} strokeWidth={2} />;
      case 'Factures':
        return <Wifi size={defaultIconSize} strokeWidth={2} />;
      default:
        return <MoreHorizontal size={defaultIconSize} strokeWidth={2.2} />;
    }
  };

  return (
    <div
      className={`${defaultDimensions} flex items-center justify-center shrink-0`}
      style={{ backgroundColor: meta.bgTint, color: meta.textTint }}
    >
      {renderIcon()}
    </div>
  );
};

export const InteractiveDonutChart: React.FC<{
  data: CategorySummary[];
  totalAmount: number;
  selectedCategory?: SpendingCategory | null;
  onSelectCategory?: (category: SpendingCategory) => void;
  size?: number;
}> = ({
  data,
  totalAmount,
  selectedCategory,
  onSelectCategory,
  size = 156,
}) => {
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const polarToCartesian = (
    cx: number,
    cy: number,
    r: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number
  ) => {
    const clampedSpan = Math.min(Math.max(endAngle - startAngle, 0.8), 359.99);
    const actualEnd = startAngle + clampedSpan;
    const start = polarToCartesian(cx, cy, r, startAngle);
    const end = polarToCartesian(cx, cy, r, actualEnd);
    const largeArcFlag = clampedSpan > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const positiveItems = data.filter((d) => d.amount > 0);
  const computedTotal =
    totalAmount > 0
      ? totalAmount
      : positiveItems.reduce((sum, item) => sum + item.amount, 0);

  let currentAngle = 0;
  const gapDegrees = positiveItems.length > 1 ? 2.8 : 0;

  const segments = positiveItems.map((item) => {
    const fraction = computedTotal > 0 ? item.amount / computedTotal : 0;
    const rawSpan = fraction * 360;
    const startAngle = currentAngle + gapDegrees / 2;
    const endAngle = Math.max(
      startAngle + 1.2,
      currentAngle + rawSpan - gapDegrees / 2
    );
    currentAngle += rawSpan;

    return {
      item,
      category: item.category,
      arcPath: describeArc(center, center, radius, startAngle, endAngle),
    };
  });

  const activeItem = selectedCategory
    ? data.find((d) => d.category === selectedCategory) || null
    : null;

  return (
    <div
      className="relative flex items-center justify-center shrink-0 select-none"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="overflow-visible">
        {/* Background track ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#F2EFF9"
          strokeWidth={strokeWidth}
          pointerEvents="none"
        />

        {segments.map(({ item, category, arcPath }) => {
          const meta =
            (category as string) === 'Loisirs'
              ? CATEGORY_META.Sorties
              : CATEGORY_META[category] || CATEGORY_META.Autres;
          const hasSelection = Boolean(selectedCategory);
          const isSelected = selectedCategory === category;
          const isAutresSelected = isSelected && category === 'Autres';
          const segmentColor =
            !hasSelection || isSelected ? meta.color : '#ECEAF4';

          const handleSegmentSelect = (e: React.MouseEvent | React.TouchEvent) => {
            e.stopPropagation();
            if (onSelectCategory) {
              onSelectCategory(category);
            }
          };

          return (
            <g key={category}>
              {/* Subtle outline when the naturally gray "Autres" segment is selected */}
              {isAutresSelected && (
                <path
                  d={arcPath}
                  fill="none"
                  stroke="#646A80"
                  strokeWidth={strokeWidth + 5}
                  strokeLinecap="butt"
                  pointerEvents="none"
                  className="transition-all duration-200 ease-out"
                />
              )}

              {/* Visible category segment arc */}
              <path
                d={arcPath}
                fill="none"
                stroke={segmentColor}
                strokeOpacity={!hasSelection || isSelected ? 1 : 0.65}
                strokeWidth={
                  isAutresSelected
                    ? strokeWidth + 1
                    : isSelected
                    ? strokeWidth + 3
                    : strokeWidth
                }
                strokeLinecap="butt"
                pointerEvents="stroke"
                onClick={handleSegmentSelect}
                className="cursor-pointer transition-all duration-200 ease-out"
              >
                <title>{`${category} — ${formatDH(item.amount)} (${item.sharePct} %)`}</title>
              </path>

              {/* Slightly wider transparent stroke along the exact arc for effortless mobile touch */}
              <path
                d={arcPath}
                fill="none"
                stroke="transparent"
                strokeWidth={strokeWidth + 8}
                strokeLinecap="butt"
                pointerEvents="stroke"
                onClick={handleSegmentSelect}
                className="cursor-pointer"
              />
            </g>
          );
        })}
      </svg>

      {/* Center inner white circle with soft shadow */}
      <div
        className="absolute rounded-full bg-white shadow-[inset_0_2px_8px_rgba(20,17,31,0.04)] flex flex-col items-center justify-center text-center pointer-events-none px-1.5 transition-all duration-200"
        style={{
          width: size - strokeWidth * 2 - 4,
          height: size - strokeWidth * 2 - 4,
        }}
      >
        <span className="text-[14px] font-extrabold text-[#14111F] tabular-nums tracking-tight leading-tight whitespace-nowrap">
          {formatDH(activeItem ? activeItem.amount : computedTotal)}
        </span>
        <span className="text-[11.5px] font-medium text-[#7D7693] mt-0.5 truncate max-w-full">
          {activeItem ? activeItem.category : 'Total'}
        </span>
      </div>
    </div>
  );
};

export const MobileHeader: React.FC<{
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showPersonalize?: boolean;
  onPersonalize?: () => void;
  showBell?: boolean;
  centered?: boolean;
}> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  showPersonalize,
  onPersonalize,
  showBell,
  centered = false,
}) => {
  const { goBack, showToast } = usePFM();

  return (
    <header className="sticky top-0 z-30 bg-[#F6F3FE]/85 backdrop-blur-md px-4 sm:px-5 pt-3 pb-2.5 flex items-center justify-between gap-2.5">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <button
          type="button"
          onClick={onBack || goBack}
          aria-label="Retour"
          className="w-10 h-10 rounded-full bg-white shadow-[0_4px_14px_rgba(20,17,31,0.06)] border border-white flex items-center justify-center text-[#14111F] hover:bg-[#FAF8FF] active:scale-95 transition-all shrink-0"
        >
          <ChevronLeft size={20} strokeWidth={2.2} />
        </button>

        <div className={`min-w-0 ${centered ? 'flex-1 text-center pr-10' : ''}`}>
          <h1 className="text-[17px] sm:text-[18px] font-bold text-[#14111F] whitespace-nowrap leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[11px] sm:text-[12px] text-[#7D7693] truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {showBell && (
          <button
            type="button"
            onClick={() =>
              showToast(
                'Alertes intelligentes activées',
                'Vous êtes notifiée dès qu’une catégorie évolue de façon inhabituelle.'
              )
            }
            aria-label="Notifications"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-[0_4px_14px_rgba(20,17,31,0.06)] flex items-center justify-center text-[#14111F] relative hover:bg-[#FAF8FF] transition-colors shrink-0"
          >
            <Bell size={17} strokeWidth={2} />
            <span className="w-2 h-2 rounded-full bg-[#5E1DF0] absolute top-2 right-2 sm:top-2.5 sm:right-2.5" />
          </button>
        )}
        {showPersonalize && onPersonalize && (
          <button
            type="button"
            onClick={onPersonalize}
            aria-label="Personnaliser mon espace"
            title="Personnaliser mon espace"
            className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-full bg-white shadow-[0_4px_14px_rgba(20,17,31,0.06)] text-[#5E1DF0] text-[11px] sm:text-xs font-bold flex items-center gap-1.5 hover:bg-[#F2EDFF] transition-colors whitespace-nowrap shrink-0"
          >
            <SlidersHorizontal size={14} strokeWidth={2.2} />
            <span className="hidden min-[380px]:inline">Personnaliser</span>
          </button>
        )}
        {rightAction}
      </div>
    </header>
  );
};

export const BottomBankingNav: React.FC = () => {
  const { currentScreen, navigateTo, showToast } = usePFM();

  const isHome = currentScreen === 'A1_HOME';
  const isCards = currentScreen === 'CARDS_VIEW';
  const isMenu = currentScreen === 'MENU_VIEW';

  return (
    <div className="sticky bottom-0 left-0 right-0 z-30 pt-2">
      <nav className="relative bg-white/95 backdrop-blur-md rounded-t-[30px] shadow-[0_-8px_30px_rgba(20,17,31,0.06)] border-t border-[#F0ECF9] h-[74px] pl-6 pr-24 grid grid-cols-3 items-center">
        <button
          type="button"
          onClick={() => {
            if (typeof document !== 'undefined') {
              const mainEl = document.querySelector('main');
              if (mainEl) mainEl.scrollTop = 0;
            }
            navigateTo('A1_HOME');
          }}
          aria-label="Accueil banque Simple"
          className={`flex flex-col items-center justify-center min-h-[48px] transition-colors ${
            isHome ? 'text-[#5E1DF0]' : 'text-[#8E87A6] hover:text-[#14111F]'
          }`}
        >
          <Home
            size={22}
            strokeWidth={isHome ? 2.4 : 1.9}
            fill={isHome ? '#5E1DF0' : 'none'}
          />
          <span className="text-[11px] font-semibold mt-1 whitespace-nowrap">
            Accueil
          </span>
          {isHome && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#5E1DF0] mt-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            navigateTo('CARDS_VIEW');
            showToast(
              'Carte Simple Visa Platinum •• 4821',
              'Plafonds et paiements actifs'
            );
          }}
          className={`flex flex-col items-center justify-center min-h-[48px] transition-colors ${
            isCards ? 'text-[#5E1DF0]' : 'text-[#8E87A6] hover:text-[#14111F]'
          }`}
        >
          <CreditCard size={22} strokeWidth={isCards ? 2.4 : 1.9} />
          <span className="text-[11px] font-semibold mt-1 whitespace-nowrap">
            Cartes
          </span>
          {isCards && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#5E1DF0] mt-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => navigateTo('MENU_VIEW')}
          className={`flex flex-col items-center justify-center min-h-[48px] transition-colors ${
            isMenu ? 'text-[#5E1DF0]' : 'text-[#8E87A6] hover:text-[#14111F]'
          }`}
        >
          <Menu size={22} strokeWidth={isMenu ? 2.4 : 1.9} />
          <span className="text-[11px] font-semibold mt-1 whitespace-nowrap">
            Menu
          </span>
          {isMenu && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#5E1DF0] mt-0.5" />
          )}
        </button>

        {/* Circular Floating Financial Assistant Button on Bottom Right matching Reference Screen 1 & 4 */}
        <button
          type="button"
          onClick={() => navigateTo('D4_COACH')}
          aria-label="Ouvrir le Coach financier"
          title="Coach financier Simple"
          className="absolute -top-3 right-5 w-14 h-14 rounded-full bg-gradient-to-br from-[#834BFF] via-[#6222F5] to-[#4A12D4] text-white shadow-[0_10px_24px_rgba(94,29,240,0.42)] border-2 border-white flex items-center justify-center hover:brightness-105 active:scale-95 transition-all"
        >
          <SimpleRobotIcon size={27} color="#FFFFFF" />
        </button>
      </nav>
    </div>
  );
};

export const GlobalOverlays: React.FC = () => {
  const { toast, milestoneModal, setMilestoneModal } = usePFM();

  return (
    <>
      {/* Subtle Toast Banner */}
      {toast && (
        <div className="fixed sm:absolute top-16 left-5 right-5 z-50 bg-[#14111F]/95 backdrop-blur-md text-white rounded-[22px] p-4 shadow-xl border border-white/10 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#5E1DF0]/30 text-[#D8B4FE] flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold leading-snug">{toast.message}</p>
            {toast.subtext && (
              <p className="text-[11px] text-[#D1CBE0] mt-0.5 leading-snug">
                {toast.subtext}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Milestone Celebration Modal (Screen F4) */}
      {milestoneModal && (
        <div className="fixed sm:absolute inset-0 z-50 bg-[#14111F]/50 backdrop-blur-xs flex items-center justify-center p-5">
          <div className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl border border-[#ECE7F6] text-center relative">
            <button
              type="button"
              onClick={() => setMilestoneModal(null)}
              aria-label="Fermer"
              className="w-9 h-9 rounded-full bg-[#F5F2FA] text-[#7D7693] flex items-center justify-center absolute top-4 right-4 hover:text-[#14111F]"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 rounded-full bg-[#F2EDFF] text-[#5E1DF0] flex items-center justify-center mx-auto mb-4">
              <Award size={32} strokeWidth={2.2} />
            </div>

            <p className="text-xs font-bold text-[#5E1DF0]">
              Étape franchie avec succès
            </p>
            <h3 className="text-[19px] font-extrabold text-[#14111F] mt-1 leading-snug">
              {milestoneModal.title}
            </h3>
            <p className="text-[13px] text-[#7D7693] mt-2 leading-relaxed">
              {milestoneModal.message}
            </p>

            <div className="mt-5 p-4 rounded-[22px] bg-[#F6F3FF] flex items-center justify-around text-left">
              {milestoneModal.pointsEarned && (
                <div>
                  <span className="text-[11px] text-[#7D7693] block">
                    Points de progression
                  </span>
                  <span className="text-sm font-extrabold text-[#5E1DF0] tabular-nums">
                    +{milestoneModal.pointsEarned} pts symboliques
                  </span>
                </div>
              )}
              {milestoneModal.badgeName && (
                <div>
                  <span className="text-[11px] text-[#7D7693] block">
                    Badge débloqué
                  </span>
                  <span className="text-sm font-bold text-[#290764]">
                    {milestoneModal.badgeName}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMilestoneModal(null)}
              className="mt-5 w-full h-[50px] btn-simple-primary text-sm font-semibold"
            >
              Continuer ma progression
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export interface DreamzCircularProjectProps {
  imageUrl: string;
  title: string;
  progressPct: number;
  size?: 'widget' | 'detail' | 'hero';
}

export const DreamzCircularProject: React.FC<DreamzCircularProjectProps> = ({
  imageUrl,
  title,
  progressPct,
  size = 'widget',
}) => {
  const clampedPct = Math.max(0, Math.min(100, Math.round(progressPct)));
  const isDetail = size === 'detail';
  const isHero = size === 'hero';

  const svgSize = isHero ? 220 : isDetail ? 188 : 136;
  const strokeWidth = isHero ? 10 : isDetail ? 9.5 : 8;
  const center = svgSize / 2;
  const radius = center - strokeWidth / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (clampedPct / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center select-none shrink-0"
      style={{ width: svgSize, height: svgSize }}
    >
      {/* Circular Progress Ring SVG */}
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="-rotate-90 transform"
      >
        {/* Soft Lavender Track Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#EFEAFF"
          strokeWidth={strokeWidth}
        />
        {/* Active Progress Ring in Simple Purple #8000EB */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#8000EB"
          strokeOpacity={clampedPct > 0 ? 1 : 0}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Project Photo Inside the Circle */}
      <div
        className={`absolute rounded-full overflow-hidden bg-[#F2EDFF] border-[3px] border-white shadow-[0_6px_18px_rgba(41,7,100,0.14)] ${
          isHero
            ? 'inset-[16px]'
            : isDetail
            ? 'inset-[15px]'
            : 'inset-[12px]'
        }`}
      >
        <img
          src={imageUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Progress Percentage Pill Badge on Circle Edge */}
      <div
        className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 rounded-full bg-[#8000EB] text-white font-extrabold tabular-nums border-2 border-white shadow-[0_4px_12px_rgba(128,0,235,0.34)] whitespace-nowrap ${
          isHero || isDetail
            ? 'px-4 py-1 text-[13.5px]'
            : 'px-3 py-0.5 text-[12px]'
        }`}
      >
        {clampedPct} %
      </div>
    </div>
  );
};

export interface CircularProjectsWidgetProps {
  title: string;
  subtitle: string;
  ctaLabel: string;
  goals: SavingsGoal[];
  onCreateNew: () => void;
  onSelectGoal: (goalId: string) => void;
}

export const CircularProjectsWidget: React.FC<CircularProjectsWidgetProps> = ({
  title,
  subtitle,
  ctaLabel,
  goals,
  onCreateNew,
  onSelectGoal,
}) => {
  const primaryGoal = goals[0];
  if (!primaryGoal) return null;

  return (
    <section className="card-simple p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F2EDFF] text-[#8000EB] flex items-center justify-center shrink-0">
            <Target size={19} strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-[16px] font-extrabold text-[#290764] leading-snug">
              {title}
            </h3>
            <p className="text-[12px] text-[#7D7693] mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          className="text-[12px] font-semibold text-[#5E1DF0] hover:underline inline-flex items-center gap-0.5 shrink-0 mt-0.5"
        >
          <span>+ Nouveau</span>
        </button>
      </div>

      {/* Dreamz-Inspired Circular Progress Project Spotlight (with carousel when multiple projects exist) */}
      <div
        className={
          goals.length > 1
            ? 'flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1'
            : 'space-y-3'
        }
      >
        {goals.map((goal) => {
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
          const safeTitle =
            goal.title && goal.title.toLowerCase() !== 'text'
              ? goal.title
              : goal.categoryTag
              ? `Projet ${goal.categoryTag}`
              : 'Voyager';

          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => onSelectGoal(goal.id)}
              className={`${
                goals.length > 1 ? 'w-[86%] shrink-0 snap-center' : 'w-full'
              } p-4 rounded-[22px] bg-[#FAF8FE] hover:bg-[#F5F0FE] border border-[#EFEBF8] transition-all flex flex-col items-center text-center group active:scale-[0.99]`}
            >
              {/* Main Visual Focus: Circular Progress Ring + Photo Inside */}
              <div className="pt-0.5 pb-3">
                <DreamzCircularProject
                  imageUrl={
                    goal.id === 'foyer-demo-vacances' ||
                    goal.imageUrl?.includes('photo-1581579438747-1dc8d17bbce4')
                      ? TRAVEL_PHOTO_URL
                      : goal.imageUrl || TRAVEL_PHOTO_URL
                  }
                  title={safeTitle}
                  progressPct={itemProgressPct}
                  size="widget"
                />
              </div>

              {/* Project Title & Deadline */}
              <div className="space-y-1 mt-1">
                <h4 className="text-[16.5px] font-extrabold text-[#14111F] group-hover:text-[#8000EB] transition-colors leading-snug">
                  {safeTitle}
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
        onClick={() => onSelectGoal(primaryGoal.id)}
        className="w-full h-11 rounded-full bg-[#F3EDFF] hover:bg-[#E7DCFF] text-[#5E1DF0] text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-[0.99]"
      >
        <span>{ctaLabel}</span>
      </button>
    </section>
  );
};

