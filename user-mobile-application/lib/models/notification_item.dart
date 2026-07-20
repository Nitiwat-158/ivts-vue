enum NotificationType { emergency, renewal, system }

class NotificationItem {
  final NotificationType type;
  final String title;
  final String description;
  final String dateGroup;

  const NotificationItem({
    required this.type,
    required this.title,
    required this.description,
    required this.dateGroup,
  });
}
