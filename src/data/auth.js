export const dummyUsers = [
  {
    userId: "ADMIN001",
    password: "admin123",
    name: "Saad Karim",
    role: "Super Admin",
  },
  {
    userId: "MGR001",
    password: "manager123",
    name: "Ahmed Raza",
    role: "Branch Manager",
  },
];

export const authenticateUser = (userId, password) => {
  const user = dummyUsers.find(
    (entry) =>
      entry.userId.toLowerCase() === userId.trim().toLowerCase() &&
      entry.password === password
  );

  if (!user) return null;

  const { password: _, ...safeUser } = user;
  return safeUser;
};
