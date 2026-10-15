import React, { useState } from 'react';
import { Member, DailyMealRecord } from '../types';
import { formatNumber } from '../utils/calculator';
import { 
  Calendar, 
  Table as TableIcon, 
  Plus, 
  Minus, 
  Coffee, 
  Sun, 
  Moon, 
  Users, 
  Save, 
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface MealTrackerViewProps {
  members: Member[];
  dailyMeals: DailyMealRecord[];
  onUpdateDayMeals: (date: string, memberMeals: DailyMealRecord['members'], notes?: string) => void;
  activeMealRate: number;
}

export const MealTrackerView: React.FC<MealTrackerViewProps> = ({
  members,
  dailyMeals,
  onUpdateDayMeals,
  activeMealRate,
}) => {
  const [viewMode, setViewMode] = useState<'matrix' | 'daily'>('matrix');
  const [selectedDate, setSelectedDate] = useState<string>(
    dailyMeals.length > 0 ? dailyMeals[0].date : '2026-10-01'
  );

  // Find record for selectedDate
  const currentRecord = dailyMeals.find(r => r.date === selectedDate) || {
    date: selectedDate,
    members: {}
  };

  // Local state for editing daily entry
  const [dailyState, setDailyState] = useState<DailyMealRecord['members']>(
    currentRecord.members || {}
  );
  const [noteState, setNoteState] = useState<string>(currentRecord.notes || '');
  const [savedFeedback, setSavedFeedback] = useState(false);

  // When selectedDate changes, sync local state
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    const rec = dailyMeals.find(r => r.date === date);
    if (rec) {
      setDailyState(JSON.parse(JSON.stringify(rec.members || {})));
      setNoteState(rec.notes || '');
    } else {
      const defaultState: DailyMealRecord['members'] = {};
      members.forEach(m => {
        defaultState[m.id] = { breakfast: 0, lunch: 1, dinner: 1, guest: 0 };
      });
      setDailyState(defaultState);
      setNoteState('');
    }
  };

  const handleMealChange = (
    memberId: string, 
    field: 'breakfast' | 'lunch' | 'dinner' | 'guest', 
    delta: number
  ) => {
    setDailyState(prev => {
      const cur = prev[memberId] || { breakfast: 0, lunch: 0, dinner: 0, guest: 0 };
      let newVal = (cur[field] || 0) + delta;
      if (newVal < 0) newVal = 0;
      return {
        ...prev,
        [memberId]: {
          ...cur,
          [field]: newVal
        }
      };
    });
  };

  const handleBulkPreset = (preset: 'standard' | 'full' | 'off') => {
    const updated: DailyMealRecord['members'] = {};
    members.forEach(m => {
      if (preset === 'standard') {
        updated[m.id] = { breakfast: 0, lunch: 1, dinner: 1, guest: 0 };
      } else if (preset === 'full') {
        updated[m.id] = { breakfast: 0.5, lunch: 1, dinner: 1, guest: 0 };
      } else {
        updated[m.id] = { breakfast: 0, lunch: 0, dinner: 0, guest: 0 };
      }
    });
    setDailyState(updated);
  };

  const handleSaveDaily = () => {
    onUpdateDayMeals(selectedDate, dailyState, noteState);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  // Matrix calculations
  // Get all unique dates sorted
  const sortedDates = [...dailyMeals].map(d => d.date).sort();
  
  // Calculate member total meals in period
  const memberTotals: Record<string, number> = {};
  members.forEach(m => { memberTotals[m.id] = 0; });
  
  const dailyTotals: Record<string, number> = {};
  sortedDates.forEach(d => { dailyTotals[d] = 0; });

  dailyMeals.forEach(record => {
    let daySum = 0;
    Object.entries(record.members || {}).forEach(([mId, meal]) => {
      const sum = (meal.breakfast || 0) + (meal.lunch || 0) + (meal.dinner || 0) + (meal.guest || 0);
      memberTotals[mId] = (memberTotals[mId] || 0) + sum;
      daySum += sum;
    });
    dailyTotals[record.date] = daySum;
  });

  const totalAllMeals = Object.values(memberTotals).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>🍲 Mess Daily Meal Tracker</span>
            <span className="text-xs font-normal text-slate-500 font-mono">
              ({totalAllMeals.toFixed(1)} Total Meals Consumed)
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record breakfast (0.5), lunch (1.0), dinner (1.0), and guest meals for all members.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'matrix'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Master Matrix (1-31)</span>
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'daily'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Quick Entry</span>
          </button>
        </div>
      </div>

      {/* MATRIX VIEW */}
      {viewMode === 'matrix' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-900">Legend:</span>
              <span>B = Breakfast (0.5)</span>
              <span>·</span>
              <span>L = Lunch (1.0)</span>
              <span>·</span>
              <span>D = Dinner (1.0)</span>
              <span>·</span>
              <span>G = Guest</span>
            </div>

            <div className="text-xs text-slate-600 font-mono">
              Meal Rate: <strong className="text-emerald-700">৳{activeMealRate.toFixed(2)}</strong> / meal
            </div>
          </div>

          <div className="overflow-x-auto max-h-[620px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-300">
                <tr className="text-slate-700 font-semibold">
                  <th className="py-2.5 px-3 whitespace-nowrap sticky left-0 z-20 bg-slate-100 border-r border-slate-200">
                    Member Name
                  </th>
                  {sortedDates.map((dateStr) => {
                    const dayNum = dateStr.split('-')[2];
                    return (
                      <th
                        key={dateStr}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setViewMode('daily');
                          handleDateSelect(dateStr);
                        }}
                        title={`Click to edit Day ${dayNum} (${dateStr})`}
                        className="py-2.5 px-2 text-center font-mono cursor-pointer hover:bg-emerald-100/70 transition-colors border-r border-slate-200 min-w-[38px]"
                      >
                        {parseInt(dayNum, 10)}
                      </th>
                    );
                  })}
                  <th className="py-2.5 px-3 text-right sticky right-0 z-20 bg-slate-100 border-l border-slate-300 font-bold text-slate-900">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {members.map((member) => {
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 whitespace-nowrap font-bold text-slate-900 sticky left-0 z-10 bg-white border-r border-slate-200 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: member.avatarColor }}
                        />
                        <span className="truncate max-w-[110px]">{member.name}</span>
                      </td>

                      {sortedDates.map((dateStr) => {
                        const rec = dailyMeals.find(r => r.date === dateStr);
                        const mEntry = rec?.members?.[member.id];
                        const dayMeals = mEntry 
                          ? (mEntry.breakfast || 0) + (mEntry.lunch || 0) + (mEntry.dinner || 0) + (mEntry.guest || 0)
                          : 0;

                        return (
                          <td
                            key={dateStr}
                            onClick={() => {
                              setSelectedDate(dateStr);
                              setViewMode('daily');
                              handleDateSelect(dateStr);
                            }}
                            className={`py-2 px-1 text-center font-mono tabular-nums border-r border-slate-100 cursor-pointer hover:bg-emerald-50 transition-colors ${
                              dayMeals === 0
                                ? 'text-slate-300'
                                : dayMeals >= 2.5
                                ? 'text-amber-700 font-bold bg-amber-50/40'
                                : 'text-slate-800 font-medium'
                            }`}
                          >
                            {dayMeals > 0 ? dayMeals.toFixed(1) : '-'}
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-800 sticky right-0 z-10 bg-white border-l border-slate-300">
                        {formatNumber(memberTotals[member.id] || 0, 1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="sticky bottom-0 z-10 bg-slate-100 border-t-2 border-slate-300 font-semibold text-slate-900">
                <tr>
                  <td className="py-2.5 px-3 whitespace-nowrap sticky left-0 z-20 bg-slate-100 border-r border-slate-200 font-bold">
                    Daily Total Meals
                  </td>
                  {sortedDates.map((dateStr) => {
                    return (
                      <td
                        key={dateStr}
                        className="py-2.5 px-1 text-center font-mono tabular-nums font-bold text-slate-800 border-r border-slate-200 text-[11px]"
                      >
                        {formatNumber(dailyTotals[dateStr] || 0, 1)}
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-800 sticky right-0 z-20 bg-slate-100 border-l border-slate-300">
                    {formatNumber(totalAllMeals, 1)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* DAILY QUICK ENTRY VIEW */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          {/* Date Selector & Action Strip */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="meal-date-picker" className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Entry Date:
              </label>
              <input
                id="meal-date-picker"
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateSelect(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const idx = sortedDates.indexOf(selectedDate);
                    if (idx > 0) handleDateSelect(sortedDates[idx - 1]);
                  }}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                  title="Previous Day"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const idx = sortedDates.indexOf(selectedDate);
                    if (idx < sortedDates.length - 1) handleDateSelect(sortedDates[idx + 1]);
                  }}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                  title="Next Day"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Bulk Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Quick Fill:</span>
              <button
                onClick={() => handleBulkPreset('standard')}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                All 2 Meals (L+D)
              </button>
              <button
                onClick={() => handleBulkPreset('full')}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                All 2.5 Meals (B+L+D)
              </button>
              <button
                onClick={() => handleBulkPreset('off')}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                All OFF (0)
              </button>
            </div>
          </div>

          {/* Members Daily Meal Entry Grid */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Daily Meal Entry Matrix · {selectedDate}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {Object.values(dailyState).reduce(
                  (acc, m) => acc + (m.breakfast || 0) + (m.lunch || 0) + (m.dinner || 0) + (m.guest || 0),
                  0
                ).toFixed(1)} Meals Total Today
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {members.map((member) => {
                const currentMeals = dailyState[member.id] || { breakfast: 0, lunch: 0, dinner: 0, guest: 0 };
                const daySum = (currentMeals.breakfast || 0) +
                  (currentMeals.lunch || 0) +
                  (currentMeals.dinner || 0) +
                  (currentMeals.guest || 0);

                return (
                  <div
                    key={member.id}
                    className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: member.avatarColor }}
                      />
                      <div>
                        <span className="text-sm font-bold text-slate-900">{member.name}</span>
                        <div className="text-xs text-slate-500 font-mono">
                          Day Total: <strong className="text-slate-800">{daySum.toFixed(1)}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Meal Buttons Controls */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 grow max-w-2xl">
                      {/* Breakfast (0 or 0.5) */}
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Coffee className="w-3.5 h-3.5 text-amber-600" />
                          <span>Breakfast</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleMealChange(member.id, 'breakfast', -0.5)}
                            className="w-6 h-6 rounded bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-xs w-6 text-center text-slate-900">
                            {currentMeals.breakfast || 0}
                          </span>
                          <button
                            onClick={() => handleMealChange(member.id, 'breakfast', 0.5)}
                            className="w-6 h-6 rounded bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Lunch (0, 1, 2) */}
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Sun className="w-3.5 h-3.5 text-orange-500" />
                          <span>Lunch</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleMealChange(member.id, 'lunch', -1)}
                            className="w-6 h-6 rounded bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-xs w-6 text-center text-slate-900">
                            {currentMeals.lunch || 0}
                          </span>
                          <button
                            onClick={() => handleMealChange(member.id, 'lunch', 1)}
                            className="w-6 h-6 rounded bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Dinner (0, 1, 2) */}
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Moon className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Dinner</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleMealChange(member.id, 'dinner', -1)}
                            className="w-6 h-6 rounded bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-xs w-6 text-center text-slate-900">
                            {currentMeals.dinner || 0}
                          </span>
                          <button
                            onClick={() => handleMealChange(member.id, 'dinner', 1)}
                            className="w-6 h-6 rounded bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Guest Meal */}
                      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-2">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Users className="w-3.5 h-3.5 text-purple-600" />
                          <span>Guest</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleMealChange(member.id, 'guest', -1)}
                            className="w-6 h-6 rounded bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-xs w-6 text-center text-purple-700">
                            {currentMeals.guest || 0}
                          </span>
                          <button
                            onClick={() => handleMealChange(member.id, 'guest', 1)}
                            className="w-6 h-6 rounded bg-white border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Note and Save Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <input
                type="text"
                placeholder="Optional daily note (e.g. Weekend chicken feast, guest arrived, etc.)"
                value={noteState}
                onChange={(e) => setNoteState(e.target.value)}
                className="w-full sm:w-80 text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {savedFeedback && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Saved Successfully!</span>
                  </span>
                )}
                <button
                  onClick={handleSaveDaily}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Day Record</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
