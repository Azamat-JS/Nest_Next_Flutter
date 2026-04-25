import 'package:mobile/features/groups/data/models/groupdb_model.dart';
import 'package:sqflite/sqflite.dart';

abstract interface class GroupLocalDatasource {
  Future<void> cacheGroup(GroupdbModel group);
  Future<GroupdbModel?> getCachedGroup(String id);
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
  Future<void> clearCache() async {
    await db.delete('groups');
  }
}
