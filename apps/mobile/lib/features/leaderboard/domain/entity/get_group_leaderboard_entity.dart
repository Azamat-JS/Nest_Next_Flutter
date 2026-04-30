class LeaderboardEntity {
  final String username;
  final String? groupName;
  final int homework;
  final int attendance;
  final int total;

  const LeaderboardEntity({
    required this.username,
    this.groupName,
    required this.homework,
    required this.attendance,
    required this.total,
  });
}

class LeaderBoardPage {
  final List<LeaderboardEntity> data;
  final int page;
  final int lastPage;
  final int limit;

  const LeaderBoardPage({
    required this.data,
    required this.page,
    required this.lastPage,
    required this.limit,
  });
}
