import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreHorizontal, Clock, CheckCircle, XCircle, Trash2, Eye, MessageCircle } from 'lucide-react';

const TemplateList = ({ templates: propTemplates, loading: propLoading, onRefresh: propOnRefresh }) => {
  const [internalTemplates, setInternalTemplates] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null); // ID of template with active menu

  const isControlled = Array.isArray(propTemplates);
  const templates = isControlled ? propTemplates : internalTemplates;
  const loading = isControlled ? propLoading : internalLoading;

  const fetchTemplates = async () => {
    if (isControlled && propOnRefresh) {
        propOnRefresh();
        return;
    }
    
    setInternalLoading(true);
    try {
        const res = await fetch('http://localhost:5000/api/templates');
        const data = await res.json();
        setInternalTemplates(data);
    } catch (error) {
        console.error("Error fetching templates:", error);
    } finally {
        setInternalLoading(false);
    }
  };

  useEffect(() => {
    if (!isControlled) {
        fetchTemplates();
    }
  }, [isControlled]);

  const onRefresh = () => {
      fetchTemplates();
  };

  const handleDelete = async (e, id) => {
      e.stopPropagation(); // Prevent card click
      if (window.confirm("Are you sure you want to delete this template?")) {
        try {
            const res = await fetch(`http://localhost:5000/api/templates/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                alert("Template deleted successfully");
                onRefresh();
            } else {
                alert("Failed to delete template");
            }
        } catch (error) {
            console.error(error);
            alert("Error deleting template");
        }
      }
      setActiveMenu(null);
  };

  const getStatusBadge = (status) => {
    switch(String(status).toLowerCase()) {
        case 'approved': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>;
        case 'pending': 
        case 'submitted':
        case 'local_pending':
           return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600"><Clock className="w-3.5 h-3.5" /> Pending</span>;
        case 'rejected': 
        case 'failed_meta':
           return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
        default: return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  // Helper to extract components from structure
  const getTemplateComponents = (template) => {
      try {
        let structure = template.structure;
        if (typeof structure === 'string') {
            console.log("Parsing structure string:", structure); // Debug
            structure = JSON.parse(structure);
        }
        
        if (!Array.isArray(structure)) return { body: 'Invalid structure' };

        const header = structure.find(c => c.type === 'HEADER');
        const body = structure.find(c => c.type === 'BODY');
        const footer = structure.find(c => c.type === 'FOOTER');
        
        return {
            header,
            body: body ? body.text : 'No text content',
            footer: footer ? footer.text : null
        };
      } catch (e) {
          console.error("Error parsing components:", e);
          return { body: 'Error parsing content' };
      }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-4">
             <h3 className="text-lg font-bold text-slate-800">Your Templates</h3>
             <button onClick={onRefresh} className="p-2 hover:bg-gray-100 rounded-full text-slate-500 hover:text-indigo-600 transition-colors" title="Refresh Status">
                <Clock className="w-4 h-4" />
             </button>
           </div>
           <div className="relative">
               <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input type="text" placeholder="Search templates..." className="pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm border-none focus:ring-1 focus:ring-indigo-500 transition-all outline-none" />
           </div>
        </div>

        <div className="overflow-x-auto">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {loading ? (
    <p className="col-span-full text-center text-sm text-slate-500">Loading templates...</p>
  ) : !templates || templates.length === 0 ? (
    <p className="col-span-full text-center text-sm text-slate-500">No templates found.</p>
  ) : (
    templates.map((template) => {
      const comps = getTemplateComponents(template);
      return (
      <div
        key={template.id}
        onClick={() => setSelectedTemplate(template)}
        className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3 relative group cursor-pointer"
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-slate-800">{template.name}</h4>
            <div className="flex gap-2 text-xs mt-1">
                 <span className="px-2 py-0.5 bg-gray-50 rounded border border-gray-200 text-slate-500">{template.category}</span>
                 <span className="px-2 py-0.5 bg-gray-50 rounded border border-gray-200 text-slate-500 uppercase">{template.language}</span>
            </div>
          </div>
          {getStatusBadge(template.status)}
        </div>

        <div className="text-sm text-slate-600 bg-gray-50 p-3 rounded-lg line-clamp-3">
          {comps.header?.format === 'TEXT' && <p className="font-bold mb-1">{comps.header.text}</p>}
          <p>{comps.body}</p>
        </div>

        <div className="pt-2 flex justify-between items-center border-t border-gray-50 mt-2">
            <span className="text-xs text-slate-400">
               {new Date(template.created_at).toLocaleDateString()}
            </span>
            <div className="relative">
                <button 
                  onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === template.id ? null : template.id);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>
                {activeMenu === template.id && (
                     <div className="absolute right-0 bottom-full mb-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 animate-fade-in">
                         <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedTemplate(template); setActiveMenu(null); }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-gray-50 flex items-center gap-2"
                         >
                             <Eye className="w-3.5 h-3.5" /> View
                         </button>
                         <button 
                            onClick={(e) => handleDelete(e, template.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                         >
                             <Trash2 className="w-3.5 h-3.5" /> Delete
                         </button>
                     </div>
                )}
            </div>
        </div>
      </div>
    );
    })
  )}
</div>

        </div>
        
        {/* Preview Modal */}
        {selectedTemplate && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTemplate(null)}>
                <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-fade-in-up" onClick={e => e.stopPropagation()}>
                    <button 
                        onClick={() => setSelectedTemplate(null)}
                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                    >
                        <XCircle className="w-6 h-6" />
                    </button>
                    
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-800">{selectedTemplate.name}</h3>
                        <div className="flex gap-2 mt-2">
                           {getStatusBadge(selectedTemplate.status)}
                           <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-mono text-slate-500 uppercase">{selectedTemplate.language}</span>
                           <span className="px-2 py-1 bg-gray-100 rounded-md text-xs font-medium text-slate-500 capitalize">{selectedTemplate.category}</span>
                        </div>
                    </div>

                    <div className="bg-[#e5ddd5] p-6 rounded-xl border border-gray-200 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        <div className="bg-white p-4 rounded-lg shadow-sm text-sm text-slate-800 relative">
                             {/* Parse components for Modal */}
                             {(() => {
                                 const comps = getTemplateComponents(selectedTemplate);
                                 return (
                                     <>
                                         {comps.header && (
                                             <div className="mb-2">
                                                 {comps.header.format === 'TEXT' ? (
                                                     <p className="font-bold text-base">{comps.header.text}</p>
                                                 ) : (
                                                     <div className="bg-gray-100 h-32 rounded flex items-center justify-center text-slate-400 text-xs">
                                                         {comps.header.format} Header
                                                     </div>
                                                 )}
                                             </div>
                                         )}
                                         <p className="whitespace-pre-wrap">{comps.body}</p>
                                         {comps.footer && (
                                             <p className="text-[11px] text-slate-400 mt-2 pt-1 border-t border-gray-50">{comps.footer}</p>
                                         )}
                                     </>
                                 );
                             })()}
                             <div className="text-[10px] text-slate-400 text-right mt-1">12:00 PM</div>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                       <button 
                           onClick={() => handleDelete({ stopPropagation: () => {} }, selectedTemplate.id)}
                           className="text-red-600 text-sm font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                       >
                           <Trash2 className="w-4 h-4" /> Delete Template
                       </button>
                    </div>
                </div>
            </div>
        )}
        
        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
            <p>Showing {templates ? templates.length : 0} templates</p>
            <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
            </div>
        </div>
    </div>
  );
};

export default TemplateList;
