import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart';

class LogoutUser implements Usecase<void, NoParams> {
  final AuthRepository repository;
  const LogoutUser(this.repository);

  @override
  Future<Either<Failure, dynamic>> call(NoParams params) async {
    return await repository.signOut();
  }
}
