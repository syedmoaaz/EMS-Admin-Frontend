/**
 * Automated API test script — mirrors the Postman testing guide.
 * Run: node tests/api-test.mjs
 * Requires: backend server running on port 5000, MongoDB seeded.
 */

const BASE = process.env.API_URL || "http://localhost:5000/api";

let token = "";
let branchId = "";
let employeeId = "";
let passed = 0;
let failed = 0;

const log = (msg, ok = true) => {
  const icon = ok ? "PASS" : "FAIL";
  console.log(`[${icon}] ${msg}`);
  if (ok) passed++;
  else failed++;
};

async function request(method, path, body = null, auth = false) {
  const headers = { "Content-Type": "application/json" };
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function run() {
  console.log("\n=== EMS API Test Suite ===\n");
  console.log(`Base URL: ${BASE}\n`);

  // 1. Health
  try {
    const { status, data } = await request("GET", "/health");
    log(
      `GET /health → ${status} ${data.message || ""}`,
      status === 200 && data.success === true
    );
  } catch (e) {
    log(`GET /health → ${e.message}`, false);
    console.log("\nServer not reachable. Start backend: cd backend && npm run dev\n");
    process.exit(1);
  }

  // 2. Login
  const login = await request("POST", "/company/login", {
    email: "owner@novapharma.com",
    password: "admin123",
  });
  token = login.data.token || "";
  log(
    `POST /company/login → ${login.status} token=${token ? "received" : "missing"}`,
    login.status === 200 && !!token
  );

  if (!token) {
    console.log("\nLogin failed. Run: npm run seed\n");
    process.exit(1);
  }

  // 3. Profile
  const profile = await request("GET", "/company/profile", null, true);
  log(
    `GET /company/profile → ${profile.status} company=${profile.data.user?.companyName || "?"}`,
    profile.status === 200 && profile.data.user?.companyName
  );

  // 4. Branches
  const branches = await request("GET", "/branches", null, true);
  branchId = branches.data.data?.[0]?._id || "";
  log(
    `GET /branches → ${branches.status} count=${branches.data.count ?? 0}`,
    branches.status === 200 && branches.data.count === 5
  );

  // 5. Employees
  const employees = await request("GET", "/employees", null, true);
  employeeId = employees.data.data?.[0]?._id || "";
  log(
    `GET /employees → ${employees.status} count=${employees.data.count ?? 0}`,
    employees.status === 200 && employees.data.count === 14
  );

  // 6. Attendance
  const attendance = await request("GET", "/attendance", null, true);
  const attStats = await request("GET", "/attendance/stats", null, true);
  log(
    `GET /attendance → ${attendance.status} count=${attendance.data.count ?? 0}`,
    attendance.status === 200 && attendance.data.count === 14
  );
  log(
    `GET /attendance/stats → ${attStats.status} present=${attStats.data.data?.present ?? "?"}`,
    attStats.status === 200 && typeof attStats.data.data?.present === "number"
  );

  // 7. Tracking
  const tracking = await request("GET", "/tracking/live", null, true);
  const trackStats = await request("GET", "/tracking/stats", null, true);
  log(
    `GET /tracking/live → ${tracking.status} count=${tracking.data.count ?? 0}`,
    tracking.status === 200 && tracking.data.count === 8
  );
  log(
    `GET /tracking/stats → ${trackStats.status} online=${trackStats.data.data?.online ?? "?"}`,
    trackStats.status === 200 && typeof trackStats.data.data?.online === "number"
  );

  // 8. Dashboard
  const dashboard = await request("GET", "/dashboard/stats", null, true);
  log(
    `GET /dashboard/stats → ${dashboard.status} employees=${dashboard.data.data?.totalEmployees ?? "?"}`,
    dashboard.status === 200 && dashboard.data.data?.totalEmployees === 14
  );

  // 9. Multi-tenant isolation
  const createCo = await request("POST", "/company/create", {
    companyName: "ABC Pharma Test",
    ownerName: "Test Owner",
    email: `test-${Date.now()}@abcpharma.com`,
    password: "abc123456",
    phone: "03009999999",
  });
  const abcToken = createCo.data.token;
  const oldToken = token;
  token = abcToken;
  const abcBranches = await request("GET", "/branches", null, true);
  token = oldToken;
  log(
    `POST /company/create + GET /branches (ABC) → create=${createCo.status} branches=${abcBranches.data.count ?? 0}`,
    createCo.status === 201 && abcBranches.data.count === 0
  );

  // 10. Write operations
  const newBranch = await request(
    "POST",
    "/branches",
    {
      name: "Postman Test Branch",
      code: `TST-${Date.now()}`,
      city: "Karachi",
      manager: "Test Manager",
      status: "Active",
    },
    true
  );
  const testBranchId = newBranch.data.data?._id;
  log(
    `POST /branches → ${newBranch.status} id=${testBranchId ? "created" : "missing"}`,
    newBranch.status === 201 && !!testBranchId
  );

  if (testBranchId && branchId) {
    const newEmp = await request(
      "POST",
      "/employees",
      {
        employeeId: `EMP-TEST-${Date.now()}`,
        name: "Test Employee",
        phone: "03001111111",
        branch: testBranchId,
        designation: "Order Taker",
        department: "Sales",
        role: "Order Taker",
        status: "Active",
      },
      true
    );
    log(
      `POST /employees → ${newEmp.status} id=${newEmp.data.data?._id ? "created" : "missing"}`,
      newEmp.status === 201 && !!newEmp.data.data?._id
    );
  } else {
    log("POST /employees → skipped (no branch id)", false);
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error("Test suite error:", err.message);
  process.exit(1);
});
