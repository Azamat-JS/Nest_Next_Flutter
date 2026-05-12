class OneStudentScoreEntity {
  final List<ScoreEventEntity> scores;
  final TotalEntity total;
  final int page;
  final int limit;
  final int totalCount;
  final int lastPage;

  OneStudentScoreEntity({
    required this.scores,
    required this.total,
    required this.page,
    required this.limit,
    required this.totalCount,
    required this.lastPage,
  });
}

class ScoreEventEntity {
  final String id;
  final String date;
  final ScoreType type;
  final int value;
  final String? comment;

  ScoreEventEntity({
    required this.id,
    required this.date,
    required this.type,
    required this.value,
    this.comment,
  });
}

class TotalEntity {
  final int total;

  TotalEntity(this.total);
}

enum ScoreType { homework, attendance }
