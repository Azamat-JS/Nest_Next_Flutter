import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/groups/domain/entities/group_entity.dart';
import 'package:mobile/features/groups/domain/entities/group_students_page_entity.dart';
import 'package:mobile/features/groups/domain/entities/student_scores_entity.dart';

abstract interface class GroupRepository {
  Future<Either<Failure, PaginatedGroupsEntity>> getGroups({
    required int page,
    required int limit,
  });

  Future<Either<Failure, GroupEntity>> getGroupById({required String id});

  Future<Either<Failure, GroupStudentsPageEntity>> getGroupStudents({
    required String groupId,
    required int page,
    required int limit,
  });

  Future<Either<Failure, GroupStudentScoresEntity>> getGroupStudentScores({
    required String groupId,
  });

  Future<Either<Failure, List<GroupEntity>>> getRecentGroups();
}
