import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/leaderboard/domain/entity/leaderboard_entity.dart';
import 'package:mobile/features/leaderboard/domain/usecases/get_global_leaderboard.dart';
import 'package:mobile/features/leaderboard/domain/usecases/get_group_leaderboard.dart';

part 'leaderboard_event.dart';
part 'leaderboard_state.dart';

class LeaderboardBloc extends Bloc<LeaderboardEvent, LeaderboardState> {
  final GetGlobalLeaderBoardUsecase _getGlobal;
  final GetGroupLeaderBoardUsecase _getGroup;

  LeaderboardBloc({
    required GetGlobalLeaderBoardUsecase getGlobal,
    required GetGroupLeaderBoardUsecase getGroup,
  }) : _getGlobal = getGlobal,
       _getGroup = getGroup,
       super(const LeaderboardState()) {
    on<FetchGlobalLeaderboardEvent>(_onFetchGlobal);
    on<FetchGroupLeaderboardEvent>(_onFetchGroup);
    on<LoadMoreGlobalLeaderboardEvent>(_onLoadMoreGlobal);
    on<LoadMoreGroupLeaderboardEvent>(_onLoadMoreGroup);
  }

  /// 🔹 INITIAL GLOBAL FETCH
  void _onFetchGlobal(
    FetchGlobalLeaderboardEvent event,
    Emitter<LeaderboardState> emit,
  ) async {
    emit(
      state.copyWith(isLoading: true, clearFailure: true, clearGlobal: true),
    );

    final res = await _getGlobal(
      GlobalLeaderBoardParams(page: event.page, limit: event.limit),
    );

    res.fold(
      (fail) => emit(state.copyWith(isLoading: false, failure: fail)),
      (page) => emit(state.copyWith(isLoading: false, globalLeaderboard: page)),
    );
  }

  /// 🔹 INITIAL GROUP FETCH
  void _onFetchGroup(
    FetchGroupLeaderboardEvent event,
    Emitter<LeaderboardState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, clearFailure: true, clearGroup: true));

    final res = await _getGroup(
      GroupLeaderBoardParams(
        groupId: event.groupId,
        page: event.page,
        limit: event.limit,
      ),
    );

    res.fold(
      (fail) => emit(state.copyWith(isLoading: false, failure: fail)),
      (page) => emit(state.copyWith(isLoading: false, groupLeaderboard: page)),
    );
  }

  /// 🔹 LOAD MORE GLOBAL
  void _onLoadMoreGlobal(
    LoadMoreGlobalLeaderboardEvent event,
    Emitter<LeaderboardState> emit,
  ) async {
    if (state.isLoading) return;

    final current = state.globalLeaderboard;
    if (current != null && current.page >= current.lastPage) return;

    emit(state.copyWith(isLoading: true, clearFailure: true));

    final res = await _getGlobal(
      GlobalLeaderBoardParams(page: event.nextPage, limit: event.limit),
    );

    res.fold((fail) => emit(state.copyWith(isLoading: false, failure: fail)), (
      newPage,
    ) {
      final old = state.globalLeaderboard;

      if (old == null) {
        emit(state.copyWith(isLoading: false, globalLeaderboard: newPage));
        return;
      }

      final merged = _merge(old, newPage);

      emit(state.copyWith(isLoading: false, globalLeaderboard: merged));
    });
  }

  /// 🔹 LOAD MORE GROUP
  void _onLoadMoreGroup(
    LoadMoreGroupLeaderboardEvent event,
    Emitter<LeaderboardState> emit,
  ) async {
    if (state.isLoading) return;

    final current = state.groupLeaderboard;
    if (current != null && current.page >= current.lastPage) return;

    emit(state.copyWith(isLoading: true, clearFailure: true));

    final res = await _getGroup(
      GroupLeaderBoardParams(
        groupId: event.groupId,
        page: event.nextPage,
        limit: event.limit,
      ),
    );

    res.fold((fail) => emit(state.copyWith(isLoading: false, failure: fail)), (
      newPage,
    ) {
      final old = state.groupLeaderboard;

      if (old == null) {
        emit(state.copyWith(isLoading: false, groupLeaderboard: newPage));
        return;
      }

      final merged = _merge(old, newPage);

      emit(state.copyWith(isLoading: false, groupLeaderboard: merged));
    });
  }

  /// 🔥 SAME IDEA AS YOUR GROUP MERGE
  LeaderBoardPage _merge(LeaderBoardPage old, LeaderBoardPage next) {
    return LeaderBoardPage(
      data: [...old.data, ...next.data],
      page: next.page,
      lastPage: next.lastPage,
      limit: next.limit,
    );
  }
}
