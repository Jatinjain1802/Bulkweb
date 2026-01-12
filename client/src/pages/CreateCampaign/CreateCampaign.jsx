import React ,{ useEffect, useState } from 'react';
import Select from 'react-select';
import { Megaphone, User } from 'lucide-react';
const CreateCampaign = () => {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/templates');
        const data = await response.json();

        // Convert API data to react-select format
        const options = data.map(item => ({
          value: item._id,        // or item.id
          label: item.name        // template name
        }));

        setTemplates(options);
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    fetchTemplates();
  }, []);

    return(
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
                    options={templates}
                    // styles={customStyles}
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
        
        {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
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
        </div> */}
      </div>
    </div>
  );
}
export default CreateCampaign;
