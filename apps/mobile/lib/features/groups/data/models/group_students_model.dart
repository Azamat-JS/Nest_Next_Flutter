import 'package:mobile/features/auth/data/models/user_model.dart';
import 'package:mobile/features/groups/domain/entities/group_students_entity.dart';

class GroupStudentsModel extends GroupStudentsEntity {
  GroupStudentsModel({
    required super.data,
    required super.lastPage,
    required super.page,
    required super.total,
  });

  factory GroupStudentsModel.fromJson(Map<String, dynamic> json) {
    final meta = json['meta'] as Map<String, dynamic>;
    return GroupStudentsModel(
      data: (json['data'] as List<dynamic>)
          .map((u) => UserModel.fromJson(u as Map<String, dynamic>))
          .toList(),
      lastPage: meta['lastPage'] as int,
      page: meta['page'] as int,
      total: meta['total'] as int,
    );
  }
}
