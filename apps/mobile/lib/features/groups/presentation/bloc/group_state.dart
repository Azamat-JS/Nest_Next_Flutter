part of 'group_bloc.dart';

@immutable
class GroupState {
  final bool isLoading;
  final Failure? failure;
  final PaginatedGroupsEntity? groups;
  final GroupEntity? selectedGroup;
  final GroupStudentsEntity? students;

  const GroupState({
    this.isLoading = false,
    this.failure,
    this.groups,
    this.selectedGroup,
    this.students,
  });

  GroupState copyWith({
    bool? isLoading,
    Failure? failure,
    bool clearFailure = false,
    PaginatedGroupsEntity? groups,
    GroupStudentsEntity? students,
    bool clearGroups = false,
    GroupEntity? selectedGroup,
    bool clearSelectedGroup = false,
    bool clearStudents = false,
  }) {
    return GroupState(
      isLoading: isLoading ?? this.isLoading,
      failure: clearFailure ? null : (failure ?? this.failure),
      groups: clearGroups ? null : (groups ?? this.groups),
      students: clearStudents ? null : (students ?? this.students),
      selectedGroup: clearSelectedGroup
          ? null
          : (selectedGroup ?? this.selectedGroup),
    );
  }
}
