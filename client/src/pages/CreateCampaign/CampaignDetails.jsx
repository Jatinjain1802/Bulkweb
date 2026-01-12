import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCcw, ArrowLeft, CheckCircle, XCircle, Search } from 'lucide-react';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/campaigns/${id}/logs`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [id]);

  const filteredLogs = logs.filter(l => 
     l.phone_number.includes(search) || (l.contact_name && l.contact_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
                <h2 className="text-xl font-bold text-slate-800">Campaign Logs</h2>
                <p className="text-slate-500 text-sm mt-1">Real-time delivery status for this campaign.</p>
            </div>
        </div>
        <button onClick={fetchLogs} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="mb-6 relative">
             <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
             <input 
                 type="text" 
                 placeholder="Search by phone number or name..." 
                 className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
             />
        </div>

        {loading ? (
            <div className="text-center py-10 text-slate-500">Loading logs...</div>
        ) : filteredLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-500">No logs found for this campaign.</div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th className="px-4 py-3">Phone Number</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Sent At</th>
                            <th className="px-4 py-3">Error Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-900">{log.phone_number}</td>
                                <td className="px-4 py-3">{log.contact_name || '-'}</td>
                                <td className="px-4 py-3">
                                    {log.status === 'sent' ? (
                                        <span className="flex items-center gap-1 text-green-600 font-medium">
                                            <CheckCircle className="w-4 h-4" /> Sent
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-600 font-medium">
                                            <XCircle className="w-4 h-4" /> Failed
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-slate-400">
                                    {new Date(log.created_at).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-red-500 text-xs max-w-xs truncate" title={log.error_details}>
                                    {log.error_details || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default CampaignDetails;
