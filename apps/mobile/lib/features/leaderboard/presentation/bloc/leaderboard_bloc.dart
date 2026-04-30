import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'leaderboard_event.dart';
part 'leaderboard_state.dart';

class LeaderboardBloc extends Bloc<LeaderboardEvent, LeaderboardState> {
  LeaderboardBloc() : super(LeaderboardInitial()) {
    on<LeaderboardEvent>((event, emit) {});
  }
}
