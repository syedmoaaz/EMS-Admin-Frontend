// Seed data for ADIL AGENCIES PVT LTD — single company tenant.
// Numeric `ref` fields are resolved to real ObjectIds during seeding.

export const company = {
  companyName: "ADIL AGENCIES PVT LTD",
  ownerName: "Adil Agencies Admin",
  email: "owner@adilagencies.com",
  phone: "03001234567",
  password: "admin123",
};

export const branches = [
  { ref: 1, name: "Head Office", code: "HO-01", cityCode: "HO", address: "II Chundrigar Road, Karachi", city: "Karachi", manager: "Ahmed Raza", status: "Active" },
  { ref: 2, name: "Karachi Branch", code: "KHI-01", cityCode: "KHI", address: "Clifton Block 5, Karachi", city: "Karachi", manager: "Hassan Raza", status: "Active" },
  { ref: 3, name: "Hyderabad Branch", code: "HYD-01", cityCode: "HYD", address: "Auto Bhan Road, Hyderabad", city: "Hyderabad", manager: "Bilal Ahmed", status: "Active" },
  { ref: 4, name: "Sukkur Branch", code: "SKR-01", cityCode: "SKR", address: "Minara Road, Sukkur", city: "Sukkur", manager: "Zain Abbas", status: "Inactive" },
  { ref: 5, name: "Larkana Branch", code: "LKN-01", cityCode: "LKN", address: "Station Road, Larkana", city: "Larkana", manager: "Danish Qureshi", status: "Active" },
];

// employeeId = city-readable (THT-1); devicePin = K50 numeric User ID (no letters / leading zeros)
export const employees = [
  { ref: 1, employeeId: "HO-1", devicePin: "1", name: "Ahmed Raza", phone: "03001234567", image: "https://i.pravatar.cc/150?img=12", branchRef: 1, designation: "Branch Manager", department: "Management", role: "Office Staff", shiftTiming: "09:00 AM - 06:00 PM", status: "Active", joiningDate: "2021-03-15" },
  { ref: 2, employeeId: "HO-2", devicePin: "2", name: "Sara Malik", phone: "03011234568", image: "https://i.pravatar.cc/150?img=5", branchRef: 1, designation: "HR Executive", department: "Human Resources", role: "Office Staff", shiftTiming: "09:00 AM - 06:00 PM", status: "Active", joiningDate: "2022-06-01" },
  { ref: 3, employeeId: "HO-3", devicePin: "3", name: "Usman Ali", phone: "03021234569", image: "https://i.pravatar.cc/150?img=33", branchRef: 1, designation: "Accountant", department: "Finance", role: "Office Staff", shiftTiming: "09:00 AM - 06:00 PM", status: "Active", joiningDate: "2020-11-20" },
  { ref: 4, employeeId: "KHI-1", devicePin: "4", name: "Ali Khan", phone: "03031234570", image: "https://i.pravatar.cc/150?img=18", branchRef: 2, designation: "Senior Order Taker", department: "Sales", role: "Order Taker", shiftTiming: "08:30 AM - 05:30 PM", status: "Active", joiningDate: "2023-01-10" },
  { ref: 5, employeeId: "KHI-2", devicePin: "5", name: "Hassan Raza", phone: "03041234571", image: "https://i.pravatar.cc/150?img=52", branchRef: 2, designation: "Order Taker", department: "Sales", role: "Order Taker", shiftTiming: "08:30 AM - 05:30 PM", status: "Active", joiningDate: "2023-04-22" },
  { ref: 6, employeeId: "KHI-3", devicePin: "6", name: "Fahad Mehmood", phone: "03051234572", image: "https://i.pravatar.cc/150?img=60", branchRef: 2, designation: "Lead Dispatcher", department: "Logistics", role: "Dispatcher", shiftTiming: "08:00 AM - 05:00 PM", status: "Active", joiningDate: "2022-09-05" },
  { ref: 7, employeeId: "HYD-1", devicePin: "7", name: "Bilal Ahmed", phone: "03061234573", image: "https://i.pravatar.cc/150?img=25", branchRef: 3, designation: "Branch Manager", department: "Management", role: "Office Staff", shiftTiming: "09:00 AM - 06:00 PM", status: "Active", joiningDate: "2019-07-18" },
  { ref: 8, employeeId: "HYD-2", devicePin: "8", name: "Imran Shah", phone: "03071234574", image: "https://i.pravatar.cc/150?img=15", branchRef: 3, designation: "Order Taker", department: "Sales", role: "Order Taker", shiftTiming: "08:30 AM - 05:30 PM", status: "Active", joiningDate: "2023-08-12" },
  { ref: 9, employeeId: "HYD-3", devicePin: "9", name: "Tariq Hussain", phone: "03081234575", image: "https://i.pravatar.cc/150?img=32", branchRef: 3, designation: "Dispatcher", department: "Logistics", role: "Dispatcher", shiftTiming: "08:00 AM - 05:00 PM", status: "Active", joiningDate: "2022-02-28" },
  { ref: 10, employeeId: "SKR-1", devicePin: "10", name: "Zain Abbas", phone: "03091234576", image: "https://i.pravatar.cc/150?img=68", branchRef: 4, designation: "Branch Manager", department: "Management", role: "Office Staff", shiftTiming: "09:00 AM - 06:00 PM", status: "Inactive", joiningDate: "2021-01-05" },
  { ref: 11, employeeId: "SKR-2", devicePin: "11", name: "Kamran Siddiqui", phone: "03101234577", image: "https://i.pravatar.cc/150?img=41", branchRef: 4, designation: "Order Taker", department: "Sales", role: "Order Taker", shiftTiming: "08:30 AM - 05:30 PM", status: "Active", joiningDate: "2024-03-01" },
  { ref: 12, employeeId: "LKN-1", devicePin: "12", name: "Danish Qureshi", phone: "03111234578", image: "https://i.pravatar.cc/150?img=56", branchRef: 5, designation: "Branch Manager", department: "Management", role: "Office Staff", shiftTiming: "09:00 AM - 06:00 PM", status: "Active", joiningDate: "2020-05-14" },
  { ref: 13, employeeId: "LKN-2", devicePin: "13", name: "Omar Farooq", phone: "03121234579", image: "https://i.pravatar.cc/150?img=22", branchRef: 5, designation: "Order Taker", department: "Sales", role: "Order Taker", shiftTiming: "08:30 AM - 05:30 PM", status: "Active", joiningDate: "2023-11-08" },
  { ref: 14, employeeId: "LKN-3", devicePin: "14", name: "Rizwan Haider", phone: "03131234580", image: "https://i.pravatar.cc/150?img=47", branchRef: 5, designation: "Dispatcher", department: "Logistics", role: "Dispatcher", shiftTiming: "08:00 AM - 05:00 PM", status: "Active", joiningDate: "2022-12-19" },
];

export const attendance = [
  { employeeRef: 1, checkIn: "09:02 AM", checkOut: "06:10 PM", hours: "9h 08m", method: "Biometric", status: "Present" },
  { employeeRef: 2, checkIn: "08:55 AM", checkOut: "06:00 PM", hours: "9h 05m", method: "Biometric", status: "Present" },
  { employeeRef: 3, checkIn: "09:18 AM", checkOut: "--", hours: "Working", method: "Biometric", status: "Late" },
  { employeeRef: 4, checkIn: "08:31 AM", checkOut: "--", hours: "Working", method: "GPS", status: "Working" },
  { employeeRef: 5, checkIn: "08:45 AM", checkOut: "--", hours: "Working", method: "GPS", status: "Working" },
  { employeeRef: 6, checkIn: "08:05 AM", checkOut: "--", hours: "Working", method: "GPS", status: "Working" },
  { employeeRef: 7, checkIn: "09:00 AM", checkOut: "06:15 PM", hours: "9h 15m", method: "Biometric", status: "Present" },
  { employeeRef: 8, checkIn: "09:25 AM", checkOut: "--", hours: "Working", method: "GPS", status: "Working" },
  { employeeRef: 9, checkIn: "--", checkOut: "--", hours: "--", method: "--", status: "Absent" },
  { employeeRef: 10, checkIn: "--", checkOut: "--", hours: "--", method: "--", status: "Absent" },
  { employeeRef: 11, checkIn: "08:40 AM", checkOut: "--", hours: "Working", method: "GPS", status: "Working" },
  { employeeRef: 12, checkIn: "08:58 AM", checkOut: "06:05 PM", hours: "9h 07m", method: "Biometric", status: "Present" },
  { employeeRef: 13, checkIn: "08:35 AM", checkOut: "--", hours: "Working", method: "GPS", status: "Working" },
  { employeeRef: 14, checkIn: "08:10 AM", checkOut: "--", hours: "Working", method: "GPS", status: "Working" },
];

export const tracking = [
  { employeeRef: 4, status: "Moving", battery: "78%", speed: "24 km/h", location: "Clifton, Karachi", online: true, lat: 24.8138, lng: 67.0299 },
  { employeeRef: 5, status: "Stationary", battery: "63%", speed: "0 km/h", location: "DHA Phase 6, Karachi", online: true, lat: 24.8045, lng: 67.067 },
  { employeeRef: 6, status: "Moving", battery: "85%", speed: "32 km/h", location: "Shahrah-e-Faisal, Karachi", online: true, lat: 24.8738, lng: 67.0914 },
  { employeeRef: 8, status: "Moving", battery: "71%", speed: "18 km/h", location: "Hyderabad, Sindh", online: true, lat: 25.396, lng: 68.3578 },
  { employeeRef: 9, status: "GPS Disabled", battery: "51%", speed: "--", location: "--", online: false, lat: null, lng: null },
  { employeeRef: 11, status: "Offline", battery: "34%", speed: "--", location: "--", online: false, lat: null, lng: null },
  { employeeRef: 13, status: "Moving", battery: "92%", speed: "28 km/h", location: "Larkana, Sindh", online: true, lat: 27.559, lng: 68.2123 },
  { employeeRef: 14, status: "Stationary", battery: "67%", speed: "0 km/h", location: "Larkana, Sindh", online: true, lat: 27.5612, lng: 68.2085 },
];
