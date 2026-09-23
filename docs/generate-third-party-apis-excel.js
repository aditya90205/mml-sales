/**
 * Generates docs/MML-Sales-Third-Party-APIs.xlsx
 * Simple list of third-party APIs required (not built in our backend).
 *
 * Run: node docs/generate-third-party-apis-excel.js
 */
const path = require("path");
const ExcelJS = require("/tmp/xlsx-gen/node_modules/exceljs");

const OUT = path.join(__dirname, "MML-Sales-Third-Party-APIs.xlsx");

const APIS = [
  "SMS / OTP API",
  "Email API",
  "WhatsApp Business API",
  "Push Notification API (FCM)",
  "Aadhaar KYC API",
  "PAN KYC API",
  "LLM API (Gemini / OpenAI / Claude)",
  "Speech-to-Text API",
  "Payment Gateway API (Razorpay / Cashfree)",
  "Google Meet API",
  "Zoom API",
  "Google Maps / GPS API",
  "File Storage API (AWS S3)",
  "eSign API",
  "OCR API",
  "Police Verification API",
  "Meta Lead Ads API",
  "Google Ads API",
  "Google Reviews API",
  "Call / Telephony API",
  "Kundli / Horoscope API",
  "Google Calendar API",
];

async function build() {
  const wb = new ExcelJS.Workbook();
  wb.creator = "MML Sales";
  wb.created = new Date();

  const ws = wb.addWorksheet("Third Party APIs");
  ws.getColumn(1).width = 10;
  ws.getColumn(2).width = 50;

  ws.getRow(1).values = ["S.No", "API Name"];
  ws.getRow(1).font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7A0A17" } };
  ws.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
  ws.getRow(1).height = 22;

  APIS.forEach((name, i) => {
    const row = ws.getRow(i + 2);
    row.values = [i + 1, name];
    row.alignment = { vertical: "middle" };
    row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
    row.height = 20;
  });

  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = { from: "A1", to: `B${APIS.length + 1}` };

  await wb.xlsx.writeFile(OUT);
  console.log("Wrote", OUT);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
