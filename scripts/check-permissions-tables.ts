import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = postgres(process.env.POSTGRES_URL!);

  try {
    // 检查权限相关的表是否存在
    const tables = await client`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('role', 'permission', 'role_permission', 'user_role')
      ORDER BY table_name
    `;

    console.log('📊 权限相关表检查结果：');
    if (tables.length === 0) {
      console.log('  ❌ 未找到任何权限相关表');
      console.log('  💡 需要运行数据库迁移');
    } else {
      console.log('  ✓ 已存在的表：');
      tables.forEach(t => console.log(`    - ${t.table_name}`));

      if (tables.length < 4) {
        console.log('  ⚠️  部分表缺失，需要运行数据库迁移');
      } else {
        console.log('  ✅ 所有权限表都已创建');

        // 检查是否有数据
        const roleCount = await client`SELECT COUNT(*) FROM role`;
        const permCount = await client`SELECT COUNT(*) FROM permission`;

        console.log('\n📈 数据统计：');
        console.log(`  - 角色数量: ${roleCount[0].count}`);
        console.log(`  - 权限数量: ${permCount[0].count}`);

        if (roleCount[0].count === '0' || permCount[0].count === '0') {
          console.log('\n  💡 需要运行初始化脚本: npm run init-permissions');
        } else {
          console.log('\n  ✅ 权限系统已完全初始化');
        }
      }
    }
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await client.end();
  }
}

main();
