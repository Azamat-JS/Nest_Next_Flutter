import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/features/student_scores/domain/entity/one_student_score_entity.dart';
import 'package:mobile/features/student_scores/domain/repositories/student_score_repository.dart';

class OneStudentScoreUsecase
    implements Usecase<List<OneStudentScoreEntity>, OneStudentScoreParams> {
  final StudentScoreRepository repo;
  const OneStudentScoreUsecase(this.repo);

  @override
  Future<Either<Failure, List<OneStudentScoreEntity>>> call(
    OneStudentScoreParams params,
  ) async {
    return repo.getOneStudentScores(
      studentId: params.studentId,
      groupId: params.groupId,
    );
  }
}

class OneStudentScoreParams {
  final String studentId;
  final String groupId;

  OneStudentScoreParams({required this.studentId, required this.groupId});
}
