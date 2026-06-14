import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthInit } from "@/components/AuthInit";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthGuard } from "@/components/AuthGuard";
import { SignInPage } from "@/pages/SignIn";
import { SignUpPage } from "@/pages/SignUp";
import { VerifyEmailPage } from "@/pages/VerifyEmail";
import { DashboardPage } from "@/pages/Dashboard";
import { MarketPage } from "@/pages/Market";
import { SignalsPage } from "@/pages/Signals";
import { WatchlistPage } from "@/pages/Watchlist";
import { PortfolioPage } from "@/pages/Portfolio";
import { AIInsightsPage } from "@/pages/AIInsights";
import { AssetAnalysisPage } from "@/pages/AssetAnalysis";
import { BillingPage } from "@/pages/Billing";
import { ProfilePage } from "@/pages/Profile";
import { SettingsPage } from "@/pages/Settings";
import { PositionsPage } from "@/pages/Positions";
import { PositionDetailPage } from "@/pages/PositionDetail";
import { OnboardingPage } from "@/pages/Onboarding";

function App() {
  return (
    <ThemeProvider>
      <AuthInit />
      <Routes>
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
        <Route
          path="/sign-in"
          element={
            <AuthGuard>
              <SignInPage />
            </AuthGuard>
          }
        />
        <Route
          path="/sign-up"
          element={
            <AuthGuard>
              <SignUpPage />
            </AuthGuard>
          }
        />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="market" element={<MarketPage />} />
          <Route path="signals" element={<SignalsPage />} />
          <Route path="positions" element={<PositionsPage />} />
          <Route path="positions/:positionId" element={<PositionDetailPage />} />
          <Route path="watchlist" element={<WatchlistPage />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="analysis" element={<AssetAnalysisPage />} />
          <Route path="ai-insights" element={<AIInsightsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
