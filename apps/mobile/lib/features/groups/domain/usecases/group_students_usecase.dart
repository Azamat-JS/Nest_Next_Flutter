import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/features/groups/domain/entities/group_students_entity.dart';
import 'package:mobile/features/groups/domain/repositories/group_repository.dart';

class GroupStudentsUsecase
    implements Usecase<GroupStudentsEntity, GroupStudentsParams> {
  final GroupRepository groupRepository;
  GroupStudentsUsecase(this.groupRepository);

  @override
  Future<Either<Failure, GroupStudentsEntity>> call(
    GroupStudentsParams params,
  ) async {
    return groupRepository.getGroupStudents(
      groupId: params.groupId,
      page: params.page,
      limit: params.limit,
    );
  }
}

class GroupStudentsParams {
  final String groupId;
  final int page;
  final int limit;

  GroupStudentsParams({
    required this.groupId,
    required this.page,
    required this.limit,
  });
}
