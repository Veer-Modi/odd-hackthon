export interface NormalizedMonthYear {
  month?: number;
  year?: number;
}

const MONTH_YEAR_PATTERN = /^(\d{4})-(\d{1,2})$/;

function parseInteger(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    const numeric = Number.parseInt(trimmed, 10);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }

  return undefined;
}

export function normalizeMonthYear(
  monthInput?: unknown,
  yearInput?: unknown
): NormalizedMonthYear {
  let month = parseInteger(monthInput);
  let year = parseInteger(yearInput);

  if (typeof monthInput === 'string') {
    const match = monthInput.trim().match(MONTH_YEAR_PATTERN);
    if (match) {
      year = Number.parseInt(match[1], 10);
      month = Number.parseInt(match[2], 10);
    }
  }

  if (month !== undefined && (month < 1 || month > 12)) {
    month = undefined;
  }

  return { month, year };
}

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}
