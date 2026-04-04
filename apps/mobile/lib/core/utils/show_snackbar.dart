import 'package:flutter/material.dart';

enum TopSnackBarType { info, success, error }

/// Reusable snackbar utility with nice styling.
///
/// Keeps the same function name/signature used across the app.
void showSnackbar(
  BuildContext context,
  String message, {
  TopSnackBarType type = TopSnackBarType.info,
  String? title,
  IconData? icon,
}) {
  final accentColor = _accentFor(type);
  final resolvedIcon = icon ?? _iconFor(type);

  final snackBar = SnackBar(
    behavior: SnackBarBehavior.floating,
    margin: const EdgeInsets.only(left: 16, right: 16, top: 50),
    duration: const Duration(seconds: 2),
    backgroundColor: Colors.black,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    content: Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        if (resolvedIcon != null)
          Icon(resolvedIcon, size: 20, color: accentColor),
        if (resolvedIcon != null) const SizedBox(width: 10),
        Expanded(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              if (title != null && title.trim().isNotEmpty)
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              Text(
                message,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ],
    ),
  );

  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(snackBar);
}

Color _accentFor(TopSnackBarType type) {
  return switch (type) {
    TopSnackBarType.success => Colors.greenAccent.shade400,
    TopSnackBarType.error => Colors.redAccent.shade400,
    TopSnackBarType.info => Colors.blueAccent.shade400,
  };
}

IconData? _iconFor(TopSnackBarType type) {
  return switch (type) {
    TopSnackBarType.success => Icons.check_circle_rounded,
    TopSnackBarType.error => Icons.error_outline_rounded,
    TopSnackBarType.info => Icons.info_outline_rounded,
  };
}
