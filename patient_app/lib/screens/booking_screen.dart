import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/user_model.dart';
import '../models/unit_model.dart';
import '../services/api_service.dart';

class BookingScreen extends StatefulWidget {
  final UserModel user;
  final UnitModel unit;

  const BookingScreen({super.key, required this.user, required this.unit});

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  bool _isLoading = false;
  Map<String, dynamic>? _bookingResult;
  String _selectedType = 'chemo';
  Map<String, dynamic>? _availability;
  bool _isLoadingAvailability = true;

  @override
  void initState() {
    super.initState();
    _fetchAvailability();
  }

  Future<void> _fetchAvailability() async {
    final res = await ApiService.getAvailability(widget.unit.id, '');
    if (res['success'] == true) {
      setState(() {
        _availability = res['data'];
        _isLoadingAvailability = false;
      });
    } else {
      setState(() {
        _isLoadingAvailability = false;
      });
    }
  }


  void _handleBookingClick() {
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    final tomorrowWeekday = DateFormat('EEEE').format(tomorrow); // e.g. 'Monday'

    if (widget.unit.day != null && widget.unit.day!.isNotEmpty && widget.unit.day != tomorrowWeekday) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text('Booking Unavailable', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
          content: Text(
            'This unit operates on ${widget.unit.day}.\n\nYou are trying to book for tomorrow ($tomorrowWeekday). Booking cannot be done for this day.',
            style: const TextStyle(fontSize: 16),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('OK', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFFFF0088))),
            ),
          ],
        ),
      );
      return;
    }
    _handleBooking();
  }

  Future<void> _handleBooking() async {
    setState(() => _isLoading = true);

    final result = await ApiService.createBooking(widget.user.id, widget.unit.id, _selectedType);

    setState(() {
      _isLoading = false;
      _bookingResult = result;
    });

    if (result['status'] == true) {
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) {
          Navigator.popUntil(context, (route) => route.isFirst);
        }
      });
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Booking failed'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Confirm Booking'),
        backgroundColor: const Color(0xFFFF0088),
        foregroundColor: Colors.white,
      ),
      body: _bookingResult != null && _bookingResult!['status'] == true
          ? _buildSuccessUI()
          : _buildBookingUI(),
    );
  }

  Widget _buildBookingUI() {
    return Padding(
      padding: const EdgeInsets.all(25.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Department Details',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFFFF0088).withValues(alpha: 0.05),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFFF0088).withValues(alpha: 0.2)),
            ),
            child: Column(
              children: [
                _buildInfoRow(Icons.medical_services, 'Department', widget.unit.name),
                const Divider(height: 30),
                _buildInfoRow(Icons.person, 'Consulting Doctor', widget.unit.doctorName),
                const Divider(height: 30),
                _buildInfoRow(Icons.access_time, 'Timings', widget.unit.time),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Token Type',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildTypeOption('chemo', 'Chemo'),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: _buildTypeOption('followup', 'Followup'),
              ),
            ],
          ),
          const SizedBox(height: 10),
          _isLoadingAvailability
              ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
              : _availability != null
                  ? Text(
                      '${_availability![_selectedType]['online_remaining']} online slots remaining for tomorrow',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: _availability![_selectedType]['online_remaining'] > 0 ? Colors.green : Colors.red,
                      ),
                    )
                  : const SizedBox.shrink(),
          const SizedBox(height: 30),
          const Text(
            'Booking Information',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey),
          ),
          const SizedBox(height: 10),
          Text(
            'Booking for: Tomorrow (${DateFormat('dd MMM yyyy').format(DateTime.now().add(const Duration(days: 1)))})',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.grey[800]),
          ),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            height: 60,
            child: ElevatedButton(
              onPressed: _isLoading || (_availability != null && _availability![_selectedType]['online_remaining'] == 0)
                  ? null
                  : _handleBookingClick,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFF0088),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                elevation: 5,
                disabledBackgroundColor: Colors.grey[300],
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text(
                      'BOOK TOKEN NOW',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1),
                    ),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildTypeOption(String typeValue, String label) {
    final isSelected = _selectedType == typeValue;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedType = typeValue;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 15),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFFF0088) : Colors.white,
          borderRadius: BorderRadius.circular(15),
          border: Border.all(
            color: isSelected ? const Color(0xFFFF0088) : Colors.grey.withValues(alpha: 0.3),
            width: 2,
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 16,
              color: isSelected ? Colors.white : Colors.black87,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSuccessUI() {
    final data = _bookingResult!['data'];
    return Padding(
      padding: const EdgeInsets.all(30.0),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 100),
            const SizedBox(height: 20),
            const Text(
              'Booking Successful!',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 40),
            Container(
              padding: const EdgeInsets.all(30),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(25),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withValues(alpha: 0.2),
                    spreadRadius: 5,
                    blurRadius: 15,
                  )
                ],
              ),
              child: Column(
                children: [
                  const Text('YOUR TOKEN NUMBER', style: TextStyle(color: Colors.grey, letterSpacing: 2)),
                  const SizedBox(height: 10),
                  Text(
                    '${data['token_number']}',
                    style: const TextStyle(
                      fontSize: 80,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFFFF0088),
                    ),
                  ),
                const Divider(height: 40),
                const Text('REPORTING TIME', style: TextStyle(color: Colors.grey, letterSpacing: 2)),
                const SizedBox(height: 10),
                Text(
                  '${data['slot_time']}',
                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          const SizedBox(height: 50),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Back to Home', style: TextStyle(color: Color(0xFFFF0088), fontSize: 18)),
          )
        ],
      ),
     ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, color: const Color(0xFFFF0088), size: 24),
        const SizedBox(width: 15),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
            Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        )
      ],
    );
  }
}
