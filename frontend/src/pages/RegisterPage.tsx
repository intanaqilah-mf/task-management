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
import { Link } from 'react-router-dom';
import classes from './AuthenticationTitle.module.css';

export function RegisterPage() {
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
        <TextInput label="Name" placeholder="John Doe" required radius="md" />
        <TextInput label="Email" placeholder="you@mantine.dev" required mt="md" radius="md" />
        <PasswordInput label="Password" placeholder="Your password" required mt="md" radius="md" />
        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm your password"
          required
          mt="md"
          radius="md"
        />
        <Button fullWidth mt="xl" radius="md">
          Create Account
        </Button>
      </Paper>
    </Container>
  );
}
