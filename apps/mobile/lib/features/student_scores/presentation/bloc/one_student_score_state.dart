part of 'one_student_score_bloc.dart';

@immutable
class OneStudentScoreState {
  final bool isLoading;
  final Failure? failure;
  final OneStudentScoreEntity? oneStudentScores;

  const OneStudentScoreState({
    this.isLoading = false,
    this.failure,
    this.oneStudentScores,
  });

  OneStudentScoreState copyWith({
    bool? isLoading,
    Failure? failure,
    bool clearFailure = false,
    OneStudentScoreEntity? oneStudentScores,
    bool clearOneStudentScores = false,
  }) {
    return OneStudentScoreState(
      isLoading: isLoading ?? this.isLoading,
      failure: clearFailure ? null : (failure ?? this.failure),
      oneStudentScores: clearOneStudentScores
          ? null
          : (oneStudentScores ?? this.oneStudentScores),
    );
  }
}
