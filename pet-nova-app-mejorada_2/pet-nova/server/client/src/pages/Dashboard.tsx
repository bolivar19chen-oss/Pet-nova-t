import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { UserData } from "@/App";
import { getAppointments, getVaccines, getAlerts, createAppointment, createVaccine, createAlert as createAlertApi, clearToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calendar, Syringe, AlertCircle, MapPin, Users, LogOut, Menu, X, ChevronDown } from "lucide-react";
import Settings from "./Settings";
import PetMap from "./PetMap";
import SmartCalendar from "./SmartCalendar";
import Community from "./Community";

interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  veterinarian: string;
  notes: string;
}

interface Vaccine {
  id: string;
  name: string;
  date: string;
  nextDue: string;
  veterinarian: string;
}

interface LostPetAlert {
  id: string;
  petName: string;
  date: string;
  location: string;
  description: string;
  contact: string;
  city: string;
}

type PageView = "dashboard" | "settings" | "map" | "calendar" | "community";

export default function Dashboard({ userData, setUserData }: { userData: UserData; setUserData: (data: UserData | null) => void }) {
  const { t, language } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [alerts, setAlerts] = useState<LostPetAlert[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pageView, setPageView] = useState<PageView>("dashboard");
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Appointment Form State
  const [appointmentForm, setAppointmentForm] = useState({
    date: "",
    time: "",
    type: "checkup",
    veterinarian: "",
    notes: "",
  });

  // Vaccine Form State
  const [vaccineForm, setVaccineForm] = useState({
    name: "",
    date: "",
    nextDue: "",
    veterinarian: "",
  });

  // Alert Form State
  const [alertForm, setAlertForm] = useState({
    location: "",
    description: "",
    contact: "",
    city: "Panama City",
  });

  // Load real data from the backend on mount (falls back silently to
  // local-only state if the API isn't reachable, e.g. static preview)
  useEffect(() => {
    (async () => {
      try {
        const [a, v, al] = await Promise.all([getAppointments(), getVaccines(), getAlerts()]);
        setAppointments(a as unknown as Appointment[]);
        setVaccines(v as unknown as Vaccine[]);
        setAlerts(al as unknown as LostPetAlert[]);
      } catch {
        /* backend not reachable in this preview */
      }
    })();
  }, []);

  const handleAddAppointment = async () => {
    if (!appointmentForm.date || !appointmentForm.time || !appointmentForm.veterinarian) {
      toast.error(t("toast.required"));
      return;
    }
    const payload = { petId: userData.petName, ...appointmentForm };
    try {
      const saved = await createAppointment(payload);
      setAppointments([...appointments, saved as unknown as Appointment]);
    } catch {
      setAppointments([...appointments, { id: Date.now().toString(), ...appointmentForm }]);
    }
    setAppointmentForm({ date: "", time: "", type: "checkup", veterinarian: "", notes: "" });
    toast.success(t("toast.success"));
  };

  const handleAddVaccine = async () => {
    if (!vaccineForm.name || !vaccineForm.date) {
      toast.error(t("toast.required"));
      return;
    }
    const payload = { petId: userData.petName, ...vaccineForm };
    try {
      const saved = await createVaccine(payload);
      setVaccines([...vaccines, saved as unknown as Vaccine]);
    } catch {
      setVaccines([...vaccines, { id: Date.now().toString(), ...vaccineForm }]);
    }
    setVaccineForm({ name: "", date: "", nextDue: "", veterinarian: "" });
    toast.success(t("toast.success"));
  };

  const handleCreateAlert = async () => {
    if (!alertForm.location || !alertForm.description || !alertForm.contact) {
      toast.error(t("toast.required"));
      return;
    }
    const payload = {
      petName: userData.petName,
      date: new Date().toLocaleDateString("en-US"),
      ...alertForm,
    };
    try {
      const saved = await createAlertApi(payload);
      setAlerts([...alerts, saved as unknown as LostPetAlert]);
    } catch {
      setAlerts([...alerts, { id: Date.now().toString(), ...payload }]);
    }
    setAlertForm({ location: "", description: "", contact: "", city: "Panama City" });
    toast.success(t("toast.success"));
  };

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("petNovaUser");
    setUserData(null);
  };

  const upcomingAppointments = appointments
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    .slice(0, 3);

  if (pageView === "settings") {
    return <Settings onBack={() => setPageView("dashboard")} />;
  }

  if (pageView === "map") {
    return <PetMap onBack={() => setPageView("dashboard")} userCity={userData.ownerCity} petName={userData.petName} />;
  }

  if (pageView === "calendar") {
    return <SmartCalendar onBack={() => setPageView("dashboard")} petName={userData.petName} />;
  }

  if (pageView === "community") {
    return <Community onBack={() => setPageView("dashboard")} ownerName={userData.ownerName} city={userData.ownerCity} petName={userData.petName} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50" style={{ fontFamily: "'Geist', sans-serif" }}>
      {/* Header with Dropdowns */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/pet-nova-logo.jpg" alt="Pet Nova" className="h-10" />
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-12">
              <div className="relative group">
                <button className="flex items-center gap-2 font-semibold text-gray-800 hover:text-purple-600 transition">
                  {t("nav.weCare")}
                  <ChevronDown size={18} className="group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute left-0 top-full pt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-3 z-50">
                  <a href="#" className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:pl-6 transition-all">
                    {t("nav.medicalHistory")}
                  </a>
                  <button onClick={() => setPageView("calendar")} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:pl-6 transition-all">
                    {t("nav.smartCalendar")}
                  </button>
                  <a href="#" className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:pl-6 transition-all">
                    {t("nav.vaccinationJourneys")}
                  </a>
                  <a href="#" className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:pl-6 transition-all">
                    {t("nav.howToCare")}
                  </a>
                </div>
              </div>

              <div className="relative group">
                <button className="flex items-center gap-2 font-semibold text-gray-800 hover:text-purple-600 transition">
                  {t("nav.inMyPet")}
                  <ChevronDown size={18} className="group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute left-0 top-full pt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-3 z-50">
                  <a href="#" className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:pl-6 transition-all">
                    {t("nav.petProfile")}
                  </a>
                  <button onClick={() => setPageView("community")} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:pl-6 transition-all">
                    {t("nav.petMoments")}
                  </button>
                  <button onClick={() => setPageView("calendar")} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:pl-6 transition-all">
                    {t("nav.pawPlanner")}
                  </button>
                </div>
              </div>

              <div className="relative group">
                <button className="flex items-center gap-2 font-semibold text-gray-800 hover:text-purple-600 transition">
                  {t("nav.action")}
                  <ChevronDown size={18} className="group-hover:rotate-180 transition-transform" />
                </button>
                <div className="absolute left-0 top-full pt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-3 z-50">
                  <a href="#" className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:pl-6 transition-all">
                    {t("nav.pawAlert")}
                  </a>
                  <button onClick={() => setPageView("map")} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:pl-6 transition-all">
                    {t("nav.petMap")}
                  </button>
                  <a href="#" className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:pl-6 transition-all">
                    {t("nav.anonymousReports")}
                  </a>
                  <a href="#" className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 hover:pl-6 transition-all">
                    {t("nav.whatToDo")}
                  </a>
                </div>
              </div>
            </nav>

            {/* Desktop Profile Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                    {userData.ownerName.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={16} />
                </button>
                <div className="absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                  <button onClick={() => setPageView("settings")} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600">
                    {t("nav.settings")}
                  </button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    {t("nav.logout")}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white p-4 space-y-3">
              <div className="text-gray-600 font-medium">{userData.ownerName}</div>
              <Button variant="ghost" size="sm" onClick={() => setPageView("map")} className="w-full justify-start">
                {t("nav.petMap")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPageView("calendar")} className="w-full justify-start">
                {t("nav.smartCalendar")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPageView("community")} className="w-full justify-start">
                {t("nav.petMoments")}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setPageView("settings")} className="w-full justify-start">
                {t("nav.settings")}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start text-red-600">
                <LogOut size={18} className="mr-2" />
                {t("nav.logout")}
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Geist', sans-serif", letterSpacing: '-0.02em' }}>
                  {t("dashboard.hello")}, {userData.ownerName}!
                </h2>
                <p className="text-gray-600 text-lg">{t("dashboard.welcome")} {userData.petName}'s {t("dashboard.panel")}</p>
              </div>
              <div className="flex items-center gap-6">
                {userData.photo && (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg">
                    <img src={userData.photo} alt={userData.petName} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    {userData.age || "?"}
                  </div>
                  <p className="text-gray-600 text-sm">years old</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pet Profile Card */}
        <div className="mb-10">
          <h3 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Geist', sans-serif", letterSpacing: '-0.01em' }}>{userData.petName}'s Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-white border-gray-100 hover:shadow-md transition">
              <div className="text-sm text-gray-600 font-medium mb-2">Breed</div>
              <div className="text-xl font-semibold text-gray-900">{userData.breed || "Not specified"}</div>
            </Card>
            <Card className="p-6 bg-white border-gray-100 hover:shadow-md transition">
              <div className="text-sm text-gray-600 font-medium mb-2">Weight</div>
              <div className="text-xl font-semibold text-gray-900">{userData.weight} {userData.weightUnit}</div>
            </Card>
            <Card className="p-6 bg-white border-gray-100 hover:shadow-md transition">
              <div className="text-sm text-gray-600 font-medium mb-2">Vaccination Status</div>
              <div className={`text-xl font-semibold ${userData.vaccinated === "yes" ? "text-green-600" : "text-orange-600"}`}>
                {userData.vaccinated === "yes" ? "Up to date" : "Pending"}
              </div>
            </Card>
          </div>
        </div>

        {/* Medical History */}
        <div className="mb-10">
          <h3 className="text-3xl font-bold text-gray-900 mb-6" style={{ fontFamily: "'Geist', sans-serif", letterSpacing: '-0.01em' }}>Medical History</h3>
          <Card className="p-6 bg-white border-gray-100">
            <div className="space-y-4">
              <div className="flex justify-between items-start pb-4 border-b border-gray-200">
                <div>
                  <div className="font-semibold text-gray-900">Notes</div>
                  <div className="text-gray-600 text-sm mt-1">{userData.notes || "No notes added"}</div>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-900">Special Conditions</div>
                  <div className="text-gray-600 text-sm mt-1">
                    {userData.disability === "yes" ? `${userData.disabilityDetail}` : "None reported"}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-white border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t("dashboard.appointments")}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{appointments.length}</p>
              </div>
              <Calendar className="text-purple-500" size={32} />
            </div>
          </Card>

          <Card className="p-6 bg-white border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t("dashboard.vaccines")}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{vaccines.length}</p>
              </div>
              <Syringe className="text-cyan-500" size={32} />
            </div>
          </Card>

          <Card className="p-6 bg-white border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t("dashboard.alerts")}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{alerts.length}</p>
              </div>
              <AlertCircle className="text-red-500" size={32} />
            </div>
          </Card>

          <Card className="p-6 bg-white border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{t("dashboard.city")}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{userData.ownerCity}</p>
              </div>
              <MapPin className="text-purple-500" size={32} />
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1">
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar size={18} />
              <span className="hidden sm:inline">{t("dashboard.appointments")}</span>
            </TabsTrigger>
            <TabsTrigger value="vaccines" className="flex items-center gap-2">
              <Syringe size={18} />
              <span className="hidden sm:inline">{t("dashboard.vaccines")}</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span className="hidden sm:inline">{t("dashboard.alerts")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Appointment Form */}
              <Card className="lg:col-span-1 p-6 bg-white border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "'Geist', sans-serif" }}>
                  {t("dashboard.scheduleAppointment")}
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">{t("dashboard.date")}</Label>
                    <Input
                      type="date"
                      value={appointmentForm.date}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                      className="mt-1 border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("dashboard.time")}</Label>
                    <Input
                      type="time"
                      value={appointmentForm.time}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                      className="mt-1 border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("dashboard.type")}</Label>
                    <Select value={appointmentForm.type} onValueChange={(value) => setAppointmentForm({ ...appointmentForm, type: value })}>
                      <SelectTrigger className="mt-1 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checkup">Checkup</SelectItem>
                        <SelectItem value="vaccination">Vaccination</SelectItem>
                        <SelectItem value="grooming">Grooming</SelectItem>
                        <SelectItem value="dental">Dental</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("dashboard.veterinarian")}</Label>
                    <Input
                      placeholder="Veterinarian name"
                      value={appointmentForm.veterinarian}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, veterinarian: e.target.value })}
                      className="mt-1 border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("dashboard.notes")}</Label>
                    <Textarea
                      placeholder="Additional notes"
                      value={appointmentForm.notes}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                      className="mt-1 border-gray-300"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleAddAppointment}
                    className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
                  >
                    {t("dashboard.schedule")}
                  </Button>
                </div>
              </Card>

              {/* Appointments List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Geist', sans-serif" }}>
                  {t("dashboard.upcomingAppointments")}
                </h3>
                {upcomingAppointments.length === 0 ? (
                  <Card className="p-8 bg-white border-gray-100 text-center">
                    <Calendar className="mx-auto text-gray-400 mb-3" size={40} />
                    <p className="text-gray-600">{t("dashboard.noAppointments")}</p>
                  </Card>
                ) : (
                  upcomingAppointments.map((apt) => (
                    <Card key={apt.id} className="p-4 bg-white border-gray-100 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{apt.type.charAt(0).toUpperCase() + apt.type.slice(1)}</p>
                          <p className="text-sm text-gray-600 mt-1">📅 {apt.date} at {apt.time}</p>
                          <p className="text-sm text-gray-600">👨‍⚕️ {apt.veterinarian}</p>
                          {apt.notes && <p className="text-sm text-gray-500 mt-2 italic">{apt.notes}</p>}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Vaccines Tab */}
          <TabsContent value="vaccines" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Vaccine Form */}
              <Card className="lg:col-span-1 p-6 bg-white border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "'Geist', sans-serif" }}>
                  {t("dashboard.registerVaccine")}
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">{t("dashboard.vaccineName")}</Label>
                    <Input
                      placeholder="E.g. Rabies, DHPP"
                      value={vaccineForm.name}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, name: e.target.value })}
                      className="mt-1 border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("dashboard.applicationDate")}</Label>
                    <Input
                      type="date"
                      value={vaccineForm.date}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, date: e.target.value })}
                      className="mt-1 border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("dashboard.nextDue")}</Label>
                    <Input
                      type="date"
                      value={vaccineForm.nextDue}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, nextDue: e.target.value })}
                      className="mt-1 border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("dashboard.veterinarian")}</Label>
                    <Input
                      placeholder="Veterinarian name"
                      value={vaccineForm.veterinarian}
                      onChange={(e) => setVaccineForm({ ...vaccineForm, veterinarian: e.target.value })}
                      className="mt-1 border-gray-300"
                    />
                  </div>
                  <Button
                    onClick={handleAddVaccine}
                    className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                  >
                    Register
                  </Button>
                </div>
              </Card>

              {/* Vaccines List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Geist', sans-serif" }}>
                  {t("dashboard.vaccineHistory")}
                </h3>
                {vaccines.length === 0 ? (
                  <Card className="p-8 bg-white border-gray-100 text-center">
                    <Syringe className="mx-auto text-gray-400 mb-3" size={40} />
                    <p className="text-gray-600">{t("dashboard.noVaccines")}</p>
                  </Card>
                ) : (
                  vaccines.map((vac) => (
                    <Card key={vac.id} className="p-4 bg-white border-gray-100 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{vac.name}</p>
                          <p className="text-sm text-gray-600 mt-1">💉 Applied: {vac.date}</p>
                          {vac.nextDue && <p className="text-sm text-gray-600">🔄 Next: {vac.nextDue}</p>}
                          {vac.veterinarian && <p className="text-sm text-gray-600">👨‍⚕️ {vac.veterinarian}</p>}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create Alert Form */}
              <Card className="lg:col-span-1 p-6 bg-white border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "'Geist', sans-serif" }}>
                  {t("dashboard.createAlert")}
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">{t("dashboard.location")}</Label>
                    <Input
                      placeholder="E.g. Central Park, La Chorrera"
                      value={alertForm.location}
                      onChange={(e) => setAlertForm({ ...alertForm, location: e.target.value })}
                      className="mt-1 border-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("dashboard.description")}</Label>
                    <Textarea
                      placeholder="Details about what happened"
                      value={alertForm.description}
                      onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })}
                      className="mt-1 border-gray-300"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("registration.city")}</Label>
                    <Select value={alertForm.city} onValueChange={(value) => setAlertForm({ ...alertForm, city: value })}>
                      <SelectTrigger className="mt-1 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Panama City">Panama City</SelectItem>
                        <SelectItem value="La Chorrera">La Chorrera</SelectItem>
                        <SelectItem value="San Miguelito">San Miguelito</SelectItem>
                        <SelectItem value="Colón">Colón</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">{t("dashboard.contact")}</Label>
                    <Input
                      placeholder="Phone or email"
                      value={alertForm.contact}
                      onChange={(e) => setAlertForm({ ...alertForm, contact: e.target.value })}
                      className="mt-1 border-gray-300"
                    />
                  </div>
                  <Button
                    onClick={handleCreateAlert}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
                  >
                    {t("dashboard.publishAlert")}
                  </Button>
                </div>
              </Card>

              {/* Alerts Feed */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Geist', sans-serif" }}>
                  {t("dashboard.communityAlerts")}
                </h3>
                {alerts.length === 0 ? (
                  <Card className="p-8 bg-white border-gray-100 text-center">
                    <AlertCircle className="mx-auto text-gray-400 mb-3" size={40} />
                    <p className="text-gray-600">{t("dashboard.noAlerts")}</p>
                  </Card>
                ) : (
                  alerts.map((alert) => (
                    <Card key={alert.id} className="p-4 bg-white border-l-4 border-red-500 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-lg">{alert.petName} - {alert.city}</p>
                          <p className="text-sm text-gray-600 mt-1">📍 {alert.location}</p>
                          <p className="text-sm text-gray-600">📅 {alert.date}</p>
                          <p className="text-sm text-gray-700 mt-2">{alert.description}</p>
                          <p className="text-sm text-purple-600 font-medium mt-2">📞 {alert.contact}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
