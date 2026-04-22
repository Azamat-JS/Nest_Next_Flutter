class StudentScoresEntity {
  final String id;
  final String studentId;
  final String groupId;
  final int score;
  final DateTime createdAt;
  final DateTime updatedAt;

  StudentScoresEntity({
    required this.id,
    required this.studentId,
    required this.groupId,
    required this.score,
    required this.createdAt,
    required this.updatedAt,
  });
}
