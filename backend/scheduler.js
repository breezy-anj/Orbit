
export function mergeBusyIntervals(intervals) {
    if (intervals.length <= 1) return intervals;

    const sorted = [...intervals].sort((a, b) => a.start - b.start);
    const merged = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
        const last = merged[merged.length - 1];
        const curr = sorted[i];

        if (curr.start <= last.end) {
            if (curr.end > last.end) {
                last.end = curr.end;
            }
        } else {
            merged.push(curr);
        }
    }
    return merged;
}

export function findCommonFreeSlots(userBusyLists, searchStart, searchEnd, minDurationMs) {
    const allBusyIntervals = [];
    userBusyLists.forEach(busyList => {
        busyList.forEach(slot => {
            const start = new Date(Math.max(new Date(slot.start).getTime(), searchStart.getTime()));
            const end = new Date(Math.min(new Date(slot.end).getTime(), searchEnd.getTime()));
            if (start < end) {
                allBusyIntervals.push({ start, end });
            }
        });
    });

    const mergedBusy = mergeBusyIntervals(allBusyIntervals);
    const freeSlots = [];
    let currentStart = searchStart;

    for (const busy of mergedBusy) {
        if (busy.start.getTime() - currentStart.getTime() >= minDurationMs) {
            freeSlots.push({
                start: new Date(currentStart),
                end: new Date(busy.start)
            });
        }

        if (busy.end > currentStart) {
            currentStart = busy.end;
        }
    }

    if (searchEnd.getTime() - currentStart.getTime() >= minDurationMs) {
        freeSlots.push({
            start: new Date(currentStart),
            end: new Date(searchEnd)
        });
    }

    return freeSlots;
}
