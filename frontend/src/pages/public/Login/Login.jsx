import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Form, Input, Tabs, App as AntdApp } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, ArrowRightOutlined, SafetyOutlined } from '@ant-design/icons';

import Logo from '../../../components/Logo';
import Button from '../../../components/Button';
import { useAuth } from '../../../context/AuthContext';
import { TAB_KEYS, buildLoginHandler, buildSignupHandler } from './Login.helper';

export default function Login() {
  const [tab, setTab] = useState(TAB_KEYS.login);
  const [submitting, setSubmitting] = useState(false);
  const [loginForm] = Form.useForm();
  const [signupForm] = Form.useForm();
  const { login, signup } = useAuth();
  const { message } = AntdApp.useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = buildLoginHandler({
    login,
    message,
    navigate,
    redirectTo: location.state?.from?.pathname,
  });
  const handleSignup = buildSignupHandler({ signup, message, navigate });

  const onSubmit = async (handler, form) => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      await handler(values);
    } catch {
      // helper already showed error toast
    } finally {
      setSubmitting(false);
    }
  };

  const tabItems = [
    {
      key: TAB_KEYS.login,
      label: 'LOG IN',
      children: (
        <Form form={loginForm} layout="vertical" requiredMark={false} className="ld-login__form">
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input
              size="large"
              prefix={<MailOutlined className="text-text-muted" />}
              placeholder="name@example.com"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={
              <div className="flex w-full justify-between items-center">
                <span>Password</span>
                <Link to="/forgot-password" className="font-label-bold text-xs text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
            }
            rules={[{ required: true, message: 'Password is required' }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-text-muted" />}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>

          <Button
            block
            loading={submitting}
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            onClick={() => onSubmit(handleLogin, loginForm)}
          >
            Continue
          </Button>
        </Form>
      ),
    },
    {
      key: TAB_KEYS.signup,
      label: 'SIGN UP',
      children: (
        <Form form={signupForm} layout="vertical" requiredMark={false} className="ld-login__form">
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Your name is required' }]}
          >
            <Input
              size="large"
              prefix={<UserOutlined className="text-text-muted" />}
              placeholder="Alex Mokoena"
              autoComplete="name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Email is required' },
              { type: 'email', message: 'Enter a valid email' },
            ]}
          >
            <Input
              size="large"
              prefix={<MailOutlined className="text-text-muted" />}
              placeholder="name@example.com"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Password is required' },
              { min: 8, message: 'At least 8 characters' },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-text-muted" />}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </Form.Item>

          <Button
            block
            loading={submitting}
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            onClick={() => onSubmit(handleSignup, signupForm)}
          >
            Create Account
          </Button>
        </Form>
      ),
    },
  ];

  return (
    <main className="ld-login min-h-screen w-full flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient gold glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="ld-login__card relative z-10 w-full max-w-md bg-dark-100 border border-outline-variant/30 rounded-2xl shadow-card">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <Logo linkTo="/" />
            <p className="mt-3 text-sm text-text-muted">Access your premier account</p>
          </div>

          <Tabs
            activeKey={tab}
            onChange={setTab}
            items={tabItems}
            centered
            className="ld-login__tabs"
          />
        </div>
      </div>

      <Link
        to="/admin"
        className="relative z-10 mt-8 inline-flex items-center gap-2 text-sm text-text-muted hover:text-primary transition-colors"
      >
        <SafetyOutlined />
        Admin Login
      </Link>
    </main>
  );
}
