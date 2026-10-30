import 'dart:async';
import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../widgets/banner_ad_widget.dart';


class MyBookingsScreen extends StatefulWidget {
  final UserModel user;
  final bool hideAppBar;

  const MyBookingsScreen({super.key, required this.user, this.hideAppBar = false});

  @override
  State<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends State<MyBookingsScreen> {
  late Future<List<dynamic>> _bookingsFuture;
  Timer? _countdownTimer;

  @override
  void initState() {
    super.initState();
    _loadBookings();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) {
        setState(() {});
      }
    });
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  void _loadBookings() {
    setState(() {
      _bookingsFuture = ApiService.getUserBookings(widget.user.id);
    });
  }

  /// Returns true if the token is a history token (past date or completed/cancelled)
  bool _isHistoryBooking(dynamic booking) {
    if (booking is! Map) return true;
    final status = (booking['status'] as String? ?? '').toLowerCase();
    if (status == 'completed' || status == 'cancelled') {
      return true;
    }

    final rawDate = booking['booking_date'] as String? ?? '';
    if (rawDate.isNotEmpty) {
      try {
        final dateStr = rawDate.length >= 10 ? rawDate.substring(0, 10) : rawDate;
        final bDate = DateTime.parse(dateStr);
        final now = DateTime.now();
        final today = DateTime(now.year, now.month, now.day);
        final bookingDay = DateTime(bDate.year, bDate.month, bDate.day);
        if (bookingDay.isBefore(today)) {
          return true;
        }
      } catch (_) {}
    }

    return false;
  }

  /// Returns true if within 1 hour of the token's booking creation time (created_at)
  bool _isWithinOneHour(dynamic booking) {
    if (booking is! Map) return false;
    final createdAtStr = booking['created_at'] as String?;
    if (createdAtStr == null || createdAtStr.isEmpty) return false;

    try {
      final dt = DateTime.parse(createdAtStr);
      final createdAt = dt.isUtc ? dt.toLocal() : dt;
      final expireAt = createdAt.add(const Duration(hours: 1));
      return DateTime.now().isBefore(expireAt);
    } catch (_) {
      return false;
    }
  }

  /// Token cancellation is allowed ONLY when:
  /// 1. Not a history token
  /// 2. Status is active or pending
  /// 3. Within 1 hour of booking creation time (created_at)
  bool _canCancelBooking(dynamic booking) {
    if (_isHistoryBooking(booking)) return false;
    final status = (booking is Map ? booking['status'] as String? ?? '' : '').toLowerCase();
    if (status != 'active' && status != 'pending') return false;
    return _isWithinOneHour(booking);
  }

  Future<void> _handleCancel(dynamic booking) async {
    final bookingId = booking is Map ? booking['id'] : booking;
    if (bookingId == null) return;

    if (booking is Map && _isHistoryBooking(booking)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('History tokens cannot be cancelled.'), backgroundColor: Colors.red),
      );
      return;
    }

    if (booking is Map && !_canCancelBooking(booking)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cancellation window has expired. Tokens can only be cancelled within 1 hour of booking.'), backgroundColor: Colors.red),
      );
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Booking?'),
        content: const Text('Are you sure you want to cancel this token?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('NO')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('YES, CANCEL', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final result = await ApiService.cancelBooking(bookingId as int);
      if (result['status'] == true) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Booking cancelled successfully'), backgroundColor: Colors.green),
        );
        _loadBookings();
      } else {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'] ?? 'Cancellation failed'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget bodyContent = FutureBuilder<List<dynamic>>(
      future: _bookingsFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: Color(0xFFFF0088)));
        } else if (snapshot.hasError || !snapshot.hasData || snapshot.data!.isEmpty) {
          return _buildEmptyState();
        }

        final bookings = snapshot.data!;

        return ListView.builder(
          padding: const EdgeInsets.all(15),
          itemCount: bookings.length,
          itemBuilder: (context, index) {
            final booking = bookings[index];
            return _buildBookingCard(booking);
          },
        );
      },
    );

    if (widget.hideAppBar) {
      return Container(
        color: Colors.grey[100],
        child: bodyContent,
      );
    }

    return Scaffold(
      backgroundColor: Colors.grey[100],
      bottomNavigationBar: const BannerAdWidget(),
      appBar: AppBar(

        title: const Text('My Tokens'),
        backgroundColor: const Color(0xFFFF0088),
        foregroundColor: Colors.white,
      ),
      body: bodyContent,
    );
  }

  Widget _buildBookingCard(dynamic booking) {
    final bool isHistory = _isHistoryBooking(booking);
    final bool canCancel = _canCancelBooking(booking);
    final bool isActive = booking['status'] == 'active' && !isHistory;
    final bool isPending = booking['status'] == 'pending' && !isHistory;
    final Color statusColor = isActive ? Colors.blue : (isPending ? Colors.orange : (booking['status'] == 'completed' ? Colors.green : Colors.red));

    return Card(
      elevation: 3,
      margin: const EdgeInsets.only(bottom: 20),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 15),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.1),
              borderRadius: const BorderRadius.only(topLeft: Radius.circular(20), topRight: Radius.circular(20)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  (booking['unit']?['name'] ?? 'UNIT').toString().toUpperCase(),
                  style: TextStyle(fontWeight: FontWeight.bold, color: statusColor, letterSpacing: 1),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: statusColor, borderRadius: BorderRadius.circular(50)),
                  child: Text(
                    (booking['status'] ?? 'UNKNOWN').toString().toUpperCase(),
                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('TOKEN NO', style: TextStyle(color: Colors.grey, fontSize: 12)),
                    Text(
                      '${booking['token_number']}',
                      style: const TextStyle(fontSize: 45, fontWeight: FontWeight.w900, color: Color(0xFFFF0088)),
                    ),
                  ],
                ),
                const Spacer(),
                Builder(
                  builder: (context) {
                    final rawSlotTime = booking['slot_time'];
                    final slotTime = (rawSlotTime != null &&
                            rawSlotTime.toString().trim().isNotEmpty &&
                            rawSlotTime.toString().toLowerCase() != 'null' &&
                            rawSlotTime.toString().toUpperCase() != 'N/A')
                        ? rawSlotTime.toString()
                        : 'Report before 12pm';
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text('REPORTING TIME', style: TextStyle(color: Colors.grey, fontSize: 12)),
                        const SizedBox(height: 5),
                        Text(
                          slotTime,
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                      ],
                    );
                  },
                ),
              ],
            ),
          ),
          // Cancel button: Only shown if NOT a history token (never for past tokens)
          if (!isHistory && (isActive || isPending))
            Padding(
              padding: const EdgeInsets.only(left: 20, right: 20, bottom: 20),
              child: SizedBox(
                width: double.infinity,
                child: canCancel
                    ? OutlinedButton.icon(
                        onPressed: () => _handleCancel(booking),
                        icon: const Icon(Icons.cancel_outlined, size: 18),
                        label: const Text('CANCEL BOOKING'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.red,
                          side: const BorderSide(color: Colors.red),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      )
                    : OutlinedButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('Cancellation window expired (allowed within 1 hour of booking).'),
                              backgroundColor: Colors.black87,
                            ),
                          );
                        },
                        icon: Icon(Icons.cancel_outlined, size: 18, color: Colors.grey.shade400),
                        label: Text('CANCEL WINDOW CLOSED', style: TextStyle(color: Colors.grey.shade500, fontWeight: FontWeight.w600)),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.grey.shade500,
                          side: BorderSide(color: Colors.grey.shade300),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.calendar_today_outlined, size: 80, color: Colors.grey[300]),
          const SizedBox(height: 20),
          const Text('No bookings found', style: TextStyle(fontSize: 18, color: Colors.grey, fontWeight: FontWeight.w500)),
          const SizedBox(height: 30),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFFF0088), foregroundColor: Colors.white),
            child: const Text('BOOK NOW'),
          )
        ],
      ),
    );
  }
}
