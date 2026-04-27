import 'package:mobile/features/groups/data/models/groupdb_model.dart';
import 'package:sqflite/sqflite.dart';

abstract interface class GroupLocalDatasource {
  Future<void> cacheGroup(GroupdbModel group);
  Future<GroupdbModel?> getCachedGroup(String id);
  Future<List<GroupdbModel>> getRecentGroups();
  Future<void> markGroupAsOpened(String groupId);
  Future<void> clearCache();
}

class GroupLocalDatasourceImpl implements GroupLocalDatasource {
  final Database db;

  GroupLocalDatasourceImpl(this.db);

  @override
  Future<void> cacheGroup(GroupdbModel group) async {
    await db.insert(
      'groups',
      group.toJson(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  @override
  Future<GroupdbModel?> getCachedGroup(String id) async {
    final res = await db.query('groups', where: 'id = ?', whereArgs: [id]);

    if (res.isEmpty) return null;
    return GroupdbModel.fromJson(res.first);
  }

  @override
  Future<void> markGroupAsOpened(String groupId) async {
    await db.update(
      'groups',
      {'last_opened': DateTime.now().millisecondsSinceEpoch, 'is_recent': 1},
      where: 'id = ?',
      whereArgs: [groupId],
    );
  }

  @override
  Future<List<GroupdbModel>> getRecentGroups() async {
    final res = await db.query(
      'groups',
      where: 'is_recent = ?',
      whereArgs: [1],
      orderBy: 'last_opened DESC',
    );

    return res.map(GroupdbModel.fromJson).toList();
  }

  @override
  Future<void> clearCache() async {
    await db.delete('groups');
  }
}
