import { useRef, useState, type ReactNode } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { formatDate, formatMonth, today } from '../utils/format';

// 'YYYY-MM-DD' <-> local Date (no time-zone shifts)
const parseDate = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};
const toIsoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const toMonth = (year: number, monthIndex: number) => `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Popover shell shared by both pickers. Clicking the trigger again closes it.
function PickerPopover({
  id,
  open,
  keyboard,
  onClose,
  trigger,
  children,
}: {
  id: string;
  open: boolean;
  keyboard: boolean;
  onClose: () => void;
  trigger: React.RefObject<HTMLButtonElement | null>;
  children: ReactNode;
}) {
  return (
    <Overlay
      target={trigger.current}
      show={open}
      placement="bottom-start"
      rootClose
      onHide={(e) => {
        if (e && trigger.current?.contains(e.target as Node)) return;
        onClose();
      }}
      popperConfig={{ modifiers: [{ name: 'offset', options: { offset: [0, 6] } }] }}
      onEntered={(el: HTMLElement) => {
        // Opened from the keyboard: move focus into the picker (no page scroll). Mouse users keep a clean look.
        if (!keyboard) return;
        const selectors = ['.rdp-selected button', '.rdp-today button', '.month-cell.selected', '.rdp-day_button:not([disabled])'];
        for (const sel of selectors) {
          const target = el.querySelector<HTMLElement>(sel);
          if (target) return target.focus({ preventScroll: true });
        }
      }}
    >
      <Popover id={`${id}-popover`} className="picker-popover">
        <Popover.Body>{children}</Popover.Body>
      </Popover>
    </Overlay>
  );
}

interface DatePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  isInvalid?: boolean;
  clearable?: boolean;
}

// Calendar dropdown styled like the rest of the app, used instead of the browser's date input.
export function DatePicker({ id, value, onChange, min, max, placeholder = 'Pick a date', isInvalid, clearable }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const selected = value ? parseDate(value) : undefined;
  const todayIso = today();
  const todayAllowed = (!min || todayIso >= min) && (!max || todayIso <= max);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
    trigger.current?.focus();
  };

  return (
    <>
      <button
        ref={trigger}
        id={id}
        type="button"
        className={`form-control picker-trigger ${isInvalid ? 'is-invalid' : ''} ${open ? 'open' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(e) => {
          setKeyboard(e.detail === 0);
          setOpen((o) => !o);
        }}
      >
        <i className="bi bi-calendar3" aria-hidden />
        <span className={value ? '' : 'placeholder-text'}>{value ? formatDate(value) : placeholder}</span>
        <i className="bi bi-chevron-down chevron" aria-hidden />
      </button>
      <PickerPopover id={id} open={open} keyboard={keyboard} onClose={() => setOpen(false)} trigger={trigger}>
        <DayPicker
          mode="single"
          weekStartsOn={1}
          showOutsideDays
          selected={selected}
          defaultMonth={selected ?? (max && todayIso > max ? parseDate(max) : undefined)}
          startMonth={min ? parseDate(min) : new Date(2000, 0)}
          endMonth={max ? parseDate(max) : new Date(Number(todayIso.slice(0, 4)) + 5, 11)}
          disabled={[...(min ? [{ before: parseDate(min) }] : []), ...(max ? [{ after: parseDate(max) }] : [])]}
          onSelect={(d) => d && pick(toIsoDate(d))}
        />
        <div className="picker-footer">
          {clearable && value ? (
            <button type="button" className="picker-link muted" onClick={() => pick('')}>
              Clear
            </button>
          ) : (
            <span />
          )}
          {todayAllowed && (
            <button type="button" className="picker-link" onClick={() => pick(todayIso)}>
              Today
            </button>
          )}
        </div>
      </PickerPopover>
    </>
  );
}

interface MonthPickerProps {
  id: string;
  value: string; // 'YYYY-MM'
  onChange: (value: string) => void;
  max?: string;
}

// Month selector with ‹ › arrows for flipping months and a year grid in a dropdown.
export function MonthPicker({ id, value, onChange, max }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [year, setYear] = useState(() => Number(value.slice(0, 4)));
  const trigger = useRef<HTMLButtonElement>(null);
  const maxYear = max ? Number(max.slice(0, 4)) : Infinity;

  const shift = (delta: number) => {
    const [y, m] = value.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const next = toMonth(d.getFullYear(), d.getMonth());
    if (!max || next <= max) onChange(next);
  };
  const atMax = !!max && value >= max;

  return (
    <div className="month-picker">
      <button type="button" className="month-step" onClick={() => shift(-1)} aria-label="Previous month">
        <i className="bi bi-chevron-left" aria-hidden />
      </button>
      <button
        ref={trigger}
        id={id}
        type="button"
        className={`month-trigger ${open ? 'open' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={(e) => {
          setKeyboard(e.detail === 0);
          setYear(Number(value.slice(0, 4)));
          setOpen((o) => !o);
        }}
      >
        <i className="bi bi-calendar3" aria-hidden />
        {formatMonth(value)}
      </button>
      <button type="button" className="month-step" onClick={() => shift(1)} disabled={atMax} aria-label="Next month">
        <i className="bi bi-chevron-right" aria-hidden />
      </button>

      <PickerPopover id={id} open={open} keyboard={keyboard} onClose={() => setOpen(false)} trigger={trigger}>
        <div className="month-grid-head">
          <button type="button" className="month-step" onClick={() => setYear((y) => y - 1)} aria-label="Previous year">
            <i className="bi bi-chevron-left" aria-hidden />
          </button>
          <span className="fw-bold">{year}</span>
          <button
            type="button"
            className="month-step"
            onClick={() => setYear((y) => y + 1)}
            disabled={year >= maxYear}
            aria-label="Next year"
          >
            <i className="bi bi-chevron-right" aria-hidden />
          </button>
        </div>
        <div className="month-grid">
          {MONTHS.map((label, i) => {
            const m = toMonth(year, i);
            return (
              <button
                key={label}
                type="button"
                className={`month-cell ${m === value ? 'selected' : ''} ${m === today().slice(0, 7) ? 'current' : ''}`}
                disabled={!!max && m > max}
                aria-pressed={m === value}
                onClick={() => {
                  onChange(m);
                  setOpen(false);
                  trigger.current?.focus();
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </PickerPopover>
    </div>
  );
}
