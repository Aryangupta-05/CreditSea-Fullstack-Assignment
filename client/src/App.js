import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import ReportDisplay from './components/ReportDisplay';
import ReportList from './components/ReportList';
import Notification from './components/Notification';

function App() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', duration = 5000, customId = null) => {
    const id = customId || Date.now();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const fetchReports = useCallback(async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/reports`);
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      addNotification('Failed to fetch reports. Please try again.', 'error');
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleFileUpload = async (file) => {
    setLoading(true);
    const processingNotificationId = Date.now();
    addNotification('Processing XML file...', 'info', 0, processingNotificationId);
    
    const formData = new FormData();
    formData.append('xmlFile', file);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setSelectedReport(result.data);
        fetchReports(); // Refresh the reports list
        
        // Remove the processing notification
        removeNotification(processingNotificationId);
        
        addNotification(
          `XML file processed successfully! Processing time: ${result.processingTime}ms`, 
          'success'
        );
      } else {
        const error = await response.json();
        
        // Remove the processing notification
        removeNotification(processingNotificationId);
        
        addNotification(`Error: ${error.error}`, 'error');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      
      // Remove the processing notification
      removeNotification(processingNotificationId);
      
      addNotification('Error uploading file. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReportSelect = (report) => {
    setSelectedReport(report);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>CreditSea - Credit Report Processor</h1>
        <p>Upload XML files to process credit reports and view detailed information</p>
      </header>

      <main className="App-main">
        <div className="container">
          <div className="upload-section">
            <FileUpload onFileUpload={handleFileUpload} loading={loading} />
          </div>

          <div className="content-section">
            <div className="reports-list">
              <h2>Previous Reports</h2>
              <ReportList 
                reports={reports} 
                onReportSelect={handleReportSelect}
                selectedReport={selectedReport}
              />
            </div>

            <div className="report-display">
              {selectedReport ? (
                <ReportDisplay report={selectedReport} />
              ) : (
                <div className="no-report">
                  <h3>Select a report to view details</h3>
                  <p>Upload a new XML file or select from the list above</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Notifications */}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

export default App;
