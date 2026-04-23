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
    bool clearFailure = false,
    bool clearStudentScores = false,
  }) {
    return StudentScoreState(
      isLoading: isLoading ?? this.isLoading,
      failure: clearFailure ? null : (failure ?? this.failure),
      studentScores: clearStudentScores
          ? []
          : (studentScores ?? this.studentScores),
    );
  }
}
