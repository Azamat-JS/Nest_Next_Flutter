import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/common/entities/user_entity.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/groups/data/datasources/group_local_datasource.dart';
import 'package:mobile/features/groups/data/datasources/group_remote_data_source.dart';
import 'package:mobile/features/groups/domain/entities/group_entity.dart';
import 'package:mobile/features/groups/domain/repositories/group_repository.dart';

class GroupRepositoryImpl implements GroupRepository {
  final GroupRemoteDataSource remoteDataSource;
  final GroupLocalDatasource localDataSource;

  GroupRepositoryImpl(this.remoteDataSource, this.localDataSource);

  @override
  Future<Either<Failure, GroupEntity>> getGroupById({
    required String id,
  }) async {
    try {
      final cached = await localDataSource.getCachedGroup(id);

      if (cached != null) {
        _refreshInBackgroundId(id);

        final teacher =
            await localDataSource.getUser(cached.teacherId) ??
            UserEntity.empty();

        final students = await localDataSource.getStudentsByGroup(id) ?? [];

        return right(
          GroupEntity(
            id: cached.id,
            name: cached.name,
            teacherId: cached.teacherId,
            createdAt: cached.createdAt,
            teacher: teacher,
            students: students,
          ),
        );
      }

      final remote = await remoteDataSource.getGroupById(id: id);

      final entity = remote.toEntity();

      await localDataSource.cacheGroup(GroupdbModel.fromEntity(entity));

      return right(entity);
    } catch (e) {
      return left(Failure('Failed to fetch group: $e'));
    }
  }

  Future<void> _refreshInBackgroundId(String id) async {
    try {
      final fresh = await remoteDataSource.getGroupById(id: id);

      final entity = fresh.toEntity();

      await localDataSource.cacheGroup(GroupdbModel.fromEntity(entity));
    } catch (_) {}
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
