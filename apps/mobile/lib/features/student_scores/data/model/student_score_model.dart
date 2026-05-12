import 'package:mobile/features/student_scores/domain/entity/student_scores_entity.dart';

class StudentScoreModel extends StudentScoreEntity {
  StudentScoreModel({
    required super.id,
    required super.date,
    required super.type,
    required super.value,
    super.comment,
  });

  factory StudentScoreModel.fromJson(Map<String, dynamic> json) {
    return StudentScoreModel(
      id: json['id'] as String,
      date: json['date'] as String,
      type: json['type'] as String,
      value: (json['value'] ?? 0).toInt(),
      comment: json['comment'] as String?,
    );
  }

  static List<StudentScoreModel> fromJsonList(List<dynamic> data) {
    return data
        .map((e) => StudentScoreModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}
