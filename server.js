const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const xml2js = require('xml2js');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Enhanced logging utility
const log = {
  info: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`, error ? error.stack || error : '');
  },
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  success: (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✅ SUCCESS: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

// MongoDB connection
mongoose.connect('mongodb+srv://aryangupta050903:onnbKSyk8EBBm4Nz@cluster0.ptfxlcs.mongodb.net/creditsea?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// MongoDB connection event handlers
mongoose.connection.on('connected', () => {
  log.success('Connected to MongoDB Atlas successfully!');
});

mongoose.connection.on('error', (err) => {
  log.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  log.warn('MongoDB disconnected');
});

// Credit Report Schema
const creditReportSchema = new mongoose.Schema({
  basicDetails: {
    name: String,
    mobilePhone: String,
    pan: String,
    creditScore: Number
  },
  reportSummary: {
    totalAccounts: Number,
    activeAccounts: Number,
    closedAccounts: Number,
    currentBalance: Number,
    securedAccountsAmount: Number,
    unsecuredAccountsAmount: Number,
    last7DaysCreditEnquiries: Number
  },
  creditAccounts: [{
    creditCard: String,
    bank: String,
    address: String,
    accountNumber: String,
    amountOverdue: Number,
    currentBalance: Number
  }],
  reportDate: Date,
  createdAt: { type: Date, default: Date.now }
});

const CreditReport = mongoose.model('CreditReport', creditReportSchema);

// Multer configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/xml' || file.mimetype === 'application/xml') {
      cb(null, true);
    } else {
      cb(new Error('Only XML files are allowed'), false);
    }
  }
});

// XML Parser function
function parseXMLData(xmlData) {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser({ 
      explicitArray: false,
      trim: true,
      normalize: true,
      normalizeTags: false,
      mergeAttrs: false
    });
    
    parser.parseString(xmlData, (err, result) => {
      if (err) {
        log.error('XML parsing error', { 
          error: err.message,
          line: err.line,
          column: err.column
        });
        reject(new Error(`XML parsing failed: ${err.message} at line ${err.line}, column ${err.column}`));
      } else {
        resolve(result);
      }
    });
  });
}

// Extract data from parsed XML
function extractCreditData(parsedXML) {
  try {
    const response = parsedXML.INProfileResponse;
    const currentApp = response.Current_Application.Current_Application_Details;
    const caisSummary = response.CAIS_Account.CAIS_Summary;
    const caisAccounts = response.CAIS_Account.CAIS_Account_DETAILS;
    const score = response.SCORE;

    // Handle case where CAIS_Account_DETAILS might be a single object or array
    const accountsArray = caisAccounts ? (Array.isArray(caisAccounts) ? caisAccounts : [caisAccounts]) : [];

    // Basic Details
    const basicDetails = {
      name: `${currentApp.Current_Applicant_Details.First_Name} ${currentApp.Current_Applicant_Details.Last_Name}`,
      mobilePhone: currentApp.Current_Applicant_Details.MobilePhoneNumber,
      pan: currentApp.Current_Applicant_Details.IncomeTaxPan || 
           (accountsArray && accountsArray[0] && accountsArray[0].CAIS_Holder_Details ? 
            accountsArray[0].CAIS_Holder_Details.Income_TAX_PAN : ''),
      creditScore: score ? parseInt(score.BureauScore) : 0
    };

    // Report Summary
    const reportSummary = {
      totalAccounts: parseInt(caisSummary.Credit_Account.CreditAccountTotal) || 0,
      activeAccounts: parseInt(caisSummary.Credit_Account.CreditAccountActive) || 0,
      closedAccounts: parseInt(caisSummary.Credit_Account.CreditAccountClosed) || 0,
      currentBalance: parseInt(caisSummary.Total_Outstanding_Balance.Outstanding_Balance_All) || 0,
      securedAccountsAmount: parseInt(caisSummary.Total_Outstanding_Balance.Outstanding_Balance_Secured) || 0,
      unsecuredAccountsAmount: parseInt(caisSummary.Total_Outstanding_Balance.Outstanding_Balance_UnSecured) || 0,
      last7DaysCreditEnquiries: parseInt(response.TotalCAPS_Summary.TotalCAPSLast7Days) || 0
    };

    // Credit Accounts
    const creditAccounts = [];
    if (accountsArray && accountsArray.length > 0) {
      accountsArray.forEach(account => {
        const address = account.CAIS_Holder_Address_Details ? 
          `${account.CAIS_Holder_Address_Details.First_Line_Of_Address_non_normalized || ''} ${account.CAIS_Holder_Address_Details.Second_Line_Of_Address_non_normalized || ''} ${account.CAIS_Holder_Address_Details.City_non_normalized || ''}`.trim() : '';
        
        creditAccounts.push({
          creditCard: account.Account_Type === '10' ? 'Credit Card' : 'Other',
          bank: account.Subscriber_Name || '',
          address: address,
          accountNumber: account.Account_Number || '',
          amountOverdue: parseInt(account.Amount_Past_Due) || 0,
          currentBalance: parseInt(account.Current_Balance) || 0
        });
      });
    }

    return {
      basicDetails,
      reportSummary,
      creditAccounts,
      reportDate: new Date()
    };
  } catch (error) {
    throw new Error(`Error extracting data: ${error.message}`);
  }
}

// Routes
app.post('/api/upload', upload.single('xmlFile'), async (req, res) => {
  const startTime = Date.now();
  
  try {
    log.info('File upload request received', {
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      contentType: req.file?.mimetype
    });

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      log.error('MongoDB not connected', { state: mongoose.connection.readyState });
      return res.status(500).json({ 
        error: 'Database connection not available',
        code: 'DB_CONNECTION_ERROR'
      });
    }

    if (!req.file) {
      log.warn('No file uploaded');
      return res.status(400).json({ 
        error: 'No file uploaded',
        code: 'NO_FILE'
      });
    }

    // Validate file type
    if (!req.file.mimetype.includes('xml') && !req.file.originalname.endsWith('.xml')) {
      log.warn('Invalid file type uploaded', { 
        fileName: req.file.originalname,
        mimeType: req.file.mimetype 
      });
      return res.status(400).json({ 
        error: 'Only XML files are allowed',
        code: 'INVALID_FILE_TYPE'
      });
    }

    log.info('Processing XML file', { fileName: req.file.originalname });
    const xmlData = req.file.buffer.toString('utf8');
    
    // Validate XML content
    if (!xmlData.trim()) {
      log.warn('Empty XML file uploaded');
      return res.status(400).json({ 
        error: 'XML file is empty',
        code: 'EMPTY_FILE'
      });
    }

    const parsedXML = await parseXMLData(xmlData);
    
    // Validate parsed XML structure
    if (!parsedXML || !parsedXML.INProfileResponse) {
      log.error('Invalid XML structure - missing INProfileResponse');
      return res.status(400).json({ 
        error: 'Invalid XML structure - missing required elements',
        code: 'INVALID_XML_STRUCTURE'
      });
    }
    
    const extractedData = extractCreditData(parsedXML);
    
    log.info('Saving to database', { 
      reportId: extractedData.basicDetails?.name || 'Unknown'
    });
    
    const creditReport = new CreditReport(extractedData);
    await creditReport.save();
    
    const processingTime = Date.now() - startTime;
    log.success('XML file processed successfully', {
      reportId: creditReport._id,
      processingTime: `${processingTime}ms`,
      extractedFields: {
        basicDetails: Object.keys(extractedData.basicDetails || {}),
        reportSummary: Object.keys(extractedData.reportSummary || {}),
        creditAccounts: extractedData.creditAccounts?.length || 0
      }
    });

    res.json({ 
      message: 'XML file processed successfully',
      reportId: creditReport._id,
      data: extractedData,
      processingTime: processingTime
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    log.error('Error processing XML file', {
      error: error.message,
      stack: error.stack,
      processingTime: `${processingTime}ms`,
      fileName: req.file?.originalname
    });
    
    // Return appropriate error based on error type
    if (error.message.includes('XML')) {
      res.status(400).json({ 
        error: 'Invalid XML file format',
        code: 'INVALID_XML',
        details: error.message
      });
    } else if (error.message.includes('Database')) {
      res.status(500).json({ 
        error: 'Database error occurred',
        code: 'DATABASE_ERROR',
        details: error.message
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error.message
      });
    }
  }
});

app.get('/api/reports', async (req, res) => {
  try {
    log.info('Fetching all reports');
    const reports = await CreditReport.find().sort({ createdAt: -1 });
    log.success('Reports fetched successfully', { count: reports.length });
    res.json(reports);
  } catch (error) {
    log.error('Error fetching reports', error);
    res.status(500).json({ 
      error: 'Failed to fetch reports',
      code: 'FETCH_REPORTS_ERROR'
    });
  }
});

app.get('/api/reports/:id', async (req, res) => {
  try {
    log.info('Fetching report by ID', { reportId: req.params.id });
    const report = await CreditReport.findById(req.params.id);
    if (!report) {
      log.warn('Report not found', { reportId: req.params.id });
      return res.status(404).json({ 
        error: 'Report not found',
        code: 'REPORT_NOT_FOUND'
      });
    }
    log.success('Report fetched successfully', { reportId: req.params.id });
    res.json(report);
  } catch (error) {
    log.error('Error fetching report', { reportId: req.params.id, error });
    res.status(500).json({ 
      error: 'Failed to fetch report',
      code: 'FETCH_REPORT_ERROR'
    });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  log.success(`Server running on port ${PORT}`);
  log.info('Application started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});