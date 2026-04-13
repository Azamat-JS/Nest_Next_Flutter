import 'package:mobile/features/groups/domain/entities/group_entity.dart';

class MergeGroupsService {
  PaginatedGroupsEntity call(
    PaginatedGroupsEntity old,
    PaginatedGroupsEntity newData,
  ) {
    return old.copyWith(
      data: [...old.data, ...newData.data],
      page: newData.page,
      total: newData.total,
    );
  }
}
