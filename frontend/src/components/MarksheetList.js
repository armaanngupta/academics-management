import React, { useState } from 'react';
import './MarksheetList.css';

const MarksheetList = ({ marksheets, onEdit, onDelete, onToggleIssued }) => {
  const [openRemarksId, setOpenRemarksId] = useState(null);
  const [confirmState, setConfirmState] = useState(null);

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!marksheets || marksheets.length === 0) {
    return (
      <div className="empty-state">
        <p>No marksheets found. Add one to get started!</p>
      </div>
    );
  }

  const toggleRemarks = (id) => {
    setOpenRemarksId((prev) => (prev === id ? null : id));
  };

  const handleConfirmAction = () => {
    if (!confirmState) return;
    if (confirmState.type === 'toggle') {
      onToggleIssued(confirmState.id);
    }
    if (confirmState.type === 'delete') {
      onDelete(confirmState.id);
    }
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
              <th>Roll Number</th>
              <th>Academic Year</th>
              <th>Session</th>
              <th>Subject</th>
              <th>Degree</th>
              <th>University</th>
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
                  <tr>
                    <td>{marksheet.studentName}</td>
                    <td>{marksheet.rollNumber}</td>
                    <td>{marksheet.academicYear}</td>
                    <td>{marksheet.session}</td>
                    <td>{marksheet.subject}</td>
                    <td>{marksheet.degree}</td>
                    <td>{marksheet.university}</td>
                    <td>{formatDate(marksheet.createdAt)}</td>
                    <td>{marksheet.issued ? formatDate(marksheet.issuedAt) : '—'}</td>
                    <td>{marksheet.issued ? (marksheet.issuedBy || '—') : '—'}</td>
                    <td>
                      <button
                        className={`status-btn ${marksheet.issued ? 'issued' : 'pending'}`}
                        onClick={() => {
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
                    <td className="actions">
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
                          {isOpen ? 'Hide remarks' : 'Show remarks'}
                        </button>
                      )}
                    </td>
                  </tr>
                  {hasRemarks && isOpen && (
                    <tr className="remarks-row">
                      <td colSpan="9">
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
              <h3>Confirm status change</h3>
              <button className="ghost-btn" onClick={() => setConfirmState(null)}>
                Close
              </button>
            </div>
            <p className="modal-body">
              {confirmState.type === 'toggle'
                ? `Are you sure to mark marksheet of student with ${confirmState.rollNumber} for ${confirmState.session} of ${confirmState.academicYear} academic year as ${confirmState.nextStatus}?`
                : `Are you sure you want to delete the marksheet of student with ${confirmState.rollNumber} for ${confirmState.session} of ${confirmState.academicYear} academic year? This cannot be undone.`}
            </p>
            <div className="modal-actions">
              <button className="ghost-btn" onClick={() => setConfirmState(null)}>
                Cancel
              </button>
              <button className="primary-btn" onClick={handleConfirmAction}>
                {confirmState.type === 'toggle' ? 'Yes, update' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarksheetList;
