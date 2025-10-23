import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from 'react-i18next';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  maxDate?: Date;
  minDate?: Date;
  label?: string;
}

type PresetValue = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'this_year' | 'last_year' | 'all_time' | 'custom';

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  maxDate = new Date(),
  minDate,
  label
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<PresetValue>('this_month');
  const [tempRange, setTempRange] = useState<DateRange>(value);

  // Update temp range when value changes externally
  useEffect(() => {
    setTempRange(value);
  }, [value]);

  const getPresetRange = (preset: PresetValue): DateRange | null => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case 'today':
        return { startDate: today, endDate: new Date() };

      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { startDate: yesterday, endDate: yesterday };

      case 'this_week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { startDate: weekStart, endDate: new Date() };

      case 'last_week':
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        const lastWeekStart = new Date(lastWeekEnd);
        lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
        return { startDate: lastWeekStart, endDate: lastWeekEnd };

      case 'this_month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        return { startDate: monthStart, endDate: new Date() };

      case 'last_month':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        return { startDate: lastMonthStart, endDate: lastMonthEnd };

      case 'this_year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        return { startDate: yearStart, endDate: new Date() };

      case 'last_year':
        const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
        return { startDate: lastYearStart, endDate: lastYearEnd };

      case 'all_time':
        const allTimeStart = new Date(2020, 0, 1); // Arbitrary start date
        return { startDate: allTimeStart, endDate: new Date() };

      default:
        return null;
    }
  };

  const presets: { label: string; value: PresetValue }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This week', value: 'this_week' },
    { label: 'Last week', value: 'last_week' },
    { label: 'This month', value: 'this_month' },
    { label: 'Last month', value: 'last_month' },
    { label: 'This year', value: 'this_year' },
    { label: 'Last year', value: 'last_year' },
    { label: 'All time', value: 'all_time' },
  ];

  const handlePresetClick = (preset: PresetValue) => {
    setSelectedPreset(preset);
    const range = getPresetRange(preset);
    if (range) {
      setTempRange(range);
    }
  };

  const handleCustomDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    if (start) {
      setSelectedPreset('custom');
      if (end) {
        setTempRange({ startDate: start, endDate: end });
      } else {
        setTempRange({ startDate: start, endDate: start });
      }
    }
  };

  const handleApply = () => {
    onChange(tempRange);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempRange(value);
    setIsOpen(false);
  };

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const start = value.startDate.toLocaleDateString(undefined, options);
    const end = value.endDate.toLocaleDateString(undefined, options);
    return `${start} - ${end}`;
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition-all shadow-sm"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Calendar size={18} className="text-primary-400" />
        <span className="text-sm font-medium">
          {label || formatDateRange()}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
              className="fixed inset-0 z-40"
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-strong overflow-hidden z-50"
            >
              <div className="flex">
                {/* Presets Sidebar */}
                <div className="w-40 bg-slate-900/50 border-r border-slate-700 p-3">
                  <div className="space-y-1">
                    {presets.map((preset) => (
                      <motion.button
                        key={preset.value}
                        onClick={() => handlePresetClick(preset.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                          selectedPreset === preset.value
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-slate-300 hover:bg-slate-700/70 hover:text-slate-100'
                        }`}
                        whileHover={{ x: 2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {preset.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Calendar Section */}
                <div className="p-4 enhanced-datepicker-container">
                  <DatePicker
                    selected={tempRange.startDate}
                    onChange={handleCustomDateChange}
                    startDate={tempRange.startDate}
                    endDate={tempRange.endDate}
                    selectsRange
                    inline
                    monthsShown={2}
                    maxDate={maxDate}
                    minDate={minDate}
                    calendarClassName="enhanced-datepicker"
                  />

                  {/* Date Display & Actions */}
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <input
                        type="text"
                        value={tempRange.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        readOnly
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm text-center"
                      />
                      <span className="text-slate-500">-</span>
                      <input
                        type="text"
                        value={tempRange.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        readOnly
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-sm text-center"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <motion.button
                        onClick={handleCancel}
                        className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={handleApply}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Apply
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .enhanced-datepicker-container .react-datepicker {
          background-color: transparent;
          border: none;
          font-family: inherit;
        }

        .enhanced-datepicker-container .react-datepicker__header {
          background-color: rgb(30 41 59);
          border-bottom: 1px solid rgb(51 65 85);
          padding: 12px 0;
          border-top-left-radius: 0;
          border-top-right-radius: 0;
        }

        .enhanced-datepicker-container .react-datepicker__current-month {
          color: rgb(226 232 240);
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 8px;
        }

        .enhanced-datepicker-container .react-datepicker__day-name {
          color: rgb(148 163 184);
          width: 2.5rem;
          line-height: 2.5rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .enhanced-datepicker-container .react-datepicker__day {
          color: rgb(203 213 225);
          width: 2.5rem;
          line-height: 2.5rem;
          margin: 0.2rem;
          border-radius: 0.5rem;
          transition: all 0.15s;
        }

        .enhanced-datepicker-container .react-datepicker__day:hover {
          background-color: rgb(51 65 85);
          color: white;
          transform: scale(1.05);
        }

        .enhanced-datepicker-container .react-datepicker__day--selected,
        .enhanced-datepicker-container .react-datepicker__day--range-start,
        .enhanced-datepicker-container .react-datepicker__day--range-end {
          background-color: rgb(37 99 235);
          color: white;
          font-weight: 600;
        }

        .enhanced-datepicker-container .react-datepicker__day--in-range {
          background-color: rgba(37, 99, 235, 0.3);
          color: rgb(203 213 225);
        }

        .enhanced-datepicker-container .react-datepicker__day--keyboard-selected {
          background-color: rgb(30 64 175);
          color: white;
        }

        .enhanced-datepicker-container .react-datepicker__day--disabled {
          color: rgb(71 85 105);
          cursor: not-allowed;
        }

        .enhanced-datepicker-container .react-datepicker__day--outside-month {
          color: rgb(71 85 105);
          opacity: 0.5;
        }

        .enhanced-datepicker-container .react-datepicker__navigation {
          top: 16px;
        }

        .enhanced-datepicker-container .react-datepicker__navigation-icon::before {
          border-color: rgb(148 163 184);
          border-width: 2px 2px 0 0;
          height: 7px;
          width: 7px;
        }

        .enhanced-datepicker-container .react-datepicker__navigation:hover *::before {
          border-color: white;
        }

        .enhanced-datepicker-container .react-datepicker__month-container {
          float: left;
        }

        .enhanced-datepicker-container .react-datepicker__month {
          margin: 0.4rem;
        }
      `}</style>
    </div>
  );
};
