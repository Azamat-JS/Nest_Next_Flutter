import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/groups/domain/entities/group_entity.dart';
import 'package:mobile/features/groups/domain/entities/group_students_entity.dart';

abstract interface class GroupRepository {
  Future<Either<Failure, PaginatedGroupsEntity>> getGroups({
    required int page,
    required int limit,
  });

  Future<Either<Failure, GroupEntity>> getGroupById({required String id});
  Future<Either<Failure, GroupStudentsEntity>> getGroupStudents({
    required String groupId,
    required int page,
    required int limit,
  });
}
