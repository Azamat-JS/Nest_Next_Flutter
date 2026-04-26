import 'package:mobile/core/common/entities/user_entity.dart';
import 'package:sqflite/sqflite.dart';

abstract class GroupStudentLocalDatasource {
  Future<List<UserEntity>> getStudentsByGroup(
    String groupId,
    int page,
    int limit,
  );
  Future<void> cacheStudentGroup({
    required String studentId,
    required String groupId,
  });
}

class GroupStudentLocalDatasourceImpl implements GroupStudentLocalDatasource {
  final Database db;

  GroupStudentLocalDatasourceImpl(this.db);

  @override
  Future<List<UserEntity>> getStudentsByGroup(
    String groupId,
    int page,
    int limit,
  ) async {
    final offset = (page - 1) * limit;
    final res = await db.rawQuery(
      '''
      SELECT u.id, u.username, u.email, u.role
      FROM users u
      INNER JOIN student_group sg
      ON u.id = sg.student_id
      WHERE sg.group_id = ?
      ORDER BY sg.joined_at DESC
      LIMIT ? OFFSET ?
    ''',
      [groupId, limit, offset],
    );

    return res.map((json) {
      return UserEntity(
        id: json['id'] as String,
        username: json['username'] as String,
        email: json['email'] as String,
        role: json['role'] as String?,
      );
    }).toList();
  }

  @override
  Future<void> cacheStudentGroup({
    required String studentId,
    required String groupId,
  }) async {
    await db.insert('student_group', {
      'id': '${studentId}_$groupId',
      'student_id': studentId,
      'group_id': groupId,
      'joined_at': DateTime.now().toIso8601String(),
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }
}
