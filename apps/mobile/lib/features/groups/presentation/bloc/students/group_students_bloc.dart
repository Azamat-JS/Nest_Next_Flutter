import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/groups/domain/entities/group_students_entity.dart';
import 'package:mobile/features/groups/domain/usecases/group_students_usecase.dart';
part 'group_students_event.dart';
part 'group_students_state.dart';

class GroupStudentsBloc extends Bloc<GroupStudentsEvent, GroupStudentsState> {
  final GetGroupStudentsUsecase _groupStudentsUsecase;

  GroupStudentsBloc({required GetGroupStudentsUsecase groupStudentsUsecase})
    : _groupStudentsUsecase = groupStudentsUsecase,
      super(const GroupStudentsState()) {
    on<FetchGroupStudents>(_onFetchGroupStudents);
    on<LoadMoreGroupStudents>(_onLoadMoreGroupStudents);
  }

  void _onFetchGroupStudents(
    FetchGroupStudents event,
    Emitter<GroupStudentsState> emit,
  ) async {
    emit(
      state.copyWith(isLoading: true, clearFailure: true, clearStudents: true),
    );

    final res = await _groupStudentsUsecase(
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

  void _onLoadMoreGroupStudents(
    LoadMoreGroupStudents event,
    Emitter<GroupStudentsState> emit,
  ) async {
    if (state.isLoading) return;

    final current = state.students;
    if (current != null && current.page >= current.lastPage) return;

    final res = await _groupStudentsUsecase(
      GroupStudentsParams(
        groupId: event.groupId,
        page: event.nextPage,
        limit: event.limit,
      ),
    );

    res.fold((fail) => emit(state.copyWith(failure: fail)), (newStudents) {
      final old = state.students;

      if (old == null) {
        emit(state.copyWith(students: newStudents));
        return;
      }

      final merged = GroupStudentsEntity(
        data: [...old.data, ...newStudents.data],
        page: newStudents.page,
        total: newStudents.total,
        lastPage: newStudents.lastPage,
      );

      emit(state.copyWith(students: merged));
    });
  }
}
