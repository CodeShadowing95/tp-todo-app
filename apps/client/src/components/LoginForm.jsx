import PropTypes from 'prop-types';
import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import { setToken } from '../api';

export function LoginForm({ onAuth }) {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error?.message || 'An error occurred');
                setLoading(false);
                return;
            }

            setToken(data.token);
            onAuth();
        } catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-5">
            <h2 className="text-center mb-4">
                {isRegister ? 'Create Account' : 'Login'}
            </h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        minLength={6}
                    />
                </Form.Group>

                <Button
                    type="submit"
                    variant="primary"
                    className="w-100 mb-3"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
                </Button>
            </Form>

            <p className="text-center">
                {isRegister
                    ? 'Already have an account? '
                    : "Don't have an account? "}
                <Button
                    variant="link"
                    className="p-0"
                    onClick={() => {
                        setIsRegister(!isRegister);
                        setError(null);
                    }}
                >
                    {isRegister ? 'Login' : 'Register'}
                </Button>
            </p>
        </div>
    );
}

LoginForm.propTypes = {
    onAuth: PropTypes.func,
};
