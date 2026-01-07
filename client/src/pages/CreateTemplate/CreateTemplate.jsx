import React, { useState } from 'react';
import Select from 'react-select';
import { Plus, FilePlus, CheckCircle, Clock, XCircle, MoreHorizontal, Search, MessageCircle } from 'lucide-react';

const categoryOptions = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'utility', label: 'Utility' },
  { value: 'authentication', label: 'Authentication' }
];

const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#f9fafb',
    borderColor: state.isFocused ? '#6366f1' : '#e5e7eb',
    borderRadius: '0.75rem',
    padding: '6px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(99, 102, 241, 0.2)' : 'none',
    '&:hover': { borderColor: '#6366f1' },
    fontSize: '0.875rem'
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#e0e7ff' : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    cursor: 'pointer',
    ':active': {
      backgroundColor: '#6366f1'
    }
  })
};

const CreateTemplate = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: null,
    content: '',
    buttonType: 'none', // none, quick_reply, call_to_action
    buttons: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, category: selectedOption }));
  };

  // React Select Options
  const actionTypeOptions = [
    { value: 'none', label: 'None' },
    { value: 'quick_reply', label: 'Quick Reply' },
    { value: 'call_to_action', label: 'Call to Action' }
  ];

  const buttonTypeOptions = [
    { value: 'url', label: 'Website' },
    { value: 'phone', label: 'Phone' }
  ];

  // Button Handling Logic
  const handleButtonTypeChange = (selectedOption) => {
    const type = selectedOption.value;
    let initialButtons = [];
    if (type === 'quick_reply') {
        initialButtons = [{ text: '' }];
    } else if (type === 'call_to_action') {
        initialButtons = [{ type: 'url', text: '', value: '' }];
    }
    setFormData(prev => ({ ...prev, buttonType: type, buttons: initialButtons }));
  };

  const handleButtonChange = (index, field, value) => {
    const newButtons = [...formData.buttons];
    newButtons[index] = { ...newButtons[index], [field]: value };
    setFormData(prev => ({ ...prev, buttons: newButtons }));
  };

  const addButton = () => {
    if (formData.buttonType === 'quick_reply' && formData.buttons.length < 3) {
        setFormData(prev => ({ ...prev, buttons: [...prev.buttons, { text: '' }] }));
    } else if (formData.buttonType === 'call_to_action' && formData.buttons.length < 2) {
        // Ensure strictly 1 URL and 1 Phone validation if needed, for distinct types
        // For simplicity, just adding another generic CTA slot or specific usually
        const currentTypes = formData.buttons.map(b => b.type);
        const nextType = currentTypes.includes('url') ? 'phone' : 'url';
        setFormData(prev => ({ ...prev, buttons: [...prev.buttons, { type: nextType, text: '', value: '' }] }));
    }
  };

  const removeButton = (index) => {
    const newButtons = formData.buttons.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, buttons: newButtons }));
  };

  // Mock Data for Previous Templates
  const previousTemplates = [
    { id: 101, name: 'Diwali Sale Offer', category: 'Marketing', status: 'approved', lastUpdated: '2 hours ago', language: 'En' },
    { id: 102, name: 'Order Confirmation', category: 'Utility', status: 'approved', lastUpdated: '1 day ago', language: 'En' },
    { id: 103, name: 'OTP Verification', category: 'Authentication', status: 'pending', lastUpdated: '3 days ago', language: 'En' },
    { id: 104, name: 'Winter Collection Promo', category: 'Marketing', status: 'rejected', lastUpdated: '1 week ago', language: 'En' }
  ];

  const getStatusBadge = (status) => {
      switch(status) {
          case 'approved': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>;
          case 'pending': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600"><Clock className="w-3.5 h-3.5" /> Pending</span>;
          case 'rejected': return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
          default: return null;
      }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Create Form */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Create New Template</h2>
                  <p className="text-slate-500 text-sm mt-1">Design your message templates for WhatsApp campaigns.</p>
                </div>
                <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                  Submit for Review
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Template Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Welcome Message" 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-600" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Category</label>
                    <Select 
                      options={categoryOptions}
                      styles={customStyles}
                      onChange={handleSelectChange}
                      placeholder="Select Category..."
                      isSearchable={false}
                    />
                  </div>
                </div>
          
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Message Content</label>
                  <div className="relative">
                    <textarea 
                      rows="6" 
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      placeholder="Type your message here... Use {{1}} for variables." 
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none font-medium text-slate-600"
                    ></textarea>
                    <div className="absolute right-3 bottom-3 flex gap-2">
                      <button className="p-2 hover:bg-gray-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors" title="Add Variable">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">Tips: Keep it concise and use variables for personalization.</p>
                </div>
                
                {/* Media Upload */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-500 shadow-sm group-hover:scale-110 transition-transform">
                    <FilePlus className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Upload Header Media (Optional)</p>
                  <p className="text-xs text-slate-400 mt-1">Image, Video, or Document</p>
                </div>

                {/* Interactive Actions (Buttons) */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-slate-700">Interactive Actions</label>
                        <div className="w-48">
                            <Select 
                                options={actionTypeOptions}
                                styles={customStyles}
                                onChange={handleButtonTypeChange}
                                placeholder="Select Action..."
                                defaultValue={actionTypeOptions[0]}
                                isSearchable={false}
                            />
                        </div>
                    </div>

                    {formData.buttonType !== 'none' && (
                        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            {formData.buttons.map((btn, index) => (
                                <div key={index} className="flex gap-3 items-start animate-fade-in">
                                    {formData.buttonType === 'call_to_action' && (
                                        <div className="w-32">
                                            <Select 
                                                options={buttonTypeOptions}
                                                styles={customStyles}
                                                value={buttonTypeOptions.find(opt => opt.value === btn.type)}
                                                onChange={(option) => handleButtonChange(index, 'type', option.value)}
                                                isSearchable={false}
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <input 
                                            type="text" 
                                            placeholder="Button Text"
                                            value={btn.text}
                                            onChange={(e) => handleButtonChange(index, 'text', e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                                        />
                                        {formData.buttonType === 'call_to_action' && (
                                            <input 
                                                type="text" 
                                                placeholder={btn.type === 'url' ? "https://example.com" : "+1234567890"}
                                                value={btn.value}
                                                onChange={(e) => handleButtonChange(index, 'value', e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-indigo-500"
                                            />
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => removeButton(index)}
                                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            
                            {((formData.buttonType === 'quick_reply' && formData.buttons.length < 3) || 
                              (formData.buttonType === 'call_to_action' && formData.buttons.length < 2)) && (
                                <button 
                                    onClick={addButton}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 px-2 py-1"
                                >
                                    <Plus className="w-4 h-4" /> Add Another Button
                                </button>
                            )}
                        </div>
                    )}
                </div>
              </div>
           </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-1">
            <div className="sticky top-6">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden max-w-xs mx-auto">
                    {/* Phone Header */}
                    <div className="bg-[#075E54] p-4 text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                           <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">Message Preview</p>
                            <p className="text-[10px] opacity-80">WhatsApp Business</p>
                        </div>
                    </div>
                    
                    {/* Phone Body */}
                    <div className="bg-[#e5ddd5] h-[450px] p-4 overflow-y-auto relative bg-opacity-50 flex flex-col items-center">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                        
                        {/* Message Bubble */}
                        <div className="w-full max-w-[90%] self-start animate-fade-in">
                            <div className={`bg-white p-3 rounded-lg shadow-sm text-sm text-slate-800 leading-relaxed break-words relative ${formData.buttons.length > 0 ? 'rounded-b-none border-b border-dashed border-gray-100' : ''}`}>
                                {formData.name && (
                                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide border-b border-gray-100 pb-1">{formData.name}</p>
                                )}
                                {formData.content ? (
                                    <p className="whitespace-pre-wrap">{formData.content}</p>
                                ) : (
                                    <p className="text-slate-400 italic">Your message content will appear here...</p>
                                )}
                                <div className="text-[10px] text-slate-400 text-right mt-1 flex justify-end items-center gap-1">
                                    12:00 PM <span className="text-blue-500">✓✓</span>
                                </div>
                            </div>
                            
                            {/* Buttons Preview */}
                            {formData.buttonType !== 'none' && formData.buttons.length > 0 && (
                                <div className="space-y-[1px]">
                                    {formData.buttons.map((btn, i) => (
                                        <div key={i} className="bg-white p-3 text-center text-blue-500 font-semibold text-sm shadow-sm cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors first:rounded-t-none last:rounded-b-lg flex items-center justify-center gap-2">
                                            {btn.type === 'url' && <span className="text-xs">🔗</span>}
                                            {btn.type === 'phone' && <span className="text-xs">📞</span>}
                                            {btn.text || <span className="text-slate-300 italic">Button</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Phone Footer */}
                    <div className="bg-gray-100 p-3 text-center text-xs text-slate-400 border-t border-gray-200">
                        This is a preview of how your message will look.
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Bottom Section: Previous Templates */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-slate-800">Your Templates</h3>
             <div className="relative">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input type="text" placeholder="Search templates..." className="pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm border-none focus:ring-1 focus:ring-indigo-500 transition-all outline-none" />
             </div>
          </div>

          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="border-b border-gray-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-4 pl-0">Template Name</th>
                      <th className="py-4 px-4">Category</th>
                      <th className="py-4 px-4">Language</th>
                      <th className="py-4 px-4">Last Updated</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                   {previousTemplates.map((template) => (
                      <tr key={template.id} className="group hover:bg-gray-50/50 transition-colors">
                         <td className="py-4 px-4 pl-0">
                            <p className="font-semibold text-slate-700 text-sm">{template.name}</p>
                            <p className="text-xs text-slate-400">ID: {template.id}</p>
                         </td>
                         <td className="py-4 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-slate-600 text-xs font-medium border border-gray-200">
                               {template.category}
                            </span>
                         </td>
                         <td className="py-4 px-4 text-sm text-slate-600">{template.language}</td>
                         <td className="py-4 px-4 text-sm text-slate-500">{template.lastUpdated}</td>
                         <td className="py-4 px-4">
                             {getStatusBadge(template.status)}
                         </td>
                         <td className="py-4 px-4 text-right">
                             <button className="p-2 hover:bg-gray-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                                 <MoreHorizontal className="w-4 h-4" />
                             </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
          
          <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
              <p>Showing 4 of 24 templates</p>
              <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Next</button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default CreateTemplate;
