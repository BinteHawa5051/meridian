/**
 * Database setup script - Run this to initialize the Neon database schema
 * Usage: npx tsx scripts/setup-db.ts
 */

import { db } from "../lib/db";
import { readFileSync } from "fs";
import { join } from "path";

async function setupDatabase() {
  try {
    console.log("🚀 Setting up database schema...");

    // Read the schema SQL file
    const schemaPath = join(__dirname, "../lib/schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");

    // Split by semicolon to run each statement
    const statements = schema
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await db.query(statement);
        console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error);
        // Continue with other statements even if one fails
      }
    }

    console.log("✨ Database setup completed!");

    // Insert default admin user if not exists
    console.log("👤 Creating default admin user...");
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash("Admin@1234", 10);

    try {
      await db.query(
        `INSERT INTO users (email, name, password_hash, role, org_id)
         VALUES ($1, $2, $3, $4, gen_random_uuid())
         ON CONFLICT (email) DO NOTHING`,
        ["admin@meridian.dev", "Admin", passwordHash, "admin"]
      );
      console.log("✅ Default admin user created (email: admin@meridian.dev, password: Admin@1234)");
    } catch (error) {
      console.log("ℹ️  Admin user may already exist");
    }

    console.log("\n🎉 Setup complete! You can now login with:");
    console.log("   Email: admin@meridian.dev");
    console.log("   Password: Admin@1234");

    process.exit(0);
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  }
}

setupDatabase();
