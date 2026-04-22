import 'package:mobile/features/student_scores/domain/entity/student_scores_entity.dart';

class StudentScoresModel extends StudentScoresEntity {
  StudentScoresModel({
    required super.studentId,
    required super.username,
    required super.homework,
    required super.attendance,
    required super.total,
  });

  factory StudentScoresModel.fromJson(Map<String, dynamic> json) {
    return StudentScoresModel(
      studentId: json['studentId'] as String,
      username: json['username'] as String,
      homework: json['homework'] as int,
      attendance: json['attendance'] as int,
      total: json['total'] as int,
    );
  }
}
