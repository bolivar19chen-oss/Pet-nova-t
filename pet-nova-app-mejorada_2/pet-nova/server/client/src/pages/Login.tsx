import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { loginAccount, setToken } from "@/lib/api";
import { UserData } from "@/App";

interface LoginProps {
  setUserData: (data: UserData) => void;
  goToRegister: () => void;
}

export default function Login({ setUserData, goToRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.includes("@") || password.length < 1) {
      toast.error("Ingresa un correo y contraseña válidos");
      return;
    }
    setSubmitting(true);
    try {
      const { token, user } = await loginAccount({ email, password });
      setToken(token);
      const profile = (user.profile || {}) as Partial<UserData>;
      setUserData({
        petName: profile.petName || "",
        species: profile.species || "",
        age: profile.age || "",
        breed: profile.breed || "",
        weight: profile.weight || "",
        weightUnit: profile.weightUnit || "kg",
        photo: profile.photo || null,
        vaccinated: profile.vaccinated || "",
        disability: profile.disability || "no",
        disabilityDetail: profile.disabilityDetail || "",
        notes: profile.notes || "",
        ownerName: user.ownerName,
        ownerEmail: user.email,
        ownerPhone: profile.ownerPhone || "",
        ownerCity: profile.ownerCity || "Panama City",
        createdAt: new Date().toISOString(),
      });
      toast.success("¡Bienvenido de nuevo!");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "No se pudo iniciar sesión. ¿Está corriendo el backend?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4" style={{ fontFamily: "'Geist', sans-serif" }}>
      <Card className="w-full max-w-md shadow-xl border-0 p-8 md:p-12">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2" style={{ letterSpacing: "-0.01em" }}>
          Bienvenido de nuevo
        </h1>
        <p className="text-gray-600 mb-6">Inicia sesión en Pet Nova</p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="loginEmail">Correo</Label>
            <Input id="loginEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="mt-2 border-gray-300" />
          </div>
          <div>
            <Label htmlFor="loginPassword">Contraseña</Label>
            <Input id="loginPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-2 border-gray-300" />
          </div>
          <Button
            onClick={handleLogin}
            disabled={submitting}
            className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white disabled:opacity-60"
          >
            {submitting ? "Ingresando..." : "Iniciar sesión"}
          </Button>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          ¿No tienes cuenta?{" "}
          <button onClick={goToRegister} className="text-purple-600 font-semibold hover:underline">
            Regístrate
          </button>
        </p>
      </Card>
    </div>
  );
}
