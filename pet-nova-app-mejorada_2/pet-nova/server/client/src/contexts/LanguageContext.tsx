import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    "app.title": "Pet Nova",
    "app.subtitle": "Pet Care Community",
    "nav.weCare": "We Care",
    "nav.inMyPet": "In My Pet",
    "nav.action": "Action",
    "nav.medicalHistory": "Medical History",
    "nav.smartCalendar": "Smart Calendar",
    "nav.vaccinationJourneys": "Vaccination Journeys",
    "nav.howToCare": "How to Care",
    "nav.petProfile": "Pet Profile",
    "nav.petMoments": "Pet Moments",
    "nav.pawPlanner": "Paw Planner",
    "nav.pawAlert": "Paw Alert",
    "nav.petMap": "Pet Map",
    "nav.anonymousReports": "Anonymous Reports",
    "nav.whatToDo": "What to Do If...",
    "nav.viewProfile": "View Profile",
    "nav.myPets": "My Pets",
    "nav.settings": "Settings",
    "nav.logout": "Logout",
    "registration.title": "Join Pet Nova",
    "registration.subtitle": "Register your pet and yourself in under two minutes",
    "registration.step1": "Step 1 · Pet Profile",
    "registration.step2": "Step 2 · Medical Record",
    "registration.step3": "Step 3 · Owner Details",
    "registration.petName": "Pet's Name",
    "registration.species": "Species",
    "registration.age": "Age (years)",
    "registration.breed": "Breed",
    "registration.weight": "Weight",
    "registration.unit": "Unit",
    "registration.photo": "Photo",
    "registration.uploadPhoto": "Upload Photo",
    "registration.vaccinated": "Vaccinated?",
    "registration.disability": "Special Condition?",
    "registration.disabilityDetail": "Describe it",
    "registration.medicalNotes": "Medical Notes",
    "registration.ownerName": "Full Name",
    "registration.email": "Email",
    "registration.phone": "Phone",
    "registration.city": "City",
    "registration.next": "Next",
    "registration.back": "Back",
    "registration.register": "Register",
    "dashboard.hello": "Hello",
    "dashboard.welcome": "Welcome to",
    "dashboard.panel": "panel",
    "dashboard.appointments": "Appointments",
    "dashboard.vaccines": "Vaccines",
    "dashboard.alerts": "Active Alerts",
    "dashboard.city": "City",
    "dashboard.scheduleAppointment": "Schedule Appointment",
    "dashboard.date": "Date",
    "dashboard.time": "Time",
    "dashboard.type": "Type",
    "dashboard.veterinarian": "Veterinarian",
    "dashboard.notes": "Notes",
    "dashboard.schedule": "Schedule",
    "dashboard.upcomingAppointments": "Upcoming Appointments",
    "dashboard.noAppointments": "No appointments scheduled",
    "dashboard.registerVaccine": "Register Vaccine",
    "dashboard.vaccineName": "Vaccine Name",
    "dashboard.applicationDate": "Application Date",
    "dashboard.nextDue": "Next Due",
    "dashboard.vaccineHistory": "Vaccine History",
    "dashboard.noVaccines": "No vaccines registered",
    "dashboard.createAlert": "Create Paw Alert",
    "dashboard.location": "Location",
    "dashboard.description": "Description",
    "dashboard.contact": "Your Contact",
    "dashboard.publishAlert": "Publish Alert",
    "dashboard.communityAlerts": "Community Alerts",
    "dashboard.noAlerts": "No active alerts",
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.profile": "Profile",
    "settings.privacy": "Privacy",
    "settings.about": "About",
    "map.title": "Pet Map",
    "map.veterinarians": "Veterinarians",
    "map.parks": "Parks",
    "map.groomers": "Groomers",
    "map.lostPets": "Lost Pets",
    "toast.success": "Success",
    "toast.error": "Error",
    "toast.required": "Please fill in all required fields",
  },
  es: {
    "app.title": "Pet Nova",
    "app.subtitle": "Comunidad de Cuidado de Mascotas",
    "nav.weCare": "We Care",
    "nav.inMyPet": "In My Pet",
    "nav.action": "Acción",
    "nav.medicalHistory": "Historial Médico",
    "nav.smartCalendar": "Calendario Inteligente",
    "nav.vaccinationJourneys": "Jornadas de Vacunación",
    "nav.howToCare": "Cómo Cuidar",
    "nav.petProfile": "Perfil de Mascota",
    "nav.petMoments": "Pet Moments",
    "nav.pawPlanner": "Paw Planner",
    "nav.pawAlert": "Alerta Paw",
    "nav.petMap": "Mapa Pet",
    "nav.anonymousReports": "Denuncias Anónimas",
    "nav.whatToDo": "Qué Hacer Si...",
    "nav.viewProfile": "Ver Perfil",
    "nav.myPets": "Mis Mascotas",
    "nav.settings": "Configuración",
    "nav.logout": "Cerrar Sesión",
    "registration.title": "Únete a Pet Nova",
    "registration.subtitle": "Registra tu mascota en menos de dos minutos",
    "registration.step1": "Paso 1 · Perfil de Mascota",
    "registration.step2": "Paso 2 · Historial Médico",
    "registration.step3": "Paso 3 · Datos del Propietario",
    "registration.petName": "Nombre de la Mascota",
    "registration.species": "Especie",
    "registration.age": "Edad (años)",
    "registration.breed": "Raza",
    "registration.weight": "Peso",
    "registration.unit": "Unidad",
    "registration.photo": "Foto",
    "registration.uploadPhoto": "Subir Foto",
    "registration.vaccinated": "¿Vacunado?",
    "registration.disability": "¿Condición Especial?",
    "registration.disabilityDetail": "Describe",
    "registration.medicalNotes": "Notas Médicas",
    "registration.ownerName": "Nombre Completo",
    "registration.email": "Email",
    "registration.phone": "Teléfono",
    "registration.city": "Ciudad",
    "registration.next": "Siguiente",
    "registration.back": "Atrás",
    "registration.register": "Registrarse",
    "dashboard.hello": "Hola",
    "dashboard.welcome": "Bienvenido al",
    "dashboard.panel": "panel",
    "dashboard.appointments": "Citas",
    "dashboard.vaccines": "Vacunas",
    "dashboard.alerts": "Alertas Activas",
    "dashboard.city": "Ciudad",
    "dashboard.scheduleAppointment": "Agendar Cita",
    "dashboard.date": "Fecha",
    "dashboard.time": "Hora",
    "dashboard.type": "Tipo",
    "dashboard.veterinarian": "Veterinario",
    "dashboard.notes": "Notas",
    "dashboard.schedule": "Agendar",
    "dashboard.upcomingAppointments": "Próximas Citas",
    "dashboard.noAppointments": "No hay citas agendadas",
    "dashboard.registerVaccine": "Registrar Vacuna",
    "dashboard.vaccineName": "Nombre de la Vacuna",
    "dashboard.applicationDate": "Fecha de Aplicación",
    "dashboard.nextDue": "Próxima Dosis",
    "dashboard.vaccineHistory": "Historial de Vacunas",
    "dashboard.noVaccines": "No hay vacunas registradas",
    "dashboard.createAlert": "Crear Alerta Paw",
    "dashboard.location": "Ubicación",
    "dashboard.description": "Descripción",
    "dashboard.contact": "Tu Contacto",
    "dashboard.publishAlert": "Publicar Alerta",
    "dashboard.communityAlerts": "Alertas de la Comunidad",
    "dashboard.noAlerts": "No hay alertas activas",
    "settings.title": "Configuración",
    "settings.language": "Idioma",
    "settings.profile": "Perfil",
    "settings.privacy": "Privacidad",
    "settings.about": "Acerca de",
    "map.title": "Mapa Pet",
    "map.veterinarians": "Veterinarias",
    "map.parks": "Parques",
    "map.groomers": "Aseo",
    "map.lostPets": "Mascotas Perdidas",
    "toast.success": "Éxito",
    "toast.error": "Error",
    "toast.required": "Por favor completa todos los campos",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = sessionStorage.getItem("petNovaLanguage");
      return (stored as Language) || "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    sessionStorage.setItem("petNovaLanguage", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations["en"]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
