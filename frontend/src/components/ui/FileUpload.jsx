import PropTypes from 'prop-types';
import { useRef, useState, useCallback, useId } from 'react';
import { UploadCloud, X, FileText } from 'lucide-react';

/**
 * Formats a byte size into a human-readable string (KB / MB).
 * @param {number} bytes
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * FileUpload — dropzone-style file picker with drag-over highlighting,
 * file-type/size validation, and an uploaded-file preview with a remove button.
 *
 * This component manages its own drag state internally, but delegates the
 * actual file decision to the parent via `onFileSelect`.
 *
 * @param {function}      onFileSelect  – Called with a `File` object on valid selection,
 *                                        or `null` when the file is removed.
 * @param {string}        [accept]      – MIME types or extensions (e.g. '.pdf,.doc,.docx').
 * @param {number}        [maxSizeMB]   – Maximum file size in megabytes.
 * @param {File|null}     [currentFile] – Already-uploaded file (controlled).
 * @param {string}        [error]       – External error message to show below the zone.
 * @param {string}        [className]   – Extra wrapper classes.
 */
export function FileUpload({
  onFileSelect,
  accept = '.pdf,.doc,.docx',
  maxSizeMB = 5,
  currentFile = null,
  error: externalError = '',
  className = '',
}) {
  const inputRef = useRef(null);
  const dropId = useId();

  const [isDragOver, setIsDragOver] = useState(false);
  const [internalError, setInternalError] = useState('');

  const displayError = externalError || internalError;

  /** Validate a File object; returns an error string or null. */
  const validate = useCallback(
    (file) => {
      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        return `File exceeds ${maxSizeMB} MB limit.`;
      }
      if (accept) {
        const acceptedExtensions = accept
          .split(',')
          .map((s) => s.trim().toLowerCase());
        const fileExt = `.${file.name.split('.').pop().toLowerCase()}`;
        if (!acceptedExtensions.includes(fileExt)) {
          return `Unsupported file type. Accepted: ${accept}`;
        }
      }
      return null;
    },
    [accept, maxSizeMB]
  );

  const processFile = useCallback(
    (file) => {
      const err = validate(file);
      if (err) {
        setInternalError(err);
        onFileSelect(null);
      } else {
        setInternalError('');
        onFileSelect(file);
      }
    },
    [validate, onFileSelect]
  );

  /* ── Handlers ─────────────────────────────────────────────────────────── */

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };
  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset the input value so the same file can be re-selected after removal.
    e.target.value = '';
  };
  const handleRemove = () => {
    setInternalError('');
    onFileSelect(null);
  };

  const hasError = Boolean(displayError);

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Hidden native file input */}
      <input
        ref={inputRef}
        id={dropId}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="sr-only"
        aria-label="File upload"
      />

      {currentFile ? (
        /* ── Uploaded state ────────────────────────────────────────────── */
        <div className="flex items-center gap-3 rounded-dropdown border border-secondary-200 bg-secondary-50 px-4 py-3 transition-colors duration-base">
          <FileText size={20} strokeWidth={1.75} className="shrink-0 text-primary-500" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body-sm font-semibold text-secondary-800">
              {currentFile.name}
            </p>
            <p className="text-caption text-secondary-500">{formatBytes(currentFile.size)}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove file"
            className={[
              'shrink-0 rounded-full p-1 text-secondary-400',
              'hover:text-danger-500 hover:bg-danger-50',
              'transition-colors duration-fast focus-ring',
            ].join(' ')}
          >
            <X size={16} strokeWidth={1.75} />
          </button>
        </div>
      ) : (
        /* ── Empty / drop state ────────────────────────────────────────── */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-label="Upload file — click or drag and drop"
          className={[
            'flex flex-col items-center justify-center gap-3 rounded-dropdown border-2 border-dashed',
            'px-6 py-10 text-center transition-colors duration-base cursor-pointer',
            'focus-ring',
            hasError
              ? 'border-danger-400 bg-danger-50'
              : isDragOver
              ? 'border-primary-500 bg-primary-50'
              : 'border-secondary-300 bg-white hover:border-secondary-400 hover:bg-secondary-50',
          ].join(' ')}
        >
          <UploadCloud
            size={36}
            strokeWidth={1.75}
            className={[
              'transition-colors duration-base',
              hasError
                ? 'text-danger-400'
                : isDragOver
                ? 'text-primary-500'
                : 'text-secondary-400',
            ].join(' ')}
          />
          <div>
            <p className="text-body-sm font-semibold text-secondary-700">
              Click to upload{' '}
              <span className="text-primary-600">or drag and drop</span>
            </p>
            <p className="mt-0.5 text-caption text-secondary-400">
              {accept} &nbsp;·&nbsp; max {maxSizeMB} MB
            </p>
          </div>
        </button>
      )}

      {/* Error message */}
      {hasError && (
        <p className="text-caption text-danger-600">{displayError}</p>
      )}
    </div>
  );
}

FileUpload.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  accept: PropTypes.string,
  maxSizeMB: PropTypes.number,
  currentFile: PropTypes.instanceOf(File),
  error: PropTypes.string,
  className: PropTypes.string,
};

export default FileUpload;
