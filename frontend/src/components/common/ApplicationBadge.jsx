import { APPLICATION_STATUS } from '../../utils/constants';

export default function ApplicationBadge({ status }) {
  const s = APPLICATION_STATUS[status] || APPLICATION_STATUS.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.color}`}>
      {s.label}
    </span>
  );
}