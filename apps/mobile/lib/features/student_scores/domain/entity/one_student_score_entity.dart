class OneStudentScoreEntity {
  final List<ScoreEvent> scores;
  final Total total;
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

class ScoreEvent {
  final String date;
  final int homework;
  final int attendance;

  ScoreEvent(this.date, this.homework, this.attendance);
}

class Total {
  final int total;

  Total(this.total);
}
