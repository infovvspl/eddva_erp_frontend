import { useState } from 'react';
import { Barcode, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import type { BookCopy } from '../../types/library.types';

interface BarcodeScannerProps {
  onScan: (barcode: string) => Promise<BookCopy>;
}

export default function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const { t } = useTranslation('library');
  const [barcode, setBarcode] = useState('');
  const [result, setResult] = useState<BookCopy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const copy = await onScan(barcode.trim());
      setResult(copy);
      setBarcode('');
    } catch (err: any) {
      setError(err.message || t('copies.barcodeScanner.failedToScan'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setError(null);
  };

  return (
    <Card className="border-slate-200">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Barcode className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-900">{t('copies.barcodeScanner.title')}</h3>
        </div>

        <form onSubmit={handleScan} className="flex gap-2 mb-4">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder={t('copies.barcodeScanner.placeholder')}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <Button type="submit" variant="primary" disabled={isLoading || !barcode.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {t('copies.barcodeScanner.scan')}
          </Button>
        </form>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <XCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
            <button
              onClick={handleClear}
              className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
            >
              {t('copies.barcodeScanner.clear')}
            </button>
          </div>
        )}

        {result && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t('copies.barcodeScanner.copyFound')}</p>
              <p className="text-xs text-green-600">
                {t('copies.barcodeScanner.resultSummary', { barcode: result.barcode, location: result.rack_location, status: result.status })}
              </p>
            </div>
            <button
              onClick={handleClear}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              {t('copies.barcodeScanner.clear')}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
