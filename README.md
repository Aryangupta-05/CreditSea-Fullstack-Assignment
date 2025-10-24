# CreditSea - Credit Report Processor

A fullstack MERN application for processing XML credit reports from Experian. This application allows users to upload XML files containing soft credit pull data, extracts specific information, stores it in MongoDB, and displays it through a React-based frontend.

## Features

- **XML File Upload**: Upload and process XML files containing credit report data
- **Data Extraction**: Automatically extracts basic details, report summary, and credit account information
- **MongoDB Storage**: Stores processed data in a well-designed schema
- **React Frontend**: Clean, responsive UI for viewing credit reports
- **Real-time Processing**: Immediate feedback on file upload and processing
- **Report History**: View and manage previously processed reports

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Frontend**: React.js
- **File Processing**: xml2js, multer
- **Styling**: CSS3 with responsive design

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd credit-sea-app
```

### 2. Install Dependencies

Install backend dependencies:
```bash
npm install
```

Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/creditsea
PORT=5000
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 5. Run the Application

#### Development Mode (Recommended)

Run both backend and frontend concurrently:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- React development server on http://localhost:3000

#### Production Mode

Build the React app and start the server:
```bash
npm run build
npm start
```

## API Endpoints

### POST /api/upload
Upload and process an XML file.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with 'xmlFile' field

**Response:**
```json
{
  "message": "XML file processed successfully",
  "reportId": "report_id",
  "data": {
    "basicDetails": { ... },
    "reportSummary": { ... },
    "creditAccounts": [ ... ]
  }
}
```

### GET /api/reports
Retrieve all processed reports.

**Response:**
```json
[
  {
    "_id": "report_id",
    "basicDetails": { ... },
    "reportSummary": { ... },
    "creditAccounts": [ ... ],
    "createdAt": "2023-..."
  }
]
```

### GET /api/reports/:id
Retrieve a specific report by ID.

## Data Schema

### Credit Report Schema

```javascript
{
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
  createdAt: Date
}
```

## Usage

1. **Upload XML File**: 
   - Click "Choose XML File" or drag and drop an XML file
   - The file will be processed automatically
   - You'll see a success message when processing is complete

2. **View Reports**:
   - All processed reports appear in the "Previous Reports" section
   - Click on any report to view detailed information
   - Reports are organized by processing date

3. **Report Details**:
   - **Basic Details**: Name, phone, PAN, credit score
   - **Report Summary**: Account counts, balances, enquiries
   - **Credit Accounts**: Detailed account information with banks, addresses, and balances

## File Structure

```
credit-sea-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── FileUpload.js
│   │   │   ├── ReportDisplay.js
│   │   │   └── ReportList.js
│   │   ├── App.js         # Main App component
│   │   ├── App.css        # Styles
│   │   └── index.js       # Entry point
│   └── package.json
├── server.js              # Express server
├── package.json           # Backend dependencies
└── README.md
```

## Error Handling

The application includes comprehensive error handling for:

- Invalid file formats (non-XML files)
- Malformed XML files
- Database connection issues
- File upload errors
- Network connectivity problems

## Testing

To test the application:

1. Start the application using `npm run dev`
2. Open http://localhost:3000 in your browser
3. Upload the provided sample XML file (`Sagar_Ugle1.xml`)
4. Verify that the data is extracted and displayed correctly


## Sample XML File

The application is designed to work with XML files in the format provided by Experian. The sample file `Sagar_Ugle1.xml` demonstrates the expected structure and can be used for testing.

## Performance Considerations

- Large XML files may take longer to process
- Consider implementing file size limits for production use
- MongoDB indexing can improve query performance for large datasets
- Implement pagination for reports list if dealing with many records

