import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter/material.dart';
import 'package:mobile/core/errors/failures.dart';
import 'package:mobile/features/student_scores/domain/entity/student_scores_entity.dart';
import 'package:mobile/features/student_scores/domain/usecases/get_today_student_score_usecase.dart';
part 'student_score_event.dart';
part 'student_score_state.dart';

class StudentScoreBloc extends Bloc<StudentScoreEvent, StudentScoreState> {
  final GetTodayStudentScoresUsecase _useCases;
  StudentScoreBloc(this._useCases) : super(StudentScoreState()) {
    on<FetchStudentScores>(_onFetchStudentScores);
  }

  void _onFetchStudentScores(
    FetchStudentScores event,
    Emitter<StudentScoreState> emit,
  ) async {
    emit(state.copyWith(isLoading: true, clearFailure: true));
    final res = await _useCases(
      GetTodayStudentScoreParams(groupId: event.groupId),
    );
    res.fold(
      (failure) => emit(state.copyWith(isLoading: false, failure: failure)),
      (studentScores) => emit(
        state.copyWith(
          isLoading: false,
          studentScores: studentScores,
          clearFailure: true,
        ),
      ),
    );
  }
}
