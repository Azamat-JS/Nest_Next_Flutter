import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/core/utils/show_snackbar.dart';
import 'package:mobile/features/groups/presentation/bloc/group/group_bloc.dart';
import 'package:mobile/features/groups/presentation/bloc/recent_group/bloc/recent_group_bloc.dart';

class MyGroupsPage extends StatefulWidget {
  const MyGroupsPage({super.key});

  @override
  State<MyGroupsPage> createState() => _MyGroupsPageState();
}

class _MyGroupsPageState extends State<MyGroupsPage> {
  final TextEditingController controller = TextEditingController();

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => serviceLocator<RecentGroupBloc>()..add(LoadRecentGroups()),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Search Groups'),
          leading: Builder(
            builder: (context) {
              final isRootTab = GoRouterState.of(
                context,
              ).uri.path.startsWith('/groups');

              if (isRootTab) {
                return IconButton(
                  icon: const Icon(Icons.menu),
                  onPressed: () {
                    Scaffold.of(context).openDrawer();
                  },
                );
              }
              return const BackButton();
            },
          ),
        ),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              vertical: 8.0,
              horizontal: 12.0,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildHeader(context, controller),
                SizedBox(height: 20),
                _buildBody(context),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

Widget _buildHeader(BuildContext context, TextEditingController controller) {
  return Container(
    alignment: Alignment.center,
    decoration: BoxDecoration(
      color: Colors.blue,
      borderRadius: BorderRadius.circular(10),
    ),
    child: Column(
      children: [
        Row(
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                decoration: InputDecoration(
                  hintText: 'Search your groups...',
                  border: InputBorder.none,
                  suffixIcon: BlocBuilder<GroupBloc, GroupState>(
                    builder: (context, state) {
                      return IconButton(
                        icon: state.isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                ),
                              )
                            : const Icon(Icons.search, size: 28),
                        onPressed: state.isLoading
                            ? null
                            : () {
                                final bloc = context.read<GroupBloc>();

                                if (bloc.isClosed) return;

                                final id = controller.text.trim();
                                if (id.isEmpty) return;

                                bloc.add(FetchGroupById(id));
                              },
                      );
                    },
                  ),
                  focusColor: Colors.lightBlue,
                  hintStyle: const TextStyle(color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ],
    ),
  );
}

Widget _buildBody(BuildContext context) {
  return BlocConsumer<GroupBloc, GroupState>(
    listener: (context, state) {
      if (state.failure != null) {
        showSnackbar(context, state.failure!.message);
      }
      if (state.selectedGroup != null) {
        context.read<RecentGroupBloc>().add(LoadRecentGroups());
      }
    },

    builder: (context, state) {
      return SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (state.isLoading)
              const Center(child: CircularProgressIndicator())
            else if (state.selectedGroup != null)
              _buildSelectedGroup(context, state),

            const SizedBox(height: 20),

            /// 🕒 RECENT GROUPS (always visible)
            _buildRecentGroups(),
          ],
        ),
      );
    },
  );
}

Widget _buildSelectedGroup(BuildContext context, GroupState state) {
  final group = state.selectedGroup!;
  return GestureDetector(
    onTap: () {
      context.push('/groups/${group.id}');
    },
    child: Card.outlined(
      margin: const EdgeInsets.symmetric(horizontal: 12),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 60, vertical: 15),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              group.name,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.blue,
              ),
            ),
            SizedBox(height: 10),
            Text(
              "Teacher: ${group.teacher?.username ?? 'Unknown'}",
              style: TextStyle(fontSize: 16),
            ),
          ],
        ),
      ),
    ),
  );
}

Widget _buildRecentGroups() {
  return BlocBuilder<RecentGroupBloc, RecentGroupState>(
    builder: (context, state) {
      if (state.isLoading) {
        return const Center(child: CircularProgressIndicator());
      }
      if (state.groups.isEmpty) {
        return const Center(child: Text('No recent groups'));
      }

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Recent Groups',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),

          ...state.groups.map((group) {
            return ListTile(
              title: Text(group.name),
              subtitle: Text(
                "Teacher: ${group.teacher?.username ?? 'Unknown'}",
              ),
              onTap: () {
                context.push('/groups/${group.id}');
              },
            );
          }),
        ],
      );
    },
  );
}
