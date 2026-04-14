import 'package:mobile/features/groups/domain/usecases/group_all.dart';
import 'package:mobile/features/groups/domain/usecases/group_by_id.dart';
import 'package:mobile/features/groups/domain/usecases/merge_groups.dart';

class GroupUseCases {
  final GetGroupsUseCase groupAll;
  final GetGroupByIdUseCase groupById;
  final MergeGroupsUseCase merge;

  GroupUseCases(this.groupAll, this.groupById, this.merge);
}
