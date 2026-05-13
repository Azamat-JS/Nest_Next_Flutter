import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/groups/domain/entities/student_scores_entity.dart';
import 'package:mobile/features/groups/domain/usecases/group_students_scores_usecase.dart';

part 'group_student_scores_event.dart';
part 'group_student_scores_state.dart';

class GroupStudentScoresBloc
    extends Bloc<GroupStudentScoresEvent, GroupStudentScoresState> {
  final GroupStudentScoresUsecase _useCase;
  GroupStudentScoresBloc({required GroupStudentScoresUsecase useCase})
    : _useCase = useCase,
      super(GroupStudentScoresState()) {
    on<FetchGroupStudentsScores>(_onFetchGroupStudentsScores);
  }

  void _onFetchGroupStudentsScores(
    FetchGroupStudentsScores event,
    Emitter<GroupStudentScoresState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, failure: null));

    final res = await _useCase(
      GroupStudentScoresParams(groupId: event.groupId),
    );

    res.fold(
      (failure) => emit(state.copyWith(isLoading: false, failure: failure)),
      (scores) =>
          emit(state.copyWith(isLoading: false, data: scores, failure: null)),
    );
  }
}
