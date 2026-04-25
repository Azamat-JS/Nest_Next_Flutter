import 'package:mobile/features/groups/data/models/group_model.dart';
import 'package:sqflite/sqflite.dart';

abstract interface class GroupLocalDatasource {
  Future<void> cacheGroup(GroupModel group);
  Future<GroupModel?> getCachedGroup(String id);
  Future<void> clearCache();
}

class GroupLocalDatasourceImpl implements GroupLocalDatasource {
  final Database db;

  GroupLocalDatasourceImpl(this.db);

  @override
  Future<void> cacheGroup(GroupModel group) async {
    await db.insert(
      'group',
      group.toJson(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  @override
  Future<GroupModel?> getCachedGroup(String id) async {
    final res = await db.query('group', where: 'id = ?', whereArgs: [id]);
    if (res.isEmpty) return null;
    return GroupModel.fromJson(res.first);
  }

  @override
  Future<void> clearCache() {
    // TODO: implement clearCache
    throw UnimplementedError();
  }
}
