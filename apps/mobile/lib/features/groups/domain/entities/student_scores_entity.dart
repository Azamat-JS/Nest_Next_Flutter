class StudentScoresEntity {
  final double avg;
  final double avgHomework;
  final double avgAttendance;
  final List<StudentScoresEntity> students;

  StudentScoresEntity({
    required this.avg,
    required this.avgHomework,
    required this.avgAttendance,
    required this.students,
  });
}
