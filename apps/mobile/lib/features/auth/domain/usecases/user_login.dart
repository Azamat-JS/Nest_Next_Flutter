import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart';

class UserLogin implements Usecase<void, UserLoginParams> {
  final AuthRepository authRepository;
  const UserLogin(this.authRepository);
  @override
  Future<Either<Failure, void>> call(UserLoginParams params) async {
    await authRepository.signInWithEmailAndPassword(
      email: params.email,
      password: params.password,
    );
    return right(null);
  }
}

class UserLoginParams {
  final String email;
  final String password;

  UserLoginParams({required this.email, required this.password});
}
