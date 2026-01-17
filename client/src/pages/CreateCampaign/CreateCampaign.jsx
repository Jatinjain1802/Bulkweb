import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { Megaphone, User, Upload, FileSpreadsheet, AlertCircle } from 'lucide-react'; // Added icons
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const CreateCampaign = () => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [campaignName, setCampaignName] = useState('');
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduleTime, setScheduleTime] = useState('');

    // File & Data State
    const [contacts, setContacts] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [fileName, setFileName] = useState('');

    // Mapping State
    // mappings: { "1": "Column A", "2": "Column B", "phoneNumber": "Phone Column" }
    const [mappings, setMappings] = useState({});
    const [templateVars, setTemplateVars] = useState([]);
    const [stats, setStats] = useState({ valid: 0, failed_previously: 0, estimated_cost: 0 });

    useEffect(() => {
        if (contacts.length > 0 && mappings.phoneNumber) {
            const checkContacts = async () => {
                try {
                    const res = await fetch('http://localhost:5000/api/campaigns/check-contacts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ contacts, phoneColumn: mappings.phoneNumber })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setStats(data);
                    }
                } catch (e) { console.error(e); }
            };
            const timer = setTimeout(checkContacts, 500);
            return () => clearTimeout(timer);
        }
    }, [contacts, mappings.phoneNumber]);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/templates');
                const data = await response.json();

                // Convert API data to react-select format, keeping full data
                const options = data.map(item => ({
                    value: item.id || item._id,
                    label: item.name,
                    original: item // Store full template object
                }));

                setTemplates(options);
            } catch (error) {
                console.error('Error fetching templates:', error);
            }
        };

        fetchTemplates();
    }, []);


    // Helper to find variables in template body
    const extractVariables = (components) => {
        if (!components) return [];
        // Ensure components is an array (it might be a JSON string if not parsed correctly by fetch, roughly)
        // But fetch(api/templates) usually returns parsed JSON.
        let comps = components;
        if (typeof components === 'string') {
            try { comps = JSON.parse(components); } catch (e) { return []; }
        }

        const body = comps.find(c => c.type === 'BODY');
        if (!body || !body.text) return [];

        const regex = /{{(\d+)}}/g;
        const matches = [...body.text.matchAll(regex)];
        // specific numbers like ['1', '2']
        const vars = [...new Set(matches.map(m => m[1]))].sort((a, b) => a - b);
        return vars;
    };

    const handleTemplateChange = (selected) => {
        setSelectedTemplate(selected);
        if (selected) {
            const vars = extractVariables(selected.original.structure);
            setTemplateVars(vars);
            // Reset mappings but keep phone number if selected
            setMappings(prev => ({ phoneNumber: prev.phoneNumber }));
        } else {
            setTemplateVars([]);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            if (data.length > 0) {
                setContacts(data);
                const keys = Object.keys(data[0]);
                setHeaders(keys);

                // Auto-detect phone column (looks for 'phone', 'mobile')
                const phoneCol = keys.find(k => /phone|mobile|contact/i.test(k));
                if (phoneCol) {
                    setMappings(prev => ({ ...prev, phoneNumber: phoneCol }));
                }
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleLaunch = async () => {
        if (!campaignName) return alert("Please enter a campaign name");
        if (!selectedTemplate) return alert("Please select a template");
        if (contacts.length === 0) return alert("Please upload contacts");
        if (!mappings.phoneNumber) return alert("Please select the Phone Number column");

        for (const v of templateVars) {
            if (!mappings[v]) return alert(`Please map variable {{${v}}}`);
        }

        if (isScheduled && !scheduleTime) return alert("Please select a valid schedule time.");

        try {
            const payload = {
                name: campaignName,
                templateId: selectedTemplate.value,
                contacts: contacts,
                mappings: mappings
            };

            if (isScheduled) {
                payload.scheduledAt = new Date(scheduleTime).toISOString();
            }

            const response = await fetch('http://localhost:5000/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const resData = await response.json();
            if (response.ok) {
                alert("Campaign launched successfully!");
                navigate('/dashboard'); // or wherever
            } else {
                alert("Failed: " + resData.error);
            }
        } catch (error) {
            alert("Error launching campaign");
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Create Campaign</h2>
                    <p className="text-slate-500 text-sm mt-1">Launch a new WhatsApp bulk message campaign.</p>
                </div>
                <button
                    onClick={handleLaunch}
                    disabled={contacts.length === 0 || !campaignName || !selectedTemplate}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg flex items-center gap-2 ${contacts.length > 0 && campaignName && selectedTemplate ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                    <Megaphone className="w-4 h-4" />
                    {isScheduled ? 'Schedule Campaign' : 'Launch Campaign'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-md font-bold text-slate-700 mb-4 border-b border-gray-100 pb-3">Campaign Details</h3>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-600">Campaign Name</label>
                                <input
                                    type="text"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                                    placeholder="e.g. Diwali Offer"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-600">Select Template</label>
                                <Select
                                    options={templates}
                                    value={selectedTemplate}
                                    onChange={handleTemplateChange}
                                    placeholder="Select a template..."
                                    isSearchable={true}
                                />
                            </div>

                            {/* Scheduling Options */}
                            <div className="pt-4 border-t border-gray-100">
                                <label className="flex items-center gap-2 cursor-pointer mb-3">
                                    <input
                                        type="checkbox"
                                        checked={isScheduled}
                                        onChange={(e) => setIsScheduled(e.target.checked)}
                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700">Schedule for later</span>
                                </label>

                                {isScheduled && (
                                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                        <label className="text-sm font-semibold text-slate-600">Schedule Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            value={scheduleTime}
                                            onChange={(e) => setScheduleTime(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                                        />
                                        <p className="text-xs text-slate-400">Campaign will automatically launch at this time.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Audience / File Upload Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-md font-bold text-slate-700 mb-4 border-b border-gray-100 pb-3">Audience</h3>

                        {!fileName ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-slate-50 hover:bg-indigo-50/30 transition-colors relative group">
                                <input
                                    type="file"
                                    accept=".csv, .xlsx, .xls"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <User className="w-10 h-10 mx-auto text-slate-400 group-hover:text-indigo-500 mb-3 transition-colors" />
                                <p className="text-sm text-slate-800 font-medium">Click to Upload Contact List</p>
                                <p className="text-xs text-slate-500 mt-1">Supports CSV & Excel files</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-green-50 p-4 rounded-xl border border-green-100">
                                    <div className="flex items-center gap-3">
                                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-green-800">{fileName}</p>
                                            <p className="text-xs text-green-600">{contacts.length} contacts found</p>
                                        </div>
                                    </div>
                                    <button onClick={() => { setFileName(''); setContacts([]); setHeaders([]); }} className="text-xs text-red-500 underline hover:text-red-700">Remove</button>
                                </div>

                                {/* Mapping Section */}
                                {headers.length > 0 && (
                                    <div className="bg-slate-50 p-4 rounded-xl space-y-4">
                                        <h4 className="text-sm font-bold text-slate-700">Map Columns</h4>

                                        {/* Phone Number Mapping (Required) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                            <label className="text-xs font-semibold text-slate-600">Phone Number Column <span className="text-red-500">*</span></label>
                                            <select
                                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                                                value={mappings.phoneNumber || ''}
                                                onChange={(e) => setMappings({ ...mappings, phoneNumber: e.target.value })}
                                            >
                                                <option value="">Select Column</option>
                                                {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                        </div>

                                        {/* Header Media Mapping */}
                                        {(() => {
                                            if (!selectedTemplate) return null;
                                            let struct = [];
                                            try {
                                                struct = typeof selectedTemplate.original.structure === 'string'
                                                    ? JSON.parse(selectedTemplate.original.structure)
                                                    : selectedTemplate.original.structure;
                                            } catch (e) { }

                                            const header = struct.find(c => c.type === 'HEADER');
                                            if (header && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(header.format)) {
                                                return (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-indigo-50 p-2 rounded-lg border border-indigo-100">
                                                        <label className="text-xs font-semibold text-indigo-700">
                                                            Header {header.format} URL
                                                            <span className="block text-[10px] text-indigo-500 font-normal">Map a column containing the media link</span>
                                                        </label>
                                                        <select
                                                            className="px-3 py-2 rounded-lg border border-indigo-200 text-sm focus:outline-none focus:border-indigo-500"
                                                            value={mappings['header_url'] || ''}
                                                            onChange={(e) => setMappings({ ...mappings, 'header_url': e.target.value })}
                                                        >
                                                            <option value="">Select Column (Optional)</option>
                                                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                                        </select>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}

                                        {/* Dynamic Template Mappings */}
                                        {templateVars.map(v => (
                                            <div key={v} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                                <label className="text-xs font-semibold text-slate-600">Variable {`{{${v}}}`}</label>
                                                <select
                                                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                                                    value={mappings[v] || ''}
                                                    onChange={(e) => setMappings({ ...mappings, [v]: e.target.value })}
                                                >
                                                    <option value="">Select Column</option>
                                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Preview Table */}
                                {contacts.length > 0 && (
                                    <div className="overflow-x-auto">
                                        <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase">Data Preview (First 5 Rows)</h4>
                                        <table className="w-full text-xs text-left text-slate-600">
                                            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                                                <tr>
                                                    {headers.map(h => <th key={h} className="px-3 py-2 rounded-t-lg">{h}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {contacts.slice(0, 5).map((row, i) => (
                                                    <tr key={i} className="bg-white border-b border-slate-100 hover:bg-slate-50">
                                                        {headers.map(h => <td key={h} className="px-3 py-2">{row[h]}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Helper Sidebar */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">


                    <h3 className="text-md font-bold text-slate-700 mb-4">Summary</h3>
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Selected Template</span>
                            <span className="font-medium text-slate-800">{selectedTemplate ? selectedTemplate.label : '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Total Uploaded</span>
                            <span className="font-medium text-slate-800">{contacts.length}</span>
                        </div>
                        {stats.failed_previously > 0 && (
                            <div className="flex justify-between text-sm text-red-600">
                                <span>Failed Previously</span>
                                <span className="font-medium">-{stats.failed_previously}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm border-t border-dashed pt-2">
                            <span className="text-slate-700 font-bold">Valid Recipients</span>
                            <span className="font-bold text-indigo-600">{stats.valid > 0 ? stats.valid : contacts.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Approx Cost</span>
                            <span className="font-medium text-slate-800">₹{stats.estimated_cost}</span>
                        </div>
                    </div>

                    <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl text-xs leading-relaxed flex gap-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <strong>Tips:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                <li>Ensure phone numbers include country code (e.g., 919876543210).</li>
                                <li>Map all variables found in the template to columns in your file.</li>
                                <li>Campaigns are processed in the background.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Campaigns Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Campaigns</h3>
                <RecentCampaignsList />
            </div>
        </div>
    );
}

const RecentCampaignsList = () => {
    const [campaigns, setCampaigns] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/campaigns');
                if (res.ok) {
                    const data = await res.json();
                    setCampaigns(data);
                }
            } catch (e) { console.error(e); }
        };
        fetchCampaigns();
    }, []);

    if (campaigns.length === 0) return <p className="text-sm text-slate-500">No campaigns found.</p>;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th className="px-4 py-3">Campaign Name</th>
                        <th className="px-4 py-3">Template</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Sent</th>
                        <th className="px-4 py-3">Failed</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {campaigns.map(c => (
                        <tr key={c.id} className="bg-white border-b hover:bg-slate-50 transition-colors group">
                            <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                            <td className="px-4 py-3">{c.template_name || '-'}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${c.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        c.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {c.status}
                                </span>
                            </td>
                            <td className="px-4 py-3">{c.real_sent_count || 0}</td>
                            <td className="px-4 py-3 text-green-600 font-semibold">{c.real_delivered_count || 0}</td>
                            <td className="px-4 py-3 text-red-600">{c.real_failed_count || 0}</td>
                            <td className="px-4 py-3 text-slate-400 text-xs">
                                {new Date(c.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                                <button
                                    onClick={() => navigate(`/dashboard/campaigns/${c.id}`)}
                                    className="text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    View Report
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CreateCampaign;
