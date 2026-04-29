import 'package:flutter/material.dart';
import 'package:mobile/core/di/service_locator.dart';
import 'package:mobile/core/utils/show_snackbar.dart';
import 'package:sqflite/sqflite.dart';

Future<void> testLocalDB(BuildContext context) async {
  final db = serviceLocator<Database>();

  await db.insert("current_user", {
    "id": "test-id",
    "username": "test-username",
    "role": "test-role",
    "token": "test-token",
    "created_at": DateTime.now().toIso8601String(),
  }, conflictAlgorithm: ConflictAlgorithm.replace);

  final res = await db.query("current_user");
  print('DB RESULT: $res');

  showSnackbar(context, res.toString());
}
