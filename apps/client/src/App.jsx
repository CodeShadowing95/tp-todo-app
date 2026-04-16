import { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { TodoListCard } from './components/TodoListCard';
import { Greeting } from './components/Greeting';
import { LoginForm } from './components/LoginForm';
import { getToken, removeToken } from './api';

function App() {
    const [authed, setAuthed] = useState(!!getToken());

    const handleLogout = () => {
        removeToken();
        setAuthed(false);
    };

    return (
        <Container>
            <Row>
                <Col md={{ offset: 3, span: 6 }}>
                    {authed ? (
                        <>
                            <div className="d-flex justify-content-end mt-3 mb-2">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </Button>
                            </div>
                            <Greeting />
                            <TodoListCard />
                        </>
                    ) : (
                        <LoginForm onAuth={() => setAuthed(true)} />
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default App;
