import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Dashboard from "./pages/Dashboard";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import { useState, useEffect } from "react";
import { getMe, getToken, clearToken } from "./lib/api";

export interface UserData {
  petName: string;
  species: string;
  age: string;
  breed: string;
  weight: string;
  weightUnit: string;
  photo: string | null;
  vaccinated: string;
  disability: string;
  disabilityDetail: string;
  notes: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerCity: string;
  createdAt: string;
}

const STORAGE_KEY = "petNovaUser";

function Router({
  userData,
  setUserData,
  authMode,
  setAuthMode,
}: {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  authMode: "login" | "register";
  setAuthMode: (m: "login" | "register") => void;
}) {
  return (
    <Switch>
      <Route
        path={"/"}
        component={() =>
          userData ? (
            <Dashboard userData={userData} setUserData={setUserData} />
          ) : authMode === "login" ? (
            <Login setUserData={setUserData} goToRegister={() => setAuthMode("register")} />
          ) : (
            <Registration setUserData={setUserData} goToLogin={() => setAuthMode("login")} />
          )
        }
      />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [checkingSession, setCheckingSession] = useState(true);
  const [userData, setUserDataState] = useState<UserData | null>(null);

  const setUserData = (data: UserData | null) => {
    setUserDataState(data);
    if (data) localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    else localStorage.removeItem(STORAGE_KEY);
  };

  // Restore session on load: if there's a saved token, confirm with the
  // backend it's still valid before trusting the cached profile.
  useEffect(() => {
    (async () => {
      const token = getToken();
      const cached = localStorage.getItem(STORAGE_KEY);
      if (token) {
        try {
          await getMe(); // throws if token invalid/expired or backend down
          if (cached) setUserDataState(JSON.parse(cached));
        } catch {
          clearToken();
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setCheckingSession(false);
    })();
  }, []);

  if (checkingSession) return null;

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router userData={userData} setUserData={setUserData} authMode={authMode} setAuthMode={setAuthMode} />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
