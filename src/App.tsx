import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import PersonalPlan from "./pages/PersonalPlan";
import Forum from "./pages/Forum";
import DailyCheckin from "./pages/DailyCheckin";
import Gamification from "./pages/Gamification";
import LeaderboardPage from "./pages/LeaderboardPage";
import Social from "./pages/Social";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Supplements from "./pages/Supplements";
import Gear from "./pages/Gear";
import BodyAnalysisPage from "./pages/BodyAnalysis";
import KnowledgeHub from "./pages/KnowledgeHub";
import ArticleDetail from "./pages/ArticleDetail";
import PricingPage from "./pages/PricingPage";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import CalorieTracking from "./pages/CalorieTracking";
import Workouts from "./pages/Workouts";
import Running from "./pages/Running";
import Coaching from "./pages/Coaching";
import Unsubscribe from "./pages/Unsubscribe";
import HormonalOptimization from "./pages/HormonalOptimization";
import JointHealth from "./pages/JointHealth";
import SleepAdaptive from "./pages/SleepAdaptive";
import ComebackProtocol from "./pages/ComebackProtocol";
import ExecutiveMode from "./pages/ExecutiveMode";
import NotFound from "./pages/NotFound";
import SupportButton from "./components/SupportButton";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SupportButton />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/personal-plan" element={<PersonalPlan />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/checkin" element={<DailyCheckin />} />
            <Route path="/achievements" element={<Gamification />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/community" element={<Social />} />
            <Route path="/supplements" element={<Supplements />} />
            <Route path="/gear" element={<Gear />} />
            <Route path="/body-analysis" element={<BodyAnalysisPage />} />
            <Route path="/knowledge" element={<KnowledgeHub />} />
            <Route path="/knowledge/:slug" element={<ArticleDetail />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/subscription-success" element={<SubscriptionSuccess />} />
            <Route path="/calories" element={<CalorieTracking />} />
            <Route path="/workouts" element={<Workouts />} />
            <Route path="/running" element={<Running />} />
            <Route path="/coaching" element={<Coaching />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/hormonal" element={<HormonalOptimization />} />
            <Route path="/joint-health" element={<JointHealth />} />
            <Route path="/sleep-adaptive" element={<SleepAdaptive />} />
            <Route path="/comeback" element={<ComebackProtocol />} />
            <Route path="/executive-mode" element={<ExecutiveMode />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
