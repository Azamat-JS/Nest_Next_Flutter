import 'package:mobile/features/groups/data/models/group_students_model.dart';
import 'package:mobile/features/groups/domain/entities/group_students_page_entity.dart';

class GroupStudentsPageModel {
  final List<GroupStudentsModel> data;
  final int page;
  final int lastPage;
  final int limit;
  final int total;

  const GroupStudentsPageModel({
    required this.data,
    required this.page,
    required this.lastPage,
    required this.limit,
    required this.total,
  });

  factory GroupStudentsPageModel.fromJson(Map<String, dynamic> json) {
    final meta = json['meta'] as Map<String, dynamic>;

    return GroupStudentsPageModel(
      data: (json['data'] as List<dynamic>)
          .map((e) => GroupStudentsModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      page: meta['page'] as int,
      lastPage: meta['last_page'] as int,
      limit: meta['limit'] as int,
      total: meta['total'] as int,
    );
  }

  GroupStudentsPageEntity toEntity() {
    return GroupStudentsPageEntity(
      data: data.map((e) => e.toEntity()).toList(),
      page: page,
      lastPage: lastPage,
      limit: limit,
      total: total,
    );
  }
}
