import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/features/groups/domain/entities/student_scores_entity.dart';
import 'package:mobile/features/groups/domain/repositories/group_repository.dart';

class GroupStudentScoresUsecase
    implements Usecase<GroupStudentScoresEntity, GroupStudentScoresParams> {
  final GroupRepository repository;

  GroupStudentScoresUsecase(this.repository);

  @override
  Future<Either<Failure, GroupStudentScoresEntity>> call(
    GroupStudentScoresParams params,
  ) {
    return repository.getGroupStudentScores(groupId: params.groupId);
  }
}

class GroupStudentScoresParams {
  final String groupId;

  const GroupStudentScoresParams({required this.groupId});
}
