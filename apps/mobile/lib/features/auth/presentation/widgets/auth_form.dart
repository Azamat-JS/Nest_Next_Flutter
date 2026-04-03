import 'package:flutter/material.dart';

class AuthForm extends StatefulWidget {
  final String hintText;
  final bool isObscure;
  final TextEditingController controller;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;
  const AuthForm({
    super.key,
    required this.hintText,
    this.isObscure = false,
    required this.controller,
    this.validator,
    this.keyboardType,
  });

  @override
  State<AuthForm> createState() => _AuthFormState();
}

class _AuthFormState extends State<AuthForm> {
  late bool _isOscureText;

  @override
  void initState() {
    super.initState();
    _isOscureText = widget.isObscure;
  }

  void _toggleObscureText() {
    setState(() {
      _isOscureText = !_isOscureText;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isPasswordField = widget.isObscure;
    return TextFormField(
      decoration: InputDecoration(
        hintText: widget.hintText,
        suffixIcon: isPasswordField
            ? IconButton(
                onPressed: _toggleObscureText,
                icon: Icon(
                  _isOscureText ? Icons.visibility_off : Icons.visibility,
                ),
              )
            : null,
      ),
      obscureText: _isOscureText,
      controller: widget.controller,
      keyboardType: widget.keyboardType,
      validator:
          widget.validator ??
          (value) {
            if (value!.isEmpty) {
              return '${widget.hintText} cannot be empty';
            }
            return null;
          },
    );
  }
}
