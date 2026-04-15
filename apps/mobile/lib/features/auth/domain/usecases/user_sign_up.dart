import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart';

class UserSignUp implements Usecase<void, UserSignUpParams> {
  final AuthRepository authRepository;
  const UserSignUp(this.authRepository);

  @override
  Future<Either<Failure, void>> call(UserSignUpParams params) async {
    if (params.password.length < 6) {
      return left(Failure('Password must be at least 6 characters long.'));
    }
    if (params.email.isEmpty ||
        params.password.isEmpty ||
        params.username.isEmpty) {
      return left(Failure('All fields are required'));
    }
    await authRepository.signUpWithEmailAndPassword(
      username: params.username,
      email: params.email,
      password: params.password,
    );
    return right(null);
  }
}

class UserSignUpParams {
  final String email;
  final String password;
  final String username;

  UserSignUpParams({
    required this.email,
    required this.password,
    required this.username,
  });
}
