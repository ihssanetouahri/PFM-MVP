import React, { useState } from 'react';
import {
  RotateCcw,
  FastForward,
  Award,
  Compass,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles,
} from 'lucide-react';
import { usePFM } from '../context/PFMContext';
import { formatDH } from '../data/initialData';

export const DemoControlsBar: React.FC = () => {
  const {
    experienceMode,
    setExperienceMode,
    isR1,
    currentScreen,
    navigateTo,
    simulateNextWeek,
    triggerMilestoneDemo,
    resetAllDemoData,
    jumpToJourney,
    currentDemoChapter,
    setDemoChapter,
    hasSavingsGoal,
    mainAccountBalance,
    currentMonthExpenses,
    savingsGoal,
    learningPoints,
  } = usePFM();

  const [mobileExpanded, setMobileExpanded] = useState(false);

  return (
    <>
      {/* Desktop Presenter Companion Panel (Left & Right of the iPhone preview on large screens) */}
      <div className="hidden lg:flex flex-col justify-between w-80 shrink-0 py-6 space-y-4">
        <div className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#8000EB] text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
              S
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#180D36] leading-tight">
                Simple Banking · Mes finances
              </h2>
              <p className="text-[11px] text-[#6E6585]">
                Parcours client : Lamia · Octobre 2026
              </p>
            </div>
          </div>

          {/* Workbench mode — not displayed inside the banking app */}
          <div className="rounded-2xl bg-white/90 p-3.5 border border-[#E6DDF5] shadow-2xs space-y-2">
            <p className="text-[11px] font-bold text-[#290764]">Version du prototype</p>
            <div className="grid grid-cols-2 gap-2">
              {(['R1', 'VISION'] as const).map((mode) => (
                <button key={mode} type="button" aria-pressed={experienceMode === mode}
                  onClick={() => setExperienceMode(mode)}
                  className={`rounded-xl px-2 py-2 text-[11px] font-bold ${experienceMode === mode ? 'bg-[#8000EB] text-white' : 'bg-[#F5F2FA] text-[#290764]'}`}>
                  {mode === 'R1' ? 'MVP · R1' : 'Vision cible'}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#7D7693]">Le passage d’un mode à l’autre revient à l’accueil sans effacer vos données.</p>
          </div>

          {/* Live Financial Consistency Monitor */}
          <div className="rounded-2xl bg-white/90 p-3.5 border border-[#E6DDF5] shadow-2xs space-y-1.5 text-xs">
            <p className="text-[11px] font-bold text-[#8000EB]">
              État financier cohérent en temps réel
            </p>
            <div className="flex justify-between">
              <span className="text-[#6E6585]">Solde Principal</span>
              <span className="font-bold text-[#180D36] tabular-nums">
                {formatDH(mainAccountBalance, true)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6E6585]">Dépenses Octobre</span>
              <span className="font-bold text-[#180D36] tabular-nums">
                {formatDH(currentMonthExpenses)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6E6585]">
                {savingsGoal.isCreated ? savingsGoal.title : "Projets d'épargne"}
              </span>
              <span className="font-bold text-[#8000EB] tabular-nums">
                {savingsGoal.isCreated
                  ? `${formatDH(savingsGoal.savedAmount)} (${Math.round((savingsGoal.savedAmount / (savingsGoal.targetAmount || 1)) * 100)} %)`
                  : 'Non configuré'}
              </span>
            </div>
            {!isR1 && <div className="flex justify-between">
              <span className="text-[#6E6585]">Points symboliques</span>
              <span className="font-bold text-[#290764] tabular-nums">
                {learningPoints} pts
              </span>
            </div>}
          </div>

          {/* Direct Phase Jumpers */}
          <div className="rounded-2xl bg-white/90 p-3.5 border border-[#E6DDF5] shadow-2xs space-y-2">
            <p className="text-[11px] font-bold text-[#290764] flex items-center gap-1.5">
              <Layers size={13} className="text-[#8000EB]" />
              <span>Accès rapide par écran</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => navigateTo('A1_HOME')}
                className={`py-1.5 px-2.5 rounded-lg text-left ${
                  currentScreen === 'A1_HOME'
                    ? 'bg-[#8000EB] text-white'
                    : 'bg-[#F6F4FA] text-[#180D36] hover:bg-[#EDE6FA]'
                }`}
              >
                A. Accueil Simple
              </button>
              <button
                type="button"
                onClick={() => navigateTo('B0_INTRO')}
                className={`py-1.5 px-2.5 rounded-lg text-left ${
                  currentScreen.startsWith('B')
                    ? 'bg-[#8000EB] text-white'
                    : 'bg-[#F6F4FA] text-[#180D36] hover:bg-[#EDE6FA]'
                }`}
              >
                B. Onboarding
              </button>
              <button
                type="button"
                onClick={() => navigateTo('C1_HUB', { hubTab: 'MON_ESPACE' })}
                className={`py-1.5 px-2.5 rounded-lg text-left ${
                  currentScreen === 'C1_HUB'
                    ? 'bg-[#8000EB] text-white'
                    : 'bg-[#F6F4FA] text-[#180D36] hover:bg-[#EDE6FA]'
                }`}
              >
                C. Hub Mon espace
              </button>
              <button
                type="button"
                onClick={() => navigateTo('D1_EXPENSES')}
                className={`py-1.5 px-2.5 rounded-lg text-left ${
                  currentScreen === 'D1_EXPENSES' ||
                  currentScreen === 'D2_CATEGORY_DETAIL'
                    ? 'bg-[#8000EB] text-white'
                    : 'bg-[#F6F4FA] text-[#180D36] hover:bg-[#EDE6FA]'
                }`}
              >
                D. Mes dépenses
              </button>
              <button
                type="button"
                onClick={() => navigateTo('D4_COACH')}
                className={`py-1.5 px-2.5 rounded-lg text-left ${
                  currentScreen === 'D4_COACH'
                    ? 'bg-[#8000EB] text-white'
                    : 'bg-[#F6F4FA] text-[#180D36] hover:bg-[#EDE6FA]'
                }`}
              >
                D4. Coach Simple
              </button>
              {!isR1 && (<button
                type="button"
                onClick={() => navigateTo('J1_HOUSEHOLD_SPACE')}
                className={`py-1.5 px-2.5 rounded-lg text-left ${
                  currentScreen === 'J1_HOUSEHOLD_SPACE' ||
                  currentScreen === 'J2_HOUSEHOLD_SPLIT' ||
                  currentScreen === 'J3_HOUSEHOLD_SETUP'
                    ? 'bg-[#8000EB] text-white'
                    : 'bg-[#F6F4FA] text-[#180D36] hover:bg-[#EDE6FA]'
                }`}
              >
                J. Espace Foyer
              </button>)}
              {!isR1 && (<button
                type="button"
                onClick={() => navigateTo('E4_FORECAST_RECURRING')}
                className={`py-1.5 px-2.5 rounded-lg text-left ${
                  currentScreen === 'E4_FORECAST_RECURRING'
                    ? 'bg-[#8000EB] text-white'
                    : 'bg-[#F6F4FA] text-[#180D36] hover:bg-[#EDE6FA]'
                }`}
              >
                E4. Prévisions
              </button>)}
              <button
                type="button"
                onClick={() =>
                  hasSavingsGoal && savingsGoal.isCreated
                    ? navigateTo('H1_SAVINGS_GOAL')
                    : navigateTo('H0_CREATE_GOAL')
                }
                className={`py-1.5 px-2.5 rounded-lg text-left ${
                  currentScreen.startsWith('H')
                    ? 'bg-[#8000EB] text-white'
                    : 'bg-[#F6F4FA] text-[#180D36] hover:bg-[#EDE6FA]'
                }`}
              >
                H. Projets d'épargne
              </button>
              {!isR1 && (<button
                type="button"
                onClick={() => navigateTo('I3_INVEST_DISCOVERY')}
                className={`py-1.5 px-2.5 rounded-lg text-left ${
                  currentScreen === 'I3_INVEST_DISCOVERY'
                    ? 'bg-[#8000EB] text-white'
                    : 'bg-[#F6F4FA] text-[#180D36] hover:bg-[#EDE6FA]'
                }`}
              >
                I3. Simple Invest
              </button>)}
              <button
                type="button"
                onClick={() => navigateTo('I1_WIDGET_CATALOG')}
                className={`py-1.5 px-2.5 rounded-lg text-left ${
                  currentScreen === 'I1_WIDGET_CATALOG'
                    ? 'bg-[#8000EB] text-white'
                    : 'bg-[#F6F4FA] text-[#180D36] hover:bg-[#EDE6FA]'
                }`}
              >
                I. 40 Widgets
              </button>
            </div>
          </div>
        </div>

        {/* Simulation Actions */}
        <div className="rounded-2xl bg-white/90 p-4 border border-[#E6DDF5] shadow-2xs space-y-2">
          <p className="text-[11px] font-bold text-[#290764]">
            Contrôles de démonstration
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={simulateNextWeek}
              className="py-2 px-2.5 rounded-xl bg-[#F3E8FF] text-[#8000EB] text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-[#E9D5FF]"
            >
              <FastForward size={13} />
              <span>+1 semaine</span>
            </button>
            <button
              type="button"
              onClick={triggerMilestoneDemo}
              className="py-2 px-2.5 rounded-xl bg-[#F3E8FF] text-[#8000EB] text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-[#E9D5FF]"
            >
              <Award size={13} />
              <span>Étape réussie</span>
            </button>
          </div>
          <button
            type="button"
            onClick={resetAllDemoData}
            className="w-full py-2 px-3 rounded-xl bg-[#F5F2FA] text-[#290764] text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#EAE3F5]"
          >
            <RotateCcw size={13} />
            <span>Réinitialiser le parcours</span>
          </button>
        </div>
      </div>

      {/* Discreet Collapsible Demo Controls Pill for smaller screens */}
      <div className="lg:hidden w-full bg-[#180D36] text-white px-4 py-2 text-xs">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <span className="font-bold flex items-center gap-1.5 text-[11px] text-[#E9D5FF]">
            <Sparkles size={13} />
            Démo Simple · Mes finances ({currentDemoChapter})
          </span>
          <button
            type="button"
            onClick={() => setMobileExpanded((v) => !v)}
            className="text-[11px] font-semibold flex items-center gap-1 text-white/90"
          >
            <span>Contrôles démo</span>
            {mobileExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {mobileExpanded && (
          <div className="max-w-md mx-auto pt-2.5 pb-1 space-y-2.5 border-t border-white/15 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold">Prototype :</span>
              {(['R1', 'VISION'] as const).map((mode) => (
                <button key={mode} type="button" onClick={() => setExperienceMode(mode)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${experienceMode === mode ? 'bg-[#8000EB] text-white' : 'bg-white/15 text-white'}`}>
                  {mode === 'R1' ? 'MVP R1' : 'Vision cible'}
                </button>
              ))}
            </div>

            <div>
              <p className="text-[10px] text-[#D8B4FE] font-bold uppercase tracking-wider mb-1.5">
                {isR1 ? 'Parcours MVP R1 :' : '5 Chapitres de Lamia :'}
              </p>
              <div className={`grid ${isR1 ? 'grid-cols-3' : 'grid-cols-5'} gap-1`}>
                {(
                  [
                    { id: 'COMPRENDRE', label: '1. Comprendre' },
                    { id: 'MAITRISER', label: '2. Maîtriser' },
                    { id: 'EPARGNER', label: '3. Épargner' },
                    { id: 'FOYER', label: '4. Foyer' },
                    { id: 'INVESTIR', label: '5. Investir' },
                  ] as const
                ).filter((c) => !isR1 || !['FOYER', 'INVESTIR'].includes(c.id)).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setDemoChapter(c.id);
                      setMobileExpanded(false);
                    }}
                    className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center leading-tight truncate ${
                      currentDemoChapter === c.id
                        ? 'bg-[#8000EB] text-white ring-1 ring-white/50'
                        : 'bg-white/15 text-white/90'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  navigateTo('A1_HOME');
                  setMobileExpanded(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/15 text-[11px] font-semibold"
              >
                Accueil
              </button>
              <button
                type="button"
                onClick={() => {
                  navigateTo('B0_INTRO');
                  setMobileExpanded(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/15 text-[11px] font-semibold"
              >
                Onboarding
              </button>
              <button
                type="button"
                onClick={() => {
                  navigateTo('C1_HUB', { hubTab: 'MON_ESPACE' });
                  setMobileExpanded(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/15 text-[11px] font-semibold"
              >
                Mon espace
              </button>
              <button
                type="button"
                onClick={() => {
                  simulateNextWeek();
                  setMobileExpanded(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#8000EB] text-[11px] font-bold"
              >
                +1 sem.
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAllDemoData();
                  setMobileExpanded(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-white/10 text-[11px]"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
