// File: src/pages/CrewClock.tsx
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, Timestamp, getDoc, doc, query, where, getDocs } from 'firebase/firestore';

const CrewClock: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [crew, setCrew] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const snap = await getDoc(doc(db, 'users', u.uid));
        const data = snap.data();
        if (data?.role === 'crew-lead') {
          setUser({ uid: u.uid, ...data });
          const q = query(collection(db, 'users'), where('role', '==', 'crew'));
          const qsnap = await getDocs(q);
          setCrew(qsnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      }
    });
    return () => unsub();
  }, []);

  const clock = async (action: 'in' | 'out') => {
    if (!selected) return;
    const payload = {
      crewId: selected,
      leadId: user.uid,
      action,
      timestamp: Timestamp.now(),
    };
    try {
      await addDoc(collection(db, 'timesheets'), payload);
      setStatus(`✅ Clock ${action === 'in' ? 'IN' : 'OUT'} recorded for ${selected}`);
    } catch (err) {
      setStatus('❌ Failed to clock.');
      console.error(err);
    }
  };

  if (!user) return <div className="p-6">Only crew leads can view this.</div>;

  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      <h1 className="text-xl font-bold mb-4">Clock In / Out</h1>
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">-- Select Crew --</option>
        {crew.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <div className="flex gap-4">
        <button
          onClick={() => clock('in')}
          className="flex-1 bg-green-500 text-white p-2 rounded"
        >
          Clock In
        </button>
        <button
          onClick={() => clock('out')}
          className="flex-1 bg-red-500 text-white p-2 rounded"
        >
          Clock Out
        </button>
      </div>
      {status && <p className="mt-4 text-center font-medium">{status}</p>}
    </div>
  );
};

export default CrewClock;
