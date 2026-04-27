part of 'recent_group_bloc.dart';

@immutable
class RecentGroupState {
  final bool isLoading;
  final Failure? failure;
  final List<GroupEntity>? groups;

  const RecentGroupState({this.isLoading = false, this.failure, this.groups});

  RecentGroupState copyWith({
    bool? isLoading,
    Failure? failure,
    bool clearFailure = false,
    List<GroupEntity>? groups,
    bool clearGroups = false,
  }) {
    return RecentGroupState(
      isLoading: isLoading ?? this.isLoading,
      failure: clearFailure ? null : (failure ?? this.failure),
      groups: clearGroups ? null : (groups ?? this.groups),
    );
  }
}
