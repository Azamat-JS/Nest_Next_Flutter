import 'package:fpdart/fpdart.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/features/groups/domain/entities/group_entity.dart';
import 'package:mobile/features/groups/domain/repositories/group_repository.dart';

class GetGroupByIdUseCase implements Usecase<GroupEntity, GroupByIdParams> {
  final GroupRepository groupRepository;
  const GetGroupByIdUseCase(this.groupRepository);
  @override
  Future<Either<Failure, GroupEntity>> call(GroupByIdParams params) async {
    return groupRepository.getGroupById(id: params.id);
  }
}

class GroupByIdParams {
  final String id;

  GroupByIdParams({required this.id});
}
