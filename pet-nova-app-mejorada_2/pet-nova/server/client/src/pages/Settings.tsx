import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Globe } from "lucide-react";
import { useRoute } from "wouter";

interface SettingsProps {
  onBack: () => void;
}

export default function Settings({ onBack }: SettingsProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50" style={{ fontFamily: "'Geist', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent" style={{ letterSpacing: '-0.01em' }}>
            {t("settings.title")}
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-8">
        {/* Language Settings */}
        <Card className="p-6 bg-white border-gray-100 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                <Globe className="text-cyan-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Geist', sans-serif" }}>
                  {t("settings.language")}
                </h3>
                <p className="text-sm text-gray-600">Choose your preferred language</p>
              </div>
            </div>
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger className="w-40 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* About */}
        <Card className="p-6 bg-white border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "'Geist', sans-serif" }}>
            {t("settings.about")}
          </h3>
          <div className="space-y-3 text-gray-600">
            <p>
              <strong>Pet Nova v1.0</strong>
            </p>
            <p>
              Pet Nova is a comprehensive pet care management platform designed to help pet owners keep track of their pets' health, schedule appointments, and connect with the pet community.
            </p>
            <p className="text-sm">
              © 2026 Pet Nova. All rights reserved.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
