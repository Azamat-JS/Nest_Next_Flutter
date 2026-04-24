import 'package:mobile/features/student_scores/domain/entity/one_student_score_entity.dart';

class OneStudentScoreModel extends OneStudentScoreEntity {
  OneStudentScoreModel({
    required super.scores,
    required super.total,
    required super.page,
    required super.limit,
    required super.totalCount,
    required super.lastPage,
  });

  factory OneStudentScoreModel.fromJson(Map<String, dynamic> json) {
    return OneStudentScoreModel(
      scores: (json['scores'] as List<dynamic>)
          .map((e) => ScoreEventModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      total: TotalModel.fromJson(json['total'] as Map<String, dynamic>),
      page: json['page'] as int,
      limit: json['limit'] as int,
      totalCount: json['total_count'] as int,
      lastPage: json['last_page'] as int,
    );
  }
  static List<OneStudentScoreModel> fromJsonList(List<dynamic> data) {
    return data
        .map((e) => OneStudentScoreModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }
}

class ScoreEventModel extends ScoreEventEntity {
  ScoreEventModel({
    required String date,
    required int homework,
    required int attendance,
  }) : super(date, homework, attendance);

  factory ScoreEventModel.fromJson(Map<String, dynamic> json) {
    return ScoreEventModel(
      date: json['date'] as String,
      homework: (json['homework'] as num?)?.toInt() ?? 0,
      attendance: (json['attendance'] as num?)?.toInt() ?? 0,
    );
  }
}

class TotalModel extends TotalEntity {
  TotalModel({required int total}) : super(total);

  factory TotalModel.fromJson(Map<String, dynamic> json) {
    return TotalModel(total: (json['total'] ?? 0).toInt());
  }
}
