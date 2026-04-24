import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/student_scores/domain/entity/one_student_score_entity.dart';
import 'package:mobile/features/student_scores/domain/usecases/one_student_score_usecase.dart';

part 'one_student_score_event.dart';
part 'one_student_score_state.dart';

class OneStudentScoreBloc
    extends Bloc<OneStudentScoreEvent, OneStudentScoreState> {
  final OneStudentScoreUsecase _oneStudentUseCases;
  OneStudentScoreBloc(this._oneStudentUseCases)
    : super(OneStudentScoreState()) {
    on<FetchOneStudentScores>(_oneFetchOneStudentScores);
  }

  void _oneFetchOneStudentScores(
    FetchOneStudentScores event,
    Emitter<OneStudentScoreState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, clearFailure: true));
    final res = await _oneStudentUseCases(
      OneStudentScoreParams(studentId: event.studentId, groupId: event.groupId),
    );
    res.fold(
      (failure) => emit(state.copyWith(isLoading: false, failure: failure)),
      (scores) => emit(
        state.copyWith(
          isLoading: false,
          oneStudentScores: scores,
          clearFailure: true,
        ),
      ),
    );
  }
}
