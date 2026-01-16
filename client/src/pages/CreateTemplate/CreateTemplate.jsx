import React, { useState } from 'react';
import Select from 'react-select';
import { Plus, FilePlus, CheckCircle, Clock, XCircle, MoreHorizontal, Search, MessageCircle } from 'lucide-react';
import TemplateList from './TemplateList';
import { Toaster } from "react-hot-toast";
import { showSuccessToast, showErrorToast } from "../../utils/customToast";
import VaataLogo from '../../assets/img/Vaata-logo.png';


const categoryOptions = [
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'UTILITY', label: 'Utility' },
  { value: 'AUTHENTICATION', label: 'Authentication' }
];

const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#f9fafb',
    borderColor: state.isFocused ? '#ff6900' : '#e5e7eb',
    borderRadius: '0.75rem',
    padding: '6px',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(255, 105, 0, 0.2)' : 'none',
    '&:hover': { borderColor: '#ff6900' },
    fontSize: '0.875rem'
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#ff6900' : state.isFocused ? '#fff7ed' : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    cursor: 'pointer',
    ':active': {
      backgroundColor: '#ff6900'
    }
  })
};

const CreateTemplate = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: null,
    content: '',
    headerType: 'none', // none, text, media
    headerText: '',
    headerMedia: null,
    footerText: '',
    buttonType: 'none', // none, quick_reply, call_to_action
    buttons: [],
    variableExamples: {}
  });

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef(null);
  const [errors, setErrors] = useState({});


  React.useEffect(() => {
    fetchTemplates();
  }, []);

  const extractVariables = (text) => {
    const matches = text?.match(/{{\d+}}/g) || [];
    return [...new Set(matches.map(m => m.match(/\d+/)[0]))].sort((a, b) => a - b);
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/templates');
      const data = await res.json();
      setTemplates(data);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, category: selectedOption }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, headerMedia: e.target.files[0] }));
    }
  };
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Message content is required";
    }

    // Variable example validation
    const foundVars = extractVariables(formData.content);
    const missingExamples = foundVars.filter(v => !formData.variableExamples[v]);

    if (missingExamples.length > 0) {
      newErrors.variableExamples = `Please provide examples for ${missingExamples
        .map(v => `{{${v}}}`)
        .join(", ")}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async () => {
    // Step 1: Frontend validation
    if (!validateForm()) return;

    setLoading(true);

    try {
      const data = new FormData();

      // Required fields
      data.append('name', formData.name.trim());
      data.append('content', formData.content.trim());
      data.append('language', 'en_US');

      // Category
      if (formData.category) {
        data.append('category', JSON.stringify(formData.category));
      }

      // Header
      data.append('headerType', formData.headerType);

      if (formData.headerType === 'text') {
        data.append('headerText', formData.headerText.trim());
      }

      if (formData.headerType === 'media' && formData.headerMedia) {
        data.append('headerMedia', formData.headerMedia);
      }

      // Footer
      data.append('footerText', formData.footerText.trim());

      // Buttons
      data.append('buttonType', formData.buttonType);
      data.append('buttons', JSON.stringify(formData.buttons || []));

      // Variable examples
      data.append(
        'variableExamples',
        JSON.stringify(formData.variableExamples || {})
      );

      // API Call
      const res = await fetch('http://localhost:5000/api/templates', {
        method: 'POST',
        body: data
      });

      const result = await res.json();

      if (!res.ok) {
        // backend error ko generic form error me dikhao
        showErrorToast(result.message || "Failed to create template");

        return;
      }

      // ✅ Success
      showSuccessToast("Template created successfully!");

      // Reset form
      setFormData({
        name: '',
        category: null,
        content: '',
        headerType: 'none',
        headerText: '',
        headerMedia: null,
        footerText: '',
        buttonType: 'none',
        buttons: [],
        variableExamples: {}
      });

      setErrors({});
      fetchTemplates();

    } catch (error) {
      console.error('Submission error:', error);
      showErrorToast("Something went wrong. Please try again.");

    } finally {
      setLoading(false);
    }
  };


  // React Select Options
  const headerTypeOptions = [
    { value: 'none', label: 'None' },
    { value: 'text', label: 'Text' },
    { value: 'media', label: 'Image/Video/Doc' }
  ];

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



  const getStatusBadge = (status) => {
    switch (String(status).toLowerCase()) {
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

  const addVariable = () => {
    const currentContent = formData.content || '';
    // Find all {{number}} patterns
    const matches = currentContent.match(/{{\d+}}/g) || [];
    // Extract numbers, map to integers
    const numbers = matches.map(m => parseInt(m.match(/\d+/)[0]));
    // Find max, default to 0
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

    setFormData(prev => ({
      ...prev,
      content: prev.content + ` {{${nextNum}}} `
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <Toaster position="top-right" />
      {/* ===== META APPROVAL RULES : FULL WIDTH ===== */}
      <div
        className="rounded-lg p-6 border border-gray-300"
        style={{
          backgroundColor: "oklch(98% 0.02 73.6 / 0.2)"
        }}
      >
        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-slate-800" />
          Meta Approval Rules
        </h3>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-black">
          <li className="flex gap-2">
            <span className="font-bold text-slate-700">•</span>
            <span>
              <b className="text-slate-700">Variables:</b> Must be sequential
              (<code className="mx-1 font-semibold text-slate-700">{'{{1}}'}</code>,
              <code className="mx-1 font-semibold text-slate-700">{'{{2}}'}</code>)
            </span>
          </li>

          <li className="flex gap-2">
            <span className="font-bold text-slate-700">•</span>
            <span>
              <b className="text-slate-700">Clarity:</b> Message must not be vague.
            </span>
          </li>

          <li className="flex gap-2">
            <span className="font-bold text-slate-700">•</span>
            <span>
              <b className="text-slate-700">Format:</b> Grammar & spelling must be correct.
            </span>
          </li>

          <li className="flex gap-2">
            <span className="font-bold text-slate-700">•</span>
            <span>
              <b className="text-slate-700">Content:</b> No abusive, threatening or scam content.
            </span>
          </li>

          <li className="flex gap-2 md:col-span-2">
            <span className="font-bold text-slate-700">•</span>
            <span>
              <b className="text-slate-700">Buttons:</b> URLs must be valid & phone numbers must include country code.
            </span>
          </li>
        </ul>

        <div className="mt-5 pt-4 border-t border-gray-300 flex justify-start">

          <a
            href="https://developers.facebook.com/docs/whatsapp/message-templates/guidelines"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-slate-600 hover:text-[#ff6900] flex items-center gap-1"
          >
            Read Official Guidelines <span>→</span>
          </a>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Create Form */}
        {/* ===== LEFT : FORM ===== */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-8">

            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Create New Template
            </h2>

            {/* ===== FORM GRID (2 COLUMN) ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  Template Name <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => {
                    handleInputChange(e);
                    setErrors(prev => ({ ...prev, name: "" }));
                  }}
                  placeholder="Enter full name"
                  className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none"
                />
                {/* 🔴 SIMPLE warning */}
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    Template Name is required
                  </p>
                )}
              </div>
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  Category <span className="text-red-500">*</span>
                </label>

                <Select
                  name="category"
                  options={categoryOptions}
                  value={formData.category}
                  onChange={(option) => {
                    handleSelectChange(option);
                    setErrors(prev => ({ ...prev, category: "" }));
                  }}
                  placeholder="Select category"
                  isSearchable
                />
                {errors.category && (
                  <p className="mt-1 text-xs text-red-500">
                    Category is required
                  </p>
                )}
              </div>

              {/* Header Type */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  Header Type
                </label>

                <Select
                  options={headerTypeOptions}
                  value={headerTypeOptions.find(
                    opt => opt.value === formData.headerType
                  )}
                  onChange={(selectedOption) =>
                    setFormData(prev => ({
                      ...prev,
                      headerType: selectedOption?.value || "none"
                    }))
                  }
                  placeholder="Select header type"
                  isSearchable={false}
                />
              </div>


              {/* Header Text */}
              {formData.headerType === "text" && (
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-3">
                    Header Text
                  </label>

                  <input
                    type="text"
                    name="headerText"
                    value={formData.headerText}
                    onChange={handleInputChange}
                    placeholder="Enter header text"
                    className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              )}


              {/* Header Media */}
              {formData.headerType === "media" && (
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-3">
                    Header Media
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*,application/pdf"
                    className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none"
                  />

                  {formData.headerMedia && (
                    <p className="text-xs text-gray-500 mt-1">
                      Selected: {formData.headerMedia.name}
                    </p>
                  )}
                </div>
              )}


              {/* Message Content */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  Message Content <span className="text-red-500">*</span>
                </label>

                <textarea
                  rows="3"
                  name="content"
                  value={formData.content}
                  onChange={(e) => {
                    handleInputChange(e);
                    setErrors(prev => ({ ...prev, content: "" }));
                  }}
                  placeholder="Enter message content"
                  className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm resize-none focus:outline-none"
                />
                {errors.content && (
                  <p className="mt-1 mb-1 text-xs text-red-500">
                    Message content is required
                  </p>
                )}

                <button
                  type="button"
                  onClick={addVariable}
                  className="mt-1 px-4 py-2 text-white font-semibold text-sm rounded bg-[#e87722] hover:bg-slate-700 transition-colors"

                >
                  + Add Variable
                </button>

              </div>

              {/* Variable Examples */}
              {extractVariables(formData.content).length > 0 && (
                <div className="md:col-span-2 bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-800 mb-2">
                    Variable Examples
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {extractVariables(formData.content).map(v => (
                      <input
                        key={v}
                        type="text"
                        placeholder={`Example for {{${v}}}`}
                        value={formData.variableExamples?.[v] || ""}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            variableExamples: {
                              ...prev.variableExamples,
                              [v]: e.target.value
                            }
                          }))
                        }
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                      />
                    ))}
                  </div>
                </div>
              )}


              {/* Footer */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  Footer Text
                </label>

                <input
                  type="text"
                  name="footerText"
                  value={formData.footerText}
                  onChange={handleInputChange}
                  placeholder="Enter footer text"
                  className="w-full bg-gray-50 border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>
              {/* Interactive Action */}
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">
                  Interactive Action
                </label>

                <Select
                  options={actionTypeOptions}
                  value={actionTypeOptions.find(
                    opt => opt.value === formData.buttonType
                  )}
                  onChange={handleButtonTypeChange}
                  placeholder="Select action"
                  isSearchable
                />
              </div>

              {/* Button Configuration */}
              {formData.buttonType !== 'none' && (
                <div className="md:col-span-2 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
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
                          className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#ff6900]"
                        />
                        {formData.buttonType === 'call_to_action' && (
                          <input
                            type="text"
                            placeholder={btn.type === 'url' ? "https://example.com" : "+1234567890"}
                            value={btn.value}
                            onChange={(e) => handleButtonChange(index, 'value', e.target.value)}
                            className="w-full px-3 py-2.5 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:border-[#ff6900]"
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
                        type="button"
                        onClick={addButton}
                        className="text-sm font-medium text-[#ff6900] hover:text-[#e05d00] flex items-center gap-1.5 px-2 py-1"
                      >
                        <Plus className="w-4 h-4" /> Add Another Button
                      </button>
                    )}
                </div>
              )}


            </div>

            {/* ===== SUBMIT ===== */}
            <div className="flex justify-start mt-8">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className=" px-5 py-2.5  text-white font-semibold rounded bg-[#e87722] 
                hover:bg-slate-700 disabled:bg-[#ff6900] disabled:opacity-60 transition-colors"
              >
                {loading ? "Submitting..." : "Submit Template"}
              </button>
            </div>

          </div>

        </div>


        {/* Right Column: Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden max-w-xs mx-auto">
              {/* Phone Header */}
              <div className="bg-[#075E54] p-4 text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src={VaataLogo}
                    alt="Vaata Logo"
                    className="w-6 h-6 object-contain"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold">Vaata Smart</p>
                  <p className="text-[10px] opacity-80">Message Preview</p>
                </div>
              </div>

              {/* Phone Body */}
              <div className="bg-[#e5ddd5] h-[450px] p-4 overflow-y-auto relative bg-opacity-50 flex flex-col items-center">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                {/* Message Bubble */}
                <div className="w-full max-w-[90%] self-start animate-fade-in">
                  <div className={`bg-white p-3 rounded-lg shadow-sm text-sm text-slate-800 leading-relaxed break-words relative ${formData.buttons.length > 0 ? 'rounded-b-none border-b border-dashed border-gray-100' : ''}`}>

                    {/* Header Preview */}
                    {formData.headerType === 'text' && formData.headerText && (
                      <p className="text-sm font-bold text-slate-800 mb-2">{formData.headerText}</p>
                    )}
                    {formData.headerType === 'media' && formData.headerMedia && (
                      <div className="mb-2 rounded-lg bg-gray-100 h-32 flex items-center justify-center text-slate-400 text-xs border border-gray-200 overflow-hidden">
                        {formData.headerMedia.type.startsWith('image') ? (
                          <img src={URL.createObjectURL(formData.headerMedia)} alt="Header" className="w-full h-full object-cover" />
                        ) : formData.headerMedia.type.startsWith('video') ? (
                          <span className="flex items-center gap-1"><FilePlus className="w-4 h-4" /> Video Header</span>
                        ) : (
                          <span className="flex items-center gap-1"><FilePlus className="w-4 h-4" /> Document Header</span>
                        )}
                      </div>
                    )}

                    {formData.name && (
                      <p className="hidden">{formData.name}</p> // Hidden metadata just for logical consistency if needed, visual is header
                    )}

                    {formData.content ? (
                      <p className="whitespace-pre-wrap">{formData.content}</p>
                    ) : (
                      <p className="text-slate-400 italic">Your message content will appear here...</p>
                    )}

                    {/* Footer Preview */}
                    {formData.footerText && (
                      <p className="text-[11px] text-slate-400 mt-2 pt-1">{formData.footerText}</p>
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
    </div >
  );
};

export default CreateTemplate;



