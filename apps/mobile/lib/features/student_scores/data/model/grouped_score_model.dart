class GroupedScoreModel {
  final String date;
  final int homework;
  final int attendance;
  final String? homeworkComment;
  final String? attendanceComment;

  GroupedScoreModel({
    required this.date,
    required this.homework,
    required this.attendance,
    this.homeworkComment,
    this.attendanceComment,
  });
}
