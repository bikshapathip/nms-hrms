const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("ERROR: Set MONGODB_URI in .env.local");
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  userType: { type: String, enum: ["ADMIN", "RECRUITER"], default: "ADMIN" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: "" },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const EmployeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  designation: { type: String, required: true },
  department: { type: String, default: "" },
  dateOfJoining: { type: Date, required: true },
  bankAccount: { type: String, default: "" },
  panNumber: { type: String, default: "" },
  uanNumber: { type: String, default: "" },
  basicSalary: { type: Number, required: true },
  hra: { type: Number, default: 0 },
  da: { type: Number, default: 0 },
  specialAllowance: { type: Number, default: 0 },
  otherAllowance: { type: Number, default: 0 },
  pfEnabled: { type: Boolean, default: true },
  esiEnabled: { type: Boolean, default: false },
  professionalTax: { type: Number, default: 200 },
  tdsPercent: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const dummyEmployees = [
  { employeeId: "EMP001", name: "Rajesh Kumar", designation: "Software Engineer", department: "Engineering", dateOfJoining: "2022-03-15", bankAccount: "1234567890", panNumber: "ABCPK1234A", uanNumber: "100123456789", basicSalary: 25000, hra: 10000, da: 2500, specialAllowance: 5000, otherAllowance: 2000, pfEnabled: true, esiEnabled: false, professionalTax: 200, tdsPercent: 0 },
  { employeeId: "EMP002", name: "Priya Sharma", designation: "HR Manager", department: "Human Resources", dateOfJoining: "2021-06-01", bankAccount: "2345678901", panNumber: "DEFPS5678B", uanNumber: "100234567890", basicSalary: 30000, hra: 12000, da: 3000, specialAllowance: 8000, otherAllowance: 2500, pfEnabled: true, esiEnabled: false, professionalTax: 200, tdsPercent: 5 },
  { employeeId: "EMP003", name: "Amit Patel", designation: "Accountant", department: "Finance", dateOfJoining: "2023-01-10", bankAccount: "3456789012", panNumber: "GHIAP9012C", uanNumber: "100345678901", basicSalary: 22000, hra: 8800, da: 2200, specialAllowance: 4000, otherAllowance: 1500, pfEnabled: true, esiEnabled: false, professionalTax: 200, tdsPercent: 0 },
  { employeeId: "EMP004", name: "Sneha Reddy", designation: "Marketing Executive", department: "Marketing", dateOfJoining: "2022-08-20", bankAccount: "4567890123", panNumber: "JKLSR3456D", uanNumber: "100456789012", basicSalary: 20000, hra: 8000, da: 2000, specialAllowance: 3500, otherAllowance: 1000, pfEnabled: true, esiEnabled: false, professionalTax: 200, tdsPercent: 0 },
  { employeeId: "EMP005", name: "Vikram Singh", designation: "Operations Manager", department: "Operations", dateOfJoining: "2020-11-05", bankAccount: "5678901234", panNumber: "MNOVS7890E", uanNumber: "100567890123", basicSalary: 35000, hra: 14000, da: 3500, specialAllowance: 10000, otherAllowance: 3000, pfEnabled: true, esiEnabled: false, professionalTax: 200, tdsPercent: 10 },
  { employeeId: "EMP006", name: "Anitha Nair", designation: "QA Engineer", department: "Engineering", dateOfJoining: "2023-04-18", bankAccount: "6789012345", panNumber: "PQRAN1234F", uanNumber: "100678901234", basicSalary: 23000, hra: 9200, da: 2300, specialAllowance: 4500, otherAllowance: 1800, pfEnabled: true, esiEnabled: false, professionalTax: 200, tdsPercent: 0 },
  { employeeId: "EMP007", name: "Suresh Babu", designation: "Delivery Boy", department: "Logistics", dateOfJoining: "2024-01-08", bankAccount: "7890123456", panNumber: "STUSB5678G", uanNumber: "100789012345", basicSalary: 12000, hra: 4800, da: 1200, specialAllowance: 2000, otherAllowance: 800, pfEnabled: true, esiEnabled: true, professionalTax: 200, tdsPercent: 0 },
  { employeeId: "EMP008", name: "Divya Krishnan", designation: "UI/UX Designer", department: "Engineering", dateOfJoining: "2022-07-12", bankAccount: "8901234567", panNumber: "VWXDK9012H", uanNumber: "100890123456", basicSalary: 28000, hra: 11200, da: 2800, specialAllowance: 6000, otherAllowance: 2200, pfEnabled: true, esiEnabled: false, professionalTax: 200, tdsPercent: 0 },
  { employeeId: "EMP009", name: "Mohammed Farooq", designation: "Warehouse Supervisor", department: "Logistics", dateOfJoining: "2021-09-25", bankAccount: "9012345678", panNumber: "YZAMF3456I", uanNumber: "100901234567", basicSalary: 18000, hra: 7200, da: 1800, specialAllowance: 3000, otherAllowance: 1200, pfEnabled: true, esiEnabled: true, professionalTax: 200, tdsPercent: 0 },
  { employeeId: "EMP010", name: "Kavitha Sundaram", designation: "Senior Developer", department: "Engineering", dateOfJoining: "2020-05-14", bankAccount: "0123456789", panNumber: "BCDKS7890J", uanNumber: "101012345678", basicSalary: 40000, hra: 16000, da: 4000, specialAllowance: 12000, otherAllowance: 3500, pfEnabled: true, esiEnabled: false, professionalTax: 200, tdsPercent: 10 },
  { employeeId: "EMP011", name: "Ravi Teja", designation: "Sales Executive", department: "Sales", dateOfJoining: "2023-03-01", bankAccount: "1122334455", panNumber: "EFGRT1234K", uanNumber: "101123456789", basicSalary: 18000, hra: 7200, da: 1800, specialAllowance: 3500, otherAllowance: 1500, pfEnabled: true, esiEnabled: true, professionalTax: 200, tdsPercent: 0 },
  { employeeId: "EMP012", name: "Lakshmi Devi", designation: "Office Administrator", department: "Admin", dateOfJoining: "2019-12-10", bankAccount: "2233445566", panNumber: "HIJLD5678L", uanNumber: "101234567890", basicSalary: 16000, hra: 6400, da: 1600, specialAllowance: 2500, otherAllowance: 1000, pfEnabled: true, esiEnabled: true, professionalTax: 200, tdsPercent: 0 },
  { employeeId: "EMP013", name: "Arjun Mehta", designation: "Project Manager", department: "Engineering", dateOfJoining: "2021-02-15", bankAccount: "3344556677", panNumber: "KLMAM9012M", uanNumber: "101345678901", basicSalary: 45000, hra: 18000, da: 4500, specialAllowance: 15000, otherAllowance: 4000, pfEnabled: true, esiEnabled: false, professionalTax: 200, tdsPercent: 10 },
  { employeeId: "EMP014", name: "Pooja Gupta", designation: "Content Writer", department: "Marketing", dateOfJoining: "2023-07-22", bankAccount: "4455667788", panNumber: "NOPPG3456N", uanNumber: "101456789012", basicSalary: 15000, hra: 6000, da: 1500, specialAllowance: 3000, otherAllowance: 1000, pfEnabled: true, esiEnabled: true, professionalTax: 200, tdsPercent: 0 },
  { employeeId: "EMP015", name: "Karthik Raman", designation: "DevOps Engineer", department: "Engineering", dateOfJoining: "2022-10-03", bankAccount: "5566778899", panNumber: "QRSKR7890O", uanNumber: "101567890123", basicSalary: 35000, hra: 14000, da: 3500, specialAllowance: 8000, otherAllowance: 3000, pfEnabled: true, esiEnabled: false, professionalTax: 200, tdsPercent: 5 },
  { employeeId: "EMP016", name: "Fatima Begum", designation: "Receptionist", department: "Admin", dateOfJoining: "2024-02-14", bankAccount: "6677889900", panNumber: "TUVFB1234P", uanNumber: "101678901234", basicSalary: 13000, hra: 5200, da: 1300, specialAllowance: 2000, otherAllowance: 800, pfEnabled: true, esiEnabled: true, professionalTax: 200, tdsPercent: 0 },
  { employeeId: "EMP017", name: "Ganesh Iyer", designation: "Finance Manager", department: "Finance", dateOfJoining: "2020-08-19", bankAccount: "7788990011", panNumber: "WXYGI5678Q", uanNumber: "101789012345", basicSalary: 38000, hra: 15200, da: 3800, specialAllowance: 10000, otherAllowance: 3500, pfEnabled: true, esiEnabled: false, professionalTax: 200, tdsPercent: 10 },
  { employeeId: "EMP018", name: "Meena Kumari", designation: "Data Analyst", department: "Engineering", dateOfJoining: "2023-05-30", bankAccount: "8899001122", panNumber: "ZABMK9012R", uanNumber: "101890123456", basicSalary: 27000, hra: 10800, da: 2700, specialAllowance: 5500, otherAllowance: 2000, pfEnabled: true, esiEnabled: false, professionalTax: 200, tdsPercent: 0 },
  { employeeId: "EMP019", name: "Sanjay Verma", designation: "Security Guard", department: "Admin", dateOfJoining: "2022-01-05", bankAccount: "9900112233", panNumber: "CDFSV3456S", uanNumber: "101901234567", basicSalary: 10000, hra: 4000, da: 1000, specialAllowance: 1500, otherAllowance: 500, pfEnabled: true, esiEnabled: true, professionalTax: 0, tdsPercent: 0 },
  { employeeId: "EMP020", name: "Deepa Mohan", designation: "Business Analyst", department: "Operations", dateOfJoining: "2021-11-28", bankAccount: "0011223344", panNumber: "GHIDM7890T", uanNumber: "102012345678", basicSalary: 32000, hra: 12800, da: 3200, specialAllowance: 7000, otherAllowance: 2500, pfEnabled: true, esiEnabled: false, professionalTax: 200, tdsPercent: 5 },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const User = mongoose.model("User", UserSchema);
    const Employee = mongoose.model("Employee", EmployeeSchema);

    // Seed admin user
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "admin123";

    const existing = await User.findOne({ username });
    if (existing) {
      console.log(`Admin user "${username}" already exists. Updating password...`);
      existing.password = await bcrypt.hash(password, 12);
      await existing.save();
      console.log("Password updated!");
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      await User.create({
        userType: "ADMIN",
        firstName: "Admin",
        lastName: "User",
        username,
        email: "admin@company.com",
        password: hashedPassword,
      });
      console.log(`Admin user created: username="${username}"`);
    }

    // Seed employees
    console.log("\nSeeding 20 employees...");
    let created = 0;
    let skipped = 0;

    for (const emp of dummyEmployees) {
      const exists = await Employee.findOne({ employeeId: emp.employeeId });
      if (exists) {
        skipped++;
        continue;
      }
      await Employee.create(emp);
      created++;
      process.stdout.write(`  ✓ ${emp.employeeId} - ${emp.name}\n`);
    }

    console.log(`\nEmployees: ${created} created, ${skipped} skipped (already exist)`);
    console.log("Seed complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
