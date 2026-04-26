import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/common/cubit/auth_check_cubit.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/features/groups/presentation/pages/my_groups_page.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/groups',
  redirect: (context, state) {
    final authState = context.read<AuthCheckCubit>().state;

    final isAuthChecking = authState is AuthChecking;
    final isLoggedIn = authState is AuthUserLoggedIn;

    if (isAuthChecking) return null;

    final loggingIn = state.matchedLocation == '/login';
    final signUp = state.matchedLocation == '/signup';

    if (!loggingIn && !signUp && !isLoggedIn) {
      return '/login';
    }

    if (signUp && isLoggedIn && loggingIn) {
      return '/groups';
    }

    if (loggingIn && isLoggedIn) {
      return '/groups';
    }
    return null;
  },
  routes: [
    /// Group List
    GoRoute(path: '/groups', builder: (context, state) => const MyGroupsPage()),

    /// GROUP DETAILS
    GoRoute(
      path: '/groups/:groupId',
      builder: (context, state) {
        final groupId = state.pathParameters['groupId'];

        return MultiBlocProvider(providers: [
          BlocProvider(create: (_) => serviceLocator<GroupStudentsBloc>())
        ],)
      },
    ),
  ],
);
