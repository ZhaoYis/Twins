import postgres from "postgres";
import "dotenv/config";

/**
 * Migration script for subscription system
 *
 * This script:
 * 1. Creates the subscription_plan table
 * 2. Creates the user_subscription table
 * 3. Creates the token_usage_log table
 * 4. Adds subscription_tier column to user table
 * 5. Adds model_name, display_order, allowed_tiers columns to global_provider table
 * 6. Inserts default subscription plans
 */

async function migrateSubscription() {
  const sql = postgres(process.env.POSTGRES_URL!);

  try {
    console.log("🚀 Starting subscription system migration...\n");

    // 1. Create subscription_plan table
    console.log("📄 Creating subscription_plan table...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS subscription_plan (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        display_name TEXT NOT NULL,
        price INTEGER NOT NULL DEFAULT 0,
        tokens_per_month INTEGER,
        max_team_members INTEGER DEFAULT 1,
        can_add_own_providers BOOLEAN DEFAULT false,
        features JSONB,
        is_active BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("  ✓ subscription_plan table created\n");

    // 2. Create user_subscription table
    console.log("📄 Creating user_subscription table...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS user_subscription (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        plan_id UUID NOT NULL REFERENCES subscription_plan(id),
        status TEXT NOT NULL DEFAULT 'active',
        tokens_used INTEGER DEFAULT 0,
        tokens_remaining INTEGER DEFAULT 0,
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("  ✓ user_subscription table created\n");

    // 3. Create token_usage_log table
    console.log("📄 Creating token_usage_log table...");
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS token_usage_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        subscription_id UUID REFERENCES user_subscription(id),
        provider_id UUID REFERENCES global_provider(id),
        tokens_used INTEGER NOT NULL,
        model TEXT,
        request_type TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("  ✓ token_usage_log table created\n");

    // 4. Add subscription_tier column to user table
    console.log("📄 Adding subscription_tier column to user table...");
    try {
      await sql.unsafe(`
        ALTER TABLE "user" ADD COLUMN subscription_tier TEXT DEFAULT 'free' NOT NULL;
      `);
      console.log("  ✓ subscription_tier column added\n");
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        console.log("  ⚠ subscription_tier column already exists\n");
      } else {
        throw error;
      }
    }

    // 5. Add new columns to global_provider table
    console.log("📄 Adding new columns to global_provider table...");

    try {
      await sql.unsafe(`ALTER TABLE global_provider ADD COLUMN model_name TEXT;`);
      console.log("  ✓ model_name column added");
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        console.log("  ⚠ model_name column already exists");
      } else {
        throw error;
      }
    }

    try {
      await sql.unsafe(`ALTER TABLE global_provider ADD COLUMN display_order INTEGER DEFAULT 0;`);
      console.log("  ✓ display_order column added");
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        console.log("  ⚠ display_order column already exists");
      } else {
        throw error;
      }
    }

    try {
      await sql.unsafe(`ALTER TABLE global_provider ADD COLUMN allowed_tiers JSONB DEFAULT '["free", "pro", "enterprise"]';`);
      console.log("  ✓ allowed_tiers column added");
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        console.log("  ⚠ allowed_tiers column already exists");
      } else {
        throw error;
      }
    }
    console.log("");

    // 6. Insert default subscription plans
    console.log("📄 Inserting default subscription plans...");

    const defaultPlans = [
      {
        name: 'free',
        display_name: '免费版',
        price: 0,
        tokens_per_month: 100000, // 100K tokens
        max_team_members: 1,
        can_add_own_providers: false,
        features: JSON.stringify([
          '每月 10万 Token 额度',
          '使用平台 AI Provider',
          '基础风格分析',
          '基础内容生成',
        ]),
      },
      {
        name: 'pro',
        display_name: '专业版',
        price: 9900, // ¥99 (in cents)
        tokens_per_month: 1000000, // 1M tokens
        max_team_members: 3,
        can_add_own_providers: true,
        features: JSON.stringify([
          '每月 100万 Token 额度',
          '添加自己的 API Key',
          '高级风格分析',
          '高级内容生成',
          '优先技术支持',
          '最多 3 名团队成员',
        ]),
      },
      {
        name: 'enterprise',
        display_name: '企业版',
        price: 29900, // ¥299 (in cents)
        tokens_per_month: 5000000, // 5M tokens
        max_team_members: 10,
        can_add_own_providers: true,
        features: JSON.stringify([
          '每月 500万 Token 额度',
          '添加自己的 API Key',
          '高级风格分析',
          '高级内容生成',
          '专属技术支持',
          '最多 10 名团队成员',
          'API 访问',
          '自定义模型配置',
        ]),
      },
    ];

    for (const plan of defaultPlans) {
      const existing = await sql`
        SELECT id FROM subscription_plan WHERE name = ${plan.name};
      `;

      if (existing.length === 0) {
        await sql`
          INSERT INTO subscription_plan (name, display_name, price, tokens_per_month, max_team_members, can_add_own_providers, features)
          VALUES (${plan.name}, ${plan.display_name}, ${plan.price}, ${plan.tokens_per_month}, ${plan.max_team_members}, ${plan.can_add_own_providers}, ${plan.features}::jsonb);
        `;
        console.log(`  ✓ Inserted plan: ${plan.display_name}`);
      } else {
        console.log(`  ⚠ Plan already exists: ${plan.display_name}`);
      }
    }
    console.log("");

    // 7. Create user_subscription records for existing users
    console.log("📄 Creating subscriptions for existing users...");
    const freePlan = await sql`
      SELECT id FROM subscription_plan WHERE name = 'free' LIMIT 1;
    `;

    if (freePlan.length > 0) {
      const planId = freePlan[0].id;
      const usersWithoutSubscription = await sql`
        SELECT u.id FROM "user" u
        WHERE NOT EXISTS (
          SELECT 1 FROM user_subscription us WHERE us.user_id = u.id
        );
      `;

      for (const user of usersWithoutSubscription) {
        await sql`
          INSERT INTO user_subscription (user_id, plan_id, status, tokens_remaining, current_period_start, current_period_end)
          VALUES (${user.id}, ${planId}, 'active', 100000, NOW(), NOW() + INTERVAL '1 month');
        `;
      }
      console.log(`  ✓ Created subscriptions for ${usersWithoutSubscription.length} users\n`);
    }

    console.log("✅ Subscription system migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrateSubscription();
