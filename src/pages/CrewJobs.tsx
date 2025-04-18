// File: src/pages/CrewJobs.tsx
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const CrewJobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCrew, setIsCrew] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        if (userData?.role === 'crew') {
          setUserId(user.uid);
          setIsCrew(true);
        } else {
          navigate('/');
        }
      }
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    const q = query(collection(db, 'jobs'), where('assignedTo', '==', userId));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(list);
      setLoading(false);
    });
    return () => unsub();
  }, [userId]);

  const updateStatus = async (id: string, newStatus: string) => {
    const jobRef = doc(db, 'jobs', id);
    try {
      await updateDoc(jobRef, { status: newStatus });
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  if (!isCrew) return null;

  return (
    <div className="p-4 max-w-md mx-auto pb-20">
      <h1 className="text-xl font-bold mb-4">My Assigned Jobs</h1>
      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs assigned.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job.id} className="p-4 bg-white rounded shadow border">
              <h2 className="text-lg font-semibold">{job.customer}</h2>
              <p className="text-sm text-gray-500">{job.date?.toDate().toLocaleDateString()}</p>
              <p className="mt-2 font-medium mb-2">Status: <span className="capitalize">{job.status}</span></p>
              {job.status !== 'In Progress' && (
                <button
                  onClick={() => updateStatus(job.id, 'In Progress')}
                  className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                >
                  Start Job
                </button>
              )}
              {job.status === 'In Progress' && (
                <button
                  onClick={() => updateStatus(job.id, 'Done')}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Complete Job
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CrewJobs;
