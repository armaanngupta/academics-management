import React, { useState } from 'react';
import './MarksheetList.css';

const MarksheetList = ({ marksheets, onEdit, onDelete, onToggleIssued }) => {
  const [openRemarksId, setOpenRemarksId] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [detailMarksheet, setDetailMarksheet] = useState(null);

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!marksheets || marksheets.length === 0) {
    return <div className="empty-state"><p>No marksheets found. Add one to get started!</p></div>;
  }

  const toggleRemarks = (id) => setOpenRemarksId((prev) => (prev === id ? null : id));

  const renderTypeTag = (type) => {
    const normalizedType = type === 'backlog' ? 'backlog' : 'regular';
    const label = normalizedType === 'backlog' ? 'Backlog' : 'Regular';

    return <span className={`type-tag ${normalizedType}`}>{label}</span>;
  };

  const handleConfirmAction = () => {
    if (!confirmState) return;
    if (confirmState.type === 'toggle') onToggleIssued(confirmState.id);
    if (confirmState.type === 'delete') onDelete(confirmState.id);
    setConfirmState(null);
  };

  return (
    <div className="marksheet-list">
      <h2>Marksheets ({marksheets.length})</h2>
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Enrollment No.</th>
              <th>Roll No.</th>
              <th>Marksheet No.</th>
              <th>Academic Year</th>
              <th>Session</th>
              <th>Subject</th>
              <th>Degree</th>
              <th>University</th>
              <th>Type</th>
              <th>Result</th>
              <th>Created On</th>
              <th>Issued On</th>
              <th>Issued By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {marksheets.map((marksheet) => {
              const remarksText = marksheet.remarks || marksheet.description || '';
              const hasRemarks = Boolean(remarksText);
              const isOpen = openRemarksId === marksheet._id;

              return (
                <React.Fragment key={marksheet._id}>
                  <tr className="clickable-row" onClick={() => setDetailMarksheet(marksheet)}>
                    <td>{marksheet.studentName}</td>
                    <td>{marksheet.enrollmentNumber || '—'}</td>
                    <td>{marksheet.rollNumber}</td>
                    <td>{marksheet.marksheetNumber || '—'}</td>
                    <td>{marksheet.academicYear}</td>
                    <td>{marksheet.session}</td>
                    <td>{marksheet.subject}</td>
                    <td>{marksheet.degree}</td>
                    <td>{marksheet.university}</td>
                    <td>{renderTypeTag(marksheet.type)}</td>
                    <td>
                      {marksheet.result ? (
                        <span className={`result-badge ${marksheet.result}`}>
                          {marksheet.result === 'pass' ? 'Pass' : 'Fail'}
                        </span>
                      ) : '—'}
                    </td>
                    <td>{formatDate(marksheet.createdAt)}</td>
                    <td>{marksheet.issued ? formatDate(marksheet.issuedAt) : '—'}</td>
                    <td>{marksheet.issued ? (marksheet.issuedBy || '—') : '—'}</td>
                    <td>
                      <button
                        className={`status-btn ${marksheet.issued ? 'issued' : 'pending'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const nextStatus = marksheet.issued ? 'pending' : 'issued';
                          setConfirmState({
                            type: 'toggle',
                            id: marksheet._id,
                            rollNumber: marksheet.rollNumber,
                            session: marksheet.session,
                            academicYear: marksheet.academicYear,
                            nextStatus,
                          });
                        }}
                      >
                        {marksheet.issued ? 'Issued' : 'Pending'}
                      </button>
                    </td>
                    <td className="actions" onClick={(e) => e.stopPropagation()}>
                      <button className="edit-btn" onClick={() => onEdit(marksheet)}>
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() =>
                          setConfirmState({
                            type: 'delete',
                            id: marksheet._id,
                            rollNumber: marksheet.rollNumber,
                            session: marksheet.session,
                            academicYear: marksheet.academicYear,
                          })
                        }
                      >
                        Delete
                      </button>
                      {hasRemarks && (
                        <button className="view-btn" onClick={() => toggleRemarks(marksheet._id)}>
                          {isOpen ? 'Hide remarks' : 'Remarks'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {hasRemarks && isOpen && (
                    <tr className="remarks-row">
                      <td colSpan="16">
                        <div className="remarks-box">
                          <div className="remarks-header">Remarks</div>
                          <p>{remarksText}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {confirmState && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Confirm {confirmState.type === 'toggle' ? 'status change' : 'delete'}</h3>
              <button className="ghost-btn" onClick={() => setConfirmState(null)}>Close</button>
            </div>
            <p className="modal-body">
              {confirmState.type === 'toggle'
                ? `Are you sure to mark the marksheet for ${confirmState.rollNumber} (${confirmState.session}, ${confirmState.academicYear}) as ${confirmState.nextStatus}?`
                : `Are you sure you want to delete the marksheet for ${confirmState.rollNumber} (${confirmState.session}, ${confirmState.academicYear})? This cannot be undone.`}
            </p>
            <div className="modal-actions">
              <button className="ghost-btn" onClick={() => setConfirmState(null)}>Cancel</button>
              <button className="primary-btn" onClick={handleConfirmAction}>
                {confirmState.type === 'toggle' ? 'Yes, update' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {detailMarksheet && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={() => setDetailMarksheet(null)}>
          <div className="modal-card detail-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Marksheet Details</h3>
              <button className="ghost-btn" onClick={() => setDetailMarksheet(null)}>Close</button>
            </div>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Student Name</span>
                <span className="detail-value">{detailMarksheet.studentName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Enrollment No.</span>
                <span className="detail-value">{detailMarksheet.enrollmentNumber || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Roll Number</span>
                <span className="detail-value">{detailMarksheet.rollNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Marksheet No.</span>
                <span className="detail-value">{detailMarksheet.marksheetNumber || '—'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">University</span>
                <span className="detail-value">{detailMarksheet.university}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Degree</span>
                <span className="detail-value">{detailMarksheet.degree}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Subject</span>
                <span className="detail-value">{detailMarksheet.subject}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Session</span>
                <span className="detail-value">{detailMarksheet.session}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Academic Year</span>
                <span className="detail-value">{detailMarksheet.academicYear}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Type</span>
                <span className="detail-value">{renderTypeTag(detailMarksheet.type)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Result</span>
                <span className="detail-value">
                  {detailMarksheet.result
                    ? <span className={`result-badge ${detailMarksheet.result}`}>{detailMarksheet.result === 'pass' ? 'Pass' : 'Fail'}</span>
                    : '—'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value">
                  <span className={`status-btn ${detailMarksheet.issued ? 'issued' : 'pending'}`} style={{ cursor: 'default' }}>
                    {detailMarksheet.issued ? 'Issued' : 'Pending'}
                  </span>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created On</span>
                <span className="detail-value">{formatDate(detailMarksheet.createdAt)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Issued On</span>
                <span className="detail-value">{detailMarksheet.issued ? formatDate(detailMarksheet.issuedAt) : '—'}</span>
              </div>
              {detailMarksheet.issued && (
                <div className="detail-item">
                  <span className="detail-label">Issued By</span>
                  <span className="detail-value">{detailMarksheet.issuedBy || '—'}</span>
                </div>
              )}
              {(detailMarksheet.remarks || detailMarksheet.description) && (
                <div className="detail-item detail-full">
                  <span className="detail-label">Remarks</span>
                  <span className="detail-value">{detailMarksheet.remarks || detailMarksheet.description}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksheetList;
