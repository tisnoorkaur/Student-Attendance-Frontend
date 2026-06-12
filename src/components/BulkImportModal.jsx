import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, AlertTriangle, CheckCircle, FileText, Loader2, Clipboard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BulkImportModal({ onImportComplete, onCancel }) {
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handlePasteSample = () => {
    const sample = `Roll Number,Student Name,Class-Section\n1,Alice Johnson,10-A\n2,Bob Smith,10-A\n1,Charlie Brown,10-B\n2,David Miller,10-B`;
    setCsvText(sample);
  };

  const processCsv = (text) => {
    if (!text.trim()) {
      toast.error('Please enter CSV data or upload a file first');
      return;
    }

    setIsProcessing(true);
    setResults(null);

    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: async (parsed) => {
        const rows = parsed.data;
        if (rows.length === 0) {
          toast.error('No valid rows found in CSV');
          setIsProcessing(false);
          return;
        }

        // Map headers to normalized keys (case-insensitive checks)
        const studentsToImport = rows.map((row) => {
          // Look for headers that match name, roll, class
          const nameKey = Object.keys(row).find((k) => k.toLowerCase().includes('name'));
          const rollKey = Object.keys(row).find((k) => k.toLowerCase().includes('roll') || k.toLowerCase().includes('number'));
          const classKey = Object.keys(row).find((k) => k.toLowerCase().includes('class') || k.toLowerCase().includes('section'));

          return {
            name: nameKey ? row[nameKey] : '',
            rollNumber: rollKey ? row[rollKey] : '',
            classSection: classKey ? row[classKey] : '',
          };
        });

        try {
          const importResult = await onImportComplete(studentsToImport);
          setResults(importResult);
          if (importResult.errors.length === 0) {
            toast.success(`Successfully enrolled ${importResult.successCount} students!`);
          } else if (importResult.successCount > 0) {
            toast.success(`Enrolled ${importResult.successCount} students with some errors.`);
          } else {
            toast.error('Import failed. Please review errors.');
          }
        } catch (err) {
          toast.error('Failed to import students database records');
          console.error(err);
        } finally {
          setIsProcessing(false);
        }
      },
      error: (err) => {
        toast.error('CSV Parsing Error: ' + err.message);
        setIsProcessing(false);
      },
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      processCsv(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5">
      {!results ? (
        <div className="space-y-4">
          <p className="text-xs dark:text-gray-400 text-gray-500">
            Import multiple students quickly. Upload a CSV file or paste raw comma-separated text in the area below.
          </p>

          {/* Sample Format */}
          <div className="p-3.5 rounded-xl dark:bg-white/5 bg-gray-55 border dark:border-white/5 border-gray-150 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider dark:text-gray-400 text-gray-500">Required CSV Format</span>
              <button
                onClick={handlePasteSample}
                className="text-[10px] font-semibold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 active:scale-95 transition-all"
                type="button"
              >
                <Clipboard className="w-3 h-3" /> Paste Sample Code
              </button>
            </div>
            <pre className="text-[11px] font-mono dark:text-indigo-300 text-indigo-700 leading-snug overflow-x-auto select-all p-1">
              Roll Number,Student Name,Class-Section{"\n"}
              1,Alice Johnson,10-A{"\n"}
              2,Bob Smith,10-A
            </pre>
          </div>

          {/* File Upload drag area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed dark:border-white/10 border-gray-300 hover:border-indigo-500 dark:hover:border-indigo-500/50 rounded-2xl p-6 text-center cursor-pointer transition-colors dark:bg-white/5 bg-gray-50/50 group"
          >
            <Upload className="w-8 h-8 text-gray-400 group-hover:text-indigo-500 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-semibold dark:text-white text-gray-800">Upload CSV File</p>
            <p className="text-xs dark:text-gray-400 text-gray-500 mt-1">Click to select file (.csv)</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t dark:border-white/5 border-gray-200"></div>
            <span className="flex-shrink mx-4 text-[10px] uppercase font-bold dark:text-gray-400 text-gray-500 select-none">Or Paste Raw CSV</span>
            <div className="flex-grow border-t dark:border-white/5 border-gray-200"></div>
          </div>

          {/* Raw Text area */}
          <div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Paste comma-separated data here..."
              rows="6"
              className="input-field font-mono text-xs p-3 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="button" onClick={onCancel} className="btn-ghost dark:text-gray-300 text-gray-600 flex-1">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => processCsv(csvText)}
              disabled={isProcessing}
              className="btn-primary flex items-center justify-center gap-2 flex-1 font-semibold disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {isProcessing ? 'Processing...' : 'Run Import'}
            </button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-4">
          <div className="p-4 rounded-xl dark:bg-white/5 bg-gray-50 border dark:border-white/5 border-gray-150 flex items-center gap-3">
            {results.errors.length === 0 ? (
              <CheckCircle className="w-8 h-8 text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-amber-500 flex-shrink-0" />
            )}
            <div>
              <p className="font-bold text-sm dark:text-white text-gray-800">Roster Import Completed</p>
              <p className="text-xs dark:text-gray-400 text-gray-500 mt-0.5">
                Successfully enrolled <strong className="text-emerald-500 font-bold">{results.successCount}</strong> students.
                {results.errors.length > 0 && (
                  <> Failed to enroll <strong className="text-rose-500 font-bold">{results.errors.length}</strong> records.</>
                )}
              </p>
            </div>
          </div>

          {results.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold dark:text-white text-gray-800 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Validation Warnings ({results.errors.length})
              </h4>
              <div className="max-h-[220px] overflow-y-auto rounded-xl border dark:border-white/5 border-gray-150 divide-y dark:divide-white/5 divide-gray-100 p-2 dark:bg-white/5 bg-white space-y-1">
                {results.errors.map((error, idx) => (
                  <p key={idx} className="text-[11px] font-medium text-rose-500 py-1.5 px-2">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="flex pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="btn-primary w-full py-2.5 font-bold"
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
