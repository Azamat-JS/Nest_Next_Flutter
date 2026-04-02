import 'package:flutter/material.dart';

class AuthForm extends StatelessWidget {
  final String hintText;
  final bool isObscure;
  final TextEditingController controller;
  const AuthForm({
    super.key,
    required this.hintText,
    this.isObscure = false,
    required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      decoration: InputDecoration(hintText: hintText),
      obscureText: isObscure,
      controller: controller,
      validator: (value) {
        if (value!.isEmpty) {
          return '$hintText cannot be empty';
        }
        return null;
      },
    );
  }
}
