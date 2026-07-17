import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Spinner,
  FileUpload
} from '../../components/ui';
import { FileText, Star, Trash2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { getMyDocuments, uploadDocument, deleteDocument, setPrimaryDocument } from './services/mockData';

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    const data = await getMyDocuments();
    setDocuments(data);
    setLoading(false);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const newDoc = {
      documentType: 'Resume',
      fileName: file.name,
      fileUrl: '#',
      fileSizeKb: Math.round(file.size / 1024),
      isPrimary: documents.length === 0,
    };
    await uploadDocument(newDoc);
    await loadDocuments();
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    await deleteDocument(id);
    await loadDocuments();
  };

  const handleSetPrimary = async (id) => {
    await setPrimaryDocument(id);
    await loadDocuments();
  };

  const getParseStatusBadge = (status) => {
    if (!status) return null;
    switch(status) {
      case 'Completed':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-ai-50 px-2.5 py-0.5 text-xs font-semibold text-ai-700 ring-1 ring-ai-200 dark:bg-ai-500/20 dark:text-ai-300 dark:ring-ai-500/30">
            <CheckCircle2 size={12} className="text-ai-500" /> AI Parsed
          </div>
        );
      case 'Pending':
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-500/30">
            <Clock size={12} className="text-amber-500" /> Parsing...
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-red-200 dark:bg-red-500/20 dark:text-red-300 dark:ring-red-500/30">
            <AlertCircle size={12} className="text-red-500" /> Parse Failed
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <h2 className="text-h2 text-secondary-900 dark:text-white">My Documents</h2>
        <p className="text-body-sm text-secondary-600 dark:text-secondary-400 mt-2">Manage your resumes, cover letters, and portfolios.</p>
      </div>

      <div className="rounded-2xl border border-white/60 bg-white/75 p-4 sm:p-8 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark">
        <h3 className="text-h3 text-secondary-900 dark:text-white mb-6">Upload New Document</h3>
        <FileUpload 
          onFileSelect={handleUpload}
          accept=".pdf,.doc,.docx"
        />
        {uploading && <div className="mt-4 flex items-center gap-2 text-primary-600"><Spinner size="sm"/> Uploading...</div>}
      </div>

      <div className="space-y-4">
        <h3 className="text-h3 text-secondary-900 dark:text-white mb-4">Uploaded Documents</h3>
        {documents.map(doc => (
          <div key={doc.id} className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/60 bg-white/75 p-6 shadow-glass backdrop-blur-xl dark:border-white/10 dark:bg-secondary-950/55 dark:shadow-glass-dark transition-all duration-300 hover:shadow-glass-hover">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
                <FileText size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="text-body font-semibold text-secondary-900 dark:text-white">{doc.fileName}</h4>
                  {doc.isPrimary && (
                    <div className="flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700 dark:bg-primary-500/30 dark:text-primary-300">
                      <Star size={10} className="fill-primary-700 dark:fill-primary-300" /> Primary
                    </div>
                  )}
                  {doc.resume_parse_status && getParseStatusBadge(doc.resume_parse_status)}
                </div>
                <p className="text-caption text-secondary-500 dark:text-secondary-400 mt-1">
                  {doc.documentType} • {doc.fileSizeKb} KB • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!doc.isPrimary && (
                <Button variant="outline" size="sm" onClick={() => handleSetPrimary(doc.id)}>
                  Set as Primary
                </Button>
              )}
              <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => handleDelete(doc.id)}>
                <Trash2 size={18} />
              </Button>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="rounded-2xl border border-dashed border-secondary-300 p-12 text-center dark:border-secondary-700">
            <p className="text-body text-secondary-500 dark:text-secondary-400">No documents uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
