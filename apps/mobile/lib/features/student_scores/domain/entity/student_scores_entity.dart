class StudentScoresEntity {
  final String studentId;
  final String username;
  final int homework;
  final int attendance;
  final int total;

  StudentScoresEntity({
    required this.studentId,
    required this.username,
    required this.homework,
    required this.attendance,
    required this.total,
  });
}
