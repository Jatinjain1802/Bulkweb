import React from 'react';
import { Image, Video, FileText, ExternalLink, Phone, MessageSquare, PlayCircle } from 'lucide-react';

const TemplatePreview = ({ template }) => {
    if (!template) return null;

    let structure = [];
    try {
        structure = typeof template.structure === 'string'
            ? JSON.parse(template.structure)
            : template.structure;
    } catch (e) {
        return <div className="text-red-500 text-sm">Error parsing template structure</div>;
    }

    const header = structure.find(c => c.type === 'HEADER');
    const body = structure.find(c => c.type === 'BODY');
    const footer = structure.find(c => c.type === 'FOOTER');
    const buttons = structure.find(c => c.type === 'BUTTONS');

    return (
        <div className="w-full font-sans">
             <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Preview</h4>
            <div className="bg-[#E5DDD5] p-4 rounded-xl border border-gray-200 shadow-inner">
                <div className="bg-white rounded-r-lg rounded-bl-lg rounded-tl-none shadow-sm overflow-hidden relative max-w-[90%] mx-auto lg:mx-0 lg:max-w-full">
                    {/* Header */}
                    {header && (
                        <div className="w-full">
                            {header.format === 'IMAGE' && (
                                 <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden border-b border-gray-50">
                                    {template.sample_media_url ? (
                                        <img src={template.sample_media_url} alt="Header" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <Image className="w-8 h-8" />
                                            <span className="text-[10px] font-medium uppercase tracking-wide">Image Header</span>
                                        </div>
                                    )}
                                </div>
                            )}
                            {header.format === 'VIDEO' && (
                                <div className="w-full h-40 bg-gray-100 flex items-center justify-center border-b border-gray-50">
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <PlayCircle className="w-10 h-10" />
                                        <span className="text-[10px] font-medium uppercase tracking-wide">Video Header</span>
                                    </div>
                                </div>
                            )}
                            {header.format === 'DOCUMENT' && (
                                <div className="w-full h-40 bg-gray-100 flex items-center justify-center border-b border-gray-50">
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <FileText className="w-10 h-10" />
                                        <span className="text-[10px] font-medium uppercase tracking-wide">Document Header</span>
                                    </div>
                                </div>
                            )}
                            {header.format === 'TEXT' && (
                                 <div className="px-3 pt-3 pb-1 font-bold text-slate-900 text-[15px]">
                                    {header.text}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Body */}
                    {body && (
                        <div className="px-3 py-2 text-[14.2px] text-slate-800 whitespace-pre-wrap leading-relaxed">
                            {body.text}
                        </div>
                    )}

                    {/* Footer */}
                    {footer && (
                        <div className="px-3 pb-3 pt-1 text-[11px] text-slate-400 font-medium">
                            {footer.text}
                        </div>
                    )}
                </div>

                {/* Buttons */}
                 {buttons && buttons.buttons.length > 0 && (
                    <div className="mt-2 space-y-2">
                        {buttons.buttons.map((btn, idx) => (
                            <div key={idx} className="bg-white rounded-lg shadow-sm py-2 px-4 text-center text-[#00A884] font-medium text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-center gap-2 transition-colors">
                                {btn.type === 'URL' && <ExternalLink className="w-3.5 h-3.5" />}
                                {btn.type === 'PHONE_NUMBER' && <Phone className="w-3.5 h-3.5" />}
                                {btn.type === 'QUICK_REPLY' && <MessageSquare className="w-3.5 h-3.5" />}
                                {btn.text}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="text-center mt-2">
                <span className="text-[10px] text-slate-400">Preview of how it will appear on WhatsApp</span>
            </div>
        </div>
    );
};

export default TemplatePreview;
