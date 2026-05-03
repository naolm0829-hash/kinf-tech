import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SensoryModeProvider } from "@/contexts/SensoryModeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index.tsx";
import LearningLab from "./pages/LearningLab.tsx";
import PictogramBoard from "./pages/PictogramBoard.tsx";
import SentenceBuilder from "./pages/SentenceBuilder.tsx";
import DailyRoutine from "./pages/DailyRoutine.tsx";
import LetterTracing from "./pages/LetterTracing.tsx";
import ParentNotes from "./pages/ParentNotes.tsx";
import Assessment from "./pages/Assessment.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import EarlyDetection from "./pages/EarlyDetection.tsx";
import CommunityContent from "./pages/CommunityContent.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";
import Premium from "./pages/Premium.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <SensoryModeProvider>
          <LanguageProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1 pt-14 md:pt-16">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/learning-lab" element={<LearningLab />} />
                    <Route path="/pictogram-board" element={<PictogramBoard />} />
                    <Route path="/sentence-builder" element={<SentenceBuilder />} />
                    <Route path="/daily-routine" element={<DailyRoutine />} />
                    <Route path="/letter-tracing" element={<LetterTracing />} />
                    <Route path="/parent-notes" element={<ParentNotes />} />
                    <Route path="/assessment" element={<Assessment />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/early-detection" element={<EarlyDetection />} />
                    <Route path="/community" element={<CommunityContent />} />
                    <Route path="/admin" element={<AdminPanel />} />
                    <Route path="/premium" element={<Premium />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </AuthProvider>
          </BrowserRouter>
          </LanguageProvider>
        </SensoryModeProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
