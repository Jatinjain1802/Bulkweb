import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, XCircle, ChevronDown } from 'lucide-react';

const DatePicker = ({ value, onChange, placeholder = "Select date" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const containerRef = useRef(null);

    // Initialize viewDate from value if present
    useEffect(() => {
        if (value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                setViewDate(date);
            }
        }
    }, [isOpen]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day) => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        // Format as YYYY-MM-DD for consistency
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        onChange(`${year}-${month}-${dayStr}`);
        setIsOpen(false);
    };

    const clearDate = (e) => {
        e.stopPropagation();
        onChange('');
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(viewDate);
        const firstDay = getFirstDayOfMonth(viewDate);
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isSelected = value === dateStr;
            const isToday = new Date().toDateString() === currentDate.toDateString();

            days.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`h-8 w-8 rounded-full text-xs font-medium flex items-center justify-center transition-all
                        ${isSelected 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                            : isToday 
                                ? 'bg-indigo-50 text-indigo-600 font-bold border border-indigo-200'
                                : 'text-slate-700 hover:bg-slate-100'
                        }`}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    return (
        <div className="relative" ref={containerRef}>
             {/* Trigger */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`relative flex items-center gap-3 w-full px-4 py-2.5 bg-slate-50 border rounded-lg transition-all duration-200 cursor-pointer 
                ${isOpen || value ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-white' : 'border-slate-200 hover:border-slate-300'}`}
            >
                <Calendar className={`h-4 w-4 shrink-0 transition-colors ${value || isOpen ? 'text-indigo-600' : 'text-slate-400'}`} />
                
                <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate cursor-pointer select-none ${value ? 'font-medium text-slate-700' : 'text-slate-500'}`}>
                        {value ? new Date(value).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : placeholder}
                    </p>
                </div>

                {value ? (
                    <button
                        onClick={clearDate}
                        className="p-1 -mr-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <XCircle className="w-4 h-4" />
                    </button>
                ) : (
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </div>

            {/* Calendar Popup */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-[280px] animate-fade-in-up">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-semibold text-slate-800">
                            {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </span>
                        <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Weekday Labels */}
                    <div className="grid grid-cols-7 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className="h-8 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-y-1 gap-x-1">
                        {renderCalendarDays()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
