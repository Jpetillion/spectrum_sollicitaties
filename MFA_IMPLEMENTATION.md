# 2FA/MFA Implementation Guide

## ✅ Backend Complete

The backend is fully implemented with TOTP-based 2FA for admin and teacher roles.

### What's Done:

1. **Database Migration** ✅
   - Added `mfa_enabled`, `mfa_secret`, and `mfa_backup_codes` columns to `users` table
   - Migration script: `server/scripts/add-mfa-fields.js`

2. **MFA Utilities** ✅
   - File: `server/utils/mfa.js`
   - Functions: Generate secrets, verify TOTP tokens, manage backup codes, temp tokens

3. **MFA Routes** ✅
   - File: `server/routes/mfa.js`
   - Endpoints:
     - `POST /api/mfa/setup/generate` - Generate QR code and backup codes
     - `POST /api/mfa/setup/verify` - Verify setup and enable MFA
     - `POST /api/mfa/verify` - Verify MFA token (testing)
     - `POST /api/mfa/disable` - Disable MFA (requires password)
     - `GET /api/mfa/status` - Get MFA status
     - `POST /api/mfa/backup-codes/regenerate` - Regenerate backup codes

4. **Updated Auth Flow** ✅
   - File: `server/routes/auth.js`
   - Two-step login for admin/teacher with MFA enabled:
     1. `POST /api/auth/login` → Returns `{ mfaRequired: true, tempToken }`
     2. `POST /api/auth/login/mfa` → Verify code and return final JWT
   - Students and users without MFA enabled: standard login

5. **JWT Enhancement** ✅
   - JWT now includes `mfaVerified: true/false` field
   - Can be used in middleware to enforce MFA for sensitive operations

---

## 🎨 Frontend TODO

### Admin App Changes Needed:

#### 1. **MFA Setup Page** (Settings → Security)
Components to create:
- `MfaSetup.jsx` - Main setup wizard
- `QRCodeDisplay.jsx` - Show QR code for authenticator app
- `BackupCodesDisplay.jsx` - Show 8 backup codes (download/print)
- `MfaVerifySetup.jsx` - Enter 6-digit code to confirm

Flow:
1. User clicks "Enable 2FA"
2. Call `POST /api/mfa/setup/generate`
3. Display QR code + secret + backup codes
4. User scans QR with Google/Microsoft Authenticator
5. User enters 6-digit code
6. Call `POST /api/mfa/setup/verify` with code
7. Show success + remind to save backup codes

#### 2. **MFA Login Page**
Components to create:
- `MfaLoginStep.jsx` - 6-digit code input
- `OtpInput.jsx` - 6 separate digit boxes (better UX)

Flow:
1. User enters email + password
2. If `mfaRequired: true` in response → show MFA input
3. User enters 6-digit code OR backup code
4. Call `POST /api/auth/login/mfa` with `tempToken` and `code`
5. On success → redirect to dashboard

#### 3. **MFA Management** (Settings)
Components to create:
- `MfaStatus.jsx` - Show enabled/disabled status
- `MfaDisable.jsx` - Disable with password confirmation
- `RegenerateBackupCodes.jsx` - Generate new backup codes

Features:
- Show MFA status
- Show backup codes remaining count
- Button to regenerate backup codes (requires MFA verification)
- Button to disable MFA (requires password)

#### 4. **Update Login.jsx**
Add logic to handle two-step login:
```javascript
const handleLogin = async (email, password) => {
  const response = await authAPI.login({ email, password });

  if (response.data.mfaRequired) {
    // Store temp token
    setTempToken(response.data.tempToken);
    // Show MFA input
    setShowMfaInput(true);
  } else {
    // Normal login success
    navigate('/dashboard');
  }
};

const handleMfaVerify = async (code) => {
  const response = await authAPI.loginMfa({
    tempToken,
    code,
    isBackupCode: false
  });

  // Login complete
  navigate('/dashboard');
};
```

#### 5. **Update AuthContext**
Add MFA-related state:
```javascript
const [mfaEnabled, setMfaEnabled] = useState(false);
const [backupCodesRemaining, setBackupCodesRemaining] = useState(0);
```

#### 6. **Add API Methods**
File: `admin/src/utils/api.js`

```javascript
export const mfaAPI = {
  generateSetup: () => api.post('/mfa/setup/generate'),
  verifySetup: (token) => api.post('/mfa/setup/verify', { token }),
  disable: (password) => api.post('/mfa/disable', { password }),
  getStatus: () => api.get('/mfa/status'),
  regenerateBackupCodes: (token) => api.post('/mfa/backup-codes/regenerate', { token }),
};

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  loginMfa: (data) => api.post('/auth/login/mfa', data),
  // ... existing methods
};
```

---

## 📱 Libraries to Install (Frontend)

```bash
cd admin
npm install react-otp-input qrcode.react
```

- `react-otp-input` - Nice 6-digit input boxes
- `qrcode.react` - Display QR codes

---

## 🔒 Security Best Practices (Already Implemented)

✅ Backup codes hashed with bcrypt
✅ MFA secrets stored in DB (should encrypt in production)
✅ Temp tokens expire in 5 minutes
✅ Used backup codes are deleted
✅ TOTP with 30s window for clock skew
✅ Rate limiting (add in production)

---

## 🎓 User Instructions

### For Admins/Teachers:

**Setup:**
1. Go to Settings → Security
2. Click "Enable 2FA"
3. Scan QR code with Google Authenticator or Microsoft Authenticator
4. Enter 6-digit code to verify
5. **Save backup codes** (8 codes, use if you lose your phone)

**Login:**
1. Enter email + password
2. Enter 6-digit code from authenticator app
3. Done!

**Lost Phone:**
- Use one of your 8 backup codes
- Each code can only be used once
- Regenerate codes after using backup codes

---

## 🧪 Testing Plan

### Backend (Already Testable):

```bash
# 1. Generate MFA setup
curl -X POST http://localhost:3000/api/mfa/setup/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# 2. Verify with Google Authenticator code
curl -X POST http://localhost:3000/api/mfa/setup/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token": "123456"}'

# 3. Test login with MFA
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teacher@school.be", "password": "teacher123"}'

# Should return: { "mfaRequired": true, "tempToken": "..." }

# 4. Complete login with MFA
curl -X POST http://localhost:3000/api/auth/login/mfa \
  -H "Content-Type: application/json" \
  -d '{"tempToken": "...", "code": "123456"}'
```

### Frontend (TODO):
1. Test setup flow with real authenticator app
2. Test login flow with MFA enabled
3. Test backup code usage
4. Test MFA disable flow
5. Test backup code regeneration

---

## 📝 Notes

- **Students**: No MFA required (only admin/teacher)
- **Authenticator Apps**: Google Authenticator, Microsoft Authenticator, Authy, 1Password
- **QR Code**: Contains `otpauth://` URL for easy setup
- **Backup Codes**: 8 codes, 8 digits each, hashed in DB
- **Temp Tokens**: 5-minute expiry for security
- **Production**: Consider encrypting `mfa_secret` in DB
- **Production**: Add rate limiting on MFA verify endpoints
- **Production**: Consider Redis for temp token storage instead of in-memory Map

---

## 🚀 Deployment Checklist

- [ ] Encrypt MFA secrets in database
- [ ] Add rate limiting (max 5 failed MFA attempts)
- [ ] Use Redis for temp token storage
- [ ] Add email notifications when MFA is enabled/disabled
- [ ] Add audit logging for MFA events
- [ ] Test with real authenticator apps
- [ ] Document for users
- [ ] Train admins/teachers on setup

---

## 🔗 Useful Links

- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)
- [Google Authenticator](https://support.google.com/accounts/answer/1066447)
- [Microsoft Authenticator](https://www.microsoft.com/en-us/security/mobile-authenticator-app)
