import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { UserData } from "@/App";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { registerAccount, uploadPhoto, setToken } from "@/lib/api";

const BREEDS = {
  dog: ["Labrador Retriever", "Poodle", "Chihuahua", "French Bulldog", "German Shepherd", "Golden Retriever", "Bulldog", "Other"],
  cat: ["Domestic Shorthair", "Siamese", "Persian", "Maine Coon", "Bengal", "Other"],
  bird: ["Parakeet", "Cockatiel", "Canary", "Parrot", "Other"],
  rabbit: ["Holland Lop", "Dutch", "Mini Rex", "Other"],
  guinea_pig: ["American", "Abyssinian", "Other"],
  hamster: ["Syrian", "Dwarf Campbell", "Other"],
  other: ["Other"],
};

interface RegistrationProps {
  setUserData: (data: UserData) => void;
  goToLogin?: () => void;
}

export default function Registration({ setUserData, goToLogin }: RegistrationProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    petName: "",
    species: "",
    age: "",
    breed: "",
    weight: "",
    weightUnit: "kg",
    vaccinated: "",
    disability: "no",
    disabilityDetail: "",
    notes: "",
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerCity: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    if (!formData.petName.trim()) {
      toast.error(t("toast.required"));
      return false;
    }
    if (!formData.species) {
      toast.error(t("toast.required"));
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.ownerName.trim()) {
      toast.error(t("toast.required"));
      return false;
    }
    if (!formData.ownerEmail.trim() || !formData.ownerEmail.includes("@")) {
      toast.error(t("toast.required"));
      return false;
    }
    if (!formData.ownerCity) {
      toast.error(t("toast.required"));
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setSubmitting(true);

    let photoUrl = photo;
    try {
      // 1) Create the real account (hashed password stored server-side,
      // full pet + owner profile stored so login can restore everything)
      const { password: _pw1, confirmPassword: _cpw1, ...profileFields } = formData;
      const { token } = await registerAccount({
        ownerName: formData.ownerName,
        email: formData.ownerEmail,
        password: formData.password,
        profile: { ...profileFields, photo },
      });
      setToken(token);

      // 2) Upload the real photo file to the backend (persisted to disk)
      if (photoFile) {
        try {
          const { url } = await uploadPhoto(photoFile);
          photoUrl = url;
        } catch {
          // Keep the local base64 preview if the upload endpoint isn't reachable
        }
      }
    } catch (err: any) {
      // Backend unreachable or email already registered — still let the
      // person continue with a local-only session so the demo isn't blocked
      if (err?.response?.status === 409) {
        toast.error("Ya existe una cuenta con ese correo");
        setSubmitting(false);
        return;
      }
    }

    const { password: _pw, confirmPassword: _cpw, ...rest } = formData;
    const userData: UserData = {
      ...rest,
      photo: photoUrl,
      createdAt: new Date().toISOString(),
    };

    setUserData(userData);
    setSubmitting(false);
    toast.success(t("toast.success"));
  };

  const breeds = BREEDS[formData.species as keyof typeof BREEDS] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4" style={{ fontFamily: "'Geist', sans-serif" }}>
      <Card className="w-full max-w-2xl shadow-xl border-0">
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="mb-10 text-center">
            <img src="/pet-nova-logo.jpg" alt="Pet Nova" className="h-24 mx-auto mb-6" />
            <p className="text-gray-600 text-lg">{t("registration.subtitle")}</p>
            {goToLogin && (
              <p className="text-sm text-gray-500 mt-2">
                ¿Ya tienes cuenta?{" "}
                <button onClick={goToLogin} className="text-purple-600 font-semibold hover:underline">
                  Inicia sesión
                </button>
              </p>
            )}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    s <= step
                      ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {s < step ? <Check size={20} /> : s}
                </div>
                {s < 3 && <div className={`flex-1 h-1 rounded ${s < step ? "bg-gradient-to-r from-purple-500 to-cyan-500" : "bg-gray-200"}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Pet Profile */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Geist', sans-serif", letterSpacing: '-0.01em' }}>
                  {t("registration.step1")}
                </h2>
                <p className="text-gray-600 text-base">Tell us about your furry friend</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="petName" className="text-sm font-semibold text-gray-700">
                    {t("registration.petName")}
                  </Label>
                  <Input
                    id="petName"
                    placeholder="E.g. Milo, Luna"
                    value={formData.petName}
                    onChange={(e) => handleInputChange("petName", e.target.value)}
                    className="mt-2 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="species" className="text-sm font-semibold text-gray-700">
                      {t("registration.species")}
                    </Label>
                    <Select value={formData.species} onValueChange={(value) => handleInputChange("species", value)}>
                      <SelectTrigger id="species" className="mt-2 border-gray-300">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dog">Dog</SelectItem>
                        <SelectItem value="cat">Cat</SelectItem>
                        <SelectItem value="bird">Bird</SelectItem>
                        <SelectItem value="rabbit">Rabbit</SelectItem>
                        <SelectItem value="guinea_pig">Guinea Pig</SelectItem>
                        <SelectItem value="hamster">Hamster</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="age" className="text-sm font-semibold text-gray-700">
                      {t("registration.age")}
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="E.g. 3"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className="mt-2 border-gray-300"
                      min="0"
                      max="40"
                    />
                  </div>
                </div>

                {formData.species && (
                  <div>
                    <Label htmlFor="breed" className="text-sm font-semibold text-gray-700">
                      {t("registration.breed")}
                    </Label>
                    <Select value={formData.breed} onValueChange={(value) => handleInputChange("breed", value)}>
                      <SelectTrigger id="breed" className="mt-2 border-gray-300">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {breeds.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="weight" className="text-sm font-semibold text-gray-700">
                      {t("registration.weight")}
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="E.g. 8.5"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      className="mt-2 border-gray-300"
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weightUnit" className="text-sm font-semibold text-gray-700">
                      {t("registration.unit")}
                    </Label>
                    <Select value={formData.weightUnit} onValueChange={(value) => handleInputChange("weightUnit", value)}>
                      <SelectTrigger id="weightUnit" className="mt-2 border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="lb">lb</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 block mb-2">{t("registration.photo")}</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center text-3xl overflow-hidden">
                      {photo ? <img src={photo} alt="Pet" className="w-full h-full object-cover" /> : "🐾"}
                    </div>
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <Button type="button" variant="outline" className="w-full cursor-pointer">
                        {t("registration.uploadPhoto")}
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Medical Record */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Geist', sans-serif", letterSpacing: '-0.01em' }}>
                  {t("registration.step2")}
                </h2>
                <p className="text-gray-600 text-base">Important health information</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="vaccinated" className="text-sm font-semibold text-gray-700">
                    {t("registration.vaccinated")}
                  </Label>
                  <Select value={formData.vaccinated} onValueChange={(value) => handleInputChange("vaccinated", value)}>
                    <SelectTrigger id="vaccinated" className="mt-2 border-gray-300">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, up to date</SelectItem>
                      <SelectItem value="partial">Partially vaccinated</SelectItem>
                      <SelectItem value="no">Not vaccinated</SelectItem>
                      <SelectItem value="unsure">Not sure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="disability" className="text-sm font-semibold text-gray-700">
                    {t("registration.disability")}
                  </Label>
                  <Select value={formData.disability} onValueChange={(value) => handleInputChange("disability", value)}>
                    <SelectTrigger id="disability" className="mt-2 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">No</SelectItem>
                      <SelectItem value="yes">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.disability === "yes" && (
                  <div>
                    <Label htmlFor="disabilityDetail" className="text-sm font-semibold text-gray-700">
                      {t("registration.disabilityDetail")}
                    </Label>
                    <Input
                      id="disabilityDetail"
                      placeholder="E.g. blind in one eye, limited mobility"
                      value={formData.disabilityDetail}
                      onChange={(e) => handleInputChange("disabilityDetail", e.target.value)}
                      className="mt-2 border-gray-300"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                    {t("registration.medicalNotes")}
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Optional - Important information"
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="mt-2 border-gray-300"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Owner Details */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Geist', sans-serif", letterSpacing: '-0.01em' }}>
                  {t("registration.step3")}
                </h2>
                <p className="text-gray-600 text-base">Your information</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="ownerName" className="text-sm font-semibold text-gray-700">
                    {t("registration.ownerName")}
                  </Label>
                  <Input
                    id="ownerName"
                    placeholder="Your name"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange("ownerName", e.target.value)}
                    className="mt-2 border-gray-300"
                  />
                </div>

                <div>
                  <Label htmlFor="ownerEmail" className="text-sm font-semibold text-gray-700">
                    {t("registration.email")}
                  </Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    placeholder="you@email.com"
                    value={formData.ownerEmail}
                    onChange={(e) => handleInputChange("ownerEmail", e.target.value)}
                    className="mt-2 border-gray-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ownerPhone" className="text-sm font-semibold text-gray-700">
                      {t("registration.phone")}
                    </Label>
                    <Input
                      id="ownerPhone"
                      placeholder="6000-0000"
                      value={formData.ownerPhone}
                      onChange={(e) => handleInputChange("ownerPhone", e.target.value)}
                      className="mt-2 border-gray-300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ownerCity" className="text-sm font-semibold text-gray-700">
                      {t("registration.city")}
                    </Label>
                    <Select value={formData.ownerCity} onValueChange={(value) => handleInputChange("ownerCity", value)}>
                      <SelectTrigger id="ownerCity" className="mt-2 border-gray-300">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="La Chorrera">La Chorrera</SelectItem>
                        <SelectItem value="Panama City">Panama City</SelectItem>
                        <SelectItem value="San Miguelito">San Miguelito</SelectItem>
                        <SelectItem value="Colón">Colón</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="mt-2 border-gray-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                      Confirmar contraseña
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repite la contraseña"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="mt-2 border-gray-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                {t("registration.back")}
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={() => {
                  if (step === 1 && !validateStep1()) return;
                  setStep(step + 1);
                }}
                className="ml-auto flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white"
              >
                {t("registration.next")}
                <ChevronRight size={18} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="ml-auto flex items-center gap-2 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white disabled:opacity-60"
              >
                <Check size={18} />
                {submitting ? "Creando cuenta..." : t("registration.register")}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
