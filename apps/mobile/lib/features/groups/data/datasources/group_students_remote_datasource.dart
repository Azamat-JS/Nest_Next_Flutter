import 'package:mobile/core/network/dio_client.dart';
import 'package:mobile/features/groups/data/models/group_students_page_model.dart';

abstract interface class GroupStudentsRemoteDatasource {
  Future<GroupStudentsPageModel> getGroupStudents({
    required String groupId,
    required int page,
    required int limit,
  });
}

class GroupStudentsRemoteDatasourceImpl
    implements GroupStudentsRemoteDatasource {
  final DioClient dioClient;

  GroupStudentsRemoteDatasourceImpl(this.dioClient);

  @override
  Future<GroupStudentsPageModel> getGroupStudents({
    required String groupId,
    required int page,
    required int limit,
  }) async {
    final res = await dioClient.dio.get(
      '/group/$groupId/students',
      queryParameters: {'page': page, 'limit': limit},
    );
    return GroupStudentsPageModel.fromJson(res.data as Map<String, dynamic>);
  }
}
