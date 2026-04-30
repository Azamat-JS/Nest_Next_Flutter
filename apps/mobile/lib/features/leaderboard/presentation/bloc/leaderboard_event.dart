part of 'leaderboard_bloc.dart';

@immutable
abstract class LeaderboardEvent {}

class FetchGlobalLeaderboardEvent extends LeaderboardEvent {
  final int page;
  final int limit;
  FetchGlobalLeaderboardEvent(this.page, this.limit);
}

class FetchGroupLeaderboardEvent extends LeaderboardEvent {
  final String groupId;
  final int page;
  final int limit;
  FetchGroupLeaderboardEvent(this.groupId, this.page, this.limit);
}

class LoadMoreGlobalLeaderboardEvent extends LeaderboardEvent {
  final int nextPage;
  final int limit;
  LoadMoreGlobalLeaderboardEvent(this.nextPage, this.limit);
}

class LoadMoreGroupLeaderboardEvent extends LeaderboardEvent {
  final String groupId;
  final int nextPage;
  final int limit;
  LoadMoreGroupLeaderboardEvent(this.groupId, this.nextPage, this.limit);
}
