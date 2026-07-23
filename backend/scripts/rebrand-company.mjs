import dns from "dns";
import mongoose from "mongoose";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI required");
  process.exit(1);
}

await mongoose.connect(uri);

const result = await mongoose.connection.db.collection("companies").updateMany(
  {},
  {
    $set: {
      companyName: "ADIL AGENCIES PVT LTD",
      ownerName: "Adil Agencies Admin",
      email: "owner@adilagencies.com",
    },
  }
);

console.log(`Updated ${result.modifiedCount} company document(s).`);
console.log("Login email is now: owner@adilagencies.com");
console.log("Password unchanged (still admin123 unless you changed it).");

await mongoose.disconnect();
