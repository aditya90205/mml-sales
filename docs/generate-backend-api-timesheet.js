/**
 * Simple backend API timesheet.
 * Run: node docs/generate-backend-api-timesheet.js
 */
const path = require("path");
const ExcelJS = require("/tmp/xlsx-gen/node_modules/exceljs");

const OUT = path.join(__dirname, "MML-Sales-Backend-API-Timesheet.xlsx");

const ROWS = [
  ["Login & Profile", "-", "1 week"],
  ["Dashboard", "-", "1 week"],
  ["Sales Pipeline (P0–P6)", "-", "4 weeks"],
  ["Calendar & Meetings", "-", "1 week"],
  ["Tasks", "-", "1 week"],
  ["Campaign", "-", "1 week"],
  ["Client Database", "-", "1 week"],
  ["Packages & Plans", "-", "1 week"],
  ["Reports", "-", "1 week"],
  ["Bulk Import", "-", "1 week"],
  ["HRMS", "-", "2 weeks"],
  ["Documents & Media", "-", "1 week"],
  ["Notifications", "-", "1 week"],
  ["SMS / OTP API", "Working after receiving", "1 week"],
  ["Email API", "Working after receiving", "1 week"],
  ["WhatsApp API", "Working after receiving", "1 week"],
  ["Push Notification API", "Working after receiving", "1 week"],
  ["Aadhaar KYC API", "Working after receiving", "1 week"],
  ["PAN KYC API", "Working after receiving", "1 week"],
  ["LLM API", "Working after receiving", "1 week"],
  ["Speech-to-Text API", "Working after receiving", "1 week"],
  ["Payment Gateway API", "Working after receiving", "1 week"],
  ["Google Meet API", "Working after receiving", "1 week"],
  ["Zoom API", "Working after receiving", "1 week"],
  ["Google Maps API", "Working after receiving", "1 week"],
  ["File Storage API (S3)", "Working after receiving", "1 week"],
  ["eSign API", "Working after receiving", "1 week"],
  ["OCR API", "Working after receiving", "1 week"],
  ["Police Verification API", "Working after receiving", "1 week"],
  ["Meta Lead Ads API", "Working after receiving", "1 week"],
  ["Google Ads API", "Working after receiving", "1 week"],
  ["Google Reviews API", "Working after receiving", "1 week"],
  ["Call / Telephony API", "Working after receiving", "1 week"],
  ["Kundli API", "Working after receiving", "1 week"],
  ["Google Calendar API", "Working after receiving", "1 week"],
];

async function build() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Timesheet");

  ws.columns = [
    { header: "S.No", key: "sno", width: 8 },
    { header: "Work", key: "work", width: 32 },
    { header: "Client time", key: "client", width: 26 },
    { header: "Our time", key: "ours", width: 14 },
  ];

  const head = ws.getRow(1);
  head.font = { bold: true };
  head.alignment = { vertical: "middle", horizontal: "center" };
  head.height = 20;

  ROWS.forEach((row, i) => {
    ws.addRow({
      sno: i + 1,
      work: row[0],
      client: row[1],
      ours: row[2],
    });
  });

  ws.addRow({
    sno: "",
    work: "Total (our backend)",
    client: "-",
    ours: "8 weeks",
  });
  ws.addRow({
    sno: "",
    work: "Total (3rd party after receiving)",
    client: "Working after receiving",
    ours: "2 weeks",
  });

  const last = ws.lastRow.number;
  ws.getRow(last - 1).font = { bold: true };
  ws.getRow(last).font = { bold: true };

  ws.views = [{ state: "frozen", ySplit: 1 }];
  ws.autoFilter = { from: "A1", to: `D${ROWS.length + 1}` };

  for (let r = 1; r <= last; r++) {
    ws.getRow(r).alignment = { vertical: "middle" };
    ws.getCell(r, 1).alignment = { vertical: "middle", horizontal: "center" };
    ws.getCell(r, 3).alignment = { vertical: "middle", horizontal: "center" };
    ws.getCell(r, 4).alignment = { vertical: "middle", horizontal: "center" };
  }

  await wb.xlsx.writeFile(OUT);
  console.log("Wrote", OUT);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
