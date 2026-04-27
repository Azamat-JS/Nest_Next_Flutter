import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/features/groups/domain/entities/group_entity.dart';
import 'package:mobile/features/groups/domain/repositories/group_repository.dart';

class GetRecentGroupsUseCase implements Usecase<List<GroupEntity>, NoParams> {
  final GroupRepository repository;

  GetRecentGroupsUseCase(this.repository);

  @override
  Future<Either<Failure, List<GroupEntity>>> call(NoParams params) async {
    return repository.getRecentGroups();
  }
}

class NoParams {}
