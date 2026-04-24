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
  final String date;
  final int homework;
  final int attendance;

  ScoreEventEntity(this.date, this.homework, this.attendance);
}

class TotalEntity {
  final int total;

  TotalEntity(this.total);
}
