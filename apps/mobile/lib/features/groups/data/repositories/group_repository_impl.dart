import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/common/entities/user_entity.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/groups/data/datasources/group_students_remote_datasource.dart';
import 'package:mobile/features/groups/data/datasources/user_local_data_source.dart';
import 'package:mobile/features/groups/data/datasources/group_local_datasource.dart';
import 'package:mobile/features/groups/data/datasources/group_remote_data_source.dart';
import 'package:mobile/features/groups/data/datasources/group_student_local_data_source.dart';
import 'package:mobile/features/groups/data/models/groupdb_model.dart';
import 'package:mobile/features/groups/domain/entities/group_entity.dart';
import 'package:mobile/features/groups/domain/entities/group_students_entity.dart';
import 'package:mobile/features/groups/domain/repositories/group_repository.dart';

class GroupRepositoryImpl implements GroupRepository {
  final GroupRemoteDataSource remoteDataSource;
  final GroupLocalDatasource localDataSource;
  final UserLocalDataSource userLocalDataSource;
  final GroupStudentLocalDatasource groupStudentLocalDatasource;
  final GroupStudentsRemoteDatasource groupStudentsRemoteDatasource;

  GroupRepositoryImpl(
    this.remoteDataSource,
    this.localDataSource,
    this.userLocalDataSource,
    this.groupStudentLocalDatasource,
    this.groupStudentsRemoteDatasource,
  );

  @override
  Future<Either<Failure, GroupEntity>> getGroupById({
    required String id,
  }) async {
    try {
      final cached = await localDataSource.getCachedGroup(id);

      if (cached != null) {
        _refreshInBackgroundId(id);

        final teacher = await userLocalDataSource.getCachedUser();

        return right(
          GroupEntity(
            id: cached.id,
            name: cached.name,
            teacherId: cached.teacherId,
            createdAt: cached.createdAt,
            teacher: teacher ?? _emptyUser(),
          ),
        );
      }
      final remote = await remoteDataSource.getGroupById(id: id);
      final entity = remote.toEntity();
      await localDataSource.cacheGroup(GroupdbModel.fromEntity(entity));
      await userLocalDataSource.cacheUser(entity.teacher);
      return right(remote.toEntity());
    } catch (e) {
      return left(Failure('Failed to fetch group: $e'));
    }
  }

  UserEntity _emptyUser() {
    return UserEntity(email: '', id: '', username: 'Unknown', role: null);
  }

  Future<void> _refreshInBackgroundId(String id) async {
    try {
      final fresh = await remoteDataSource.getGroupById(id: id);

      await localDataSource.cacheGroup(
        GroupdbModel.fromEntity(fresh.toEntity()),
      );
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

  @override
  Future<Either<Failure, GroupStudentsEntity>> getGroupStudents({
    required String groupId,
    required int page,
    required int limit,
  }) async {
    try {
      final students = await groupStudentsRemoteDatasource.getGroupStudents(
        groupId: groupId,
        page: page,
        limit: limit,
      );

      for (final student in students.data) {
        await userLocalDataSource.cacheUser(student);
        await groupStudentLocalDatasource.cacheStudentGroup(
          studentId: student.id,
          groupId: groupId,
        );
      }
      return right(
        GroupStudentsEntity(
          data: students.data,
          page: page,
          total: students.data.length,
          lastPage: 1,
        ),
      );
    } catch (e) {
      return left(Failure('Failed to fetch group students: $e'));
    }
  }
}
