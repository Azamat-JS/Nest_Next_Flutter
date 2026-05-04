part of 'group_students_bloc.dart';

@immutable
class GroupStudentsState {
  final bool isLoading;
  final Failure? failure;
  final GroupStudentsPageEntity? students;

  const GroupStudentsState({
    this.isLoading = false,
    this.failure,
    this.students,
  });

  GroupStudentsState copyWith({
    bool? isLoading,
    Failure? failure,
    bool clearFailure = false,
    GroupStudentsPageEntity? students,
    bool clearStudents = false,
  }) {
    return GroupStudentsState(
      isLoading: isLoading ?? this.isLoading,
      failure: clearFailure ? null : (failure ?? this.failure),
      students: clearStudents ? null : (students ?? this.students),
    );
  }
}
