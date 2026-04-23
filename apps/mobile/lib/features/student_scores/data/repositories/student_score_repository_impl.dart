import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/student_scores/data/datasources/student_score_datasource.dart';
import 'package:mobile/features/student_scores/domain/entity/student_scores_entity.dart';
import 'package:mobile/features/student_scores/domain/repositories/student_score_repository.dart';

class StudentScoreRepositoryImpl implements StudentScoreRepository {
  final StudentScoreDataSource dataSource;

  StudentScoreRepositoryImpl(this.dataSource);

  @override
  Future<Either<Failure, List<StudentScoreEntity>>> getTodayScores({
    required String groupId,
  }) async {
    try {
      final studentScores = await dataSource.getStudentScore(groupId: groupId);
      return right(studentScores);
    } catch (e) {
      return left(Failure('Failed to fetch student scores: $e'));
    }
  }
}
