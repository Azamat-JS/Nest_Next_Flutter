import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/exceptions.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/auth/data/datasourses/auth_remote_data_source.dart';
import 'package:mobile/core/common/entities/user_entity.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  AuthRepositoryImpl(this.remoteDataSource);

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
      return left(Failure('Unexpected error occurred'));
    }
  }

  @override
  Future<Either<Failure, String>> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      final token = await remoteDataSource.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      print('TOKEN: $token');
      return right(token);
    } on ServerException catch (e) {
      return left(Failure(e.message));
    } catch (e) {
      return left(Failure('Unexpected error occurred'));
    }
  }

  @override
  Future<Either<Failure, void>> signUpWithEmailAndPassword({
    required String email,
    required String password,
    required String username,
    required String role,
  }) async {
    try {
      await remoteDataSource.signUpWithEmailAndPassword(
        username: username,
        email: email,
        password: password,
        role: role,
      );
      return right(null);
    } on ServerException catch (e) {
      return left(Failure(e.message));
    } catch (e) {
      return left(Failure('Unexpected error occurred'));
    }
  }

  @override
  Future<Either<Failure, void>> signOut() async {
    try {
      await remoteDataSource.signOut();
      return right(null);
    } catch (e) {
      return left(Failure('Unexpected error occurred'));
    }
  }
}
