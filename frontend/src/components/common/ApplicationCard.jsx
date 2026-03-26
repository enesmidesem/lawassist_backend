import { useState } from 'react';
import ApplicationBadge from './ApplicationBadge';
import applicationsApi from '../../api/applicationsApi';

export default function ApplicationCard({ application, onStatusChange }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!confirm('Bu başvuruyu onaylamak istediğinize emin misiniz? İlan kapatılacak ve diğer başvurular reddedilecektir.')) return;
    setLoading(true);
    try {
      await applicationsApi.approve(application.id);
      onStatusChange?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Onaylama başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Bu başvuruyu reddetmek istediğinize emin misiniz?')) return;
    setLoading(true);
    try {
      await applicationsApi.reject(application.id);
      onStatusChange?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Reddetme başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const applicant = application.applicant || {};

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-blue-100 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <h4 className="text-sm font-semibold text-gray-900">
            {applicant.first_name} {applicant.last_name}
          </h4>
          <ApplicationBadge status={application.status} />
        </div>
        {applicant.bar_association && (
          <p className="text-xs text-gray-400 mb-1">
            {applicant.bar_association} — {applicant.bar_number}
          </p>
        )}
        {application.note && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">"{application.note}"</p>
        )}
        <p className="text-xs text-gray-300 mt-1.5">
          {new Date(application.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
      {application.status === 'pending' && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleApprove} disabled={loading}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
            {loading ? '...' : 'Onayla'}
          </button>
          <button onClick={handleReject} disabled={loading}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-all disabled:opacity-50">
            {loading ? '...' : 'Reddet'}
          </button>
        </div>
      )}
    </div>
  );
}
