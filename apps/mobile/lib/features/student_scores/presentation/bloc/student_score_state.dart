part of 'student_score_bloc.dart';

@immutable
class StudentScoreState {
  final bool isLoading;
  final Failure? failure;
  final List<StudentScoreEntity> studentScores;

  const StudentScoreState({
    this.isLoading = false,
    this.failure,
    this.studentScores = const [],
  });

  StudentScoreState copyWith({
    bool? isLoading,
    Failure? failure,
    List<StudentScoreEntity>? studentScores,
  }) {
    return StudentScoreState(
      isLoading: isLoading ?? this.isLoading,
      failure: failure,
      studentScores: this.studentScores,
    );
  }
}
