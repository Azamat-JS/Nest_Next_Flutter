import 'package:go_router/go_router.dart';
import 'package:mobile/features/groups/presentation/pages/my_groups_page.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/groups',
  routes: [
    GoRoute(path: '/groups', builder: (context, state) => const MyGroupsPage()),
  ],
);
