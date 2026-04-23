import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/groups/data/datasources/group_remote_data_source.dart';
import 'package:mobile/features/groups/domain/entities/group_entity.dart';
import 'package:mobile/features/groups/domain/repositories/group_repository.dart';

class GroupRepositoryImpl implements GroupRepository {
  final GroupRemoteDataSource remoteDataSource;
  GroupRepositoryImpl(this.remoteDataSource);

  @override
  Future<Either<Failure, GroupEntity>> getGroupById({
    required String id,
  }) async {
    try {
      final group = await remoteDataSource.getGroupById(id: id);
      return right(group);
    } catch (e) {
      return left(Failure('Failed to fetch group: $e'));
    }
  }

  @override
  Future<Either<Failure, PaginatedGroupsEntity>> getGroups({
    required int page,
    required int limit,
  }) async {
    try {
      final groups = await remoteDataSource.getGroups(page: page, limit: limit);
      return right(groups);
    } catch (e) {
      return left(Failure('Failed to fetch groups: $e'));
    }
  }
}
