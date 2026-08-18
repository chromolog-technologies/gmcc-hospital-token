import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:async';

class DoctorQueueScreen extends StatefulWidget {
  final Map<String, dynamic> unit;

  const DoctorQueueScreen({super.key, required this.unit});

  @override
  State<DoctorQueueScreen> createState() => _DoctorQueueScreenState();
}

class _DoctorQueueScreenState extends State<DoctorQueueScreen> {
  List<dynamic> _queue = [];
  bool _isLoading = true;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _fetchQueue();
    // Auto-refresh queue every 10 seconds
    _timer = Timer.periodic(const Duration(seconds: 10), (_) => _fetchQueue(silent: true));
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetchQueue({bool silent = false}) async {
    if (!silent) setState(() => _isLoading = true);
    final result = await ApiService.getDoctorQueue(widget.unit['id']);
    if (mounted) {
      setState(() {
        _queue = result['success'] == true ? result['data'] : [];
        _isLoading = false;
      });
    }
  }

  Future<void> _handleCallNext() async {
    final result = await ApiService.callNextToken(widget.unit['id']);
    if (mounted) {
      if (result['success'] == true) {
        _fetchQueue(silent: true);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'] ?? 'Called next patient'), backgroundColor: Colors.green),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'] ?? 'Failed to call next'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _handleMarkCompleted() async {
    final result = await ApiService.markTokenCompleted(widget.unit['id']);
    if (mounted) {
      if (result['success'] == true) {
        _fetchQueue(silent: true);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Marked as completed'), backgroundColor: Colors.green),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'] ?? 'Failed to mark completed'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final activeBookings = _queue.where((b) => b['status'] == 'active').toList();
    final currentBooking = activeBookings.isNotEmpty ? activeBookings.first : null;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Text(widget.unit['name'] ?? 'Queue Management'),
        backgroundColor: const Color(0xFF007AFF),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _fetchQueue(),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                // Current Patient Card
                Container(
                  padding: const EdgeInsets.all(20),
                  margin: const EdgeInsets.all(15),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(15),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 5))
                    ],
                    border: Border.all(color: const Color(0xFF007AFF).withValues(alpha: 0.3), width: 2),
                  ),
                  child: Column(
                    children: [
                      const Text('CURRENT PATIENT', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, letterSpacing: 1)),
                      const SizedBox(height: 10),
                      if (currentBooking != null) ...[
                        Text(
                          'Token: ${currentBooking['token_number']}',
                          style: const TextStyle(fontSize: 40, fontWeight: FontWeight.bold, color: Color(0xFF007AFF)),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          currentBooking['user']?['name'] ?? 'Unknown Patient',
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
                        ),
                        Text(
                          'CRNO: ${currentBooking['user']?['crno'] ?? '-'}',
                          style: const TextStyle(color: Colors.grey),
                        ),
                      ] else ...[
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 20),
                          child: Text('No active patients in queue', style: TextStyle(fontSize: 18, color: Colors.grey)),
                        ),
                      ],
                      const SizedBox(height: 20),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          ElevatedButton.icon(
                            onPressed: _handleCallNext,
                            icon: const Icon(Icons.campaign),
                            label: const Text('Call Next'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.orange,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                            ),
                          ),
                          ElevatedButton.icon(
                            onPressed: currentBooking != null ? _handleMarkCompleted : null,
                            icon: const Icon(Icons.check_circle),
                            label: const Text('Complete'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text('Up Next', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black87)),
                  ),
                ),

                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 15),
                    itemCount: activeBookings.length > 1 ? activeBookings.length - 1 : 0,
                    itemBuilder: (context, index) {
                      final booking = activeBookings[index + 1];
                      return Card(
                        margin: const EdgeInsets.only(bottom: 10),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: const Color(0xFF007AFF).withValues(alpha: 0.1),
                            child: Text('${booking['token_number']}', style: const TextStyle(color: Color(0xFF007AFF), fontWeight: FontWeight.bold)),
                          ),
                          title: Text(booking['user']?['name'] ?? 'Unknown'),
                          subtitle: Text('CRNO: ${booking['user']?['crno'] ?? '-'}'),
                          trailing: const Text('Waiting', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.w600)),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
    );
  }
}
