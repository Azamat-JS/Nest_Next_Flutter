part of 'group_bloc.dart';

@immutable
sealed class GroupEvent {}

final class FetchGroups extends GroupEvent {
  final int page;
  final int limit;
  FetchGroups(this.page, this.limit);
}

final class FetchGroupById extends GroupEvent {
  final String id;
  FetchGroupById(this.id);
}

final class LoadMoreGroups extends GroupEvent {
  final int nextPage;
  final int limit;
  LoadMoreGroups(this.nextPage, this.limit);
}
