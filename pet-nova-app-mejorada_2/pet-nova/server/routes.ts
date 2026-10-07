import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import { db, TrackingRoute } from "./db";
import { hashPassword, verifyPassword, signToken, attachUser, AuthedRequest } from "./auth";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => cb(null, `${nanoid()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

export const apiRouter = Router();
apiRouter.use(attachUser);

// ---------- Auth ----------
apiRouter.post("/auth/register", async (req, res) => {
  const { ownerName, email, password, profile } = req.body;
  if (!ownerName || !email || !password) return res.status(400).json({ error: "Faltan campos" });
  const data = db.get();
  if (data.users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: "Ya existe una cuenta con ese correo" });
  }
  const user = {
    id: nanoid(),
    ownerName,
    email,
    passwordHash: await hashPassword(password),
    profile: profile || {},
    createdAt: new Date().toISOString(),
  };
  data.users.push(user);
  db.save(data);
  const token = signToken(user.id);
  res.status(201).json({ token, user: { id: user.id, ownerName: user.ownerName, email: user.email, profile: user.profile } });
});

apiRouter.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db.get().users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase());
  if (!user || !(await verifyPassword(password || "", user.passwordHash))) {
    return res.status(401).json({ error: "Correo o contraseña incorrectos" });
  }
  const token = signToken(user.id);
  res.json({ token, user: { id: user.id, ownerName: user.ownerName, email: user.email, profile: user.profile } });
});

apiRouter.get("/auth/me", (req: AuthedRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: "No autenticado" });
  const user = db.get().users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
  res.json({ id: user.id, ownerName: user.ownerName, email: user.email, profile: user.profile });
});

// ---------- Photo upload (real files persisted to disk) ----------
apiRouter.post("/upload", upload.single("photo"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No se recibió archivo" });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

// ---------- Appointments ----------
apiRouter.get("/appointments", (_req, res) => {
  res.json(db.get().appointments);
});

apiRouter.post("/appointments", (req, res) => {
  const data = db.get();
  const appointment = { id: nanoid(), createdAt: new Date().toISOString(), ...req.body };
  data.appointments.push(appointment);
  db.save(data);
  res.status(201).json(appointment);
});

apiRouter.delete("/appointments/:id", (req, res) => {
  const data = db.get();
  data.appointments = data.appointments.filter((a) => a.id !== req.params.id);
  db.save(data);
  res.status(204).end();
});

// ---------- Vaccines ----------
apiRouter.get("/vaccines", (_req, res) => {
  res.json(db.get().vaccines);
});

apiRouter.post("/vaccines", (req, res) => {
  const data = db.get();
  const vaccine = { id: nanoid(), createdAt: new Date().toISOString(), ...req.body };
  data.vaccines.push(vaccine);
  db.save(data);
  res.status(201).json(vaccine);
});

apiRouter.delete("/vaccines/:id", (req, res) => {
  const data = db.get();
  data.vaccines = data.vaccines.filter((v) => v.id !== req.params.id);
  db.save(data);
  res.status(204).end();
});

// ---------- Lost pet alerts ----------
apiRouter.get("/alerts", (_req, res) => {
  res.json(db.get().alerts);
});

apiRouter.post("/alerts", (req, res) => {
  const data = db.get();
  const alert = { id: nanoid(), createdAt: new Date().toISOString(), ...req.body };
  data.alerts.push(alert);
  db.save(data);
  res.status(201).json(alert);
});

// ---------- Community feed ----------
apiRouter.get("/community/posts", (_req, res) => {
  const posts = [...db.get().posts].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  res.json(posts);
});

apiRouter.post("/community/posts", (req, res) => {
  const data = db.get();
  const post = {
    id: nanoid(),
    createdAt: new Date().toISOString(),
    likes: [],
    comments: [],
    ...req.body,
  };
  data.posts.push(post);
  db.save(data);
  res.status(201).json(post);
});

apiRouter.post("/community/posts/:id/like", (req, res) => {
  const data = db.get();
  const post = data.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "not found" });
  const user = req.body.user || "anon";
  post.likes = post.likes.includes(user) ? post.likes.filter((u) => u !== user) : [...post.likes, user];
  db.save(data);
  res.json(post);
});

apiRouter.post("/community/posts/:id/comments", (req, res) => {
  const data = db.get();
  const post = data.posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "not found" });
  const comment = { id: nanoid(), createdAt: new Date().toISOString(), author: req.body.author, text: req.body.text };
  post.comments.push(comment);
  db.save(data);
  res.status(201).json(post);
});

// ---------- Pet Map: live "buddy on the way" tracking ----------
// No physical GPS device is attached yet, so position is computed live
// on the server from elapsed time along a start->end route. Swap the
// math below for real device coordinates once a mobile GPS feed exists.
apiRouter.post("/tracking/start", (req, res) => {
  const data = db.get();
  const route: TrackingRoute = {
    petId: req.body.petId,
    walkerName: req.body.walkerName || "Paseador Pet Nova",
    start: req.body.start,
    end: req.body.end,
    startedAt: new Date().toISOString(),
    durationSeconds: req.body.durationSeconds || 240,
    live: null,
  };
  data.trackingRoutes = data.trackingRoutes.filter((r) => r.petId !== route.petId);
  data.trackingRoutes.push(route);
  db.save(data);
  res.status(201).json(route);
});

// Real GPS devices/apps call this with the actual coordinates. Once a
// "live" reading exists for a pet, GET /tracking/:petId returns it
// instead of the simulated position — no other change needed.
apiRouter.post("/tracking/:petId/update", (req, res) => {
  const { lat, lng } = req.body;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return res.status(400).json({ error: "lat/lng numéricos requeridos" });
  }
  const data = db.get();
  const route = data.trackingRoutes.find((r) => r.petId === req.params.petId);
  if (!route) return res.status(404).json({ error: "no active route — llama /tracking/start primero" });
  route.live = { lat, lng, updatedAt: new Date().toISOString() };
  db.save(data);
  res.json(route);
});

apiRouter.get("/tracking/:petId", (req, res) => {
  const route = db.get().trackingRoutes.find((r) => r.petId === req.params.petId);
  if (!route) return res.status(404).json({ error: "no active route" });

  if (route.live) {
    return res.json({
      petId: route.petId,
      walkerName: route.walkerName,
      lat: route.live.lat,
      lng: route.live.lng,
      progress: null,
      etaSeconds: null,
      arrived: false,
      source: "live-gps",
    });
  }

  const elapsedSec = (Date.now() - new Date(route.startedAt).getTime()) / 1000;
  const progress = Math.min(1, Math.max(0, elapsedSec / route.durationSeconds));

  const lat = route.start.lat + (route.end.lat - route.start.lat) * progress;
  const lng = route.start.lng + (route.end.lng - route.start.lng) * progress;
  const etaSeconds = Math.max(0, Math.round(route.durationSeconds - elapsedSec));

  res.json({
    petId: route.petId,
    walkerName: route.walkerName,
    lat,
    lng,
    progress,
    etaSeconds,
    arrived: progress >= 1,
    source: "simulated",
  });
});
