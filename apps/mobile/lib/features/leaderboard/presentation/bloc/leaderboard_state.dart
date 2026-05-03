part of 'leaderboard_bloc.dart';

@immutable
class LeaderboardState {
  final bool isLoadingGlobal;
  final bool isLoadingGroup;
  final Failure? failure;

  final LeaderBoardPage? groupLeaderboard;
  final LeaderBoardPage? globalLeaderboard;

  const LeaderboardState({
    this.isLoadingGlobal = false,
    this.isLoadingGroup = false,
    this.failure,
    this.groupLeaderboard,
    this.globalLeaderboard,
  });

  LeaderboardState copyWith({
    bool? isLoadingGlobal,
    bool? isLoadingGroup,
    Failure? failure,
    bool clearFailure = false,
    LeaderBoardPage? groupLeaderboard,
    LeaderBoardPage? globalLeaderboard,
    bool clearGroup = false,
    bool clearGlobal = false,
  }) {
    return LeaderboardState(
      isLoadingGlobal: isLoadingGlobal ?? this.isLoadingGlobal,
      isLoadingGroup: isLoadingGroup ?? this.isLoadingGroup,
      failure: clearFailure ? null : failure ?? this.failure,
      groupLeaderboard: clearGroup
          ? null
          : groupLeaderboard ?? this.groupLeaderboard,
      globalLeaderboard: clearGlobal
          ? null
          : globalLeaderboard ?? this.globalLeaderboard,
    );
  }
}
