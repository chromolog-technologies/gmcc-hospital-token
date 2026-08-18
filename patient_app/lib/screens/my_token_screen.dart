import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class MyTokenScreen extends StatefulWidget {
  final UserModel user;
  final bool hideAppBar;

  const MyTokenScreen({super.key, required this.user, this.hideAppBar = false});

  @override
  State<MyTokenScreen> createState() => _MyTokenScreenState();
}

class _MyTokenScreenState extends State<MyTokenScreen>
    with SingleTickerProviderStateMixin {
  late Future<List<dynamic>> _tokenFuture;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  static const Color _primary = Color(0xFFFF0088);

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _pulseAnimation =
        Tween<double>(begin: 0.95, end: 1.05).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));
    _load();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _load() {
    setState(() {
      _tokenFuture = _fetchSortedTokens();
    });
  }

  /// Fetches all bookings and sorts them:
  ///   1. active   (today/upcoming, show first)
  ///   2. pending  (awaiting approval, show next)
  ///   3. completed
  ///   4. cancelled
  /// Within each group, newer bookings (higher id) come first.
  Future<List<dynamic>> _fetchSortedTokens() async {
    final bookings = await ApiService.getUserBookings(widget.user.id);
    const order = {'active': 0, 'pending': 1, 'completed': 2, 'cancelled': 3};
    bookings.sort((a, b) {
      final ao = order[a['status']] ?? 99;
      final bo = order[b['status']] ?? 99;
      if (ao != bo) return ao.compareTo(bo);
      // within same status: newer date first
      final dateA = a['booking_date'] as String? ?? '';
      final dateB = b['booking_date'] as String? ?? '';
      final dateCmp = dateB.compareTo(dateA);
      if (dateCmp != 0) return dateCmp;
      return (b['id'] as int).compareTo(a['id'] as int);
    });
    return bookings;
  }

  @override
  Widget build(BuildContext context) {
    final content = FutureBuilder<List<dynamic>>(
      future: _tokenFuture,
      builder: (context, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Center(
              child: CircularProgressIndicator(color: _primary));
        }
        if (snap.hasError || !snap.hasData || snap.data!.isEmpty) {
          return _buildNoToken();
        }
        return _buildList(snap.data!);
      },
    );

    if (widget.hideAppBar) {
      return Container(color: const Color(0xFFF7F8FC), child: content);
    }
    return Scaffold(
      backgroundColor: const Color(0xFFF7F8FC),
      appBar: AppBar(
        title: const Text('My Token'),
        centerTitle: true,
        backgroundColor: _primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: content,
    );
  }

  // ────────────────────────────────────────────────────────────
  //  FULL LIST VIEW
  // ────────────────────────────────────────────────────────────
  Widget _buildList(List<dynamic> bookings) {
    // Separate upcoming (active/pending) from history (completed/cancelled)
    final upcoming = bookings
        .where((b) => b['status'] == 'active' || b['status'] == 'pending')
        .toList();
    final history = bookings
        .where((b) => b['status'] != 'active' && b['status'] != 'pending')
        .toList();

    return RefreshIndicator(
      color: _primary,
      onRefresh: () async => _load(),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 20, 16, 32),
        children: [
          // ── Greeting ──
          _buildGreeting(),
          const SizedBox(height: 20),

          // ── Upcoming Tokens ──
          if (upcoming.isNotEmpty) ...[
            _sectionLabel('Upcoming / Active', Icons.access_time_rounded,
                const Color(0xFF0077FF)),
            const SizedBox(height: 12),
            // The VERY first upcoming token gets the big ticket card
            _buildHeroTicket(upcoming.first),
            if (upcoming.length > 1) ...[
              const SizedBox(height: 12),
              ...upcoming.skip(1).map((b) => _buildCompactCard(b)),
            ],
          ] else ...[
            _buildNoUpcoming(),
          ],

          // ── History ──
          if (history.isNotEmpty) ...[
            const SizedBox(height: 28),
            _sectionLabel(
                'History', Icons.history_rounded, Colors.grey.shade600),
            const SizedBox(height: 12),
            ...history.map((b) => _buildCompactCard(b)),
          ],
        ],
      ),
    );
  }

  // ────────────────────────────────────────────────────────────
  //  GREETING ROW
  // ────────────────────────────────────────────────────────────
  Widget _buildGreeting() {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Hello, ${widget.user.name.split(' ').first} 👋',
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF1A1A2E),
                ),
              ),
              const SizedBox(height: 3),
              const Text(
                'Your token history & upcoming visits',
                style: TextStyle(fontSize: 13, color: Colors.grey),
              ),
            ],
          ),
        ),
        // Refresh icon
        IconButton(
          onPressed: _load,
          icon: const Icon(Icons.refresh_rounded, color: _primary),
          tooltip: 'Refresh',
        ),
      ],
    );
  }

  // ────────────────────────────────────────────────────────────
  //  SECTION LABEL
  // ────────────────────────────────────────────────────────────
  Widget _sectionLabel(String label, IconData icon, Color color) {
    return Row(
      children: [
        Icon(icon, size: 16, color: color),
        const SizedBox(width: 6),
        Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w800,
            color: color,
            letterSpacing: 0.4,
          ),
        ),
      ],
    );
  }

  // ────────────────────────────────────────────────────────────
  //  HERO TICKET (latest / most important token)
  // ────────────────────────────────────────────────────────────
  Widget _buildHeroTicket(Map<String, dynamic> booking) {
    final status = (booking['status'] as String? ?? '').toLowerCase();
    final isActive = status == 'active';
    final isPending = status == 'pending';
    final tokenNo = '${booking['token_number'] ?? '--'}';
    final unitName =
        (booking['unit']?['name'] as String? ?? 'Department').toUpperCase();
    // booking_date comes as ISO string e.g. "2026-08-10T00:00:00.000000Z" — trim to date only
    final rawDate = booking['booking_date'] as String? ?? '';
    final bookingDate = rawDate.length >= 10 ? rawDate.substring(0, 10) : rawDate;
    final type = (booking['type'] as String? ?? '').toUpperCase();

    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: _primary.withValues(alpha: 0.22),
            blurRadius: 28,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          children: [
            // Gradient background
            Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFFFF0088), Color(0xFFFF6EC7)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
            ),
            // Decorative circles
            Positioned(
              right: -40, top: -40,
              child: Container(
                width: 160, height: 160,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.08),
                ),
              ),
            ),
            Positioned(
              left: -20, bottom: -30,
              child: Container(
                width: 120, height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.06),
                ),
              ),
            ),
            // Content
            Padding(
              padding: const EdgeInsets.all(26),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top row: hospital + type chip + live badge
                  Row(
                    children: [
                      const Icon(Icons.local_hospital,
                          color: Colors.white70, size: 15),
                      const SizedBox(width: 6),
                      const Expanded(
                        child: Text(
                          'GMCCH THRISSUR',
                          style: TextStyle(
                            color: Colors.white70, fontSize: 10,
                            fontWeight: FontWeight.w700, letterSpacing: 1.2,
                          ),
                        ),
                      ),
                      if (type.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 9, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(50),
                          ),
                          child: Text(type,
                              style: const TextStyle(
                                  color: Colors.white, fontSize: 10,
                                  fontWeight: FontWeight.bold)),
                        ),
                      const SizedBox(width: 8),
                      // Pulsing status badge
                      AnimatedBuilder(
                        animation: _pulseAnimation,
                        builder: (_, child) => Transform.scale(
                          scale: isActive ? _pulseAnimation.value : 1.0,
                          child: child,
                        ),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.25),
                            borderRadius: BorderRadius.circular(50),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (isActive)
                                Container(
                                  width: 7, height: 7,
                                  margin: const EdgeInsets.only(right: 5),
                                  decoration: const BoxDecoration(
                                      color: Colors.white,
                                      shape: BoxShape.circle),
                                ),
                              Text(
                                status.toUpperCase(),
                                style: const TextStyle(
                                  color: Colors.white, fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  // Unit name
                  Text(unitName,
                      style: const TextStyle(
                        color: Colors.white, fontSize: 18,
                        fontWeight: FontWeight.w800,
                      )),
                  const SizedBox(height: 16),
                  // Dashed divider
                  _dashedDivider(),
                  const SizedBox(height: 18),
                  // BIG token number
                  Center(
                    child: Column(
                      children: [
                        const Text('TOKEN NUMBER',
                            style: TextStyle(
                              color: Colors.white70, fontSize: 10,
                              fontWeight: FontWeight.w700, letterSpacing: 2,
                            )),
                        const SizedBox(height: 6),
                        Text(tokenNo,
                            style: const TextStyle(
                              color: Colors.white, fontSize: 80,
                              fontWeight: FontWeight.w900,
                              height: 1, letterSpacing: -2,
                            )),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),
                  _dashedDivider(),
                  const SizedBox(height: 16),
                  // Bottom row: type + date
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _ticketField('TYPE', type.isNotEmpty ? type : 'GENERAL'),
                      _ticketField('DATE', bookingDate, alignRight: true),
                    ],
                  ),
                  const SizedBox(height: 20),
                  // Actions
                  Row(
                    children: [
                      Expanded(child: _copyButton(tokenNo)),
                      if (isActive || isPending) ...[
                        const SizedBox(width: 10),
                        Expanded(child: _cancelButton(booking['id'])),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ────────────────────────────────────────────────────────────
  //  COMPACT CARD (secondary upcoming + all history)
  // ────────────────────────────────────────────────────────────
  Widget _buildCompactCard(Map<String, dynamic> booking) {
    final status = (booking['status'] as String? ?? '').toLowerCase();
    final isActive = status == 'active';
    final isPending = status == 'pending';

    final Color statusColor;
    if (isActive) {
      statusColor = const Color(0xFF0077FF);
    } else if (isPending) {
      statusColor = const Color(0xFFF59E0B);
    } else if (status == 'completed') {
      statusColor = const Color(0xFF10B981);
    } else {
      statusColor = Colors.red.shade400;
    }

    final tokenNo = '${booking['token_number'] ?? '--'}';
    final unitName = booking['unit']?['name'] as String? ?? 'Department';
    // Parse ISO date to date-only
    final rawDate = booking['booking_date'] as String? ?? '';
    final bookingDate = rawDate.length >= 10 ? rawDate.substring(0, 10) : rawDate;
    final type = (booking['type'] as String? ?? '').toUpperCase();

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10, offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              children: [
                // Token number circle
                Container(
                  width: 56, height: 56,
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      tokenNo,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: statusColor,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(unitName,
                          style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                              color: Color(0xFF1A1A2E))),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          const Icon(Icons.calendar_today_outlined, size: 12, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(bookingDate,
                              style: const TextStyle(
                                  fontSize: 12, color: Colors.grey)),
                        ],
                      ),
                      if (type.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 7, vertical: 2),
                            decoration: BoxDecoration(
                              color: _primary.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(type,
                                style: const TextStyle(
                                    fontSize: 10,
                                    color: _primary,
                                    fontWeight: FontWeight.bold)),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                // Status badge + copy icon
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: statusColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(50),
                      ),
                      child: Text(
                        status.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: statusColor,
                          letterSpacing: 0.3,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    GestureDetector(
                      onTap: () {
                        Clipboard.setData(ClipboardData(text: tokenNo));
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Text('Token number copied!'),
                            backgroundColor: _primary,
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10)),
                            duration: const Duration(seconds: 1),
                          ),
                        );
                      },
                      child: const Icon(Icons.copy_outlined,
                          size: 16, color: Colors.grey),
                    ),
                  ],
                ),
              ],
            ),
          ),
          // Cancel button — shown for active and pending tokens only
          if (isActive || isPending) ...[  
            Divider(height: 1, color: Colors.grey.shade100),
            InkWell(
              onTap: () => _handleCancel(booking['id']),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 11),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.cancel_outlined,
                        size: 15, color: Colors.red.shade400),
                    const SizedBox(width: 6),
                    Text(
                      'Cancel Token',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Colors.red.shade400,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // ────────────────────────────────────────────────────────────
  //  NO TOKEN STATES
  // ────────────────────────────────────────────────────────────
  Widget _buildNoToken() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 110, height: 110,
              decoration: BoxDecoration(
                color: _primary.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.confirmation_number_outlined,
                  size: 56, color: _primary),
            ),
            const SizedBox(height: 28),
            const Text('No Tokens Found',
                style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF1A1A2E))),
            const SizedBox(height: 10),
            const Text(
              'You have no token history yet.\nBook a token from the Home tab.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 14, color: Colors.grey, height: 1.6),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: _load,
              icon: const Icon(Icons.refresh, size: 18),
              label: const Text('Refresh'),
              style: ElevatedButton.styleFrom(
                backgroundColor: _primary,
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNoUpcoming() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.orange.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.info_outline,
                color: Colors.orange, size: 22),
          ),
          const SizedBox(width: 14),
          const Expanded(
            child: Text(
              'No upcoming tokens.\nBook a new token from the Home tab.',
              style: TextStyle(fontSize: 13, color: Colors.grey, height: 1.5),
            ),
          ),
        ],
      ),
    );
  }

  // ────────────────────────────────────────────────────────────
  //  HELPERS
  // ────────────────────────────────────────────────────────────
  Widget _dashedDivider() {
    return Row(
      children: List.generate(
        40,
        (i) => Expanded(
          child: Container(
            height: 1,
            color: i.isEven
                ? Colors.white.withValues(alpha: 0.4)
                : Colors.transparent,
          ),
        ),
      ),
    );
  }

  Widget _ticketField(String label, String value, {bool alignRight = false}) {
    return Column(
      crossAxisAlignment:
          alignRight ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(
                color: Colors.white60, fontSize: 10,
                fontWeight: FontWeight.w600, letterSpacing: 1)),
        const SizedBox(height: 3),
        Text(value,
            style: const TextStyle(
                color: Colors.white, fontSize: 16,
                fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _copyButton(String tokenNo) {
    return OutlinedButton.icon(
      onPressed: () {
        Clipboard.setData(ClipboardData(text: tokenNo));
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: const Text('Token number copied!'),
          backgroundColor: _primary,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          duration: const Duration(seconds: 1),
        ));
      },
      icon: const Icon(Icons.copy, size: 15, color: Colors.white),
      label:
          const Text('Copy Token', style: TextStyle(color: Colors.white, fontSize: 12)),
      style: OutlinedButton.styleFrom(
        side: const BorderSide(color: Colors.white54),
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(vertical: 11),
      ),
    );
  }

  Widget _cancelButton(int bookingId) {
    return OutlinedButton.icon(
      onPressed: () => _handleCancel(bookingId),
      icon: const Icon(Icons.cancel_outlined, size: 15, color: Colors.white),
      label:
          const Text('Cancel', style: TextStyle(color: Colors.white, fontSize: 12)),
      style: OutlinedButton.styleFrom(
        side: const BorderSide(color: Colors.white54),
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(vertical: 11),
      ),
    );
  }

  Future<void> _handleCancel(int bookingId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Cancel Booking?'),
        content:
            const Text('Are you sure you want to cancel this token?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('NO')),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('YES, CANCEL',
                style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final result = await ApiService.cancelBooking(bookingId);
      if (!mounted) return;
      if (result['status'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: const Text('Booking cancelled successfully'),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ));
        _load();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(result['message'] ?? 'Cancellation failed'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ));
      }
    }
  }
}
