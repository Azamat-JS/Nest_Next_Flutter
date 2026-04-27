import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/groups/domain/entities/group_entity.dart';
import 'package:mobile/features/groups/domain/usecases/get_recent_group_usecase.dart';
part 'recent_group_event.dart';
part 'recent_group_state.dart';

class RecentGroupBloc extends Bloc<RecentGroupEvent, RecentGroupState> {
  final GetRecentGroupsUseCase useCase;

  RecentGroupBloc(this.useCase) : super(const RecentGroupState()) {
    on<LoadRecentGroups>(_onLoad);
  }

  Future<void> _onLoad(
    LoadRecentGroups event,
    Emitter<RecentGroupState> emit,
  ) async {
    emit(
      state.copyWith(isLoading: true, clearFailure: true, clearGroups: true),
    );

    final res = await useCase(NoParams());

    res.fold(
      (failure) {
        emit(state.copyWith(isLoading: false, failure: failure));
      },
      (groups) {
        emit(state.copyWith(isLoading: false, groups: groups));
      },
    );
  }
}
