import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/utils/show_snackbar.dart';
import 'package:mobile/features/groups/presentation/bloc/group_bloc.dart';

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
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.search, size: 28),
                    onPressed: () {
                      context.read<GroupBloc>().add(
                        FetchGroupById(controller.text),
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
        context.read<GroupBloc>().add(GroupFailure());
      }
    },
    builder: (context, state) {
      return Container(
        alignment: Alignment.center,
        child: Column(children: [Text(state.selectedGroup?.name ?? '')]),
      );
    },
  );
}

Widget _buildFooter(BuildContext context) {
  return Container();
}
