import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const EXERCISES = [
  "Pull-ups",
  "Push-ups",
  "Single arm dumbbell row",
  "Dumbbell bench",
  "Dumbbell split squat",
  "Pike push-up",
  "Shoulder press",
  "Bicep curls",
  "Dumbbell skullcrushers",
];

const BODYWEIGHT = new Set(["Pull-ups", "Push-ups", "Pike push-up"]);
const STORAGE_KEY = "weekly-workout-entries";

function Icon({ name, className = "h-5 w-5" }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 };
  const icons = {
    plus: <svg {...common}><path d="M12 5v14M5 12h14"/></svg>,
    trash: <svg {...common}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>,
    check: <svg {...common}><path d="M20 6L9 17l-5-5"/></svg>,
  };
  return icons[name] || null;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function makeId() {
  return `entry-${Date.now()}-${Math.random()}`;
}

function getWeekRange(dateString) {
  const d = new Date(dateString);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: monday.toISOString().slice(0,10), end: sunday.toISOString().slice(0,10)};
}

export default function App() {
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"));

  const [slots, setSlots] = useState(
    Array.from({length:3}).map(()=>({
      date: todayISO(),
      exercise: EXERCISES[0],
      sets:1,
      reps:20,
      weight:"Bodyweight"
    }))
  );

  useEffect(()=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  },[entries]);

  function updateSlot(i, field, value){
    setSlots(s=>{
      const copy=[...s];
      copy[i]={...copy[i],[field]:value};
      if(field==="exercise"){
        copy[i].reps = BODYWEIGHT.has(value)?20:10;
        copy[i].weight = BODYWEIGHT.has(value)?"Bodyweight":"";
      }
      return copy;
    });
  }

  function saveAll(){
    const newEntries = slots.map(s=>(
      {...s, id:makeId()}
    ));
    setEntries(e=>[...newEntries,...e]);
  }

  const week = getWeekRange(slots[0].date);
  const weekEntries = entries.filter(e=>e.date>=week.start && e.date<=week.end);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Super Simple Workout Logger</h1>

      <Card>
        <CardContent className="p-4 space-y-4">
          {slots.map((slot,i)=>(
            <div key={i} className="grid grid-cols-5 gap-2">
              <input type="date" value={slot.date} onChange={e=>updateSlot(i,"date",e.target.value)} className="border p-2"/>
              <select value={slot.exercise} onChange={e=>updateSlot(i,"exercise",e.target.value)} className="border p-2">
                {EXERCISES.map(e=><option key={e}>{e}</option>)}
              </select>
              <select value={slot.sets} onChange={e=>updateSlot(i,"sets",e.target.value)} className="border p-2">
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
              <input type="number" value={slot.reps} onChange={e=>updateSlot(i,"reps",e.target.value)} className="border p-2"/>
              <input value={slot.weight} onChange={e=>updateSlot(i,"weight",e.target.value)} className="border p-2" placeholder="weight"/>
            </div>
          ))}

          <Button onClick={saveAll} className="w-full">
            <Icon name="plus"/> Save All
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="font-bold">This Week</h2>
          {weekEntries.map(e=>(
            <div key={e.id} className="flex justify-between border p-2">
              <span>{e.date} - {e.exercise} ({e.sets}x{e.reps})</span>
              <button onClick={()=>setEntries(en=>en.filter(x=>x.id!==e.id))}><Icon name="trash"/></button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
