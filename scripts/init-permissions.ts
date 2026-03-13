import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { roles, permissions, rolePermissions, userRoles, users } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

dotenv.config();

async function main() {
  const client = postgres(process.env.POSTGRES_URL!);
  const db = drizzle(client);

  console.log('🚀 开始初始化权限系统...');

  try {
    // 1. 创建默认角色
    console.log('📋 创建默认角色...');
    const defaultRoles = [
      { name: 'admin', displayName: '超级管理员', description: '拥有所有权限', isSystem: true },
      { name: 'editor', displayName: '编辑者', description: '可以管理内容', isSystem: true },
      { name: 'viewer', displayName: '查看者', description: '只能查看数据', isSystem: true },
    ];

    const createdRoles = [];
    for (const role of defaultRoles) {
      const [created] = await db.insert(roles).values(role).onConflictDoNothing().returning();
      if (created) {
        createdRoles.push(created);
        console.log(`  ✓ 创建角色: ${role.displayName}`);
      } else {
        // 获取已存在的角色
        const existing = await db.select().from(roles).where(eq(roles.name, role.name));
        if (existing[0]) {
          createdRoles.push(existing[0]);
        }
      }
    }

    // 2. 创建默认权限
    console.log('🔐 创建默认权限...');
    const defaultPermissions = [
      // 用户管理
      { resource: 'users', action: 'read', description: '查看用户列表' },
      { resource: 'users', action: 'write', description: '创建/编辑用户' },
      { resource: 'users', action: 'delete', description: '删除用户' },
      { resource: 'users', action: 'manage', description: '管理用户权限' },

      // 内容管理
      { resource: 'content', action: 'read', description: '查看内容' },
      { resource: 'content', action: 'write', description: '创建/编辑内容' },
      { resource: 'content', action: 'delete', description: '删除内容' },

      // 反馈管理
      { resource: 'feedback', action: 'read', description: '查看用户反馈' },
      { resource: 'feedback', action: 'write', description: '处理用户反馈' },

      // Provider 管理
      { resource: 'providers', action: 'read', description: '查看 Provider 配置' },
      { resource: 'providers', action: 'write', description: '配置 Provider' },
      { resource: 'providers', action: 'delete', description: '删除 Provider' },

      // 订阅管理
      { resource: 'subscriptions', action: 'read', description: '查看订阅' },
      { resource: 'subscriptions', action: 'write', description: '管理订阅' },

      // 角色权限管理
      { resource: 'roles', action: 'read', description: '查看角色' },
      { resource: 'roles', action: 'write', description: '管理角色' },
      { resource: 'roles', action: 'delete', description: '删除角色' },
    ];

    const createdPermissions = [];
    for (const perm of defaultPermissions) {
      const [created] = await db.insert(permissions).values(perm).onConflictDoNothing().returning();
      if (created) {
        createdPermissions.push(created);
        console.log(`  ✓ 创建权限: ${perm.resource}:${perm.action}`);
      } else {
        // 获取已存在的权限
        const existing = await db.select()
          .from(permissions)
          .where(eq(permissions.resource, perm.resource))
          .then(rows => rows.filter(r => r.action === perm.action));

        if (existing[0]) {
          createdPermissions.push(existing[0]);
        }
      }
    }

    // 3. 分配权限给角色
    console.log('🔗 分配权限给角色...');

    const adminRole = createdRoles.find(r => r.name === 'admin');
    const editorRole = createdRoles.find(r => r.name === 'editor');
    const viewerRole = createdRoles.find(r => r.name === 'viewer');

    if (!adminRole || !editorRole || !viewerRole) {
      throw new Error('角色创建失败');
    }

    // Admin 拥有所有权限
    for (const perm of createdPermissions) {
      await db.insert(rolePermissions)
        .values({ roleId: adminRole.id, permissionId: perm.id })
        .onConflictDoNothing();
    }
    console.log(`  ✓ 为超级管理员分配所有权限 (${createdPermissions.length} 个)`);

    // Editor 拥有内容和反馈相关权限
    const editorPerms = createdPermissions.filter(p =>
      ['content', 'feedback'].includes(p.resource)
    );
    for (const perm of editorPerms) {
      await db.insert(rolePermissions)
        .values({ roleId: editorRole.id, permissionId: perm.id })
        .onConflictDoNothing();
    }
    console.log(`  ✓ 为编辑者分配权限 (${editorPerms.length} 个)`);

    // Viewer 只有查看权限
    const viewerPerms = createdPermissions.filter(p => p.action === 'read');
    for (const perm of viewerPerms) {
      await db.insert(rolePermissions)
        .values({ roleId: viewerRole.id, permissionId: perm.id })
        .onConflictDoNothing();
    }
    console.log(`  ✓ 为查看者分配权限 (${viewerPerms.length} 个)`);

    // 4. 为管理员邮箱分配超级管理员角色
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      console.log(`👑 为管理员邮箱分配超级管理员角色...`);
      console.log(`  📧 管理员邮箱: ${adminEmail}`);

      // 查找用户
      const adminUserResult = await db
        .select()
        .from(users)
        .where(eq(users.email, adminEmail))
        .limit(1);

      const adminUser = adminUserResult[0];

      if (adminUser) {
        // 更新用户角色为 admin
        await db.update(users)
          .set({ role: 'admin' })
          .where(eq(users.id, adminUser.id));

        // 分配超级管理员角色
        await db.insert(userRoles)
          .values({
            userId: adminUser.id,
            roleId: adminRole.id,
          })
          .onConflictDoNothing();

        console.log(`  ✓ 已将 ${adminEmail} 设置为超级管理员`);
      } else {
        console.log(`  ⚠️  未找到邮箱为 ${adminEmail} 的用户，请稍后手动分配`);
        console.log(`  💡 提示: 用户首次登录后会自动创建，然后可以手动分配管理员角色`);
      }
    } else {
      console.log(`  ⚠️  未配置 ADMIN_EMAIL 环境变量，跳过自动分配管理员角色`);
    }

    console.log('✅ 权限系统初始化完成！');
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    throw error;
  } finally {
    await client.end();
  }
}

main();
