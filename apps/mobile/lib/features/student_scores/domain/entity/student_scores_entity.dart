class StudentScoreEntity {
  final String id;
  final String date;
  final String type;
  final int value;
  final String? comment;

  StudentScoreEntity({
    required this.id,
    required this.date,
    required this.type,
    required this.value,
    this.comment,
  });
}
