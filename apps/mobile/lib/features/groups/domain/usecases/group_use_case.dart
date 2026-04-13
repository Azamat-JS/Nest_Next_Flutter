import 'package:mobile/features/groups/domain/usecases/group_all.dart';
import 'package:mobile/features/groups/domain/usecases/group_by_id.dart';

class GroupUseCases {
  final GroupAll groupAll;
  final GroupById groupById;

  GroupUseCases(this.groupAll, this.groupById);
}
