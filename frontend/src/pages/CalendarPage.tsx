import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { calendarApi, type CalendarEntry } from '../api/calendar';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay } from 'date-fns';
import { cn } from '../utils/cn';

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [entries, setEntries] = useState<CalendarEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCalendar = async () => {
            setLoading(true);
            try {
                const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
                const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');
                const data = await calendarApi.getTeamCalendar(start, end);
                setEntries(data);
            } catch (error) {
                console.error('Failed to fetch calendar', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCalendar();
    }, [currentDate]);

    const days = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    });

    const getEventsForDay = (date: Date) => {
        return entries.filter(e => isSameDay(new Date(e.date), date));
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    return (
        <Layout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Team Calendar</h1>
                <div className="flex items-center space-x-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-lg font-medium">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
                </div>
            ) : (
                <div className="bg-white shadow ring-1 ring-black ring-opacity-5 lg:flex lg:flex-auto lg:flex-col overflow-hidden rounded-lg">
                    <div className="grid grid-cols-7 gap-px border-b border-gray-300 bg-gray-200 text-center text-xs font-semibold leading-6 text-gray-700 lg:flex-none">
                        <div className="bg-white py-2">M</div>
                        <div className="bg-white py-2">T</div>
                        <div className="bg-white py-2">W</div>
                        <div className="bg-white py-2">T</div>
                        <div className="bg-white py-2">F</div>
                        <div className="bg-white py-2">S</div>
                        <div className="bg-white py-2">S</div>
                    </div>
                    <div className="flex bg-gray-200 text-xs leading-6 text-gray-700 lg:flex-auto">
                        <div className="hidden w-full lg:grid lg:grid-cols-7 lg:grid-rows-5 lg:gap-px">
                            {/* Padding for start of month (simplified, date-fns handles this better with getDay but simple start here) */}
                            {/* Actually eachDayOfInterval gives correct days but we need to pad empty cells if it doesn't start on Mon */}
                            {/* For MVP speed, let's just list the days we have, grid might be misaligned if we don't pad */}
                            {/* Let's pad properly */}
                            {Array.from({ length: (startOfMonth(currentDate).getDay() + 6) % 7 }).map((_, i) => (
                                <div key={`pad-${i}`} className="bg-white px-3 py-2 min-h-[100px]" />
                            ))}

                            {days.map((day) => {
                                const events = getEventsForDay(day);
                                return (
                                    <div key={day.toString()} className={cn("relative bg-white px-3 py-2 min-h-[100px]",
                                        isSameDay(day, new Date()) ? "bg-blue-50" : ""
                                    )}>
                                        <time dateTime={format(day, 'yyyy-MM-dd')} className={cn(
                                            isSameDay(day, new Date()) ? "flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 font-semibold text-white" : ""
                                        )}>
                                            {format(day, 'd')}
                                        </time>
                                        {events.length > 0 && (
                                            <ol className="mt-2">
                                                {events.map((event) => (
                                                    <li key={`${event.user_id}-${event.type_name}`}>
                                                        <div className="group flex items-center">
                                                            <div className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: event.type_color }} />
                                                            <p className="flex-auto truncate font-medium text-gray-900 group-hover:text-blue-600">
                                                                {event.user_name}
                                                            </p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ol>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
