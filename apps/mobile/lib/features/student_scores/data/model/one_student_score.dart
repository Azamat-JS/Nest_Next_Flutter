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
          .map((e) => ScoreEventModel.fromJson(e))
          .toList(),
      total: TotalModel.fromJson(json['total']),
      page: json['page'],
      limit: json['limit'],
      totalCount: json['total_count'],
      lastPage: json['last_page'],
    );
  }
}

class ScoreEventModel extends ScoreEventEntity {
  ScoreEventModel({
    required super.id,
    required super.date,
    required super.type,
    required super.value,
    super.comment,
  });

  factory ScoreEventModel.fromJson(Map<String, dynamic> json) {
    return ScoreEventModel(
      id: json['id'] as String,
      date: json['date'] as String,
      type: json['type'] == 'HOMEWORK'
          ? ScoreType.homework
          : ScoreType.attendance,
      value: (json['value'] ?? 0).toInt(),
      comment: json['comment'] as String?,
    );
  }
}

class TotalModel extends TotalEntity {
  TotalModel({required int total}) : super(total);

  factory TotalModel.fromJson(Map<String, dynamic> json) {
    return TotalModel(total: (json['total'] ?? 0).toInt());
  }
}
