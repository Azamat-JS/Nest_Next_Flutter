import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/features/groups/domain/entities/group_entity.dart';
import 'package:mobile/features/groups/domain/repositories/group_repository.dart';

class GroupAll implements Usecase<PaginatedGroupsEntity, GroupAllParams> {
  final GroupRepository groupRepository;
  const GroupAll(this.groupRepository);

  @override
  Future<Either<Failure, PaginatedGroupsEntity>> call(
    GroupAllParams params,
  ) async {
    return await groupRepository.getGroups(
      page: params.page,
      limit: params.limit,
    );
  }
}

class GroupAllParams {
  final int page;
  final int limit;

  GroupAllParams({required this.page, required this.limit});
}
