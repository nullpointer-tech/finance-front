import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onStartDateChange(newDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    onEndDateChange(newDate);
  };

  // Quick preset buttons
  const setPresetRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    onStartDateChange(start);
    onEndDateChange(end);
  };

  return (
    <div className="card">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Date Inputs */}
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From
              </label>
              <input
                type="date"
                value={format(startDate, 'yyyy-MM-dd')}
                onChange={handleStartDateChange}
                max={format(endDate, 'yyyy-MM-dd')}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type="date"
                value={format(endDate, 'yyyy-MM-dd')}
                onChange={handleEndDateChange}
                min={format(startDate, 'yyyy-MM-dd')}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Quick Preset Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPresetRange(7)}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setPresetRange(30)}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setPresetRange(90)}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Last 90 Days
          </button>
          <button
            onClick={() => {
              const end = new Date();
              const start = new Date(end.getFullYear(), 0, 1);
              onStartDateChange(start);
              onEndDateChange(end);
            }}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            This Year
          </button>
        </div>
      </div>
    </div>
  );
};