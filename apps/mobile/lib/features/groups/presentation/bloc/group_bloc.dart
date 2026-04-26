import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/groups/domain/entities/group_entity.dart';
import 'package:mobile/features/groups/domain/entities/group_students_entity.dart';
import 'package:mobile/features/groups/domain/usecases/group_all.dart';
import 'package:mobile/features/groups/domain/usecases/group_by_id.dart';
import 'package:mobile/features/groups/domain/usecases/group_students_usecase.dart';
import 'package:mobile/features/groups/domain/usecases/group_use_case.dart';
part 'group_event.dart';
part 'group_state.dart';

class GroupBloc extends Bloc<GroupEvent, GroupState> {
  final GroupUseCases _useCases;
  GroupBloc(this._useCases) : super(GroupState()) {
    on<FetchGroups>(_onFetchGroups);
    on<FetchGroupById>(_onFetchGroupById);
    on<FetchGroupStudents>(_onFetchGroupStudents);
    on<LoadMoreGroups>(_onLoadMoreGroups);
  }

  void _onFetchGroups(FetchGroups event, Emitter<GroupState> emit) async {
    emit(state.copyWith(isLoading: true, clearFailure: true));
    final res = await _useCases.groupAll(
      GroupAllParams(page: event.page, limit: event.limit),
    );
    res.fold(
      (failure) => emit(state.copyWith(isLoading: false, failure: failure)),
      (groups) => emit(state.copyWith(isLoading: false, groups: groups)),
    );
  }

  void _onFetchGroupById(FetchGroupById event, Emitter<GroupState> emit) async {
    emit(
      state.copyWith(
        isLoading: true,
        clearFailure: true,
        clearSelectedGroup: true,
      ),
    );
    final res = await _useCases.groupById(GroupByIdParams(id: event.id));
    res.fold(
      (fail) {
        emit(state.copyWith(isLoading: false, failure: fail));
      },
      (group) {
        emit(state.copyWith(isLoading: false, selectedGroup: group));
      },
    );
  }

  void _onFetchGroupStudents(
    FetchGroupStudents event,
    Emitter<GroupState> emit,
  ) async {
    emit(
      state.copyWith(isLoading: true, clearFailure: true, clearStudents: true),
    );
    final res = await _useCases.groupStudents(
      GroupStudentsParams(
        groupId: event.groupId,
        page: event.page,
        limit: event.limit,
      ),
    );

    res.fold(
      (fail) {
        emit(state.copyWith(isLoading: false, failure: fail));
      },
      (students) {
        emit(state.copyWith(isLoading: false, students: students));
      },
    );
  }

  void _onLoadMoreGroups(LoadMoreGroups event, Emitter<GroupState> emit) async {
    if (state.isLoading) return;
    final groups = state.groups;
    if (groups != null && !groups.hasMore) return;
    emit(state.copyWith(isLoading: true, clearFailure: true));
    final res = await _useCases.groupAll(
      GroupAllParams(page: event.nextPage, limit: event.limit),
    );

    res.fold((fail) => emit(state.copyWith(isLoading: false, failure: fail)), (
      newGroups,
    ) {
      final old = state.groups;
      if (old == null) {
        emit(state.copyWith(isLoading: false, groups: newGroups));
        return;
      }
      final updated = _useCases.merge(old, newGroups);
      emit(state.copyWith(isLoading: false, groups: updated));
    });
  }
}
