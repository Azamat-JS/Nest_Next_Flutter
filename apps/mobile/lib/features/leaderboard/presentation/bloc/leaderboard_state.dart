part of 'leaderboard_bloc.dart';

@immutable
class LeaderboardState {
  final bool isLoading;
  final Failure? failure;

  final LeaderBoardPage? groupLeaderboard;
  final LeaderBoardPage? globalLeaderboard;

  const LeaderboardState({
    this.isLoading = false,
    this.failure,
    this.groupLeaderboard,
    this.globalLeaderboard,
  });

  LeaderboardState copyWith({
    bool? isLoading,
    Failure? failure,
    bool clearFailure = false,
    LeaderBoardPage? groupLeaderboard,
    LeaderBoardPage? globalLeaderboard,
    bool clearGroup = false,
    bool clearGlobal = false,
  }) {
    return LeaderboardState(
      isLoading: isLoading ?? this.isLoading,
      failure: clearFailure ? null : failure ?? this.failure,
      groupLeaderboard: clearGroup
          ? null
          : (groupLeaderboard ?? this.groupLeaderboard),
      globalLeaderboard: clearGlobal
          ? null
          : (globalLeaderboard ?? this.globalLeaderboard),
    );
  }
}
