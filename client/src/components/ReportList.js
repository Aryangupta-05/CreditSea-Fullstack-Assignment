import React from 'react';

const ReportList = ({ reports, onReportSelect, selectedReport }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReportTitle = (report) => {
    if (report.basicDetails && report.basicDetails.name) {
      return report.basicDetails.name;
    }
    return `Report ${report._id ? report._id.slice(-6) : 'Unknown'}`;
  };

  if (reports.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
        <p>No reports found</p>
        <p style={{ fontSize: '0.9rem' }}>Upload an XML file to get started</p>
      </div>
    );
  }

  return (
    <div>
      {reports.map((report) => (
        <div
          key={report._id}
          className={`report-item ${
            selectedReport && selectedReport._id === report._id ? 'selected' : ''
          }`}
          onClick={() => onReportSelect(report)}
        >
          <h4>{getReportTitle(report)}</h4>
          <p>Credit Score: {report.basicDetails?.creditScore || 'N/A'}</p>
          <p>Total Accounts: {report.reportSummary?.totalAccounts || 0}</p>
          <p>Date: {formatDate(report.createdAt)}</p>
        </div>
      ))}
    </div>
  );
};

export default ReportList;

