export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  // Allow GET requests for browser access
  return POST(req);
}

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Setting up database schema...");

    // Create organizations table
    await db.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        plan VARCHAR(50) DEFAULT 'builder',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log("✅ Organizations table created");

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
        org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log("✅ Users table created");

    // Create customers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID NOT NULL,
        external_id VARCHAR(255) UNIQUE NOT NULL,
        display_name VARCHAR(255),
        plan_tier VARCHAR(50) DEFAULT 'default',
        markup DECIMAL(10, 2) DEFAULT 0,
        stripe_customer_id VARCHAR(255),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log("✅ Customers table created");

    // Create cost_by_day table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cost_by_day (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
        bucket DATE NOT NULL,
        provider VARCHAR(50) NOT NULL,
        model VARCHAR(255) NOT NULL,
        total_cost DECIMAL(10, 2) DEFAULT 0,
        total_markup DECIMAL(10, 2) DEFAULT 0,
        request_count INTEGER DEFAULT 0,
        total_input_tokens INTEGER DEFAULT 0,
        total_output_tokens INTEGER DEFAULT 0,
        avg_latency_ms DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log("✅ Cost by day table created");

    // Create api_keys table
    await db.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        key_prefix VARCHAR(50) NOT NULL,
        key_hash VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        expires_at TIMESTAMP WITH TIME ZONE,
        last_used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log("✅ API keys table created");

    // Create indexes
    await db.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_users_org_id ON users(org_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_customers_org_id ON customers(org_id)`);
    await db.query(`CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON api_keys(org_id)`);
    console.log("✅ Indexes created");

    // Create default admin user with organization
    const passwordHash = await bcrypt.hash("Admin@1234", 10);
    const { rows } = await db.query(`
      WITH new_org AS (
        INSERT INTO organizations (slug, name, plan)
        VALUES ('meridian-admin', 'Meridian Admin', 'builder')
        RETURNING id
      ),
      new_user AS (
        INSERT INTO users (name, email, password_hash, role, org_id)
        SELECT 'Admin', 'admin@meridian.dev', $1, 'admin', new_org.id FROM new_org
        RETURNING id
      )
      SELECT new_user.id FROM new_user
    `, [passwordHash]);
    console.log("✅ Default admin user created");

    return NextResponse.json({ 
      success: true, 
      message: "Database setup completed successfully",
      adminCredentials: {
        email: "admin@meridian.dev",
        password: "Admin@1234"
      }
    });
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    return NextResponse.json(
      { error: "Database setup failed", details: String(error) },
      { status: 500 }
    );
  }
}
