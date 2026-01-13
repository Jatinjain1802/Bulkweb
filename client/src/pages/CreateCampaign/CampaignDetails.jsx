import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCcw, ArrowLeft, CheckCircle, XCircle, Search } from 'lucide-react';

const CampaignDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCampaign = async () => {
      try {
          const response = await fetch(`http://localhost:5000/api/campaigns/${id}`);
          if (response.ok) {
              const data = await response.json();
              setCampaign(data);
          }
      } catch (error) {
          console.error("Error fetching campaign details:", error);
      }
  };

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
    fetchCampaign();
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
                <h2 className="text-xl font-bold text-slate-800">Campaign Details</h2>
                <p className="text-slate-500 text-sm mt-1">View insights and real-time delivery status.</p>
            </div>
        </div>
        <button onClick={() => { fetchCampaign(); fetchLogs(); }} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      {campaign && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Delivery Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-600 uppercase font-bold mb-1">Sent</p>
                    <p className="text-2xl font-bold text-blue-700">{campaign.realtime_stats?.sent || 0}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                    <p className="text-xs text-yellow-600 uppercase font-bold mb-1">Delivered</p>
                    <p className="text-2xl font-bold text-yellow-700">{campaign.realtime_stats?.delivered || 0}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-xs text-green-600 uppercase font-bold mb-1">Read</p>
                    <p className="text-2xl font-bold text-green-700">{campaign.realtime_stats?.read || campaign.realtime_stats?.['read'] || 0}</p>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-xs text-red-600 uppercase font-bold mb-1">Failed</p>
                    <p className="text-2xl font-bold text-red-700">{campaign.realtime_stats?.failed || 0}</p>
                </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-4">Template Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Template Name</p>
                    <p className="font-semibold text-slate-800">{campaign.template_name || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Quality Score</p>
                    <div className="flex items-center gap-2">
                         {/* Parse if string, usually object from DB if JSON type */}
                         {(() => {
                             let qs = campaign.template_quality_score;
                             if(typeof qs === 'string') try { qs = JSON.parse(qs); } catch(e){}
                             const score = qs?.score || 'UNKNOWN';
                             const color = score === 'GREEN' ? 'text-green-600' : score === 'YELLOW' ? 'text-yellow-600' : 'text-red-600';
                             return <p className={`font-bold ${color}`}>{score}</p>;
                         })()}
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-800">Message Logs</h3>
             <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                    type="text" 
                    placeholder="Search logs..." 
                    className="pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-indigo-500 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
             </div>
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
                                    {log.status === 'read' ? (
                                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                                            <CheckCircle className="w-4 h-4" /> Read
                                        </span>
                                    ) : log.status === 'delivered' ? (
                                        <span className="flex items-center gap-1 text-yellow-600 font-medium">
                                            <CheckCircle className="w-4 h-4" /> Delivered
                                        </span>
                                    ) : log.status === 'sent' ? (
                                        <span className="flex items-center gap-1 text-green-600 font-medium">
                                            <CheckCircle className="w-4 h-4" /> Sent
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-red-600 font-medium">
                                            <XCircle className="w-4 h-4" /> {log.status || 'Failed'}
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
