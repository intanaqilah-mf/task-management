import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/utils/validation';
import classes from './AuthenticationTitle.module.css';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  const handleChange = (field: keyof LoginFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.issues.forEach((error) => {
        const field = error.path[0] as keyof LoginFormData;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      await login(formData);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        Welcome back!
      </Title>

      <Text className={classes.subtitle}>
        Do not have an account yet?{' '}
        <Anchor component={Link} to="/register">
          Create account
        </Anchor>
      </Text>

      <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email"
            placeholder="you@mantine.dev"
            required
            radius="md"
            value={formData.email}
            onChange={handleChange('email')}
            error={errors.email}
            disabled={isLoading}
          />
          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            radius="md"
            value={formData.password}
            onChange={handleChange('password')}
            error={errors.password}
            disabled={isLoading}
          />
          <Group justify="space-between" mt="lg">
            <Checkbox label="Remember me" />
            <Anchor component="button" size="sm" type="button">
              Forgot password?
            </Anchor>
          </Group>
          <Button type="submit" fullWidth mt="xl" radius="md" loading={isLoading}>
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
