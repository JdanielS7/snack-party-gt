const nodemailer = require('nodemailer');
let ResendClient;
try {
  ResendClient = require('resend').Resend;
} catch (e) {
  ResendClient = null;
}

function toBool(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue;
  const v = String(value).toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'y';
}

function toNumber(value, defaultValue) {
  const n = Number(value);
  return Number.isFinite(n) ? n : defaultValue;
}

function getEmailConfig() {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = toNumber(process.env.EMAIL_PORT, 465);
  const secure = process.env.EMAIL_SECURE !== undefined
    ? toBool(process.env.EMAIL_SECURE)
    : port === 465;

  const requireTLS = process.env.EMAIL_REQUIRE_TLS !== undefined
    ? toBool(process.env.EMAIL_REQUIRE_TLS)
    : !secure;

  const connectionTimeout = toNumber(process.env.EMAIL_CONNECTION_TIMEOUT, 15000);
  const greetingTimeout = toNumber(process.env.EMAIL_GREETING_TIMEOUT, 15000);
  const socketTimeout = toNumber(process.env.EMAIL_SOCKET_TIMEOUT, 20000);

  const pool = toBool(process.env.EMAIL_POOL, false);
  const maxConnections = toNumber(process.env.EMAIL_POOL_MAX, 1);

  const rejectUnauthorized = process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== undefined
    ? toBool(process.env.EMAIL_TLS_REJECT_UNAUTHORIZED)
    : true;

  const debug = toBool(process.env.EMAIL_DEBUG, false);

  const auth = {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  };

  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const base = {
    host,
    port,
    secure,
    requireTLS,
    connectionTimeout,
    greetingTimeout,
    socketTimeout,
    pool,
    maxConnections,
    auth,
    tls: {
      servername: host,
      rejectUnauthorized
    },
    logger: debug,
    debug
  };

  return { base, from };
}

function hasResend() {
  return !!process.env.RESEND_API_KEY && !!ResendClient;
}

async function sendViaResend(subject, htmlContent, textContent, to, from) {
  const key = process.env.RESEND_API_KEY;
  const resend = new ResendClient(key);
  const result = await resend.emails.send({
    from,
    to,
    subject,
    html: htmlContent,
    text: textContent
  });
  if (result?.error) {
    const err = result.error;
    const message = err?.message || 'Resend send failed';
    const error = new Error(message);
    error.code = err?.code || 'RESEND_ERROR';
    throw error;
  }
  return { id: result?.data?.id };
}

function buildAlternativeOptions(primaryOptions) {
  // Flip between 465<->587 to try an alternative path
  const usePort465 = Number(primaryOptions.port) !== 465;
  const alt = {
    ...primaryOptions,
    port: usePort465 ? 465 : 587,
    secure: usePort465 ? true : false,
    requireTLS: usePort465 ? primaryOptions.requireTLS : true
  };
  return alt;
}

function createTransporter(opts) {
  return nodemailer.createTransport(opts);
}

async function verifyTransporter() {
  if (hasResend()) {
    return { ok: true, provider: 'resend' };
  }
  const { base } = getEmailConfig();
  const transporter = createTransporter(base);
  try {
    await transporter.verify();
    return { ok: true, tried: [pickConnection(base)], provider: 'smtp' };
  } catch (error) {
    const altOpts = buildAlternativeOptions(base);
    const altTransporter = createTransporter(altOpts);
    try {
      await altTransporter.verify();
      return { ok: true, tried: [pickConnection(base), pickConnection(altOpts)], used: 'alternative', provider: 'smtp' };
    } catch (altError) {
      return {
        ok: false,
        tried: [pickConnection(base), pickConnection(altOpts)],
        error: serializeError(error),
        altError: serializeError(altError),
        provider: 'smtp'
      };
    }
  }
}

function isTimeoutError(err) {
  if (!err) return false;
  const code = err.code || '';
  const command = err.command || '';
  const msg = (err.message || '').toLowerCase();
  return code === 'ETIMEDOUT' || command === 'CONN' || msg.includes('timeout');
}

function serializeError(err) {
  if (!err) return null;
  return {
    message: err.message,
    code: err.code,
    command: err.command,
    response: err.response,
    responseCode: err.responseCode
  };
}

function pickConnection(opts) {
  return {
    host: opts.host,
    port: opts.port,
    secure: !!opts.secure,
    requireTLS: !!opts.requireTLS,
    connectionTimeout: opts.connectionTimeout,
    greetingTimeout: opts.greetingTimeout,
    socketTimeout: opts.socketTimeout
  };
}

async function sendEmailToAdmin(subject, htmlContent, textContent) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  const { base, from } = getEmailConfig();

  // Try Resend first if configured
  if (hasResend()) {
    try {
      const r = await sendViaResend(subject, htmlContent, textContent, adminEmail, from);
      return { success: true, messageId: r.id, provider: 'resend' };
    } catch (resendError) {
      // Fall back to SMTP on Resend failure
    }
  }

  const mailOptions = {
    from,
    to: adminEmail,
    subject,
    html: htmlContent,
    text: textContent
  };

  const primaryTransporter = createTransporter(base);
  try {
    const result = await primaryTransporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId, transport: pickConnection(base), provider: 'smtp' };
  } catch (error) {
    if (!isTimeoutError(error)) {
      return { success: false, error: serializeError(error), transport: pickConnection(base), provider: 'smtp' };
    }

    // Retry once with alternative settings (switch 465/587)
    const altOpts = buildAlternativeOptions(base);
    const altTransporter = createTransporter(altOpts);
    try {
      const result = await altTransporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId, transport: pickConnection(altOpts), retryFromTimeout: true, provider: 'smtp' };
    } catch (altError) {
      return {
        success: false,
        error: serializeError(error),
        altError: serializeError(altError),
        transport: pickConnection(base),
        altTransportTried: pickConnection(altOpts),
        provider: 'smtp'
      };
    }
  }
}

function getEmailDebugInfo() {
  const { base, from } = getEmailConfig();
  return {
    user: process.env.EMAIL_USER,
    passConfigured: !!process.env.EMAIL_PASS,
    adminEmail: process.env.ADMIN_EMAIL,
    from,
    provider: hasResend() ? 'resend' : 'smtp',
    connection: pickConnection(base)
  };
}

module.exports = {
  createTransporter,
  sendEmailToAdmin,
  verifyTransporter,
  getEmailDebugInfo
};
