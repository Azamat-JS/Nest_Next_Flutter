part of 'group_bloc.dart';

@immutable
class GroupState {
  final bool isLoading;
  final Failure? failure;
  final PaginatedGroupsEntity? groups;
  final GroupEntity? selectedGroup;

  const GroupState({
    this.isLoading = false,
    this.failure,
    this.groups,
    this.selectedGroup,
  });

  GroupState copyWith({
    bool? isLoading,
    Failure? failure,
    bool clearFailure = false,
    PaginatedGroupsEntity? groups,
    bool clearGroups = false,
    GroupEntity? selectedGroup,
    bool clearSelectedGroup = false,
  }) {
    return GroupState(
      isLoading: isLoading ?? this.isLoading,
      failure: clearFailure ? null : (failure ?? this.failure),
      groups: clearGroups ? null : (groups ?? this.groups),
      selectedGroup: clearSelectedGroup
          ? null
          : (selectedGroup ?? this.selectedGroup),
    );
  }
}
