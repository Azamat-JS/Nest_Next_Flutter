part of 'student_score_bloc.dart';

@immutable
sealed class StudentScoreEvent {}

final class FetchStudentScores extends StudentScoreEvent {
  final String groupId;
  FetchStudentScores(this.groupId);
}
