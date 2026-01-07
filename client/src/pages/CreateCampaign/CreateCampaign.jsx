import React from 'react';
import Select from 'react-select';
import { Megaphone, User } from 'lucide-react';

const templateOptions = [
  { value: 'welcome', label: 'Welcome Message' },
  { value: 'order_conf', label: 'Order Confirmation' },
  { value: 'otp', label: 'OTP Verification' }
];

const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#f9fafb',
    borderColor: state.isFocused ? '#6366f1' : '#e5e7eb',
    borderRadius: '0.75rem',
    padding: '4px',
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

const CreateCampaign = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Create Campaign</h2>
          <p className="text-slate-500 text-sm mt-1">Launch a new WhatsApp bulk message campaign.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center gap-2">
          <Megaphone className="w-4 h-4" />
          Launch Campaign
        </button>
      </div>
  
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-md font-bold text-slate-700 mb-4 border-b border-gray-100 pb-3">Campaign Details</h3>
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600">Campaign Name</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-indigo-500 transition-colors" placeholder="e.g. Diwali Offer" />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600">Select Template</label>
                  <Select 
                    options={templateOptions}
                    styles={customStyles}
                    placeholder="Select a template..."
                    isSearchable={true}
                  />
               </div>
            </div>
          </div>
  
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-md font-bold text-slate-700 mb-4 border-b border-gray-100 pb-3">Audience</h3>
            <div className="border border-dashed border-gray-300 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-indigo-50/30 transition-colors cursor-pointer group">
               <User className="w-8 h-8 mx-auto text-slate-400 group-hover:text-indigo-500 mb-2 transition-colors" />
               <p className="text-sm text-slate-600 font-medium">Upload Contact List (CSV/Excel)</p>
               <p className="text-xs text-slate-400">or drag and drop here</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
          <h3 className="text-md font-bold text-slate-700 mb-4">Summary</h3>
          <div className="space-y-3 mb-6">
             <div className="flex justify-between text-sm">
               <span className="text-slate-500">Selected Template</span>
               <span className="font-medium text-slate-800">-</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-slate-500">Recipients</span>
               <span className="font-medium text-slate-800">0</span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-slate-500">Estimated Cost</span>
               <span className="font-medium text-slate-800">$0.00</span>
             </div>
          </div>
          <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-xs leading-relaxed">
            <strong>Note:</strong> Campaign approval may take up to 24 hours depending on the template category.
          </div>
        </div>
      </div>
    </div>
  );

export default CreateCampaign;
