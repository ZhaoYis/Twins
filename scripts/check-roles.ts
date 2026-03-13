import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const client = postgres(process.env.POSTGRES_URL!);

  try {
    // 查看所有角色
    const allRoles = await client`
      SELECT id, name, display_name, is_system
      FROM role
      ORDER BY created_at
    `;

    console.log('📋 当前角色列表：');
    allRoles.forEach(role => {
      console.log(`  - ${role.display_name} (${role.name})`);
      console.log(`    ID: ${role.id}`);
      console.log(`    系统角色: ${role.is_system ? '是' : '否'}`);
      console.log('');
    });

    if (allRoles.every(r => r.is_system)) {
      console.log('💡 提示：所有角色都是系统内置角色，无法删除');
      console.log('   可以创建自定义角色进行测试');
    }
  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await client.end();
  }
}

main();
