import { Request, Response } from 'express';
import { query } from '../config/db.js';

// Configurable policy thresholds (can be set in .env)
const WARNING_THRESHOLD = parseInt(process.env.SCREENSHOT_WARNING_THRESHOLD || '2', 10);
const LOCK_THRESHOLD = parseInt(process.env.SCREENSHOT_VIEWER_LOCK_THRESHOLD || '3', 10);
const LOCK_WINDOW_MINUTES = parseInt(process.env.SCREENSHOT_LOCK_WINDOW_MINUTES || '30', 10);

function parseUserAgent(uaString: string | undefined): { browser: string; os: string } {
  if (!uaString) return { browser: 'Unknown Browser', os: 'Unknown OS' };

  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Detect OS
  if (/windows/i.test(uaString)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(uaString)) os = 'macOS';
  else if (/linux/i.test(uaString)) os = 'Linux';
  else if (/android/i.test(uaString)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(uaString)) os = 'iOS';

  // Detect Browser
  if (/edg\//i.test(uaString)) browser = 'Microsoft Edge';
  else if (/chrome|crios/i.test(uaString) && !/edg\//i.test(uaString)) browser = 'Google Chrome';
  else if (/firefox|fxios/i.test(uaString)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(uaString) && !/chrome/i.test(uaString)) browser = 'Apple Safari';

  return { browser, os };
}

/**
 * POST /api/security-events
 * Record a detected screenshot / screen capture attempt
 */
export const recordSecurityEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = req.user;
    if (!authUser || !authUser.userId) {
      res.status(401).json({ error: 'Unauthorized: Authentication required.' });
      return;
    }

    const {
      event_type = 'SCREEN_CAPTURE_ATTEMPT',
      project_id,
      chapter_id,
      document_id,
      session_id,
      browser: clientBrowser,
      operating_system: clientOS,
      metadata = {},
    } = req.body;

    // Strict Authorization check: Never trust client user_id. Always derive from authUser.
    const userId = authUser.userId;

    // Verify user has access to the project if provided
    let verifiedProjectId = project_id;
    if (project_id) {
      if (authUser.role !== 'admin') {
        const projCheck = await query(
          `SELECT id FROM projects WHERE id = $1 AND user_id = $2 LIMIT 1`,
          [project_id, userId]
        );
        if (projCheck.rows.length === 0) {
          res.status(403).json({
            error: 'Forbidden: You do not have authorization to access this research project.',
          });
          return;
        }
      }
    } else {
      // Find project associated with this user
      const userProj = await query(
        `SELECT id FROM projects WHERE user_id = $1 LIMIT 1`,
        [userId]
      );
      if (userProj.rows.length > 0) {
        verifiedProjectId = userProj.rows[0].id;
      }
    }

    // Verify chapter belongs to the project if provided
    if (chapter_id && verifiedProjectId) {
      const chapterCheck = await query(
        `SELECT id, document_released FROM chapters WHERE id = $1 AND project_id = $2 LIMIT 1`,
        [chapter_id, verifiedProjectId]
      );
      if (chapterCheck.rows.length === 0) {
        res.status(400).json({ error: 'Invalid chapter reference for this project.' });
        return;
      }
    }

    // Parse device details
    const uaInfo = parseUserAgent(req.headers['user-agent']);
    const browser = clientBrowser || uaInfo.browser;
    const os = clientOS || uaInfo.os;
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    // Count active recent attempts within the window (excluding admin-unlocked events)
    const recentEventsRes = await query(
      `SELECT COUNT(*) as attempt_count 
       FROM security_events 
       WHERE user_id = $1 
         AND (metadata->>'admin_unlocked' IS NULL OR metadata->>'admin_unlocked' != 'true')
         AND created_at >= NOW() - ($2 || ' minutes')::INTERVAL`,
      [userId, LOCK_WINDOW_MINUTES]
    );

    const previousAttempts = parseInt(recentEventsRes.rows[0]?.attempt_count || '0', 10);
    const currentAttemptNumber = previousAttempts + 1;

    // Determine severity
    const isLocked = currentAttemptNumber >= LOCK_THRESHOLD;
    const isWarning = currentAttemptNumber >= WARNING_THRESHOLD;
    const severity = isLocked ? 'CRITICAL' : isWarning ? 'WARNING' : 'INFO';

    // Insert security event
    const eventId = `sec-evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    await query(
      `INSERT INTO security_events (
        id, user_id, project_id, chapter_id, document_id,
        event_type, severity, session_id, browser, operating_system,
        ip_address, metadata, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
      [
        eventId,
        userId,
        verifiedProjectId || null,
        chapter_id || null,
        document_id || null,
        event_type,
        severity,
        session_id || `sess-${userId}-${new Date().toISOString().slice(0, 10)}`,
        browser,
        os,
        ipAddress,
        JSON.stringify(metadata),
      ]
    );

    // Also record into general activity_logs for audit visibility
    try {
      await query(
        `INSERT INTO activity_logs (id, user_id, project_id, action, actor_name, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          `act-${Date.now()}`,
          userId,
          verifiedProjectId || null,
          'Security Alert',
          authUser.name || authUser.username,
          `Screen capture attempt detected (${browser} on ${os}). Attempt #${currentAttemptNumber}. Severity: ${severity}.`,
        ]
      );
    } catch (logErr) {
      console.warn('Could not mirror security event to activity_logs:', logErr);
    }

    // Message tailored to threshold
    let message = 'Screenshot or screen capture detected. This document is confidential and protected. Unauthorized capture of this document is not permitted. This security event has been recorded.';
    if (isLocked) {
      message = 'Multiple unauthorized capture attempts detected. To safeguard academic intellectual property, document viewing has been temporarily restricted for your session. Please contact your research supervisor or administrator.';
    }

    res.status(200).json({
      success: true,
      event_id: eventId,
      attempt_count: currentAttemptNumber,
      warning_threshold: WARNING_THRESHOLD,
      lock_threshold: LOCK_THRESHOLD,
      locked: isLocked,
      warning: isWarning,
      severity,
      message,
    });
  } catch (error: any) {
    console.error('Record security event error:', error);
    res.status(500).json({ error: 'Failed to record security event', details: error.message });
  }
};

/**
 * GET /api/security-events/viewer-status
 * Check if the active user's document viewer is currently locked
 */
export const getViewerStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const authUser = req.user;
    if (!authUser || !authUser.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const userId = authUser.userId;

    const recentEventsRes = await query(
      `SELECT COUNT(*) as attempt_count,
              COUNT(*) FILTER (WHERE severity = 'CRITICAL') as critical_count,
              MAX(created_at) as last_attempt_time
       FROM security_events 
       WHERE user_id = $1 
         AND (metadata->>'admin_unlocked' IS NULL OR metadata->>'admin_unlocked' != 'true')
         AND created_at >= NOW() - ($2 || ' minutes')::INTERVAL`,
      [userId, LOCK_WINDOW_MINUTES]
    );

    const attemptCount = parseInt(recentEventsRes.rows[0]?.attempt_count || '0', 10);
    const criticalCount = parseInt(recentEventsRes.rows[0]?.critical_count || '0', 10);
    const isLocked = criticalCount > 0 || attemptCount >= LOCK_THRESHOLD;

    res.status(200).json({
      locked: isLocked,
      attempt_count: attemptCount,
      warning_threshold: WARNING_THRESHOLD,
      lock_threshold: LOCK_THRESHOLD,
      lock_window_minutes: LOCK_WINDOW_MINUTES,
      last_attempt_time: recentEventsRes.rows[0]?.last_attempt_time || null,
    });
  } catch (error: any) {
    console.error('Get viewer status error:', error);
    res.status(500).json({ error: 'Failed to verify viewer status', details: error.message });
  }
};

/**
 * GET /api/security-events
 * Admin-only: List and search recorded security events with user & project details
 */
export const getSecurityEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      user_id,
      project_id,
      severity,
      event_type,
      search,
      limit = '50',
      offset = '0',
    } = req.query;

    let whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (user_id) {
      whereConditions.push(`se.user_id = $${paramIndex++}`);
      params.push(user_id);
    }

    if (project_id) {
      whereConditions.push(`se.project_id = $${paramIndex++}`);
      params.push(project_id);
    }

    if (severity && severity !== 'ALL') {
      whereConditions.push(`se.severity = $${paramIndex++}`);
      params.push(severity);
    }

    if (event_type && event_type !== 'ALL') {
      whereConditions.push(`se.event_type = $${paramIndex++}`);
      params.push(event_type);
    }

    if (search) {
      whereConditions.push(
        `(LOWER(u.full_name) LIKE $${paramIndex} OR LOWER(u.username) LIKE $${paramIndex} OR LOWER(p.title) LIKE $${paramIndex} OR LOWER(se.browser) LIKE $${paramIndex})`
      );
      params.push(`%${(search as string).toLowerCase()}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Main Query with joins
    const sql = `
      SELECT 
        se.id,
        se.user_id,
        se.project_id,
        se.chapter_id,
        se.document_id,
        se.event_type,
        se.severity,
        se.session_id,
        se.browser,
        se.operating_system,
        se.ip_address,
        se.metadata,
        se.created_at,
        u.full_name as user_name,
        u.email as user_email,
        u.username as user_username,
        p.title as project_title,
        p.topic as project_topic,
        c.chapter_number,
        c.title as chapter_title
      FROM security_events se
      LEFT JOIN users u ON se.user_id = u.id
      LEFT JOIN projects p ON se.project_id = p.id
      LEFT JOIN chapters c ON se.chapter_id = c.id
      ${whereClause}
      ORDER BY se.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

    const eventsRes = await query(sql, params);

    // Summary counts for Admin dashboard overview
    const statsRes = await query(`
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT user_id) as unique_users_flagged,
        COUNT(*) FILTER (WHERE severity = 'CRITICAL') as critical_events,
        COUNT(*) FILTER (WHERE severity = 'WARNING') as warning_events,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as events_last_24h
      FROM security_events
    `);

    res.status(200).json({
      events: eventsRes.rows,
      stats: statsRes.rows[0] || {
        total_events: 0,
        unique_users_flagged: 0,
        critical_events: 0,
        warning_events: 0,
        events_last_24h: 0,
      },
    });
  } catch (error: any) {
    console.error('Get security events error:', error);
    res.status(500).json({ error: 'Failed to fetch security events', details: error.message });
  }
};

/**
 * POST /api/security-events/unlock
 * Admin-only: Unlock a student/customer by acknowledging/clearing recent flags
 */
export const unlockCustomerViewer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: 'userId is required to unlock viewer.' });
      return;
    }

    // Downgrade CRITICAL events for this user to INFO / ACKNOWLEDGED so they are no longer locked
    await query(
      `UPDATE security_events 
       SET severity = 'INFO',
           metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{admin_unlocked}', 'true'::jsonb)
       WHERE user_id = $1 AND severity = 'CRITICAL'`,
      [userId]
    );

    // Log admin unlock action
    await query(
      `INSERT INTO activity_logs (id, user_id, action, actor_name, description, created_at)
       VALUES ($1, $2, 'Security Override', $3, $4, NOW())`,
      [
        `act-${Date.now()}`,
        userId,
        req.user?.name || 'Administrator',
        `Admin unlocked document viewer access for user ${userId}.`,
      ]
    );

    res.status(200).json({
      success: true,
      message: `Document viewer access successfully restored for user ${userId}.`,
    });
  } catch (error: any) {
    console.error('Unlock customer error:', error);
    res.status(500).json({ error: 'Failed to unlock viewer', details: error.message });
  }
};
