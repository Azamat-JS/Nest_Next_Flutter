import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/common/entities/user_entity.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/features/auth/domain/repositories/auth_repository.dart';

class CurrentUser implements Usecase<UserEntity, NoParams> {
  final AuthRepository repository;
  const CurrentUser(this.repository);

  @override
  Future<Either<Failure, UserEntity>> call(NoParams params) async {
    return await repository.getCurrentUser();
  }
}
