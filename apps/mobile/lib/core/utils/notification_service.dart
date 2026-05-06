import 'package:firebase_messaging/firebase_messaging.dart';

class NotificationService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  Future<void> init() async {
    await _messaging.requestPermission();

    String? token = await _messaging.getToken();
    print("FCM Token: $token");

    await sendTokenToBackend(token);

    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Notification received: ${message.notification?.title}');
    });
  }

  Future<void> sendTokenToBackend(String? token) async {
    /// API call to send token to backend
  }
}
