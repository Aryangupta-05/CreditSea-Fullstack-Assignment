import React, { useState, useRef } from 'react';

const FileUpload = ({ onFileUpload, loading }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type === 'text/xml' || file.type === 'application/xml' || file.name.endsWith('.xml')) {
      onFileUpload(file);
    } else {
      alert('Please select a valid XML file');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="file-upload">
      <div
        className={`upload-content ${dragActive ? 'dragover' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="upload-icon">
          {loading ? (
            <div className="upload-spinner">
              <div className="spinner-ring"></div>
            </div>
          ) : (
            '📄'
          )}
        </div>
        <div className="upload-text">
          {loading ? (
            <div className="loading">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Processing XML file...</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Please wait while we extract your credit data
              </p>
            </div>
          ) : (
            <>
              <p>Drag and drop your XML file here, or click to browse</p>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                Only XML files are accepted
              </p>
            </>
          )}
        </div>
        <button
          type="button"
          className="upload-button"
          disabled={loading}
          onClick={(e) => {
            e.stopPropagation();
            openFileDialog();
          }}
        >
          {loading ? 'Processing...' : 'Choose XML File'}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml,text/xml,application/xml"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default FileUpload;
