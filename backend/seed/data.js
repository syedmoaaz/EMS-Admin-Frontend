// Seed data mirrors the frontend mock data in src/data/*.
// Numeric `ref` fields are resolved to real ObjectIds during seeding.

export const branches = [
  { ref: 1, name: "Head Office", code: "HO-01", address: "II Chundrigar Road, Karachi", city: "Karachi", manager: "Ahmed Raza", status: "Active" },
  { ref: 2, name: "Karachi Branch", code: "KHI-01", address: "Clifton Block 5, Karachi", city: "Karachi", manager: "Hassan Raza", status: "Active" },
  { ref: 3, name: "Lahore Branch", code: "LHR-01", address: "Gulberg III, Lahore", city: "Lahore", manager: "Bilal Ahmed", status: "Active" },
  { ref: 4, name: "Islamabad Branch", code: "ISB-01", address: "Blue Area, Islamabad", city: "Islamabad", manager: "Zain Abbas", status: "Inactive" },
  { ref: 5, name: "Faisalabad Branch", code: "FSD-01", address: "Kohinoor City, Faisalabad", city: "Faisalabad", manager: "Danish Qureshi", status: "Active" },
];

export const employees = [
  { ref: 1, employeeId: "EMP-0001", name: "Ahmed Raza", phone: "03001234567", image: "https://i.pravatar.cc/150?img=12", branchRef: 1, designation: "Branch Manager", role: "Office Staff", shiftTiming: "09:00 AM - 06:00 PM", status: "Active", joiningDate: "2021-03-15" },
  { ref: 2, employeeId: "EMP-0002", name: "Sara Malik", phone: "03011234568", image: "https://i.pravatar.cc/150?img=5", branchRef: 1, designation: "HR Executive", role: "Office Staff", shiftTiming: "09:00 AM - 06:00 PM", status: "Active", joiningDate: "2022-06-01" },
  { ref: 3, employeeId: "EMP-0003", name: "Usman Ali", phone: "03021234569", image: "https://i.pravatar.cc/150?img=33", branchRef: 1, designation: "Accountant", role: "Office Staff", shiftTiming: "09:00 AM - 06:00 PM", status: "Active", joiningDate: "2020-11-20" },
  { ref: 4, employeeId: "EMP-0004", name: "Ali Khan", phone: "03031234570", image: "https://i.pravatar.cc/150?img=18", branchRef: 2, designation: "Senior Order Taker", role: "Order Taker", shiftTiming: "08:30 AM - 05:30 PM", status: "Active", joiningDate: "2023-01-10" },
  { ref: 5, employeeId: "EMP-0005", name: "Hassan Raza", phone: "03041234571", image: "https://i.pravatar.cc/150?img=52", branchRef: 2, designation: "Order Taker", role: "Order Taker", shiftTiming: "08:30 AM - 05:30 PM", status: "Active", joiningDate: "2023-04-22" },
  { ref: 6, employeeId: "EMP-0006", name: "Fahad Mehmood", phone: "03051234572", image: "https://i.pravatar.cc/150?img=60", branchRef: 2, designation: "Lead Dispatcher", role: "Dispatcher", shiftTiming: "08:00 AM - 05:00 PM", status: "Active", joiningDate: "2022-09-05" },
  { ref: 7, employeeId: "EMP-0007", name: "Bilal Ahmed", phone: "03061234573", image: "https://i.pravatar.cc/150?img=25", branchRef: 3, designation: "Branch Manager", role: "Office Staff", shiftTiming: "09:00 AM - 06:00 PM", status: "Active", joiningDate: "2019-07-18" },
  { ref: 8, employeeId: "EMP-0008", name: "Imran Shah", phone: "03071234574", image: "https://i.pravatar.cc/150?img=15", branchRef: 3, designation: "Order Taker", role: "Order Taker", shiftTiming: "08:30 AM - 05:30 PM", status: "Active", joiningDate: "2023-08-12" },
  { ref: 9, employeeId: "EMP-0009", name: "Tariq Hussain", phone: "03081234575", image: "https://i.pravatar.cc/150?img=32", branchRef: 3, designation: "Dispatcher", role: "Dispatcher", shiftTiming: "08:00 AM - 05:00 PM", status: "Active", joiningDate: "2022-02-28" },
  { ref: 10, employeeId: "EMP-0010", name: "Zain Abbas", phone: "03091234576", image: "https://i.pravatar.cc/150?img=68", branchRef: 4, designation: "Branch Manager", role: "Office Staff", shiftTiming: "09:00 AM - 06:00 PM", status: "Inactive", joiningDate: "2021-01-05" },
  { ref: 11, employeeId: "EMP-0011", name: "Kamran Siddiqui", phone: "03101234577", image: "https://i.pravatar.cc/150?img=41", branchRef: 4, designation: "Order Taker", role: "Order Taker", shiftTiming: "08:30 AM - 05:30 PM", status: "Active", joiningDate: "2024-03-01" },
  { ref: 12, employeeId: "EMP-0012", name: "Danish Qureshi", phone: "03111234578", image: "https://i.pravatar.cc/150?img=56", branchRef: 5, designation: "Branch Manager", role: "Office Staff", shiftTiming: "09:00 AM - 06:00 PM", status: "Active", joiningDate: "2020-05-14" },
  { ref: 13, employeeId: "EMP-0013", name: "Omar Farooq", phone: "03121234579", image: "https://i.pravatar.cc/150?img=22", branchRef: 5, designation: "Order Taker", role: "Order Taker", shiftTiming: "08:30 AM - 05:30 PM", status: "Active", joiningDate: "2023-11-08" },
  { ref: 14, employeeId: "EMP-0014", name: "Rizwan Haider", phone: "03131234580", image: "https://i.pravatar.cc/150?img=47", branchRef: 5, designation: "Dispatcher", role: "Dispatcher", shiftTiming: "08:00 AM - 05:00 PM", status: "Active", joiningDate: "2022-12-19" },
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
  { employeeRef: 4, status: "Moving", battery: "78%", speed: "24 km/h", location: "Clifton, Karachi", online: true },
  { employeeRef: 5, status: "Stationary", battery: "63%", speed: "0 km/h", location: "DHA Phase 6, Karachi", online: true },
  { employeeRef: 6, status: "Moving", battery: "85%", speed: "32 km/h", location: "Shahrah-e-Faisal, Karachi", online: true },
  { employeeRef: 8, status: "Moving", battery: "71%", speed: "18 km/h", location: "Model Town, Lahore", online: true },
  { employeeRef: 9, status: "GPS Disabled", battery: "51%", speed: "--", location: "--", online: false },
  { employeeRef: 11, status: "Offline", battery: "34%", speed: "--", location: "--", online: false },
  { employeeRef: 13, status: "Moving", battery: "92%", speed: "28 km/h", location: "Jinnah Road, Faisalabad", online: true },
  { employeeRef: 14, status: "Stationary", battery: "67%", speed: "0 km/h", location: "Kohinoor City, Faisalabad", online: true },
];

export const users = [
  { userId: "ADMIN001", name: "Saad Karim", password: "admin123", role: "Super Admin" },
  { userId: "MGR001", name: "Ahmed Raza", password: "manager123", role: "Branch Manager", branchRef: 1 },
];
