import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { parseCsv, guessColumn } from '@/lib/csv';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Generic CSV importer: upload -> map columns -> preview -> insert.
 *
 * fields: [{ key, label, required?, aliases?: [], transform?: (v) => any }]
 * table: supabase table name
 * baseRow: object merged into every inserted row (e.g. { business_id })
 */
const CsvImporter = ({ open, onOpenChange, title = 'Import CSV', table, fields = [], baseRow = {}, onDone }) => {
  const fileRef = useRef(null);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [importing, setImporting] = useState(false);

  const reset = () => { setHeaders([]); setRows([]); setMapping({}); };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseCsv(text);
    if (!parsed.rows.length) { toast.error('CSV has no data rows'); return; }
    setHeaders(parsed.headers);
    setRows(parsed.rows);
    const auto = {};
    fields.forEach(f => { auto[f.key] = guessColumn(parsed.headers, f.key, f.aliases || [f.label]); });
    setMapping(auto);
  };

  const buildRows = () => {
    const out = [];
    rows.forEach(r => {
      const rec = { ...baseRow };
      let valid = true;
      fields.forEach(f => {
        const src = mapping[f.key];
        const raw = src ? r[src] : '';
        if (f.required && !raw) valid = false;
        if (raw === '' || raw === undefined) return;
        rec[f.key] = f.transform ? f.transform(raw) : raw;
      });
      if (valid) out.push(rec);
    });
    return out;
  };

  const handleImport = async () => {
    const payload = buildRows();
    if (!payload.length) { toast.error('No valid rows to import. Check required column mapping.'); return; }
    setImporting(true);
    try {
      // insert in chunks so large files do not time out
      for (let i = 0; i < payload.length; i += 200) {
        const { error } = await supabase.from(table).insert(payload.slice(i, i + 200));
        if (error) throw error;
      }
      toast.success(`Imported ${payload.length} record${payload.length > 1 ? 's' : ''}`);
      reset();
      onOpenChange(false);
      onDone?.();
    } catch (err) {
      console.error('CSV import failed:', err);
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const validCount = headers.length ? buildRows().length : 0;

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-primary" />{title}
          </DialogTitle>
        </DialogHeader>

        {!headers.length ? (
          <div className="mt-3 border border-dashed border-border rounded-xl p-8 text-center">
            <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-xs text-muted-foreground mb-3">
              Upload a .csv file exported from Excel, Google Sheets, Zoho, Tally or any other tool.
            </p>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
            <Button size="sm" className="h-8 text-xs" onClick={() => fileRef.current?.click()}>Choose CSV file</Button>
            <p className="text-[10px] text-muted-foreground mt-3">
              Required columns: {fields.filter(f => f.required).map(f => f.label).join(', ') || 'none'}
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            <div className="text-xs text-muted-foreground">
              {rows.length} rows found · map your columns below
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fields.map(f => (
                <div key={f.key}>
                  <Label className="text-xs">{f.label}{f.required && ' *'}</Label>
                  <Select value={mapping[f.key] || '__none'} onValueChange={(v) => setMapping(m => ({ ...m, [f.key]: v === '__none' ? '' : v }))}>
                    <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Select column" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none" className="text-xs">— skip —</SelectItem>
                      {headers.map(h => <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-border overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead className="bg-muted/50">
                  <tr>{fields.map(f => <th key={f.key} className="text-left p-2 font-medium">{f.label}</th>)}</tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      {fields.map(f => <td key={f.key} className="p-2 truncate max-w-[140px]">{mapping[f.key] ? r[mapping[f.key]] : '—'}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />{validCount} of {rows.length} rows ready
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={reset}>Change file</Button>
                <Button size="sm" className="h-8 text-xs" onClick={handleImport} disabled={importing || !validCount}>
                  {importing ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />Importing…</> : `Import ${validCount}`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CsvImporter;
