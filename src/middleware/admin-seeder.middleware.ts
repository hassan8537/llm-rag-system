import bcrypt from "bcryptjs";
import { User } from "../models/user.model";

export class AdminSeeder {
  /**
   * Create default admin user if it doesn't exist
   */
  static async createDefaultAdmin(): Promise<void> {
    try {
      // Check if admin already exists
      const adminEmail = process.env.ADMIN_EMAIL || "admin@motor.com";
      const existingAdmin = await User.findByEmail(adminEmail);

      if (existingAdmin) {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log("✓ Admin user already exists");
        return;
      }

      // Create admin user
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const admin = await User.create({
        firstName: "Admin",
        lastName: "User",
        email: adminEmail,
        password: hashedPassword,
        phone: "1234567890",
        isActive: true,
      });

      console.log("✓ Default admin user created successfully");
      console.log(`  Email: ${admin.email}`);
      console.log(`  Password: ${adminPassword}`);
      console.log(
        "  ⚠️  Please change the default password after first login!"
      );
    } catch (error) {
      console.error("✗ Error creating admin user:", error);
    }
  }

  /**
   * Middleware to run seeder on app startup
   */
  static async seedOnStartup(): Promise<void> {
    console.log("🌱 Running admin seeder...");
    await AdminSeeder.createDefaultAdmin();
    console.log("🌱 Admin seeder completed");
  }
}
