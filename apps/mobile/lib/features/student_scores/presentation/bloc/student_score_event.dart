part of 'student_score_bloc.dart';

@immutable
sealed class StudentScoreEvent {}

final class FetchStudentScores extends StudentScoreEvent {
  final String groupId;
  FetchStudentScores(this.groupId);
}

final class FetchOneStudentScores extends StudentScoreEvent {
  final String studentId;
  final String groupId;
  FetchOneStudentScores(this.studentId, this.groupId);
}
