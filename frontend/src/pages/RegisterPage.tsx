import {
  Anchor,
  Button,
  Container,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, type RegisterFormData } from '@/utils/validation';
import classes from './AuthenticationTitle.module.css';

export function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  const handleChange = (field: keyof RegisterFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.issues.forEach((error) => {
        const field = error.path[0] as keyof RegisterFormData;
        fieldErrors[field] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      // Remove confirmPassword before sending to backend
      const { confirmPassword, ...credentials } = formData;
      await register(credentials);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        Create your account
      </Title>

      <Text className={classes.subtitle}>
        Already have an account?{' '}
        <Anchor component={Link} to="/login">
          Sign in
        </Anchor>
      </Text>

      <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Name"
            placeholder="John Doe"
            radius="md"
            value={formData.name}
            onChange={handleChange('name')}
            error={errors.name}
            disabled={isLoading}
          />
          <TextInput
            label="Email"
            placeholder="you@mantine.dev"
            required
            mt="md"
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
          <PasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            required
            mt="md"
            radius="md"
            value={formData.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
            disabled={isLoading}
          />
          <Button type="submit" fullWidth mt="xl" radius="md" loading={isLoading}>
            Create Account
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
