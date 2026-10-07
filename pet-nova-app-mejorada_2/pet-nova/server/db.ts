import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Real, persistent storage on disk (JSON file acting as the database).
// This survives server restarts and is enough for a small/medium app.
// If you outgrow it later, swap `readDB`/`writeDB` for a real client
// (Postgres/Supabase/Mongo) without touching the routes in routes.ts.
const DB_PATH = path.join(__dirname, "data.json");

export interface Appointment {
  id: string;
  petId: string;
  date: string;
  time: string;
  type: string;
  veterinarian: string;
  notes: string;
  createdAt: string;
}

export interface Vaccine {
  id: string;
  petId: string;
  name: string;
  date: string;
  nextDue: string;
  veterinarian: string;
  createdAt: string;
}

export interface LostPetAlert {
  id: string;
  petName: string;
  date: string;
  location: string;
  description: string;
  contact: string;
  city: string;
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  city: string;
  petName?: string;
  text: string;
  emoji: string;
  likes: string[]; // list of user ids/names who liked
  comments: CommunityComment[];
  createdAt: string;
}

export interface TrackingRoute {
  petId: string;
  walkerName: string;
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  startedAt: string; // ISO timestamp, used to compute live progress
  durationSeconds: number;
  live?: { lat: number; lng: number; updatedAt: string } | null; // set once a real device reports a position
}

export interface User {
  id: string;
  ownerName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  // Full pet + owner profile, so a real login can restore the dashboard
  // exactly as it was (species, breed, vaccines notes, etc.)
  profile?: Record<string, unknown>;
}

interface DBShape {
  users: User[];
  appointments: Appointment[];
  vaccines: Vaccine[];
  alerts: LostPetAlert[];
  posts: CommunityPost[];
  trackingRoutes: TrackingRoute[];
}

function defaultDB(): DBShape {
  return { users: [], appointments: [], vaccines: [], alerts: [], posts: [], trackingRoutes: [] };
}

function readDB(): DBShape {
  try {
    if (!fs.existsSync(DB_PATH)) {
      writeDB(defaultDB());
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return { ...defaultDB(), ...JSON.parse(raw) };
  } catch {
    return defaultDB();
  }
}

function writeDB(data: DBShape) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export const db = {
  get: readDB,
  save: writeDB,
};
