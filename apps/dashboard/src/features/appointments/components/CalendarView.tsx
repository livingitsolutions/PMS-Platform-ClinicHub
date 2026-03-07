import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CalendarViewProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

export function CalendarView({ selectedDate, onDateSelect }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const handleDayClick = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onDateSelect(date);
  };

  const renderDays = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + firstDayOfMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const day = i - firstDayOfMonth + 1;

      if (i < firstDayOfMonth || day > daysInMonth) {
        days.push(
          <div key={i} className="p-2 text-center">
            <div className="w-10 h-10"></div>
          </div>
        );
      } else {
        days.push(
          <div key={i} className="p-2 text-center">
            <button
              onClick={() => handleDayClick(day)}
              className={`
                w-10 h-10 rounded-full hover:bg-gray-100 transition-colors
                ${isSelected(day) ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                ${isToday(day) && !isSelected(day) ? 'border-2 border-blue-600' : ''}
              `}
            >
              {day}
            </button>
          </div>
        );
      }
    }

    return days;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              &larr;
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              &rarr;
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {dayNames.map((name) => (
            <div key={name} className="p-2 text-center font-semibold text-sm text-gray-600">
              {name}
            </div>
          ))}
          {renderDays()}
        </div>
      </CardContent>
    </Card>
  );
}
