import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class MyBookingsScreen extends StatefulWidget {
  final UserModel user;
  final bool hideAppBar;

  const MyBookingsScreen({super.key, required this.user, this.hideAppBar = false});

  @override
  State<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends State<MyBookingsScreen> {
  late Future<List<dynamic>> _bookingsFuture;

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  void _loadBookings() {
    setState(() {
      _bookingsFuture = ApiService.getUserBookings(widget.user.id);
    });
  }

  Future<void> _handleCancel(int bookingId) async {
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
      final result = await ApiService.cancelBooking(bookingId);
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
      appBar: AppBar(
        title: const Text('My Tokens'),
        backgroundColor: const Color(0xFFFF0088),
        foregroundColor: Colors.white,
      ),
      body: bodyContent,
    );
  }

  Widget _buildBookingCard(dynamic booking) {
    final bool isActive = booking['status'] == 'active';
    final Color statusColor = isActive ? Colors.blue : (booking['status'] == 'completed' ? Colors.green : Colors.red);

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
                  booking['unit']['name'].toString().toUpperCase(),
                  style: TextStyle(fontWeight: FontWeight.bold, color: statusColor, letterSpacing: 1),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: statusColor, borderRadius: BorderRadius.circular(50)),
                  child: Text(
                    booking['status'].toString().toUpperCase(),
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
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text('REPORTING TIME', style: TextStyle(color: Colors.grey, fontSize: 12)),
                    const SizedBox(height: 5),
                    Text(
                      '${booking['slot_time']}',
                      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          ),
          if (isActive)
            Padding(
              padding: const EdgeInsets.only(left: 20, right: 20, bottom: 20),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => _handleCancel(booking['id']),
                  icon: const Icon(Icons.cancel_outlined, size: 18),
                  label: const Text('CANCEL BOOKING'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
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
