import React from 'react';

const ReportDisplay = ({ report }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!report) {
    return (
      <div className="no-report">
        <h3>No report selected</h3>
        <p>Please select a report from the list to view details</p>
      </div>
    );
  }

  return (
    <div className="report-display">
      <h2>Credit Report Details</h2>
      
      {/* Basic Details Section */}
      <div className="section">
        <h3>Basic Details</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Name</label>
            <span>{report.basicDetails?.name || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <label>Mobile Phone</label>
            <span>{report.basicDetails?.mobilePhone || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <label>PAN</label>
            <span>{report.basicDetails?.pan || 'N/A'}</span>
          </div>
          <div className="detail-item">
            <label>Credit Score</label>
            <span style={{ 
              color: (report.basicDetails?.creditScore || 0) >= 700 ? '#28a745' : 
                     (report.basicDetails?.creditScore || 0) >= 600 ? '#ffc107' : '#dc3545',
              fontWeight: 'bold'
            }}>
              {report.basicDetails?.creditScore || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Report Summary Section */}
      <div className="section">
        <h3>Report Summary</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Total Accounts</label>
            <span>{report.reportSummary?.totalAccounts || 0}</span>
          </div>
          <div className="detail-item">
            <label>Active Accounts</label>
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>
              {report.reportSummary?.activeAccounts || 0}
            </span>
          </div>
          <div className="detail-item">
            <label>Closed Accounts</label>
            <span>{report.reportSummary?.closedAccounts || 0}</span>
          </div>
          <div className="detail-item">
            <label>Current Balance</label>
            <span>{formatCurrency(report.reportSummary?.currentBalance)}</span>
          </div>
          <div className="detail-item">
            <label>Secured Accounts Amount</label>
            <span>{formatCurrency(report.reportSummary?.securedAccountsAmount)}</span>
          </div>
          <div className="detail-item">
            <label>Unsecured Accounts Amount</label>
            <span>{formatCurrency(report.reportSummary?.unsecuredAccountsAmount)}</span>
          </div>
          <div className="detail-item">
            <label>Last 7 Days Credit Enquiries</label>
            <span>{report.reportSummary?.last7DaysCreditEnquiries || 0}</span>
          </div>
        </div>
      </div>

      {/* Credit Accounts Information Section */}
      <div className="section">
        <h3>Credit Accounts Information</h3>
        {report.creditAccounts && report.creditAccounts.length > 0 ? (
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Credit Card Type</th>
                <th>Bank</th>
                <th>Address</th>
                <th>Account Number</th>
                <th>Amount Overdue</th>
                <th>Current Balance</th>
              </tr>
            </thead>
            <tbody>
              {report.creditAccounts.map((account, index) => (
                <tr key={index}>
                  <td>{account.creditCard || 'N/A'}</td>
                  <td>{account.bank || 'N/A'}</td>
                  <td style={{ maxWidth: '200px', wordWrap: 'break-word' }}>
                    {account.address || 'N/A'}
                  </td>
                  <td>{account.accountNumber || 'N/A'}</td>
                  <td style={{ 
                    color: (account.amountOverdue || 0) > 0 ? '#dc3545' : '#28a745',
                    fontWeight: (account.amountOverdue || 0) > 0 ? 'bold' : 'normal'
                  }}>
                    {formatCurrency(account.amountOverdue)}
                  </td>
                  <td>{formatCurrency(account.currentBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>
            No credit account information available
          </p>
        )}
      </div>

      {/* Report Metadata */}
      <div className="section">
        <h3>Report Information</h3>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Report Date</label>
            <span>{formatDate(report.reportDate)}</span>
          </div>
          <div className="detail-item">
            <label>Processed On</label>
            <span>{formatDate(report.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDisplay;

