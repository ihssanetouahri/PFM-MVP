import React from 'react';
import { PFMProvider, usePFM } from './context/PFMContext';
import {
  BankingHomeScreen,
  MenuAndCardsScreen,
  OnboardingFlowScreens,
} from './components/HomeAndOnboarding';
import {
  FinancialHubScreen,
  PersonalizeAndCatalogScreens,
} from './components/HubMonEspace';
import {
  BudgetCreationScreens,
  CategoryDetailScreen,
  ShoppingInsightScreen,
  FinancialCoachScreen,
  SpendingAnalysisScreen,
  TransactionDetailScreen,
  ForecastAndRecurringScreen,
  SubscriptionsDetailScreen,
} from './components/SpendingAndCoach';
import {
  ChallengeDetailAndActiveScreens,
  LearnCourseFlowScreens,
  ShoppingSavingsChallengeScreen,
} from './components/ChallengesAndLearn';
import { SavingsFlowScreens } from './components/SavingsScreens';
import {
  HouseholdSpaceScreen,
  HouseholdSplitScreen,
  HouseholdSetupScreen,
  FamilyBudgetsScreen,
  FamilyBudgetDetailScreen,
  HouseholdPocketDetailScreen,
  HouseholdFamilyAccountScreen,
} from './components/HouseholdScreens';
import { GlobalOverlays } from './components/SharedUI';
import { DemoControlsBar } from './components/DemoControlsBar';

const ScreenRouter: React.FC = () => {
  const { currentScreen } = usePFM();

  switch (currentScreen) {
    case 'A1_HOME':
      return <BankingHomeScreen />;
    case 'CARDS_VIEW':
      return <MenuAndCardsScreen mode="CARDS" />;
    case 'MENU_VIEW':
      return <MenuAndCardsScreen mode="MENU" />;
    case 'B0_INTRO':
    case 'B1_INTENTION':
    case 'B2_PERSONALIZATION':
    case 'B3_TRANSPARENCY':
    case 'B4_LOADING':
    case 'B5_FIRST_VALUE':
      return <OnboardingFlowScreens />;
    case 'C1_HUB':
      return <FinancialHubScreen />;
    case 'D1_EXPENSES':
      return <SpendingAnalysisScreen />;
    case 'D2_CATEGORY_DETAIL':
      return <CategoryDetailScreen />;
    case 'D2_SHOPPING_INSIGHT':
      return <ShoppingInsightScreen />;
    case 'D3_TRANSACTION_DETAIL':
      return <TransactionDetailScreen />;
    case 'D4_COACH':
      return <FinancialCoachScreen />;
    case 'D5_SUBSCRIPTIONS_DETAIL':
      return <SubscriptionsDetailScreen />;
    case 'E1_CREATE_BUDGET':
    case 'E2_BUDGET_SUCCESS':
      return <BudgetCreationScreens />;
    case 'E4_FORECAST_RECURRING':
      return <ForecastAndRecurringScreen />;
    case 'F2_CHALLENGE_DETAIL':
    case 'F3_ACTIVE_CHALLENGE':
      return <ChallengeDetailAndActiveScreens />;
    case 'F4_SHOPPING_CHALLENGE':
      return <ShoppingSavingsChallengeScreen />;
    case 'G2_COURSE_DETAIL':
    case 'G3_LESSON':
    case 'G4_QUIZ':
    case 'G5_COURSE_SUCCESS':
      return <LearnCourseFlowScreens />;
    case 'H0_CREATE_GOAL':
    case 'H1_SAVINGS_GOAL':
    case 'H2_ADD_MONEY':
    case 'H3_AUTO_SAVINGS':
    case 'H4_AUTO_SAVINGS_SUCCESS':
      return <SavingsFlowScreens />;
    case 'J1_HOUSEHOLD_SPACE':
      return <HouseholdSpaceScreen />;
    case 'J2_HOUSEHOLD_SPLIT':
      return <HouseholdSplitScreen />;
    case 'J3_HOUSEHOLD_SETUP':
      return <HouseholdSetupScreen />;
    case 'J4_FAMILY_BUDGETS':
      return <FamilyBudgetsScreen />;
    case 'J5_FAMILY_BUDGET_DETAIL':
      return <FamilyBudgetDetailScreen />;
    case 'J_POCKET_DETAIL':
      return <HouseholdPocketDetailScreen />;
    case 'J_FAMILY_ACCOUNT':
      return <HouseholdFamilyAccountScreen />;
    case 'I1_WIDGET_CATALOG':
    case 'I2_PERSONALIZE_LAYOUT':
    case 'I3_INVEST_DISCOVERY':
    case 'WIDGET_DETAIL':
      return <PersonalizeAndCatalogScreens />;
    default:
      return <BankingHomeScreen />;
  }
};

const PrototypeShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFEBF9] via-[#F7F5FC] to-[#EAE3FA] flex flex-col lg:flex-row items-center justify-center lg:gap-12 lg:px-8">
      {/* Presenter Controls (Outside mobile UI on desktop, collapsible top pill on mobile) */}
      <DemoControlsBar />

      {/* iPhone-Sized Mobile Prototype Container matching the reference screenshots */}
      <div className="w-full sm:w-[412px] sm:my-6 sm:rounded-[52px] sm:border-[11px] sm:border-[#1D1B24] sm:shadow-[0_28px_70px_rgba(20,17,31,0.22)] bg-[#F7F4FE] relative overflow-hidden [transform:translateZ(0)] flex flex-col min-h-screen sm:min-h-[852px] sm:max-h-[868px]">
        {/* Mobile Status Bar + Dynamic Island (Desktop Preview Only) */}
        <div className="hidden sm:flex items-center justify-between px-8 pt-3 pb-2 bg-[#F4EEFF] text-[13px] font-bold text-[#14111F] select-none shrink-0 z-40">
          <span className="tracking-tight">9:41</span>
          <div className="w-[114px] h-[30px] bg-black rounded-full flex items-center justify-end pr-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16192B] ring-1 ring-white/10" />
          </div>
          <div className="flex items-center gap-1.5 text-[#14111F]">
            {/* Signal bars */}
            <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
              <rect x="0" y="7" width="2.5" height="4" rx="0.8" />
              <rect x="4" y="5" width="2.5" height="6" rx="0.8" />
              <rect x="8" y="2.5" width="2.5" height="8.5" rx="0.8" />
              <rect x="12" y="0" width="2.5" height="11" rx="0.8" />
            </svg>
            {/* Battery */}
            <div className="w-6 h-3 rounded-[4px] border border-[#14111F]/50 p-0.5 flex items-center">
              <div className="w-full h-full bg-[#14111F] rounded-[2px]" />
            </div>
          </div>
        </div>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col bg-simple-canvas">
          <GlobalOverlays />
          <ScreenRouter />
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <PFMProvider>
      <PrototypeShell />
    </PFMProvider>
  );
}
