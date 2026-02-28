/**
 * TOKOTOPARYA - Google Apps Script Backend
 * 
 * Instructions:
 * 1. Create a new Google Spreadsheet.
 * 2. Create sheets: USERS, PRODUCTS, ORDERS, RATINGS, SETTINGS, EXPENSES.
 * 3. Open Extensions > Apps Script.
 * 4. Paste this code and Deploy as Web App (Execute as: Me, Access: Anyone).
 * 5. Copy the Web App URL and set it in your Frontend environment.
 */

const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
const ADMIN_TOKEN = "TOKOTOPARYA_SECRET_TOKEN_2024"; // Simple token for demo, use PropertiesService for real production

/**
 * Initialize Spreadsheet structure and default admin
 * Run this function once from the Apps Script editor
 */
function initSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  const sheets = [
    { name: 'USERS', headers: ['username', 'password', 'role'] },
    { name: 'PRODUCTS', headers: ['id', 'name', 'price', 'stock', 'description', 'image', 'category'] },
    { name: 'ORDERS', headers: ['id', 'timestamp', 'customerName', 'whatsapp', 'location', 'products', 'total', 'paymentMethod', 'status', 'proofImage'] },
    { name: 'RATINGS', headers: ['id', 'user', 'rating', 'comment', 'timestamp'] },
    { name: 'SETTINGS', headers: ['key', 'value'] },
    { name: 'EXPENSES', headers: ['id', 'amount', 'description', 'date'] }
  ];

  sheets.forEach(s => {
    let sheet = ss.getSheetByName(s.name);
    if (!sheet) {
      sheet = ss.insertSheet(s.name);
      sheet.appendRow(s.headers);
    }
  });

  // Add default admin if not exists
  const userSheet = ss.getSheetByName('USERS');
  const users = getData('USERS');
  if (!users.find(u => u.username === 'arya1212')) {
    userSheet.appendRow(['arya1212', 'ab87bCBG$@y5542hhKLnb', 'admin']);
  }

  // Add default settings if not exists
  const settingsSheet = ss.getSheetByName('SETTINGS');
  const settings = getData('SETTINGS');
  if (settings.length === 0) {
    settingsSheet.appendRow(['qrisString', '00020101021126670016ID.CO.QRIS.WWW011893600523000000000002150000000000000000303608510400005204599953033605802ID5911TOKOTOPARYA6005KOTA 6105123456304']);
    settingsSheet.appendRow(['feeMode', 'FIXED']);
    settingsSheet.appendRow(['feeValue', '5000']);
    settingsSheet.appendRow(['isActive', 'true']);
  }
}

function doGet(e) {
  const action = e.parameter.action;
  const token = e.parameter.token;
  
  try {
    switch (action) {
      case 'getProducts':
        return jsonResponse(getData('PRODUCTS'));
      case 'getRatings':
        return jsonResponse(getRatingStats());
      case 'getSettings':
        return jsonResponse(getSettings());
      case 'getOrders':
        if (!validateToken(token)) return errorResponse("Unauthorized");
        return jsonResponse(getData('ORDERS'));
      case 'getDashboard':
        if (!validateToken(token)) return errorResponse("Unauthorized");
        return jsonResponse(getDashboardData());
      default:
        return errorResponse("Invalid Action");
    }
  } catch (err) {
    return errorResponse(err.message);
  }
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  const token = data.token;

  try {
    switch (action) {
      case 'adminLogin':
        return adminLogin(data.username, data.password);
      case 'submitRating':
        return submitRating(data);
      case 'createOrder':
        return createOrder(data);
      case 'saveProduct':
        if (!validateToken(token)) return errorResponse("Unauthorized");
        return saveProduct(data);
      case 'deleteProduct':
        if (!validateToken(token)) return errorResponse("Unauthorized");
        return deleteProduct(data.id);
      case 'updateOrderStatus':
        if (!validateToken(token)) return errorResponse("Unauthorized");
        return updateOrderStatus(data.id, data.status);
      case 'saveSettings':
        if (!validateToken(token)) return errorResponse("Unauthorized");
        return saveSettings(data.settings);
      default:
        return errorResponse("Invalid Action");
    }
  } catch (err) {
    return errorResponse(err.message);
  }
}

// --- CORE FUNCTIONS ---

function validateToken(token) {
  return token === ADMIN_TOKEN;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify({ success: true, data: data }))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(msg) {
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getData(sheetName) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
  const values = sheet.getDataRange().getValues();
  const headers = values.shift();
  return values.map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
}

function adminLogin(username, password) {
  const users = getData('USERS');
  const user = users.find(u => u.username === username && u.password === password && u.role === 'admin');
  if (user) {
    return jsonResponse({ token: ADMIN_TOKEN, role: 'admin' });
  }
  return errorResponse("Invalid credentials");
}

function getRatingStats() {
  const ratings = getData('RATINGS');
  if (ratings.length === 0) return { averageRating: 0, totalReview: 0, list: [] };
  const sum = ratings.reduce((acc, r) => acc + Number(r.rating), 0);
  return {
    averageRating: (sum / ratings.length).toFixed(1),
    totalReview: ratings.length,
    list: ratings.reverse().slice(0, 20)
  };
}

function submitRating(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('RATINGS');
  sheet.appendRow([
    Date.now(),
    data.user,
    data.rating,
    data.comment,
    new Date().toISOString()
  ]);
  return jsonResponse("Rating submitted");
}

function createOrder(data) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Wait up to 10s
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const orderSheet = ss.getSheetByName('ORDERS');
    const productSheet = ss.getSheetByName('PRODUCTS');
    
    // 1. Update Stock
    const products = getData('PRODUCTS');
    data.items.forEach(item => {
      const pIndex = products.findIndex(p => p.id == item.id);
      if (pIndex !== -1) {
        const currentStock = Number(products[pIndex].stock);
        if (currentStock < item.quantity) throw new Error(`Stock insufficient for ${item.name}`);
        productSheet.getRange(pIndex + 2, 3).setValue(currentStock - item.quantity); // Column 3 is Stock
      }
    });

    // 2. Append Order
    const orderId = "ORD-" + Date.now();
    orderSheet.appendRow([
      orderId,
      new Date().toISOString(),
      data.customerName,
      data.whatsapp,
      data.location,
      JSON.stringify(data.items),
      data.total,
      data.paymentMethod,
      "MENUNGGU",
      data.proofImage || ""
    ]);

    return jsonResponse({ orderId: orderId });
  } finally {
    lock.releaseLock();
  }
}

function getDashboardData() {
  const orders = getData('ORDERS');
  const expenses = getData('EXPENSES');
  
  const pendapatan = orders
    .filter(o => o.status === 'SELESAI')
    .reduce((acc, o) => acc + Number(o.total), 0);
    
  const kerugian = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
  
  return {
    pendapatan,
    kerugian,
    bersih: pendapatan - kerugian,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'MENUNGGU').length
  };
}

function updateOrderStatus(id, status) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('ORDERS');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.getRange(i + 1, 9).setValue(status); // Column 9 is Status
      return jsonResponse("Status updated");
    }
  }
  return errorResponse("Order not found");
}

function getSettings() {
  const data = getData('SETTINGS');
  let settings = {};
  data.forEach(s => settings[s.key] = s.value);
  return settings;
}

function saveSettings(settings) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('SETTINGS');
  sheet.clear();
  sheet.appendRow(['key', 'value']);
  Object.keys(settings).forEach(key => {
    sheet.appendRow([key, settings[key]]);
  });
  return jsonResponse("Settings saved");
}

function saveProduct(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('PRODUCTS');
  const products = getData('PRODUCTS');
  const existingIndex = products.findIndex(p => p.id == data.id);
  
  const rowData = [data.id, data.name, data.price, data.stock, data.description, data.image, data.category];
  
  if (existingIndex !== -1) {
    sheet.getRange(existingIndex + 2, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return jsonResponse("Product saved");
}

function deleteProduct(id) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('PRODUCTS');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      return jsonResponse("Product deleted");
    }
  }
  return errorResponse("Product not found");
}
