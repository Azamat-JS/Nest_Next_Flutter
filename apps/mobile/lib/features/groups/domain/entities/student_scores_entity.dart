import 'package:mobile/features/student_scores/domain/entity/student_scores_entity.dart';

class GroupStudentScoresEntity {
  final double avg;
  final double avgHomework;
  final double avgAttendance;
  final List<StudentScoreEntity> students;

  GroupStudentScoresEntity({
    required this.avg,
    required this.avgHomework,
    required this.avgAttendance,
    required this.students,
  });
}
