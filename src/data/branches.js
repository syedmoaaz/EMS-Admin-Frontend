export const branches = [
  {
    id: 1,
    name: "Head Office",
    address: "II Chundrigar Road, Karachi",
    city: "Karachi",
    manager: "Ahmed Raza",
    status: "Active",
  },
  {
    id: 2,
    name: "Karachi Branch",
    address: "Clifton Block 5, Karachi",
    city: "Karachi",
    manager: "Hassan Raza",
    status: "Active",
  },
  {
    id: 3,
    name: "Lahore Branch",
    address: "Gulberg III, Lahore",
    city: "Lahore",
    manager: "Bilal Ahmed",
    status: "Active",
  },
  {
    id: 4,
    name: "Islamabad Branch",
    address: "Blue Area, Islamabad",
    city: "Islamabad",
    manager: "Zain Abbas",
    status: "Inactive",
  },
  {
    id: 5,
    name: "Faisalabad Branch",
    address: "Kohinoor City, Faisalabad",
    city: "Faisalabad",
    manager: "Danish Qureshi",
    status: "Active",
  },
];

export const getBranchById = (id) =>
  branches.find((branch) => branch.id === id);

export const getBranchName = (id) =>
  getBranchById(id)?.name ?? "Unknown Branch";

export const getBranchEmployeeCount = (branchId, employeeList) =>
  employeeList.filter(
    (employee) => employee.branchId === branchId && employee.status === "Active"
  ).length;
