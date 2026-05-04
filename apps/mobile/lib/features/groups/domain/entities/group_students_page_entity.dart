import 'package:mobile/core/common/entities/user_entity.dart';

class GroupStudentsPageEntity {
  final List<UserEntity> data;
  final int page;
  final int lastPage;
  final int limit;
  final int total;

  const GroupStudentsPageEntity({
    required this.data,
    required this.page,
    required this.lastPage,
    required this.limit,
    required this.total,
  });
}
