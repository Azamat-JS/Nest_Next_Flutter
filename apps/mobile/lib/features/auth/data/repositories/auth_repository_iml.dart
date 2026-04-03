import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/exceptions.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/auth/data/datasourses/auth_remote_data_source.dart';
import 'package:mobile/core/common/entities/user_entity.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart';

class AuthRepositoryIml implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  AuthRepositoryIml(this.remoteDataSource);

  @override
  Future<Either<Failure, UserEntity>> getCurrentUser() async {
    try {
      final userData = await remoteDataSource.getCurrentUser();
      if (userData == null) {
        return left(Failure('No user logged in'));
      }
      return right(userData);
    } on ServerException catch (e) {
      return left(Failure(e.message));
    } catch (e) {
      return left(Failure('An unexpected error occurred: $e'));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    return _getUser(
      () async => await remoteDataSource.signInWithEmailAndPassword(
        email: email,
        password: password,
      ),
    );
  }

  @override
  Future<Either<Failure, UserEntity>> signUpWithEmailAndPassword({
    required String email,
    required String password,
    required String username,
  }) async {
    return _getUser(
      () async => await remoteDataSource.signUpWithEmailAndPassword(
        username: username,
        email: email,
        password: password,
      ),
    );
  }

  @override
  Future<Either<Failure, void>> signOut() async {
    try {
      await remoteDataSource.signOut();
      return right(null);
    } catch (e) {
      return left(Failure('An unexpected error occurred: $e'));
    }
  }

  Future<Either<Failure, UserEntity>> _getUser(
    Future<UserEntity> Function() getUserFunc,
  ) async {
    try {
      final user = await getUserFunc();
      return right(user);
    } on ServerException catch (e) {
      return left(Failure(e.message));
    } catch (e) {
      return left(Failure('An unexpected error occurred: $e'));
    }
  }
}
