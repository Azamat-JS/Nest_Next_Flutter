import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/features/student_scores/domain/entity/student_scores_entity.dart';
import 'package:mobile/features/student_scores/domain/repositories/student_score_repository.dart';

class GetTodayStudentScoresUsecase
    implements Usecase<List<StudentScoreEntity>, GetTodayStudentScoreParams> {
  final StudentScoreRepository repo;
  const GetTodayStudentScoresUsecase(this.repo);

  @override
  Future<Either<Failure, List<StudentScoreEntity>>> call(
    GetTodayStudentScoreParams params,
  ) async {
    return repo.getTodayScores(groupId: params.groupId);
  }
}

class GetTodayStudentScoreParams {
  final String groupId;

  GetTodayStudentScoreParams({required this.groupId});
}
