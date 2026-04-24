import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const WEBHOOK_URL = "PASTE_YOUR_ZAPIER_OR_SUPABASE_WEBHOOK_HERE";

const exercises = [
  "Pull-ups",
  "Push-ups",
  "Single Arm Dumbbell Row",
  "Dumbbell Bench",
  "Dumbbell Split Squat",
  "Pike Push-up",
  "Shoulder Press",
  "Bicep Curls",
  "Dumbbell Skullcrushers",
];

export default function WorkoutTracker() {
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem("logs");
    return saved ? JSON.parse(saved) : [];
  });

  const [entry, setEntry] = useState({
    date: new Date().toISOString().slice(0, 10),
    exercise: "",
    sets: "1",
    reps: "10",
    weight: "",
    notes: "",
  });

  useEffect(() => {
    localStorage.setItem("logs", JSON.stringify(logs));
  }, [logs]);

  const todayEntries = logs.filter(l => l.date === entry.date);

  const sendToSheet = async (data) => {
    if (!WEBHOOK_URL.includes("http")) return;
    try {
      await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.log("Sync failed", e);
    }
  };

  const addEntry = async () => {
    if (!entry.exercise) return;
    if (todayEntries.length >= 3) {
      alert("Max 3 exercises per day");
      return;
    }

    const newEntry = { ...entry };

    setLogs([...logs, newEntry]);

    await sendToSheet(newEntry);

    setEntry({ ...entry, exercise: "", weight: "", notes: "" });
  };

  const getStreak = () => {
    const days = [...new Set(logs.map(l => l.date))].sort().reverse();
    let streak = 0;
    let current = new Date();

    for (let d of days) {
      const date = new Date(d);
      const diff = Math.floor((current - date) / (1000 * 60 * 60 * 24));
      if (diff === streak) streak++;
      else break;
    }
    return streak;
  };

  return (
    <div className="p-4 grid gap-4 max-w-xl mx-auto">
      <Card className="rounded-2xl shadow">
        <CardContent className="p-4 grid gap-3">
          <h1 className="text-xl font-bold">Daily Workout</h1>

          <div className="text-sm">Streak: {getStreak()} days</div>

          <Input
            type="date"
            value={entry.date}
            onChange={e => setEntry({ ...entry, date: e.target.value })}
          />

          <Select onValueChange={val => setEntry({ ...entry, exercise: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Pick exercise" />
            </SelectTrigger>
            <SelectContent>
              {exercises.map(ex => (
                <SelectItem key={ex} value={ex}>{ex}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input value={entry.sets} onChange={e => setEntry({ ...entry, sets: e.target.value })} />
          <Input value={entry.reps} onChange={e => setEntry({ ...entry, reps: e.target.value })} />
          <Input placeholder="Weight" value={entry.weight} onChange={e => setEntry({ ...entry, weight: e.target.value })} />
          <Input placeholder="Notes" value={entry.notes} onChange={e => setEntry({ ...entry, notes: e.target.value })} />

          <Button onClick={addEntry}>Log</Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow">
        <CardContent className="p-4">
          <h2 className="font-semibold mb-2">Today</h2>
          <ul className="text-sm space-y-1">
            {todayEntries.map((l, i) => (
              <li key={i}>
                {l.exercise} ({l.sets}x{l.reps}) @ {l.weight}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
