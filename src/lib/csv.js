// Lightweight CSV parse/serialize helpers (no external deps).

export const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  const pushField = () => { row.push(field); field = ''; };
  const pushRow = () => { rows.push(row); row = []; };

  const src = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') { inQuotes = true; continue; }
    if (ch === ',') { pushField(); continue; }
    if (ch === '\n') { pushField(); pushRow(); continue; }
    field += ch;
  }
  pushField();
  if (row.length > 1 || row[0] !== '') pushRow();

  const nonEmpty = rows.filter(r => r.some(c => String(c).trim() !== ''));
  if (nonEmpty.length === 0) return { headers: [], rows: [] };

  const headers = nonEmpty[0].map(h => String(h).trim());
  const dataRows = nonEmpty.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] ?? '').trim(); });
    return obj;
  });
  return { headers, rows: dataRows };
};

const escapeCell = (value) => {
  const s = value === null || value === undefined ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCsv = (rows, columns) => {
  if (!rows?.length) return (columns || []).join(',');
  const cols = columns || Object.keys(rows[0]);
  const lines = [cols.join(',')];
  rows.forEach(r => lines.push(cols.map(c => escapeCell(r[c])).join(',')));
  return lines.join('\n');
};

export const downloadCsv = (filename, rows, columns) => {
  const blob = new Blob([toCsv(rows, columns)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Guess a source column for a target field by fuzzy name match.
export const guessColumn = (headers, field, aliases = []) => {
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  const targets = [field, ...aliases].map(norm);
  return headers.find(h => targets.includes(norm(h))) || '';
};
