import 'package:mobile/features/student_scores/domain/entity/student_scores_entity.dart';

class StudentScoreModel extends StudentScoreEntity {
  StudentScoreModel({
    required super.studentId,
    required super.username,
    required super.homework,
    required super.attendance,
    required super.total,
  });

  factory StudentScoreModel.fromJson(Map<String, dynamic> json) {
    return StudentScoreModel(
      studentId: json['studentId'] as String,
      username: json['username'] as String,
      homework: (json['homework'] ?? 0).toInt(),
      attendance: (json['attendance'] ?? 0).toInt(),
      total: (json['total'] ?? 0).toInt(),
    );
  }
  static List<StudentScoreModel> fromJsonList(List<dynamic> data) {
    return data
        .map((e) => StudentScoreModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
