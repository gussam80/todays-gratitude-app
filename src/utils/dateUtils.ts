export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatKoreanDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  return `${year}년 ${month}월 ${day}일`;
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  return `${month}월 ${day}일`;
}

export function getMonthYearLabel(year: number, month: number): string {
  return `${year}년 ${month}월`;
}

export function getCalendarGrid(year: number, month: number) {
  // month: 1-12
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0=Sun, 6=Sat
  const totalDays = new Date(year, month, 0).getDate();

  const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // Previous month padding
  const prevMonthTotalDays = new Date(year, month - 1, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDay = prevMonthTotalDays - i;
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
    days.push({ day: prevDay, dateStr, isCurrentMonth: false });
  }

  // Current month
  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ day: i, dateStr, isCurrentMonth: true });
  }

  // Next month padding to complete 35 or 42 cells (multiple of 7)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ day: i, dateStr, isCurrentMonth: false });
  }

  return days;
}

export function calculateConsecutiveDays(dates: string[], todayStr: string): number {
  if (!dates || dates.length === 0) return 0;
  
  const dateSet = new Set(dates);
  let streak = 0;
  let curr = new Date(todayStr);

  // If today is not completed, check if yesterday was completed to count streak up to yesterday
  const currStr = todayStr;
  if (!dateSet.has(currStr)) {
    curr.setDate(curr.getDate() - 1);
  }

  while (true) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    const dStr = `${y}-${m}-${d}`;
    if (dateSet.has(dStr)) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
