import { useMemo, useState } from 'react';
import { BarChart3, FileSpreadsheet, Lightbulb, UploadCloud } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface UploadSummary {
  rows: number;
  columns: number;
  numeric_columns: number;
  missing_values: number;
  chart_data: Array<{ name: string; value: number }>;
  timeline: Array<{ name: string; value: number }>;
  preview: Array<Record<string, string | number>>;
}

interface UploadPrediction {
  ready: boolean;
  missing_columns: string[];
  counts: Record<string, number>;
  decision: {
    action: string;
    confidence: number;
    rationale: string;
    positive_share: number;
  };
}

interface UploadResult {
  summary: UploadSummary;
  prediction: UploadPrediction;
}

const chartColors = ['#10b981', '#14b8a6', '#84cc16', '#0ea5e9', '#f59e0b', '#ef4444', '#6366f1', '#22c55e'];

function formatPredictionLabel(label: string) {
  return label.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function DataUploadPanel() {
  const [result, setResult] = useState<UploadResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const predictionChart = useMemo(
    () =>
      result
        ? Object.entries(result.prediction.counts).map(([name, value]) => ({
            name: formatPredictionLabel(name),
            value,
          }))
        : [],
    [result],
  );

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze-file', {
        method: 'POST',
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'File analyze nahi ho payi.');
      }

      setResult(payload);
    } catch (uploadError) {
      setResult(null);
      setError(uploadError instanceof Error ? uploadError.message : 'File analyze nahi ho payi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-stack">
      <div className="panel upload-panel">
        <div className="panel-header">
          <h2 className="panel-title">
            <UploadCloud size={20} />
            CSV or Excel to Chart
          </h2>
          <span className="panel-badge">ML Ready</span>
        </div>

        <label className="upload-dropzone">
          <input type="file" accept=".csv,.xls,.xlsx" onChange={handleFileChange} />
          <FileSpreadsheet size={42} />
          <strong>{fileName || 'CSV/XLSX file choose karo'}</strong>
          <span>Upload ke baad automatic chart, table preview, prediction buckets, aur decision signal banega.</span>
        </label>

        {isLoading && <p className="upload-status">Analyzing file and running model...</p>}
        {error && <p className="upload-error">{error}</p>}
      </div>

      {result && (
        <>
          <div className="stats-grid">
            <div className="stat-card violet">
              <div className="stat-title">Rows</div>
              <div className="stat-value">{result.summary.rows.toLocaleString()}</div>
            </div>
            <div className="stat-card cyan">
              <div className="stat-title">Columns</div>
              <div className="stat-value">{result.summary.columns}</div>
            </div>
            <div className="stat-card orange">
              <div className="stat-title">Numeric Columns</div>
              <div className="stat-value">{result.summary.numeric_columns}</div>
            </div>
            <div className="stat-card pink">
              <div className="stat-title">Missing Values</div>
              <div className="stat-value">{result.summary.missing_values}</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="page-column">
              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">
                    <BarChart3 size={20} />
                    Numeric Average Chart
                  </h2>
                  <span className="panel-badge">Auto Chart</span>
                </div>
                <div className="upload-chart">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={result.summary.chart_data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.2)" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {result.summary.chart_data.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h2 className="panel-title">Data Preview</h2>
                  <span className="panel-badge">First 8 Rows</span>
                </div>
                <div className="table-scroll">
                  <table className="data-preview-table">
                    <thead>
                      <tr>
                        {Object.keys(result.summary.preview[0] || {}).map((column) => (
                          <th key={column}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.summary.preview.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, valueIndex) => (
                            <td key={`${index}-${valueIndex}`}>{String(value)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="page-column">
              <div className="panel decision-panel">
                <div className="panel-header">
                  <h2 className="panel-title">
                    <Lightbulb size={20} />
                    Decision Signal
                  </h2>
                  <span className="panel-badge">{result.prediction.ready ? 'Model Ran' : 'Needs Columns'}</span>
                </div>
                <div className="decision-action">{result.prediction.decision.action}</div>
                <div className="decision-confidence">{result.prediction.decision.confidence}% confidence</div>
                <p className="page-copy">{result.prediction.decision.rationale}</p>

                {!result.prediction.ready && (
                  <div className="missing-columns">
                    <strong>Missing model columns</strong>
                    <span>{result.prediction.missing_columns.slice(0, 8).join(', ')}</span>
                  </div>
                )}
              </div>

              {result.prediction.ready && (
                <div className="panel">
                  <div className="panel-header">
                    <h2 className="panel-title">Prediction Buckets</h2>
                    <span className="panel-badge">{result.prediction.decision.positive_share}% Positive</span>
                  </div>
                  <div className="upload-chart compact">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={predictionChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 185, 129, 0.2)" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
