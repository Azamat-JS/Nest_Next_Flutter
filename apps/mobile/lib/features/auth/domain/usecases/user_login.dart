import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart';

class UserLogin implements Usecase<String, UserLoginParams> {
  final AuthRepository authRepository;
  const UserLogin(this.authRepository);
  @override
  Future<Either<Failure, String>> call(UserLoginParams params) async {
    return await authRepository.signInWithEmailAndPassword(
      email: params.email,
      password: params.password,
    );
  }
}

class UserLoginParams {
  final String email;
  final String password;

  UserLoginParams({required this.email, required this.password});
}
