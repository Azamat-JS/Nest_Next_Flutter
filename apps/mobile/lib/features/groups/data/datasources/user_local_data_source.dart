import 'package:mobile/core/common/entities/user_entity.dart';
import 'package:sqflite/sqflite.dart';

abstract class UserLocalDataSource {
  Future<UserEntity?> getCachedUser();
  Future<void> cacheUser(UserEntity user);
  Future<void> clearCache();
}

class UserLocalDataSourceImpl implements UserLocalDataSource {
  final Database db;

  UserLocalDataSourceImpl(this.db);

  @override
  Future<UserEntity?> getCachedUser() async {
    final res = await db.query('current_user', limit: 1);

    if (res.isEmpty) return null;

    final json = res.first;

    return UserEntity(
      id: json['id'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
    );
  }

  @override
  Future<void> cacheUser(UserEntity user) async {
    await db.delete('current_user');

    await db.insert('current_user', {
      'id': user.id,
      'username': user.username,
      'email': user.email,
      'role': user.role,
      'created_at': DateTime.now().toIso8601String(),
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  @override
  Future<void> clearCache() async {
    await db.delete('current_user');
  }
}
