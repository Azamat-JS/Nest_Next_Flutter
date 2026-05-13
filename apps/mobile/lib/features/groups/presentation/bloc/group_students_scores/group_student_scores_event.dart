part of 'group_student_scores_bloc.dart';

@immutable
abstract class GroupStudentScoresEvent {}

class FetchGroupStudentsScores extends GroupStudentScoresEvent {
  final String groupId;

  FetchGroupStudentsScores({required this.groupId});
}
