import 'package:mobile/core/common/entities/user_entity.dart';
import 'package:sqflite/sqflite.dart';

abstract class UserLocalDataSource {
  Future<UserEntity?> getUser(String id);
  Future<void> cacheUser(UserEntity user);
}

class UserLocalDataSourceImpl implements UserLocalDataSource {
  final Database db;

  UserLocalDataSourceImpl(this.db);

  @override
  Future<UserEntity?> getUser(String id) async {
    final res = await db.query('users', where: 'id = ?', whereArgs: [id]);

    if (res.isEmpty) return null;

    final json = res.first;

    return UserEntity(
      id: json['id'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      role: json['role'] as String?,
    );
  }

  @override
  Future<void> cacheUser(UserEntity user) async {
    await db.insert('users', {
      'id': user.id,
      'username': user.username,
      'email': user.email,
      'role': user.role,
      'created_at': DateTime.now().toIso8601String(),
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }
}
