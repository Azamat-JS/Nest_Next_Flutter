import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/student_scores/domain/entity/student_scores_entity.dart';

abstract interface class StudentScoreRepository {
  Future<Either<Failure, List<StudentScoreEntity>>> getTodayScores({
    required String groupId,
  });
}
