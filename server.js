require('dotenv').config();
const express = require('express');
const cors = require('cors');
const QRCode = require('qrcode');
const path = require('path');
const crypto = require('crypto');
const CryptoJS = require('crypto-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Generate secure random API key if not in .env
if (!process.env.API_SECRET) {
  process.env.API_SECRET = crypto.randomBytes(32).toString('hex');
  console.log('Generated new API_SECRET:', process.env.API_SECRET);
}

// Diamond data
const diamondData = {
  mapping: {
    "5": "FF5-S24",
    "10": "FF_10--16",
    "12": "FF12-S113",
    "50": "FF_50--2",
    "70": "FF_70--16",
    "100": "FF_100--2",
    "140": "FF_140--73",
    "210": "FF_210--16",
    "355": "FF_355--73",
    "510": "FF_510--73",
    "720": "FF_720--73",
    "1450": "FF_1450--73",
    "booyah pass": "FF_BP--73"
  },
  prices: {
    "5": 826,
    "10": 1000,
    "12": 1500,
    "50": 6000,
    "70": 9000,
    "100": 13000,
    "140": 18000,
    "210": 27000,
    "355": 45000,
    "510": 65000,
    "720": 90000,
    "1450": 182000,
    "booyah pass": 46000
  }
};

// Encryption functions
function encryptData(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), process.env.API_SECRET).toString();
}

// Generate secure payment token
function generatePaymentToken(orderData) {
  const hmac = crypto.createHmac('sha256', process.env.API_SECRET);
  hmac.update(JSON.stringify(orderData));
  return hmac.digest('hex');
}

// API Endpoints
app.post('/api/create-order', async (req, res) => {
  try {
    const { userId, diamondAmount } = req.body;
    
    if (!diamondData.mapping[diamondAmount]) {
      return res.status(400).json({ error: 'Invalid diamond package' });
    }

    if (!userId || userId.length < 3) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Create order data
    const orderId = `FD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const price = diamondData.prices[diamondAmount];
    const totalPrice = price + 1000; // Including admin fee
    
    const orderData = {
      orderId,
      userId,
      package: diamondAmount,
      productCode: diamondData.mapping[diamondAmount],
      amount: totalPrice,
      price: price,
      adminFee: 1000,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // Generate secure tokens
    orderData.paymentToken = generatePaymentToken(orderData);

    // Generate QR code with encrypted data
    const encryptedData = encryptData(orderData);
    const qrCodeUrl = await QRCode.toDataURL(encryptedData, {
      errorCorrectionLevel: 'H',
      width: 300,
      color: {
        dark: '#FF6B00',
        light: '#FFFFFF'
      }
    });

    res.json({
      success: true,
      order: orderData,
      qrCodeUrl
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Secret: ${process.env.API_SECRET}`);
});
