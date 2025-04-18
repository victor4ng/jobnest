// File: src/pages/CrewTimesheetHistory.tsx
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import { saveAs } from 'file-saver';

dayjs.extend(duration);
dayjs.extend(utc);

const CrewTimesheetHistory: React.FC = () => {
  const [crew, setCrew] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [entries, setEntries] = useState<any[]>([]);
  const [weeklyHours, setWeeklyHours] = useState<number>(0);
  const [range, setRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const loadCrew = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'crew'));
      const snap = await getDocs(q);
      setCrew(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    loadCrew();
  }, []);

  useEffect(() => {
    const loadEntries = async () => {
      if (!selected) return;
      const startDate = dayjs().startOf(range).toDate();
      const q = query(
        collection(db, 'timesheets'),
        where('crewId', '==', selected),
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        orderBy('timestamp', 'asc')
      );
      const snap = await getDocs(q);
      const data = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
      setEntries(data);

      let total = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i].action === 'in' && data[i + 1]?.action === 'out') {
          const start = data[i].timestamp.toDate();
          const end = data[i + 1].timestamp.toDate();
          const diff = (end.getTime() - start.getTime()) / 3600000; // hours
          total += diff;
          i++; // skip next out entry
        }
      }
      setWeeklyHours(total);
    };
    loadEntries();
  }, [selected, range]);

  const exportCSV = () => {
    if (entries.length === 0) return;
    const header = 'Action,Timestamp,GPS Latitude,GPS Longitude\n';
    const rows = entries.map((e) => {
      const time = e.timestamp.toDate().toLocaleString();
      const lat = e.location?.lat ?? '';
      const lng = e.location?.lng ?? '';
      return `${e.action.toUpperCase()},${time},${lat},${lng}`;
    });
    const blob = new Blob([header + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `timesheet_${selected}_${range}.csv`);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Crew Timesheet History</h1>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      >
        <option value="">-- Select Crew --</option>
        {crew.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <div className="flex justify-between items-center mb-4">
        <div>
          <label className="mr-2">View:</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as 'week' | 'month')}
            className="p-1 border rounded"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        <button
          onClick={exportCSV}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          Export CSV
        </button>
      </div>

      {selected && (
        <>
          <h2 className="text-lg font-semibold mb-2">Total Hours: {weeklyHours.toFixed(2)} hrs</h2>
          <div className="space-y-2">
            {entries.map((entry, i) => (
              <div key={entry.id} className="border p-2 rounded bg-white shadow-sm">
                <p className="text-sm">
                  [{entry.action.toUpperCase()}] — {entry.timestamp.toDate().toLocaleString()}
                </p>
                {entry.location && (
                  <p className="text-xs text-gray-500">GPS: {entry.location.lat}, {entry.location.lng}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CrewTimesheetHistory;