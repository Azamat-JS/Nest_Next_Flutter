import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/groups/domain/entities/group_students_page_entity.dart';
import 'package:mobile/features/groups/domain/repositories/group_repository.dart';
import 'package:mobile/core/usecase/usecase.dart';

class GetGroupStudentsUsecase
    implements Usecase<GroupStudentsPageEntity, GroupStudentsPageParams> {
  final GroupRepository repository;

  GetGroupStudentsUsecase(this.repository);

  @override
  Future<Either<Failure, GroupStudentsPageEntity>> call(
    GroupStudentsPageParams params,
  ) {
    return repository.getGroupStudents(
      groupId: params.groupId,
      page: params.page,
      limit: params.limit,
    );
  }
}

class GroupStudentsPageParams {
  final String groupId;
  final int page;
  final int limit;

  const GroupStudentsPageParams({
    required this.groupId,
    required this.page,
    required this.limit,
  });
}
