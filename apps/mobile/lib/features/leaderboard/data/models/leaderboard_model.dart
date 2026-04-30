import 'package:mobile/features/leaderboard/domain/entity/leaderboard_entity.dart';

class LeaderboardModel extends LeaderboardEntity {
  const LeaderboardModel({
    required super.username,
    super.groupName,
    required super.homework,
    required super.attendance,
    required super.total,
  });

  factory LeaderboardModel.fromJson(Map<String, dynamic> json) {
    return LeaderboardModel(
      username: json['student']?['username'] ?? '',
      groupName: json['group']?['name'] as String?,
      homework: json['homework'] ?? 0,
      attendance: json['attendance'] ?? 0,
      total: json['total'] ?? 0,
    );
  }

  LeaderboardEntity toEntity() {
    return LeaderboardEntity(
      username: username,
      groupName: groupName,
      homework: homework,
      attendance: attendance,
      total: total,
    );
  }
}
