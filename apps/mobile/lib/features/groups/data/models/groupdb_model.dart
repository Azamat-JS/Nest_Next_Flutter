class GroupdbModel {
  final String id;
  final String name;
  final String teacherId;
  final DateTime createdAt;

  GroupdbModel.fromJson(Map<String, dynamic> json)
    : id = json['id'],
      name = json['name'],
      teacherId = json['teacher_id'],
      createdAt = DateTime.parse(json['created_at']);

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'teacher_id': teacherId,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
