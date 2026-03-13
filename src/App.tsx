import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

interface Snapshot {
  date: string;
  immobilier: number;
  comptes: number;
  epargne_libre: number;
  epargne_bloquee: number;
  bourse: number;
  crypto: number;
  autres: number;
  dettes: number;
}

function total(s: Snapshot) {
  return s.immobilier + s.comptes + s.epargne_libre + s.epargne_bloquee + s.bourse + s.crypto + s.autres - s.dettes;
}

export default function App() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [latest, setLatest] = useState<Snapshot | null>(null);

  useEffect(() => {
    axios.get(`${API}/api/patrimoine/historique`).then(r => setSnapshots(r.data));
    axios.get(`${API}/api/patrimoine/snapshot/latest`).then(r => setLatest(r.data));
  }, []);

  const data = snapshots.map(s => ({ ...s, total: total(s) }));

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1>Suivi Patrimoine</h1>

      {latest && (
        <div style={{ display: "flex", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          {["immobilier","comptes","epargne_libre","epargne_bloquee","bourse","crypto","autres","dettes"].map(k => (
            <div key={k} style={{ padding: 16, background: "#f5f5f5", borderRadius: 8, minWidth: 120 }}>
              <div style={{ fontSize: 12, color: "#888" }}>{k}</div>
              <div style={{ fontSize: 20, fontWeight: "bold" }}>
                {(latest[k as keyof Snapshot] as number).toLocaleString("fr-FR")} €
              </div>
            </div>
          ))}
          <div style={{ padding: 16, background: "#e8f5e9", borderRadius: 8, minWidth: 120 }}>
            <div style={{ fontSize: 12, color: "#888" }}>TOTAL</div>
            <div style={{ fontSize: 20, fontWeight: "bold" }}>{total(latest).toLocaleString("fr-FR")} €</div>
          </div>
        </div>
      )}

      <h2>Évolution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(v: number) => v.toLocaleString("fr-FR") + " €"} />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#2196f3" name="Total" dot={false} />
          <Line type="monotone" dataKey="immobilier" stroke="#4caf50" name="Immobilier" dot={false} />
          <Line type="monotone" dataKey="bourse" stroke="#ff9800" name="Bourse" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
