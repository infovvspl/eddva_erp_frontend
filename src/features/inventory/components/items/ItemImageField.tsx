import { useEffect, useState } from 'react';
import { Upload } from 'lucide-react';
import { getItemImageObjectUrl, uploadItemImage } from '../../api/items.api';
import { getApiErrorMessage } from '../../utils/errors';

interface ItemImageFieldProps {
  /** Currently stored path (what gets saved as `image_url`), if any. */
  value?: string | null;
  onChange: (storedPath: string) => void;
}

/** Upload picker + preview for an item photo. Uploads immediately on select,
 * mirroring the rest of the form only holding the resulting stored path. */
export default function ItemImageField({ value, onChange }: ItemImageFieldProps) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [existingPreview, setExistingPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Render the already-saved image (edit flow) via the authenticated endpoint.
  useEffect(() => {
    if (localPreview || !value) {
      setExistingPreview(null);
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    getItemImageObjectUrl(value)
      .then((url) => {
        if (cancelled) return;
        objectUrl = url;
        setExistingPreview(url);
      })
      .catch(() => setExistingPreview(null));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [value, localPreview]);

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const handleSelect = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    try {
      const storedPath = await uploadItemImage(file);
      onChange(storedPath);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to upload image'));
      URL.revokeObjectURL(preview);
      setLocalPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const shown = localPreview ?? existingPreview;

  return (
    <div className="flex items-center gap-4">
      <div className="h-20 w-20 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-200">
        {shown ? (
          <img src={shown} alt="Item" className="h-full w-full object-cover" />
        ) : (
          <Upload className="h-6 w-6 text-slate-400" />
        )}
      </div>
      <div className="space-y-1">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
          disabled={uploading}
          className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
        />
        <p className="text-xs text-slate-400">JPEG, PNG or WebP, up to 2MB{uploading ? ' — uploading…' : ''}</p>
      </div>
    </div>
  );
}
