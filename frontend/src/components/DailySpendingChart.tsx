import { useState } from 'react';
import { formatMoney, formatMoneyShort, monthDays, today } from '../utils/format';

interface Props {
  month: string; // YYYY-MM
  daily: { date: string; total: number }[];
  /** Monthly budget – drawn as a dashed "daily budget" guide line. */
  budget: number | null;
}

const pad = (n: number) => String(n).padStart(2, '0');

// One bar per day of the month (single colour = one series), with a hover tooltip.
// A visually-hidden table carries the same numbers for screen readers.
export default function DailySpendingChart({ month, daily, budget }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const { total: dayCount } = monthDays(month);
  const byDate = new Map(daily.map((d) => [d.date, d.total]));
  const todayStr = today();

  const days = Array.from({ length: dayCount }, (_, i) => {
    const date = `${month}-${pad(i + 1)}`;
    return { day: i + 1, date, total: byDate.get(date) ?? 0, future: date > todayStr };
  });

  const dailyBudget = budget ? budget / dayCount : null;
  const maxValue = Math.max(...days.map((d) => d.total), dailyBudget ?? 0, 1);
  const pct = (v: number) => (v / maxValue) * 100;
  const shown = active !== null ? days[active] : null;
  const ticks = [1, 5, 10, 15, 20, 25, dayCount].filter((d, i, arr) => arr.indexOf(d) === i && d <= dayCount);

  if (!daily.length) return <p className="text-muted small mb-0">No spending recorded this month yet.</p>;

  return (
    <div>
      <div className="chart-readout" aria-live="polite">
        {shown ? (
          <>
            <span className="text-muted">
              {new Date(`${shown.date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
            <strong>{formatMoney(shown.total)}</strong>
          </>
        ) : (
          <span className="text-muted">Hover or tap a bar to see that day</span>
        )}
      </div>

      <div className="daily-chart" onMouseLeave={() => setActive(null)} aria-hidden>
        <span className="chart-max">{formatMoneyShort(maxValue)}</span>
        {dailyBudget !== null && (
          <div className="chart-guide" style={{ bottom: `${pct(dailyBudget)}%` }}>
            <span>daily budget {formatMoneyShort(dailyBudget)}</span>
          </div>
        )}
        {days.map((d, i) => (
          <button
            type="button"
            tabIndex={-1}
            key={d.date}
            className={`bar-slot ${active === i ? 'active' : ''} ${d.future ? 'future' : ''}`}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
          >
            <span
              className={`bar ${dailyBudget !== null && d.total > dailyBudget ? 'over' : ''}`}
              style={{ height: d.total ? `max(${pct(d.total)}%, 3px)` : 0 }}
            />
          </button>
        ))}
      </div>

      <div className="chart-axis" aria-hidden>
        {ticks.map((t) => (
          <span key={t} style={{ left: `${((t - 0.5) / dayCount) * 100}%` }}>
            {t}
          </span>
        ))}
      </div>

      <div className="chart-legend small text-muted mt-2">
        <span>
          <i className="legend-swatch" /> Spent that day
        </span>
        {dailyBudget !== null && (
          <span>
            <i className="legend-swatch over" /> Above daily budget
          </span>
        )}
      </div>

      <table className="visually-hidden">
        <caption>Spending per day</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {daily.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{formatMoney(d.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
