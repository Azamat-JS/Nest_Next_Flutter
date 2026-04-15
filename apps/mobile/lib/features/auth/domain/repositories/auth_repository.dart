import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/common/entities/user_entity.dart';

abstract interface class AuthRepository {
  Future<Either<Failure, void>> signUpWithEmailAndPassword({
    required String email,
    required String password,
    required String username,
    required String role,
  });

  Future<Either<Failure, void>> signInWithEmailAndPassword({
    required String email,
    required String password,
  });

  Future<Either<Failure, UserEntity>> getCurrentUser();

  Future<Either<Failure, void>> signOut();
}
