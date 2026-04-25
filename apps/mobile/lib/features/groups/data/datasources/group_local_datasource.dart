import 'package:mobile/features/groups/data/models/group_model.dart';

abstract interface class GroupLocalDatasource {
  Future<void> cacheGroup(GroupModel group);
  Future<GroupModel?> getCachedGroup(String id);
  Future<void> clearCache();
}
