import "reflect-metadata";
import * as dotenv from "dotenv";
import { sequelize } from "../database/connection";
import { User } from "../models/user.model";

// Load environment variables
dotenv.config();

const sampleUsers = [
  {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1234567890",
    role: "user",
    isActive: true,
  },
  {
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+1987654321",
    role: "user",
    isActive: true,
  },
  {
    firstName: "Bob",
    lastName: "Johnson",
    email: "bob.johnson@example.com",
    phone: "+1122334455",
    isActive: false,
  },
  {
    firstName: "Alice",
    lastName: "Williams",
    email: "alice.williams@example.com",
    role: "user",
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connection established.");

    // Clear existing users
    await User.destroy({ where: {} });
    console.log("🗑️  Cleared existing users.");

    // Create sample users
    for (const userData of sampleUsers) {
      const user = await User.create(userData);
      console.log(`👤 Created user: ${user.fullName} (${user.email})`);
    }

    console.log(
      `🎉 Database seeding completed! Created ${sampleUsers.length} users.`
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}
