import 'package:mobile/core/common/entities/user_entity.dart';

class GroupStudentsEntity {
  final List<UserEntity> data;
  final int lastPage;
  final int page;
  final int total;

  GroupStudentsEntity({
    required this.data,
    required this.lastPage,
    required this.page,
    required this.total,
  });
}
