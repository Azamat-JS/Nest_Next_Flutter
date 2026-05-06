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

    FirebaseMessaging.onMessageOpenedApp.listen((message) {
      print('notification opened');
      handleNavigationMessage(message);
    });
  }

  Future<void> sendTokenToBackend(String? token) async {
    /// API call to send token to backend
  }

  Future<void> handleNavigationMessage(RemoteMessage message) async {
    /// Handle navigation message here
  }
}
