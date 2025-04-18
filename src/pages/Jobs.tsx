// File: src/pages/Jobs.tsx
import React, { useEffect, useState } from 'react';
import { collection, addDoc, onSnapshot, Timestamp, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [crewList, setCrewList] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      const jobList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJobs(jobList);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadCrew = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'crew'));
      const querySnapshot = await getDocs(q);
      const crew = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCrewList(crew);
    };
    loadCrew();
  }, []);

  const getStatusBadge = (status: string, jobId: string) => {
    const base = 'px-2 py-1 rounded text-sm font-semibold cursor-pointer';
    const handleClick = () => {
      if (status === 'Paused') {
        navigate(`/jobs/${jobId}/pause`);
      }
    };

    switch (status) {
      case 'Scheduled': return <span className={`bg-blue-100 text-blue-700 ${base}`}>{status}</span>;
      case 'In Progress': return <span className={`bg-yellow-100 text-yellow-700 ${base}`}>{status}</span>;
      case 'Done': return <span className={`bg-green-100 text-green-700 ${base}`}>{status}</span>;
      case 'Paused': return <span className={`bg-gray-300 text-gray-800 ${base}`} onClick={handleClick}>{status} ⏸️</span>;
      default: return <span className={`bg-gray-100 text-gray-700 ${base}`}>{status}</span>;
    }
  };

  const handleAddJob = async () => {
    const newJob = {
      customer: `New Job #${Date.now().toString().slice(-5)}`,
      date: Timestamp.fromDate(new Date()),
      status: 'Paused',
      assignedTo: '',
    };
    try {
      await addDoc(collection(db, 'jobs'), newJob);
    } catch (err) {
      console.error('Error adding job:', err);
    }
  };

  const handleSave = async () => {
    if (!selectedJob) return;
    const jobRef = doc(db, 'jobs', selectedJob.id);
    const { customer, date, status, assignedTo } = selectedJob;
    try {
      await updateDoc(jobRef, {
        customer,
        date: Timestamp.fromDate(new Date(date)),
        status,
        assignedTo,
      });
      setSelectedJob(null);
    } catch (err) {
      console.error('Error updating job:', err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <button
          onClick={handleAddJob}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          + Add Job
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left">Customer</th>
              <th className="px-4 py-2 border-b text-left">Date</th>
              <th className="px-4 py-2 border-b text-left">Status</th>
              <th className="px-4 py-2 border-b text-left">Crew</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedJob({ ...job, date: job.date?.toDate().toISOString().split('T')[0] })}
              >
                <td className="px-4 py-2">{job.customer}</td>
                <td className="px-4 py-2">{job.date?.toDate().toLocaleDateString()}</td>
                <td className="px-4 py-2">{getStatusBadge(job.status, job.id)}</td>
                <td className="px-4 py-2">{crewList.find(c => c.id === job.assignedTo)?.name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Job</h2>
            <input
              type="text"
              value={selectedJob.customer}
              onChange={e => setSelectedJob({ ...selectedJob, customer: e.target.value })}
              className="w-full p-2 border rounded mb-4"
              placeholder="Customer name"
            />
            <input
              type="date"
              value={selectedJob.date}
              onChange={e => setSelectedJob({ ...selectedJob, date: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            />
            <select
              value={selectedJob.status}
              onChange={e => setSelectedJob({ ...selectedJob, status: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Paused">Paused</option>
              <option value="Done">Done</option>
            </select>
            <select
              value={selectedJob.assignedTo || ''}
              onChange={e => setSelectedJob({ ...selectedJob, assignedTo: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">-- Assign Crew --</option>
              {crewList.map(crew => (
                <option key={crew.id} value={crew.id}>{crew.name}</option>
              ))}
            </select>
            <div className="flex justify-between">
              <button
                onClick={() => setSelectedJob(null)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;