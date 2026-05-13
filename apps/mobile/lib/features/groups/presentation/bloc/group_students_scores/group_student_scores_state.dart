part of 'group_student_scores_bloc.dart';

@immutable
class GroupStudentScoresState {
  final bool isLoading;
  final Failure? failure;
  final GroupStudentScoresEntity? data;

  const GroupStudentScoresState({
    this.isLoading = false,
    this.failure,
    this.data,
  });

  GroupStudentScoresState copyWith({
    bool? isLoading,
    Failure? failure,
    GroupStudentScoresEntity? data,
  }) {
    return GroupStudentScoresState(
      isLoading: isLoading ?? this.isLoading,
      failure: failure,
      data: data ?? this.data,
    );
  }
}
