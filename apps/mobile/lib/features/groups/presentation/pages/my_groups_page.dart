import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/utils/show_snackbar.dart';
import 'package:mobile/features/groups/presentation/bloc/group_bloc.dart';
import 'package:mobile/features/groups/presentation/pages/group_details_page.dart';

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
    return Scaffold(
      appBar: AppBar(title: const Text('Group page')),
      body: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildHeader(context, controller),
            SizedBox(height: 20),
            _buildBody(context),
          ],
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
                                final id = controller.text.trim();
                                if (id.isEmpty) return;
                                context.read<GroupBloc>().add(
                                  FetchGroupById(id),
                                );
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
    },
    builder: (context, state) {
      if (state.isLoading) {
        return const Center(child: CircularProgressIndicator());
      }
      if (state.failure != null) {
        return Center(child: Text('Error occurred'));
      }
      if (state.selectedGroup != null) {
        return Center(
          child: Column(
            children: [
              SizedBox(height: 30),
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => GroupDetailsPage(
                        students: state.selectedGroup!.students,
                        teacher: state.selectedGroup!.teacher,
                      ),
                    ),
                  );
                },
                child: Card.outlined(
                  margin: const EdgeInsets.symmetric(horizontal: 12),
                  elevation: 3,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),

                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 60,
                      vertical: 15,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          state.selectedGroup?.name ?? '',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),
                        SizedBox(height: 10),
                        Text(
                          "Teacher: ${state.selectedGroup?.teacher.username}",
                          style: TextStyle(fontSize: 16),
                        ),
                        SizedBox(height: 10),
                        Text(
                          "Students: ${state.selectedGroup?.students.length ?? 0}",
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      }
      return const Center(child: Text('No group found'));
    },
  );
}

Widget _buildFooter(BuildContext context) {
  return Container();
}
