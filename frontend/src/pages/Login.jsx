import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateIranianPhone } from '../utils/iranianPhone';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, loginWithPassword } = useAuth();
  const { success, error: showError } = useToast();

  const [authMethod, setAuthMethod] = useState('password');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone) {
      setError(t('auth.phoneNumber', 'شماره تلفن') + ' ' + t('common.required', 'الزامی است'));
      return;
    }
    if (!validateIranianPhone(phone)) {
      setError(t('auth.invalidPhone', 'لطفاً شماره موبایل معتبر وارد کنید'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendOTP(phone, 'login');
      setStep('otp');
      success(t('auth.otpSent', 'کد تایید ارسال شد'));
    } catch (err) {
      const message = err.response?.data?.error || t('auth.otpSendFailed', 'ارسال کد تایید ناموفق بود');
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError(t('auth.invalidCode', 'لطفاً کد ۶ رقمی را وارد کنید'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await verifyOTP(phone, code, 'login');
      success(t('auth.loginSuccess', 'ورود موفقیت‌آمیز!'));
      navigate('/');
    } catch (err) {
      const message = err.response?.data?.error || t('auth.invalidOtp', 'کد تایید نامعتبر');
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    const identifier = phone.trim();
    if (!identifier || !password) {
      setError(t('auth.fillFields', 'لطفاً تمام فیلدها را پر کنید'));
      return;
    }
    const isPhoneLike = /^(\+98|0)?9\d*$/.test(identifier);
    if (isPhoneLike && !validateIranianPhone(identifier)) {
      setError(t('auth.invalidPhone', 'لطفاً شماره موبایل معتبر وارد کنید'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await loginWithPassword(identifier, password);
      success(t('auth.loginSuccess', 'ورود موفقیت‌آمیز!'));
      navigate('/');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.non_field_errors?.[0] ||
        t('auth.invalidCredentials', 'نام کاربری یا رمز عبور اشتباه است');
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">{t('auth.welcomeBack', 'ورود به حساب کاربری')}</h1>
            <p className="auth-subtitle">{t('auth.loginSubtitle', 'ورود به حساب کاربری سپر مدیکال')}</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="auth-method-switcher">
            <button
              type="button"
              onClick={() => setAuthMethod('password')}
              className={`method-btn ${authMethod === 'password' ? 'active' : ''}`}
            >
              {t('auth.loginWithPassword', 'ورود با رمز عبور')}
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('otp')}
              className={`method-btn ${authMethod === 'otp' ? 'active' : ''}`}
            >
              {t('auth.loginWithOTP', 'ورود با کد یکبار مصرف')}
            </button>
          </div>

          {authMethod === 'otp' ? (
            <>
              {step === 'phone' ? (
                <form onSubmit={handleSendOTP}>
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">شماره موبایل</label>
                    <input
                      type="tel"
                      id="phone"
                      placeholder="مثال: 09121234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="form-input"
                      dir="ltr"
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-full">
                    {loading ? 'در حال ارسال...' : 'ارسال کد تایید'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP}>
                  <div className="form-group">
                    <label htmlFor="code" className="form-label">کد تایید</label>
                    <input
                      type="text"
                      id="code"
                      placeholder="۶ رقم کد تایید"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={6}
                      className="form-input otp-input"
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-full">
                    {loading ? 'در حال بررسی...' : 'تایید و ورود'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="btn btn-ghost btn-sm btn-full"
                  >
                    ویرایش شماره موبایل
                  </button>
                </form>
              )}
            </>
          ) : (
            <form onSubmit={handlePasswordLogin}>
              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  {t('auth.usernameOrPhone', 'نام کاربری یا شماره موبایل')}
                </label>
                <input
                  type="text"
                  id="phone"
                  placeholder="مثال: 09121234567 یا نام کاربری"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  dir="ltr"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  {t('auth.password', 'رمز عبور')}
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder={t('auth.passwordPlaceholder', 'رمز عبور خود را وارد کنید')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  autoComplete="current-password"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg btn-full">
                {loading ? t('common.loading', 'در حال ورود...') : t('common.login', 'ورود')}
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>
              حساب کاربری ندارید؟ <Link to="/register">ثبت‌نام کنید</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

