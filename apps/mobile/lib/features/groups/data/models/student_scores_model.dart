import 'package:mobile/features/groups/domain/entities/student_scores_entity.dart';
import 'package:mobile/features/student_scores/data/model/student_score_model.dart';

class GroupStudentScoresModel extends GroupStudentScoresEntity {
  GroupStudentScoresModel({
    required super.avg,
    required super.avgHomework,
    required super.avgAttendance,
    required super.students,
  });

  factory GroupStudentScoresModel.fromJson(Map<String, dynamic> json) {
    return GroupStudentScoresModel(
      avg: (json['avg'] as num).toDouble(),
      avgAttendance: (json['avgAttendance'] as num).toDouble(),
      avgHomework: (json['avgHomework'] as num).toDouble(),
      students: (json['students'] as List<dynamic>)
          .map(
            (student) =>
                StudentScoreModel.fromJson(student as Map<String, dynamic>),
          )
          .toList(),
    );
  }

  GroupStudentScoresEntity toEntity() {
    return GroupStudentScoresEntity(
      avg: avg,
      avgAttendance: avgAttendance,
      avgHomework: avgHomework,
      students: students,
    );
  }
}
