part of 'one_student_score_bloc.dart';

@immutable
sealed class OneStudentScoreEvent {}

final class FetchOneStudentScores extends OneStudentScoreEvent {
  final String studentId;
  final String groupId;
  FetchOneStudentScores({required this.studentId, required this.groupId});
}
